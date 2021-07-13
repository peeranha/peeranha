pragma solidity >=0.5.0;
pragma abicoder v2;

import "../libraries/CommunityLib.sol";

interface IPeeranhaPost {
    function createPost(uint8 communityId, bytes32 ipfsHash/*, CommunityLib.Tag[] memory tags*/) external;
    function createReply(uint32 postId, uint16[] memory path, bytes32 ipfsHash, bool officialReply) external;
    function createComment(uint32 postId, uint16[] memory path, bytes32 ipfsHash) external;
    function editPost(address user, uint32 postId, uint8 communityId, bytes32 ipfsHash/*, CommunityLib.Tag[] memory tags*/) external;
    function editReply(address user, uint32 postId, uint16[] memory path, uint16 replyId, bytes32 ipfsHash, bool officialReply) external;
    function editComment(address user, uint32 postId, uint16[] memory path, uint8 commentId, bytes32 ipfsHash) external;
    function deletePost(address user, uint32 postId) external;
    function deleteReply(address user, uint32 postId, uint16[] memory path, uint16 replyId) external;
    function deleteComment(address user, uint32 postId, uint16[] memory path, uint8 commentId) external;
}