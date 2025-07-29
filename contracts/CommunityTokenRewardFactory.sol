//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


import "./interfaces/ICommunityTokenRewardFactory.sol";
import "./interfaces/IPeeranhaUser.sol";
import "./interfaces/IPeeranhaCommunity.sol";

import "./CommunityTokenReward.sol";
import "./base/NativeMetaTransactionUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";


contract CommunityTokenRewardFactory is ICommunityTokenRewardFactory, NativeMetaTransactionUpgradeable, AccessControlEnumerableUpgradeable {
  struct FactoryData {
    mapping(uint32 => ICommunityTokenReward[]) communitiesTokenReward;  // communityId
    mapping(uint16 => bool) isSetPool;  // period
    uint32[] factoryCommunitiesId;
    IPeeranhaUser peeranhaUser;
    IPeeranhaCommunity peeranhaCommunity;
  }

  bytes32 public constant OWNER_COMMUNITY_TOKEN_FACTORY = bytes32(keccak256("OWNER_COMMUNITY_TOKEN_FACTORY")); // add START_FACTORY_PERIOD_ROLE

  FactoryData factoryData;

  event CommunityTokenCreated(address indexed communityTokenContractAddress, uint32 indexed communityId);
  event FactoryPeriodStarted(uint16 indexed period); 

  function initialize(address peeranhaUserContractAddress, address peeranhaCommunityContractAddress) public initializer {
    factoryData.peeranhaUser = IPeeranhaUser(peeranhaUserContractAddress);
    factoryData.peeranhaCommunity = IPeeranhaCommunity(peeranhaCommunityContractAddress);
    __Factory_init();
  }

  function __Factory_init() internal onlyInitializing {
    _grantRole(OWNER_COMMUNITY_TOKEN_FACTORY, _msgSender());
    _setRoleAdmin(OWNER_COMMUNITY_TOKEN_FACTORY, DEFAULT_ADMIN_ROLE);
  }

  function dispatcherCheck(address userAddress) internal {
    if (userAddress != _msgSender()) {
      factoryData.peeranhaUser.onlyDispatcher(_msgSender());
    }
  }

  function createNewCommunityTokenReward(address userAddress, uint32 communityId, address tokenAddress, uint256 maxRewardPerPeriod, uint256 maxRewardPerUser) external override {
    dispatcherCheck(userAddress);
    factoryData.peeranhaUser.checkHasRole(_msgSender(), UserLib.ActionRole.Admin, 0); // todo test

    factoryData.peeranhaCommunity.onlyExistingAndNotFrozenCommunity(userAddress, communityId);
    factoryData.communitiesTokenReward[communityId].push(new CommunityTokenReward(tokenAddress, maxRewardPerPeriod, maxRewardPerUser, address(this), communityId, address(factoryData.peeranhaUser)));
    
    bool existingCommunityId;
    for (uint256 i; i < factoryData.factoryCommunitiesId.length; i++) {
      if (factoryData.factoryCommunitiesId[i] == communityId)
        existingCommunityId = true;
    }
    if (!existingCommunityId) {
      factoryData.factoryCommunitiesId.push(communityId);
    }

    uint256 contractsCommunityTokenRewardLength = factoryData.communitiesTokenReward[communityId].length;
    address communityTokenAddress = address(factoryData.communitiesTokenReward[communityId][contractsCommunityTokenRewardLength - 1]);
    emit CommunityTokenCreated(communityTokenAddress, communityId);
  }

  // This is to support Native meta transactions
  // never use msg.sender directly, use _msgSender() instead
  function _msgSender()
      internal
      override(ContextUpgradeable, NativeMetaTransactionUpgradeable)
      view
      returns (address sender)
  {
      return NativeMetaTransactionUpgradeable._msgSender();
  }
  
  // set pools
  function startPeriod() external override onlyRole(OWNER_COMMUNITY_TOKEN_FACTORY) {
    uint16 period = RewardLib.getPeriod();
    require(!factoryData.isSetPool[period], "pool_already_set");    // todo: tests
    factoryData.isSetPool[period] = true;

    uint256 rewardCommunitiesLength = factoryData.factoryCommunitiesId.length;
    for (uint256 i; i < rewardCommunitiesLength; i++) {
      uint256 countActiveUsersInPeriod = factoryData.peeranhaUser.getCountCommunityActiveUsersInPeriodWithPositiveRating(period - 2, factoryData.factoryCommunitiesId[i]);
      ICommunityTokenReward[] memory contractsCommunityToken = getContractsCommunityToken(factoryData.factoryCommunitiesId[i]);
      uint256 contractsCommunityTokenLength = contractsCommunityToken.length;
      for (uint256 communityTokenIndex; communityTokenIndex < contractsCommunityTokenLength; communityTokenIndex++) {
        ICommunityTokenReward communityToken = contractsCommunityToken[communityTokenIndex];
        if (address(communityToken) != address(0)) {
          communityToken.startNewPeriod(countActiveUsersInPeriod, period);
        }
      }
    }

    emit FactoryPeriodStarted(period);
  }


  function getContractCommunityTokenReward(uint32 communityId, address communityTokenContractAddress) public view returns(ICommunityTokenReward) {
    ICommunityTokenReward[] memory icontractsCommunityToken =  getContractsCommunityToken(communityId);

    for (uint32 communityToken; communityToken < icontractsCommunityToken.length; communityToken++) {
      ICommunityTokenReward iCommunityTokenReward = icontractsCommunityToken[communityToken];
      if (address(iCommunityTokenReward) == communityTokenContractAddress)
        return iCommunityTokenReward;
    }
    revert("Community_token_contract_not_exist"); // todo: tests
  }

  function getContractsCommunityToken(uint32 communityId) public view returns(ICommunityTokenReward[] memory) {
    require(factoryData.communitiesTokenReward[communityId].length != 0, "Token_communityId_not_exist");
    return factoryData.communitiesTokenReward[communityId];
  }

  // only for unit tests  // todo: add change-env-value
  function getAddressLastCreatedContract(uint32 communityId) external view returns(address) {
    ICommunityTokenReward[] memory contractsCommunityToken = getContractsCommunityToken(communityId);
    uint256 contractsCommunityTokenLength = contractsCommunityToken.length;
    return address(contractsCommunityToken[contractsCommunityTokenLength - 1]);
  }

  function getFactoryCommunitiesId() external view returns(uint32[] memory) {
    return factoryData.factoryCommunitiesId;
  }

  function isSetPoolForCurrentPeriod() override external view returns(bool) {
    uint16 period = RewardLib.getPeriod();
    return factoryData.isSetPool[period];
  }

    // function getUserCommunityReward(address userAddress, uint16 period, uint32 communityId, address communityTokenContractAddress) public view override returns(uint256) {
  //   RewardLib.PeriodRewardShares memory periodRewardShares = factoryData.peeranhaUser.getPeriodCommunityRewardShares(period, communityId);
  //   int32 ratingToReward = factoryData.peeranhaUser.getRatingToReward(userAddress, period, communityId);
  //   uint256 userReward = getContractCommunityTokenReward(communityId, communityTokenContractAddress).getUserCommunityReward(periodRewardShares, CommonLib.toUInt32FromInt32(ratingToReward), period);

  //   return userReward;
  // }

  // function getCommunityToken(address communityTokenContractAddress, uint32 communityId) external view returns(communityTokenReward.CommunityTokenReward memory) {
  //   ICommunityTokenReward communityTokenReward = getContractCommunityTokenReward(communityId, communityTokenContractAddress);
  //   return communityTokenReward.getCommunityTokenRewardData();
  // }

  function getVersion() public pure returns (uint256) {
    return 10;
  }
}
