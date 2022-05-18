//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

import "./interfaces/IPeeranhaMainnetToken.sol";
import "./base/NativeMetaTransaction.sol";

contract PeeranhaMainnetToken is
    ERC20Upgradeable,
    AccessControlUpgradeable,
    NativeMetaTransaction,
    IPeeranhaMainnetToken
{
    bytes32 public constant PREDICATE_ROLE = keccak256("PREDICATE_ROLE");

    function initialize(string memory name_, string memory symbol_, address predicateProxyAddress) public initializer {
         __ERC20_init(name_, symbol_);
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(PREDICATE_ROLE, predicateProxyAddress);
        __NativeMetaTransaction_init(name_);
    }

    /**
     * @dev See {IPeeranhaMainnetToken-mint}.
     */
    function mint(address user, uint256 amount) external override onlyRole(PREDICATE_ROLE) {
        _mint(user, amount);
    }

    function _msgSender()
      internal
      override(ContextUpgradeable, NativeMetaTransaction)
      view
      returns (address sender)
    {
      return NativeMetaTransaction._msgSender();
    }
}
