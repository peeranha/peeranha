//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./libraries/PostLib.sol";
import "./base/NativeMetaTransaction.sol";

import "./interfaces/IPeeranhaContent.sol";
import "./interfaces/IPeeranhaUser.sol";
import "./interfaces/IPeeranhaCommunity.sol";


contract PeeranhaContent is IPeeranhaContent, Initializable, NativeMetaTransaction {
    using PostLib for PostLib.Post;
    using PostLib for PostLib.DocumentationPosition;
    using PostLib for PostLib.Reply;
    using PostLib for PostLib.Comment;
    using PostLib for PostLib.PostCollection;

    PostLib.PostCollection posts;
    PostLib.DocumentationPosition documentationPosition;

    function initialize(address peeranhaCommunityContractAddress, address peeranhaUserContractAddress) public initializer {
        posts.peeranhaCommunity = IPeeranhaCommunity(peeranhaCommunityContractAddress);
        posts.peeranhaUser = IPeeranhaUser(peeranhaUserContractAddress);
        __NativeMetaTransaction_init("PeeranhaContent");
    }

    /**
     * @dev Create new post.
     *
     * Requirements:
     *
     * - must be a new post.
     * - must be a community.
     * - must be tags.
    */
    function createPost(uint32 communityId, bytes32 ipfsHash, PostLib.PostType postType, uint8[] memory tags) external override {
        posts.createPost(_msgSender(), communityId, ipfsHash, postType, tags);
    }

    /**
     * @dev Edit post info.
     *
     * Requirements:
     *
     * - must be a post.
     * - must be new info about post
     * - must be a community.
     * - must be tags
    */
    function editPost(uint256 postId, bytes32 ipfsHash, uint8[] memory tags) external override {
        posts.editPost(documentationPosition, _msgSender(), postId, ipfsHash, tags);
    }

    /**
     * @dev delete post.
     *
     * Requirements:
     *
     * - must be a post.
    */
    function deletePost(uint256 postId) external override {
        posts.deletePost(_msgSender(), postId);
    }

    /**
     * @dev Create new reply.
     *
     * Requirements:
     *
     * - must be a post.
     * - must be a new reply. 
    */
    function createReply(uint256 postId, uint16 parentReplyId, bytes32 ipfsHash, bool isOfficialReply) external override {
        posts.createReply(_msgSender(), postId, parentReplyId, ipfsHash, isOfficialReply);
    }

    /**
     * @dev Edit reply.
     *
     * Requirements:
     *
     * - must be a reply.
     * - must be new info about reply.
    */
    function editReply(uint256 postId, uint16 replyId, bytes32 ipfsHash, bool isOfficialReply) external override {
        posts.editReply(_msgSender(), postId, replyId, ipfsHash, isOfficialReply);
    }

    /**
     * @dev Delete reply.
     *
     * Requirements:
     *
     * - must be a reply.
    */
    function deleteReply(uint256 postId, uint16 replyId) external override {
        posts.deleteReply(_msgSender(), postId, replyId);
    }

    /**
     * @dev Create new comment.
     *
     * Requirements:
     *
     * - must be a new comment.
     * - must be a post or a reply.
    */
    function createComment(uint256 postId, uint16 parentReplyId, bytes32 ipfsHash) external override {
        posts.createComment(_msgSender(), postId, parentReplyId, ipfsHash);
    }

    /**
     * @dev Edit comment.
     *
     * Requirements:
     *
     * - must be a comment.
     * - must be new info about reply.
    */
    function editComment(uint256 postId, uint16 parentReplyId, uint8 commentId, bytes32 ipfsHash) external override {
        posts.editComment(_msgSender(), postId, parentReplyId, commentId, ipfsHash);
    }

    /**
     * @dev Delete comment.
     *
     * Requirements:
     *
     * - must be a comment.
    */
    function deleteComment(uint256 postId, uint16 parentReplyId, uint8 commentId) external override {
        posts.deleteComment(_msgSender(), postId, parentReplyId, commentId);
    }

    /**
     * @dev Change status best reply
     *
     * Requirements:
     *
     * - must be a reply.
     * - must be a role ?
    */ 
    function changeStatusBestReply(uint256 postId, uint16 replyId) external override {
        posts.changeStatusBestReply(_msgSender(), postId, replyId);
    }

    /**
     * @dev Vote post or reply or comment
     *
     * Requirements:
     *
     * - must be a post/reply/comment.
    */ 
    function voteItem(uint256 postId, uint16 replyId, uint8 commentId, bool isUpvote) external override {
        posts.voteForumItem(_msgSender(), postId, replyId, commentId, isUpvote);
    }

    /**
     * @dev Change post type
     *
     * Requirements:
     *
     * - must be admin or community moderator.
     * - old and new post type must be Expert or Common type
    */
    function changePostType(uint256 postId, PostLib.PostType postType) external override {
        posts.changePostType(_msgSender(), postId, postType);
    }

    /**
     * @dev Set documentation position
     *
     * Requirements:
     *
     * - must be a community moderator.
    */ 
    function setDocumentationPosition(uint32 communityId, bytes32 ipfsHash) external override {
        documentationPosition.setDocumentationPosition(posts, _msgSender(), communityId, ipfsHash);
    }

    /**
     * @dev create documentation post.
     *
     * Requirements:
     *
     * - must be a new documentation post.
     * - must be a community.
     * - must be tags.
    */
    function createDocumentationPost(uint32 communityId, bytes32 ipfsHash, bytes32 documentationIpfsHash, PostLib.PostType postType, uint8[] memory tags) external {
        posts.createPost(_msgSender(), communityId, ipfsHash, postType, tags);
        documentationPosition.setDocumentationPosition(posts, _msgSender(), communityId, documentationIpfsHash);
    }

    /**
     * @dev Edit documentation post info.
     *
     * Requirements:
     *
     * - must be a documentation post.
     * - must be new info about documentation post
     * - must be a community.
     * - must be tags
    */
    function editDocumentationPost(uint256 postId, bytes32 ipfsHash, bytes32 documentationIpfsHash, uint8[] memory tags) external {
        posts.editPost(documentationPosition, _msgSender(), postId, ipfsHash, tags);
        documentationPosition.editDocumentationPosition(posts, _msgSender(), postId, documentationIpfsHash);
    }

    /**
     * @dev delete documentation post.
     *
     * Requirements:
     *
     * - must be a documentation post.
    */
    function deleteDocumentationPost(uint256 postId) external {
        posts.deletePost(_msgSender(), postId);
        documentationPosition.deleteDocumentationPosition(posts, _msgSender(), postId);
    }

    // check need for prod?
    /**
     * @dev Get a post by index.
     *
     * Requirements:
     *
     * - must be a post.
    */
    function getPost(uint256 postId) external view returns (PostLib.Post memory) {
        return posts.getPost(postId);
    }

    // check need for prod?
    /**
     * @dev Get a reply by index.
     *
     * Requirements:
     *
     * - must be a reply.
    */
    function getReply(uint256 postId, uint16 replyId) external view returns (PostLib.Reply memory) {
        return posts.getReply(postId, replyId);
    }

    // check need for prod?
    /**
     * @dev Get a comment by index.
     *
     * Requirements:
     *
     * - must be a comment.
    */
    function getComment(uint256 postId, uint16 parentReplyId, uint8 commentId) external view returns (PostLib.Comment memory) {
        return posts.getComment(postId, parentReplyId, commentId);
    }

    /**
     * @dev Get information about user's vote.
     *
     * Requirements:
     *
     * - must be a user.
    */
    function getStatusHistory(address user, uint256 postId, uint16 replyId, uint8 commentId) external view returns (int256) {
        return posts.getStatusHistory(user, postId, replyId, commentId);
    }

    /**
     * @dev Get a documentation position.
     *
     * Requirements:
     *
     * - must be a documentation position.
    */
    function getDocumentationPosition(uint32 communityId) external view returns (CommonLib.IpfsHash memory) {
        return documentationPosition.ipfsDoc[communityId];
    }

    function getVersion() public pure returns (uint256) {
        return 1;
    }

    // Used for unit tests
    /*function getVotedUsers(uint256 postId, uint16 replyId, uint8 commentId) public view returns (address[] memory) {
        address[] memory votedUsers;
        PostLib.PostContainer storage postContainer = PostLib.getPostContainer(posts, postId);

        if (commentId != 0)
            votedUsers = PostLib.getCommentContainerSave(postContainer, replyId, commentId).votedUsers;
        else if (replyId != 0)
            votedUsers = PostLib.getReplyContainerSafe(postContainer, replyId).votedUsers;
        else
            votedUsers = postContainer.votedUsers;

        return votedUsers;
    }*/
}