//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./libraries/PostLib.sol";
import "./libraries/CommonLib.sol";
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
    PostLib.DocumentationTree documentationTree;
    PostLib.TranslationCollection translations;

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
    function createPost(address user, uint32 communityId, bytes32 ipfsHash, PostLib.PostType postType, uint8[] memory tags) external override {
        posts.peeranhaUser.dispatcherCheck(user, _msgSender());
        posts.createPost(user, communityId, ipfsHash, postType, tags);
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
     * - if not author of the post must be protocol admin or community moderator
    */
    function editPost(address user, uint256 postId, bytes32 ipfsHash, uint8[] memory tags, uint32 communityId, PostLib.PostType postType) external override {
        posts.peeranhaUser.dispatcherCheck(user, _msgSender());
        posts.editPost(user, postId, ipfsHash, tags, communityId, postType);
    }

    /**
     * @dev delete post.
     *
     * Requirements:
     *
     * - must be a post.
    */
    function deletePost(address user, uint256 postId) external override {
        posts.peeranhaUser.dispatcherCheck(user, _msgSender());
        posts.deletePost(user, postId);
    }

    /**
     * @dev Create new reply.
     *
     * Requirements:
     *
     * - must be a post.
     * - must be a new reply. 
    */
    function createReply(address user, uint256 postId, uint16 parentReplyId, bytes32 ipfsHash, bool isOfficialReply) external override {
        posts.peeranhaUser.dispatcherCheck(user, _msgSender());
        posts.createReply(user, postId, parentReplyId, ipfsHash, isOfficialReply);
    }

    /**
     * @dev Edit reply.
     *
     * Requirements:
     *
     * - must be a reply.
     * - must be new info about reply.
    */
    function editReply(address user, uint256 postId, uint16 replyId, bytes32 ipfsHash, bool isOfficialReply) external override {
        posts.peeranhaUser.dispatcherCheck(user, _msgSender());
        posts.editReply(user, postId, replyId, ipfsHash, isOfficialReply);
    }

    /**
     * @dev Delete reply.
     *
     * Requirements:
     *
     * - must be a reply.
    */
    function deleteReply(address user, uint256 postId, uint16 replyId) external override {
        posts.peeranhaUser.dispatcherCheck(user, _msgSender());
        posts.deleteReply(user, postId, replyId);
    }

    /**
     * @dev Create new reply by bot.
     *
     * Requirements:
     *
     * - must be a post.
     * - must be a new reply. 
     * - must be a bot.
    */
    function createReplyByBot(uint256 postId, bytes32 ipfsHash, CommonLib.MessengerType messengerType, string memory handle) external override {
        posts.createReplyByBot(_msgSender(), postId, ipfsHash, messengerType, handle);
    }

    /**
     * @dev Create new comment.
     *
     * Requirements:
     *
     * - must be a new comment.
     * - must be a post or a reply.
    */
    function createComment(address user, uint256 postId, uint16 parentReplyId, bytes32 ipfsHash) external override {
        posts.peeranhaUser.dispatcherCheck(user, _msgSender());
        posts.createComment(user, postId, parentReplyId, ipfsHash);
    }

    /**
     * @dev Edit comment.
     *
     * Requirements:
     *
     * - must be a comment.
     * - must be new info about reply.
    */
    function editComment(address user, uint256 postId, uint16 parentReplyId, uint8 commentId, bytes32 ipfsHash) external override {
        posts.peeranhaUser.dispatcherCheck(user, _msgSender());
        posts.editComment(user, postId, parentReplyId, commentId, ipfsHash);
    }

    /**
     * @dev Delete comment.
     *
     * Requirements:
     *
     * - must be a comment.
    */
    function deleteComment(address user, uint256 postId, uint16 parentReplyId, uint8 commentId) external override {
        posts.peeranhaUser.dispatcherCheck(user, _msgSender());
        posts.deleteComment(user, postId, parentReplyId, commentId);
    }

    /**
     * @dev Change status best reply
     *
     * Requirements:
     *
     * - must be a reply.
     * - must be a role ?
    */ 
    function changeStatusBestReply(address user, uint256 postId, uint16 replyId) external override {
        posts.peeranhaUser.dispatcherCheck(user, _msgSender());
        posts.changeStatusBestReply(user, postId, replyId);
    }

    /**
     * @dev Vote post or reply or comment
     *
     * Requirements:
     *
     * - must be a post/reply/comment.
    */ 
    function voteItem(address user, uint256 postId, uint16 replyId, uint8 commentId, bool isUpvote) external override {
        posts.peeranhaUser.dispatcherCheck(user, _msgSender());
        posts.voteForumItem(user, postId, replyId, commentId, isUpvote);
    }

    /**
     * @dev Create several Translations for post/reply/comment
     *
     * Requirements:
     *
     * - must be a post/reply/comment.
     * - must be admin ot community moderator role.
    */ 
    function createTranslations(address user, uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language[] memory languages, bytes32[] memory ipfsHashs) external override {
        posts.peeranhaUser.dispatcherCheck(user, _msgSender());
        translations.createTranslations(posts, user, postId, replyId, commentId, languages, ipfsHashs);
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
    function editTranslations(address user, uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language[] memory languages, bytes32[] memory ipfsHashs) external override {
        posts.peeranhaUser.dispatcherCheck(user, _msgSender());
        translations.editTranslations(posts, user, postId, replyId, commentId, languages, ipfsHashs);
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
    function deleteTranslations(address user, uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language[] memory languages) external override {
        posts.peeranhaUser.dispatcherCheck(user, _msgSender());
        translations.deleteTranslations(posts, user, postId, replyId, commentId, languages);
    }

    /**
     * @dev Set documentation position
     *
     * Requirements:
     *
     * - must be a community moderator.
    */ 
    function updateDocumentationTree(address user, uint32 communityId, bytes32 documentationTreeIpfsHash) external override {
        posts.peeranhaUser.dispatcherCheck(user, _msgSender());
        documentationTree.updateDocumentationTree(posts, user, communityId, documentationTreeIpfsHash);
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
     * @dev Get a reply property by index.
     *
     * Requirements:
     *
     * - must be a property.
    */
    function getReplyProperty(uint256 postId, uint16 replyId, uint8 propertyId) external view returns (bytes32) {
        return posts.getReplyProperty(postId, replyId, propertyId);
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