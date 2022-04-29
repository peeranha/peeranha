pragma solidity ^0.7.3;
pragma abicoder v2;
import "./libraries/RewardLib.sol";
import "./libraries/CommonLib.sol";
import "./libraries/TokenLib.sol";
import "./interfaces/IPeeranha.sol";
import "./interfaces/IPeeranhaToken.sol";

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20PausableUpgradeable.sol";

contract PeeranhaToken is IPeeranhaToken, ERC20Upgradeable, ERC20PausableUpgradeable, OwnableUpgradeable {
  uint256 public constant FRACTION = (10 ** 18);
  // uint256 public constant TOTAL_SUPPLY = 1000000000 * FRACTION;
  uint256 public constant REWARD_WEEK = 100000;
  uint256 public constant USER_REWARD = 100;

  
  ///
  // 100 000  - 100 token * 1000 user
  // 40 000 000 - company
  ///
  // TODO: add actions that allow owner to mint 40% of total token supply
  // rewrite transfer - boost, balanceOf - boost
  // add method getUserStakedBalance
  // getstakedbalance (transfer + get balance)
  ///

  uint256 public constant ACTIVE_USERS_IN_PERIOD = 1000;

  mapping(uint16 => uint256) poolTokens;

  TokenLib.StatusRewardContainer statusRewardContainer;
  TokenLib.UserPeriodStake userPeriodStake;
  TokenLib.StakeTotalContainer stakeTotalContainer;
  IPeeranha peeranha;

  event GetReward(address user, uint16 period);
  event SetStake(address user, uint16 period, uint256 stake);


  function initialize(string memory name, string memory symbol, address peeranhaNFTContractAddress) public initializer {
    __Token_init(name, symbol);
    peeranha = IPeeranha(peeranhaNFTContractAddress);
    __Ownable_init_unchained();
  }

  function __Token_init(string memory name, string memory symbol) internal initializer {
    __ERC20_init_unchained(name, symbol);
    __Pausable_init_unchained();
    __ERC20Pausable_init_unchained();
    __Token_init_unchained();
  }

  function __Token_init_unchained() internal initializer {
  }

  function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override(ERC20Upgradeable, ERC20PausableUpgradeable/*, ERC20CappedUpgradeable*/) {
    super._beforeTokenTransfer(from, to, amount);
  }

  function stakeBalanceOf(address account) external view returns(uint256) { // unitTest
    TokenLib.StakeUserContainer storage stakeUserContainer = userPeriodStake.userPeriodStake[account];
    uint16 period = RewardLib.getPeriod(CommonLib.getTimestamp()) + 1;

    uint256 stakedToken;
    (uint256 correctPeriod, bool status) = findInternal(stakeUserContainer.stakeChangePeriods, 0, stakeUserContainer.stakeChangePeriods.length, period);
    if (status && correctPeriod == period) {
      TokenLib.UserStake storage userStake = stakeUserContainer.userStake[uint16(correctPeriod)];
      stakedToken = userStake.totalStakedAmount + userStake.changedStake;
    }

    return balanceOf(account) - stakedToken;
  }


  ///
  // to do cap
  ///
  function mintForOwner(uint256 mintTokens) external onlyOwner() {
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
      "reward_was_pick_up."
    );

    statusRewardContainer.statusReward[user][period].isPaid = true;
    RewardLib.WeekReward memory weekReward = peeranha.getWeekRewardContainer(period);
    
    uint256 poolToken = getPool(weekReward, period);
    if (poolTokens[period] == 0 && poolToken != poolTokens[period]) {
      poolTokens[period] = poolToken;
    }
    uint256 userReward = getUserReward(weekReward, user, period, poolToken);

    require(userReward != 0, "no_reward");

    emit GetReward(user, period);
    _mint(user, userReward);
  }

  function setStake(address user, uint256 stakeTokens) external {
    require(stakeTokens <= balanceOf(user), "wrong_stack");
    uint16 nextPeriod = RewardLib.getPeriod(CommonLib.getTimestamp()) + 1;
    TokenLib.StakeUserContainer storage stakeUserContainer = userPeriodStake.userPeriodStake[user];

    TokenLib.StakeTotal storage stakeTotal = stakeTotalContainer.stakeTotals[nextPeriod];
    if (stakeTotalContainer.stakeChangePeriods.length != 0 && stakeTotalContainer.stakeChangePeriods[stakeTotalContainer.stakeChangePeriods.length - 1] != nextPeriod) {
      uint16 previousPeriod = stakeTotalContainer.stakeChangePeriods[stakeTotalContainer.stakeChangePeriods.length - 1];
      stakeTotal.totalStakedAmount = stakeTotalContainer.stakeTotals[previousPeriod].totalStakedAmount;
      stakeTotal.stakingUsersCount = stakeTotalContainer.stakeTotals[previousPeriod].stakingUsersCount;
      stakeTotalContainer.stakeChangePeriods.push(nextPeriod);
    } else if (stakeTotalContainer.stakeChangePeriods.length == 0) {
      stakeTotalContainer.stakeChangePeriods.push(nextPeriod);
    }

    if (stakeUserContainer.stakeChangePeriods.length != 0) {
      uint16 lastStakePeriod = stakeUserContainer.stakeChangePeriods[stakeUserContainer.stakeChangePeriods.length - 1];
      if (lastStakePeriod != nextPeriod) {
        stakeUserContainer.stakeChangePeriods.push(nextPeriod);
      }

      if (stakeUserContainer.userStake[lastStakePeriod].totalStakedAmount > stakeTokens) {
        stakeTotal.totalStakedAmount += stakeUserContainer.userStake[lastStakePeriod].totalStakedAmount - stakeTokens;
        if (stakeTokens == 0) stakeTotal.stakingUsersCount--;
        stakeUserContainer.userStake[nextPeriod].changedStake = stakeUserContainer.userStake[lastStakePeriod].totalStakedAmount - stakeTokens;

      } else {
        stakeTotal.totalStakedAmount += stakeTokens - stakeUserContainer.userStake[lastStakePeriod].totalStakedAmount;
        if (stakeUserContainer.userStake[lastStakePeriod].totalStakedAmount == 0) stakeTotal.stakingUsersCount++;
      }
      stakeUserContainer.userStake[nextPeriod].totalStakedAmount = stakeTokens;

    } else {
      stakeUserContainer.stakeChangePeriods.push(nextPeriod);
      stakeUserContainer.userStake[nextPeriod].totalStakedAmount = stakeTokens;

      stakeTotal.totalStakedAmount += stakeTokens;
      stakeTotal.stakingUsersCount++;
    }
  }

  function getPool(RewardLib.WeekReward memory weekReward, uint16 period) private view returns(uint256) {
    uint256 poolToken = poolTokens[period];
    if (poolToken == 0) {
      poolToken = reduceRewards(REWARD_WEEK * FRACTION, period);                // max_pool
      if (weekReward.activeUsersInPeriod.length <= ACTIVE_USERS_IN_PERIOD) {
        uint256 userRewardWeek = weekReward.activeUsersInPeriod.length * USER_REWARD * FRACTION;  // < 1000
        poolToken = CommonLib.minUint256(poolToken, userRewardWeek);
      }
    }

    return poolToken;
  }

  function reduceRewards(uint256 rewardWeek, uint16 period) private view returns(uint256) {
    uint16 countReduce = period / 52;

    for (uint16 i = 0; i < countReduce; i++) {
      rewardWeek = (rewardWeek * 93) / 100;
    }

    return rewardWeek;
  }

  function getUserReward(RewardLib.WeekReward memory weekReward, address user, uint16 period, uint256 poolToken) private view returns(uint256) {
    int32 ratingToReward;
    int32 tokenReward;
    uint32[] memory rewardCommunities = peeranha.getUserRewardCommunities(user, period);
    for (uint32 i; i < rewardCommunities.length; i++) {
      ratingToReward = peeranha.getRatingToReward(user, period, rewardCommunities[i]);
      tokenReward += ratingToReward;  // negetive add to?
    }
    if (tokenReward <= 0) return 0;

    uint256 userReward = (poolToken * uint256(tokenReward * getBoost(user, period))) ;
    userReward /= uint256(weekReward.rewards);
    return userReward;
  }

  function getUserRewardGraph(address user, uint16 period) public view returns(uint256) {
    RewardLib.WeekReward memory weekReward = peeranha.getWeekRewardContainer(period);
    uint256 poolToken = getPool(weekReward, period);
    uint256 userReward = getUserReward(weekReward, user, period, poolToken);
    
    return userReward;
  }

  function getPoolTokens(uint16 period) external view returns(uint256) {
    return poolTokens[period];
  }

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
    return int32(boost);
  }

  function getUserStake(address user, uint16 findingPeriod) public view returns (uint256) {
    TokenLib.StakeUserContainer storage stakeUserContainer = userPeriodStake.userPeriodStake[user];

    (uint256 correctPeriod, bool status) = findInternal(stakeUserContainer.stakeChangePeriods, 0, stakeUserContainer.stakeChangePeriods.length, findingPeriod);
    if (status)
      return stakeUserContainer.userStake[uint16(correctPeriod)].totalStakedAmount;
    else
      return 0;
  }

  function getAverageStake(uint16 findingPeriod) public view returns (uint256) {
    (uint256 totalStakedAmount, uint64 stakingUsersCount) = getStake(findingPeriod);
    if (totalStakedAmount == 0 || stakingUsersCount == 0) return 0;

    return totalStakedAmount / stakingUsersCount;
  }

  function getStake(uint16 findingPeriod) public view returns (uint256, uint64) {
    (uint256 correctPeriod, bool status) = findInternal(stakeTotalContainer.stakeChangePeriods, 0, stakeTotalContainer.stakeChangePeriods.length, findingPeriod);
    if (status) {
      TokenLib.StakeTotal storage stakeTotal = stakeTotalContainer.stakeTotals[uint16(correctPeriod)];
      return (stakeTotal.totalStakedAmount, stakeTotal.stakingUsersCount);
    }
    else
      return (0, 0);
  }

  function findInternal(uint16[] storage periods, uint256 begin, uint256 end, uint16 findingPeriod) private view returns (uint256, bool) { // name
    uint256 len = end - begin;
    if (len == 0 ) 
      return (0, false);
    if (len == 1 && periods[begin] < findingPeriod) 
      return (periods[begin], true);
    else if (len == 1 && periods[begin] > findingPeriod)
      return (0, false);

    uint256 mid = begin + len / 2;
    uint256 v = periods[mid];
    if (findingPeriod < v) {
      if (periods[mid - 1] < findingPeriod)
        return (periods[mid - 1], true);
      else
        return findInternal(periods, begin, mid, findingPeriod);

    } else if (findingPeriod > v) {
      return findInternal(periods, mid + 1, end, findingPeriod);
    } else {
      return (v, true);
    }
  }
}
