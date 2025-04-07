//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./interfaces/ICommunityTokenRewardFactory.sol";
import "./interfaces/IPeeranhaUser.sol";
import "./interfaces/IPeeranhaCommunity.sol";

import "./CommunityToken.sol";
import "./libraries/TokenLib.sol";
import "./base/NativeMetaTransaction.sol";

// import "@openzeppelin/contracts/access/AccessControl.sol";

///
// todo: tests
//  getReward
//  not_allowed_not_protocal_admin x2
//  period_not_ended
///

contract CommunityTokenRewardFactory is ICommunityTokenRewardFactory, Initializable, NativeMetaTransaction {
  struct FactoryData {  // name
    mapping(uint32 => ICommunityToken[]) communitiesToken;  // communityId
    mapping(uint16 => bool) isSetPool;                                      // period
    uint32[] factoryCommunitiesId;    // todo: uinttest 
    TokenLib.StatusRewardContainer statusRewardContainer;
    IPeeranhaUser peeranhaUser;
    IPeeranhaCommunity peeranhaCommunity;
  }

  FactoryData factoryData;

  event CommunityTokenCreated(address indexed communityTokenContractAddress, uint32 indexed communityId);
  event SetReadyToClaimCommunityPeriodRewards(uint16 indexed period); 
  event ClaimRewards(address indexed userAddress, uint16 indexed period);

  function initialize(address peeranhaUserContractAddress, address peeranhaCommunityContractAddress) public initializer {
    factoryData.peeranhaUser = IPeeranhaUser(peeranhaUserContractAddress);
    factoryData.peeranhaCommunity = IPeeranhaCommunity(peeranhaCommunityContractAddress);
  }

  function dispatcherCheck(address userAddress) internal {
    if (userAddress != _msgSender()) {
      factoryData.peeranhaUser.onlyDispatcher(_msgSender());
    }
  }

  function createNewCommunityTokenReward(address userAddress, uint32 communityId, address tokenAddress, uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod) external override {
    dispatcherCheck(userAddress);
    factoryData.peeranhaCommunity.onlyExistingAndNotFrozenCommunity(userAddress, communityId);
    require(factoryData.peeranhaUser.isProtocolAdmin(userAddress), "not_allowed_not_protocal_admin");  // tests
    factoryData.communitiesToken[communityId].push(new CommunityToken(tokenAddress, maxRewardPerPeriod, activeUsersInPeriod, address(this)));
    
    bool existingCommunityId;
    for (uint256 i; i < factoryData.factoryCommunitiesId.length; i++) {
      if (factoryData.factoryCommunitiesId[i] == communityId)
        existingCommunityId = true;
    }
    if (!existingCommunityId) {
      factoryData.factoryCommunitiesId.push(communityId);
    }

    uint256 contractsCommunityTokenLength = factoryData.communitiesToken[communityId].length;
    address communityTokenAddress = address(factoryData.communitiesToken[communityId][contractsCommunityTokenLength - 1]);
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
  
  // set pools
  function setReadyToClaimPeriodRewards(uint16 period) external override {
    require(RewardLib.getPeriod() > period + 1, "period_not_ended");  // todo: tests
    require(factoryData.peeranhaUser.isProtocolAdmin(_msgSender()), "not_allowed_not_protocal_admin");  // todo: tests

    require(!factoryData.isSetPool[period], "pools_already_set");    // todo: tests
    factoryData.isSetPool[period] = true;
    uint256 rewardCommunitiesLength = factoryData.factoryCommunitiesId.length;
    for (uint256 i; i < rewardCommunitiesLength; i++) {
      RewardLib.PeriodRewardShares memory periodRewardShares = factoryData.peeranhaUser.getPeriodCommunityRewardShares(period, factoryData.factoryCommunitiesId[i]);
      ICommunityToken[] memory contractsCommunityToken = getContractsCommunityToken(factoryData.factoryCommunitiesId[i]);
      uint256 contractsCommunityTokenLength = contractsCommunityToken.length;
      for (uint256 communityTokenIndex; communityTokenIndex < contractsCommunityTokenLength; communityTokenIndex++) {
        ICommunityToken communityToken = contractsCommunityToken[communityTokenIndex];
        if (address(communityToken) != address(0)) {
          communityToken.setReadyToClaimPeriodRewards(periodRewardShares, period);
        }
      }
    }
    emit SetReadyToClaimCommunityPeriodRewards(period);
  }

  function claimRewards(address userAddress, uint16 period) external override {
    dispatcherCheck(userAddress);
    require(!factoryData.statusRewardContainer.statusReward[userAddress][period].isPaid, "reward_already_picked_up.");
    require(factoryData.isSetPool[period], "pool_not_set");    // todo: tests
    factoryData.statusRewardContainer.statusReward[userAddress][period].isPaid = true;

    uint32[] memory rewardCommunities = factoryData.peeranhaUser.getUserRewardCommunities(userAddress, period);
    uint256 rewardCommunitiesLength = rewardCommunities.length;

    for (uint256 i; i < rewardCommunitiesLength; i++) {
      ICommunityToken[] memory contractsCommunityToken = getContractsCommunityToken(rewardCommunities[i]);
      uint256 contractsCommunityTokenLength = contractsCommunityToken.length;
      for (uint256 communityTokenIndex; communityTokenIndex < contractsCommunityTokenLength; communityTokenIndex++) {
        ICommunityToken communityToken = contractsCommunityToken[communityTokenIndex];

        int32 ratingToReward = factoryData.peeranhaUser.getRatingToReward(userAddress, period, rewardCommunities[i]);
        if (address(communityToken) != address(0) && ratingToReward > 0) {
          RewardLib.PeriodRewardShares memory periodRewardShares = factoryData.peeranhaUser.getPeriodCommunityRewardShares(period, rewardCommunities[i]);
          uint16 per = period;  // ??????
          communityToken.claimReward(periodRewardShares, userAddress, CommonLib.toUInt32FromInt32(ratingToReward), per);
        }
      }
    }
    emit ClaimRewards(userAddress, period);
  }

  function getContractCommunityToken(uint32 communityId, address communityTokenContractAddress) public view returns(ICommunityToken) {
    ICommunityToken[] memory icontractsCommunityToken =  getContractsCommunityToken(communityId);

    for (uint32 communityToken; communityToken < icontractsCommunityToken.length; communityToken++) {
      ICommunityToken iCommunityToken = icontractsCommunityToken[communityToken];
      if (address(iCommunityToken) == communityTokenContractAddress)
        return iCommunityToken;
    }
    revert("Community_token_contract_not_exist"); // todo: tests
  }

  function getContractsCommunityToken(uint32 communityId) public view returns(ICommunityToken[] memory) {
    require(factoryData.communitiesToken[communityId].length != 0, "Token_communityId_not_exist");
    return factoryData.communitiesToken[communityId];
  }

  function getUserCommunityRewardGraph(address userAddress, uint16 period, uint32 communityId, address communityTokenContractAddress) public view override returns(uint256) {
    RewardLib.PeriodRewardShares memory periodRewardShares = factoryData.peeranhaUser.getPeriodCommunityRewardShares(period, communityId);
    int32 ratingToReward = factoryData.peeranhaUser.getRatingToReward(userAddress, period, communityId);
    uint256 userReward = getContractCommunityToken(communityId, communityTokenContractAddress).getUserCommunityReward(periodRewardShares, CommonLib.toUInt32FromInt32(ratingToReward), period);

    return userReward;
  }

  // function getCommunityToken(address communityTokenContractAddress, uint32 communityId) external view returns(communityToken.CommunityToken memory) {
  //   ICommunityToken communityToken = getContractCommunityToken(communityId, communityTokenContractAddress);
  //   return communityToken.getCommunityTokenData();
  // }

  // only for unit tests  // todo: add change-env-value
  function getAddressLastCreatedContract(uint32 communityId) external view returns(address) {
    ICommunityToken[] memory contractsCommunityToken = getContractsCommunityToken(communityId);
    uint256 contractsCommunityTokenLength = contractsCommunityToken.length;
    return address(contractsCommunityToken[contractsCommunityTokenLength - 1]);
  }

  function getFactoryCommunitiesId() external view returns(uint32[] memory) {
    return factoryData.factoryCommunitiesId;
  }
}
