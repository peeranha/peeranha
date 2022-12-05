//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./interfaces/IPeeranhaCommunityToken.sol";
import "./interfaces/IPeeranhaCommunityTokenFactory.sol";
import "./libraries/CommonLib.sol";
import "./base/NativeMetaTransaction.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";

// transfer: 
//    payable(userAddress).transfer(amount);
//    IERC20Upgradeable(tokenAddress).transfer(userAddress, 2);
//
// balace:
//    userAddress.balance
//    IERC20Upgradeable(tokenAddress).balanceOf(userAddress)


contract PeeranhaCommunityToken is IPeeranhaCommunityToken, NativeMetaTransaction {
  ///
  // todo: 
  // get CommunityToken -> (info)
  // array communities token
  ///
  
  struct CommunityToken {
    string name;
    string symbol;
    address contractAddress;
    uint256 maxRewardPerPeriod;
    uint256 activeUsersInPeriod;
    uint256 maxRewardPerUser;
    uint256 sumAccruedTokens;   // need?
    uint256 sumSpentTokens;
    uint256 createTime;
    mapping(uint16 => uint256) periodPool;
    address peeranhaCommunityTokenFactoryAddress;
  }

  CommunityToken communityToken;

  constructor(address contractAddress, uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod, address peeranhaCommunityTokenFactoryAddress) {
    if (contractAddress == address(0))
      communityToken.contractAddress = address(0x0000000000000000000000000000000000001010); // chack Address !
    else
      communityToken.contractAddress = contractAddress;
    communityToken.name = IERC20MetadataUpgradeable(communityToken.contractAddress).name();
    communityToken.symbol = IERC20MetadataUpgradeable(communityToken.contractAddress).symbol();
    communityToken.maxRewardPerPeriod = maxRewardPerPeriod;
    communityToken.activeUsersInPeriod = activeUsersInPeriod;
    communityToken.maxRewardPerUser = maxRewardPerPeriod / activeUsersInPeriod;
    communityToken.createTime = CommonLib.getTimestamp();
    communityToken.peeranhaCommunityTokenFactoryAddress = peeranhaCommunityTokenFactoryAddress;
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

  function updateCommunityRewardSettings(uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod) public override {
    communityToken.maxRewardPerPeriod = maxRewardPerPeriod;
    communityToken.activeUsersInPeriod = activeUsersInPeriod;
    communityToken.maxRewardPerUser = maxRewardPerPeriod / activeUsersInPeriod;
  }

  function getBalance() public view override returns(uint256) {   // public?
    uint256 balance;
    balance = IERC20Upgradeable(communityToken.contractAddress).balanceOf(address(this));

    require(balance >= communityToken.sumSpentTokens, "error_balance");
    return balance - communityToken.sumSpentTokens;
  }

  // get pool
  function getTotalPeriodReward(uint16 period) private view returns(uint256) {
    return communityToken.periodPool[period];
  }

  // set pool
  function setTotalPeriodReward(RewardLib.PeriodRewardShares memory periodRewardShares, uint16 period) external override {
    require(_msgSender() == communityToken.peeranhaCommunityTokenFactoryAddress, "only_community_token_factory_can_call_this_action");

    uint256 totalPeriodReward = communityToken.maxRewardPerPeriod * IERC20MetadataUpgradeable(communityToken.contractAddress).decimals();
    if (periodRewardShares.activeUsersInPeriod.length <= communityToken.activeUsersInPeriod) {
      uint256 maxPeriodRewardPerUser = periodRewardShares.activeUsersInPeriod.length * communityToken.maxRewardPerUser * IERC20MetadataUpgradeable(communityToken.contractAddress).decimals();   // min?
      totalPeriodReward = CommonLib.minUint256(totalPeriodReward, maxPeriodRewardPerUser);
    }
    totalPeriodReward = CommonLib.minUint256(totalPeriodReward, getBalance());
    
    communityToken.sumSpentTokens += totalPeriodReward;
    communityToken.periodPool[period] = totalPeriodReward;
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
    require(userReward != 0, "no_reward");

    IERC20MetadataUpgradeable(communityToken.contractAddress).transfer(userAddress, userReward);
    communityToken.sumSpentTokens -= userReward;
  }
}
