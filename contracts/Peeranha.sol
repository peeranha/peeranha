pragma solidity ^0.7.3;
pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20CappedUpgradeable.sol";

import "./libraries/UserLib.sol";
import "./libraries/CommunityLib.sol";
import "./libraries/PostLib.sol";

import "./interfaces/IPeeranha.sol";


contract Peeranha is IPeeranha, Initializable, AccessControlUpgradeable, ERC20Upgradeable, ERC20PausableUpgradeable, ERC20CappedUpgradeable  {
    using UserLib for UserLib.UserCollection;
    using UserLib for UserLib.User;
    using CommunityLib for CommunityLib.CommunityCollection;
    using CommunityLib for CommunityLib.Community;
    using PostLib for PostLib.Content;
    using PostLib for PostLib.PostCollection;
    
    UserLib.UserCollection users;
    CommunityLib.CommunityCollection communities;
    PostLib.PostCollection posts;
    
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
        communities.createCommunity(communityId, ipfsHash, tags);
    }

    /**
     * @dev Edit community info.
     *
     * Requirements:
     *
     * - Must be an existing community.  
     */
    function updateCommunity(uint256 communityId, bytes32 ipfsHash) external {
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

    /**
     * @dev Create new post.
     *
     * Requirements:
     *
     * - must be a new post.
     * - must be a community.
     * - must be tags.
    */
    function createPost(address name, uint8 communityId, bytes32 ipfsHash/*, CommunityLib.Tag[] memory tags*/) external override {
        posts.createPost(name, communityId, ipfsHash/*, tags*/);
    }

    /**
     * @dev Edit post info.
     *
     * Requirements:
     *
     * - must be a post.
     * - must be new info about post
     * - must be a community.
     * - must be tags
    */
    function editPost(address name, uint32 postId, uint8 communityId, bytes32 ipfsHash/*, CommunityLib.Tag[] memory tags*/) external override {
        posts.editPost(name, postId, communityId, ipfsHash/*, tags*/);
    }

    /**
     * @dev delete post.
     *
     * Requirements:
     *
     * - must be a post.
    */
    function deletePost(address name, uint32 postId) external override {
        posts.deletePost(name, postId);
    }

    /**
     * @dev Create new reply.
     *
     * Requirements:
     *
     * - must be a post.
     * - must be a new reply. 
    */
    function createReply(address name, uint32 postId, bool officialReply, uint16[] memory path, bytes32 ipfsHash) external override {
        posts.createReply(name, postId, officialReply, path, ipfsHash);
    }

    /**
     * @dev Edit reply.
     *
     * Requirements:
     *
     * - must be a reply.
     * - must be new info about reply.
    */
    function editReply(address name, uint32 postId, uint16[] memory path, uint16 replyId, bool officialReply, bytes32 ipfsHash) external override { 
        posts.editReply(name, postId, path, replyId, officialReply, ipfsHash);
    }

    /**
     * @dev Delete reply.
     *
     * Requirements:
     *
     * - must be a reply.
    */
    function deleteReply(address name, uint32 postId, uint16[] memory path, uint16 replyId) external override { 
        posts.deleteReply(name, postId, path, replyId);
    }

    /**
     * @dev Create new comment.
     *
     * Requirements:
     *
     * - must be a new comment.
     * - must be a post or a reply.
    */
    function createComment(address name, uint32 postId, uint16[] memory path, bytes32 ipfsHash) external override {
        posts.createComment(name, postId, path, ipfsHash);
    }

    /**
     * @dev Edit comment.
     *
     * Requirements:
     *
     * - must be a comment.
     * - must be new info about reply.
    */
    function editComment(address name, uint32 postId, uint16[] memory path, uint8 commentId, bytes32 ipfsHash) external override {
        posts.editComment(name, postId, path, commentId, ipfsHash);
    }

    /**
     * @dev Delete comment.
     *
     * Requirements:
     *
     * - must be a comment.
    */
    function deleteComment(address name, uint32 postId, uint16[] memory path, uint8 commentId) external override {
        posts.deleteComment(name, postId, path, commentId);
    }


    /**
     * @dev Get a post by index.
     *
     * Requirements:
     *
     * - must be a post.
    */
    function getPostByIndex(uint32 postId) external view returns (PostLib.Content memory) {
        return posts.getPostByIndex(postId);
    }

    /**
     * @dev Get a reply by index.
     *
     * Requirements:
     *
     * - must be a reply.
    */
    function getReplyByPath(uint32 postId, uint16[] memory path, uint16 replyId) external view returns (PostLib.Content memory) {
        return posts.getReplyByPath(postId, path, replyId);
    }

    /**
     * @dev Get a comment by index.
     *
     * Requirements:
     *
     * - must be a comment.
    */
    function getCommentByPath(uint32 postId, uint16[] memory path, uint8 commentId) external view returns (PostLib.Content memory) {
        return posts.getCommentByPath(postId, path, commentId);
    }
}