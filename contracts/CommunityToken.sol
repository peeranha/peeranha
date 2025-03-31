//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./interfaces/ICommunityToken.sol";
import "./interfaces/ICommunityTokenRewardFactory.sol";
import "./libraries/CommonLib.sol";
import "./base/NativeMetaTransaction.sol";

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";


// transfer: 
//    payable(userAddress).transfer(amount);
//    IERC20Upgradeable(tokenAddress).transfer(userAddress, 2);
//
// balace:
//    userAddress.balance
//    IERC20Upgradeable(tokenAddress).balanceOf(userAddress)


contract CommunityToken is ICommunityToken, NativeMetaTransaction {  

  // sumAccruedTokens -> free tokens (added - pool)
  // sumSpentTokens -> active tokens tokens (pools - give reward)
  // reservedTokens - not taked pool
  struct CommunityTokenInfo {
    string name;
    string symbol;
    address tokenAddress;
    uint256 maxRewardPerPeriod;
    uint256 maxRewardPerUser;
    uint256 reservedTokens;
    uint256 createTime;
    address communityTokenRewardFactoryAddress;
  }

  struct CommunityTokenContainer {
    CommunityTokenInfo info;
    mapping(uint16 => uint256) readyToClaimRewardPool;
  }

  CommunityTokenContainer communityTokenContainer;

  event AddBalance(uint256 indexed amount);   // name

  constructor(address tokenAddress, uint256 maxRewardPerPeriod, uint256 maxRewardPerUser, address communityTokenRewardFactoryAddress) {
    // if address = 0?
    communityTokenContainer.info.tokenAddress = tokenAddress;
    communityTokenContainer.info.name = IERC20Metadata(communityTokenContainer.info.tokenAddress).name();
    communityTokenContainer.info.symbol = IERC20Metadata(communityTokenContainer.info.tokenAddress).symbol();
    communityTokenContainer.info.maxRewardPerPeriod = maxRewardPerPeriod;
    communityTokenContainer.info.maxRewardPerUser = maxRewardPerUser;
    communityTokenContainer.info.createTime = CommonLib.getTimestamp();
    communityTokenContainer.info.communityTokenRewardFactoryAddress = communityTokenRewardFactoryAddress;
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

  function updateCommunityRewardSettings(uint256 maxRewardPerPeriod, uint256 maxRewardPerUser) external override {
    communityTokenContainer.info.maxRewardPerPeriod = maxRewardPerPeriod;
    communityTokenContainer.info.maxRewardPerUser = maxRewardPerUser;
  }

  function getAvailableRewardsBalance() public view override returns(uint256) {   // public?
    uint256 balance = IERC20(communityTokenContainer.info.tokenAddress).balanceOf(address(this));
    if (balance <= communityTokenContainer.info.reservedTokens) {
      return 0;
    }

    return balance - communityTokenContainer.info.reservedTokens;
  }

  // get pool
  function getTotalPeriodReward(uint16 period) public view returns(uint256) {
    return communityTokenContainer.readyToClaimRewardPool[period];
  }

  // set pool
  function setReadyToClaimPeriodRewards(RewardLib.PeriodRewardShares memory periodRewardShares, uint16 period) external override {
    require(_msgSender() == communityTokenContainer.info.communityTokenRewardFactoryAddress, "only_community_token_reward_factory_contract_can_call_this_action");

    uint256 totalPeriodReward = communityTokenContainer.info.maxRewardPerPeriod;
    uint256 maxPeriodRewardForAllUser = periodRewardShares.activeUsersInPeriod.length * communityTokenContainer.info.maxRewardPerUser;   // min?
    totalPeriodReward = CommonLib.minUint256(totalPeriodReward, maxPeriodRewardForAllUser);

    totalPeriodReward = CommonLib.minUint256(totalPeriodReward, getAvailableRewardsBalance());
    communityTokenContainer.info.reservedTokens += totalPeriodReward;  // todo: tests
    
    communityTokenContainer.readyToClaimRewardPool[period] = totalPeriodReward;
  }

  function getUserCommunityReward(RewardLib.PeriodRewardShares memory periodRewardShares, uint32 ratingToReward, uint16 period) public view override returns(uint256) {
    uint256 totalPeriodReward = getTotalPeriodReward(period);
    uint256 userReward = getUserReward(periodRewardShares, ratingToReward * 1000, totalPeriodReward);

    return userReward;
  }

  function claimReward(RewardLib.PeriodRewardShares memory periodRewardShares, address userAddress, uint32 ratingToReward, uint16 period) external override {
    uint256 userReward = getUserCommunityReward(periodRewardShares, ratingToReward, period);

    if (userReward > 0) {
      IERC20Metadata(communityTokenContainer.info.tokenAddress).transfer(userAddress, userReward);
      communityTokenContainer.info.reservedTokens -= userReward;   // todo: tests
    }
  }

  function getUserReward(RewardLib.PeriodRewardShares memory periodRewardShares, uint32 ratingToReward, uint256 poolToken) private pure returns(uint256) {
    if (ratingToReward == 0 || periodRewardShares.totalRewardShares == 0) return 0;

    uint256 userReward = (poolToken * ratingToReward);
    userReward /= periodRewardShares.totalRewardShares;
    return userReward;
  }

  function getCommunityTokenData() external view override returns (CommunityTokenInfo memory) {
    return communityTokenContainer.info;
  }
}
