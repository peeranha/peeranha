pragma solidity >=0.5.0;
pragma abicoder v2;


interface IPeeranhaToken {
  function getBoost(address user, uint16 period, int32 rating) external view returns (uint256);
}