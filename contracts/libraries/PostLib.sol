pragma solidity >=0.5.0;
import "./IpfsLib.sol";
import "hardhat/console.sol";

/// @title PostLib
/// @notice Provides information about operation with posts
/// @dev posts information is stored in the mapping on the main contract
library PostLib  {
    struct Content {
        address author;
        IpfsLib.IpfsHash ipfsHash;
        uint16 rating;
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
    /// @param ipfsHash IPFS hash of document with post information
    
    function publicationPost(
        PostCollection storage self,
        address name,
        uint8 communityId, 
        bytes32 ipfsHash   
        //const std::vector<uint32> tags
    ) internal {
        ///
        //check community, ipfs, tags
        ///

        ///
        //update user statistics + rating
        ///

        Post storage post = self.posts[self.sizePosts];
        post.content.ipfsHash.ipfsHash = ipfsHash;
        post.content.author = name;
        post.content.postTime = uint32(block.timestamp);
        post.communityId = communityId;

        self.sizePosts++;

        ///
        //update community statistics
        //update tag statistics
        ///
    }

    /// @notice Post reply
    /// @param self The mapping containing all posts
    /// @param name Author of the reply
    /// @param postId post where the reply will be post
    /// @param officialReply Flag is showing "official reply" or not
    /// @param path The path where the reply will be post 
    /// @param ipfsHash IPFS hash of document with reply information
    
    function publicationReply(
        PostCollection storage self,
        address name,
        uint32 postId,
        bool officialReply,
        uint16[] memory path,
        bytes32 ipfsHash
      ) internal {
        ///
        //check ipfs
        ///

        Post storage post = self.posts[postId];
        require(post.content.ipfsHash.ipfsHash != bytes32(0x0), "Post isn't exist");
        
        ///
        //update user statistic + rating
        ///
        Reply storage reply;
        if (path.length == 0) {
            reply = post.replies[post.sizeReplies++];
        } else {
           uint256 lenght = path.length;
            reply = post.replies[path[0]];
            for(uint256 i = 1; i < lenght; i++) {
                reply = reply.replies[path[i]];
                require(reply.content.ipfsHash.ipfsHash != bytes32(0x0), "Reply isn't exist");
            }
            reply = reply.replies[reply.sizeReplies++]; 
        }

        reply.content.author = name;
        reply.content.ipfsHash.ipfsHash = ipfsHash;
        reply.content.postTime = uint32(block.timestamp);
        if (officialReply)                          //without if?
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
    /// @param ipfsHash IPFS hash of document with reply information

    function publicationComment(
        PostCollection storage self,
        address name,
        uint32 postId,
        uint16[] memory path,
        bytes32 ipfsHash
      ) internal {
        Post storage post = self.posts[postId];
        require(post.content.ipfsHash.ipfsHash != bytes32(0x0), "Post isn't exist");

        Content storage comment;
        if (path.length == 0) {
            comment = post.comments[post.sizeComments++].content;  
        } else {
            uint256 lenght = path.length;
            Reply storage reply = post.replies[path[0]];
            for(uint256 i = 1; i < lenght; i++) {
                reply = reply.replies[path[i]];
                require(reply.content.ipfsHash.ipfsHash != bytes32(0x0), "Reply isn't exist");
            }
            comment = reply.comments[reply.sizeComments++].content;
        }

        comment.author = name;
        comment.ipfsHash.ipfsHash = ipfsHash;
        comment.postTime = uint32(block.timestamp);
    }

    /// @notice Edit post
    /// @param self The mapping containing all posts
    /// @param name Author of the comment
    /// @param postId post where the comment will be post
    /// @param ipfsHash IPFS hash of document with reply information

    function editPost(
        PostCollection storage self,
        address name,
        uint32 postId,
        uint8 communityId,
        // tags
        bytes32 ipfsHash
      ) internal {
        Post storage post = self.posts[postId];
        require(post.content.ipfsHash.ipfsHash != bytes32(0x0), "post isn't exist");
        require(!post.content.isDeleted, "Post has deleted");
        
        post.communityId = communityId;
        post.content.ipfsHash.ipfsHash = ipfsHash;
    }

    /// @notice Edit reply
    /// @param self The mapping containing all posts
    /// @param name Author of the comment
    /// @param postId post where the comment will be post
    /// @param path The path where the comment will be post 
    /// @param replyId The reply which will be change
    /// @param officialReply Flag is showing "official reply" or not
    /// @param ipfsHash IPFS hash of document with reply information

    function editReply(
        PostCollection storage self,
        address name,
        uint32 postId,
        uint16[] memory path,
        uint16 replyId,
        bool officialReply,
        bytes32 ipfsHash
      ) internal {

        Post storage post = self.posts[postId];
        require(post.content.ipfsHash.ipfsHash != bytes32(0x0), "post isn't exist");
        require(!post.content.isDeleted, "Post has deleted");

        Reply storage reply;
        if (path.length == 0) {
            reply = post.replies[replyId];  
        } else {
            uint256 lenght = path.length;
            reply = post.replies[path[0]];
            for(uint256 i = 1; i < lenght; i++) {
                reply = reply.replies[path[i]];
                require(reply.content.ipfsHash.ipfsHash != bytes32(0x0), "Reply isn't exist");
                require(!reply.content.isDeleted, "Reply has deleted");
            }
            reply = reply.replies[replyId];
        }

        require(reply.content.ipfsHash.ipfsHash != bytes32(0x0), "Reply isn't exist");
        require(!reply.content.isDeleted, "Reply has deleted");

        if (reply.content.ipfsHash.ipfsHash != ipfsHash)
            reply.content.ipfsHash.ipfsHash = ipfsHash;
        if (reply.officialReply != officialReply)                          //will check gas?
            reply.officialReply = officialReply;   
    }

    /// @notice Edit comment
    /// @param self The mapping containing all posts
    /// @param name Author of the comment
    /// @param postId Post where the comment will be post
    /// @param path The path where the comment will be post
    /// @param commentId The comment which will be change
    /// @param ipfsHash IPFS hash of document with reply information

    function editComment(    //LAST MODIFIED?
        PostCollection storage self,
        address name,
        uint32 postId,
        uint16[] memory path,
        uint8 commentId,
        bytes32 ipfsHash
      ) internal {
        Post storage post = self.posts[postId];
        require(post.content.ipfsHash.ipfsHash != bytes32(0x0), "post isn't exist");
        require(!post.content.isDeleted, "Post has deleted");

        Content storage comment;
        if (path.length == 0) {
            comment = post.comments[commentId].content;
        } else {
            uint256 lenght = path.length;
            Reply storage reply = post.replies[path[0]];
            for(uint256 i = 1; i < lenght; i++) {
                reply = reply.replies[path[i]];
                require(reply.content.ipfsHash.ipfsHash != bytes32(0x0), "Reply isn't exist");
                require(!reply.content.isDeleted, "Reply has deleted");
            }
            comment = reply.comments[commentId].content;
        }

        require(comment.ipfsHash.ipfsHash != bytes32(0x0), "comment isn't exist");
        require(!comment.isDeleted, "Comment has deleted");

        if(comment.ipfsHash.ipfsHash != ipfsHash)
            comment.ipfsHash.ipfsHash = ipfsHash;
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
        require(post.content.ipfsHash.ipfsHash != bytes32(0x0), "post isn't exist");
        require(!post.content.isDeleted, "Post has already deleted");
        post.content.isDeleted = true;

        ///
        // -rating, update user statistic
        ///

        // for(uint256 i = 0; i < post.sizeComments; i++) {
        //   require(post.comments[i].content.ipfsHash.ipfsHash != bytes32(0x0), "Comment isn't exist");
        //   post.comments[i].content.isDeleted = true;
        //   // update user statistic
        // }
        
        for(uint16 i = 0; i < post.sizeReplies; i++) {
            if(post.replies[i].content.ipfsHash.ipfsHash == bytes32(0x0) || post.replies[i].content.isDeleted)
                continue;
            Reply storage localReply = post.replies[i];

            ///
            // -rating, update user statistic
            ///

            // for(uint256 j = 0; j < localReply.sizeComments; j++) {
            //   require(localReply.comments[j].content.ipfsHash.ipfsHash != bytes32(0x0), "Comment isn't exist");
            //   localReply.comments[j].content.isDeleted = true;
            //   //update user statistic
            // }
            // localReply.content.isDeleted = true;
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
        require(post.content.ipfsHash.ipfsHash != bytes32(0x0), "post isn't exist");
        require(!post.content.isDeleted, "Post has deleted");

        Reply storage reply;
        if (path.length == 0) {
            reply = post.replies[replyId];
        } else {
            uint256 lenght = path.length;
            reply = post.replies[path[0]];
            for(uint256 i = 1; i < lenght; i++) {
                require(reply.content.ipfsHash.ipfsHash != bytes32(0x0), "Reply isn't exist");
                require(!reply.content.isDeleted, "Reply has deleted");
                reply = reply.replies[path[i]];
            }
            reply = reply.replies[replyId];
        }

        require(reply.content.ipfsHash.ipfsHash != bytes32(0x0), "Reply isn't exist.");
        require(!reply.content.isDeleted, "Reply has already deleted");
        reply.content.isDeleted = true;
        // for(uint256 j = 0; j < reply.sizeComments; j++) {
        //   if(reply.comments[j].content.ipfsHash.ipfsHash == bytes32(0x0) || reply.comments[j].content.isDeleted) {
        //     // reply.comments[j].content.isDeleted = true; 
        //     //update user statistic
        //   }
        // }
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
        require(post.content.ipfsHash.ipfsHash != bytes32(0x0), "Post isn't exist");
        require(!post.content.isDeleted, "Post has deleted");

        Content storage comment;
        if (path.length == 0) {
            comment = post.comments[commentId].content;  
        } else {
            Reply storage reply;
            uint256 lenght = path.length;
            reply = post.replies[path[0]];
            for(uint256 i = 1; i < lenght; i++) {
                reply = reply.replies[path[i]];
                require(reply.content.ipfsHash.ipfsHash != bytes32(0x0), "Reply isn't exist");
                require(!reply.content.isDeleted, "Reply has deleted");
            }
            comment = reply.comments[commentId].content;
        }

        require(comment.ipfsHash.ipfsHash != bytes32(0x0), "comment isn't exist");
        require(!comment.isDeleted, "Comment has already deleted");
        comment.isDeleted = true;
        //update user statistic
    }

    function getPostByIndex(PostCollection storage self, uint32 index) internal view returns (Content memory) {
        return self.posts[index].content;
    }

    function getReplyByPath(PostCollection storage self, uint32 postId, uint16[] memory path, uint16 replyId) internal view returns (Content memory) {
        Post storage post = self.posts[postId];

        Content storage content;
        if (path.length == 0) {
            content = post.replies[replyId].content;
        } else {
            uint256 lenght = path.length;
            Reply storage reply = post.replies[path[0]];
            for(uint256 i = 1; i < lenght; i++) { 
                reply = reply.replies[path[i]];
            }
            content = reply.replies[replyId].content;
        }

        return content;
    }

    function getCommentByPath(PostCollection storage self, uint32 postId, uint16[] memory path, uint8 commentId) internal view returns (Content memory) {
        Post storage post = self.posts[postId];

        Content storage comment;
        if (path.length == 0) {
            comment = post.comments[commentId].content;
        } else {
            uint256 lenght = path.length;
            Reply storage reply = post.replies[path[0]];
            for(uint256 i = 1; i < lenght; i++) { 
                reply = reply.replies[path[i]];
            }
            comment = reply.comments[commentId].content;
        }

        return comment;
    }
}