pragma solidity ^0.7.3;
pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";

import "./libraries/UserLib.sol";
import "./libraries/CommunityLib.sol";
import "./libraries/PostLib.sol";
import "./libraries/RewardLib.sol";
import "./libraries/SecurityLib.sol";
// import "./libraries/ConfigurationLib.sol";

import "./interfaces/IPeeranha.sol";


contract Peeranha is IPeeranha, Initializable {
    using UserLib for UserLib.UserCollection;
    using UserLib for UserLib.User;
    using CommunityLib for CommunityLib.CommunityCollection;
    using CommunityLib for CommunityLib.Community;
    using PostLib for PostLib.Post;
    using PostLib for PostLib.Reply;
    using PostLib for PostLib.Comment;
    using PostLib for PostLib.PostCollection;
    // using ConfigurationLib for ConfigurationLib.Configuration;

    UserLib.UserCollection users;
    RewardLib.UserRewards userRewards;
    CommunityLib.CommunityCollection communities;
    PostLib.PostCollection posts;
    SecurityLib.Roles roles;
    SecurityLib.UserRoles userRoles;
    // ConfigurationLib.Configuration configuration;

    function initialize() public initializer {
        __Peeranha_init();
        // configuration.setConfiguration(CommonLib.getTimestamp());
    }
    
    function __Peeranha_init() public initializer {
        __Peeranha_init_unchained();
    }

    function __AccessControl_init_unchained() internal initializer {
    }

    function __Peeranha_init_unchained() internal initializer {
        SecurityLib.setupRole(roles, userRoles, SecurityLib.DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function getRatingToReward(address user, uint16 rewardPeriod) external view returns(int32) {
        RewardLib.PeriodRating storage userPeriod = RewardLib.getUserPeriod(userRewards, user, rewardPeriod);
        return userPeriod.ratingToReward;
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
     * @dev Follow community.
     *
     * Requirements:
     *
     * - Must be an community.  
     */
    function followCommunity(uint32 communityId) external override 
    onlyExistingAndNotFrozenCommunity(communityId) {
        users.followCommunity(msg.sender, communityId);
    }

    /**
     * @dev Unfollow community.
     *
     * Requirements:
     *
     * - Must be follow the community.  
     */
    function unfollowCommunity(uint32 communityId) external override {
        users.unfollowCommunity(msg.sender, communityId);
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
     * @dev Check user existence.
     */
    function isUserExists(address addr) external view returns (bool) {
        return users.isExists(addr);
    }

    /**
     * @dev Get user permissions by address.
     *
     * Requirements:
     *
     * - Must be an existing user.
     */
    function getUserPermissions(address addr) external view returns (bytes32[] memory) {
        return SecurityLib.getPermissions(userRoles, addr);
    }


    /**
     * @dev Give admin permission.
     *
     * Requirements:
     *
     * - Sender must global administrator.
     * - Must be an existing user. 
     */
    function giveAdminPermission(address user) external
    onlyAdmin()
    onlyExisitingUser(user) {
        SecurityLib.grantRole(roles, userRoles, SecurityLib.DEFAULT_ADMIN_ROLE, user);
    }

    /**
     * @dev Revoke admin permission.
     *
     * Requirements:
     *
     * - Sender must global administrator.
     * - Must be an existing user. 
     */

     //should do something with AccessControlUpgradeable(revoke only for default admin)
    function revokeAdminPermission(address user) external 
    onlyAdmin()
    onlyExisitingUser(user) {
        SecurityLib.revokeRole(roles, userRoles, SecurityLib.DEFAULT_ADMIN_ROLE, user);
    }

    /**
     * @dev Create new community.
     *
     * Requirements:
     *
     * - Must be a new community.
     */
    function createCommunity(bytes32 ipfsHash, CommunityLib.Tag[] memory tags) external onlyExisitingUser(msg.sender) onlyAdmin() {
        uint32 communityId = communities.createCommunity(ipfsHash, tags);
        SecurityLib.grantRole(roles, userRoles, SecurityLib.getCommunityRole(SecurityLib.COMMUNITY_ADMIN_ROLE, communityId), msg.sender);
        SecurityLib.grantRole(roles, userRoles, SecurityLib.getCommunityRole(SecurityLib.COMMUNITY_MODERATOR_ROLE, communityId), msg.sender);
    }

    /**
     * @dev Edit community info.
     *
     * Requirements:
     *
     * - Must be an existing community.  
     * - Sender must be community moderator.
     */
    function updateCommunity(uint32 communityId, bytes32 ipfsHash) external onlyExisitingUser(msg.sender) onlyExistingAndNotFrozenCommunity(communityId) onlyAdminOrCommunityModerator(communityId) {
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
    function freezeCommunity(uint32 communityId) external onlyExisitingUser(msg.sender) onlyExistingAndNotFrozenCommunity(communityId) onlyAdmin() {
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
    function unfreezeCommunity(uint32 communityId) external onlyExisitingUser(msg.sender) onlyAdmin() {
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
    onlyAdminOrCommunityAdmin(communityId)
    onlyExisitingUser(user) 
    onlyExistingAndNotFrozenCommunity(communityId) {
        SecurityLib.grantRole(roles, userRoles, SecurityLib.getCommunityRole(SecurityLib.COMMUNITY_ADMIN_ROLE, communityId), user);
        SecurityLib.grantRole(roles, userRoles, SecurityLib.getCommunityRole(SecurityLib.COMMUNITY_MODERATOR_ROLE, communityId), user);
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
    onlyExisitingUser(user)
    onlyExistingAndNotFrozenCommunity(communityId) {
        SecurityLib.grantRole(roles, userRoles, SecurityLib.getCommunityRole(SecurityLib.COMMUNITY_MODERATOR_ROLE, communityId), user);
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
    onlyCommunityAdmin(communityId)
    onlyExisitingUser(user)
    onlyExistingAndNotFrozenCommunity(communityId) {
        SecurityLib.revokeRole(roles, userRoles, SecurityLib.getCommunityRole(SecurityLib.COMMUNITY_ADMIN_ROLE, communityId), user);
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
    onlyExisitingUser(user) 
    onlyExistingAndNotFrozenCommunity(communityId) {
        SecurityLib.revokeRole(roles, userRoles, SecurityLib.getCommunityRole(SecurityLib.COMMUNITY_MODERATOR_ROLE, communityId), user);
    }

    /**
     * @dev Create new tag.
     *
     * Requirements:
     *
     * - Must be a new tag.
     * - Must be an existing community. 
     */
    function createTag(uint32 communityId, bytes32 ipfsHash) external 
    onlyExisitingUser(msg.sender) 
    onlyExistingAndNotFrozenCommunity(communityId) 
    onlyAdminOrCommunityModerator(communityId) { // community admin || global moderator
        communities.createTag(communityId, ipfsHash);
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
     * @dev Get tags in community.
     *
     * Requirements:
     *
     * - Must be an existing community.
     * - must be a tags.
     */
    function getTags(uint32 communityId) external view returns (CommunityLib.Tag[] memory) {
        return communities.getTags(communityId);
    }

    /**
     * @dev Get tag in community.
     *
     * Requirements:
     *
     * - Must be an existing community.
     * - Must be a tag.
     */
    function getTag(uint32 communityId, uint8 tagId) external view returns (CommunityLib.Tag memory) {
        return communities.getTag(communityId, tagId);
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
    function createPost(uint32 communityId, bytes32 ipfsHash, PostLib.PostType postType, uint8[] memory tags) external 
    onlyExisitingUser(msg.sender) 
    onlyExistingAndNotFrozenCommunity(communityId) override {
        posts.createPost(roles, users, msg.sender, communityId, ipfsHash, postType, tags);
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
    function editPost(uint256 postId, uint32 communityId, bytes32 ipfsHash, uint8[] memory tags) external onlyExisitingUser(msg.sender) override {
        posts.editPost(msg.sender, postId, communityId, ipfsHash, tags);
    }

    /**
     * @dev delete post.
     *
     * Requirements:
     *
     * - must be a post.
    */
    function deletePost(uint256 postId) external onlyExisitingUser(msg.sender) override {
        posts.deletePost(roles, users, userRewards, msg.sender, postId);
    }

    /**
     * @dev Create new reply.
     *
     * Requirements:
     *
     * - must be a post.
     * - must be a new reply. 
    */
    function createReply(uint256 postId, uint16 parentReplyId, bytes32 ipfsHash, bool isOfficialReply) external onlyExisitingUser(msg.sender) override {
        posts.createReply(roles, users, userRewards, msg.sender, postId, parentReplyId, ipfsHash, isOfficialReply);
    }

    /**
     * @dev Edit reply.
     *
     * Requirements:
     *
     * - must be a reply.
     * - must be new info about reply.
    */
    function editReply(uint256 postId, uint16 replyId, bytes32 ipfsHash) external onlyExisitingUser(msg.sender) override { 
        posts.editReply(msg.sender, postId, replyId, ipfsHash);
    }

    /**
     * @dev Delete reply.
     *
     * Requirements:
     *
     * - must be a reply.
    */
    function deleteReply(uint256 postId, uint16 replyId) external onlyExisitingUser(msg.sender) override { 
        posts.deleteReply(roles, users, userRewards, msg.sender, postId, replyId);
    }

    /**
     * @dev Create new comment.
     *
     * Requirements:
     *
     * - must be a new comment.
     * - must be a post or a reply.
    */
    function createComment(uint256 postId, uint16 parentReplyId, bytes32 ipfsHash) external onlyExisitingUser(msg.sender)override {
        posts.createComment(roles, users, msg.sender, postId, parentReplyId, ipfsHash);
    }

    /**
     * @dev Edit comment.
     *
     * Requirements:
     *
     * - must be a comment.
     * - must be new info about reply.
    */
    function editComment(uint256 postId, uint16 parentReplyId, uint8 commentId, bytes32 ipfsHash) external onlyExisitingUser(msg.sender) override {
        posts.editComment(msg.sender, postId, parentReplyId, commentId, ipfsHash);
    }

    /**
     * @dev Delete comment.
     *
     * Requirements:
     *
     * - must be a comment.
    */
    function deleteComment(uint256 postId, uint16 parentReplyId, uint8 commentId) external onlyExisitingUser(msg.sender) override {
        posts.deleteComment(roles, users, msg.sender, postId, parentReplyId, commentId);
    }

    /**
     * @dev Change status official answer.
     *
     * Requirements:
     *
     * - must be a reply.
     * - the user must have right for change status oficial answer.
    */ 
    function changeStatusOfficialReply(uint256 postId, uint16 replyId) external onlyExisitingUser(msg.sender) override {            
        posts.changeStatusOfficialReply(roles, msg.sender, postId, replyId);
    }

    /**
     * @dev Change status best reply
     *
     * Requirements:
     *
     * - must be a reply.
     * - must be a role ?
    */ 
    function changeStatusBestReply(uint256 postId, uint16 replyId) external onlyExisitingUser(msg.sender) override {
        posts.changeStatusBestReply(users, userRewards, msg.sender, postId, replyId);
    }

    /**
     * @dev Vote post or reply or comment
     *
     * Requirements:
     *
     * - must be a post/reply/comment.
    */ 
    function voteItem(uint256 postId, uint16 replyId, uint8 commentId, bool isUpvote) external onlyExisitingUser(msg.sender) override {  
        posts.voteForumItem(roles, users, userRewards, msg.sender, postId, replyId, commentId, isUpvote);
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
    function getReply(uint256 postId, uint16 replyId) external view returns (PostLib.Reply memory) {
        return posts.getReply(postId, replyId);
    }

    /**
     * @dev Get a comment by index.
     *
     * Requirements:
     *
     * - must be a comment.
    */
    function getComment(uint256 postId, uint16 parentReplyId, uint8 commentId) external view returns (PostLib.Comment memory) {
        return posts.getComment(postId, parentReplyId, commentId);
    }

    /**
     * @dev Get a comment by index.
     *
     * Requirements:
     *
     * - must be a user.
     * - must be a reward in this period.
     * - must be a period less then now.
    */
    function getUserRewardPeriod(address user, uint16 period) external view returns (RewardLib.PeriodRating memory) {
        return RewardLib.getUserPeriod(userRewards, user, period);
    }

    function addUserRating(address userAddr, int32 rating) external { // delete?
        users.updateUserRating(userRewards, userAddr, rating);
    }

    modifier onlyExisitingUser(address user) {
        require(UserLib.isExists(users, user),
        "Peeranha: must be an existing user");
        _;
    }

    modifier onlyCommunityModerator(uint32 communityId) {
        SecurityLib.onlyCommunityModerator(roles, communityId);
        _;
    }

    modifier onlyCommunityAdmin(uint32 communityId) {
        SecurityLib.onlyCommunityAdmin(roles, communityId);
        _;
    }

    modifier onlyAdminOrCommunityAdmin(uint32 communityId) {
        SecurityLib.onlyAdminOrCommunityAdmin(roles, communityId);
        _;
    }

    modifier onlyAdminOrCommunityModerator(uint32 communityId) {
        SecurityLib.onlyAdminOrCommunityModerator(roles, communityId);
        _;
    }

    modifier onlyAdmin() {
        SecurityLib.onlyAdmin(roles);
        _;
    }

    modifier onlyExistingAndNotFrozenCommunity(uint32 communityId) {
        CommunityLib.onlyExistingAndNotFrozenCommunity(communities, communityId);
        _;
    }
}