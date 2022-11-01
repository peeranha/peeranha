//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";


import "./libraries/UserLib.sol";
import "./libraries/CommonLib.sol";
import "./libraries/AchievementLib.sol";
import "./libraries/AchievementCommonLib.sol";
import "./base/NativeMetaTransaction.sol";

import "./interfaces/IPeeranhaUser.sol";


contract PeeranhaUser is IPeeranhaUser, Initializable, NativeMetaTransaction, AccessControlEnumerableUpgradeable {
    // TODO: This is still not used
    using UserLib for UserLib.UserCollection;
    using UserLib for UserLib.UserRatingCollection;
    using AchievementLib for AchievementLib.AchievementsContainer;

    bytes32 public constant PROTOCOL_ADMIN_ROLE = bytes32(keccak256("PROTOCOL_ADMIN_ROLE"));
    
    uint256 public constant COMMUNITY_ADMIN_ROLE = uint256(keccak256("COMMUNITY_ADMIN_ROLE"));
    uint256 public constant COMMUNITY_MODERATOR_ROLE = uint256(keccak256("COMMUNITY_MODERATOR_ROLE"));

    bytes32 public constant BOT_ROLE = bytes32(keccak256("BOT_ROLE"));

    UserLib.UserContext userContext;

    function initialize() public initializer {
        __Peeranha_init();
    }
    
    function __Peeranha_init() public onlyInitializing {
        __AccessControlEnumerable_init();
        __Peeranha_init_unchained();
        __NativeMetaTransaction_init("PeeranhaUser");
    }

    function __Peeranha_init_unchained() internal onlyInitializing {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(PROTOCOL_ADMIN_ROLE, _msgSender());
        _setRoleAdmin(PROTOCOL_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        // TODO: Uncomment this when contract size will be smaller or for redeploy
        // _setRoleAdmin(PROTOCOL_ADMIN_ROLE, BOT_ROLE);
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

    function setContractAddresses(address communityContractAddress, address contentContractAddress, address nftContractAddress, address tokenContractAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        userContext.peeranhaCommunity = IPeeranhaCommunity(communityContractAddress);
        userContext.peeranhaContent = IPeeranhaContent(contentContractAddress);
        userContext.peeranhaToken = IPeeranhaToken(tokenContractAddress);
        userContext.achievementsContainer.peeranhaNFT = IPeeranhaNFT(nftContractAddress);
    }

    /**
     * @dev Set the admin of role
     *
     * Requirements:
     *
     * - Must be an existing role.
     */
    function setRoleAdmin(bytes32 role, bytes32 adminRole) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _setRoleAdmin(role, adminRole);
    }

    /**
     * @dev List of communities where user has rewards in a given period.
     *
     * Requirements:
     *
     * - Must be an existing user and valid period.
     */
    function getUserRewardCommunities(address user, uint16 rewardPeriod) public override view returns(uint32[] memory) {
        return UserLib.getUserRewardCommunities(userContext, user, rewardPeriod);
    }

    /**
     * @dev Total reward shares for a given period.
     *
     * Requirements:
     *
     * - Must be a valid period.
     */
    function getPeriodRewardShares(uint16 period) public view override returns(RewardLib.PeriodRewardShares memory) {
        return UserLib.getPeriodRewardShares(userContext, period);
    }

    /**
     * @dev Signup for user account.
     *
     * Requirements:
     *
     * - Must be a new user.
     */
    function createUser(bytes32 ipfsHash) public override {
        UserLib.create(userContext.users, _msgSender(), ipfsHash);
    }

    /**
     * @dev Edit user profile.
     *
     * Requirements:
     *
     * - Must be an existing user.  
     */
    function updateUser(bytes32 ipfsHash) public override {
        address userAddress = _msgSender();
        UserLib.createIfDoesNotExist(userContext.users, userAddress);
        UserLib.update(userContext, userAddress, ipfsHash);
    }

    /**
     * @dev Follow community.
     *
     * Requirements:
     *
     * - Must be an community.  
     */
    function followCommunity(uint32 communityId) public override {
        onlyExistingAndNotFrozenCommunity(communityId);
        address userAddress = _msgSender();
        UserLib.createIfDoesNotExist(userContext.users, userAddress);
        UserLib.followCommunity(userContext, userAddress, communityId);
    }

    /**
     * @dev Unfollow community.
     *
     * Requirements:
     *
     * - Must be follow the community.  
     */
    function unfollowCommunity(uint32 communityId) public override {
        UserLib.unfollowCommunity(userContext, _msgSender(), communityId);
    }

    /**
     * @dev Get users count.
     */
    function getUsersCount() public view returns (uint256 count) {
        return userContext.users.getUsersCount();
    }

    /**
     * @dev Get user profile by index.
     *
     * Requirements:
     *
     * - Must be an existing user.
     */
    function getUserByIndex(uint256 index) public view returns (UserLib.User memory) {
        return userContext.users.getUserByIndex(index);
    }

    /**
     * @dev Get user profile by address.
     *
     * Requirements:
     *
     * - Must be an existing user.
     */
    function getUserByAddress(address addr) public view returns (UserLib.User memory) {
        return userContext.users.getUserByAddress(addr);
    }

    /**
     * @dev Get user rating in a given community.
     *
     * Requirements:
     *
     * - Must be an existing user and existing community.
     */
    function getUserRating(address addr, uint32 communityId) public view returns (int32) {
        return userContext.userRatingCollection.getUserRating(addr, communityId);
    }

    /**
     * @dev Check user existence.
     */
    function isUserExists(address addr) public view returns (bool) {
        return userContext.users.isExists(addr);
    }

    /**
     * @dev Check if user with given address exists.
     */
    function checkUser(address addr) public view {
        require(userContext.users.isExists(addr), "user_not_found");
    }


    /**
     * @dev Init community administrator permission.
     *
     * Requirements:
     *
     * - Sender must be global administrator.
     * - Must be an existing community.
     * - Must be an existing user. 
     */
    function initCommunityAdminPermission(address userAddr, uint32 communityId) public override {       // TODO: test new admin + add unittest
        checkUser(userAddr);
        require(_msgSender() == address(userContext.peeranhaCommunity), "unauthorized");
        
        bytes32 communityAdminRole = getCommunityRole(COMMUNITY_ADMIN_ROLE, communityId);
        bytes32 communityModeratorRole = getCommunityRole(COMMUNITY_MODERATOR_ROLE, communityId);
        
        _setRoleAdmin(communityModeratorRole, communityAdminRole);
        _setRoleAdmin(communityAdminRole, PROTOCOL_ADMIN_ROLE);

        _grantRole(communityAdminRole, userAddr);
        _grantRole(communityModeratorRole, userAddr);
    }

    /**
     * @dev Give community administrator permission.
     *
     * Requirements:
     *
     * - Sender must be global administrator.
     * - Must be an existing community.
     * - Must be an existing user. 
     */
    function giveCommunityAdminPermission(address userAddr, uint32 communityId) public override {
        checkUser(userAddr);
        onlyExistingAndNotFrozenCommunity(communityId);
        checkHasRole(_msgSender(), UserLib.ActionRole.AdminOrCommunityAdmin, communityId);
        
        _grantRole(getCommunityRole(COMMUNITY_ADMIN_ROLE, communityId), userAddr);
        _grantRole(getCommunityRole(COMMUNITY_MODERATOR_ROLE, communityId), userAddr);
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
    function giveCommunityModeratorPermission(address userAddr, uint32 communityId) public {
        checkUser(userAddr);
        onlyExistingAndNotFrozenCommunity(communityId);
        checkHasRole(_msgSender(), UserLib.ActionRole.AdminOrCommunityAdmin, communityId);
        _grantRole(getCommunityRole(COMMUNITY_MODERATOR_ROLE, communityId), userAddr);
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
    function revokeCommunityAdminPermission(address userAddr, uint32 communityId) public {
        onlyExistingAndNotFrozenCommunity(communityId);
        checkHasRole(_msgSender(), UserLib.ActionRole.AdminOrCommunityAdmin, communityId);
        require(userAddr != _msgSender(), "self_revoke");
        _revokeRole(getCommunityRole(COMMUNITY_ADMIN_ROLE, communityId), userAddr);
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
    function revokeCommunityModeratorPermission(address userAddr, uint32 communityId) public {
        onlyExistingAndNotFrozenCommunity(communityId);
        checkHasRole(_msgSender(), UserLib.ActionRole.AdminOrCommunityAdmin, communityId);
        _revokeRole(getCommunityRole(COMMUNITY_MODERATOR_ROLE, communityId), userAddr);
    }

    /**
     * @dev Create new achievement.
     *
     * Requirements:
     *
     * - Only admin can call the action.
     */
    function configureNewAchievement(
        uint64 maxCount,
        int64 lowerBound,
        string memory achievementURI,
        AchievementCommonLib.AchievementsType achievementsType
    )   
        external
    {
        checkHasRole(_msgSender(), UserLib.ActionRole.Admin, 0);
        userContext.achievementsContainer.configureNewAchievement(maxCount, lowerBound, achievementURI, achievementsType);
    }

    /**
     * @dev Get information about achievement.
     *
     * Requirements:
     *
     * - Must be an existing achievement.
     */
    function getAchievementConfig(uint64 achievementId) public view returns (AchievementLib.AchievementConfig memory) {
        return userContext.achievementsContainer.achievementsConfigs[achievementId];
    }

    /**
     * @dev Get user reward.
     *
     * Requirements:
     *
     * - Must be an existing community.
     * - Must be an existing user.
     */
    function getRatingToReward(address user, uint16 rewardPeriod, uint32 communityId) public view override returns(int32) {
        RewardLib.PeriodRating memory periodRating = userContext.userRatingCollection.communityRatingForUser[user].userPeriodRewards[rewardPeriod].periodRating[communityId];
        return CommonLib.toInt32FromUint256(periodRating.ratingToReward) - CommonLib.toInt32FromUint256(periodRating.penalty);
    }

    
    // TODO: Why is it commented? Remove this code if not needed.
    /**
     * @dev Get information about user rewards. (Rating to reward and penalty)
     *
     * Requirements:
     *
     * - Must be an existing community.
     * - Must be an existing user. 
     */
    /*function getPeriodRating(address user, uint16 rewardPeriod, uint32 communityId) public view returns(RewardLib.PeriodRating memory) {
        return userContext.userRatingCollection.communityRatingForUser[user].userPeriodRewards[rewardPeriod].periodRating[communityId];
    }*/

    // TODO: Why is it commented? Remove this code if not needed.
    /**
     * @dev Get information abour sum rating to reward all users
     */
    /*function getPeriodReward(uint16 rewardPeriod) public view returns(uint256) {
        return userContext.periodRewardContainer.periodRewardShares[rewardPeriod].totalRewardShares;
    }*/
    
    /**
     * @dev Change user rating
     *
     * Requirements:
     *
     * - Must be an existing community.
     * - Must be an existing user.
     * - Contract peeranhaContent must call action
     */
    function updateUserRating(address userAddr, int32 rating, uint32 communityId) public override {
        require(msg.sender == address(userContext.peeranhaContent), "internal_call_unauthorized");
        UserLib.updateUserRating(userContext, userAddr, rating, communityId);
    }

    /**
     * @dev Change users rating
     *
     * Requirements:
     *
     * - Must be an existing community.
     * - Must be an existing users.
     * - Only contract peeranhaContent can call the action
     */
    function updateUsersRating(UserLib.UserRatingChange[] memory usersRating, uint32 communityId) public override {
        require(msg.sender == address(userContext.peeranhaContent), "internal_call_unauthorized");
        UserLib.updateUsersRating(userContext, usersRating, communityId);
    }

    /**
     * @dev Check the role/energy/rating of the user to perform some action
     *
     * Requirements:
     *
     * - Must be an existing community.
     * - Only contract peeranhaContent and peeranhaCommunity can call the action
     */
    function checkActionRole(address actionCaller, address dataUser, uint32 communityId, UserLib.Action action, UserLib.ActionRole actionRole, bool createUserIfDoesNotExist) public override {
        require(msg.sender == address(userContext.peeranhaContent) || msg.sender == address(userContext.peeranhaCommunity), "internal_call_unauthorized");
        if (createUserIfDoesNotExist) {
            UserLib.createIfDoesNotExist(userContext.users, actionCaller);
        }

        if (hasModeratorRole(actionCaller, communityId)) {
            return;
        }
                
        checkHasRole(actionCaller, actionRole, communityId);
        UserLib.checkRatingAndEnergy(userContext, actionCaller, dataUser, communityId, action);
    }

    function getActiveUserPeriods(address userAddr) public view returns (uint16[] memory) {
        return userContext.userRatingCollection.communityRatingForUser[userAddr].rewardPeriods;
    }

    function checkHasRole(address actionCaller, UserLib.ActionRole actionRole, uint32 communityId) public override view {
        // TODO: fix error messages. If checkActionRole() call checkHasRole() admin and comModerator can do actions. But about they are not mentioned in error message.
        string memory message;
        bool isAdmin = hasRole(PROTOCOL_ADMIN_ROLE, actionCaller);
        bool isCommunityAdmin = hasRole(getCommunityRole(COMMUNITY_ADMIN_ROLE, communityId), actionCaller);
        bool isCommunityModerator = hasRole(getCommunityRole(COMMUNITY_MODERATOR_ROLE, communityId), actionCaller);

        if (actionRole == UserLib.ActionRole.NONE) {
            return;
        } else if (actionRole == UserLib.ActionRole.Admin && !isAdmin) {
            message = "not_allowed_not_admin";
        } else if (actionRole == UserLib.ActionRole.Bot && !hasRole(BOT_ROLE, actionCaller)) {
            message = "not_allowed_not_bot";
        } else if (actionRole == UserLib.ActionRole.AdminOrCommunityModerator && 
            !(isAdmin || (isCommunityModerator))) {
            message = "not_allowed_admin_or_comm_moderator";
        } else if (actionRole == UserLib.ActionRole.AdminOrCommunityAdmin && !(isAdmin || (isCommunityAdmin))) {
            message = "not_allowed_admin_or_comm_admin";
        } else if (actionRole == UserLib.ActionRole.CommunityAdmin && !isCommunityAdmin) {
            message = "not_allowed_not_comm_admin";
        } else if (actionRole == UserLib.ActionRole.CommunityModerator && !isCommunityModerator) {
            message = "not_allowed_not_comm_moderator";
        } else {
            return;
        }

        require(false, message);
    }
    
    function hasModeratorRole(
        address user,
        uint32 communityId
    ) 
        private view
        returns (bool) 
    {
        if ((hasRole(getCommunityRole(COMMUNITY_MODERATOR_ROLE, communityId), user) ||
            hasRole(PROTOCOL_ADMIN_ROLE, user))) return true;
        return false;
    }

    function getCommunityRole(uint256 role, uint32 communityId) private pure returns (bytes32) {
        return bytes32(role + communityId);
    }

    function onlyExistingAndNotFrozenCommunity(uint32 communityId) private {
        userContext.peeranhaCommunity.onlyExistingAndNotFrozenCommunity(communityId);
    }

    /**
     * @dev Get informations about contract.
     *
     * - Get deployed time.
     * - Get period length
     *
    */
    function getContractInformation() external pure returns (uint256 startPeriodTime, uint256 periodLength) {
        return (RewardLib.START_PERIOD_TIME, RewardLib.PERIOD_LENGTH);
    }

    /**
     * @dev Get active users in period.
    */
    function getActiveUsersInPeriod(uint16 period) external view returns (address[] memory) {
        return userContext.periodRewardContainer.periodRewardShares[period].activeUsersInPeriod;
    }

    /**
     * @dev Get current period.
    */
    function getPeriod() external view returns (uint16) {
        return RewardLib.getPeriod();
    }
    
    function getVersion() public pure returns (uint256) {
        return 1;
    }

    // Used for unit tests
    /*function addUserRating(address userAddr, int32 rating, uint32 communityId) public {
        UserLib.updateUserRating(userContext, userAddr, rating, communityId);
    }*/

    // Used for unit tests
    /*function setEnergy(address userAddr, uint16 energy) public {
        userContext.users.getUserByAddress(userAddr).energy = energy;
    }*/
}