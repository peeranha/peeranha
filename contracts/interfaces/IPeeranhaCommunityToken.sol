//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;
// import "../PeeranhaCommunityTokenFactory.sol";
// import "../PeeranhaCommunityToken.sol";

import "../libraries/RewardLib.sol";

pragma abicoder v2;

interface IPeeranhaCommunityToken {
    function getBalance() external view returns(uint256);
    function payCommunityReward(RewardLib.PeriodRewardShares memory periodRewardShares, address userAddress, uint16 period) external;
    function setTotalPeriodReward(RewardLib.PeriodRewardShares memory periodRewardShares, uint16 period) external;
}