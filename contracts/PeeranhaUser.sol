//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";


import "./libraries/UserLib.sol";
import "./libraries/AchievementLib.sol";
import "./libraries/AchievementCommonLib.sol";
import "./base/NativeMetaTransaction.sol";

import "./interfaces/IPeeranhaUser.sol";


contract PeeranhaUser is IPeeranhaUser, Initializable, NativeMetaTransaction, AccessControlEnumerableUpgradeable {
    // TODO: Actually use usings or remove
    using UserLib for UserLib.UserCollection;
    using UserLib for UserLib.UserRatingCollection;
    using UserLib for UserLib.User;
    using AchievementLib for AchievementLib.AchievementsContainer;

    uint256 public constant COMMUNITY_ADMIN_ROLE = uint256(keccak256("COMMUNITY_ADMIN_ROLE"));
    uint256 public constant COMMUNITY_MODERATOR_ROLE = uint256(keccak256("COMMUNITY_MODERATOR_ROLE"));

    UserLib.UserContext userContext;

    function initialize(address communityContractAddress, address contentContractAddress, address nftContractAddress, address tokenContractAddress) public initializer {
        __Peeranha_init();
        userContext.peeranhaCommunity = IPeeranhaCommunity(communityContractAddress);
        userContext.achievementsContainer.peeranhaNFT = IPeeranhaNFT(nftContractAddress);
        userContext.peeranhaToken = IPeeranhaToken(tokenContractAddress);
        userContext.peeranhaContent = IPeeranhaContent(contentContractAddress);
    }
    
    function __Peeranha_init() public onlyInitializing {
        __Peeranha_init_unchained();
    }

    function __Peeranha_init_unchained() internal onlyInitializing {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
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
     * @dev List of communities where user has rewards in a given period.
     *
     * Requirements:
     *
     * - Must be an existing user and valid period.
     */
    function getUserRewardCommunities(address user, uint16 rewardPeriod) public override view returns(uint32[] memory) {
        // TODO: add function for that to UserLib and call it from here
        return userContext.userRatingCollection.communityRatingForUser[user].userPeriodRewards[rewardPeriod].rewardCommunities;
    }

    /**
     * @dev Total reward shares for a given period.
     *
     * Requirements:
     *
     * - Must be a valid period.
     */
    function getPeriodRewardShares(uint16 period) public view override returns(RewardLib.PeriodRewardShares memory) {
        // TODO: add function for that to UserLib and call it from here
        return userContext.periodRewardContainer.periodRewardShares[period];
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
        UserLib.createIfDoesNotExist(userContext.users, _msgSender());
        // TODO: reduce energy here
        UserLib.update(userContext, _msgSender(), ipfsHash);
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
        onlyExistingAndNotFrozenCommunity(communityId);
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
     * @dev Check if user with given address exists.
     */
    function userExists(address addr) public view returns (bool) {
        return userContext.users.isExists(addr);
    }

    /**
     * @dev Get user permissions by address.
     *
     * Requirements:
     *
     * - Must be an existing user.
     */
    function getUserPermissions(address addr) public pure returns (bytes32[] memory) {
        // TODO: Remove this function. Retrieve the data from the graph
        bytes32[] memory emptyResult;
        return emptyResult;
    }


    /**
     * @dev Give admin permission.
     *
     * Requirements:
     *
     * - Sender must global administrator.
     * - Must be an existing user. 
     */
    function giveAdminPermission(address userAddr) public {
        verifyHasRole(_msgSender(), UserLib.Permission.admin, 0);
        _grantRole(DEFAULT_ADMIN_ROLE, userAddr);
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
    function revokeAdminPermission(address userAddr) public {
        verifyHasRole(_msgSender(), UserLib.Permission.admin, 0);
        _revokeRole(DEFAULT_ADMIN_ROLE, userAddr);
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
    function giveCommunityAdminPermission(address userAddr, uint32 communityId) public override {
        bytes32 communityAdminRole = getCommunityRole(COMMUNITY_ADMIN_ROLE, communityId);
        bytes32 communityModeratorRole = getCommunityRole(COMMUNITY_MODERATOR_ROLE, communityId);
        
        if (_msgSender() != address(userContext.peeranhaCommunity)) {
            onlyExistingAndNotFrozenCommunity(communityId);
            verifyHasRole(_msgSender(), UserLib.Permission.adminOrCommunityAdmin, communityId);
        } else {
            _setRoleAdmin(communityModeratorRole, communityAdminRole);
        }
        _grantRole(communityAdminRole, userAddr);
        _grantRole(communityModeratorRole, userAddr);
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
    function giveCommunityModeratorPermission(address userAddr, uint32 communityId) public {  // add check user
        onlyExistingAndNotFrozenCommunity(communityId);
        verifyHasRole(_msgSender(), UserLib.Permission.communityAdmin, communityId);
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
        verifyHasRole(_msgSender(), UserLib.Permission.communityAdmin, communityId);
        revokeRole(getCommunityRole(COMMUNITY_ADMIN_ROLE, communityId), userAddr);
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
    function revokeCommunityModeratorPermission(address userAddr, uint32 communityId) public {
        onlyExistingAndNotFrozenCommunity(communityId);
        verifyHasRole(_msgSender(), UserLib.Permission.communityAdmin, communityId);
        _revokeRole(getCommunityRole(COMMUNITY_MODERATOR_ROLE, communityId), userAddr);
    }

    // TODO: Add doc comment
    function configureNewAchievement(
        uint64 maxCount,
        int64 lowerBound,
        string memory achievementURI,
        AchievementCommonLib.AchievementsType achievementsType
    )   
        external
    {
        verifyHasRole(_msgSender(), UserLib.Permission.admin, 0);
        userContext.achievementsContainer.configureNewAchievement(maxCount, lowerBound, achievementURI, achievementsType);
    }

    // TODO: Add doc comment
    function getAchievementConfig(uint64 achievementId) public view returns (AchievementLib.AchievementConfig memory) {
        return userContext.achievementsContainer.achievementsConfigs[achievementId];
    }

    // TODO: Add doc comment
    function getRatingToReward(address user, uint16 rewardPeriod, uint32 communityId) public view override returns(int32) {
        RewardLib.PeriodRating memory periodRating = userContext.userRatingCollection.communityRatingForUser[user].userPeriodRewards[rewardPeriod].periodRating[communityId];
        return periodRating.ratingToReward - periodRating.penalty;
    }

    // only unitTest
    // TODO: Add comment
    function getPeriodRating(address user, uint16 rewardPeriod, uint32 communityId) public view returns(RewardLib.PeriodRating memory) {
        return userContext.userRatingCollection.communityRatingForUser[user].userPeriodRewards[rewardPeriod].periodRating[communityId];
    }

    // only unitTest
    // TODO: Add comment
    function getPeriodReward(uint16 rewardPeriod) public view returns(int32) {
        return userContext.periodRewardContainer.periodRewardShares[rewardPeriod].totalRewardShares;
    }
    
    // TODO: Add doc comment
    function updateUserRating(address userAddr, int32 rating, uint32 communityId) public override {
        require(msg.sender == address(userContext.peeranhaContent), "internal_call_unauthorized");
        UserLib.updateUserRating(userContext, userAddr, rating, communityId);
    }

    // TODO: Add doc comment
    function updateUsersRating(UserLib.UserRatingChange[] memory usersRating, uint32 communityId) public override {
        require(msg.sender == address(userContext.peeranhaContent), "internal_call_unauthorized");
        UserLib.updateUsersRating(userContext, usersRating, communityId);
    }

    // TODO: Add doc comment
    function checkPermission(address actionCaller, address dataUser, uint32 communityId, UserLib.Action action, UserLib.Permission permission, bool createUserIfDoesNotExist) public override {
        require(msg.sender == address(userContext.peeranhaContent) || msg.sender == address(userContext.peeranhaCommunity), "internal_call_unauthorized");
        if (createUserIfDoesNotExist) {
            UserLib.createIfDoesNotExist(userContext.users, actionCaller);
        }

        if (hasModeratorRole(actionCaller, communityId)) {
            return;
        }
                
        verifyHasRole(actionCaller, permission, communityId);
        UserLib.checkRatingAndEnergy(userContext, actionCaller, dataUser, communityId, action);
    }

    function getActiveUserPeriods(address userAddr) public view returns (uint16[] memory) {
        return userContext.userRatingCollection.communityRatingForUser[userAddr].rewardPeriods;
    }

    function verifyHasRole(address actionCaller, UserLib.Permission permission, uint32 communityId) private view {
        if (permission == UserLib.Permission.NONE) {
            return;
        } else if (permission == UserLib.Permission.admin) {
            require(hasRole(DEFAULT_ADMIN_ROLE, actionCaller), 
                "not_allowed_not_admin");
        
        } else if (permission == UserLib.Permission.adminOrCommunityModerator) {
            require(hasRole(DEFAULT_ADMIN_ROLE, actionCaller) ||
                (hasRole(getCommunityRole(COMMUNITY_MODERATOR_ROLE, communityId), actionCaller)), 
                "not_allowed_admin_or_comm_moderator");

        } else if (permission == UserLib.Permission.adminOrCommunityAdmin) {
            require(hasRole(DEFAULT_ADMIN_ROLE, actionCaller) || 
                (hasRole(getCommunityRole(COMMUNITY_ADMIN_ROLE, communityId), actionCaller)), 
                "not_allowed_admin_or_comm_admin");

        } else if (permission == UserLib.Permission.communityAdmin) {
            require((hasRole(getCommunityRole(COMMUNITY_ADMIN_ROLE, communityId), actionCaller)), 
                "not_allowed_not_comm_admin");

        } else if (permission == UserLib.Permission.communityModerator) {
            require((hasRole(getCommunityRole(COMMUNITY_MODERATOR_ROLE, communityId), actionCaller)), 
                "not_allowed_not_comm_moderator");
        }
    }
    
    function hasModeratorRole(
        address user,
        uint32 communityId
    ) 
        private view
        returns (bool) 
    {
        if ((hasRole(getCommunityRole(COMMUNITY_MODERATOR_ROLE, communityId), user) ||
            hasRole(DEFAULT_ADMIN_ROLE, user))) return true;
        return false;
    }

    function getCommunityRole(uint256 role, uint32 communityId) private pure returns (bytes32) {
        return bytes32(role + communityId);
    }

    function onlyExistingAndNotFrozenCommunity(uint32 communityId) private {
        userContext.peeranhaCommunity.onlyExistingAndNotFrozenCommunity(communityId);
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