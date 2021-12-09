pragma solidity >=0.5.0;
pragma abicoder v2;

import "../libraries/PostLib.sol";

interface IPeeranhaPost {
    function createPost(uint32 communityId, bytes32 ipfsHash, PostLib.PostType postType, uint8[] memory tags) external;
    function createReply(uint256 postId, uint16 parentReplyId, bytes32 ipfsHash, bool isOfficialReply) external;
    function createComment(uint256 postId, uint16 parentReplyId, bytes32 ipfsHash) external;
    function voteItem(uint256 postId, uint16 replyId, uint8 commentId, bool isUpvote) external;
}