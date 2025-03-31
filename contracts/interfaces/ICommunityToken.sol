//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;

import "../libraries/RewardLib.sol";
import "../CommunityToken.sol";

pragma abicoder v2;

interface ICommunityToken {
    function getAvailableRewardsBalance() external view returns(uint256);
    function claimReward(RewardLib.PeriodRewardShares memory periodRewardShares, address userAddress, uint32 ratingToReward, uint16 period) external;
    function setReadyToClaimPeriodRewards(RewardLib.PeriodRewardShares memory periodRewardShares, uint16 period) external;
    function updateCommunityRewardSettings(uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod) external;
    function getCommunityTokenData() external view returns(CommunityToken.CommunityTokenInfo memory);
    function getUserCommunityReward(RewardLib.PeriodRewardShares memory periodRewardShares, uint32 ratingToReward, uint16 period) external view returns(uint256);
}