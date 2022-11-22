//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;
pragma abicoder v2;

import "../libraries/PostLib.sol";
import "../libraries/CommonLib.sol";

interface IPeeranhaContent {
    function createPost(uint32 communityId, bytes32 ipfsHash, PostLib.PostType postType, uint8[] memory tags, PostLib.Language language) external;
    function createReply(uint256 postId, uint16 parentReplyId, bytes32 ipfsHash, bool isOfficialReply, PostLib.Language language) external;
    function createReplyByBot(uint256 postId, bytes32 ipfsHash, CommonLib.MessengerType messengerType, string memory handle) external;
    function createComment(uint256 postId, uint16 parentReplyId, bytes32 ipfsHash, PostLib.Language language) external;
    function editPost(uint256 postId, bytes32 ipfsHash, uint8[] memory tags, uint32 communityId, PostLib.PostType postType, PostLib.Language language) external;
    function editReply(uint256 postId, uint16 parentReplyId, bytes32 ipfsHash, bool isOfficialReply, PostLib.Language language) external;
    function editComment(uint256 postId, uint16 parentReplyId, uint8 commentId, bytes32 ipfsHash, PostLib.Language language) external;
    function deletePost(uint256 postId) external;
    function deleteReply(uint256 postId, uint16 replyId) external;
    function deleteComment(uint256 postId, uint16 parentReplyId, uint8 commentId) external;
    function changeStatusBestReply(uint256 postId, uint16 replyId) external;
    function voteItem(uint256 postId, uint16 replyId, uint8 commentId, bool isUpvote) external;
    function updateDocumentationTree(uint32 communityId, bytes32 documentationTreeIpfsHash) external;
    function createTranslation(uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language language, bytes32 ipfsHash) external;
    function createTranslations(uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language[] memory languages, bytes32[] memory ipfsHashs) external;
    function editTranslation(uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language language, bytes32 ipfsHash) external;
    function editTranslations(uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language[] memory languages, bytes32[] memory ipfsHashs) external;
    function deleteTranslation(uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language language) external;
    function deleteTranslations(uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language[] memory languages) external;
}