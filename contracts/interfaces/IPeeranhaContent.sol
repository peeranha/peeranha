//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;
pragma abicoder v2;

import "../libraries/PostLib.sol";
import "../libraries/CommonLib.sol";

interface IPeeranhaContent {
    function createPost(address user, uint32 communityId, bytes32 ipfsHash, PostLib.PostType postType, uint8[] memory tags, PostLib.Language language) external;
    function createPostByBot(uint32 communityId, bytes32 ipfsHash, PostLib.PostType postType, uint8[] memory tags, CommonLib.MessengerType messengerType, string memory handle) external;
    function createReply(address user, uint256 postId, uint16 parentReplyId, bytes32 ipfsHash, bool isOfficialReply, PostLib.Language language) external;
    function createReplyByBot(uint256 postId, bytes32 ipfsHash, CommonLib.MessengerType messengerType, string memory handle) external;
    function createComment(address user, uint256 postId, uint16 parentReplyId, bytes32 ipfsHash, PostLib.Language language) external;
    function editPost(address user, uint256 postId, bytes32 ipfsHash, uint8[] memory tags, uint32 communityId, PostLib.PostType postType, PostLib.Language language) external;
    function editReply(address user, uint256 postId, uint16 parentReplyId, bytes32 ipfsHash, bool isOfficialReply, PostLib.Language language) external;
    function editComment(address user, uint256 postId, uint16 parentReplyId, uint8 commentId, bytes32 ipfsHash, PostLib.Language language) external;
    function deletePost(address user, uint256 postId) external;
    function deleteReply(address user, uint256 postId, uint16 replyId) external;
    function deleteComment(address user, uint256 postId, uint16 parentReplyId, uint8 commentId) external;
    function changeStatusBestReply(address user, uint256 postId, uint16 replyId) external;
    function voteItem(address user, uint256 postId, uint16 replyId, uint8 commentId, bool isUpvote) external;
    function updateDocumentationTree(address user, uint32 communityId, bytes32 documentationTreeIpfsHash) external;
    function createTranslations(address user, uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language[] memory languages, bytes32[] memory ipfsHashs) external;
    function editTranslations(address user, uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language[] memory languages, bytes32[] memory ipfsHashs) external;
    function deleteTranslations(address user, uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language[] memory languages) external;
}