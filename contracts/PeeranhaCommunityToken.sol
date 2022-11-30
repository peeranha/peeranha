//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./interfaces/IPeeranhaCommunityToken.sol";
import "./interfaces/IPeeranhaCommunityTokenFactory.sol";
import "./libraries/CommonLib.sol";


import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20CappedUpgradeable.sol";

// transfer: 
//    payable(userAddress).transfer(amount);
//    IERC20Upgradeable(tokenAddress).transfer(userAddress, 2);
//
// balace:
//    userAddress.balance
//    IERC20(tokenAddress).balanceOf(userAddress)


contract PeeranhaCommunityToken is ERC20CappedUpgradeable, IPeeranhaCommunityToken {
  uint256 public constant FRACTION = (10 ** 18);
  
  struct CommunityToken {
    string name;
    string symbol;
    address contractAddress;
    uint256 maxRewardPerPeriod;
    uint256 activeUsersInPeriod;
    uint256 maxRewardPerUser;
    uint256 sumAccruedTokens;
    uint256 sumSpentTokens;
    uint256 createTime;
    mapping(uint16 => uint256) periodPool;
    address peeranhaCommunityTokenFactoryAddress;     // address or interface?
  }

  CommunityToken communityToken;

  constructor(string memory name, string memory symbol, address contractAddress, uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod, address peeranhaCommunityTokenFactoryAddress) {
    communityToken.name = name;
    communityToken.symbol = symbol;
    communityToken.contractAddress = contractAddress;
    communityToken.maxRewardPerPeriod = maxRewardPerPeriod;
    communityToken.activeUsersInPeriod = activeUsersInPeriod;
    communityToken.maxRewardPerUser = maxRewardPerPeriod / activeUsersInPeriod;
    communityToken.createTime = CommonLib.getTimestamp();   // how set?
    communityToken.peeranhaCommunityTokenFactoryAddress = peeranhaCommunityTokenFactoryAddress;
  }

  function getBalance() public view override returns(uint256) {   // public?
    uint256 balance;
    if (communityToken.contractAddress == address(0)) {
      balance = address(this).balance;
    } else {
      balance = IERC20Upgradeable(communityToken.contractAddress).balanceOf(address(this));
    }

    require(balance >= communityToken.sumSpentTokens, "error_balance");
    return balance - communityToken.sumSpentTokens;
  }

  // get pool
  function getTotalPeriodReward(uint16 period) private view returns(uint256) {
    return communityToken.periodPool[period];
  }

  // set pool
  function setTotalPeriodReward(RewardLib.PeriodRewardShares memory periodRewardShares, uint16 period) external override {
    uint256 totalPeriodReward = reduceRewards(communityToken.maxRewardPerPeriod * FRACTION, period);
    if (periodRewardShares.activeUsersInPeriod.length <= communityToken.activeUsersInPeriod) {
      uint256 maxPeriodRewardPerUser = periodRewardShares.activeUsersInPeriod.length * communityToken.maxRewardPerUser * FRACTION;   // min?
      totalPeriodReward = CommonLib.minUint256(totalPeriodReward, maxPeriodRewardPerUser);
    }
    totalPeriodReward = CommonLib.minUint256(totalPeriodReward, getBalance());

    communityToken.periodPool[period] = totalPeriodReward;
  }

  function reduceRewards(uint256 rewardPeriod, uint16 period) private pure returns(uint256) {
    uint16 countReduce = period / 52;

    for (uint16 i = 0; i < countReduce; i++) {
      rewardPeriod = (rewardPeriod * 93) / 100;
    }

    return rewardPeriod;
  }

  function getUserReward(RewardLib.PeriodRewardShares memory periodRewardShares, uint32 tokenReward, uint256 poolToken) private pure returns(uint256) {
    if (tokenReward == 0 || periodRewardShares.totalRewardShares == 0) return 0;

    uint256 userReward = (poolToken * tokenReward);
    userReward /= periodRewardShares.totalRewardShares;
    return userReward;
  }

  function payCommunityReward(RewardLib.PeriodRewardShares memory periodRewardShares, address userAddress, uint16 period) external override {
    uint256 poolToken = getTotalPeriodReward(period);
    uint256 userReward = getUserReward(periodRewardShares, period, poolToken);

    if (communityToken.contractAddress == address(0)) {   // native token
      payable(userAddress).transfer(userReward);
    } else {
      IERC20Upgradeable(communityToken.contractAddress).transfer(userAddress, userReward);
    }
  }
}
