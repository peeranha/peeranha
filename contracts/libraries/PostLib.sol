pragma solidity >=0.5.0;
pragma abicoder v2;

import "./IpfsLib.sol";
import "./CommunityLib.sol";
import "hardhat/console.sol";

/// @title PostLib
/// @notice Provides information about operation with posts
/// @dev posts information is stored in the mapping on the main contract
library PostLib  {
    struct Comment {
        IpfsLib.IpfsHash ipfsDoc;
        address author;
        int16 rating;
        uint32 postTime;
        bool isDeleted;

        uint8 propertyCount;
    }

    struct CommentContainer {
        Comment info;
        mapping(uint8 => bytes32) properties;
    }

    struct Reply {
        IpfsLib.IpfsHash ipfsDoc;
        address author;
        int16 rating;
        uint32 postTime;
        bool isDeleted;

        bool officialReply;
        uint16 replyCount;
        uint8 commentCount;
        uint8 propertyCount;
    }

    struct ReplyContainer {
        Reply info;
        mapping(uint16 => ReplyContainer) replies;
        mapping(uint8 => CommentContainer) comments;
        mapping(uint8 => bytes32) properties;
    }

    struct Post {
        CommunityLib.Tag[] tags;

        IpfsLib.IpfsHash ipfsDoc;
        address author;
        int16 rating;
        uint32 postTime;
        bool isDeleted;

        uint8 communityId;
        uint16 replyCount;
        uint8 commentCount;
        uint8 propertyCount;
    }

    struct PostContainer {
        Post info;
        mapping(uint16 => ReplyContainer) replies;
        mapping(uint8 => CommentContainer) comments;
        mapping(uint8 => bytes32) properties;
    }

    struct PostCollection {
        mapping(uint32 => PostContainer) posts;    // uint32?
        uint32 postCount;
    }

    /// @notice Publication post
    /// @param self The mapping containing all posts
    /// @param user Author of the post
    /// @param communityId Community where the post will be ask
    /// @param ipfsHash IPFS hash of document with post information
    function createPost(
        PostCollection storage self,
        address user,
        uint8 communityId, 
        bytes32 ipfsHash
        //CommunityLib.Tag[] memory tags
    ) internal {
        IpfsLib.checkIpfs(ipfsHash, "Wrong ipfsHash.");
        ///
        //check community, tags
        ///

        PostContainer storage post = self.posts[++self.postCount];
        post.info.ipfsDoc.hash = ipfsHash;
        post.info.author = user;
        post.info.postTime = uint32(block.timestamp);
        post.info.communityId = communityId;
        //post.tags = tags;
    }

    /// @notice Post reply
    /// @param self The mapping containing all posts
    /// @param user Author of the reply
    /// @param postId post where the reply will be post
    /// @param officialReply Flag is showing "official reply" or not
    /// @param path The path where the reply will be post 
    /// @param ipfsHash IPFS hash of document with reply information
    function createReply(
        PostCollection storage self,
        address user,
        uint32 postId,
        bool officialReply,
        uint16[] memory path,
        bytes32 ipfsHash
    ) internal {
        IpfsLib.checkIpfs(ipfsHash, "Wrong ipfsHash.");
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
        reply.info.postTime = uint32(block.timestamp);
        if (officialReply)
            reply.info.officialReply = officialReply;

        ///
        // first reply / 15min
        ///
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
        uint32 postId,
        uint16[] memory path,
        bytes32 ipfsHash
    ) internal {
        IpfsLib.checkIpfs(ipfsHash, "Wrong ipfsHash.");
        PostContainer storage post = getPostContainer(self, postId);

        Comment storage comment;
        if (path.length == 0) {
            comment = post.comments[++post.info.commentCount].info;  
        } else {
            ReplyContainer storage reply = getParentReply(post, path);
            comment = reply.comments[++reply.info.commentCount].info;
        }

        comment.author = user;
        comment.ipfsDoc.hash = ipfsHash;
        comment.postTime = uint32(block.timestamp);
    }

    /// @notice Edit post
    /// @param self The mapping containing all posts
    /// @param user Author of the comment
    /// @param postId post where the comment will be post
    /// @param ipfsHash IPFS hash of document with reply information
    function editPost(                                                  //LAST MODIFIED?
        PostCollection storage self,
        address user,
        uint32 postId,
        uint8 communityId,
        bytes32 ipfsHash
        //CommunityLib.Tag[] memory tags
    ) internal {
        IpfsLib.checkIpfs(ipfsHash, "Wrong ipfsHash.");
        PostContainer storage post = getPostContainer(self, postId);
        
        if(post.info.communityId != communityId)
            post.info.communityId = communityId;
        if(post.info.ipfsDoc.hash != ipfsHash)
            post.info.ipfsDoc.hash = ipfsHash;
        //if(post.tags != tags)     // error, chech one by one?
        //post.tags = tags;
    }

    /// @notice Edit reply
    /// @param self The mapping containing all posts
    /// @param user Author of the comment
    /// @param postId post where the comment will be post
    /// @param path The path where the comment will be post 
    /// @param replyId The reply which will be change
    /// @param officialReply Flag is showing "official reply" or not
    /// @param ipfsHash IPFS hash of document with reply information
    function editReply(                                                         //LAST MODIFIED?
        PostCollection storage self,
        address user,
        uint32 postId,
        uint16[] memory path,
        uint16 replyId,
        bool officialReply,
        bytes32 ipfsHash
    ) internal {
        IpfsLib.checkIpfs(ipfsHash, "Wrong ipfsHash.");
        PostContainer storage post = getPostContainer(self, postId);
        ReplyContainer storage reply = getReplyContainer(post, path, replyId);

        if (reply.info.ipfsDoc.hash != ipfsHash)
            reply.info.ipfsDoc.hash = ipfsHash;
        if (reply.info.officialReply != officialReply)
            reply.info.officialReply = officialReply; 
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
        uint32 postId,
        uint16[] memory path,
        uint8 commentId,
        bytes32 ipfsHash
    ) internal {
        IpfsLib.checkIpfs(ipfsHash, "Wrong ipfsHash.");
        PostContainer storage post = getPostContainer(self, postId);
        CommentContainer storage comment = getCommentContainer(post, path, commentId);

        if (comment.info.ipfsDoc.hash != ipfsHash)
            comment.info.ipfsDoc.hash = ipfsHash;
    }

    /// @notice Delete post
    /// @param self The mapping containing all posts
    /// @param user User which deletes post
    /// @param postId Post which be delete
    function deletePost(
        PostCollection storage self,
        address user,
        uint32 postId
    ) internal {
        PostContainer storage post = getPostContainer(self, postId);

        require(!post.info.isDeleted, "Reply has already deleted.");
        IpfsLib.checkIpfs(post.info.ipfsDoc.hash, "Reply does not exist.");
        post.info.isDeleted = true;

        ///
        // -rating
        ///
    
        for (uint16 i = 0; i < post.info.replyCount; i++) {
            if (post.replies[i].info.ipfsDoc.hash == bytes32(0x0) || post.replies[i].info.isDeleted)
                continue;
            ReplyContainer storage localReply = post.replies[i];
            ///
            // -rating
            ///
        }  
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
        uint32 postId,
        uint16[] memory path,
        uint16 replyId
    ) internal {
        /*
        check author
        */
        PostContainer storage post = getPostContainer(self, postId);
        ReplyContainer storage reply = getReplyContainer(post, path, replyId);

        reply.info.isDeleted = true;
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
        uint32 postId,
        uint16[] memory path,
        uint8 commentId
    ) internal {
        PostContainer storage post = getPostContainer(self, postId);
        CommentContainer storage comment = getCommentContainer(post, path, commentId);

        require(!comment.info.isDeleted, "Reply has already deleted.");
        IpfsLib.checkIpfs(comment.info.ipfsDoc.hash, "Reply does not exist.");
        comment.info.isDeleted = true;
        //update user statistic
    }

    /// @notice Change status official answer
    /// @param self The mapping containing all posts
    /// @param user The user who changes reply status
    /// @param postId Post where will be change reply status
    /// @param path The path where the reply will be change status
    /// @param replyId Reply which will change status
    /// @param officialReply Flag swows reply's status
    function changeStatusOfficialAnswer(
        PostCollection storage self,
        address user,
        uint32 postId,
        uint16[] memory path,
        uint16 replyId,
        bool officialReply
    ) internal {
        // check permistion
        PostContainer storage post = getPostContainer(self, postId);
        ReplyContainer storage reply = getReplyContainer(post, path, replyId);
         
        if (reply.info.officialReply != officialReply)
            reply.info.officialReply = officialReply;
    }

    /// @notice Return post
    /// @param self The mapping containing all posts
    /// @param postId The postId which need find
    function getPostContainer(
        PostCollection storage self,
        uint32 postId
    ) internal returns (PostContainer storage) {
        PostContainer storage post = self.posts[postId];
        IpfsLib.checkIpfs(post.info.ipfsDoc.hash, "Post does not exist.");
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
        for(uint256 i = 1; i < lenght; i++) {
            reply = reply.replies[path[i]];
            require(reply.info.ipfsDoc.hash != bytes32(0x0), "Reply does not exist.");
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
    ) internal returns (ReplyContainer storage) {
        ReplyContainer storage reply;

        if (path.length == 0) {
            reply = post.replies[replyId];
        } else {
            reply = reply = getParentReply(post, path);
            reply = reply.replies[replyId];
        }

        require(!reply.info.isDeleted, "Reply has already deleted.");
        IpfsLib.checkIpfs(reply.info.ipfsDoc.hash, "Reply does not exist.");

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
    ) private returns (CommentContainer storage) {
        CommentContainer storage comment;

        if (path.length == 0) {
            comment = post.comments[commentId];  
        } else {
            ReplyContainer storage reply = getParentReply(post, path);
            comment = reply.comments[commentId];
        }
        require(!comment.info.isDeleted, "Comment has been deleted.");
        IpfsLib.checkIpfs(comment.info.ipfsDoc.hash, "Comment does not exis.");

        return comment;
    }

    /// @notice Return post for unit tests
    /// @param self The mapping containing all posts
    /// @param postId The post which need find
    function getPost(
        PostCollection storage self,
        uint32 postId
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
        uint32 postId, 
        uint16[] memory path, 
        uint16 replyId
    ) internal view returns (Reply memory) {
        PostContainer storage post = self.posts[postId];

        Reply storage reply;
        if (path.length == 0) {
            reply = post.replies[replyId].info;
        } else {
            ReplyContainer storage replyParent = getParentReply(post, path);
            reply = replyParent.replies[replyId].info;
        }

        return reply;
    }

    /// @notice Return comment for unit tests
    /// @param self The mapping containing all posts
    /// @param postId Post where is the reply
    /// @param path The path to parent reply
    /// @param commentId The comment which need find
    function getComment(
        PostCollection storage self, 
        uint32 postId, 
        uint16[] memory path, 
        uint8 commentId
    ) internal view returns (Comment memory) {
        PostContainer storage post = self.posts[postId];

        Comment storage comment;
        if (path.length == 0) {
            comment = post.comments[commentId].info;
        } else {
            ReplyContainer storage replyParent = getParentReply(post, path);
            comment = replyParent.comments[commentId].info;
        }

        return comment;
    }
}