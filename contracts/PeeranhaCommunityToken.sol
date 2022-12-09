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
  // todo
  // getPool
  ///
  struct CommunityToken {
    string name;
    string symbol;
    address contractAddress;
    uint256 maxRewardPerPeriod;
    uint256 activeUsersInPeriod;
    uint256 maxRewardPerUser;
    // uint256 sumAccruedTokens;   // need?
    uint256 sumSpentTokens;
    uint256 createTime;
    address peeranhaCommunityTokenFactoryAddress;
  }

  struct CommunityTokenContainer {
    CommunityToken info;
    mapping(uint16 => uint256) periodPool;
  }

  CommunityTokenContainer communityTokenContainer;

  constructor(address contractAddress, uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod, address peeranhaCommunityTokenFactoryAddress) {
    if (contractAddress == address(0))
      communityTokenContainer.info.contractAddress = address(0x0000000000000000000000000000000000001010); // chack Address !
    else
      communityTokenContainer.info.contractAddress = contractAddress;
    communityTokenContainer.info.name = IERC20MetadataUpgradeable(communityTokenContainer.info.contractAddress).name();
    communityTokenContainer.info.symbol = IERC20MetadataUpgradeable(communityTokenContainer.info.contractAddress).symbol();
    communityTokenContainer.info.maxRewardPerPeriod = maxRewardPerPeriod;
    communityTokenContainer.info.activeUsersInPeriod = activeUsersInPeriod;
    communityTokenContainer.info.maxRewardPerUser = maxRewardPerPeriod / activeUsersInPeriod;
    communityTokenContainer.info.createTime = CommonLib.getTimestamp();
    communityTokenContainer.info.peeranhaCommunityTokenFactoryAddress = peeranhaCommunityTokenFactoryAddress;
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
    communityTokenContainer.info.maxRewardPerPeriod = maxRewardPerPeriod;
    communityTokenContainer.info.activeUsersInPeriod = activeUsersInPeriod;
    communityTokenContainer.info.maxRewardPerUser = maxRewardPerPeriod / activeUsersInPeriod;
  }

  function getBalance() public view override returns(uint256) {   // public?
    uint256 balance;
    balance = IERC20Upgradeable(communityTokenContainer.info.contractAddress).balanceOf(address(this));

    require(balance >= communityTokenContainer.info.sumSpentTokens, "error_balance");
    return balance - communityTokenContainer.info.sumSpentTokens;
  }

  // get pool
  function getTotalPeriodReward(uint16 period) private view returns(uint256) {
    return communityTokenContainer.periodPool[period];
  }

  // set pool
  function setTotalPeriodReward(RewardLib.PeriodRewardShares memory periodRewardShares, uint16 period) external override {
    require(_msgSender() == communityTokenContainer.info.peeranhaCommunityTokenFactoryAddress, "only_community_token_factory_can_call_this_action");

    uint256 totalPeriodReward = communityTokenContainer.info.maxRewardPerPeriod * IERC20MetadataUpgradeable(communityTokenContainer.info.contractAddress).decimals();
    if (periodRewardShares.activeUsersInPeriod.length <= communityTokenContainer.info.activeUsersInPeriod) {
      uint256 maxPeriodRewardPerUser = periodRewardShares.activeUsersInPeriod.length * communityTokenContainer.info.maxRewardPerUser * IERC20MetadataUpgradeable(communityTokenContainer.info.contractAddress).decimals();   // min?
      totalPeriodReward = CommonLib.minUint256(totalPeriodReward, maxPeriodRewardPerUser);
    }
    totalPeriodReward = CommonLib.minUint256(totalPeriodReward, getBalance());
    
    communityTokenContainer.info.sumSpentTokens += totalPeriodReward;
    communityTokenContainer.periodPool[period] = totalPeriodReward;
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

    IERC20MetadataUpgradeable(communityTokenContainer.info.contractAddress).transfer(userAddress, userReward);
    communityTokenContainer.info.sumSpentTokens -= userReward;
  }

  function getCommunityToken() external view override returns (CommunityToken memory) {
    return communityTokenContainer.info;
  }
}
