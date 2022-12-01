//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./PeeranhaCommunityToken.sol";
import "./interfaces/IPeeranhaCommunityTokenFactory.sol";
import "./interfaces/IPeeranhaUser.sol";
import "./libraries/TokenLib.sol";


contract PeeranhaCommunityTokenFactory is IPeeranhaCommunityTokenFactory, Initializable {
  // PeeranhaCommunityToken[] public peeranhaCommunityTokenArray;

  struct FactoryData {  // name
    mapping(uint32 => IPeeranhaCommunityToken) peeranhaCommunitiesToken;
    uint32[] factoryCommunitiesId;
    TokenLib.StatusRewardContainer statusRewardContainer;
    IPeeranhaUser peeranhaUser;
  }
  FactoryData factoryData;

  function initialize(address peeranhaUserContractAddress) public initializer {
    factoryData.peeranhaUser = IPeeranhaUser(peeranhaUserContractAddress);
  }

  function createNewCommunityToken(string memory name, string memory symbol, address contractAddress, uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod, uint32 communityId) external override {
    require(address(factoryData.peeranhaCommunitiesToken[communityId]) == address(0), "communityId_already_exist");
    factoryData.peeranhaCommunitiesToken[communityId] = new PeeranhaCommunityToken(name, symbol, contractAddress, maxRewardPerPeriod, activeUsersInPeriod, address(this));
    factoryData.factoryCommunitiesId.push(communityId);
    // PeeranhaCommunityToken peeranhaCommunityToken = new PeeranhaCommunityToken(name, symbol, contractAddress, maxRewardPerPeriod, activeUsersInPeriod, communityId, createTime);
    // peeranhaCommunityTokenArray.push(peeranhaCommunityToken);
  }

  function getCommunityToken(uint32 communityId) private view returns(IPeeranhaCommunityToken) {
    return factoryData.peeranhaCommunitiesToken[communityId];
  }

  // set pools
  function setTotalPeriodRewards(uint16 period) external override {
    // check role | address
    uint256 rewardCommunitiesLength = factoryData.factoryCommunitiesId.length;
    for (uint256 i; i < rewardCommunitiesLength; i++) {
      RewardLib.PeriodRewardShares memory periodRewardShares = factoryData.peeranhaUser.getPeriodRewardShares(period, factoryData.factoryCommunitiesId[i]);
      IPeeranhaCommunityToken peeranhaCommunityToken = getCommunityToken(factoryData.factoryCommunitiesId[i]);
      if (address(peeranhaCommunityToken) != address(0)) {
        peeranhaCommunityToken.setTotalPeriodReward(periodRewardShares, period);
      }
    }
  }

  function getRewards(uint16 period) external override {
    address userAddress =  msg.sender; // -> _msgSender(); ?
    require(!factoryData.statusRewardContainer.statusReward[userAddress][period].isPaid, "reward_already_picked_up.");
    factoryData.statusRewardContainer.statusReward[userAddress][period].isPaid = true;

    uint32[] memory rewardCommunities = factoryData.peeranhaUser.getUserRewardCommunities(userAddress, period);
    uint256 rewardCommunitiesLength = rewardCommunities.length;
    for (uint256 i; i < rewardCommunitiesLength; i++) {
      IPeeranhaCommunityToken peeranhaCommunityToken = getCommunityToken(rewardCommunities[i]);
      if (address(peeranhaCommunityToken) != address(0)) {
        RewardLib.PeriodRewardShares memory periodRewardShares = factoryData.peeranhaUser.getPeriodRewardShares(period, rewardCommunities[i]);
        peeranhaCommunityToken.payCommunityReward(periodRewardShares, userAddress, period);
      }
    }
  }
}
