pragma solidity ^0.7.3;
pragma abicoder v2;
import "./libraries/RewardLib.sol";
import "./libraries/CommonLib.sol";
import "./libraries/TokenLib.sol";
import "./interfaces/IPeeranha.sol";


import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20CappedUpgradeable.sol";

contract PeeranhaToken is ERC20Upgradeable, ERC20PausableUpgradeable, ERC20CappedUpgradeable {
  uint256 public constant FRACTION = (10 ** 18);
  uint256 public constant TOTAL_SUPPLY = 1000000000 * FRACTION;
  uint256 public constant REWARD_WEEK = 1000000 * FRACTION;

  // mapping(uint16 => RewardLib.UserRewards) userRewards; // period
  mapping(uint16 => uint256) shiftRewards;

  TokenLib.StatusRewardContainer statusRewardContainer;
  IPeeranha peeranha;

  function initialize(string memory name, string memory symbol, address peeranhaNFTContractAddress) public initializer {
    __Token_init(name, symbol, TOTAL_SUPPLY);
    peeranha = IPeeranha(peeranhaNFTContractAddress);
  }

  function __Token_init(string memory name, string memory symbol, uint256 cap) internal initializer {
    __ERC20_init_unchained(name, symbol);
    __Pausable_init_unchained();
    __ERC20Capped_init_unchained(cap);
    __ERC20Pausable_init_unchained();
    __Token_init_unchained();
  }

  function __Token_init_unchained() internal initializer {
  }

  function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override(ERC20Upgradeable, ERC20PausableUpgradeable, ERC20CappedUpgradeable) {
    super._beforeTokenTransfer(from, to, amount);
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
  function claimReward(uint16 period) external {
    require(RewardLib.getPeriod(CommonLib.getTimestamp()) > period, "This period isn't ended yet!");
    address user = msg.sender;

    require(
      !statusRewardContainer.statusReward[user][period].isPaid,
      "You already picked up this reward."
    );

    statusRewardContainer.statusReward[user][period].isPaid = true;
    uint32[] memory rewardCommunities = peeranha.getUserRewardCommunities(user, period);

    RewardLib.WeekReward memory weekReward = peeranha.getWeekRewardContainer(period);
    // uint256 rewardWeek = reduceRewards(REWARD_WEEK, period);
    uint256 rewardWeek = REWARD_WEEK;
    if (weekReward.usersActiveInPeriod <= 1000) {
      uint256 userRewardWeek = weekReward.usersActiveInPeriod * 1000 * FRACTION;

      rewardWeek = CommonLib.minUint256(userRewardWeek, rewardWeek);
    }
    uint256 shiftReward = shiftRewards[period];
    if (shiftReward == 0) {
      if (uint256(weekReward.rating) * TokenLib.getRewardCoefficient() * FRACTION > rewardWeek) {
        shiftReward = (uint256(weekReward.rating) * TokenLib.getRewardCoefficient() * FRACTION * 100) / rewardWeek;
      } else {
        shiftReward = FRACTION;
      }
      shiftRewards[period] = shiftReward;
    }

    int32 ratingToReward;
    uint256 tokenReward;
    for (uint32 i; i < rewardCommunities.length; i++) {
      ratingToReward = peeranha.getRatingToReward(user, period, rewardCommunities[i]);
      if (ratingToReward == 0) continue;
      tokenReward += uint256(ratingToReward) * TokenLib.getRewardCoefficient() * FRACTION; // * 10^18  ///* shiftReward; ??
    }
    require(tokenReward != 0, "No reward for you in this period");
    
    _mint(user, uint256(weekReward.rating));
  }

  function reduceRewards(uint256 rewardWeek, uint16 period) private returns(uint256) {
    uint16 countReduce = period / 52;

    if (countReduce > 0) {
      rewardWeek *= (93 * countReduce) / 100;
    }

    return rewardWeek;
  }

  function getShiftRewards(uint16 period) external view  returns(uint256) {
    return shiftRewards[period];
  }
}
