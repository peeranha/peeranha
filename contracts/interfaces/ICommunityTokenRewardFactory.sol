//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;
import "./ICommunityToken.sol";


pragma abicoder v2;

interface ICommunityTokenRewardFactory {
    function createNewCommunityTokenReward(address userAddress, uint32 communityId, address contractAddress, uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod) external;
    function updateCommunityRewardSettings(address userAddress, uint32 communityId, address communityTokenContractAddress, uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod) external;
    function setReadyToClaimPeriodRewards(uint16 period) external;
    function claimRewards(address userAddress, uint16 period) external;
    function getUserCommunityRewardGraph(address userAddress, uint16 period, uint32 communityId, address communityTokenContractAddress) external view returns(uint256);
}