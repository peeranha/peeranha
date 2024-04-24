//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;
import "../libraries/UserLib.sol";
import "../libraries/RewardLib.sol";
pragma abicoder v2;


interface IPeeranhaUser {
    function onlyDispatcher(address sender) external;
    function createUser(address user, bytes32 ipfsHash) external;
    function updateUser(address user, bytes32 ipfsHash) external;
    function followCommunity(address user, uint32 communityId) external;
    function unfollowCommunity(address user, uint32 communityId) external;
    function banCommunityUser(address user, address targetUserAddress, uint32 communityId) external;
    function unBanCommunityUser(address user, address targetUserAddress, uint32 communityId) external;
    function banUser(address user, address targetUserAddress) external;
    function unBanUser(address user, address targetUserAddress) external;
    function initCommunityAdminPermission(address user, uint32 communityId) external;
    function giveCommunityAdminPermission(address user, address userAddr, uint32 communityId) external;
    function checkActionRole(address actionCaller, address dataUser, uint32 communityId, UserLib.Action action, UserLib.ActionRole actionRole, bool isCreate) external;
    function isProtocolAdmin(address userAddr) external view returns (bool);
    function checkHasRole(address actionCaller, UserLib.ActionRole actionRole, uint32 communityId) external view;
    function isHasRoles(address actionCaller, UserLib.ActionRole actionRole, uint32 communityId) external view returns (bool, string memory);
    function getRatingToReward(address user, uint16 period, uint32 communityId) external view returns (int32);
    function getPeriodRewardShares(uint16 period) external view returns(RewardLib.PeriodRewardShares memory);
    function getUserRewardCommunities(address user, uint16 rewardPeriod) external view returns(uint32[] memory);
    function updateUserRating(address userAddr, int32 rating, uint32 communityId) external;
    function updateUsersRating(UserLib.UserRatingChange[] memory usersRating, uint32 communityId) external;
}