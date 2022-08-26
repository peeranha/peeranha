//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;
pragma abicoder v2;

import "../libraries/PostLib.sol";

interface IPeeranhaContent {
    function createPost(uint32 communityId, bytes32 ipfsHash, PostLib.PostType postType, uint8[] memory tags) external;
    function createReply(uint256 postId, uint16 parentReplyId, bytes32 ipfsHash, bool isOfficialReply) external;
    function createComment(uint256 postId, uint16 parentReplyId, bytes32 ipfsHash) external;
    function editPost(uint256 postId, bytes32 ipfsHash, uint8[] memory tags) external;
    function editReply(uint256 postId, uint16 parentReplyId, bytes32 ipfsHash, bool isOfficialReply) external;
    function editComment(uint256 postId, uint16 parentReplyId, uint8 commentId, bytes32 ipfsHash) external;
    function deletePost(uint256 postId) external;
    function deleteReply(uint256 postId, uint16 replyId) external;
    function deleteComment(uint256 postId, uint16 parentReplyId, uint8 commentId) external;
    function changeStatusBestReply(uint256 postId, uint16 replyId) external;
    function voteItem(uint256 postId, uint16 replyId, uint8 commentId, bool isUpvote) external;
    function changePostType(uint256 postId, PostLib.PostType postType) external;
    function createTranslation(uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language language, bytes32 ipfsHash) external;
    function createTranslations(uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language[] memory languages, bytes32[] memory ipfsHashs) external;
    function editTranslation(uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language language, bytes32 ipfsHash) external;
    function editTranslations(uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language[] memory languages, bytes32[] memory ipfsHashs) external;
    function deleteTranslation(uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language language) external;
    function deleteTranslations(uint256 postId, uint16 replyId, uint8 commentId, PostLib.Language[] memory languages) external;
}