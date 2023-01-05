//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;
// import "../PeeranhaCommunityTokenFactory.sol";
// import "../PeeranhaCommunityToken.sol";

import "../libraries/RewardLib.sol";
import "../PeeranhaCommunityToken.sol";

pragma abicoder v2;

interface IPeeranhaCommunityToken {
    function getBalance() external view returns(uint256);
    function payCommunityReward(RewardLib.PeriodRewardShares memory periodRewardShares, address userAddress, uint32 ratingToReward, uint16 period) external;
    function setTotalPeriodReward(RewardLib.PeriodRewardShares memory periodRewardShares, uint16 period) external;
    function updateCommunityRewardSettings(uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod) external;
    function getCommunityTokenData() external view returns(PeeranhaCommunityToken.CommunityToken memory);
    function getUserCommunityReward(RewardLib.PeriodRewardShares memory periodRewardShares, uint32 ratingToReward, uint16 period) external view returns(uint256);
}