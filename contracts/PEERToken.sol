pragma solidity ^0.7.3;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20CappedUpgradeable.sol";

import "./interfaces/IPEERToken.sol";

contract PEERToken is IPEERToken, Initializable, AccessControlUpgradeable, ERC20Upgradeable, ERC20PausableUpgradeable, ERC20CappedUpgradeable  {
    function initialize(string memory name, string memory symbol, uint256 cap) public virtual initializer {
        __PEERToken_init(name, symbol, cap);
    }

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    function __PEERToken_init(string memory name, string memory symbol, uint256 cap) internal initializer {
        __AccessControl_init_unchained();
        __ERC20_init_unchained(name, symbol);
        __Pausable_init_unchained();
        __ERC20Capped_init_unchained(cap);
        __ERC20Pausable_init_unchained();
        __PEERToken_init_unchained(name, symbol, cap);
    }

    function __PEERToken_init_unchained(string memory name, string memory symbol, uint256 cap) internal initializer {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);
    }

    /**
     * @dev Pauses all token transfers.
     *
     * See {ERC20Pausable} and {Pausable-_pause}.
     *
     * Requirements:
     *
     * - the caller must have the `PAUSER_ROLE`.
     */
    function pause() public virtual {
        require(hasRole(PAUSER_ROLE, _msgSender()), "PEERToken: must have pauser role to pause");
        _pause();
    }

    /**
     * @dev Unpauses all token transfers.
     *
     * See {ERC20Pausable} and {Pausable-_unpause}.
     *
     * Requirements:
     *
     * - the caller must have the `PAUSER_ROLE`.
     */
    function unpause() public virtual {
        require(hasRole(PAUSER_ROLE, _msgSender()), "PEERToken: must have pauser role to unpause");
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override(ERC20Upgradeable, ERC20PausableUpgradeable, ERC20CappedUpgradeable) {
        super._beforeTokenTransfer(from, to, amount);
    }
}