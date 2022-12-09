//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;
// import "../PeeranhaCommunityTokenFactory.sol";
import "./IPeeranhaCommunityToken.sol";


pragma abicoder v2;

interface IPeeranhaCommunityTokenFactory {
    function createNewCommunityToken(uint32 communityId, address contractAddress, uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod) external;
    function updateCommunityRewardSettings(uint32 communityId, address communityTokenContractAddress, uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod) external;
    function setTotalPeriodRewards(uint16 period) external;
    function getRewards(uint16 period) external;
}