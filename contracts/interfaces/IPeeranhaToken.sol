//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;
pragma abicoder v2;


interface IPeeranhaToken {
  function getBoost(address user, uint16 period) external view returns (int32);
}