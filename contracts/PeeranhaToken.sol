pragma solidity ^0.7.3;
import "./libraries/RewardLib.sol";
import "./Peeranha.sol";


import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20CappedUpgradeable.sol";

contract PeeranhaToken is ERC20Upgradeable, ERC20PausableUpgradeable, ERC20CappedUpgradeable {
  RewardLib.StatusRewardContainer statusRewards;

  uint256 public constant TOTAL_SUPPLY = 100000000 * (10 ** 18);
  function initialize(string memory name, string memory symbol) public initializer {
    __Token_init(name, symbol, TOTAL_SUPPLY);
  }

  function __Token_init(string memory name, string memory symbol, uint256 cap) internal initializer {
    __ERC20_init_unchained(name, symbol);
    __Pausable_init_unchained();
    __ERC20Capped_init_unchained(cap);
    // _mint(msg.sender, 100000000 * (10 ** 18));
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
  function claimReward(uint16 period, address contractAddress) external {
    RewardLib.StatusReward storage rewardStatus = RewardLib.getRewardStatus(statusRewards, msg.sender, period);
    require(!rewardStatus.isPaid, "You already picked up this reward.");
    rewardStatus.isPaid = true;

    Peeranha baseaddress = Peeranha(contractAddress);    // resolvedAddress
    int32 ratingToReward = baseaddress.getRatingToReward(msg.sender, period);
    require(ratingToReward > 0, "No reward for you in this period");
    require(RewardLib.getPeriod(CommonLib.getTimestamp()) > period, "This period isn't ended yet!");
    uint256 tokenReward = uint256(ratingToReward) * RewardLib.getRewardCoefficient(); // * 10^18
    
    _mint(msg.sender, tokenReward);
  }
}