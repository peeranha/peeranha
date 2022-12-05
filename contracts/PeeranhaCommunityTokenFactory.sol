//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./PeeranhaCommunityToken.sol";
import "./interfaces/IPeeranhaCommunityTokenFactory.sol";
import "./interfaces/IPeeranhaUser.sol";
import "./libraries/TokenLib.sol";
import "./base/ChildMintableERC20Upgradeable.sol";


contract PeeranhaCommunityTokenFactory is IPeeranhaCommunityTokenFactory, Initializable, ChildMintableERC20Upgradeable {
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

  function createNewCommunityToken(address contractAddress, uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod, uint32 communityId) external override {
    require(address(factoryData.peeranhaCommunitiesToken[communityId]) == address(0), "communityId_already_exist");
    factoryData.peeranhaCommunitiesToken[communityId] = new PeeranhaCommunityToken(contractAddress, maxRewardPerPeriod, activeUsersInPeriod, address(this));
    factoryData.factoryCommunitiesId.push(communityId);
    // PeeranhaCommunityToken peeranhaCommunityToken = new PeeranhaCommunityToken(name, symbol, contractAddress, maxRewardPerPeriod, activeUsersInPeriod, communityId, createTime);
    // peeranhaCommunityTokenArray.push(peeranhaCommunityToken);
  }

  // This is to support Native meta transactions
  // never use msg.sender directly, use _msgSender() instead
  function _msgSender()
      internal
      override(ChildMintableERC20Upgradeable)
      view
      returns (address sender)
  {
      return ChildMintableERC20Upgradeable._msgSender();
  }

  function getCommunityToken(uint32 communityId) private view returns(IPeeranhaCommunityToken) {
    require(address(factoryData.peeranhaCommunitiesToken[communityId]) != address(0), "CommunityId_not_exist");
    return factoryData.peeranhaCommunitiesToken[communityId];
  }

  function updateCommunityRewardSettings(uint32 communityId, uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod) external override {
    IPeeranhaCommunityToken peeranhaCommunityToken = getCommunityToken(communityId);
    peeranhaCommunityToken.updateCommunityRewardSettings(maxRewardPerPeriod, activeUsersInPeriod);
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
    address userAddress = _msgSender();
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
