//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;
// import "../PeeranhaCommunityTokenFactory.sol";
import "./IPeeranhaCommunityToken.sol";


pragma abicoder v2;

interface IPeeranhaCommunityTokenFactory {
    function createNewCommunityToken(address userAddress, uint32 communityId, address contractAddress, uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod) external;
    function updateCommunityRewardSettings(address userAddress, uint32 communityId, address communityTokenContractAddress, uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod) external;
    function setTotalPeriodRewards(uint16 period) external;
    function payCommunityRewards(address userAddress, uint16 period) external;
    function getUserCommunityRewardGraph(address userAddress, uint16 period, uint32 communityId, address communityTokenContractAddress) external view returns(uint256);
}