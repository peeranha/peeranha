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

  // sumAccruedTokens -> free tokens (added - pool)
  // sumSpentTokens -> active tokens tokens (pools - give reward)
  // frezeTokens - not taked pool
  struct CommunityToken {
    string name;
    string symbol;
    address tokenAddress;
    uint256 maxRewardPerPeriod;
    uint256 activeUsersInPeriod;
    uint256 maxRewardPerUser;
    uint256 frezeTokens;
    uint256 createTime;
    address peeranhaCommunityTokenFactoryAddress;
  }

  struct CommunityTokenContainer {
    CommunityToken info;
    mapping(uint16 => uint256) periodPool;
  }

  CommunityTokenContainer communityTokenContainer;

  event AddBalance(uint256 indexed amount);   // name

  constructor(address tokenAddress, uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod, address peeranhaCommunityTokenFactoryAddress) {
    if (tokenAddress == address(0))
      communityTokenContainer.info.tokenAddress = address(0x0000000000000000000000000000000000001010); // chack Address !
    else
      communityTokenContainer.info.tokenAddress = tokenAddress;
    communityTokenContainer.info.name = IERC20MetadataUpgradeable(communityTokenContainer.info.tokenAddress).name();
    communityTokenContainer.info.symbol = IERC20MetadataUpgradeable(communityTokenContainer.info.tokenAddress).symbol();
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

  function addBalance(uint256 amount) external {  // name
    address owner = _msgSender();
    IERC20Upgradeable(communityTokenContainer.info.tokenAddress).transferFrom(owner, address(this), amount);

    emit AddBalance(amount);
  }

  function updateCommunityRewardSettings(uint256 maxRewardPerPeriod, uint256 activeUsersInPeriod) external override {
    communityTokenContainer.info.maxRewardPerPeriod = maxRewardPerPeriod;
    communityTokenContainer.info.activeUsersInPeriod = activeUsersInPeriod;
    communityTokenContainer.info.maxRewardPerUser = maxRewardPerPeriod / activeUsersInPeriod;
  }

  function getBalance() public view override returns(uint256) {   // public?
    uint256 balance = IERC20Upgradeable(communityTokenContainer.info.tokenAddress).balanceOf(address(this));
    require(balance >= communityTokenContainer.info.frezeTokens, "error_balance"); // todo: test??

    return balance - communityTokenContainer.info.frezeTokens;
  }

  // get pool
  function getTotalPeriodReward(uint16 period) private view returns(uint256) {
    return communityTokenContainer.periodPool[period];
  }

  // set pool
  function setTotalPeriodReward(RewardLib.PeriodRewardShares memory periodRewardShares, uint16 period) external override {
    require(_msgSender() == communityTokenContainer.info.peeranhaCommunityTokenFactoryAddress, "only_community_token_factory_can_call_this_action");

    uint256 totalPeriodReward = communityTokenContainer.info.maxRewardPerPeriod * 10 ** IERC20MetadataUpgradeable(communityTokenContainer.info.tokenAddress).decimals();
    if (periodRewardShares.activeUsersInPeriod.length <= communityTokenContainer.info.activeUsersInPeriod) {
      uint256 maxPeriodRewardPerUser = periodRewardShares.activeUsersInPeriod.length * communityTokenContainer.info.maxRewardPerUser * 10 ** IERC20MetadataUpgradeable(communityTokenContainer.info.tokenAddress).decimals();   // min?
      totalPeriodReward = CommonLib.minUint256(totalPeriodReward, maxPeriodRewardPerUser);
    }
    totalPeriodReward = CommonLib.minUint256(totalPeriodReward, getBalance());
    communityTokenContainer.info.frezeTokens += totalPeriodReward;  // todo: tests
    
    communityTokenContainer.periodPool[period] = totalPeriodReward;
  }

  function getUserCommunityReward(RewardLib.PeriodRewardShares memory periodRewardShares, uint32 ratingToReward, uint16 period) public view override returns(uint256) {
    uint256 poolToken = getTotalPeriodReward(period);
    uint256 userReward = getUserReward(periodRewardShares, ratingToReward * 1000, poolToken);

    return userReward;
  }

  function payCommunityReward(RewardLib.PeriodRewardShares memory periodRewardShares, address userAddress, uint32 ratingToReward, uint16 period) external override {
    uint256 userReward = getUserCommunityReward(periodRewardShares, ratingToReward, period);

    if (userReward > 0) {
      IERC20MetadataUpgradeable(communityTokenContainer.info.tokenAddress).transfer(userAddress, userReward);
      communityTokenContainer.info.frezeTokens -= userReward;   // todo: tests
    }
  }

  function getUserReward(RewardLib.PeriodRewardShares memory periodRewardShares, uint32 ratingToReward, uint256 poolToken) private pure returns(uint256) {
    if (ratingToReward == 0 || periodRewardShares.totalRewardShares == 0) return 0;

    uint256 userReward = (poolToken * ratingToReward);
    userReward /= periodRewardShares.totalRewardShares;
    return userReward;
  }

  function getCommunityTokenData() external view override returns (CommunityToken memory) {
    return communityTokenContainer.info;
  }
}
