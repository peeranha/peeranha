//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;

import "../libraries/RewardLib.sol";
import "../CommunityTokenReward.sol";

pragma abicoder v2;

interface ICommunityTokenReward {
    function getAvailableRewardsBalance() external view returns(uint256);
    function startNewPeriod(RewardLib.PeriodRewardShares memory periodRewardShares, uint16 period) external;
    function updateCommunityRewardSettings(address userAddress, uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod) external;
    function getCommunityTokenRewardData() external view returns(CommunityTokenReward.CommunityTokenInfo memory);
    function claimReward(address userAddress, uint16 period) external;
}