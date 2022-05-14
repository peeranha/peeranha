//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./libraries/RewardLib.sol";
import "./libraries/CommonLib.sol";
import "./libraries/TokenLib.sol";
import "./base/ChildMintableERC20Upgradeable.sol";
import "./interfaces/IPeeranhaToken.sol";
import "./interfaces/IPeeranhaUser.sol";


import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";

contract PeeranhaToken is IPeeranhaToken, ChildMintableERC20Upgradeable, ERC20PausableUpgradeable, OwnableUpgradeable {
  uint256 public constant FRACTION = (10 ** 18);
  // uint256 public constant TOTAL_SUPPLY = 1000000000 * FRACTION;
  uint256 public constant MAX_REWARD_PER_PERIOD = 100000;
  uint256 public constant MAX_REWARD_PER_USER = 100;
  uint256 public constant ACTIVE_USERS_IN_PERIOD = 1000;

  
  ///
  // 100 000  - 100 token * 1000 user
  // 40 000 000 - company
  ///
  // TODO: add actions that allow owner to mint 40% of total token supply
  // rewrite transfer - boost, balanceOf - boost
  // add method getUserStakedBalance
  // getstakedbalance (transfer + get balance)
  ///

  TokenLib.StatusRewardContainer statusRewardContainer;
  TokenLib.UserPeriodStake userPeriodStake;
  TokenLib.StakeTotalContainer stakeTotalContainer;
  IPeeranhaUser peeranhaUser;

  event GetReward(address user, uint16 period);
  event SetStake(address user, uint16 period, uint256 stake);


  function initialize(string memory name, string memory symbol, address peeranhaUserContractAddress, address childChainManager) public initializer {
    __Token_init(name, symbol, childChainManager);
    __Ownable_init_unchained();
    peeranhaUser = IPeeranhaUser(peeranhaUserContractAddress);
  }

  function __Token_init(string memory name, string memory symbol, address childChainManager) internal onlyInitializing {
    __ChildMintableERC20Upgradeable_init(name, symbol, childChainManager);
    __Pausable_init_unchained();
    __ERC20Pausable_init_unchained();
    __Token_init_unchained();
  }

  function __Token_init_unchained() internal onlyInitializing {
  }

  function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override(ERC20Upgradeable, ERC20PausableUpgradeable/*, ERC20CappedUpgradeable*/) {
    super._beforeTokenTransfer(from, to, amount);
  }

  // This is to support Native meta transactions
  // never use msg.sender directly, use _msgSender() instead
  function _msgSender()
      internal
      override(ContextUpgradeable, ChildMintableERC20Upgradeable)
      view
      returns (address sender)
  {
      return ChildMintableERC20Upgradeable._msgSender();
  }

  function availableBalanceOf(address account) external view returns(uint256) { // unitTest
    TokenLib.StakeUserContainer storage stakeUserContainer = userPeriodStake.userPeriodStake[account];
    uint16 period = RewardLib.getPeriod(CommonLib.getTimestamp()) + 1;

    uint256 stakedToken;
    if (stakeUserContainer.stakeChangePeriods.length > 0) {
      uint16 lastStakePeriod = stakeUserContainer.stakeChangePeriods[stakeUserContainer.stakeChangePeriods.length - 1];
      TokenLib.UserStake storage userStake = stakeUserContainer.userStake[lastStakePeriod];
      stakedToken = userStake.stakedAmount;
      if (lastStakePeriod == period) { // unitTest
        stakedToken += userStake.changedStake;
      }
    }

    return balanceOf(account) - stakedToken;
  }


  ///
  // to do cap
  ///
  function mintForOwner(uint256 mintTokens) external onlyOwner() {
    // add limit
    _mint(owner(), mintTokens);
  }

  /**
   * @dev Paid token.
   *
   * Requirements:
   *
   * - must be a user.
   * - must be a reward in this period.
   * - must be a period less then now.
  */
  function claimReward(address user, uint16 period) external {
    require(msg.sender == user || msg.sender == owner(), "get_reward_security");  // unitTest
    require(RewardLib.getPeriod(CommonLib.getTimestamp()) > period + 1, "period_not_ended");

    require(
      !statusRewardContainer.statusReward[user][period].isPaid,
      "reward_already_picked_up."
    );

    statusRewardContainer.statusReward[user][period].isPaid = true;
    RewardLib.PeriodRewardShares memory periodRewardShares = peeranhaUser.getPeriodRewardShares(period);
    
    uint256 totalPeriodReward = getTotalPeriodReward(periodRewardShares, period);

    uint256 userReward = getUserReward(periodRewardShares, user, period, totalPeriodReward);

    require(userReward != 0, "no_reward");

    emit GetReward(user, period);
    _mint(user, userReward);
  }

  function setStake(address user, uint256 stakeTokens) external {
    require(msg.sender == user, "get_reward_security");  // unitTest
    require(stakeTokens <= balanceOf(user), "wrong_stake");
    uint16 nextPeriod = RewardLib.getPeriod(CommonLib.getTimestamp()) + 1;
    TokenLib.StakeUserContainer storage stakeUserContainer = userPeriodStake.userPeriodStake[user];

    TokenLib.StakeTotal storage stakeTotal = stakeTotalContainer.stakeTotals[nextPeriod];
    uint256 stakeChangePeriodsLength = stakeTotalContainer.stakeChangePeriods.length;
    if (stakeChangePeriodsLength != 0 && stakeTotalContainer.stakeChangePeriods[stakeChangePeriodsLength - 1] != nextPeriod) {
      uint16 previousPeriod = stakeTotalContainer.stakeChangePeriods[stakeChangePeriodsLength - 1];
      stakeTotal.totalStakedAmount = stakeTotalContainer.stakeTotals[previousPeriod].totalStakedAmount;
      stakeTotal.stakingUsersCount = stakeTotalContainer.stakeTotals[previousPeriod].stakingUsersCount;
      stakeTotalContainer.stakeChangePeriods.push(nextPeriod);
    } else if (stakeChangePeriodsLength == 0) {
      stakeTotalContainer.stakeChangePeriods.push(nextPeriod);
    }

    uint256 stakeUserChangePeriodsLength = stakeUserContainer.stakeChangePeriods.length;
    if (stakeUserChangePeriodsLength != 0) {
      uint16 lastStakePeriod = stakeUserContainer.stakeChangePeriods[stakeUserChangePeriodsLength - 1];
      if (lastStakePeriod != nextPeriod) {
        stakeUserContainer.stakeChangePeriods.push(nextPeriod);
      }

      uint256 lastUserStakeAmount = stakeUserContainer.userStake[lastStakePeriod].stakedAmount;
      if (lastUserStakeAmount > stakeTokens) {
        stakeTotal.totalStakedAmount -= lastUserStakeAmount - stakeTokens;
        if (stakeTokens == 0) stakeTotal.stakingUsersCount--;
        stakeUserContainer.userStake[nextPeriod].changedStake = lastUserStakeAmount - stakeTokens;

      } else {
        stakeTotal.totalStakedAmount += stakeTokens - lastUserStakeAmount;
        if (lastUserStakeAmount == 0) stakeTotal.stakingUsersCount++;
      }
      stakeUserContainer.userStake[nextPeriod].stakedAmount = stakeTokens;

    } else {
      stakeUserContainer.stakeChangePeriods.push(nextPeriod);
      stakeUserContainer.userStake[nextPeriod].stakedAmount = stakeTokens;

      stakeTotal.totalStakedAmount += stakeTokens;
      stakeTotal.stakingUsersCount++;
    }
  }

  function getTotalPeriodReward(RewardLib.PeriodRewardShares memory periodRewardShares, uint16 period) private pure returns(uint256) {
    uint256 totalPeriodReward = reduceRewards(MAX_REWARD_PER_PERIOD * FRACTION, period);
    if (periodRewardShares.activeUsersInPeriod.length <= ACTIVE_USERS_IN_PERIOD) {
      uint256 maxPeriodRewardPerUser = periodRewardShares.activeUsersInPeriod.length * MAX_REWARD_PER_USER * FRACTION;   // min?
      totalPeriodReward = CommonLib.minUint256(totalPeriodReward, maxPeriodRewardPerUser);
    }

    return totalPeriodReward;
  }

  function reduceRewards(uint256 rewardPeriod, uint16 period) private pure returns(uint256) {
    uint16 countReduce = period / 52;

    for (uint16 i = 0; i < countReduce; i++) {
      rewardPeriod = (rewardPeriod * 93) / 100;
    }

    return rewardPeriod;
  }

  function getUserReward(RewardLib.PeriodRewardShares memory periodRewardShares, address user, uint16 period, uint256 poolToken) private view returns(uint256) {
    int32 ratingToReward;
    int32 tokenReward;
    uint32[] memory rewardCommunities = peeranhaUser.getUserRewardCommunities(user, period);
    for (uint32 i; i < rewardCommunities.length; i++) {
      ratingToReward = peeranhaUser.getRatingToReward(user, period, rewardCommunities[i]);
      if (ratingToReward > 0)
        tokenReward += ratingToReward;
    }
    // TODO: tokenReward must be of type uint32
    // TODO: totalRewardShares must be of type uint32
    if (tokenReward <= 0 || periodRewardShares.totalRewardShares <= 0) return 0;

    uint256 userReward = (poolToken * uint256(uint32(tokenReward * getBoost(user, period))));
    userReward /= uint256(uint32(periodRewardShares.totalRewardShares));
    return userReward;
  }

  function getUserRewardGraph(address user, uint16 period) public view returns(uint256) {
    RewardLib.PeriodRewardShares memory periodRewardShares = peeranhaUser.getPeriodRewardShares(period);
    uint256 poolToken = getTotalPeriodReward(periodRewardShares, period);
    uint256 userReward = getUserReward(periodRewardShares, user, period, poolToken);
    
    return userReward;
  }

  // function getTotalPeriodRewardTokens(uint16 period) external view returns(uint256) {
  //   return poolTokens[period];
  // }

  function getStakeUserPeriods(address user) external view returns (uint16[] memory) {
    TokenLib.StakeUserContainer storage stakeUserContainer = userPeriodStake.userPeriodStake[user];
    return stakeUserContainer.stakeChangePeriods;
  }

  function getStakeTotalPeriods() external view returns (uint16[] memory) {
    return stakeTotalContainer.stakeChangePeriods;
  }

  function getBoost(address user, uint16 period) public override view returns (int32) {
    uint256 averageStake = getAverageStake(period);
    uint256 userStake = getUserStake(user, period);
    uint256 boost;
    if (averageStake == 0 || userStake == 0) return 1000;

    if (userStake <= averageStake) {
      boost = ((userStake * 1000 / averageStake) * 5) + 1000;
    } else {
      boost = (userStake * 1000 / averageStake) + 5000;
    }
    return int32(int256(boost));
  }

  function getUserStake(address user, uint16 findingPeriod) public view returns (uint256) {
    TokenLib.StakeUserContainer storage stakeUserContainer = userPeriodStake.userPeriodStake[user];

    (uint16 currectPeriod, bool status) = findInternal(stakeUserContainer.stakeChangePeriods, 0, stakeUserContainer.stakeChangePeriods.length, findingPeriod);
    if (status)
      return stakeUserContainer.userStake[currectPeriod].stakedAmount;
    else
      return 0;
  }

  function getAverageStake(uint16 findingPeriod) public view returns (uint256) {
    (uint256 totalStakedAmount, uint64 stakingUsersCount) = getStake(findingPeriod);
    if (totalStakedAmount == 0 || stakingUsersCount == 0) return 0;

    return totalStakedAmount / stakingUsersCount;
  }

  function getStake(uint16 findingPeriod) public view returns (uint256, uint64) {
    (uint16 currectPeriod, bool status) = findInternal(stakeTotalContainer.stakeChangePeriods, 0, stakeTotalContainer.stakeChangePeriods.length, findingPeriod);
    if (status) {
      TokenLib.StakeTotal storage stakeTotal = stakeTotalContainer.stakeTotals[currectPeriod];
      return (stakeTotal.totalStakedAmount, stakeTotal.stakingUsersCount);
    }
    else
      return (0, 0);
  }

  function findInternal(uint16[] storage periods, uint256 begin, uint256 end, uint16 findingPeriod) private view returns (uint16, bool) { // name
    uint256 len = end - begin;
    if (len == 0 ) 
      return (0, false);
    if (len == 1 && periods[begin] < findingPeriod) 
      return (periods[begin], true);
    else if (len == 1 && periods[begin] > findingPeriod)
      return (0, false);

    uint256 mid = begin + len / 2;
    uint16 v = periods[mid];
    if (findingPeriod < v) {
      if (periods[mid - 1] < findingPeriod)
        return (periods[mid - 1], true);
      else
        return findInternal(periods, begin, mid, findingPeriod);

    } else if (findingPeriod > v) {
      return findInternal(periods, mid, end, findingPeriod);
    } else {
      return (v, true);
    }
  }
}
