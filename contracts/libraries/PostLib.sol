pragma solidity >=0.5.0;
pragma abicoder v2;

import "./IpfsLib.sol";
import "./VoteLib.sol";
import "./UserLib.sol";
import "./SecurityLib.sol";

/// @title PostLib
/// @notice Provides information about operation with posts
/// @dev posts information is stored in the mapping on the main contract
library PostLib {
    using UserLib for UserLib.UserCollection;
    uint256 constant DELETE_TIME = 604800;    //7 days       // name??

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
    event ForumItemVoted(address user, uint256 postId, uint16 replyId, uint8 commentId, int8 voteDirection);

    /// @notice Publication post 
    /// @param self The mapping containing all posts
    /// @param userContext All information about users
    /// @param userAddr Author of the post
    /// @param communityId Community where the post will be ask
    /// @param ipfsHash IPFS hash of document with post information
    function createPost(
        PostCollection storage self,
        UserLib.UserContext storage userContext,
        address userAddr,
        uint32 communityId, 
        bytes32 ipfsHash,
        PostType postType,
        uint8[] memory tags
    ) internal {
        SecurityLib.checkRatingAndEnergy(
            userContext.roles,
            UserLib.getUserByAddress(userContext.users, userAddr),
            userAddr,
            userAddr,
            communityId,
            SecurityLib.Action.publicationPost
        );
        require(!IpfsLib.isEmptyIpfs(ipfsHash), "H1");
        require(tags.length > 0, "P1");
        require(postType != PostType.Tutorial, "P2");

        PostContainer storage post = self.posts[++self.postCount];
        post.info.ipfsDoc.hash = ipfsHash;
        post.info.postType = postType;
        post.info.author = userAddr;
        post.info.postTime = CommonLib.getTimestamp();
        post.info.communityId = communityId;
        post.info.tags = tags;

        emit PostCreated(userAddr, communityId, self.postCount);
    }

    /// @notice Post reply
    /// @param self The mapping containing all posts
    /// @param userContext All information about users
    /// @param userAddr Author of the reply
    /// @param postId The post where the reply will be post
    /// @param parentReplyId The reply where the reply will be post
    /// @param ipfsHash IPFS hash of document with reply information
    /// @param isOfficialReply Flag is showing "official reply" or not
    function createReply(
        PostLib.PostCollection storage self,
        UserLib.UserContext storage userContext,
        address userAddr,
        uint256 postId,
        uint16 parentReplyId,
        bytes32 ipfsHash,
        bool isOfficialReply
    ) internal {
        PostLib.PostContainer storage postContainer = PostLib.getPostContainer(self, postId);
        UserLib.User storage user = UserLib.getUserByAddress(userContext.users, userAddr);
        SecurityLib.checkRatingAndEnergy(
            userContext.roles,
            user,
            userAddr,
            postContainer.info.author,
            postContainer.info.communityId,
            SecurityLib.Action.publicationReply
        );
        require(!IpfsLib.isEmptyIpfs(ipfsHash), "H1");
        require(
            parentReplyId == 0 || 
            (postContainer.info.postType != PostLib.PostType.ExpertPost && postContainer.info.postType != PostLib.PostType.CommonPost), 
            "P3"
        ); // unit tests (reply on reply)

        if (postContainer.info.postType == PostLib.PostType.ExpertPost || postContainer.info.postType == PostLib.PostType.CommonPost) {
          uint16 countReplies = uint16(postContainer.info.replyCount);
          
          PostLib.ReplyContainer storage replyContainer;
          for (uint16 i = 1; i <= countReplies; i++) {
            replyContainer = PostLib.getReplyContainer(postContainer, i);
            require(userAddr != replyContainer.info.author, "P4");
          }
        }

        PostLib.ReplyContainer storage replyContainer = postContainer.replies[++postContainer.info.replyCount];
        uint32 timestamp = CommonLib.getTimestamp();
        // if (parentReplyId == 0) {
        //     if (isOfficialReply) {
        //         require((SecurityLib.hasRole(userContext.roles, SecurityLib.getCommunityRole(SecurityLib.COMMUNITY_MODERATOR_ROLE, postContainer.info.communityId), userAddr)), 
        //             "P5");
        //         postContainer.info.officialReply = postContainer.info.replyCount;
        //     }

        //     if (postContainer.info.postType != PostLib.PostType.Tutorial && postContainer.info.author != userAddr) {
        //         if (postContainer.info.replyCount - postContainer.info.deletedReplyCount == 1) {    // unit test
        //             replyContainer.info.isFirstReply = true;
        //             UserLib.updateUserRating(userContext, user, userAddr, VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.FirstReply));
        //         }
        //         if (timestamp - postContainer.info.postTime < CommonLib.QUICK_REPLY_TIME_SECONDS) {
        //             replyContainer.info.isQuickReply = true;
        //             UserLib.updateUserRating(userContext, user, userAddr, VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.QuickReply));
        //         }
        //     }
        // } else {
        //   PostLib.getReplyContainerSafe(postContainer, parentReplyId);
        //   replyContainer.info.parentReplyId = parentReplyId;  
        // }

        // replyContainer.info.author = userAddr;
        // replyContainer.info.ipfsDoc.hash = ipfsHash;
        // replyContainer.info.postTime = timestamp;

        emit ReplyCreated(userAddr, postId, parentReplyId, postContainer.info.replyCount);
    }

    /// @notice Post comment
    /// @param self The mapping containing all posts
    /// @param userContext All information about users
    /// @param userAddr Author of the comment
    /// @param postId The post where the comment will be post
    /// @param parentReplyId The reply where the comment will be post
    /// @param ipfsHash IPFS hash of document with comment information
    function createComment(
        PostLib.PostCollection storage self,
        UserLib.UserContext storage userContext,
        address userAddr,
        uint256 postId,
        uint16 parentReplyId,
        bytes32 ipfsHash
    ) internal {
        PostContainer storage postContainer = getPostContainer(self, postId);
        UserLib.User storage user = UserLib.getUserByAddress(userContext.users, userAddr);
        require(!IpfsLib.isEmptyIpfs(ipfsHash), "H1");

        Comment storage comment;    ///
        uint8 commentId;            // struct ?
        address author;             ///
        if (parentReplyId == 0) {
            commentId = ++postContainer.info.commentCount;
            comment = postContainer.comments[commentId].info;
            author = postContainer.info.author;
        } else {
            ReplyContainer storage replyContainer = getReplyContainerSafe(postContainer, parentReplyId);
            commentId = ++replyContainer.info.commentCount;
            comment = replyContainer.comments[commentId].info;
            author = replyContainer.info.author;
        }
        SecurityLib.checkRatingAndEnergy(
            userContext.roles,
            user,
            userAddr,
            author,
            postContainer.info.communityId, 
            SecurityLib.Action.publicationComment
        );

        comment.author = userAddr;
        comment.ipfsDoc.hash = ipfsHash;
        comment.postTime = CommonLib.getTimestamp();

        emit CommentCreated(userAddr, postId, parentReplyId, commentId);
    }

    /// @notice Vote for post, reply or comment
    /// @param self The mapping containing all posts
    /// @param userContext All information about users
    /// @param userAddr Who called action
    /// @param postId Post where will be change rating
    /// @param replyId Reply which will be change rating
    /// @param commentId Comment which will be change rating
    /// @param isUpvote Upvote or downvote
    function voteForumItem(
        PostCollection storage self,
        UserLib.UserContext storage userContext,
        address userAddr,
        uint256 postId,
        uint16 replyId,
        uint8 commentId,
        bool isUpvote
    ) internal {
        PostContainer storage postContainer = getPostContainer(self, postId);
        PostType postType = postContainer.info.postType;

        int8 voteDirection;
        if (commentId != 0) {
            CommentContainer storage commentContainer = getCommentContainerSave(postContainer, replyId, commentId);
            voteComment(userContext, commentContainer, postContainer.info.communityId, userAddr, isUpvote);

        } else if (replyId != 0) {
            ReplyContainer storage replyContainer = getReplyContainerSafe(postContainer, replyId);
            voteReply(userContext, replyContainer, postContainer.info.communityId, userAddr, postType, isUpvote);

        } else {
            votePost(userContext, postContainer, userAddr, postType, isUpvote);
        }

        emit ForumItemVoted(userAddr, postId, replyId, commentId, voteDirection);
    }

    // @notice Vote for post
    /// @param userContext All information about users
    /// @param postContainer Post where will be change rating
    /// @param votedUser User who voted
    /// @param postType Type post expert, common, tutorial
    /// @param isUpvote Upvote or downvote
    function votePost(
        UserLib.UserContext storage userContext,
        PostContainer storage postContainer,
        address votedUser,
        PostType postType,
        bool isUpvote
    ) internal {
        int32 ratingChange = VoteLib.getForumItemRatingChange(votedUser, postContainer.historyVotes, isUpvote, postContainer.votedUsers);
        SecurityLib.checkRatingAndEnergy(
            userContext.roles, 
            UserLib.getUserByAddress(userContext.users, votedUser),
            votedUser, 
            postContainer.info.author, 
            postContainer.info.communityId, 
            ratingChange > 0 ? SecurityLib.Action.upVotePost : SecurityLib.Action.downVotePost
        );

        vote(userContext, postContainer.info.author, votedUser, postType, isUpvote, ratingChange, TypeContent.Post);
        postContainer.info.rating += ratingChange;
    }
 
    // @notice Vote for reply
    /// @param userContext All information about users
    /// @param replyContainer Reply where will be change rating
    /// @param votedUser User who voted
    /// @param postType Type post expert, common, tutorial
    /// @param isUpvote Upvote or downvote
    function voteReply(
        UserLib.UserContext storage userContext,
        ReplyContainer storage replyContainer,
        uint32 communityId,
        address votedUser,
        PostType postType,
        bool isUpvote
    ) private {
        int32 ratingChange = VoteLib.getForumItemRatingChange(votedUser, replyContainer.historyVotes, isUpvote, replyContainer.votedUsers);
        SecurityLib.checkRatingAndEnergy(
            userContext.roles, 
            UserLib.getUserByAddress(userContext.users, votedUser),
            votedUser, 
            replyContainer.info.author, 
            communityId, 
            ratingChange > 0 ? SecurityLib.Action.upVoteReply : SecurityLib.Action.downVoteReply
        );

        if (postType == PostType.Tutorial) return;

        vote(userContext, replyContainer.info.author, votedUser, postType, isUpvote, ratingChange, TypeContent.Reply);
        int32 oldRating = replyContainer.info.rating;
        replyContainer.info.rating += ratingChange;
        int32 newRating = replyContainer.info.rating; // or oldRating + ratingChange gas

        int32 authorChangeRating;       // - 20k in contract and +200 in action (170k) ?
        if (replyContainer.info.isFirstReply) {
            if (oldRating < 0 && newRating >= 0) {
                authorChangeRating = VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.FirstReply);
            } else if (oldRating >= 0 && newRating < 0) {
                authorChangeRating = -VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.FirstReply);
            }
        }

        if (replyContainer.info.isQuickReply) {
            if (oldRating < 0 && newRating >= 0) {
                authorChangeRating += VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.QuickReply);
            } else if (oldRating >= 0 && newRating < 0) {
                authorChangeRating -= VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.QuickReply);
            }
        }
    }

    // @notice Vote for comment
    /// @param userContext All information about users
    /// @param commentContainer Comment where will be change rating
    /// @param votedUser User who voted
    /// @param isUpvote Upvote or downvote
    function voteComment(
        UserLib.UserContext storage userContext,
        CommentContainer storage commentContainer,
        uint32 communityId,
        address votedUser,
        bool isUpvote
    ) private {
        int32 ratingChange = VoteLib.getForumItemRatingChange(votedUser, commentContainer.historyVotes, isUpvote, commentContainer.votedUsers);
        SecurityLib.checkRatingAndEnergy(
            userContext.roles, 
            UserLib.getUserByAddress(userContext.users, votedUser),
            votedUser, 
            commentContainer.info.author, 
            communityId, 
            ratingChange > 0 ? SecurityLib.Action.upVoteComment : SecurityLib.Action.downVoteComment
        );
        
        commentContainer.info.rating += ratingChange;
    }

    // @notice Сount users' rating after voting per a reply or post
    /// @param userContext All information about users
    /// @param author Author post, reply or comment where voted
    /// @param votedUser User who voted
    /// @param postType Type post expert, common, tutorial
    /// @param isUpvote Upvote or downvote
    /// @param ratingChanged The value shows how the rating of a post or reply has changed.
    /// @param typeContent Type content post, reply or comment
    function vote (
        UserLib.UserContext storage userContext,
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
        UserLib.updateUsersRating(userContext, usersRating);
    }

    /// @notice Return post
    /// @param self The mapping containing all posts
    /// @param postId The postId which need find
    function getPostContainer(
        PostCollection storage self,
        uint256 postId
    ) internal view returns (PostContainer storage) {
        PostContainer storage post = self.posts[postId];
        require(!IpfsLib.isEmptyIpfs(post.info.ipfsDoc.hash), "H1");
        require(!post.info.isDeleted, "P6");
        
        return post;
    }

    /// @notice Return reply, the reply is not checked on delete one
    /// @param postContainer The post where is the reply
    /// @param replyId The replyId which need find
    function getReplyContainer(
        PostContainer storage postContainer,
        uint16 replyId
    ) internal view returns (ReplyContainer storage) {
        ReplyContainer storage replyContainer = postContainer.replies[replyId];

        require(!IpfsLib.isEmptyIpfs(replyContainer.info.ipfsDoc.hash), "P7");
        return replyContainer;
    }

    /// @notice Return reply, the reply is checked on delete one
    /// @param postContainer The post where is the reply
    /// @param replyId The replyId which need find
    function getReplyContainerSafe(
        PostContainer storage postContainer,
        uint16 replyId
    ) internal view returns (ReplyContainer storage) {
        ReplyContainer storage replyContainer = getReplyContainer(postContainer, replyId);
        require(!replyContainer.info.isDeleted, "P8");

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
    ) internal view returns (CommentContainer storage) {
        CommentContainer storage commentContainer;

        if (parentReplyId == 0) {
            commentContainer = postContainer.comments[commentId];  
        } else {
            ReplyContainer storage reply = getReplyContainer(postContainer, parentReplyId);
            commentContainer = reply.comments[commentId];
        }
        require(!IpfsLib.isEmptyIpfs(commentContainer.info.ipfsDoc.hash), "P9");

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
    ) internal view returns (CommentContainer storage) {
        CommentContainer storage commentContainer = getCommentContainer(postContainer, parentReplyId, commentId);

        require(!commentContainer.info.isDeleted, "P0");
        return commentContainer;
    }

    /// @notice Return post for unit tests
    /// @param self The mapping containing all posts
    /// @param postId The post which need find
    function getPost(
        PostCollection storage self,
        uint256 postId
    ) internal view returns (Post memory) {        
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

    /// @notice Get flag status vote (upvote/dovnvote) for post/reply/comment
    /// @param self The mapping containing all posts
    /// @param userAddr Author of the vote
    /// @param postId The post where need to get flag status
    /// @param replyId The reply where need to get flag status
    /// @param commentId The comment where need to get flag status
    // return value:
    // downVote = -1
    // nothing = 0
    // upVote = 1
    function getStatusHistory(
        PostCollection storage self, 
        address userAddr,
        uint256 postId,
        uint16 replyId,
        uint8 commentId
    ) internal view returns (int256) {
        PostContainer storage postContainer = getPostContainer(self, postId);

        int256 statusHistory;
        if (commentId != 0) {
            CommentContainer storage commentContainer = getCommentContainerSave(postContainer, replyId, commentId);
            statusHistory = commentContainer.historyVotes[userAddr];
        } else if (replyId != 0) {
            ReplyContainer storage replyContainer = getReplyContainerSafe(postContainer, replyId);
            statusHistory = replyContainer.historyVotes[userAddr];
        } else {
            statusHistory = postContainer.historyVotes[userAddr];
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
    ) internal view returns (address[] memory) {
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