//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;
// import "../PeeranhaCommunityTokenFactory.sol";
import "./IPeeranhaCommunityToken.sol";


pragma abicoder v2;

interface IPeeranhaCommunityTokenFactory {
    function createNewCommunityToken(string memory name, string memory symbol, address contractAddress, uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod, uint32 communityId) external;
    function getReward(uint16 period) external;
}