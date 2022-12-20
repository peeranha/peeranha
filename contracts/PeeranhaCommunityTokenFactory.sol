//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./interfaces/IPeeranhaCommunityTokenFactory.sol";
import "./interfaces/IPeeranhaUser.sol";
import "./interfaces/IPeeranhaCommunity.sol";

import "./PeeranhaCommunityToken.sol";
import "./libraries/TokenLib.sol";
import "./base/NativeMetaTransaction.sol";

///
// todo: tests
//  getReward
//  not_allowed_not_protocal_admin x2
//  period_not_ended
///

contract PeeranhaCommunityTokenFactory is IPeeranhaCommunityTokenFactory, Initializable, NativeMetaTransaction {
  struct FactoryData {  // name
    mapping(uint32 => IPeeranhaCommunityToken[]) peeranhaCommunitiesToken;  // communityId
    mapping(uint16 => bool) isSetPool;                                      // period
    uint32[] factoryCommunitiesId;    // todo: uinttest 
    TokenLib.StatusRewardContainer statusRewardContainer;
    IPeeranhaUser peeranhaUser;
    IPeeranhaCommunity peeranhaCommunity;
  }
  FactoryData factoryData;

  event CommunityTokenCreated(address indexed communityTokenContractAddress, uint32 indexed communityId);
  event SetCommunityTokenPool(uint16 indexed period); 
  event CommunityRewardSettingsUpdated(address indexed communityTokenContractAddress);
  event GetCommunityReward(address indexed user, uint16 indexed period);

  function initialize(address peeranhaUserContractAddress, address peeranhaCommunityContractAddress) public initializer {
    factoryData.peeranhaUser = IPeeranhaUser(peeranhaUserContractAddress);
    factoryData.peeranhaCommunity = IPeeranhaCommunity(peeranhaCommunityContractAddress);
  }

  function createNewCommunityToken(uint32 communityId, address contractAddress, uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod) external override {
    factoryData.peeranhaCommunity.onlyExistingAndNotFrozenCommunity(communityId);
    require(factoryData.peeranhaUser.isProtocolAdmin(_msgSender()), "not_allowed_not_protocal_admin");  // tests

    factoryData.peeranhaCommunitiesToken[communityId].push(new PeeranhaCommunityToken(contractAddress, maxRewardPerPeriod, activeUsersInPeriod, address(this)));
    
    bool isAddedCommunityId;
    for (uint256 i; i < factoryData.factoryCommunitiesId.length; i++) {
      if (factoryData.factoryCommunitiesId[i] == communityId)
        isAddedCommunityId = true;
    }
    if (!isAddedCommunityId) {
      factoryData.factoryCommunitiesId.push(communityId);
    }

    uint256 contractsCommunityTokenLength = factoryData.peeranhaCommunitiesToken[communityId].length;
    address communityTokenAddress = address(factoryData.peeranhaCommunitiesToken[communityId][contractsCommunityTokenLength - 1]);
    emit CommunityTokenCreated(communityTokenAddress, communityId);
  }

  // This is to support Native meta transactions
  // never use msg.sender directly, use _msgSender() instead
  function _msgSender()
      internal
      override
      view
      returns (address sender)
  {
      return NativeMetaTransaction._msgSender();
  }

  function getContractCommunityToken(uint32 communityId, address communityTokenContractAddress) public view returns(IPeeranhaCommunityToken) {
    IPeeranhaCommunityToken[] memory icontractsCommunityToken =  getContractsCommunityToken(communityId);

    for (uint32 communityToken; communityToken < icontractsCommunityToken.length; communityToken++) {
      IPeeranhaCommunityToken iPeeranhaCommunityToken = icontractsCommunityToken[communityToken];
      if (address(iPeeranhaCommunityToken) == communityTokenContractAddress)
        return iPeeranhaCommunityToken;
    }
    revert("Community_token_contract_not_exist");
  }

  function getContractsCommunityToken(uint32 communityId) public view returns(IPeeranhaCommunityToken[] memory) {
    require(factoryData.peeranhaCommunitiesToken[communityId].length != 0, "Token_communityId_not_exist");
    return factoryData.peeranhaCommunitiesToken[communityId];
  }

  function updateCommunityRewardSettings(uint32 communityId, address communityTokenContractAddress, uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod) external override {
    IPeeranhaCommunityToken peeranhaCommunityToken = getContractCommunityToken(communityId, communityTokenContractAddress);
    peeranhaCommunityToken.updateCommunityRewardSettings(maxRewardPerPeriod, activeUsersInPeriod);

    emit CommunityRewardSettingsUpdated(communityTokenContractAddress);
  }
  
  // set pools
  function setTotalPeriodRewards(uint16 period) external override {
    require(factoryData.peeranhaUser.isProtocolAdmin(_msgSender()), "not_allowed_not_protocal_admin");  // tests

    require(!factoryData.isSetPool[period], "pools_already_set");    // todo: tests
    factoryData.isSetPool[period] = true;
    uint256 rewardCommunitiesLength = factoryData.factoryCommunitiesId.length;
    for (uint256 i; i < rewardCommunitiesLength; i++) {
      RewardLib.PeriodRewardShares memory periodRewardShares = factoryData.peeranhaUser.getPeriodCommunityRewardShares(period, factoryData.factoryCommunitiesId[i]);
      IPeeranhaCommunityToken[] memory contractsCommunityToken = getContractsCommunityToken(factoryData.factoryCommunitiesId[i]);
      uint256 contractsCommunityTokenLength = contractsCommunityToken.length;
      for (uint256 communityTokenIndex; communityTokenIndex < contractsCommunityTokenLength; communityTokenIndex++) {
        IPeeranhaCommunityToken peeranhaCommunityToken = contractsCommunityToken[communityTokenIndex];
        if (address(peeranhaCommunityToken) != address(0)) {
          peeranhaCommunityToken.setTotalPeriodReward(periodRewardShares, period);
        }
      }
    }
    emit SetCommunityTokenPool(period);
  }

  function getCommunityRewards(uint16 period) external override {    // how check is exist reward?
    address userAddress = _msgSender();
    require(!factoryData.statusRewardContainer.statusReward[userAddress][period].isPaid, "reward_already_picked_up.");
    require(factoryData.isSetPool[period], "pool_not_set");    // todo: tests
    factoryData.statusRewardContainer.statusReward[userAddress][period].isPaid = true;

    uint32[] memory rewardCommunities = factoryData.peeranhaUser.getUserRewardCommunities(userAddress, period);
    uint256 rewardCommunitiesLength = rewardCommunities.length;
    bool isExistReward;
    for (uint256 i; i < rewardCommunitiesLength; i++) {
      IPeeranhaCommunityToken[] memory contractsCommunityToken = getContractsCommunityToken(rewardCommunities[i]);
      uint256 contractsCommunityTokenLength = contractsCommunityToken.length;
      for (uint256 communityTokenIndex; communityTokenIndex < contractsCommunityTokenLength; communityTokenIndex++) {
        IPeeranhaCommunityToken peeranhaCommunityToken = contractsCommunityToken[communityTokenIndex];

        int32 ratingToReward = factoryData.peeranhaUser.getRatingToReward(userAddress, period, rewardCommunities[i]);
        if (address(peeranhaCommunityToken) != address(0) && ratingToReward > 0) {
          RewardLib.PeriodRewardShares memory periodRewardShares = factoryData.peeranhaUser.getPeriodCommunityRewardShares(period, rewardCommunities[i]);
          uint16 per = period;  // ??????
          (uint256 userReward, address contractAddress) = peeranhaCommunityToken.payCommunityReward(periodRewardShares, CommonLib.toUInt32FromInt32(ratingToReward), per);
          if (userReward > 0) {
            IERC20MetadataUpgradeable(contractAddress).transfer(userAddress, userReward);
            isExistReward = true;
          }
        }
      }
    }

    require(isExistReward, "no_reward");    // todo: tests
    emit GetCommunityReward(userAddress, period);
  }

  function getUserCommunityRewardGraph(address userAddress, uint16 period, uint32 communityId, address communityTokenContractAddress) public view override returns(uint256) {
    RewardLib.PeriodRewardShares memory periodRewardShares = factoryData.peeranhaUser.getPeriodCommunityRewardShares(period, communityId);
    int32 ratingToReward = factoryData.peeranhaUser.getRatingToReward(userAddress, period, communityId);
    uint256 userReward = getContractCommunityToken(communityId, communityTokenContractAddress).getUserCommunityReward(periodRewardShares, CommonLib.toUInt32FromInt32(ratingToReward), period);

    return userReward;
  }

  function getCommunityToken(address communityTokenContractAddress, uint32 communityId) external view returns(PeeranhaCommunityToken.CommunityToken memory) {
    IPeeranhaCommunityToken peeranhaCommunityToken = getContractCommunityToken(communityId, communityTokenContractAddress);
    return peeranhaCommunityToken.getCommunityTokenData();
  }

  // only for unit tests  // todo: add change-env-value
  function getAddressLastCreatedContract(uint32 communityId) external view returns(address) {
    IPeeranhaCommunityToken[] memory contractsCommunityToken = getContractsCommunityToken(communityId);
    uint256 contractsCommunityTokenLength = contractsCommunityToken.length;
    return address(contractsCommunityToken[contractsCommunityTokenLength - 1]);
  }

  function getFactoryCommunitiesId() external view returns(uint32[] memory) {
    return factoryData.factoryCommunitiesId;
  }
}
