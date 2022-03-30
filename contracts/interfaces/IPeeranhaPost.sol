pragma solidity >=0.5.0;
pragma abicoder v2;

import "../libraries/PostLib.sol";

interface IPeeranhaPost {
    function createPost(address userAddress, uint32 communityId, bytes32 ipfsHash, PostLib.PostType postType, uint8[] memory tags) external;
    function createReply(address userAddress, uint256 postId, uint16 parentReplyId, bytes32 ipfsHash, bool isOfficialReply) external;
    function createComment(address userAddress, uint256 postId, uint16 parentReplyId, bytes32 ipfsHash) external;
    function editPost(address userAddress, uint256 postId, bytes32 ipfsHash, uint8[] memory tags) external;
    function editReply(address userAddress, uint256 postId, uint16 parentReplyId, bytes32 ipfsHash ) external;
    function editComment(address userAddress, uint256 postId, uint16 parentReplyId, uint8 commentId, bytes32 ipfsHash) external;
    function deletePost(address userAddress, uint256 postId) external;
    function deleteReply(address userAddress, uint256 postId, uint16 replyId) external;
    function deleteComment(address userAddress, uint256 postId, uint16 parentReplyId, uint8 commentId) external;
    function changeStatusOfficialReply(address userAddress, uint256 postId, uint16 replyId) external;
    function changeStatusBestReply(address userAddress, uint256 postId, uint16 replyId) external;
    function voteItem(address userAddress, uint256 postId, uint16 replyId, uint8 commentId, bool isUpvote) external;
    function changePostType(address userAddress, uint256 postId, PostLib.PostType postType) external;
}