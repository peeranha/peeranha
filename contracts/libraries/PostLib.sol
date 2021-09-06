pragma solidity >=0.5.0;
pragma abicoder v2;

import "./IpfsLib.sol";
import "./CommunityLib.sol";
import "./VoteLib.sol";
import "./UserLib.sol";
import "./CommonLib.sol";

/// @title PostLib
/// @notice Provides information about operation with posts
/// @dev posts information is stored in the mapping on the main contract
library PostLib  {
    using UserLib for UserLib.UserCollection;

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

    struct UserRatingChange {
        address user;
        int8 rating;
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
    event ForumItemVoted(address user, uint256 postId, uint16 replyId, uint8 commentId, bool isUpvote);

    /// @notice Publication post
    /// @param self The mapping containing all posts
    /// @param user Author of the post
    /// @param communityId Community where the post will be ask
    /// @param ipfsHash IPFS hash of document with post information
    function createPost(
        PostCollection storage self,
        address user,
        uint32 communityId, 
        bytes32 ipfsHash,
        PostType postType,
        uint8[] memory tags
    ) internal {
        require(!IpfsLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");
        require(tags.length > 0, "At least one tag is required.");
        ///
        //check community, tags
        ///

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
        UserLib.UserCollection storage users,
        address user,
        uint256 postId,
        uint16 parentReplyId,
        bytes32 ipfsHash,
        bool isOfficialReply
    ) internal {
        require(!IpfsLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");
        PostContainer storage postContainer = getPostContainer(self, postId);

        ReplyContainer storage replyContainer = postContainer.replies[++postContainer.info.replyCount];
        uint32 timestamp = CommonLib.getTimestamp();
        if (parentReplyId == 0) {
            if (isOfficialReply)
                postContainer.info.officialReply = postContainer.info.replyCount;

            if (postContainer.info.postType != PostType.Tutorial) {
                if (postContainer.info.replyCount == 1) {
                    replyContainer.info.isFirstReply = true;
                    UserLib.updateUserRating(users, user, VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.FirstReply));
                }
                if (timestamp - postContainer.info.postTime < CommonLib.QUICK_REPLY_TIME_SECONDS) {
                    replyContainer.info.isQuickReply = true;
                    UserLib.updateUserRating(users, user, VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.QuickReply));
                }
            }
        } else {
          getReplyContainer(postContainer, parentReplyId);
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
        address user,
        uint256 postId,
        uint16 parentReplyId,
        bytes32 ipfsHash
    ) internal {
        require(!IpfsLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");
        PostContainer storage postContainer = getPostContainer(self, postId);

        Comment storage comment;
        uint8 commentId;
        if (parentReplyId == 0) {
            commentId = ++postContainer.info.commentCount;
            comment = postContainer.comments[commentId].info;  
        } else {
            ReplyContainer storage reply = getReplyContainer(postContainer, parentReplyId);
            commentId = ++reply.info.commentCount;
            comment = reply.comments[commentId].info;
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
        uint32 communityId,
        bytes32 ipfsHash,
        uint8[] memory tags
    ) internal {
        PostContainer storage postContainer = getPostContainer(self, postId);
        
        if(communityId != 0 && postContainer.info.communityId != communityId)
            postContainer.info.communityId = communityId;
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
    ) internal {
        require(!IpfsLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");
        PostContainer storage postContainer = getPostContainer(self, postId);
        ReplyContainer storage replyContainer = getReplyContainer(postContainer, replyId);

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
    ) internal {
        require(!IpfsLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");
        PostContainer storage postContainer = getPostContainer(self, postId);
        CommentContainer storage commentContainer = getCommentContainer(postContainer, parentReplyId, commentId);

        if (commentContainer.info.ipfsDoc.hash != ipfsHash)
            commentContainer.info.ipfsDoc.hash = ipfsHash;
        
        emit CommentEdited(user, postId, parentReplyId, commentId);
    }

    /// @notice Delete post
    /// @param self The mapping containing all posts
    /// @param user User which deletes post
    /// @param postId Post which will be deleted
    function deletePost(
        PostCollection storage self,
        UserLib.UserCollection storage users,
        address user,
        uint256 postId
    ) internal {
        PostContainer storage postContainer = getPostContainer(self, postId);

        if (postContainer.info.rating > 0) {
            UserLib.updateUserRating(users, postContainer.info.author,
                                -VoteLib.getUserRatingChange(   postContainer.info.postType, 
                                                                VoteLib.ResourceAction.Upvoted,
                                                                TypeContent.Post) * postContainer.info.rating);
        }
    
        for (uint16 i = 1; i <= postContainer.info.replyCount; i++) {
            deductReplyRating(users, postContainer.info.postType, postContainer.replies[i], postContainer.info.bestReply == i);
        }
        if (user == postContainer.info.author)
            UserLib.updateUserRating(users, postContainer.info.author, VoteLib.DeleteOwnPost);

        postContainer.info.isDeleted = true;
        emit PostDeleted(user, postId);
    }

    /// @notice Delete reply
    /// @param self The mapping containing all posts
    /// @param user User which deletes reply
    /// @param postId The post where will be deleted reply
    /// @param replyId Reply which will be deleted
    function deleteReply(
        PostCollection storage self,
        UserLib.UserCollection storage users,
        address user,
        uint256 postId,
        uint16 replyId
    ) internal {
        /*
        check author
        */
        PostContainer storage postContainer = getPostContainer(self, postId);
        ReplyContainer storage replyContainer = getReplyContainer(postContainer, replyId);

        deductReplyRating(users, postContainer.info.postType, replyContainer, replyContainer.info.parentReplyId == 0 && postContainer.info.bestReply == replyId);
        if (user == replyContainer.info.author)
            UserLib.updateUserRating(users, replyContainer.info.author, VoteLib.DeleteOwnReply);

        replyContainer.info.isDeleted = true;
        emit ReplyDeleted(user, postId, replyId);
    }

    /// @notice Take reply rating from the author
    /// @param users The mapping containing all users
    /// @param postType Type post: expert, common, tutorial
    /// @param replyContainer Reply from which the rating is taken
    function deductReplyRating (                                    // add bool level x3 if?
        UserLib.UserCollection storage users,
        PostType postType,
        ReplyContainer storage replyContainer,
        bool isBestReply
    ) private {
        if (IpfsLib.isEmptyIpfs(replyContainer.info.ipfsDoc.hash) || replyContainer.info.isDeleted)
            return;

        if (replyContainer.info.rating >= 0) {
            UserLib.updateUserRating(users, replyContainer.info.author,
                                -VoteLib.getUserRatingChangeForReplyAction( postType,
                                                                            VoteLib.ResourceAction.Upvoted) * replyContainer.info.rating);
            
            if (replyContainer.info.isFirstReply) {
                UserLib.updateUserRating(users, replyContainer.info.author, -VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.FirstReply));
            }
            if (replyContainer.info.isQuickReply) {
                UserLib.updateUserRating(users, replyContainer.info.author, -VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.QuickReply));
            }
            if (isBestReply && postType != PostType.Tutorial) {
                UserLib.updateUserRating(users, replyContainer.info.author, -VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.AcceptReply));
                UserLib.updateUserRating(users, msg.sender, -VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.AcceptedReply));
            }
        }
    }

    /// @notice Delete comment
    /// @param self The mapping containing all posts
    /// @param user User which deletes comment
    /// @param postId The post where will be deleted comment
    /// @param parentReplyId The reply where the reply will be deleted
    /// @param commentId Comment which will be deleted
    function deleteComment(
        PostCollection storage self,
        address user,
        uint256 postId,
        uint16 parentReplyId,
        uint8 commentId
    ) internal {
        PostContainer storage postContainer = getPostContainer(self, postId);
        CommentContainer storage commentContainer = getCommentContainer(postContainer, parentReplyId, commentId);

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
        address user,
        uint256 postId,
        uint16 replyId
    ) internal {
        // check permistion
        PostContainer storage postContainer = getPostContainer(self, postId);
        getReplyContainer(postContainer, replyId);
         
        if (postContainer.info.officialReply == replyId)
            postContainer.info.officialReply = 0;
        else
            postContainer.info.officialReply = replyId;
        
        emit StatusOfficialReplyChanged(user, postId, replyId);
    }

    /// @notice Change status best reply
    /// @param self The mapping containing all posts
    /// @param user Who called action
    /// @param postId The post where will be change reply status
    /// @param replyId Reply which will change status
    function changeStatusBestReply (
        PostCollection storage self,
        UserLib.UserCollection storage users,
        address user,
        uint256 postId,
        uint16 replyId
    ) internal {
        PostContainer storage postContainer = getPostContainer(self, postId);
        ReplyContainer storage replyContainer = getReplyContainer(postContainer, replyId);

        if (postContainer.info.bestReply == replyId) {
            users.updateUserRating(replyContainer.info.author, -VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.AcceptReply));  
            users.updateUserRating(user, -VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.AcceptedReply));
            postContainer.info.bestReply = 0;
        } else {
            if (postContainer.info.bestReply != 0) {
                ReplyContainer storage oldBestReplyContainer = getReplyContainer(postContainer, replyId);
                users.updateUserRating(oldBestReplyContainer.info.author, -VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.AcceptReply));  
                users.updateUserRating(user, -VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.AcceptedReply));  
            }

            users.updateUserRating(replyContainer.info.author, VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.AcceptReply));  
            users.updateUserRating(user, VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.AcceptedReply));  
            postContainer.info.bestReply = replyId;
        }

        emit StatusBestReplyChanged(user, postId, replyId);
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
        UserLib.UserCollection storage users,
        address user,
        uint256 postId,
        uint16 replyId,
        uint8 commentId,
        bool isUpvote
    ) internal {
        PostContainer storage postContainer = getPostContainer(self, postId);
        PostType postType = postContainer.info.postType;
 
        if (commentId != 0) {
            CommentContainer storage comment = getCommentContainer(postContainer, replyId, commentId);
            voteComment(comment, user, isUpvote);
        } else if (replyId != 0) {
            ReplyContainer storage reply = getReplyContainer(postContainer, replyId);
            voteReply(users, reply, user, postType, isUpvote);
        } else {
            votePost(users, postContainer, user, postType, isUpvote);
        }

        emit ForumItemVoted(user, postId, replyId, commentId, isUpvote);
    }

    // @notice Vote for post
    /// @param users The mapping containing all users
    /// @param postContainer Post where will be change rating
    /// @param votedUser User which voted
    /// @param postType Type post expert, common, tutorial
    /// @param isUpvote Upvote or downvote
    function votePost(
        UserLib.UserCollection storage users,
        PostContainer storage postContainer,
        address votedUser,
        PostType postType,
        bool isUpvote
    ) private {
        require(votedUser != postContainer.info.author, "You can't vote for own post");
        int8 ratingChange = VoteLib.getForumItemRatingChange(votedUser, postContainer.historyVotes, isUpvote, postContainer.votedUsers);

        vote(users, postContainer.info.author, votedUser, postType, isUpvote, ratingChange, TypeContent.Post);
        postContainer.info.rating += ratingChange;
    }
 
    // @notice Vote for reply
    /// @param users The mapping containing all users
    /// @param replyContainer Reply where will be change rating
    /// @param votedUser User which voted
    /// @param postType Type post expert, common, tutorial
    /// @param isUpvote Upvote or downvote
    function voteReply(
        UserLib.UserCollection storage users,
        ReplyContainer storage replyContainer,
        address votedUser,
        PostType postType,
        bool isUpvote
    ) private {
        require(votedUser != replyContainer.info.author, "You can't vote for own reply");
        int8 ratingChange = VoteLib.getForumItemRatingChange(votedUser, replyContainer.historyVotes, isUpvote, replyContainer.votedUsers);
        if (postType == PostType.Tutorial) return;

        vote(users, replyContainer.info.author, votedUser, postType, isUpvote, ratingChange, TypeContent.Reply);
        int32 oldRating = replyContainer.info.rating;
        replyContainer.info.rating += ratingChange;
        int32 newRating = replyContainer.info.rating; // or oldRating + ratingChange gas

        if (replyContainer.info.isFirstReply) {
            if (oldRating < 0 && newRating >= 0) {
                UserLib.updateUserRating(users, replyContainer.info.author, VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.FirstReply));
            } else if (oldRating >= 0 && newRating < 0) {
                UserLib.updateUserRating(users, replyContainer.info.author, -VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.FirstReply));
            }
        }

        if (replyContainer.info.isQuickReply) {
            if (oldRating < 0 && newRating >= 0) {
                UserLib.updateUserRating(users, replyContainer.info.author, VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.QuickReply));
            } else if (oldRating >= 0 && newRating < 0) {
                UserLib.updateUserRating(users, replyContainer.info.author, -VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.QuickReply));
            }
        }
    }

    // @notice Vote for comment
    /// @param commentContainer Comment where will be change rating
    /// @param votedUser User which voted
    /// @param isUpvote Upvote or downvote
    function voteComment(
        CommentContainer storage commentContainer,
        address votedUser,
        bool isUpvote
    ) private {
        require(votedUser != commentContainer.info.author, "You can't vote for own comment");
        //check user
        int8 ratingChange = VoteLib.getForumItemRatingChange(votedUser, commentContainer.historyVotes, isUpvote, commentContainer.votedUsers);
        
        commentContainer.info.rating += ratingChange;
    }

    // @notice Сount users' rating after voting per a reply or post
    /// @param users The mapping containing all users
    /// @param author Author post, reply or comment where voted
    /// @param votedUser User which voted
    /// @param postType Type post expert, common, tutorial
    /// @param isUpvote Upvote or downvote
    /// @param ratingChanged The value shows how the rating of a post or reply has changed.
    /// @param typeContent Type content post, reply or comment
    function vote (
        UserLib.UserCollection storage users,
        address author,
        address votedUser,
        PostType postType,
        bool isUpvote,
        int8 ratingChanged,      //name?
        TypeContent typeContent
    ) private {
       UserRatingChange[] memory usersRating = new UserRatingChange[](2);

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
        UserLib.updateUsersRating(users, usersRating); 
    }

    /// @notice Return post
    /// @param self The mapping containing all posts
    /// @param postId The postId which need find
    function getPostContainer(
        PostCollection storage self,
        uint256 postId
    ) internal view returns (PostContainer storage) {
        PostContainer storage post = self.posts[postId];
        require(!IpfsLib.isEmptyIpfs(post.info.ipfsDoc.hash), "Post does not exist.");
        require(!post.info.isDeleted, "Post has been deleted.");
        
        return post;
    }
    
    /// @notice Return reply
    /// @param postContainer The post where is the reply
    /// @param replyId The replyId which need find
    function getReplyContainer(
        PostContainer storage postContainer,
        uint16 replyId
    ) internal view returns (ReplyContainer storage) {
        ReplyContainer storage replyContainer;
        replyContainer = postContainer.replies[replyId];

        require(!replyContainer.info.isDeleted, "Reply has been deleted.");
        require(!IpfsLib.isEmptyIpfs(replyContainer.info.ipfsDoc.hash), "Reply does not exist.");

        return replyContainer;
    }

    /// @notice Return comment
    /// @param postContainer The post where is the comment
    /// @param parentReplyId The parent reply
    /// @param commentId The commentId which need find
    function getCommentContainer(
        PostContainer storage postContainer,
        uint16 parentReplyId,
        uint8 commentId
    ) private view returns (CommentContainer storage) {
        CommentContainer storage commentContainer;

        if (parentReplyId == 0) {
            commentContainer = postContainer.comments[commentId];  
        } else {
            ReplyContainer storage reply = getReplyContainer(postContainer, parentReplyId);
            commentContainer = reply.comments[commentId];
        }
        require(!commentContainer.info.isDeleted, "Comment has been deleted.");
        require(!IpfsLib.isEmptyIpfs(commentContainer.info.ipfsDoc.hash), "Comment does not exist.");
        return commentContainer;
    }

    /// @notice Return post for unit tests
    /// @param self The mapping containing all posts
    /// @param postId The post which need find
    function getPost(
        PostCollection storage self,
        uint256 postId
    ) internal view returns (Post memory) {        
        return getPostContainer(self, postId).info;
    }

    /// @notice Return reply for unit tests
    /// @param self The mapping containing all posts
    /// @param postId The post where is the reply
    /// @param replyId The reply which need find
    function getReply(
        PostCollection storage self, 
        uint256 postId, 
        uint16 replyId
    ) internal view returns (Reply memory) {
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
    ) internal view returns (Comment memory) {
        PostContainer storage postContainer = self.posts[postId];
        return getCommentContainer(postContainer, parentReplyId, commentId).info;
    }
}