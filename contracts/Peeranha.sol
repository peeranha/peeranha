pragma solidity ^0.7.3;
pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20CappedUpgradeable.sol";

import "./libraries/User.sol";
import "./libraries/CommunitiesAndTags.sol";

import "./interfaces/IPeeranha.sol";

contract Peeranha is IPeeranha, Initializable, AccessControlUpgradeable, ERC20Upgradeable, ERC20PausableUpgradeable, ERC20CappedUpgradeable  {
    using User for User.Collection;
    using User for User.Info;
    using CommunitiesAndTags for CommunitiesAndTags.CommunityCollection;
    using CommunitiesAndTags for CommunitiesAndTags.CommunityInfo;

    User.Collection users;
    CommunitiesAndTags.CommunityCollection communities;
   
    
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
     * @dev Create new community.
     *
     * Requirements:
     *
     * - Must be a new community.
     */
    function createCommunity(uint32 communityId, bytes32 ipfsHash, CommunitiesAndTags.TagInfo[] memory suggestedTags) external {
        communities.createCommunity(communityId, ipfsHash, suggestedTags);
    }

    /**
     * @dev Edit community info.
     *
     * Requirements:
     *
     * - Must be an existing community.  
     */
    function updateCommunity(uint32 communityId, bytes32 ipfsHash) external {
        communities.updateCommunity(communityId, ipfsHash);
    }

    /**
     * @dev Create new tag.
     *
     * Requirements:
     *
     * - Must be a new tag.
     * - Must be an existing community. 
     */
    function createTag(uint32 communityId, uint32 tagId, bytes32 ipfsHash) external {
        communities.createTag(communityId, tagId, ipfsHash);
    }

    /**
     * @dev Get communities count.
     */
    function getCommunitiesCount() external view returns (uint32 count) {
        return communities.getCommunitiesCount();
    }

    /**
     * @dev Get community info by id.
     *
     * Requirements:
     *
     * - Must be an existing community.
     */
    function getCommunityById(uint32 communityId) external view returns (CommunitiesAndTags.CommunityInfo memory) {
        return communities.getCommunityById(communityId);
    }

    /**
     * @dev Get tags count in community.
     *
     * Requirements:
     *
     * - Must be an existing community.
     */
    function getTagsCountByCommunityId(uint32 id) external view returns (uint32 count) {
        return communities.getTagsCountByCommunityId(id);
    }

    /**
     * @dev Get tags count in community.
     *
     * Requirements:
     *
     * - Must be an existing community.
     */
    function getTagsByCommunityId(uint32 communityId) external view returns (CommunitiesAndTags.TagInfo[] memory) {
        return communities.getTagsByCommunityId(communityId);
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