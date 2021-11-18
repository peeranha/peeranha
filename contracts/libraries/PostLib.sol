pragma solidity >=0.5.0;
pragma abicoder v2;

import "./IpfsLib.sol";
import "./VoteLib.sol";
import "./UserLib.sol";
import "./SecurityLib.sol";

/// @title PostLib
/// @notice Provides information about operation with posts
/// @dev posts information is stored in the mapping on the main contract
library PostLib  {
    using UserLib for UserLib.UserCollection;
    uint256 constant deleteTime = 604800;    //7 days       // name??

    enum PostType { ExpertPost, CommonPost, Tutorial }
    enum TypeContent { Post, Reply, Comment }

    struct Comment {
        IpfsLib.IpfsHash ipfsDoc;
        address author;
        int32 rating;
        uint32 postTime;
        uint8 propertyCount;
        bool isDeleted;
    }

    struct CommentContainer {
        Comment info;
        mapping(uint8 => bytes32) properties;
        mapping(address => int256) historyVotes;
        address[] votedUsers;
    }

    struct Reply {
        IpfsLib.IpfsHash ipfsDoc;
        address author;
        int32 rating;
        uint32 postTime;
        uint16 parentReplyId;
        uint8 commentCount;
        uint8 propertyCount;

        bool isFirstReply;
        bool isQuickReply;
        bool isDeleted;
    }

    struct ReplyContainer {
        Reply info;
        mapping(uint8 => CommentContainer) comments;
        mapping(uint8 => bytes32) properties;
        mapping(address => int256) historyVotes;
        address[] votedUsers;
    }

    struct Post {
        uint8[] tags;
        IpfsLib.IpfsHash ipfsDoc;
        PostType postType;
        address author;
        int32 rating;
        uint32 postTime;
        uint32 communityId;

        uint16 officialReply;
        uint16 bestReply;
        uint8 propertyCount;
        uint8 commentCount;
        uint16 replyCount;
        uint16 deletedReplyCount;
        bool isDeleted;
    }

    struct PostContainer {
        Post info;
        mapping(uint16 => ReplyContainer) replies;
        mapping(uint8 => CommentContainer) comments;
        mapping(uint8 => bytes32) properties;
        mapping(address => int256) historyVotes;
        address[] votedUsers;
    }

    struct PostCollection {
        mapping(uint256 => PostContainer) posts;
        uint256 postCount;
    }

    event PostCreated(address user, uint32 communityId, uint256 postId);
    event ReplyCreated(address user, uint256 postId, uint16 parentReplyId, uint16 replyId);
    event CommentCreated(address user, uint256 postId, uint16 parentReplyId, uint8 commentId);
    event PostEdited(address user, uint256 postId);
    event ReplyEdited(address user, uint256 postId, uint16 replyId);
    event CommentEdited(address user, uint256 postId, uint16 parentReplyId, uint8 commentId);
    event PostDeleted(address user, uint256 postId);
    event ReplyDeleted(address user, uint256 postId, uint16 replyId);
    event CommentDeleted(address user, uint256 postId, uint16 parentReplyId, uint8 commentId);
    event StatusOfficialReplyChanged(address user, uint256 postId, uint16 replyId);
    event StatusBestReplyChanged(address user, uint256 postId, uint16 replyId);
    event ForumItemVoted(address user, uint256 postId, uint16 replyId, uint8 commentId, int8 voteDirection);

    /// @notice Publication post 
    /// @param self The mapping containing all posts
    /// @param user Author of the post
    /// @param communityId Community where the post will be ask
    /// @param ipfsHash IPFS hash of document with post information
    function createPost(
        PostCollection storage self,
        SecurityLib.Roles storage roles,
        UserLib.UserCollection storage users,
        address user,
        uint32 communityId, 
        bytes32 ipfsHash,
        PostType postType,
        uint8[] memory tags
    ) public {
        int32 userRating = UserLib.getUserByAddress(users, user).rating;
        SecurityLib.checkRatingAndCommunityModerator(roles, userRating, user, user, communityId, SecurityLib.Action.publicationPost);
        require(!IpfsLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");
        require(tags.length > 0, "At least one tag is required.");
        require(postType != PostType.Tutorial, "At this release you can not publish tutorial.");


        PostContainer storage post = self.posts[++self.postCount];
        post.info.ipfsDoc.hash = ipfsHash;
        post.info.postType = postType;
        post.info.author = user;
        post.info.postTime = CommonLib.getTimestamp();
        post.info.communityId = communityId;
        post.info.tags = tags;

        emit PostCreated(user, communityId, self.postCount);
    }

    /// @notice Post reply
    /// @param self The mapping containing all posts
    /// @param user Author of the reply
    /// @param postId The post where the reply will be post
    /// @param parentReplyId The reply where the reply will be post
    /// @param ipfsHash IPFS hash of document with reply information
    /// @param isOfficialReply Flag is showing "official reply" or not
    function createReply(
        PostCollection storage self,
        SecurityLib.Roles storage roles,
        UserLib.UserCollection storage users,
        RewardLib.UserRewards storage userRewards,
        address user,
        uint256 postId,
        uint16 parentReplyId,
        bytes32 ipfsHash,
        bool isOfficialReply
    ) public {
        PostContainer storage postContainer = getPostContainer(self, postId);
        int32 userRating = UserLib.getUserByAddress(users, user).rating;
        SecurityLib.checkRatingAndCommunityModerator(roles, userRating, user, user, postContainer.info.communityId, SecurityLib.Action.publicationReply);    // postContainer.info.author
        require(!IpfsLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");
        require(
            parentReplyId == 0 || 
            (postContainer.info.postType != PostType.ExpertPost && postContainer.info.postType != PostType.CommonPost), 
            "User is forbidden to reply on reply for Expert and Common type of posts"
        ); // unit tests (reply on reply)

        if (postContainer.info.postType == PostType.ExpertPost || postContainer.info.postType == PostType.CommonPost) {
          uint16 countReplies = uint16(postContainer.info.replyCount);
          for (uint16 i = 1; i <= countReplies; i++) {
            ReplyContainer storage replyContainer = getReplyContainer(postContainer, i);
            require(user != replyContainer.info.author, "Users can not publish 2 replies in export and common posts.");
          }
        }

        ReplyContainer storage replyContainer = postContainer.replies[++postContainer.info.replyCount];
        uint32 timestamp = CommonLib.getTimestamp();
        if (parentReplyId == 0) {
            if (isOfficialReply) {
                require((SecurityLib.hasRole(roles, SecurityLib.getCommunityRole(SecurityLib.COMMUNITY_MODERATOR_ROLE, postContainer.info.communityId), user)), 
                    "Must have community moderator role");
                postContainer.info.officialReply = postContainer.info.replyCount;
            }

            if (postContainer.info.postType != PostType.Tutorial && postContainer.info.author != user) {
                if (postContainer.info.replyCount - postContainer.info.deletedReplyCount == 1) {    // unit test
                    replyContainer.info.isFirstReply = true;
                    UserLib.updateUserRating(users, userRewards, user, VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.FirstReply));
                }
                if (timestamp - postContainer.info.postTime < CommonLib.QUICK_REPLY_TIME_SECONDS) {
                    replyContainer.info.isQuickReply = true;
                    UserLib.updateUserRating(users, userRewards, user, VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.QuickReply));
                }
            }
        } else {
          getReplyContainerSafe(postContainer, parentReplyId);
          replyContainer.info.parentReplyId = parentReplyId;  
        }

        replyContainer.info.author = user;
        replyContainer.info.ipfsDoc.hash = ipfsHash;
        replyContainer.info.postTime = timestamp;

        emit ReplyCreated(user, postId, parentReplyId, postContainer.info.replyCount);
    }

    /// @notice Post comment
    /// @param self The mapping containing all posts
    /// @param user Author of the comment
    /// @param postId The post where the comment will be post
    /// @param parentReplyId The reply where the comment will be post
    /// @param ipfsHash IPFS hash of document with comment information
    function createComment(
        PostCollection storage self,
        SecurityLib.Roles storage roles,
        UserLib.UserCollection storage users,
        address user,
        uint256 postId,
        uint16 parentReplyId,
        bytes32 ipfsHash
    ) public {
        PostContainer storage postContainer = getPostContainer(self, postId);
        int32 userRating = UserLib.getUserByAddress(users, user).rating;
        require(!IpfsLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");

        Comment storage comment;
        uint8 commentId;
        if (parentReplyId == 0) {
            commentId = ++postContainer.info.commentCount;
            comment = postContainer.comments[commentId].info;
            SecurityLib.checkRatingAndCommunityModerator(roles, userRating, user, postContainer.info.author, postContainer.info.communityId, SecurityLib.Action.publicationComment);
        } else {
            ReplyContainer storage replyContainer = getReplyContainerSafe(postContainer, parentReplyId);
            commentId = ++replyContainer.info.commentCount;
            comment = replyContainer.comments[commentId].info;
            SecurityLib.checkRatingAndCommunityModerator(roles, userRating, user, replyContainer.info.author, postContainer.info.communityId, SecurityLib.Action.publicationComment);
        }

        comment.author = user;
        comment.ipfsDoc.hash = ipfsHash;
        comment.postTime = CommonLib.getTimestamp();

        emit CommentCreated(user, postId, parentReplyId, commentId);
    }

    /// @notice Edit post
    /// @param self The mapping containing all posts
    /// @param user Author of the comment
    /// @param postId The post where the comment will be post
    /// @param ipfsHash IPFS hash of document with post information
    function editPost(                                                  //LAST MODIFIED?
        PostCollection storage self,
        address user,
        uint256 postId,
        bytes32 ipfsHash,
        uint8[] memory tags
    ) public {
        PostContainer storage postContainer = getPostContainer(self, postId);
        require(!IpfsLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");
        require(user == postContainer.info.author, "You can not edit this post. It is not your.");

        if(!IpfsLib.isEmptyIpfs(ipfsHash) && postContainer.info.ipfsDoc.hash != ipfsHash)
            postContainer.info.ipfsDoc.hash = ipfsHash;
        if (tags.length > 0)
            postContainer.info.tags = tags;

        emit PostEdited(user, postId);
    }

    /// @notice Edit reply
    /// @param self The mapping containing all posts
    /// @param user Author of the comment
    /// @param postId The post where the comment will be post
    /// @param replyId The reply which will be change
    /// @param ipfsHash IPFS hash of document with reply information
    function editReply(                                                         //LAST MODIFIED?
        PostCollection storage self,
        address user,
        uint256 postId,
        uint16 replyId,
        bytes32 ipfsHash
    ) public {
        PostContainer storage postContainer = getPostContainer(self, postId);
        ReplyContainer storage replyContainer = getReplyContainerSafe(postContainer, replyId);
        require(!IpfsLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");
        require(user == replyContainer.info.author, "You can not edit this Reply. It is not your.");

        if (replyContainer.info.ipfsDoc.hash != ipfsHash)
            replyContainer.info.ipfsDoc.hash = ipfsHash;
        
        emit ReplyEdited(user, postId, replyId);
    }

    /// @notice Edit comment
    /// @param self The mapping containing all posts
    /// @param user Author of the comment
    /// @param postId The post where the comment will be post
    /// @param parentReplyId The reply where the reply will be edit                                    ///////
    /// @param commentId The comment which will be change
    /// @param ipfsHash IPFS hash of document with comment information
    function editComment(                                           //LAST MODIFIED?
        PostCollection storage self,
        address user,
        uint256 postId,
        uint16 parentReplyId,
        uint8 commentId,
        bytes32 ipfsHash
    ) public {
        PostContainer storage postContainer = getPostContainer(self, postId);
        CommentContainer storage commentContainer = getCommentContainerSave(postContainer, parentReplyId, commentId);
        require(!IpfsLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");
        require(user == commentContainer.info.author, "You can not edit this comment. It is not your.");

        if (commentContainer.info.ipfsDoc.hash != ipfsHash)
            commentContainer.info.ipfsDoc.hash = ipfsHash;
        
        emit CommentEdited(user, postId, parentReplyId, commentId);
    }

    /// @notice Delete post
    /// @param self The mapping containing all posts
    /// @param user User who deletes post
    /// @param postId Post which will be deleted
    function deletePost(
        PostCollection storage self,
        SecurityLib.Roles storage roles,
        UserLib.UserCollection storage users,
        RewardLib.UserRewards storage userRewards,
        address user,
        uint256 postId
    ) public {
        PostContainer storage postContainer = getPostContainer(self, postId);
        int32 userRating = UserLib.getUserByAddress(users, user).rating;
        SecurityLib.checkRatingAndCommunityModerator(roles, userRating, user, postContainer.info.author, postContainer.info.communityId, SecurityLib.Action.deleteItem);

        uint256 time = CommonLib.getTimestamp();
        if (time - postContainer.info.postTime < deleteTime) {      //unit test ?
            if (postContainer.info.rating > 0) {
                UserLib.updateUserRating(users, userRewards, postContainer.info.author,
                                -VoteLib.getUserRatingChange(   postContainer.info.postType, 
                                                                VoteLib.ResourceAction.Upvoted,
                                                                TypeContent.Post) * postContainer.info.rating);
            }
    
            for (uint16 i = 1; i <= postContainer.info.replyCount; i++) {
                deductReplyRating(users, userRewards, postContainer.info.postType, postContainer.replies[i], postContainer.info.bestReply == i);
            }
        }
        
        if (user == postContainer.info.author)
            UserLib.updateUserRating(users, userRewards, postContainer.info.author, VoteLib.DeleteOwnPost);
        else 
            UserLib.updateUserRating(users, userRewards, postContainer.info.author, VoteLib.ModeratorDeletePost);

        postContainer.info.isDeleted = true;
        emit PostDeleted(user, postId);
    }

    /// @notice Delete reply
    /// @param self The mapping containing all posts
    /// @param user User who deletes reply
    /// @param postId The post where will be deleted reply
    /// @param replyId Reply which will be deleted
    function deleteReply(
        PostCollection storage self,
        SecurityLib.Roles storage roles,
        UserLib.UserCollection storage users,
        RewardLib.UserRewards storage userRewards,
        address user,
        uint256 postId,
        uint16 replyId
    ) public {
        PostContainer storage postContainer = getPostContainer(self, postId);
        require(postContainer.info.bestReply != replyId, "You can not delete the best reply."); // unit test
        ReplyContainer storage replyContainer = getReplyContainerSafe(postContainer, replyId);
        int32 userRating = UserLib.getUserByAddress(users, user).rating;
        SecurityLib.checkRatingAndCommunityModerator(roles, userRating, user, replyContainer.info.author, postContainer.info.communityId, SecurityLib.Action.deleteItem);

        uint256 time = CommonLib.getTimestamp();
        if (time - postContainer.info.postTime < deleteTime) {  //unit test ?
            deductReplyRating(users, userRewards, postContainer.info.postType, replyContainer, replyContainer.info.parentReplyId == 0 && postContainer.info.bestReply == replyId);
        }
        if (user == replyContainer.info.author)
            UserLib.updateUserRating(users, userRewards, replyContainer.info.author, VoteLib.DeleteOwnReply);
        else 
            UserLib.updateUserRating(users, userRewards, replyContainer.info.author, VoteLib.ModeratorDeleteReply);

        replyContainer.info.isDeleted = true;
        postContainer.info.deletedReplyCount++;
        emit ReplyDeleted(user, postId, replyId);
    }

    /// @notice Take reply rating from the author
    /// @param users The mapping containing all users
    /// @param postType Type post: expert, common, tutorial
    /// @param replyContainer Reply from which the rating is taken
    function deductReplyRating (
        UserLib.UserCollection storage users,
        RewardLib.UserRewards storage userRewards,
        PostType postType,
        ReplyContainer storage replyContainer,
        bool isBestReply
    ) private {
        if (IpfsLib.isEmptyIpfs(replyContainer.info.ipfsDoc.hash) || replyContainer.info.isDeleted)
            return;

        if (replyContainer.info.rating >= 0) {
            UserLib.updateUserRating(users, userRewards, replyContainer.info.author,
                                -VoteLib.getUserRatingChangeForReplyAction( postType,
                                                                            VoteLib.ResourceAction.Upvoted) * replyContainer.info.rating);
            
            // best reply

            if (replyContainer.info.isFirstReply) {
                UserLib.updateUserRating(users, userRewards, replyContainer.info.author, -VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.FirstReply));
            }
            if (replyContainer.info.isQuickReply) {
                UserLib.updateUserRating(users, userRewards, replyContainer.info.author, -VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.QuickReply));
            }
            if (isBestReply && postType != PostType.Tutorial) {
                UserLib.updateUserRating(users, userRewards, replyContainer.info.author, -VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.AcceptReply));
                UserLib.updateUserRating(users, userRewards, msg.sender, -VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.AcceptedReply));
            }
        }
    }

    /// @notice Delete comment
    /// @param self The mapping containing all posts
    /// @param roles Permissions user
    /// @param user User who deletes comment
    /// @param postId The post where will be deleted comment
    /// @param parentReplyId The reply where the reply will be deleted
    /// @param commentId Comment which will be deleted
    function deleteComment(
        PostCollection storage self,
        SecurityLib.Roles storage roles,
        UserLib.UserCollection storage users,
        RewardLib.UserRewards storage userRewards,
        address user,
        uint256 postId,
        uint16 parentReplyId,
        uint8 commentId
    ) public {
        PostContainer storage postContainer = getPostContainer(self, postId);
        CommentContainer storage commentContainer = getCommentContainerSave(postContainer, parentReplyId, commentId);
        int32 userRating = UserLib.getUserByAddress(users, user).rating;
        SecurityLib.checkRatingAndCommunityModerator(roles, userRating, user, commentContainer.info.author, postContainer.info.communityId, SecurityLib.Action.deleteItem);

        if (user == commentContainer.info.author)
            UserLib.updateUserRating(users, userRewards, commentContainer.info.author, VoteLib.DeleteOwnComment);
        else 
            UserLib.updateUserRating(users, userRewards, commentContainer.info.author, VoteLib.ModeratorDeleteComment);

        commentContainer.info.isDeleted = true;
        emit CommentDeleted(user, postId, parentReplyId, commentId);
    }

    /// @notice Change status official reply
    /// @param self The mapping containing all posts
    /// @param user Who called action
    /// @param postId Post where will be change reply status
    /// @param replyId Reply which will change status
    function changeStatusOfficialReply(
        PostCollection storage self,
        SecurityLib.Roles storage roles,
        address user,
        uint256 postId,
        uint16 replyId
    ) public {
        // check permistion
        PostContainer storage postContainer = getPostContainer(self, postId);
        require((SecurityLib.hasRole(roles, SecurityLib.getCommunityRole(SecurityLib.COMMUNITY_MODERATOR_ROLE, postContainer.info.communityId), user)), 
                    "Must have community moderator role");
        getReplyContainerSafe(postContainer, replyId);
         
        if (postContainer.info.officialReply == replyId)
            postContainer.info.officialReply = 0;
        else
            postContainer.info.officialReply = replyId;
        
        emit StatusOfficialReplyChanged(user, postId, postContainer.info.officialReply);
    }

    /// @notice Change status best reply
    /// @param self The mapping containing all posts
    /// @param roles Permissions users
    /// @param user Who called action
    /// @param postId The post where will be change reply status
    /// @param replyId Reply which will change status
    function changeStatusBestReply (
        PostCollection storage self,
        SecurityLib.Roles storage roles,
        UserLib.UserCollection storage users,
        RewardLib.UserRewards storage userRewards,
        address user,
        uint256 postId,
        uint16 replyId
    ) public {
        PostContainer storage postContainer = getPostContainer(self, postId);
        ReplyContainer storage replyContainer = getReplyContainerSafe(postContainer, replyId);
        address replyOwner = replyContainer.info.author;        // mb rewrite

        if (postContainer.info.bestReply == replyId) {
            if (replyContainer.info.author != user) {       // unit test
                users.updateUserRating(userRewards, replyContainer.info.author, -VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.AcceptReply));  
                users.updateUserRating(userRewards, user, -VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.AcceptedReply));
            }
            postContainer.info.bestReply = 0;
        } else {
            if (postContainer.info.bestReply != 0) {
                ReplyContainer storage oldBestReplyContainer = getReplyContainerSafe(postContainer, replyId);
                if (oldBestReplyContainer.info.author != user) {    // unit test
                    users.updateUserRating(userRewards, oldBestReplyContainer.info.author, -VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.AcceptReply));  
                    users.updateUserRating(userRewards, user, -VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.AcceptedReply));  
                }
                replyOwner = oldBestReplyContainer.info.author;
            }

            if (replyContainer.info.author != user) {   // unit test
                users.updateUserRating(userRewards, replyContainer.info.author, VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.AcceptReply));  
                users.updateUserRating(userRewards, user, VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.AcceptedReply));  
            }
            postContainer.info.bestReply = replyId;
        }

        int32 userRating = UserLib.getUserByAddress(users, user).rating;
        SecurityLib.checkRatingAndCommunityModerator(roles, userRating, user, replyOwner, postContainer.info.communityId, SecurityLib.Action.bestReply);    // unit test

        emit StatusBestReplyChanged(user, postId, postContainer.info.bestReply);
    }

    /// @notice Vote for post, reply or comment
    /// @param self The mapping containing all posts
    /// @param users The mapping containing all users
    /// @param user Who called action
    /// @param postId Post where will be change rating
    /// @param replyId Reply which will be change rating
    /// @param commentId Comment which will be change rating
    /// @param isUpvote Upvote or downvote
    function voteForumItem(
        PostCollection storage self,
        SecurityLib.Roles storage roles,
        UserLib.UserCollection storage users,
        RewardLib.UserRewards storage userRewards,
        address user,
        uint256 postId,
        uint16 replyId,
        uint8 commentId,
        bool isUpvote
    ) public {
        PostContainer storage postContainer = getPostContainer(self, postId);
        PostType postType = postContainer.info.postType;

        int8 voteDirection;
        if (commentId != 0) {
            CommentContainer storage commentContainer = getCommentContainerSave(postContainer, replyId, commentId);
            require(user != commentContainer.info.author, "You can not vote for own comment.");
            voteComment(roles, users, commentContainer, postContainer.info.communityId, user, isUpvote);

        } else if (replyId != 0) {
            ReplyContainer storage replyContainer = getReplyContainerSafe(postContainer, replyId);
            require(user != replyContainer.info.author, "You can not vote for own reply.");
            voteReply(roles, users, userRewards, replyContainer, postContainer.info.communityId, user, postType, isUpvote);

        } else {
            require(user != postContainer.info.author, "You can not vote for own post.");
            votePost(roles, users, userRewards, postContainer, user, postType, isUpvote);
        }

        emit ForumItemVoted(user, postId, replyId, commentId, voteDirection);
    }

    // @notice Vote for post
    /// @param users The mapping containing all users
    /// @param postContainer Post where will be change rating
    /// @param votedUser User who voted
    /// @param postType Type post expert, common, tutorial
    /// @param isUpvote Upvote or downvote
    function votePost(
        SecurityLib.Roles storage roles,
        UserLib.UserCollection storage users,
        RewardLib.UserRewards storage userRewards,
        PostContainer storage postContainer,
        address votedUser,
        PostType postType,
        bool isUpvote
    ) public {
        int32 ratingChange = VoteLib.getForumItemRatingChange(votedUser, postContainer.historyVotes, isUpvote, postContainer.votedUsers);
        int32 userRating = UserLib.getUserByAddress(users, votedUser).rating;
        SecurityLib.checkRatingAndCommunityModerator(
            roles, 
            userRating, 
            votedUser, 
            postContainer.info.author, 
            postContainer.info.communityId, 
            ratingChange > 0 ? SecurityLib.Action.upVotePost : SecurityLib.Action.downVotePost);

        vote(users, userRewards, postContainer.info.author, votedUser, postType, isUpvote, ratingChange, TypeContent.Post);
        postContainer.info.rating += ratingChange;
    }
 
    // @notice Vote for reply
    /// @param users The mapping containing all users
    /// @param replyContainer Reply where will be change rating
    /// @param votedUser User who voted
    /// @param postType Type post expert, common, tutorial
    /// @param isUpvote Upvote or downvote
    function voteReply(
        SecurityLib.Roles storage roles,
        UserLib.UserCollection storage users,
        RewardLib.UserRewards storage userRewards,
        ReplyContainer storage replyContainer,
        uint32 communityId,
        address votedUser,
        PostType postType,
        bool isUpvote
    ) public {
        int32 ratingChange = VoteLib.getForumItemRatingChange(votedUser, replyContainer.historyVotes, isUpvote, replyContainer.votedUsers);
        int32 userRating = UserLib.getUserByAddress(users, votedUser).rating;
        SecurityLib.checkRatingAndCommunityModerator(
            roles, 
            userRating, 
            votedUser, 
            replyContainer.info.author, 
            communityId, 
            ratingChange > 0 ? SecurityLib.Action.upVoteReply : SecurityLib.Action.downVoteReply);

        if (postType == PostType.Tutorial) return;

        vote(users, userRewards, replyContainer.info.author, votedUser, postType, isUpvote, ratingChange, TypeContent.Reply);
        int32 oldRating = replyContainer.info.rating;
        replyContainer.info.rating += ratingChange;
        int32 newRating = replyContainer.info.rating; // or oldRating + ratingChange gas

        if (replyContainer.info.isFirstReply) {
            if (oldRating < 0 && newRating >= 0) {
                UserLib.updateUserRating(users, userRewards, replyContainer.info.author, VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.FirstReply));
            } else if (oldRating >= 0 && newRating < 0) {
                UserLib.updateUserRating(users, userRewards, replyContainer.info.author, -VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.FirstReply));
            }
        }

        if (replyContainer.info.isQuickReply) {
            if (oldRating < 0 && newRating >= 0) {
                UserLib.updateUserRating(users, userRewards, replyContainer.info.author, VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.QuickReply));
            } else if (oldRating >= 0 && newRating < 0) {
                UserLib.updateUserRating(users, userRewards, replyContainer.info.author, -VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.QuickReply));
            }
        }

    }

    // @notice Vote for comment
    /// @param commentContainer Comment where will be change rating
    /// @param votedUser User who voted
    /// @param isUpvote Upvote or downvote
    function voteComment(
        SecurityLib.Roles storage roles,
        UserLib.UserCollection storage users,
        CommentContainer storage commentContainer,
        uint32 communityId,
        address votedUser,
        bool isUpvote
    ) private {
        int32 ratingChange = VoteLib.getForumItemRatingChange(votedUser, commentContainer.historyVotes, isUpvote, commentContainer.votedUsers);
        int32 userRating = UserLib.getUserByAddress(users, votedUser).rating;
        SecurityLib.checkRatingAndCommunityModerator(
            roles, 
            userRating, 
            votedUser, 
            commentContainer.info.author, 
            communityId, 
            ratingChange > 0 ? SecurityLib.Action.upVoteComment : SecurityLib.Action.downVoteComment);
        
        commentContainer.info.rating += ratingChange;
    }

    // @notice Сount users' rating after voting per a reply or post
    /// @param users The mapping containing all users
    /// @param author Author post, reply or comment where voted
    /// @param votedUser User who voted
    /// @param postType Type post expert, common, tutorial
    /// @param isUpvote Upvote or downvote
    /// @param ratingChanged The value shows how the rating of a post or reply has changed.
    /// @param typeContent Type content post, reply or comment
    function vote (
        UserLib.UserCollection storage users,
        RewardLib.UserRewards storage userRewards,
        address author,
        address votedUser,
        PostType postType,
        bool isUpvote,
        int32 ratingChanged,
        TypeContent typeContent
    ) private {
       UserLib.UserRatingChange[] memory usersRating = new UserLib.UserRatingChange[](2);

        if (isUpvote) {
            usersRating[0].user = author;
            usersRating[0].rating = VoteLib.getUserRatingChange(postType, VoteLib.ResourceAction.Upvoted, typeContent);

            if (ratingChanged == 2) {
                usersRating[0].rating += VoteLib.getUserRatingChange(postType, VoteLib.ResourceAction.Downvoted, typeContent) * -1;

                usersRating[1].user = votedUser;
                usersRating[1].rating = VoteLib.getUserRatingChange(postType, VoteLib.ResourceAction.Downvote, typeContent) * -1; 
            }

            if (ratingChanged < 0) {
                usersRating[0].rating *= -1;
                usersRating[1].rating *= -1;
            } 
        } else {
            usersRating[0].user = author;
            usersRating[0].rating = VoteLib.getUserRatingChange(postType, VoteLib.ResourceAction.Downvoted, typeContent);

            usersRating[1].user = votedUser;
            usersRating[1].rating = VoteLib.getUserRatingChange(postType, VoteLib.ResourceAction.Downvote, typeContent);

            if (ratingChanged == -2) {
                usersRating[0].rating += VoteLib.getUserRatingChange(postType, VoteLib.ResourceAction.Upvoted, typeContent) * -1;
            }

            if (ratingChanged > 0) {
                usersRating[0].rating *= -1;
                usersRating[1].rating *= -1;  
            }
        }
        UserLib.updateUsersRating(users, userRewards, usersRating); 
    }

    /// @notice Return post
    /// @param self The mapping containing all posts
    /// @param postId The postId which need find
    function getPostContainer(
        PostCollection storage self,
        uint256 postId
    ) public view returns (PostContainer storage) {
        PostContainer storage post = self.posts[postId];
        require(!IpfsLib.isEmptyIpfs(post.info.ipfsDoc.hash), "Post does not exist.");
        require(!post.info.isDeleted, "Post has been deleted.");
        
        return post;
    }

    /// @notice Return reply, the reply is not checked on delete one
    /// @param postContainer The post where is the reply
    /// @param replyId The replyId which need find
    function getReplyContainer(
        PostContainer storage postContainer,
        uint16 replyId
    ) public view returns (ReplyContainer storage) {
        ReplyContainer storage replyContainer = postContainer.replies[replyId];

        require(!IpfsLib.isEmptyIpfs(replyContainer.info.ipfsDoc.hash), "Reply does not exist.");
        return replyContainer;
    }

    /// @notice Return reply, the reply is checked on delete one
    /// @param postContainer The post where is the reply
    /// @param replyId The replyId which need find
    function getReplyContainerSafe(
        PostContainer storage postContainer,
        uint16 replyId
    ) public view returns (ReplyContainer storage) {
        ReplyContainer storage replyContainer = getReplyContainer(postContainer, replyId);
        require(!replyContainer.info.isDeleted, "Reply has been deleted.");

        return replyContainer;
    }

    /// @notice Return comment, the comment is not checked on delete one
    /// @param postContainer The post where is the comment
    /// @param parentReplyId The parent reply
    /// @param commentId The commentId which need find
    function getCommentContainer(
        PostContainer storage postContainer,
        uint16 parentReplyId,
        uint8 commentId
    ) public view returns (CommentContainer storage) {
        CommentContainer storage commentContainer;

        if (parentReplyId == 0) {
            commentContainer = postContainer.comments[commentId];  
        } else {
            ReplyContainer storage reply = getReplyContainer(postContainer, parentReplyId);
            commentContainer = reply.comments[commentId];
        }
        require(!IpfsLib.isEmptyIpfs(commentContainer.info.ipfsDoc.hash), "Comment does not exist.");

        return commentContainer;
    }

    /// @notice Return comment, the comment is checked on delete one
    /// @param postContainer The post where is the comment
    /// @param parentReplyId The parent reply
    /// @param commentId The commentId which need find
    function getCommentContainerSave(
        PostContainer storage postContainer,
        uint16 parentReplyId,
        uint8 commentId
    ) public view returns (CommentContainer storage) {
        CommentContainer storage commentContainer = getCommentContainer(postContainer, parentReplyId, commentId);

        require(!commentContainer.info.isDeleted, "Comment has been deleted.");
        return commentContainer;
    }

    /// @notice Return post for unit tests
    /// @param self The mapping containing all posts
    /// @param postId The post which need find
    function getPost(
        PostCollection storage self,
        uint256 postId
    ) public view returns (Post memory) {        
        return self.posts[postId].info;
    }

    /// @notice Return reply for unit tests
    /// @param self The mapping containing all posts
    /// @param postId The post where is the reply
    /// @param replyId The reply which need find
    function getReply(
        PostCollection storage self, 
        uint256 postId, 
        uint16 replyId
    ) public view returns (Reply memory) {
        PostContainer storage postContainer = self.posts[postId];
        return getReplyContainer(postContainer, replyId).info;
    }

    /// @notice Return comment for unit tests
    /// @param self The mapping containing all posts
    /// @param postId Post where is the reply
    /// @param parentReplyId The parent reply
    /// @param commentId The comment which need find
    function getComment(
        PostCollection storage self, 
        uint256 postId,
        uint16 parentReplyId,
        uint8 commentId
    ) public view returns (Comment memory) {
        PostContainer storage postContainer = self.posts[postId];
        return getCommentContainer(postContainer, parentReplyId, commentId).info;
    }

    /// @notice Get flag status vote (upvote/dovnvote) for post/reply/comment
    /// @param self The mapping containing all posts
    /// @param user Author of the vote
    /// @param postId The post where need to get flag status
    /// @param replyId The reply where need to get flag status
    /// @param commentId The comment where need to get flag status
    // return value:
    // downVote = -1
    // nothing = 0
    // upVote = 1
    function getStatusHistory(
        PostCollection storage self, 
        address user,
        uint256 postId,
        uint16 replyId,
        uint8 commentId
    ) public view returns (int256) {
        PostContainer storage postContainer = getPostContainer(self, postId);

        int256 statusHistory;
        if (commentId != 0) {
            CommentContainer storage commentContainer = getCommentContainerSave(postContainer, replyId, commentId);
            statusHistory = commentContainer.historyVotes[user];
        } else if (replyId != 0) {
            ReplyContainer storage replyContainer = getReplyContainerSafe(postContainer, replyId);
            statusHistory = replyContainer.historyVotes[user];
        } else {
            statusHistory = postContainer.historyVotes[user];
        }

        return statusHistory;
    }

    /// @notice Get users which voted for post/reply/comment
    /// @param self The mapping containing all posts
    /// @param postId The post where need to get users
    /// @param replyId The reply where need to get users
    /// @param commentId The comment where need to get users
    function getVotedUsers(
        PostCollection storage self, 
        uint256 postId,
        uint16 replyId,
        uint8 commentId
    ) public view returns (address[] memory) {
        PostContainer storage postContainer = getPostContainer(self, postId);

        address[] memory votedUsers;
        if (commentId != 0) {
            CommentContainer storage commentContainer = getCommentContainerSave(postContainer, replyId, commentId);
            votedUsers = commentContainer.votedUsers;
        } else if (replyId != 0) {
            ReplyContainer storage replyContainer = getReplyContainerSafe(postContainer, replyId);
            votedUsers = replyContainer.votedUsers;
        } else {
            votedUsers = postContainer.votedUsers;
        }

        return votedUsers;
    }
}