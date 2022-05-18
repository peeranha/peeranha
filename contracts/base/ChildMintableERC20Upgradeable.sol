//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

import "./IChildToken.sol";
import "./NativeMetaTransaction.sol";


contract ChildMintableERC20Upgradeable is
    IChildToken,
    NativeMetaTransaction,
    ERC20Upgradeable,
    AccessControlEnumerableUpgradeable
{
    bytes32 public constant DEPOSITOR_ROLE = keccak256("DEPOSITOR_ROLE");

    function __ChildMintableERC20Upgradeable_init(
        string memory name_,
        string memory symbol_,
        address childChainManager
    ) internal onlyInitializing {
        __ERC20_init(name_, symbol_);
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(DEPOSITOR_ROLE, childChainManager);
        __NativeMetaTransaction_init(name_);
    }

    // This is to support Native meta transactions
    // never use msg.sender directly, use _msgSender() instead
    function _msgSender()
        internal
        override(ContextUpgradeable, NativeMetaTransaction)
        virtual
        view
        returns (address sender)
    {
        return NativeMetaTransaction._msgSender();
    }

    /**
     * @notice called when token is deposited on root chain
     * @dev Should be callable only by ChildChainManager
     * Should handle deposit by minting the required amount for user
     * Make sure minting is done only by this function
     * @param user user address for whom deposit is being done
     * @param depositData abi encoded amount
     */
    function deposit(address user, bytes calldata depositData)
        external
        override
        onlyRole(DEPOSITOR_ROLE)
    {
        uint256 amount = abi.decode(depositData, (uint256));
        _mint(user, amount);
    }

    /**
     * @notice called when user wants to withdraw tokens back to root chain
     * @dev Should burn user's tokens. This transaction will be verified when exiting on root chain
     * @param amount amount of tokens to withdraw
     */
    function withdraw(uint256 amount) external {
        _burn(_msgSender(), amount);
    }
}
