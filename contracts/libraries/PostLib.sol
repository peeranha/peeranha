pragma solidity >=0.5.0;
pragma abicoder v2;

import "./IpfsLib.sol";
import "./CommunityLib.sol";
import "hardhat/console.sol";

/// @title PostLib
/// @notice Provides information about operation with posts
/// @dev posts information is stored in the mapping on the main contract
library PostLib  {
    struct Content {
        address author;
        IpfsLib.IpfsHash ipfsDoc;
        int16 rating;
        uint32 postTime;
        bool isDeleted;
    }

    struct Comment {
        Content content;
        mapping(uint8 => bytes32) properties;
        uint8 sizeProperties;
    }

    struct Reply {
        Content content;
        mapping(uint16 => Reply) replies;
        mapping(uint8 => Comment) comments;
        mapping(uint8 => bytes32) properties;
        uint16 sizeReplies;
        uint8 sizeComments;
        uint8 sizeProperties;
        bool officialReply;
    }

    struct Post {
        Content content;
        mapping(uint16 => Reply) replies;
        mapping(uint8 => Comment) comments;
        mapping(uint8 => bytes32) properties;
        //CommunityLib.Tag[] tags;
        uint16 sizeReplies;
        uint8 sizeComments;
        uint8 sizeProperties;
        uint8 communityId;
    }

    struct PostCollection {
        mapping(uint32 => Post) posts;    // uint32?
        uint32 sizePosts;
    }


    /// @notice Publication post
    /// @param self The mapping containing all posts
    /// @param name Author of the post
    /// @param communityId Community where the post will be ask
    /// @param hash IPFS hash of document with post information
    
    function createPost(
        PostCollection storage self,
        address name,
        uint8 communityId, 
        bytes32 hash
        //CommunityLib.Tag[] memory tags
    ) internal {
        ///
        //check community, ipfs, tags
        ///

        Post storage post = self.posts[++self.sizePosts];
        post.content.ipfsDoc.hash = hash;
        post.content.author = name;
        post.content.postTime = uint32(block.timestamp);
        post.communityId = communityId;
        //post.tags = tags;
    }

    /// @notice Post reply
    /// @param self The mapping containing all posts
    /// @param name Author of the reply
    /// @param postId post where the reply will be post
    /// @param officialReply Flag is showing "official reply" or not
    /// @param path The path where the reply will be post 
    /// @param hash IPFS hash of document with reply information
    
    function createReply(
        PostCollection storage self,
        address name,
        uint32 postId,
        bool officialReply,
        uint16[] memory path,
        bytes32 hash
      ) internal {
        ///
        //check ipfs
        ///

        Post storage post = self.posts[postId];
        require(post.content.ipfsDoc.hash != bytes32(0x0), "Post does not exist");
        
        ///
        //update user statistic + rating
        ///
        Reply storage reply;
        if (path.length == 0) {
            reply = post.replies[++post.sizeReplies];
        } else {
            reply = findReply(post, path);
            reply = reply.replies[++reply.sizeReplies]; 
        }

        reply.content.author = name;
        reply.content.ipfsDoc.hash = hash;
        reply.content.postTime = uint32(block.timestamp);
        if (officialReply)
            reply.officialReply = officialReply;

        ///
        // first reply / 15min
        ///
    }

    /// @notice Post comment
    /// @param self The mapping containing all posts
    /// @param name Author of the comment
    /// @param postId post where the comment will be post
    /// @param path The path where the comment will be post 
    /// @param hash IPFS hash of document with reply information

    function createComment(
        PostCollection storage self,
        address name,
        uint32 postId,
        uint16[] memory path,
        bytes32 hash
      ) internal {
        Post storage post = self.posts[postId];
        require(post.content.ipfsDoc.hash != bytes32(0x0), "Post does not exist");

        Content storage comment;
        if (path.length == 0) {
            comment = post.comments[++post.sizeComments].content;  
        } else {
            Reply storage reply = findReply(post, path);
            comment = reply.comments[++reply.sizeComments].content;
        }

        comment.author = name;
        comment.ipfsDoc.hash = hash;
        comment.postTime = uint32(block.timestamp);
    }

    /// @notice Edit post
    /// @param self The mapping containing all posts
    /// @param name Author of the comment
    /// @param postId post where the comment will be post
    /// @param hash IPFS hash of document with reply information

    function editPost(
        PostCollection storage self,
        address name,
        uint32 postId,
        uint8 communityId,
        bytes32 hash
        //CommunityLib.Tag[] memory tags
      ) internal {
        Post storage post = self.posts[postId];
        require(post.content.ipfsDoc.hash != bytes32(0x0), "post does not exist");
        require(!post.content.isDeleted, "Post has been deleted");
        
        if(post.communityId != communityId)
            post.communityId = communityId;
        if(post.content.ipfsDoc.hash != hash)
            post.content.ipfsDoc.hash = hash;
        //if(post.tags != tags)     // error, chech one by one?
        //post.tags = tags;
    }

    /// @notice Edit reply
    /// @param self The mapping containing all posts
    /// @param name Author of the comment
    /// @param postId post where the comment will be post
    /// @param path The path where the comment will be post 
    /// @param replyId The reply which will be change
    /// @param officialReply Flag is showing "official reply" or not
    /// @param hash IPFS hash of document with reply information

    function editReply(
        PostCollection storage self,
        address name,
        uint32 postId,
        uint16[] memory path,
        uint16 replyId,
        bool officialReply,
        bytes32 hash
      ) internal {

        Post storage post = self.posts[postId];
        require(post.content.ipfsDoc.hash != bytes32(0x0), "post does not exist");
        require(!post.content.isDeleted, "Post has been deleted");

        Reply storage reply;
        if (path.length == 0) {
            reply = post.replies[replyId];  
        } else {
            reply = findReply(post, path);
            reply = reply.replies[replyId];
        }

        require(reply.content.ipfsDoc.hash != bytes32(0x0), "Reply does not exist");
        require(!reply.content.isDeleted, "Reply has been deleted");

        if (reply.content.ipfsDoc.hash != hash)
            reply.content.ipfsDoc.hash = hash;
        if (reply.officialReply != officialReply)                          //will check gas?
            reply.officialReply = officialReply;   
    }

    /// @notice Edit comment
    /// @param self The mapping containing all posts
    /// @param name Author of the comment
    /// @param postId Post where the comment will be post
    /// @param path The path where the comment will be post
    /// @param commentId The comment which will be change
    /// @param hash IPFS hash of document with reply information

    function editComment(    //LAST MODIFIED?
        PostCollection storage self,
        address name,
        uint32 postId,
        uint16[] memory path,
        uint8 commentId,
        bytes32 hash
      ) internal {
        Post storage post = self.posts[postId];
        require(post.content.ipfsDoc.hash != bytes32(0x0), "post does not exist");
        require(!post.content.isDeleted, "Post has been deleted");

        Content storage comment;
        if (path.length == 0) {
            comment = post.comments[commentId].content;
        } else {
            Reply storage reply = findReply(post, path);
            comment = reply.comments[commentId].content;
        }

        require(comment.ipfsDoc.hash != bytes32(0x0), "comment does not exist");
        require(!comment.isDeleted, "Comment has been deleted");

        if(comment.ipfsDoc.hash != hash)
            comment.ipfsDoc.hash = hash;
    }

    /// @notice Delete post
    /// @param self The mapping containing all posts
    /// @param name ?
    /// @param postId Post which be delete

    function deletePost(
        PostCollection storage self,
        address name,
        uint32 postId
      ) internal {
        Post storage post = self.posts[postId];     //inside the post
        require(post.content.ipfsDoc.hash != bytes32(0x0), "post does not exist");
        require(!post.content.isDeleted, "Post has already deleted");
        post.content.isDeleted = true;

        ///
        // -rating
        ///
    
        for(uint16 i = 0; i < post.sizeReplies; i++) {
            if(post.replies[i].content.ipfsDoc.hash == bytes32(0x0) || post.replies[i].content.isDeleted)
                continue;
            Reply storage localReply = post.replies[i];

            ///
            // -rating
            ///
        }  
    }

    /// @notice Delete reply
    /// @param self The mapping containing all posts
    /// @param name ?
    /// @param postId post where will be deleted reply
    /// @param path The path where the reply will be deleted
    /// @param replyId reply which will be deleted

    function deleteReply(
        PostCollection storage self,
        address name,
        uint32 postId,
        uint16[] memory path,
        uint16 replyId
      ) internal {
        /*
        check author
        */
        Post storage post = self.posts[postId];
        require(post.content.ipfsDoc.hash != bytes32(0x0), "post does not exist");
        require(!post.content.isDeleted, "Post has been deleted");

        Reply storage reply;
        if (path.length == 0) {
            reply = post.replies[replyId];
        } else {
            reply = reply = findReply(post, path);
            reply = reply.replies[replyId];
        }

        require(reply.content.ipfsDoc.hash != bytes32(0x0), "Reply does not exist.");
        require(!reply.content.isDeleted, "Reply has already deleted");
        reply.content.isDeleted = true;
    }

    /// @notice Delete comment
    /// @param self The mapping containing all posts
    /// @param name ?
    /// @param postId Post where will be deleted сщььуте
    /// @param path The path where the reply will be deleted
    /// @param commentId comment which will be deleted

    function deleteComment(
        PostCollection storage self,
        address name,
        uint32 postId,
        uint16[] memory path,
        uint8 commentId
      ) internal {
        Post storage post = self.posts[postId];
        require(post.content.ipfsDoc.hash != bytes32(0x0), "Post does not exist");
        require(!post.content.isDeleted, "Post has been deleted");

        Content storage comment;
        if (path.length == 0) {
            comment = post.comments[commentId].content;  
        } else {
            Reply storage reply;
            reply = reply = findReply(post, path);
            comment = reply.comments[commentId].content;
        }

        require(comment.ipfsDoc.hash != bytes32(0x0), "comment does not exist");
        require(!comment.isDeleted, "Comment has already deleted");
        comment.isDeleted = true;
        //update user statistic
    }

    function getPostByIndex(
        PostCollection storage self, 
        uint32 index
        ) internal view returns (Content memory) {
        return self.posts[index].content;
    }

    function getReplyByPath(
        PostCollection storage self, 
        uint32 postId, 
        uint16[] memory path, 
        uint16 replyId
        ) internal view returns (Content memory) {
        Post storage post = self.posts[postId];

        Content storage content;
        if (path.length == 0) {
            content = post.replies[replyId].content;
        } else {
            Reply storage reply = findReply(post, path);
            content = reply.replies[replyId].content;
        }

        return content;
    }

    function getCommentByPath(
        PostCollection storage self, 
        uint32 postId, 
        uint16[] memory path, 
        uint8 commentId
        ) internal view returns (Content memory) {
        Post storage post = self.posts[postId];

        Content storage comment;
        if (path.length == 0) {
            comment = post.comments[commentId].content;
        } else {
            Reply storage reply = findReply(post, path);
            comment = reply.comments[commentId].content;
        }

        return comment;
    }

    function findReply(
        Post storage post,
        uint16[] memory path
    ) private view returns (Reply storage) {
        Reply storage reply;

        uint256 lenght = path.length;
        reply = post.replies[path[0]];
        for(uint256 i = 1; i < lenght; i++) {
            reply = reply.replies[path[i]];
            require(reply.content.ipfsDoc.hash != bytes32(0x0), "Reply does not exist");
            require(!reply.content.isDeleted, "Reply has been deleted");
        }
        
        return reply;
    }
}