pragma solidity ^0.7.3;
pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20CappedUpgradeable.sol";

import "./libraries/UserLib.sol";
import "./libraries/CommunityLib.sol";

import "./interfaces/IPeeranha.sol";
import "./Sequrity.sol";

import "hardhat/console.sol";


contract Peeranha is IPeeranha, Initializable, Sequrity, ERC20Upgradeable, ERC20PausableUpgradeable, ERC20CappedUpgradeable  {
    using UserLib for UserLib.UserCollection;
    using UserLib for UserLib.User;
    using CommunityLib for CommunityLib.CommunityCollection;
    using CommunityLib for CommunityLib.Community;
    
    UserLib.UserCollection users;
    CommunityLib.CommunityCollection communities;
    
    function __Peeranha_init(string memory name, string memory symbol, uint256 cap) internal initializer {
        __AccessControl_init_unchained();
        __ERC20_init_unchained(name, symbol);
        __Pausable_init_unchained();
        __ERC20Capped_init_unchained(cap);
        __ERC20Pausable_init_unchained();
        __Peeranha_init_unchained(name, symbol, cap);
    }

    function __Peeranha_init_unchained(string memory name, string memory symbol, uint256 cap) internal initializer {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);
    }

    function __Peeranha_init() public initializer {
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
     * @dev Get users count.
     */
    function getUsersCount() external view returns (uint256 count) {
        return users.getUsersCount();
    }

    /**
     * @dev Get user profile by index.
     *
     * Requirements:
     *
     * - Must be an existing user.
     */
    function getUserByIndex(uint256 index) external view returns (UserLib.User memory) {
        return users.getUserByIndex(index);
    }

    /**
     * @dev Get user profile by address.
     *
     * Requirements:
     *
     * - Must be an existing user.
     */
    function getUserByAddress(address addr) external view returns (UserLib.User memory) {
        return users.getUserByAddress(addr);
    }

    /**
     * @dev Create new community.
     *
     * Requirements:
     *
     * - Must be a new community.
     */
    function createCommunity(uint256 communityId, bytes32 ipfsHash, CommunityLib.Tag[] memory tags) external {
        _setupRole(getCommunityRole(COMMUNITY_ADMIN_ROLE, communityId), msg.sender);
        _setupRole(getCommunityRole(COMMUNITY_MODERATOR_ROLE, communityId), msg.sender);
        communities.createCommunity(communityId, ipfsHash, tags);
    }

    /**
     * @dev Edit community info.
     *
     * Requirements:
     *
     * - Must be an existing community.  
     * - Sender must be community moderator.
     */
    function updateCommunity(uint256 communityId, bytes32 ipfsHash) external onlyCommunityModerator(communityId) {
        communities.updateCommunity(communityId, ipfsHash);
    }

    /**
     * @dev Freeze community.
     *
     * Requirements:
     *
     * - Must be an existing community.  
     * - Sender must be community moderator.
     */
    function freezeCommunity(uint256 communityId) external 
    onlyCommunityModerator(communityId) {
        communities.freeze(communityId);
    }

    /**
     * @dev Unfreeze community.
     *
     * Requirements:
     *
     * - Must be an existing community.  
     * - Sender must be community moderator.
     */
    function unfreezeCommunity(uint256 communityId) external 
    onlyCommunityModerator(communityId) {
        communities.unfreeze(communityId);
    }

    /**
     * @dev Give community adminisrator permission.
     *
     * Requirements:
     *
     * - Sender must be global administrator.
     * - Must be an existing community.
     * - Must be an existing user. 
     */
    function giveCommunityAdminPermission(address user, uint256 communityId) external 
    onlyExisitingUser(users, user) onlyExistingAndNotFrozenCommunity(communities, communityId) {
        grantRole(getCommunityRole(COMMUNITY_ADMIN_ROLE, communityId), user);
        grantRole(getCommunityRole(COMMUNITY_MODERATOR_ROLE, communityId), user);
    }

    /**
     * @dev Give community moderator permission.
     *
     * Requirements:
     *
     * - Sender must be community or global administrator.
     * - Must be an existing community.
     * - Must be an existing user. 
     */
    function giveCommunityModeratorPermission(address user, uint256 communityId) external 
    onlyCommunityAdmin(communityId) 
    onlyExisitingUser(users, user) 
    onlyExistingAndNotFrozenCommunity(communities, communityId) {
        _setupRole(getCommunityRole(COMMUNITY_MODERATOR_ROLE, communityId), user);
    }

    /**
     * @dev Revoke community adminisrator permission.
     *
     * Requirements:
     *
     * - Sender must be global administrator.
     * - Must be an existing community.
     * - Must be an existing user. 
     */
    function revokeCommunityAdminPermission(address user, uint256 communityId) external 
    onlyExistingAndNotFrozenCommunity(communities, communityId) 
    onlyExisitingUser(users, user) {
        _revokeRole(getCommunityRole(COMMUNITY_ADMIN_ROLE, communityId), user);
    }

    /**
     * @dev Revoke community moderator permission.
     *
     * Requirements:
     *
     * - Sender must be community or global administrator.
     * - Must be an existing community.
     * - Must be an existing user. 
     */

     //should do something with AccessControlUpgradeable(revoke only for default admin)
    function revokeCommunityModeratorPermission(address user, uint256 communityId) external 
    onlyCommunityAdmin(communityId) 
    onlyExisitingUser(users, user) 
    onlyExistingAndNotFrozenCommunity(communities, communityId) {
        _revokeRole(getCommunityRole(COMMUNITY_MODERATOR_ROLE, communityId), user);
    }

    /**
     * @dev Create new tag.
     *
     * Requirements:
     *
     * - Must be a new tag.
     * - Must be an existing community. 
     */
    function createTag(uint256 communityId, uint256 tagId, bytes32 ipfsHash) external {
        communities.createTag(communityId, tagId, ipfsHash);
    }

    /**
     * @dev Get communities count.
     */
    function getCommunitiesCount() external view returns (uint8 count) {
        return communities.getCommunitiesCount();
    }

    /**
     * @dev Get community info by id.
     *
     * Requirements:
     *
     * - Must be an existing community.
     */
    function getCommunity(uint256 communityId) external view returns (CommunityLib.Community memory) {
        return communities.getCommunity(communityId);
    }

    /**
     * @dev Get tags count in community.
     *
     * Requirements:
     *
     * - Must be an existing community.
     */
    function getTagsCount(uint8 id) external view returns (uint256 count) {
        return communities.getTagsCount(id);
    }

    /**
     * @dev Get tags count in community.
     *
     * Requirements:
     *
     * - Must be an existing community.
     */
    function getTags(uint256 communityId) external view returns (CommunityLib.Tag[] memory) {
        return communities.getTags(communityId);
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

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override(ERC20Upgradeable, ERC20PausableUpgradeable, ERC20CappedUpgradeable) {
        super._beforeTokenTransfer(from, to, amount);
    }
}