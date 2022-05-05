pragma solidity ^0.7.3;
pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";

import "./libraries/UserLib.sol";
import "./libraries/CommunityLib.sol";
import "./libraries/PostLib.sol";
import "./libraries/RewardLib.sol";
import "./libraries/AchievementLib.sol";
import "./libraries/AchievementCommonLib.sol";
// import "./libraries/ConfigurationLib.sol";

import "./interfaces/IPeeranha.sol";


contract Peeranha is IPeeranha, Initializable {
    using UserLib for UserLib.UserCollection;
    using UserLib for UserLib.UserRatingCollection;
    using UserLib for UserLib.User;
    using UserLib for UserLib.UserDelegationCollection;
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
        UserLib.setupRole(userContext, UserLib.DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setTokenContract(address peeranhaTokenAddress) public onlyAdmin() {
       userContext.peeranhaToken = IPeeranhaToken(peeranhaTokenAddress); 
    }

    function getUserRewardCommunities(address user, uint16 rewardPeriod) external override view returns(uint32[] memory) {
        return userContext.userRatingCollection.communityRatingForUser[user].userPeriodRewards[rewardPeriod].rewardCommunities;
    }

    function getPeriodRewardContainer(uint16 period) external view override returns(RewardLib.PeriodRewardShares memory) {
        return userContext.periodRewardContainer.periodRewardShares[period];
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
     * @dev Signup for user account by delegate user.
     *
     * Requirements:
     *
     * - Must be a new user.
     */
    function createUserByDelegate(address userAddress, bytes32 ipfsHash) external override {
        UserLib.createByDelegate(userContext, msg.sender, userAddress, ipfsHash);
    }

    /**
     * @dev Edit user profile.
     *
     * Requirements:
     *
     * - Must be an existing user.  
     */
    function updateUser(address userAddress, bytes32 ipfsHash) external override {
        UserLib.update(userContext, userAddress, ipfsHash);
    }

    /**
     * @dev Follow community.
     *
     * Requirements:
     *
     * - Must be an community.  
     */
    function followCommunity(address userAddress, uint32 communityId) external override
    onlyExistingAndNotFrozenCommunity(communityId) {  // onlyExisitingOrDelegatingUser(userAddress); check deligate?  // createUser
        UserLib.followCommunity(userContext, userAddress, communityId);
    }

    /**
     * @dev Unfollow community.
     *
     * Requirements:
     *
     * - Must be follow the community.  
     */
    function unfollowCommunity(address userAddress, uint32 communityId) external override { // onlyExisitingOrDelegatingUser(userAddress); check deligate?  // createUser
        UserLib.unfollowCommunity(userContext.users, userAddress, communityId);
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

    function getUserRating(address addr, uint32 communityId) external view returns (int32) {
        return userContext.userRatingCollection.getUserRating(addr, communityId);
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
        return UserLib.getPermissions(userContext.userRoles, addr);
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
        onlyExisitingOrDelegatingUser(user);
        UserLib.grantRole(userContext, UserLib.DEFAULT_ADMIN_ROLE, user);
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
        onlyExisitingOrDelegatingUser(user);
        UserLib.revokeRole(userContext, UserLib.DEFAULT_ADMIN_ROLE, user);
    }
    
    /**
     * @dev Give admin permission.
     *
     * Requirements:
     *
     * - Sender must global administrator.
     * - Must be an existing user. 
     */
    function setDelegateUser(address delegateUser) external
    onlyAdmin() {
        UserLib.setDelegateUser(userContext.userDelegationCollection, delegateUser);
    }

    /**
     * @dev Create new community.
     *
     * Requirements:
     *
     * - Must be a new community.
     */
    function createCommunity(bytes32 ipfsHash, CommunityLib.Tag[] memory tags) external onlyAdmin() {
        onlyExisitingOrDelegatingUser(msg.sender);
        uint32 communityId = communities.createCommunity(ipfsHash, tags);
        UserLib.grantRole(userContext, UserLib.getCommunityRole(UserLib.COMMUNITY_ADMIN_ROLE, communityId), msg.sender);
        UserLib.grantRole(userContext, UserLib.getCommunityRole(UserLib.COMMUNITY_MODERATOR_ROLE, communityId), msg.sender);
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
        onlyExisitingOrDelegatingUser(msg.sender);
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
        onlyExisitingOrDelegatingUser(msg.sender);
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
        onlyExisitingOrDelegatingUser(msg.sender);
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
        UserLib.grantRole(userContext, UserLib.getCommunityRole(UserLib.COMMUNITY_ADMIN_ROLE, communityId), user);
        UserLib.grantRole(userContext, UserLib.getCommunityRole(UserLib.COMMUNITY_MODERATOR_ROLE, communityId), user);
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
        UserLib.grantRole(userContext, UserLib.getCommunityRole(UserLib.COMMUNITY_MODERATOR_ROLE, communityId), user);
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
        UserLib.revokeRole(userContext, UserLib.getCommunityRole(UserLib.COMMUNITY_ADMIN_ROLE, communityId), user);
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
        UserLib.revokeRole(userContext, UserLib.getCommunityRole(UserLib.COMMUNITY_MODERATOR_ROLE, communityId), user);
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
        onlyExisitingOrDelegatingUser(msg.sender);
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
        onlyExisitingOrDelegatingUser(msg.sender);
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
    function createPost(address userAddress, uint32 communityId, bytes32 ipfsHash, PostLib.PostType postType, uint8[] memory tags) external 
    onlyExistingAndNotFrozenCommunity(communityId)
    checkTags(communityId, tags) override {
        onlyExisitingOrDelegatingUser(userAddress);
        posts.createPost(userContext, userAddress, communityId, ipfsHash, postType, tags);
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
    function editPost(address userAddress, uint256 postId, bytes32 ipfsHash, uint8[] memory tags) external
    checkTagsByPostId(postId, tags) override {
        onlyExisitingOrDelegatingUser(userAddress);
        posts.editPost(userContext, userAddress, postId, ipfsHash, tags);
    }

    /**
     * @dev delete post.
     *
     * Requirements:
     *
     * - must be a post.
    */
    function deletePost(address userAddress, uint256 postId) external override {
        onlyExisitingOrDelegatingUser(userAddress);
        posts.deletePost(userContext, userAddress, postId);
    }

    /**
     * @dev Create new reply.
     *
     * Requirements:
     *
     * - must be a post.
     * - must be a new reply. 
    */
    function createReply(address userAddress, uint256 postId, uint16 parentReplyId, bytes32 ipfsHash, bool isOfficialReply) external override {
        onlyExisitingOrDelegatingUser(userAddress);
        posts.createReply(userContext, userAddress, postId, parentReplyId, ipfsHash, isOfficialReply);
    }

    /**
     * @dev Edit reply.
     *
     * Requirements:
     *
     * - must be a reply.
     * - must be new info about reply.
    */
    function editReply(address userAddress, uint256 postId, uint16 replyId, bytes32 ipfsHash) external override {
        onlyExisitingOrDelegatingUser(userAddress);
        posts.editReply(userContext, userAddress, postId, replyId, ipfsHash);
    }

    /**
     * @dev Delete reply.
     *
     * Requirements:
     *
     * - must be a reply.
    */
    function deleteReply(address userAddress, uint256 postId, uint16 replyId) external override {
        onlyExisitingOrDelegatingUser(userAddress);
        posts.deleteReply(userContext, userAddress, postId, replyId);
    }

    /**
     * @dev Create new comment.
     *
     * Requirements:
     *
     * - must be a new comment.
     * - must be a post or a reply.
    */
    function createComment(address userAddress, uint256 postId, uint16 parentReplyId, bytes32 ipfsHash) external override {
        onlyExisitingOrDelegatingUser(userAddress);
        posts.createComment(userContext, userAddress, postId, parentReplyId, ipfsHash);
    }

    /**
     * @dev Edit comment.
     *
     * Requirements:
     *
     * - must be a comment.
     * - must be new info about reply.
    */
    function editComment(address userAddress, uint256 postId, uint16 parentReplyId, uint8 commentId, bytes32 ipfsHash) external override {
        onlyExisitingOrDelegatingUser(userAddress);
        posts.editComment(userContext, userAddress, postId, parentReplyId, commentId, ipfsHash);
    }

    /**
     * @dev Delete comment.
     *
     * Requirements:
     *
     * - must be a comment.
    */
    function deleteComment(address userAddress, uint256 postId, uint16 parentReplyId, uint8 commentId) external override {
        onlyExisitingOrDelegatingUser(userAddress);
        posts.deleteComment(userContext, userAddress, postId, parentReplyId, commentId);
    }

    /**
     * @dev Change status official answer.
     *
     * Requirements:
     *
     * - must be a reply.
     * - the user must have right for change status oficial answer.
    */ 
    function changeStatusOfficialReply(address userAddress, uint256 postId, uint16 replyId) external override {
        onlyExisitingOrDelegatingUser(userAddress);           
        posts.changeStatusOfficialReply(userContext.roles, userAddress, postId, replyId);
    }

    /**
     * @dev Change status best reply
     *
     * Requirements:
     *
     * - must be a reply.
     * - must be a role ?
    */ 
    function changeStatusBestReply(address userAddress, uint256 postId, uint16 replyId) external override {
        onlyExisitingOrDelegatingUser(userAddress);
        posts.changeStatusBestReply(userContext, userAddress, postId, replyId);
    }

    /**
     * @dev Vote post or reply or comment
     *
     * Requirements:
     *
     * - must be a post/reply/comment.
    */ 
    function voteItem(address userAddress, uint256 postId, uint16 replyId, uint8 commentId, bool isUpvote) external override {
        onlyExisitingOrDelegatingUser(userAddress);
        posts.voteForumItem(userContext, userAddress, postId, replyId, commentId, isUpvote);
    }

    function changePostType(address userAddress, uint256 postId, PostLib.PostType postType) external override {
        onlyExisitingOrDelegatingUser(userAddress);
        posts.changePostType(userContext, userAddress, postId, postType);
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

    function getRatingToReward(address user, uint16 rewardPeriod, uint32 communityId) external view override returns(int32) {
        return userContext.userRatingCollection.communityRatingForUser[user].userPeriodRewards[rewardPeriod].periodRating[communityId].ratingToReward -
                userContext.userRatingCollection.communityRatingForUser[user].userPeriodRewards[rewardPeriod].periodRating[communityId].penalty;
    }

    // only unitTest
    function getPeriodRating(address user, uint16 rewardPeriod, uint32 communityId) external view returns(RewardLib.PeriodRating memory) {
        return userContext.userRatingCollection.communityRatingForUser[user].userPeriodRewards[rewardPeriod].periodRating[communityId];
    }

    // only unitTest
    function getPeriodReward(uint16 rewardPeriod) external view returns(int32) {
        return userContext.periodRewardContainer.periodRewardShares[rewardPeriod].totalRewardShares;
    }

    function getStatusHistory(address user, uint256 postId, uint16 replyId, uint8 commentId) external view returns (int256) {
        return PostLib.getStatusHistory(posts, user, postId, replyId, commentId);
    }

    function getPeriodInfo() external view returns (uint256 startPeriodTime, uint256 periodLength) {
        return (RewardLib.START_PERIOD_TIME, RewardLib.PERIOD_LENGTH);
    }

    function getPeriod() external view returns (uint16) {
        return RewardLib.getPeriod(CommonLib.getTimestamp());
    }

    function getActiveUsersInPeriod(uint16 period) external view returns (address[] memory) {
        return userContext.periodRewardContainer.periodRewardShares[period].activeUsersInPeriod;
    }

    ///
    // TO DO
    // to remove it in prod
    /// ?
    function getAcctiveUserPeriods (address userAddr) external view returns (uint16[] memory) {
        return userContext.userRatingCollection.communityRatingForUser[userAddr].rewardPeriods;
    }

    ///
    // TO DO
    // to remove it in prod
    /// ?
    function getVotedUsers(uint256 postId, uint16 replyId, uint8 commentId) external view returns (address[] memory) {
        return PostLib.getVotedUsers(posts, postId, replyId, commentId);
    }

    function addUserRating(address userAddr, int32 rating, uint32 communityId) external {
        PostLib.addUserRating(userContext, userAddr, rating, communityId);
    }

    function setEnergy(address userAddr, uint16 energy) external {
        userContext.users.getUserByAddress(userAddr).energy = energy;
    }

    function onlyExisitingOrDelegatingUser(address user) private {
        if (user != msg.sender) {
            require(UserLib.isDelegateUser(userContext.userDelegationCollection, msg.sender, user), "erro_deligate");
        }

        onlyExisitingUser(user);
    }

    function onlyExisitingUser(address user) private {
        require(UserLib.isExists(userContext.users, user),
        "Peeranha: must be an existing user");
    }

    modifier onlyCommunityModerator(uint32 communityId) {
        UserLib.onlyCommunityModerator(userContext.roles, communityId);
        _;
    }

    modifier onlyCommunityAdmin(uint32 communityId) {
        UserLib.onlyCommunityAdmin(userContext.roles, communityId);
        _;
    }

    modifier onlyAdminOrCommunityAdmin(uint32 communityId) {
        UserLib.onlyAdminOrCommunityAdmin(userContext.roles, communityId);
        _;
    }

    modifier onlyAdminOrCommunityModerator(uint32 communityId) {
        UserLib.onlyAdminOrCommunityModerator(userContext.roles, communityId);
        _;
    }

    modifier onlyAdmin() {
        UserLib.onlyAdmin(userContext.roles);
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
        PostLib.PostContainer storage postContainer = PostLib.getPostContainer(posts, postId);
        CommunityLib.checkTagsByPostId(communities, postContainer.info.communityId, postId, tags);
        _;
    }
}