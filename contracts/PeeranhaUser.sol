pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./libraries/UserLib.sol";
import "./libraries/AchievementLib.sol";
import "./libraries/AchievementCommonLib.sol";
import "./base/NativeMetaTransaction.sol";

import "./interfaces/IPeeranhaUser.sol";
import "./interfaces/IPeeranhaCommunity.sol";
import "./interfaces/IPeeranhaToken.sol";


contract PeeranhaUser is IPeeranhaUser, Initializable, NativeMetaTransaction {
    using UserLib for UserLib.UserCollection;
    using UserLib for UserLib.UserRatingCollection;
    using UserLib for UserLib.User;
    using AchievementLib for AchievementLib.AchievementsContainer;

    UserLib.UserContext userContext;

    function initialize(address peeranhaCommunityContractAddress, address peeranhaNFTContractAddress, address peeranhaTokenContractAddress) public initializer {
        __Peeranha_init();
        userContext.peeranhaCommunity = IPeeranhaCommunity(peeranhaCommunityContractAddress);
        userContext.peeranhaCommunityAddress = peeranhaCommunityContractAddress;
        userContext.achievementsContainer.peeranhaNFT = IPeeranhaNFT(peeranhaNFTContractAddress);
        userContext.peeranhaToken = IPeeranhaToken(peeranhaTokenContractAddress);
        // configuration.setConfiguration(CommonLib.getTimestamp());
    }
    
    function __Peeranha_init() public onlyInitializing {
        __Peeranha_init_unchained();
    }

    function __Peeranha_init_unchained() internal onlyInitializing {
        UserLib.setupRole(userContext, UserLib.DEFAULT_ADMIN_ROLE, _msgSender());
    }

    /**
     * @dev List of communities where user has rewards in a given period.
     *
     * Requirements:
     *
     * - Must be an existing user and valid period.
     */
    function getUserRewardCommunities(address user, uint16 rewardPeriod) external override view returns(uint32[] memory) {
        return userContext.userRatingCollection.communityRatingForUser[user].userPeriodRewards[rewardPeriod].rewardCommunities;
    }

    /**
     * @dev Total reward shares for a given period.
     *
     * Requirements:
     *
     * - Must be a valid period.
     */
    function getPeriodRewardShares(uint16 period) external view override returns(RewardLib.PeriodRewardShares memory) {
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
        UserLib.create(userContext.users, _msgSender(), ipfsHash);
    }

    /**
     * @dev Edit user profile.
     *
     * Requirements:
     *
     * - Must be an existing user.  
     */
    function updateUser(address userAddress, bytes32 ipfsHash) external override {
        UserLib.createIfDoesNotExist(userContext.users, _msgSender());
        UserLib.update(userContext, userAddress, ipfsHash);
    }

    /**
     * @dev Follow community.
     *
     * Requirements:
     *
     * - Must be an community.  
     */
    function followCommunity(address userAddress, uint32 communityId) external override {
        onlyExistingAndNotFrozenCommunity(communityId);
        UserLib.createIfDoesNotExist(userContext.users, _msgSender());
        UserLib.followCommunity(userContext, userAddress, communityId);
    }

    /**
     * @dev Unfollow community.
     *
     * Requirements:
     *
     * - Must be follow the community.  
     */
    function unfollowCommunity(address userAddress, uint32 communityId) external override {
        onlyExistingAndNotFrozenCommunity(communityId);
        UserLib.createIfDoesNotExist(userContext.users, _msgSender());
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

    /**
     * @dev Get user rating in a given community.
     *
     * Requirements:
     *
     * - Must be an existing user and existing community.
     */
    function getUserRating(address addr, uint32 communityId) external view returns (int32) {
        return userContext.userRatingCollection.getUserRating(addr, communityId);
    }

    /**
     * @dev Check if user with given address exists.
     */
    function userExists(address addr) external view returns (bool) {
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
    function giveAdminPermission(address userAddr) external {
        UserLib.User storage user = UserLib.getUserByAddress(userContext.users, userAddr);
        UserLib.checkRatingAndEnergy(userContext.roles, user, 0, _msgSender(), userAddr, 0, UserLib.Action.NONE, UserLib.Permission.admin);
        UserLib.grantRole(userContext, UserLib.DEFAULT_ADMIN_ROLE, userAddr);
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
    function revokeAdminPermission(address userAddr) external {
        UserLib.User storage user = UserLib.getUserByAddress(userContext.users, userAddr);
        UserLib.checkRatingAndEnergy(userContext.roles, user, 0, _msgSender(), userAddr, 0, UserLib.Action.NONE, UserLib.Permission.admin);

        UserLib.revokeRole(userContext, UserLib.DEFAULT_ADMIN_ROLE, userAddr);
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
    function giveCommunityAdminPermission(address userAddr, uint32 communityId) external override {
        address actionCaller = userAddr;
        if (_msgSender() != userContext.peeranhaCommunityAddress) {
            onlyExistingAndNotFrozenCommunity(communityId);
            actionCaller = _msgSender();
        }
        UserLib.User storage user = UserLib.getUserByAddress(userContext.users, userAddr);
        UserLib.checkRatingAndEnergy(userContext.roles, user, 0, actionCaller, userAddr, communityId, UserLib.Action.NONE, UserLib.Permission.adminOrCommunityAdmin);

        UserLib.grantRole(userContext, UserLib.getCommunityRole(UserLib.COMMUNITY_ADMIN_ROLE, communityId), userAddr);
        UserLib.grantRole(userContext, UserLib.getCommunityRole(UserLib.COMMUNITY_MODERATOR_ROLE, communityId), userAddr);
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
    function giveCommunityModeratorPermission(address userAddr, uint32 communityId) external {  // add check user
        onlyExistingAndNotFrozenCommunity(communityId);
        UserLib.User storage user = UserLib.getUserByAddress(userContext.users, userAddr);
        UserLib.checkRatingAndEnergy(userContext.roles, user, 0, _msgSender(), userAddr, communityId, UserLib.Action.NONE, UserLib.Permission.communityAdmin);
        UserLib.grantRole(userContext, UserLib.getCommunityRole(UserLib.COMMUNITY_MODERATOR_ROLE, communityId), userAddr);
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
    function revokeCommunityAdminPermission(address userAddr, uint32 communityId) external {
        onlyExistingAndNotFrozenCommunity(communityId);
        UserLib.User storage user = UserLib.getUserByAddress(userContext.users, userAddr);
        UserLib.checkRatingAndEnergy(userContext.roles, user, 0, _msgSender(), userAddr, communityId, UserLib.Action.NONE, UserLib.Permission.communityAdmin);  // communityAdmin? mb admin and communityAdmin
        UserLib.revokeRole(userContext, UserLib.getCommunityRole(UserLib.COMMUNITY_ADMIN_ROLE, communityId), userAddr);
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
    function revokeCommunityModeratorPermission(address userAddr, uint32 communityId) external {
        onlyExistingAndNotFrozenCommunity(communityId);
        UserLib.User storage user = UserLib.getUserByAddress(userContext.users, userAddr);
        UserLib.checkRatingAndEnergy(userContext.roles, user, 0, _msgSender(), userAddr, communityId, UserLib.Action.NONE, UserLib.Permission.communityAdmin);
        UserLib.revokeRole(userContext, UserLib.getCommunityRole(UserLib.COMMUNITY_MODERATOR_ROLE, communityId), userAddr);
    }

    function configureNewAchievement(
        uint64 maxCount,
        int64 lowerBound,
        string memory achievementURI,
        AchievementCommonLib.AchievementsType achievementsType
    )   
        external
    {
        UserLib.User storage user = UserLib.getUserByAddress(userContext.users, _msgSender());
        UserLib.checkRatingAndEnergy(userContext.roles, user, 0, _msgSender(), address(0), 0, UserLib.Action.NONE, UserLib.Permission.admin);
        userContext.achievementsContainer.configureNewAchievement(maxCount, lowerBound, achievementURI, achievementsType);
    }

    function getAchievementConfig(uint64 achievementId) external view returns (AchievementLib.AchievementConfig memory) {
        return userContext.achievementsContainer.achievementsConfigs[achievementId];
    }

    function getRatingToReward(address user, uint16 rewardPeriod, uint32 communityId) external view override returns(int32) {
        RewardLib.PeriodRating memory periodRating = userContext.userRatingCollection.communityRatingForUser[user].userPeriodRewards[rewardPeriod].periodRating[communityId];
        return periodRating.ratingToReward - periodRating.penalty;
    }

    // only unitTest
    function getPeriodRating(address user, uint16 rewardPeriod, uint32 communityId) external view returns(RewardLib.PeriodRating memory) {
        return userContext.userRatingCollection.communityRatingForUser[user].userPeriodRewards[rewardPeriod].periodRating[communityId];
    }

    // only unitTest
    function getPeriodReward(uint16 rewardPeriod) external view returns(int32) {
        return userContext.periodRewardContainer.periodRewardShares[rewardPeriod].totalRewardShares;
    }


    // Used for unit tests
    /*function addUserRating(address userAddr, int32 rating, uint32 communityId) external {
        UserLib.updateUserRating(userContext, userAddr, rating, communityId);
    }*/

    // Used for unit tests
    /*function setEnergy(address userAddr, uint16 energy) external {
        userContext.users.getUserByAddress(userAddr).energy = energy;
    }*/

    function updateUserRating(address userAddr, int32 rating, uint32 communityId) external override {
        UserLib.updateUserRating(userContext, userAddr, rating, communityId);
    }

    function updateUsersRating(UserLib.UserRatingChange[] memory usersRating, uint32 communityId) external override {
        UserLib.updateUsersRating(userContext, usersRating, communityId);
    }

    function checkPermission(address actionCaller, address dataUser, uint32 communityId, UserLib.Action action, UserLib.Permission permission, bool isCreate) external override {
        if (isCreate) {
            UserLib.createIfDoesNotExist(userContext.users, actionCaller);
        }
        UserLib.User storage user = UserLib.getUserByAddress(userContext.users, actionCaller);
        int32 userRating = UserLib.getUserRating(userContext.userRatingCollection, actionCaller, communityId);
        UserLib.checkRatingAndEnergy(userContext.roles, user, userRating, actionCaller, dataUser, communityId, action, permission);
    }

    function onlyExistingAndNotFrozenCommunity(uint32 communityId) private {
        userContext.peeranhaCommunity.onlyExistingAndNotFrozenCommunity(communityId);
    }

    ///
    // TO DO
    // remove it in prod ?
    /// 
    function getActiveUserPeriods(address userAddr) external view returns (uint16[] memory) {
        return userContext.userRatingCollection.communityRatingForUser[userAddr].rewardPeriods;
    }
}