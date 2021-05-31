pragma solidity ^0.7.3;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20CappedUpgradeable.sol";

import "./libraries/User.sol";

import "./interfaces/IPeeranha.sol";

contract Peeranha is IPeeranha, Initializable, AccessControlUpgradeable, PausableUpgradeable  {
    using User for mapping(address => User.Info);
    using User for User.Info;

    mapping(address => User.Info) public users;
    
    function initialize() public virtual initializer {
        __Peeranha_init();
    }

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    function __Peeranha_init() internal initializer {
        __AccessControl_init_unchained();
        __Pausable_init_unchained();
        __Peeranha_init_unchained();
    }

    function __Peeranha_init_unchained() internal initializer {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);
    }

    /**
     * @dev Signup for user account.
     *
     * Requirements:
     *
     * - Must be a new user.
     */
    function createUser(bytes32 ipfsHash) external override {
        users.create(msg.sender, ipfsHash);
    }

    /**
     * @dev Edit user profile.
     *
     * Requirements:
     *
     * - Must be an existing user.
     */
    function updateUser(bytes32 ipfsHash) external override {
        users.update(msg.sender, ipfsHash);
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
        require(hasRole(PAUSER_ROLE, msg.sender), "Peeranha: must have pauser role to pause");
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
        require(hasRole(PAUSER_ROLE, msg.sender), "Peeranha: must have pauser role to unpause");
        _unpause();
    }
}