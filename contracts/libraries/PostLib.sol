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
        uint8 propertyCount;
    }

    struct Reply {
        Content content;
        mapping(uint16 => Reply) replies;
        mapping(uint8 => Comment) comments;
        mapping(uint8 => bytes32) properties;
        uint16 replyCount;
        uint8 commentCount;
        uint8 propertyCount;
        bool officialReply;
    }

    struct Post {
        Content content;
        mapping(uint16 => Reply) replies;
        mapping(uint8 => Comment) comments;
        mapping(uint8 => bytes32) properties;
        //CommunityLib.Tag[] tags;
        uint16 replyCount;
        uint8 commentCount;
        uint8 propertyCount;
        uint8 communityId;
    }

    struct PostCollection {
        mapping(uint32 => Post) posts;    // uint32?
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

        Post storage post = self.posts[++self.postCount];
        post.content.ipfsDoc.hash = ipfsHash;
        post.content.author = user;
        post.content.postTime = uint32(block.timestamp);
        post.communityId = communityId;
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
        Post storage post = findPost(self, postId);
        
        ///
        //update user statistic + rating
        ///
        Reply storage reply;
        if (path.length == 0) {
            reply = post.replies[++post.replyCount];
        } else {
            reply = findReply(post, path);
            reply = reply.replies[++reply.replyCount]; 
        }

        reply.content.author = user;
        reply.content.ipfsDoc.hash = ipfsHash;
        reply.content.postTime = uint32(block.timestamp);
        if (officialReply)
            reply.officialReply = officialReply;

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
        Post storage post = findPost(self, postId);

        Content storage comment;
        if (path.length == 0) {
            comment = post.comments[++post.commentCount].content;  
        } else {
            Reply storage reply = findReply(post, path);
            comment = reply.comments[++reply.commentCount].content;
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

    function editPost(
        PostCollection storage self,
        address user,
        uint32 postId,
        uint8 communityId,
        bytes32 ipfsHash
        //CommunityLib.Tag[] memory tags
    ) internal {
        IpfsLib.checkIpfs(ipfsHash, "Wrong ipfsHash.");
        Post storage post = findPost(self, postId);
        
        if(post.communityId != communityId)
            post.communityId = communityId;
        if(post.content.ipfsDoc.hash != ipfsHash)
            post.content.ipfsDoc.hash = ipfsHash;
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

    function editReply(
        PostCollection storage self,
        address user,
        uint32 postId,
        uint16[] memory path,
        uint16 replyId,
        bool officialReply,
        bytes32 ipfsHash
    ) internal {
        IpfsLib.checkIpfs(ipfsHash, "Wrong ipfsHash.");
        Post storage post = findPost(self, postId);

        Reply storage reply;
        if (path.length == 0) {
            reply = post.replies[replyId];  
        } else {
            reply = findReply(post, path);
            reply = reply.replies[replyId];
        }

        IpfsLib.checkIpfs(reply.content.ipfsDoc.hash, "Reply does not exist.");
        require(!reply.content.isDeleted, "Reply has been deleted.");

        if (reply.content.ipfsDoc.hash != ipfsHash)
            reply.content.ipfsDoc.hash = ipfsHash;
        if (reply.officialReply != officialReply)
            reply.officialReply = officialReply; 
    }

    /// @notice Edit comment
    /// @param self The mapping containing all posts
    /// @param user Author of the comment
    /// @param postId Post where the comment will be post
    /// @param path The path where the comment will be post
    /// @param commentId The comment which will be change
    /// @param ipfsHash IPFS hash of document with reply information

    function editComment(    //LAST MODIFIED?
        PostCollection storage self,
        address user,
        uint32 postId,
        uint16[] memory path,
        uint8 commentId,
        bytes32 ipfsHash
    ) internal {
        IpfsLib.checkIpfs(ipfsHash, "Wrong ipfsHash.");
        Post storage post = findPost(self, postId);

        Comment storage comment = findComment(post, path, commentId);
        if (comment.content.ipfsDoc.hash != ipfsHash)
            comment.content.ipfsDoc.hash = ipfsHash;
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
        Post storage post = findPost(self, postId);

        require(!post.content.isDeleted, "Reply has already deleted.");
        IpfsLib.checkIpfs(post.content.ipfsDoc.hash, "Reply does not exist.");
        post.content.isDeleted = true;

        ///
        // -rating
        ///
    
        for (uint16 i = 0; i < post.replyCount; i++) {
            if (post.replies[i].content.ipfsDoc.hash == bytes32(0x0) || post.replies[i].content.isDeleted)
                continue;
            Reply storage localReply = post.replies[i];
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
        Post storage post = findPost(self, postId);

        Reply storage reply;
        if (path.length == 0) {
            reply = post.replies[replyId];
        } else {
            reply = reply = findReply(post, path);
            reply = reply.replies[replyId];
        }

        require(!reply.content.isDeleted, "Reply has already deleted.");
        IpfsLib.checkIpfs(reply.content.ipfsDoc.hash, "Reply does not exist.");
        reply.content.isDeleted = true;
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
        Post storage post = findPost(self, postId);
        Comment storage comment = findComment(post, path, commentId);

        require(!comment.content.isDeleted, "Reply has already deleted.");
        IpfsLib.checkIpfs(comment.content.ipfsDoc.hash, "Reply does not exist.");
        comment.content.isDeleted = true;
        //update user statistic
    }

    function changeStatusOfficialAnswer(
        PostCollection storage self,
        uint32 postId,
        uint16[] memory path,
        uint16 replyId,
        bool officialReply
    ) internal {
        // check permistion
        Post storage post = findPost(self, postId);

        Reply storage reply;
        if (path.length == 0) {
            reply = post.replies[replyId];
        } else {
            reply = reply = findReply(post, path);
            reply = reply.replies[replyId];
        }
         
        if (reply.officialReply != officialReply)
            reply.officialReply = officialReply;
    }

    function findPost(
        PostCollection storage self,
        uint32 postId
    ) internal returns (Post storage) {
        Post storage post = self.posts[postId];
        IpfsLib.checkIpfs(post.content.ipfsDoc.hash, "Post does not exist.");
        require(!post.content.isDeleted, "Post has been deleted.");
        
        return post;
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
            require(reply.content.ipfsDoc.hash != bytes32(0x0), "Reply does not exist.");
            require(!reply.content.isDeleted, "Reply has been deleted.");
        }
        
        return reply;
    }

    function findComment(
        Post storage post,
        uint16[] memory path,
        uint8 commentId
    ) private returns (Comment storage) {
        Comment storage comment;

        if (path.length == 0) {
            comment = post.comments[commentId];  
        } else {
            Reply storage reply = findReply(post, path);
            comment = reply.comments[commentId];
        }
        require(!comment.content.isDeleted, "Comment has been deleted.");
        IpfsLib.checkIpfs(comment.content.ipfsDoc.hash, "Comment does not exis.");

        return comment;
    }

    function getPost(       //only unit test
        PostCollection storage self,
        uint32 postId
    ) internal view returns (Content storage) {        
        return self.posts[postId].content;
    }

    function getReply(      //only unit test
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

    function getComment(        //only unit test
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
}