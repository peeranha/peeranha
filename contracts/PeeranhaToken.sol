pragma solidity ^0.7.3;
import "./libraries/RewardLib.sol";
import "./interfaces/IPeeranha.sol";


import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20CappedUpgradeable.sol";

contract PeeranhaToken is ERC20Upgradeable, ERC20PausableUpgradeable, ERC20CappedUpgradeable {
  uint256 public constant TOTAL_SUPPLY = 100000000 * (10 ** 18);
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
    uint32[] memory activeInCommunity = peeranha.getActiveInCommunity(user, period);

    int32 ratingToReward;
    uint256 tokenReward;
    for (uint32 i = 0; i < activeInCommunity.length; i++) {
      ratingToReward = peeranha.getRatingToReward(user, period, activeInCommunity[i]);
      tokenReward += uint256(ratingToReward) * RewardLib.getRewardCoefficient(); // * 10^18
    }
    
    _mint(user, tokenReward);
  }
}
