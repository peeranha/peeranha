pragma solidity ^0.7.3;
pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20CappedUpgradeable.sol";

import "./libraries/UserLib.sol";
import "./libraries/CommunityLib.sol";
import "./libraries/PostLib.sol";

import "./interfaces/IPeeranha.sol";
import "./Sequrity.sol";

import "hardhat/console.sol";


contract Peeranha is IPeeranha, Initializable, Sequrity, ERC20Upgradeable, ERC20PausableUpgradeable, ERC20CappedUpgradeable  {
    using UserLib for UserLib.UserCollection;
    using UserLib for UserLib.User;
    using CommunityLib for CommunityLib.CommunityCollection;
    using CommunityLib for CommunityLib.Community;
    using PostLib for PostLib.Post;
    using PostLib for PostLib.Reply;
    using PostLib for PostLib.Comment;
    using PostLib for PostLib.PostCollection;

    UserLib.UserCollection users;
    CommunityLib.CommunityCollection communities;
    PostLib.PostCollection posts;

    uint256 public constant TOTAL_SUPPLY = 100000000 * (10 ** 18);
    
    function initialize(string memory name, string memory symbol) public initializer {
        __Peeranha_init(name, symbol, TOTAL_SUPPLY);
    }
    
    function __Peeranha_init(string memory name, string memory symbol, uint256 cap) internal initializer {
        __AccessControl_init_unchained();
        __ERC20_init_unchained(name, symbol);
        __Pausable_init_unchained();
        __ERC20Capped_init_unchained(cap);
        __ERC20Pausable_init_unchained();
        __Peeranha_init_unchained();
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
    function createCommunity(uint32 communityId, bytes32 ipfsHash, CommunityLib.Tag[] memory tags) external {
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
    function updateCommunity(uint32 communityId, bytes32 ipfsHash) external onlyCommunityAdmin(communityId) {
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
    function freezeCommunity(uint32 communityId) external 
    onlyCommunityAdmin(communityId) {
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
    function unfreezeCommunity(uint32 communityId) external 
    onlyCommunityAdmin(communityId) {
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
    function giveCommunityAdminPermission(address user, uint32 communityId) external 
    onlyExisitingUser(users, user) onlyExistingAndNotFrozenCommunity(communities, communityId) {
        _setupRole(getCommunityRole(COMMUNITY_ADMIN_ROLE, communityId), user);
        _setupRole(getCommunityRole(COMMUNITY_MODERATOR_ROLE, communityId), user);
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
    function giveCommunityModeratorPermission(address user, uint32 communityId) external 
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
    function revokeCommunityAdminPermission(address user, uint32 communityId) external 
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
    function revokeCommunityModeratorPermission(address user, uint32 communityId) external 
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
    function createTag(uint32 communityId, uint8 tagId, bytes32 ipfsHash) external {
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
    function getCommunity(uint32 communityId) external view returns (CommunityLib.Community memory) {
        return communities.getCommunity(communityId);
    }

    /**
     * @dev Get tags count in community.
     *
     * Requirements:
     *
     * - Must be an existing community.
     */
    function getTagsCount(uint32 communityId) external view returns (uint8 count) {
        return communities.getTagsCount(communityId);
    }

    /**
     * @dev Get tags count in community.
     *
     * Requirements:
     *
     * - Must be an existing community.
     */
    function getTags(uint32 communityId) external view returns (CommunityLib.Tag[] memory) {
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
    function createPost(uint32 communityId, bytes32 ipfsHash, PostLib.PostType postType, uint8[] memory tags) external override {
        posts.createPost(msg.sender, communityId, ipfsHash, postType, tags);
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
    function editPost(uint256 postId, uint32 communityId, bytes32 ipfsHash, uint8[] memory tags) external override {
        posts.editPost(msg.sender, postId, communityId, ipfsHash, tags);
    }

    /**
     * @dev delete post.
     *
     * Requirements:
     *
     * - must be a post.
    */
    function deletePost(uint256 postId) external override {
        posts.deletePost(users, msg.sender, postId);
    }

    /**
     * @dev Create new reply.
     *
     * Requirements:
     *
     * - must be a post.
     * - must be a new reply. 
    */
    function createReply(uint256 postId, uint16[] memory path, bytes32 ipfsHash, bool isOfficialReply) external override {
        posts.createReply(users, msg.sender, postId, path, ipfsHash, isOfficialReply);
    }

    /**
     * @dev Edit reply.
     *
     * Requirements:
     *
     * - must be a reply.
     * - must be new info about reply.
    */
    function editReply(uint256 postId, uint16[] memory path, uint16 replyId, bytes32 ipfsHash) external override { 
        posts.editReply(msg.sender, postId, path, replyId, ipfsHash);
    }

    /**
     * @dev Delete reply.
     *
     * Requirements:
     *
     * - must be a reply.
    */
    function deleteReply(uint256 postId, uint16[] memory path, uint16 replyId) external override { 
        posts.deleteReply(users, msg.sender, postId, path, replyId);
    }

    /**
     * @dev Create new comment.
     *
     * Requirements:
     *
     * - must be a new comment.
     * - must be a post or a reply.
    */
    function createComment(uint256 postId, uint16[] memory path, bytes32 ipfsHash) external override {
        posts.createComment(msg.sender, postId, path, ipfsHash);
    }

    /**
     * @dev Edit comment.
     *
     * Requirements:
     *
     * - must be a comment.
     * - must be new info about reply.
    */
    function editComment(uint256 postId, uint16[] memory path, uint8 commentId, bytes32 ipfsHash) external override {
        posts.editComment(msg.sender, postId, path, commentId, ipfsHash);
    }

    /**
     * @dev Delete comment.
     *
     * Requirements:
     *
     * - must be a comment.
    */
    function deleteComment(uint256 postId, uint16[] memory path, uint8 commentId) external override {
        posts.deleteComment(msg.sender, postId, path, commentId);
    }

    /**
     * @dev Change status official answer.
     *
     * Requirements:
     *
     * - must be a reply.
     * - the user must have right for change status oficial answer.
    */ 
    function changeStatusOfficialReply(uint256 postId, uint16 replyId) external override {
        posts.changeStatusOfficialReply(msg.sender, postId, replyId);
    }

    function changeStatusBestReply(uint256 postId, uint16 replyId) external override {
        posts.changeStatusBestReply(users, msg.sender, postId, replyId);
    }

    /**
     * @dev Vote post or reply or comment
     *
     * Requirements:
     *
     * - must be a post/reply/comment.
     * - rating user. ?
    */ 
    function voteItem(uint256 postId, uint16[] memory path, uint16 replyId, uint8 commentId, bool isUpvote) external override {
        posts.voteForumItem(users, msg.sender, postId, path, replyId, commentId, isUpvote);
    }

    /**
     * @dev Get a post by index.
     *
     * Requirements:
     *
     * - must be a post.
    */
    function getPost(uint256 postId) external view returns (PostLib.Post memory) {
        return posts.getPost(postId);
    }

    /**
     * @dev Get a reply by index.
     *
     * Requirements:
     *
     * - must be a reply.
    */
    function getReply(uint256 postId, uint16[] memory path, uint16 replyId) external view returns (PostLib.Reply memory) {
        return posts.getReply(postId, path, replyId);
    }

    /**
     * @dev Get a comment by index.
     *
     * Requirements:
     *
     * - must be a comment.
    */
    function getComment(uint256 postId, uint16[] memory path, uint8 commentId) external view returns (PostLib.Comment memory) {
        return posts.getComment(postId, path, commentId);
    }
}