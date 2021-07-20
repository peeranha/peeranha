pragma solidity >=0.5.0;
pragma abicoder v2;

import "../libraries/CommunityLib.sol";

interface IPeeranhaPost {
    function createPost(uint32 communityId, bytes32 ipfsHash/*, CommunityLib.Tag[] memory tags*/) external;
    function createReply(uint256 postId, uint16[] memory path, bytes32 ipfsHash, bool officialReply) external;
    function createComment(uint256 postId, uint16[] memory path, bytes32 ipfsHash) external;
    function editPost(uint256 postId, uint32 communityId, bytes32 ipfsHash/*, CommunityLib.Tag[] memory tags*/) external;
    function editReply(uint256 postId, uint16[] memory path, uint16 replyId, bytes32 ipfsHash ) external;
    function editComment(uint256 postId, uint16[] memory path, uint8 commentId, bytes32 ipfsHash) external;
    function deletePost(uint256 postId) external;
    function deleteReply(uint256 postId, uint16[] memory path, uint16 replyId) external;
    function deleteComment(uint256 postId, uint16[] memory path, uint8 commentId) external;
    function changeStatusOfficialAnswer(uint256 postId, uint16[] memory path, uint16 replyId, bool officialReply) external;
    function voteItem(uint256 postId, uint16[] memory path, uint16 replyId, uint8 commentId, bool isUpvote) external;
}