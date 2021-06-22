pragma solidity >=0.5.0;
pragma abicoder v2;

import "../libraries/CommunityLib.sol";

interface IPeeranhaPost {
    function createPost(address name, uint8 communityId, bytes32 ipfsHash, CommunityLib.Tag[] calldata tags) external;
    function createReply(address name, uint32 postId, bool officialReply, uint16[] memory path, bytes32 ipfsHash) external;
    function createComment(address name, uint32 postId, uint16[] memory path, bytes32 ipfsHash) external;
    function editPost(address name, uint32 postId, uint8 communityId, bytes32 ipfsHash, CommunityLib.Tag[] calldata tags) external;
    function editReply(address name, uint32 postId, uint16[] memory path, uint16 replyId, bool officialReply, bytes32 ipfsHash) external;
    function editComment(address name, uint32 postId, uint16[] memory path, uint8 commentId, bytes32 ipfsHash) external;
    function deletePost(address name, uint32 postId) external;
    function deleteReply(address name, uint32 postId, uint16[] memory path, uint16 replyId) external;
    function deleteComment(address name, uint32 postId, uint16[] memory path, uint8 commentId) external;
}