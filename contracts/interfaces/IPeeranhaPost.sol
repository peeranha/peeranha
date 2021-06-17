pragma solidity >=0.5.0;

interface IPeeranhaPost {
  function publicationPost(address name, uint8 communityId, bytes32 ipfsHash) external;
  function postReply(address name, uint32 postId, bool officialReply, uint16[] memory path, bytes32 ipfsHash) external;
  function postComment(address name, uint32 postId, uint16[] memory path, bytes32 ipfsHash) external;
  function editPost(address name, uint32 postId, uint8 communityId, bytes32 ipfsHash) external;
  function editReply(address name, uint32 postId, uint16[] memory path, uint16 replyId, bool officialReply, bytes32 ipfsHash) external;
  function editComment(address name, uint32 postId, uint16[] memory path, uint8 commentId, bytes32 ipfsHash) external;
  function deletePost(address name, uint32 postId) external;
  function deleteReply(address name, uint32 postId, uint16[] memory path, uint16 replyId) external;
  function deleteComment(address name, uint32 postId, uint16[] memory path, uint8 commentId) external;
}