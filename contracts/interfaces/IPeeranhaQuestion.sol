pragma solidity >=0.5.0;

interface IPeeranhaQuestion {
  function postQuestion(string memory name, uint16 communityId, bytes32 ipfsHash) external;
}