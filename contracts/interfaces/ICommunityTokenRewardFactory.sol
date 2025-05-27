//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;

pragma abicoder v2;

interface ICommunityTokenRewardFactory {
    function createNewCommunityTokenReward(address userAddress, uint32 communityId, address contractAddress, uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod) external;
    function startPeriod() external;
}