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
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20BurnableUpgradeable.sol";

contract PeeranhaToken is IPeeranhaToken, ERC20Upgradeable, ERC20PausableUpgradeable, ERC20BurnableUpgradeable, OwnableUpgradeable {
  uint256 public constant FRACTION = (10 ** 18);
  // uint256 public constant TOTAL_SUPPLY = 1000000000 * FRACTION;
  uint256 public constant REWARD_WEEK = 1000;
  uint256 public constant USER_REWARD = 1000;

  
  ///
  // 100 000  - 100 token * 1000 user
  // 40 000 000 - компания
  ///
  // TODO: add actions that allow owner to mint 40% of total token supply
  // rewrite transfer - boost, balanceOf - boost
  // add method getUserStakedBalance
  // getstakedbalance (transfer + get balance)
  ///

  uint256 public constant ACTIVE_USERS_IN_PERIOD = 1;

  mapping(uint16 => uint256) poolTokens;

  TokenLib.StatusRewardContainer statusRewardContainer;
  TokenLib.WeekUserBoost weekUserBoost;
  TokenLib.BoostContainer boostContainer;
  IPeeranha peeranha;

  event GetReward(address user, uint16 period);
  event SetBoost(address user, uint16 period, uint256 stake);


  function initialize(string memory name, string memory symbol, address peeranhaNFTContractAddress) public initializer {
    __Token_init(name, symbol);
    peeranha = IPeeranha(peeranhaNFTContractAddress);
    __Ownable_init_unchained();
  }

  function __Token_init(string memory name, string memory symbol) internal initializer {
    __ERC20_init_unchained(name, symbol);
    __Pausable_init_unchained();
    __ERC20Burnable_init_unchained();
    __ERC20Pausable_init_unchained();
    __Token_init_unchained();
  }

  function __Token_init_unchained() internal initializer {
  }

  function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override(ERC20Upgradeable, ERC20PausableUpgradeable/*, ERC20CappedUpgradeable*/) {
    super._beforeTokenTransfer(from, to, amount);
  }

  function stakeBalanceOf(address account) external view returns(uint256) {
    return balanceOf(account) - getUserStake(account, RewardLib.getPeriod(CommonLib.getTimestamp()) + 1);
  }

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
    // TODO: check that user is sender or admin
    require(RewardLib.getPeriod(CommonLib.getTimestamp()) > period + 1, "This period isn't ended yet!");

    require(
      !statusRewardContainer.statusReward[user][period].isPaid,
      "You already picked up this reward."
    );

    statusRewardContainer.statusReward[user][period].isPaid = true;
    RewardLib.WeekReward memory weekReward = peeranha.getWeekRewardContainer(period);
    
    uint256 poolToken = getPool(weekReward, period);
    if (poolTokens[period] == 0 && poolToken != poolTokens[period]) {
      poolTokens[period] = poolToken;
    }
    uint256 userReward = getUserReward(weekReward, user, period, poolToken);

    require(userReward != 0, "No reward for you in this period");

    emit GetReward(user, period);
    _mint(user, userReward);
  }

  function setBoost(address user, uint256 stakeTokens) external {
    require(stakeTokens <= balanceOf(user), "Boost amount exceeds balance");
    uint16 nextPeriod = RewardLib.getPeriod(CommonLib.getTimestamp()) + 2;
    TokenLib.UserBoost storage userBoost = weekUserBoost.weekUserBoost[user];

    TokenLib.CountBoost storage countBoost = boostContainer.userBoostCount[nextPeriod];
    if (boostContainer.updateBoostInPeriod.length != 0 && boostContainer.updateBoostInPeriod[boostContainer.updateBoostInPeriod.length - 1] != nextPeriod) {
      uint16 previousPeriod = boostContainer.updateBoostInPeriod[boostContainer.updateBoostInPeriod.length - 1];
      countBoost.allStake = boostContainer.userBoostCount[previousPeriod].allStake;
      countBoost.countStaking = boostContainer.userBoostCount[previousPeriod].countStaking;
      boostContainer.updateBoostInPeriod.push(nextPeriod);
    } else if (boostContainer.updateBoostInPeriod.length == 0) {
      boostContainer.updateBoostInPeriod.push(nextPeriod);
    }

    if (userBoost.updateUserBoostInPeriod.length != 0) {
      uint16 lastBoostPeriod = userBoost.updateUserBoostInPeriod[userBoost.updateUserBoostInPeriod.length - 1];
      if (lastBoostPeriod != nextPeriod) {
        userBoost.updateUserBoostInPeriod.push(nextPeriod);
      }

      if (userBoost.stakedTokens[lastBoostPeriod] > stakeTokens) {
        countBoost.allStake += userBoost.stakedTokens[lastBoostPeriod] - stakeTokens;
        if (stakeTokens == 0) countBoost.countStaking--;
      } else {
        countBoost.allStake += stakeTokens - userBoost.stakedTokens[lastBoostPeriod];
        if (userBoost.stakedTokens[lastBoostPeriod] == 0) countBoost.countStaking++;
      }
      userBoost.stakedTokens[nextPeriod] = stakeTokens;

    } else {
      userBoost.updateUserBoostInPeriod.push(nextPeriod);
      userBoost.stakedTokens[nextPeriod] = stakeTokens;

      countBoost.allStake += stakeTokens;
      countBoost.countStaking++;
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
      poolToken = CommonLib.minUint256(poolToken, weekReward.tokens);   // earned 
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
      tokenReward += ratingToReward;
    }
    if (tokenReward == 0) return 0;

    // if (poolToken < weekReward.tokens)
    uint256 userReward = (poolToken * getBoost(user, period, tokenReward));
    userReward /= weekReward.tokens;
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

  function getUserBoostPeriods(address user) external view returns (uint16[] memory) {
    TokenLib.UserBoost storage userBoost = weekUserBoost.weekUserBoost[user];
    return userBoost.updateUserBoostInPeriod;
  }

  function getBoostPeriods() external view returns (uint16[] memory) {
    return boostContainer.updateBoostInPeriod;
  }

  function getBoost(address user, uint16 period, int32 rating) public override view returns (uint256) {    // name
    uint256 averageStake = getAverageStake(period);
    uint256 userStake = getUserStake(user, period);
    uint256 boost;

    if (averageStake == 0 || userStake == 0) return uint256(rating) * TokenLib.getRewardCoefficient() * FRACTION;

    if (userStake <= averageStake) {
      boost = ((userStake * 1000 / averageStake) * 5) + 1000;
    } else {
      boost = (userStake * 1000 / averageStake) + 5000;
    }

    return (uint256(rating) * boost) / 1000 * TokenLib.getRewardCoefficient() * FRACTION;
  }

  function getUserStake(address user, uint16 findingPeriod) public view returns (uint256) {
    TokenLib.UserBoost storage userBoost = weekUserBoost.weekUserBoost[user];
    // require(userBoost.updateUserBoostInPeriod.length > 0, "You do not have any boost");

    (uint256 correctPeriod, bool status) = findInternal(userBoost.updateUserBoostInPeriod, 0, userBoost.updateUserBoostInPeriod.length, findingPeriod);
    if (status)
      return userBoost.stakedTokens[uint16(correctPeriod)];
    else
      return 0;
  }

  function getAverageStake(uint16 findingPeriod) public view returns (uint256) {
    (uint256 allStake, uint64 countStaking) = getStake(findingPeriod);
    if (allStake == 0 || countStaking == 0) return 0;

    return allStake / countStaking;
  }

  function getStake(uint16 findingPeriod) public view returns (uint256, uint64) {
    (uint256 correctPeriod, bool status) = findInternal(boostContainer.updateBoostInPeriod, 0, boostContainer.updateBoostInPeriod.length, findingPeriod);
    if (status) {
      TokenLib.CountBoost storage countBoost = boostContainer.userBoostCount[uint16(correctPeriod)];
      return (countBoost.allStake, countBoost.countStaking);
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
