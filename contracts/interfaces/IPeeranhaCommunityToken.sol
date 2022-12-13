//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;
// import "../PeeranhaCommunityTokenFactory.sol";
// import "../PeeranhaCommunityToken.sol";

import "../libraries/RewardLib.sol";
import "../PeeranhaCommunityToken.sol";

pragma abicoder v2;

interface IPeeranhaCommunityToken {
    function getBalance() external view returns(uint256);
    function payCommunityReward(RewardLib.PeriodRewardShares memory periodRewardShares, uint32 tokenReward, uint16 period) external returns(uint256, address);
    function setTotalPeriodReward(RewardLib.PeriodRewardShares memory periodRewardShares, uint16 period) external;
    function updateCommunityRewardSettings(uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod) external;
    function getCommunityToken() external view returns(PeeranhaCommunityToken.CommunityToken memory);
}