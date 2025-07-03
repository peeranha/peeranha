//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./interfaces/ICommunityTokenReward.sol";
import "./interfaces/ICommunityTokenRewardFactory.sol";
import "./libraries/CommonLib.sol";
import "./base/NativeMetaTransaction.sol";

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";


contract CommunityTokenReward is ICommunityTokenReward, NativeMetaTransaction, AccessControl {

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
    uint32 communityId;
  }

  struct CommunityTokenContainer {
    CommunityTokenInfo info;
    mapping(uint16 => RewardPeriodParams) rewardPeriodParams;    // period
    IPeeranhaUser peeranhaUser;
  }

  struct RewardPeriodParams {
    uint256 maxTotalTokenPool;
    uint256 maxRewardPerUser;
    uint256 availableBalance;
    uint256 totalTokenPool;

    mapping(address => bool) isRewardClaimedByAddress;
  }

  CommunityTokenContainer communityTokenContainer;

  event PeriodStarted(uint16 indexed period); 
  event CommunityRewardSettingsUpdated(address indexed userAddress, uint256 maxRewardPerPeriod, uint256 maxRewardPerUser);
  event RewardClaimed(address indexed userAddress, uint32 indexed communityId, uint16 indexed period);

  constructor(
    address tokenAddress,
    uint256 maxRewardPerPeriod,
    uint256 maxRewardPerUser,
    address communityTokenRewardFactoryAddress,
    uint32 communityId,
    address peeranhaUserContractAddress
  ) 
    NativeMetaTransaction("CommunityTokenReward")
  {
    require(tokenAddress != address(0), "token_address_is_zero"); // test

    communityTokenContainer.info.tokenAddress = tokenAddress;
    communityTokenContainer.info.name = IERC20Metadata(communityTokenContainer.info.tokenAddress).name();
    communityTokenContainer.info.symbol = IERC20Metadata(communityTokenContainer.info.tokenAddress).symbol();
    communityTokenContainer.info.maxRewardPerPeriod = maxRewardPerPeriod;
    communityTokenContainer.info.maxRewardPerUser = maxRewardPerUser;
    communityTokenContainer.info.createTime = CommonLib.getTimestamp();
    communityTokenContainer.info.communityTokenRewardFactoryAddress = communityTokenRewardFactoryAddress;
    communityTokenContainer.info.communityId = communityId;
    communityTokenContainer.peeranhaUser = IPeeranhaUser(peeranhaUserContractAddress);
  }

  // This is to support Native meta transactions
  // never use msg.sender directly, use _msgSender() instead
  function _msgSender()
      internal
      override(Context, NativeMetaTransaction)
      view
      returns (address sender)
  {
    return NativeMetaTransaction._msgSender();
  }

  function dispatcherCheck(address userAddress) internal {
    if (userAddress != _msgSender()) {
      communityTokenContainer.peeranhaUser.onlyDispatcher(_msgSender());
    }
  }

  function updateCommunityRewardSettings(address userAddress, uint256 maxRewardPerPeriod, uint256 maxRewardPerUser) external override {
    dispatcherCheck(userAddress); 
    communityTokenContainer.peeranhaUser.checkHasRole(_msgSender(), UserLib.ActionRole.CommunityAdmin, communityTokenContainer.info.communityId); // todo tests

    communityTokenContainer.info.maxRewardPerPeriod = maxRewardPerPeriod;
    communityTokenContainer.info.maxRewardPerUser = maxRewardPerUser;
    emit CommunityRewardSettingsUpdated(userAddress, maxRewardPerPeriod, maxRewardPerUser);
  }

  function getAvailableRewardsBalance() public view override returns(uint256) {   // public?
    uint256 balance = IERC20(communityTokenContainer.info.tokenAddress).balanceOf(address(this));
    if (balance <= communityTokenContainer.info.reservedTokens) {
      return 0;
    }

    return balance - communityTokenContainer.info.reservedTokens;
  }

  // get pool
  function getPeriodRewardParams(uint16 period) public view returns(uint256 totalTokenPool, uint256 maxTotalTokenPool, uint256 maxTokensPerUser, uint256 availableBalance) {
    RewardPeriodParams storage rewardPeriodParams = communityTokenContainer.rewardPeriodParams[period];
    return (rewardPeriodParams.totalTokenPool, rewardPeriodParams.maxTotalTokenPool, rewardPeriodParams.maxRewardPerUser, rewardPeriodParams.availableBalance);
  }

  // set pool
  function startNewPeriod(uint256 countActiveUsersInPeriod, uint16 currentPeriod) external override {
    require(_msgSender() == communityTokenContainer.info.communityTokenRewardFactoryAddress, "only_community_token_reward_factory_contract_can_call_this_action");

    RewardPeriodParams storage rewardPeriodParams = communityTokenContainer.rewardPeriodParams[currentPeriod];
    rewardPeriodParams.maxTotalTokenPool = communityTokenContainer.info.maxRewardPerPeriod;
    rewardPeriodParams.maxRewardPerUser = communityTokenContainer.info.maxRewardPerUser;
    rewardPeriodParams.availableBalance = getAvailableRewardsBalance();

    // ignore for first 2 period
    if (currentPeriod >= 2 && communityTokenContainer.rewardPeriodParams[currentPeriod - 2].availableBalance > 0) {  // todo test

      RewardPeriodParams storage claimPeriodRewardParams = communityTokenContainer.rewardPeriodParams[currentPeriod - 2];
      // check that the company has started for the currentPeriod - 2
      if (claimPeriodRewardParams.availableBalance > 0) {
        uint256 totalPeriodReward = claimPeriodRewardParams.maxTotalTokenPool;
        uint256 maxPeriodRewardForAllUser = countActiveUsersInPeriod * claimPeriodRewardParams.maxRewardPerUser;   // need min?
        totalPeriodReward = CommonLib.minUint256(totalPeriodReward, maxPeriodRewardForAllUser);
        totalPeriodReward = CommonLib.minUint256(totalPeriodReward, getAvailableRewardsBalance());
        communityTokenContainer.info.reservedTokens += totalPeriodReward;  // todo: tests

        claimPeriodRewardParams.totalTokenPool = totalPeriodReward;
      }
    }

    emit PeriodStarted(currentPeriod);
  }

  function claimReward(address userAddress, uint16 period) external override {
    dispatcherCheck(userAddress);
    require(!communityTokenContainer.rewardPeriodParams[period].isRewardClaimedByAddress[userAddress], "reward_already_claimed.");  // todo tests
    uint256 totalTokenPool = communityTokenContainer.rewardPeriodParams[period].totalTokenPool;
    require(totalTokenPool > 0, "pool_not_set");    // todo: tests

    uint32 communityId = communityTokenContainer.info.communityId;
    RewardLib.PeriodRewardShares memory periodRewardShares = communityTokenContainer.peeranhaUser.getPeriodCommunityRewardShares(period, communityId);
    int32 ratingToReward = communityTokenContainer.peeranhaUser.getRatingToReward(userAddress, period, communityId);
    uint256 userReward = getUserReward(periodRewardShares, CommonLib.toUInt32FromInt32(ratingToReward) * 1000, totalTokenPool);
    require(userReward > 0, "user reward is 0");  // todo tests

    IERC20Metadata(communityTokenContainer.info.tokenAddress).transfer(userAddress, userReward);
    communityTokenContainer.info.reservedTokens -= userReward;   // todo: tests
    communityTokenContainer.rewardPeriodParams[period].isRewardClaimedByAddress[userAddress] = true;

    emit RewardClaimed(userAddress, communityId, period);
  }

  function getUserReward(RewardLib.PeriodRewardShares memory periodRewardShares, uint32 ratingToReward, uint256 totalTokenPool) private pure returns(uint256) {
    if (ratingToReward == 0 || periodRewardShares.totalRewardShares == 0) return 0;

    uint256 userReward = (totalTokenPool * ratingToReward);
    userReward /= periodRewardShares.totalRewardShares;
    return userReward;
  }

  function getCommunityTokenRewardData() external view override returns (CommunityTokenInfo memory) {
    return communityTokenContainer.info;
  }

  function getVersion() public pure returns (uint256) {
    return 2;
  }
}
