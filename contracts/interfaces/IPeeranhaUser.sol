pragma solidity >=0.5.0;
import "../libraries/UserLib.sol";
pragma abicoder v2;


interface IPeeranhaUser {
    function createUser(bytes32 ipfsHash) external;
    function updateUser(address userAddress, bytes32 ipfsHash) external;
    function followCommunity(address userAddress, uint32 communityId) external;
    function unfollowCommunity(address userAddress, uint32 communityId) external;
    function giveCommunityAdminPermission(address user, uint32 communityId) external;
    function checkPermission(address actionCaller, address dataUser, uint32 communityId, UserLib.Action action, UserLib.Permission permission, bool isCreate) external;
    function getRatingToReward(address user, uint16 period, uint32 communityId) external view returns (int32);
    function getPeriodRewardContainer(uint16 period) external view returns(RewardLib.PeriodRewardShares memory);
    function getUserRewardCommunities(address user, uint16 rewardPeriod) external view returns(uint32[] memory);
    function updateUserRating(address userAddr, int32 rating, uint32 communityId) external;
    function updateUsersRating(UserLib.UserRatingChange[] memory usersRating, uint32 communityId) external;
}