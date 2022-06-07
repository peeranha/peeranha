//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;
import "../libraries/UserLib.sol";
import "../libraries/RewardLib.sol";
pragma abicoder v2;


interface IPeeranhaUser {
    function createUser(bytes32 ipfsHash) external;
    function updateUser(bytes32 ipfsHash) external;
    function followCommunity(uint32 communityId) external;
    function unfollowCommunity(uint32 communityId) external;
    function initCommunityAdminPermission(address user, uint32 communityId) external;
    function giveCommunityAdminPermission(address user, uint32 communityId) external;
    function checkActionRole(address actionCaller, address dataUser, uint32 communityId, UserLib.Action action, UserLib.ActionRole actionRole, bool isCreate) external;
    function checkHasRole(address actionCaller, UserLib.ActionRole actionRole, uint32 communityId) external view;
    function getRatingToReward(address user, uint16 period, uint32 communityId) external view returns (int32);
    function getPeriodRewardShares(uint16 period) external view returns(RewardLib.PeriodRewardShares memory);
    function getUserRewardCommunities(address user, uint16 rewardPeriod) external view returns(uint32[] memory);
    function updateUserRating(address userAddr, int32 rating, uint32 communityId) external;
    function updateUsersRating(UserLib.UserRatingChange[] memory usersRating, uint32 communityId) external;
}