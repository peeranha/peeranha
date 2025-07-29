//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./libraries/RewardLib.sol";
import "./libraries/CommonLib.sol";
import "./libraries/TokenLib.sol";
import "./base/ChildMintableERC20Upgradeable.sol";
import "./interfaces/IPeeranhaToken.sol";
import "./interfaces/IPeeranhaUser.sol";



import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20CappedUpgradeable.sol";


/*
NOTE: This is a preliminary draft of a token contract that provides estimated numbers of token rewards to early users.
      The actual token that will be launched for the protocol might be different.
*/
contract PeeranhaTokenTestFac is ChildMintableERC20Upgradeable, ERC20CappedUpgradeable {
  
  uint256 public constant FRACTION = (10 ** 18);
  uint256 public constant MAX_TOTAL_SUPPLY = 10000000000 * FRACTION;

  bytes32 public constant OWNER_MINTER_ROLE = bytes32(keccak256("OWNER_MINTER_ROLE"));

  uint256 public ownerMinted;
  

  function initialize(string memory name, string memory symbol, address childChainManager) public initializer {
    __Token_init(name, symbol, childChainManager);
  }

  function __Token_init(string memory name, string memory symbol, address childChainManager) internal onlyInitializing {
    __ChildMintableERC20Upgradeable_init(name, symbol, childChainManager);
    __ERC20Capped_init_unchained(MAX_TOTAL_SUPPLY);
    __Token_init_unchained();
  }

  function __Token_init_unchained() internal onlyInitializing {
    _grantRole(OWNER_MINTER_ROLE, _msgSender());
    _setRoleAdmin(OWNER_MINTER_ROLE, DEFAULT_ADMIN_ROLE);
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

  function dispatcherCheck(address user) internal {
  }

  /**
  * @dev See {ERC20-_mint}.
  */
  function _mint(address account, uint256 amount) internal virtual override (ERC20Upgradeable, ERC20CappedUpgradeable) {
      ERC20CappedUpgradeable._mint(account, amount);
  }

  /**
   * @dev Mint token for owner.
   *
   * Requirements:
   *
   * - must be a user.
   * - user must has role OWNER_MINTER_ROLE.
   * - ownerMinted + mintTokens must be less than OWNER_MINT_MAX
  */
  function mint(uint256 mintTokens) external onlyRole(OWNER_MINTER_ROLE) {
    _mint(_msgSender(), mintTokens);
  }

  function getVersion() public pure returns (uint256) {
    return 1;
  }
}
