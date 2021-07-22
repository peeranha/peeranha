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

    enum TypePost { ExpertPost, CommonPost, Tutorial }
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
    }

    struct Reply {
        IpfsLib.IpfsHash ipfsDoc;
        address author;
        int32 rating;
        uint32 postTime;
        uint16 replyCount;
        uint8 commentCount;
        uint8 propertyCount;

        bool officialReply;
        bool isDeleted;
    }

    struct ReplyContainer {
        Reply info;
        mapping(uint16 => ReplyContainer) replies;
        mapping(uint8 => CommentContainer) comments;
        mapping(uint8 => bytes32) properties;
        mapping(address => int256) historyVotes;
    }

    struct Post {
        uint8[] tags;
        IpfsLib.IpfsHash ipfsDoc;
        TypePost typePost;
        address author;
        int32 rating;
        uint32 postTime;
        uint32 communityId;

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
    }

    struct PostCollection {
        mapping(uint256 => PostContainer) posts;
        uint256 postCount;
    }

    event PostCreated(address user, uint32 communityId, uint256 postId, bytes32 ipfsHash);
    event ReplyCreated(address user, uint256 postId, uint16[] path, uint16 replyId, bytes32 ipfsHash);
    event CommentCreated(address user, uint256 postId, uint16[] path, uint8 commentId, bytes32 ipfsHash);
    event PostEdited(address user, uint32 communityId, uint256 postId, bytes32 ipfsHash);
    event ReplyEdited(address user, uint256 postId, uint16[] path, uint16 replyId, bytes32 ipfsHash);
    event CommentEdited(address user, uint256 postId, uint16[] path, uint8 commentId, bytes32 ipfsHash);
    event PostDeleted(address user, uint256 postId);
    event ReplyDeleted(address user, uint256 postId, uint16[] path, uint16 replyId);
    event CommentDeleted(address user, uint256 postId, uint16[] path, uint8 commentId);
    event StatusOfficialAnswerChanged(address user, uint256 postId, uint16[] path, uint16 replyId, bool flagOfficialReply);
    event ForumItemVoted(address user, uint256 postId, uint16[] path, uint16 replyId, uint8 commentId, bool isUpvote);

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
        uint8[] memory tags
    ) internal {
        require(IpfsLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");
        require(!bool(tags.length > 0), "Invalid tags size.");
        ///
        //check community, tags
        ///

        PostContainer storage post = self.posts[++self.postCount];
        post.info.ipfsDoc.hash = ipfsHash;
        post.info.author = user;
        post.info.postTime = CommonLib.getTimestamp();
        post.info.communityId = communityId;
        post.info.tags = tags;
        emit PostCreated(user, communityId, self.postCount, ipfsHash);
    }

    /// @notice Post reply
    /// @param self The mapping containing all posts
    /// @param user Author of the reply
    /// @param postId post where the reply will be post
    /// @param path The path where the reply will be post 
    /// @param ipfsHash IPFS hash of document with reply information
    /// @param officialReply Flag is showing "official reply" or not
    function createReply(
        PostCollection storage self,
        address user,
        uint256 postId,
        uint16[] memory path,
        bytes32 ipfsHash,
        bool officialReply
    ) internal {
        require(IpfsLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");
        PostContainer storage post = getPostContainer(self, postId);
        
        ///
        //update user statistic + rating
        ///
        ReplyContainer storage reply;
        if (path.length == 0) {
            reply = post.replies[++post.info.replyCount];
        } else {
            reply = getParentReply(post, path);
            reply = reply.replies[++reply.info.replyCount]; 
        }

        reply.info.author = user;
        reply.info.ipfsDoc.hash = ipfsHash;
        reply.info.postTime = CommonLib.getTimestamp();
        if (officialReply)
            reply.info.officialReply = officialReply;

        ///
        // first reply / 15min
        ///

        emit ReplyCreated(user, postId, path, reply.info.replyCount, ipfsHash);
    }

    /// @notice Post comment
    /// @param self The mapping containing all posts
    /// @param user Author of the comment
    /// @param postId post where the comment will be post
    /// @param path The path where the comment will be post 
    /// @param ipfsHash IPFS hash of document with reply information
    function createComment(
        PostCollection storage self,
        address user,
        uint256 postId,
        uint16[] memory path,
        bytes32 ipfsHash
    ) internal {
        require(IpfsLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");
        PostContainer storage post = getPostContainer(self, postId);

        Comment storage comment;
        uint8 commentId;
        if (path.length == 0) {
            commentId = ++post.info.commentCount;
            comment = post.comments[commentId].info;  
        } else {
            ReplyContainer storage reply = getParentReply(post, path);
            commentId = ++reply.info.commentCount;
            comment = reply.comments[commentId].info;
        }

        comment.author = user;
        comment.ipfsDoc.hash = ipfsHash;
        comment.postTime = CommonLib.getTimestamp();

        emit CommentCreated(user, postId, path, commentId, ipfsHash);
    }

    /// @notice Edit post
    /// @param self The mapping containing all posts
    /// @param user Author of the comment
    /// @param postId post where the comment will be post
    /// @param ipfsHash IPFS hash of document with reply information
    function editPost(                                                  //LAST MODIFIED?
        PostCollection storage self,
        address user,
        uint256 postId,
        uint32 communityId,
        bytes32 ipfsHash,
        uint8[] memory tags
    ) internal {
        PostContainer storage post = getPostContainer(self, postId);
        
        if(communityId != 0 && post.info.communityId != communityId)
            post.info.communityId = communityId;
        if(!IpfsLib.isEmptyIpfs(ipfsHash) && post.info.ipfsDoc.hash != ipfsHash)
            post.info.ipfsDoc.hash = ipfsHash;
        if (tags.length > 0)
            post.info.tags = tags;

        emit PostEdited(user, communityId, postId, ipfsHash);
    }

    /// @notice Edit reply
    /// @param self The mapping containing all posts
    /// @param user Author of the comment
    /// @param postId post where the comment will be post
    /// @param path The path where the comment will be post 
    /// @param replyId The reply which will be change
    /// @param ipfsHash IPFS hash of document with reply information
    function editReply(                                                         //LAST MODIFIED?
        PostCollection storage self,
        address user,
        uint256 postId,
        uint16[] memory path,
        uint16 replyId,
        bytes32 ipfsHash
    ) internal {
        require(IpfsLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");
        PostContainer storage post = getPostContainer(self, postId);
        ReplyContainer storage reply = getReplyContainer(post, path, replyId);

        if (reply.info.ipfsDoc.hash != ipfsHash)
            reply.info.ipfsDoc.hash = ipfsHash;
        
        emit ReplyEdited(user, postId, path, replyId, ipfsHash);
    }

    /// @notice Edit comment
    /// @param self The mapping containing all posts
    /// @param user Author of the comment
    /// @param postId Post where the comment will be post
    /// @param path The path where the comment will be post
    /// @param commentId The comment which will be change
    /// @param ipfsHash IPFS hash of document with reply information
    function editComment(                                           //LAST MODIFIED?
        PostCollection storage self,
        address user,
        uint256 postId,
        uint16[] memory path,
        uint8 commentId,
        bytes32 ipfsHash
    ) internal {
        require(IpfsLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");
        PostContainer storage post = getPostContainer(self, postId);
        CommentContainer storage comment = getCommentContainer(post, path, commentId);

        if (comment.info.ipfsDoc.hash != ipfsHash)
            comment.info.ipfsDoc.hash = ipfsHash;
        
        emit CommentEdited(user, postId, path, commentId, ipfsHash);
    }

    /// @notice Delete post
    /// @param self The mapping containing all posts
    /// @param user User which deletes post
    /// @param postId Post which be delete
    function deletePost(
        PostCollection storage self,
        address user,
        uint256 postId
    ) internal {
        PostContainer storage post = getPostContainer(self, postId);

        post.info.isDeleted = true;

        ///
        // -rating
        ///
    
        for (uint16 i; i < post.info.replyCount; i++) {
            if (post.replies[i].info.ipfsDoc.hash == bytes32(0x0) || post.replies[i].info.isDeleted)
                continue;
            ReplyContainer storage localReply = post.replies[i];
            ///
            // -rating
            ///
        }

        emit PostDeleted(user, postId);
    }

    /// @notice Delete reply
    /// @param self The mapping containing all posts
    /// @param user User which deletes reply
    /// @param postId post where will be deleted reply
    /// @param path The path where the reply will be deleted
    /// @param replyId reply which will be deleted
    function deleteReply(
        PostCollection storage self,
        address user,
        uint256 postId,
        uint16[] memory path,
        uint16 replyId
    ) internal {
        /*
        check author
        */
        PostContainer storage post = getPostContainer(self, postId);
        ReplyContainer storage reply = getReplyContainer(post, path, replyId);

        reply.info.isDeleted = true;

        emit ReplyDeleted(user, postId, path, replyId);
    }

    /// @notice Delete comment
    /// @param self The mapping containing all posts
    /// @param user User which deletes comment
    /// @param postId Post where will be deleted сщььуте
    /// @param path The path where the reply will be deleted
    /// @param commentId comment which will be deleted
    function deleteComment(
        PostCollection storage self,
        address user,
        uint256 postId,
        uint16[] memory path,
        uint8 commentId
    ) internal {
        PostContainer storage post = getPostContainer(self, postId);
        CommentContainer storage comment = getCommentContainer(post, path, commentId);

        comment.info.isDeleted = true;
        //update user statistic

        emit CommentDeleted(user, postId, path, commentId);
    }

    /// @notice Change status official answer
    /// @param self The mapping containing all posts
    /// @param user Who called action
    /// @param postId Post where will be change reply status
    /// @param path The path where the reply will be change status
    /// @param replyId Reply which will change status
    /// @param officialReply Flag swows reply's status
    function changeStatusOfficialAnswer(
        PostCollection storage self,
        address user,
        uint256 postId,
        uint16[] memory path,
        uint16 replyId,
        bool officialReply
    ) internal {
        // check permistion
        PostContainer storage post = getPostContainer(self, postId);
        ReplyContainer storage reply = getReplyContainer(post, path, replyId);
         
        if (reply.info.officialReply != officialReply)
            reply.info.officialReply = officialReply;
        
        emit StatusOfficialAnswerChanged(user, postId, path, replyId, officialReply);
    }

    /// @notice Vote for post, reply or comment
    /// @param self The mapping containing all posts
    /// @param users The mapping containing all users
    /// @param user Who called action
    /// @param postId Post where will be change rating
    /// @param path The path where the reply will be change rating
    /// @param replyId Reply which will be change rating
    /// @param commentId Comment which will be change rating
    /// @param isUpvote Upvote or downvote
    function voteForumItem(
        PostCollection storage self,
        UserLib.UserCollection storage users,
        address user,
        uint256 postId,
        uint16[] memory path,
        uint16 replyId,
        uint8 commentId,
        bool isUpvote
    ) internal {
        PostContainer storage post = getPostContainer(self, postId);
        TypePost typePost = post.info.typePost;
 
        if (commentId != 0) {
            CommentContainer storage comment = getCommentContainer(post, path, commentId);
            voteComment(users, comment, user, typePost, isUpvote);
        } else if (replyId != 0) {
            ReplyContainer storage reply = getReplyContainer(post, path, replyId);
            voteReply(users, reply, user, typePost, isUpvote);
        } else {
            votePost(users, post, user, typePost, isUpvote);
        }

        emit ForumItemVoted(user, postId, path, replyId, commentId, isUpvote);
    }

    function votePost(
        UserLib.UserCollection storage users,
        PostContainer storage post,
        address votedUser,
        TypePost typePost,
        bool isUpvote
    ) private {
        require(votedUser != post.info.author, "You can't vote for own post");

        int8 changeRating = VoteLib.getForumItemRatingChange(votedUser, post.historyVotes, isUpvote);
        if (isUpvote) {
            users.updateRating(post.info.author, VoteLib.getUserRatingChangeForPostAction(typePost, VoteLib.ResourceAction.Upvoted) * changeRating);
        } else {
            users.updateRating(post.info.author, VoteLib.getUserRatingChangeForPostAction(typePost, VoteLib.ResourceAction.Downvoted) * changeRating);
            users.updateRating(post.info.author, VoteLib.getUserRatingChangeForPostAction(typePost, VoteLib.ResourceAction.Downvote) * changeRating);
        }

        post.info.rating += changeRating;
    }
 
    function voteReply(
        UserLib.UserCollection storage users,
        ReplyContainer storage reply,
        address votedUser,
        TypePost typePost,
        bool isUpvote
    ) private {
        require(votedUser != reply.info.author, "You can't vote for own reply");

        int8 changeRating = VoteLib.getForumItemRatingChange(votedUser, reply.historyVotes, isUpvote);
        if (isUpvote) {
            users.updateRating(reply.info.author, VoteLib.getUserRatingChangeForReplyAction(typePost, VoteLib.ResourceAction.Upvoted) * changeRating);
        } else {
            users.updateRating(reply.info.author, VoteLib.getUserRatingChangeForReplyAction(typePost, VoteLib.ResourceAction.Downvoted) * changeRating);
            users.updateRating(votedUser, VoteLib.getUserRatingChangeForReplyAction(typePost, VoteLib.ResourceAction.Downvote) * changeRating);
        }

        reply.info.rating += changeRating;
    }

    function voteComment(
        UserLib.UserCollection storage users,
        CommentContainer storage comment,
        address votedUser,
        TypePost typePost,
        bool isUpvote
    ) private {
        require(votedUser != comment.info.author, "You can't vote for own comment");

        int8 changeRating = VoteLib.getForumItemRatingChange(votedUser, comment.historyVotes, isUpvote);
        comment.info.rating += changeRating;
    }


    /// @notice Return post
    /// @param self The mapping containing all posts
    /// @param postId The postId which need find
    function getPostContainer(
        PostCollection storage self,
        uint256 postId
    ) internal view returns (PostContainer storage) {
        PostContainer storage post = self.posts[postId];
        require(IpfsLib.isEmptyIpfs(post.info.ipfsDoc.hash), "Post does not exist.");
        require(!post.info.isDeleted, "Post has been deleted.");
        
        return post;
    }

    /// @notice Return parent reply
    /// @param post Post where is the reply
    /// @param path The path to parent reply
    function getParentReply(
        PostContainer storage post,
        uint16[] memory path
    ) private view returns (ReplyContainer storage) {
        ReplyContainer storage reply;

        uint256 lenght = path.length;
        reply = post.replies[path[0]];
        require(IpfsLib.isEmptyIpfs(reply.info.ipfsDoc.hash), "Reply does not exist.");
        require(!reply.info.isDeleted, "Reply has been deleted.");
        for(uint256 i = 1; i < lenght; i++) {
            reply = reply.replies[path[i]];
            require(IpfsLib.isEmptyIpfs(reply.info.ipfsDoc.hash), "Reply does not exist.");
            require(!reply.info.isDeleted, "Reply has been deleted.");
        }
        
        return reply;
    }

    /// @notice Return reply
    /// @param post Post where is the reply
    /// @param path The path to parent reply
    /// @param replyId The replyId which need find
    function getReplyContainer(
        PostContainer storage post,
        uint16[] memory path,
        uint16 replyId
    ) internal view returns (ReplyContainer storage) {
        ReplyContainer storage reply;

        if (path.length == 0) {
            reply = post.replies[replyId];
        } else {
            reply = reply = getParentReply(post, path);
            reply = reply.replies[replyId];
        }

        require(!reply.info.isDeleted, "Reply has been deleted.");
        require(IpfsLib.isEmptyIpfs(reply.info.ipfsDoc.hash), "Reply does not exist.");

        return reply;
    }

    /// @notice Return comment
    /// @param post Post where is the comment
    /// @param path The path to parent reply
    /// @param commentId The commentId which need find
    function getCommentContainer(
        PostContainer storage post,
        uint16[] memory path,
        uint8 commentId
    ) private view returns (CommentContainer storage) {
        CommentContainer storage comment;

        if (path.length == 0) {
            comment = post.comments[commentId];  
        } else {
            ReplyContainer storage reply = getParentReply(post, path);
            comment = reply.comments[commentId];
        }
        require(!comment.info.isDeleted, "Comment has been deleted.");
        require(IpfsLib.isEmptyIpfs(comment.info.ipfsDoc.hash), "Comment does not exist.");
        return comment;
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
    /// @param postId Post where is the reply
    /// @param path The path to parent reply
    /// @param replyId The reply which need find
    function getReply(
        PostCollection storage self, 
        uint256 postId, 
        uint16[] memory path, 
        uint16 replyId
    ) internal view returns (Reply memory) {
        PostContainer storage post = self.posts[postId];
        ReplyContainer storage reply;

        if (path.length == 0) {
            reply = post.replies[replyId];
        } else {
            reply = reply = getParentReply(post, path);
            reply = reply.replies[replyId];
        }
        return reply.info;

    }

    /// @notice Return comment for unit tests
    /// @param self The mapping containing all posts
    /// @param postId Post where is the reply
    /// @param path The path to parent reply
    /// @param commentId The comment which need find
    function getComment(
        PostCollection storage self, 
        uint256 postId, 
        uint16[] memory path, 
        uint8 commentId
    ) internal view returns (Comment memory) {
        PostContainer storage post = self.posts[postId];
        CommentContainer storage comment;

        if (path.length == 0) {
            comment = post.comments[commentId];  
        } else {
            ReplyContainer storage reply = getParentReply(post, path);
            comment = reply.comments[commentId];
        }

        return comment.info;
    }
}