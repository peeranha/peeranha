pragma solidity ^0.7.3;
pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";

import "./libraries/UserLib.sol";
import "./libraries/CommunityLib.sol";
import "./libraries/PostLib.sol";
import "./libraries/RewardLib.sol";
import "./libraries/SecurityLib.sol";
import "./libraries/AchievementLib.sol";
import "./libraries/AchievementCommonLib.sol";
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
    using AchievementLib for AchievementLib.AchievementsContainer;
    // using ConfigurationLib for ConfigurationLib.Configuration;

    UserLib.UserContext userContext;
    CommunityLib.CommunityCollection communities;
    PostLib.PostCollection posts;
    // ConfigurationLib.Configuration configuration;

    function initialize(address peeranhaNFTContractAddress) public initializer {
        __Peeranha_init();
        userContext.achievementsContainer.peeranhaNFT = IPeeranhaNFT(peeranhaNFTContractAddress);
        // configuration.setConfiguration(CommonLib.getTimestamp());
    }
    
    function __Peeranha_init() public initializer {
        __Peeranha_init_unchained();
    }

    function __AccessControl_init_unchained() internal initializer {
    }

    function __Peeranha_init_unchained() internal initializer {
        SecurityLib.setupRole(userContext, SecurityLib.DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function getRatingToReward(address user, uint16 rewardPeriod) external view override returns(int32) {
        RewardLib.PeriodRating storage userPeriod = RewardLib.getUserPeriodRating(userContext.userRewards, user, rewardPeriod);
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
        UserLib.create(userContext.users, msg.sender, ipfsHash);
    }

    /**
     * @dev Edit user profile.
     *
     * Requirements:
     *
     * - Must be an existing user.  
     */
    function updateUser(bytes32 ipfsHash) external override {
        UserLib.update(userContext, msg.sender, ipfsHash);
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
        UserLib.followCommunity(userContext, msg.sender, communityId);
    }

    /**
     * @dev Unfollow community.
     *
     * Requirements:
     *
     * - Must be follow the community.  
     */
    function unfollowCommunity(uint32 communityId) external override {
        UserLib.unfollowCommunity(userContext.users, msg.sender, communityId);
    }

    /**
     * @dev Get users count.
     */
    function getUsersCount() external view returns (uint256 count) {
        return userContext.users.getUsersCount();
    }

    /**
     * @dev Get user profile by index.
     *
     * Requirements:
     *
     * - Must be an existing user.
     */
    function getUserByIndex(uint256 index) external view returns (UserLib.User memory) {
        return userContext.users.getUserByIndex(index);
    }

    /**
     * @dev Get user profile by address.
     *
     * Requirements:
     *
     * - Must be an existing user.
     */
    function getUserByAddress(address addr) external view returns (UserLib.User memory) {
        return userContext.users.getUserByAddress(addr);
    }

    /**
     * @dev Check user existence.
     */
    function isUserExists(address addr) external view returns (bool) {
        return userContext.users.isExists(addr);
    }

    /**
     * @dev Get user permissions by address.
     *
     * Requirements:
     *
     * - Must be an existing user.
     */
    function getUserPermissions(address addr) external view returns (bytes32[] memory) {
        return SecurityLib.getPermissions(userContext.userRoles, addr);
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
    onlyAdmin() {
        onlyExisitingUser(user);
        SecurityLib.grantRole(userContext, SecurityLib.DEFAULT_ADMIN_ROLE, user);
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
    onlyAdmin() {
        onlyExisitingUser(user);
        SecurityLib.revokeRole(userContext, SecurityLib.DEFAULT_ADMIN_ROLE, user);
    }

    /**
     * @dev Create new community.
     *
     * Requirements:
     *
     * - Must be a new community.
     */
    function createCommunity(bytes32 ipfsHash, CommunityLib.Tag[] memory tags) external onlyAdmin() {
        onlyExisitingUser(msg.sender);
        uint32 communityId = communities.createCommunity(ipfsHash, tags);
        SecurityLib.grantRole(userContext, SecurityLib.getCommunityRole(SecurityLib.COMMUNITY_ADMIN_ROLE, communityId), msg.sender);
        SecurityLib.grantRole(userContext, SecurityLib.getCommunityRole(SecurityLib.COMMUNITY_MODERATOR_ROLE, communityId), msg.sender);
    }

    /**
     * @dev Edit community info.
     *
     * Requirements:
     *
     * - Must be an existing community.  
     * - Sender must be community moderator.
     */
    function updateCommunity(uint32 communityId, bytes32 ipfsHash) external 
    onlyExistingAndNotFrozenCommunity(communityId)
    onlyAdminOrCommunityModerator(communityId) {
        onlyExisitingUser(msg.sender);
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
    onlyExistingAndNotFrozenCommunity(communityId) 
    onlyAdminOrCommunityAdmin(communityId) {
        onlyExisitingUser(msg.sender);
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
    function unfreezeCommunity(uint32 communityId) external onlyAdminOrCommunityAdmin(communityId) {
        onlyExisitingUser(msg.sender);
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
    onlyExistingAndNotFrozenCommunity(communityId)
    onlyAdminOrCommunityAdmin(communityId) {
        onlyExisitingUser(user);
        SecurityLib.grantRole(userContext, SecurityLib.getCommunityRole(SecurityLib.COMMUNITY_ADMIN_ROLE, communityId), user);
        SecurityLib.grantRole(userContext, SecurityLib.getCommunityRole(SecurityLib.COMMUNITY_MODERATOR_ROLE, communityId), user);
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
    onlyExistingAndNotFrozenCommunity(communityId) 
    onlyCommunityAdmin(communityId) {
        onlyExisitingUser(user);
        SecurityLib.grantRole(userContext, SecurityLib.getCommunityRole(SecurityLib.COMMUNITY_MODERATOR_ROLE, communityId), user);
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
    onlyExistingAndNotFrozenCommunity(communityId) 
    onlyCommunityAdmin(communityId) {
        onlyExisitingUser(user);
        SecurityLib.revokeRole(userContext, SecurityLib.getCommunityRole(SecurityLib.COMMUNITY_ADMIN_ROLE, communityId), user);
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
    onlyExistingAndNotFrozenCommunity(communityId)
    onlyCommunityAdmin(communityId) {
        onlyExisitingUser(user);
        SecurityLib.revokeRole(userContext, SecurityLib.getCommunityRole(SecurityLib.COMMUNITY_MODERATOR_ROLE, communityId), user);
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
    onlyExistingAndNotFrozenCommunity(communityId) 
    onlyAdminOrCommunityModerator(communityId) { // community admin || global moderator
        onlyExisitingUser(msg.sender);
        communities.createTag(communityId, ipfsHash);
    }

    /**
     * @dev Edit tag info.
     *
     * Requirements:
     *
     * - Must be an existing commuity. 
     * - Must be an existing tag.  
     * - Sender must be community moderator.
     */
    function updateTag(uint32 communityId, uint8 tagId, bytes32 ipfsHash) external 
    onlyExistingTag(tagId, communityId) 
    onlyAdminOrCommunityModerator(communityId) {
        onlyExisitingUser(msg.sender);
        communities.updateTag(tagId, communityId, ipfsHash);
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
    function getTag(uint32 communityId, uint8 tagId) external view
    onlyExistingTag(tagId, communityId) 
    returns (CommunityLib.Tag memory) {
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
    onlyExistingAndNotFrozenCommunity(communityId)
    checkTags(communityId, tags) override {
        onlyExisitingUser(msg.sender);
        posts.createPost(userContext, msg.sender, communityId, ipfsHash, postType, tags);
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
    function editPost(uint256 postId, bytes32 ipfsHash, uint8[] memory tags) external
    checkTagsByPostId(postId, tags) override {
        onlyExisitingUser(msg.sender);
        posts.editPost(userContext, msg.sender, postId, ipfsHash, tags);
    }

    /**
     * @dev delete post.
     *
     * Requirements:
     *
     * - must be a post.
    */
    function deletePost(uint256 postId) external override {
        onlyExisitingUser(msg.sender);
        posts.deletePost(userContext, msg.sender, postId);
    }

    /**
     * @dev Create new reply.
     *
     * Requirements:
     *
     * - must be a post.
     * - must be a new reply. 
    */
    function createReply(uint256 postId, uint16 parentReplyId, bytes32 ipfsHash, bool isOfficialReply) external override {
        onlyExisitingUser(msg.sender);
        posts.createReply(userContext, msg.sender, postId, parentReplyId, ipfsHash, isOfficialReply);
    }

    /**
     * @dev Edit reply.
     *
     * Requirements:
     *
     * - must be a reply.
     * - must be new info about reply.
    */
    function editReply(uint256 postId, uint16 replyId, bytes32 ipfsHash) external override {
        onlyExisitingUser(msg.sender);
        posts.editReply(userContext, msg.sender, postId, replyId, ipfsHash);
    }

    /**
     * @dev Delete reply.
     *
     * Requirements:
     *
     * - must be a reply.
    */
    function deleteReply(uint256 postId, uint16 replyId) external override {
        onlyExisitingUser(msg.sender);
        posts.deleteReply(userContext, msg.sender, postId, replyId);
    }

    /**
     * @dev Create new comment.
     *
     * Requirements:
     *
     * - must be a new comment.
     * - must be a post or a reply.
    */
    function createComment(uint256 postId, uint16 parentReplyId, bytes32 ipfsHash) external override {
        onlyExisitingUser(msg.sender);
        posts.createComment(userContext, msg.sender, postId, parentReplyId, ipfsHash);
    }

    /**
     * @dev Edit comment.
     *
     * Requirements:
     *
     * - must be a comment.
     * - must be new info about reply.
    */
    function editComment(uint256 postId, uint16 parentReplyId, uint8 commentId, bytes32 ipfsHash) external override {
        onlyExisitingUser(msg.sender);
        posts.editComment(userContext, msg.sender, postId, parentReplyId, commentId, ipfsHash);
    }

    /**
     * @dev Delete comment.
     *
     * Requirements:
     *
     * - must be a comment.
    */
    function deleteComment(uint256 postId, uint16 parentReplyId, uint8 commentId) external override {
        onlyExisitingUser(msg.sender);
        posts.deleteComment(userContext, msg.sender, postId, parentReplyId, commentId);
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
        onlyExisitingUser(msg.sender);           
        posts.changeStatusOfficialReply(userContext.roles, msg.sender, postId, replyId);
    }

    /**
     * @dev Change status best reply
     *
     * Requirements:
     *
     * - must be a reply.
     * - must be a role ?
    */ 
    function changeStatusBestReply(uint256 postId, uint16 replyId) external override {
        onlyExisitingUser(msg.sender);
        posts.changeStatusBestReply(userContext, msg.sender, postId, replyId);
    }

    /**
     * @dev Vote post or reply or comment
     *
     * Requirements:
     *
     * - must be a post/reply/comment.
    */ 
    function voteItem(uint256 postId, uint16 replyId, uint8 commentId, bool isUpvote) external override {
        onlyExisitingUser(msg.sender);
        posts.voteForumItem(userContext, msg.sender, postId, replyId, commentId, isUpvote);
    }

    function changePostType(uint256 postId, PostLib.PostType postType) external override {
        onlyExisitingUser(msg.sender);
        posts.changePostType(userContext, msg.sender, postId, postType);
    }

    function configureNewAchievement(
        uint64 maxCount,
        int64 lowerBound,
        string memory achievementURI,
        AchievementCommonLib.AchievementsType achievementsType
    )   
        onlyAdmin()
        external
    {
        userContext.achievementsContainer.configureNewAchievement(maxCount, lowerBound, achievementURI, achievementsType);
    }

    function getAchievementConfig(uint64 achievementId) external view returns (AchievementLib.AchievementConfig memory) {
        return userContext.achievementsContainer.achievementsConfigs[achievementId];
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
        return RewardLib.getUserPeriodRating(userContext.userRewards, user, period);
    }

    function getStatusHistory(address user, uint256 postId, uint16 replyId, uint8 commentId) external view returns (int256) {
        return PostLib.getStatusHistory(posts, user, postId, replyId, commentId);
    }

    function getVotedUsers(uint256 postId, uint16 replyId, uint8 commentId) external view returns (address[] memory) {
        return PostLib.getVotedUsers(posts, postId, replyId, commentId);
    }

    ///
    // TO DO
    // to remove it in prod
    ///
    function addUserRating(address userAddr, int32 rating) external {
        UserLib.updateUserRating(userContext, userAddr, rating);
    }

    ///
    // delete
    ///
    function setEnergy(address userAddr, uint16 energy) external {
        userContext.users.getUserByAddress(userAddr).energy = energy;
    }

    function onlyExisitingUser(address user) private {
        require(UserLib.isExists(userContext.users, user),
        "Peeranha: must be an existing user");
    }

    modifier onlyCommunityModerator(uint32 communityId) {
        SecurityLib.onlyCommunityModerator(userContext.roles, communityId);
        _;
    }

    modifier onlyCommunityAdmin(uint32 communityId) {
        SecurityLib.onlyCommunityAdmin(userContext.roles, communityId);
        _;
    }

    modifier onlyAdminOrCommunityAdmin(uint32 communityId) {
        SecurityLib.onlyAdminOrCommunityAdmin(userContext.roles, communityId);
        _;
    }

    modifier onlyAdminOrCommunityModerator(uint32 communityId) {
        SecurityLib.onlyAdminOrCommunityModerator(userContext.roles, communityId);
        _;
    }

    modifier onlyAdmin() {
        SecurityLib.onlyAdmin(userContext.roles);
        _;
    }

    modifier onlyExistingAndNotFrozenCommunity(uint32 communityId) {
        CommunityLib.onlyExistingAndNotFrozenCommunity(communities, communityId);
        _;
    }
    
    modifier onlyExistingTag(uint8 tagId, uint32 communityId) {
        CommunityLib.onlyExistingTag(communities, tagId, communityId);
        _;
    }
    
    modifier checkTags(uint32 communityId, uint8[] memory tags) {
        CommunityLib.checkTags(communities, communityId, tags);
        _;
    }

    modifier checkTagsByPostId(uint256 postId, uint8[] memory tags) {
        CommunityLib.checkTagsByPostId(communities, posts, postId, tags);
        _;
    }
}