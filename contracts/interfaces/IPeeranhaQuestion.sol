pragma solidity >=0.5.0;

interface IPeeranhaQuestion {
  function postQuestion(address name, uint16 communityId, bytes32 ipfsHash) external;
  // function getQuestionByIndex(uint index) external view returns (QuestionLib.Content memory) ;
}