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
    using PostLib for PostLib.DocumentationTree;
    using PostLib for PostLib.Reply;
    using PostLib for PostLib.Comment;
    using PostLib for PostLib.PostCollection;
    using PostLib for PostLib.TranslationCollection;

    PostLib.PostCollection posts;
    PostLib.TranslationCollection translations;
    PostLib.DocumentationTree documentationTree;

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
        posts.editPost(_msgSender(), postId, ipfsHash, tags);
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
     * @dev Create translation 
     *
     * Requirements:
     *
     * - must be a post/reply/comment.
     * - must be admin ot community moderator role.
    */ 
    function createTranslation(uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language language, bytes32 ipfsHash) external override {
        translations.createTranslation(posts, _msgSender(), postId, replyId, commentId, language, ipfsHash);
    }

    /**
     * @dev Create several Translations for post/reply/comment
     *
     * Requirements:
     *
     * - must be a post/reply/comment.
     * - must be admin ot community moderator role.
    */ 
    function createTranslations(uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language[] memory languages, bytes32[] memory ipfsHashs) external override {
        translations.createTranslations(posts, _msgSender(), postId, replyId, commentId, languages, ipfsHashs);
    }
    
    /**
     * @dev Edit Translation
     *
     * Requirements:
     *
     * - must be a post/reply/comment.
     * - must be a Translation.
     * - must be admin ot community moderator role.
    */ 
    function editTranslation(uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language language, bytes32 ipfsHash) external override {
        translations.editTranslation(posts, _msgSender(), postId, replyId, commentId, language, ipfsHash);
    }

    /**
     * @dev Edit several Translations for post/reply/comment
     *
     * Requirements:
     *
     * - must be a post/reply/comment.
     * - must be a Translations.
     * - must be admin ot community moderator role.
    */ 
    function editTranslations(uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language[] memory languages, bytes32[] memory ipfsHashs) external override {
        translations.editTranslations(posts, _msgSender(), postId, replyId, commentId, languages, ipfsHashs);
    }
    
    /**
     * @dev Delete Translation
     *
     * Requirements:
     *
     * - must be a post/reply/comment.
     * - must be a Translation.
     * - must be admin ot community moderator role.
    */
    function deleteTranslation(uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language language) external override {
        translations.deleteTranslation(posts, _msgSender(), postId, replyId, commentId, language);
    }

    /**
     * @dev Delete several Translations for post/reply/comment
     *
     * Requirements:
     *
     * - must be a post/reply/comment.
     * - must be a Translation.
     * - must be admin ot community moderator role.
    */
    function deleteTranslations(uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language[] memory languages) external override {
        translations.deleteTranslations(posts, _msgSender(), postId, replyId, commentId, languages);
    }

    /**
     * @dev Set documentation position
     *
     * Requirements:
     *
     * - must be a community moderator.
    */ 
    function updateDocumentationTree(uint32 communityId, bytes32 documentationTreeIpfsHash) external override {
        documentationTree.updateDocumentationTree(posts, _msgSender(), communityId, documentationTreeIpfsHash);
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
    function createDocumentationPost(uint32 communityId, bytes32 ipfsHash, bytes32 documentationTreeIpfsHash, PostLib.PostType postType, uint8[] memory tags) external override {
        posts.createPost(_msgSender(), communityId, ipfsHash, postType, tags);
        documentationTree.updateDocumentationTree(posts, _msgSender(), communityId, documentationTreeIpfsHash);
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
    function editDocumentationPost(uint256 postId, bytes32 ipfsHash, bytes32 documentationTreeIpfsHash, uint8[] memory tags) external override {
        posts.editPost(_msgSender(), postId, ipfsHash, tags);
        documentationTree.updateDocumentationTreeByPost(posts, _msgSender(), postId, documentationTreeIpfsHash);
    }

    /**
     * @dev delete documentation post.
     *
     * Requirements:
     *
     * - must be a documentation post.
    */
    function deleteDocumentationPost(uint256 postId, bytes32 documentationTreeIpfsHash) external override {
        posts.deletePost(_msgSender(), postId);
        documentationTree.updateDocumentationTreeByPost(posts, _msgSender(), postId, documentationTreeIpfsHash);
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
     * @dev Get translation.
     *
     * Requirements:
     *
     * - must be a translation.
    */
    function getTranslation(uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language language) external view returns (PostLib.Translation memory) {
        return translations.getTranslation(postId, replyId, commentId, language);
    }

    /**
     * @dev Get several Translations for post/reply/comment.
     *
     * Requirements:
     *
     * - must be a translation.
    */
    function getTranslations(uint256 postId, uint16 replyId, uint8 commentId) external view returns (PostLib.Translation[] memory) {
        return translations.getTranslations(postId, replyId, commentId);
    }

    /**
     * @dev Get a documentation position.
     *
     * Requirements:
     *
     * - must be a documentation position.
    */
    function getDocumentationTree(uint32 communityId) external view returns (CommonLib.IpfsHash memory) {
        return documentationTree.ipfsDoc[communityId];
    }

    function getVersion() public pure returns (uint256) {
        return 1;
    }

    // Used for unit tests
    /*function getVotedUsers(uint256 postId, uint16 replyId, uint8 commentId) public view returns (address[] memory) {
        address[] memory votedUsers;
        PostLib.PostContainer storage postContainer = PostLib.getPostContainer(posts, postId);

        if (commentId != 0)
            votedUsers = PostLib.getCommentContainerSafe(postContainer, replyId, commentId).votedUsers;
        else if (replyId != 0)
            votedUsers = PostLib.getReplyContainerSafe(postContainer, replyId).votedUsers;
        else
            votedUsers = postContainer.votedUsers;

        return votedUsers;
    }*/
}