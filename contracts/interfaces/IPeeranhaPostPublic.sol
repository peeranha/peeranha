pragma solidity >=0.5.0;
pragma abicoder v2;

import "../libraries/PostLibPublic.sol";

interface IPeeranhaPostPublic {
    function editPost(uint256 postId, bytes32 ipfsHash, uint8[] memory tags) external;
    function editReply(uint256 postId, uint16 parentReplyId, bytes32 ipfsHash ) external;
    function editComment(uint256 postId, uint16 parentReplyId, uint8 commentId, bytes32 ipfsHash) external;
    function deletePost(uint256 postId) external;
    function deleteReply(uint256 postId, uint16 replyId) external;
    function deleteComment(uint256 postId, uint16 parentReplyId, uint8 commentId) external;  
    function changeStatusOfficialReply(uint256 postId, uint16 replyId) external;
    function changeStatusBestReply(uint256 postId, uint16 replyId) external;
}