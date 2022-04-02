pragma abicoder v2;
pragma solidity >=0.5.0;

import "./CommonLib.sol";
import "./IpfsLib.sol";
import "./RewardLib.sol";
import "./SecurityLib.sol";
import "./AchievementLib.sol";
import "./AchievementCommonLib.sol";

/// @title Users
/// @notice Provides information about registered user
/// @dev Users information is stored in the mapping on the main contract
library UserLib {
  int32 constant START_USER_RATING = 10;
  uint256 constant ACCOUNT_STAT_RESET_PERIOD = 14; // 259200 - 3 Days

  struct User {
    IpfsLib.IpfsHash ipfsDoc;
    uint256 creationTime;
    uint16 energy;
    uint16 lastUpdatePeriod;
    uint32[] followedCommunities;
    bytes32[] roles;
  }

  struct UserRatingCollection {
    mapping(address => CommunityRatingForUser) communityRatingForUser;
  }

  struct CommunityRatingForUser {
    mapping(uint32 => UserRating) userRating;   //uint32 - community id
    uint16[] rewardPeriods; // periods when the rating was changed
    mapping(uint16 => RewardLib.UserPeriodRewards) userPeriodRewards; // period
  }

  struct UserRating {
    int32 rating;
    int32 payOutRating;
    bool isActive;
  }


  /// users The mapping containing all users
  struct UserContext {
    UserLib.UserCollection users;
    UserLib.UserRatingCollection userRatingCollection;
    UserLib.UserDelegationCollection userDelegationCollection;
    RewardLib.WeekRewardContainer weekRewardContainer;
    SecurityLib.Roles roles;
    SecurityLib.UserRoles userRoles;
    AchievementLib.AchievementsContainer achievementsContainer;
  }
  
  struct UserCollection {
    mapping(address => User) users;
    address[] userList;
  }

  struct UserRatingChange {
    address user;
    int32 rating;
  }

  struct UserDelegationCollection {
    mapping(address => uint) userDelegations;
    address delegateUser;
  }

  event UserCreated(address userAddress);
  event UserUpdated(address userAddress);
  event FollowedCommunity(address userAddress, uint32 communityId);
  event UnfollowedCommunity(address userAddress, uint32 communityId);


  /// @notice Create new user info record
  /// @param self The mapping containing all users
  /// @param userAddress Address of the user to create 
  /// @param ipfsHash IPFS hash of document with user information
  function create(
    UserCollection storage self,
    address userAddress,
    bytes32 ipfsHash
  ) internal {
    require(self.users[userAddress].ipfsDoc.hash == bytes32(0x0), "User exists");

    User storage user = self.users[userAddress];
    user.ipfsDoc.hash = ipfsHash;
    user.creationTime = CommonLib.getTimestamp();
    user.energy = getStatusEnergy(START_USER_RATING);

    self.userList.push(userAddress);

    emit UserCreated(userAddress);
  }

  /// @notice Create new user info record
  /// @param self The mapping containing all users
  /// @param userAddress Address of the user to create 
  /// @param ipfsHash IPFS hash of document with user information
  function createByDelegate(
    UserContext storage self,
    address msgSender,
    address userAddress,
    bytes32 ipfsHash
  ) internal {
    require(msgSender == self.userDelegationCollection.delegateUser, "Invalid delegate user");
    self.userDelegationCollection.userDelegations[userAddress] = 1;
    create(self.users, userAddress, ipfsHash);
  }

  /// @notice Update new user info record
  /// @param userContext All information about users
  /// @param userAddress Address of the user to update
  /// @param ipfsHash IPFS hash of document with user information
  function update(
    UserLib.UserContext storage userContext,
    address userAddress,
    bytes32 ipfsHash
  ) internal {
    User storage user = getUserByAddress(userContext.users, userAddress);
    SecurityLib.checkRatingAndEnergy(
      userContext.roles,
      user,
      0,
      userAddress,
      userAddress,
      0,
      SecurityLib.Action.updateProfile
    );
    user.ipfsDoc.hash = ipfsHash;

    emit UserUpdated(userAddress);
  }

  /// @notice User follows community
  /// @param userContext All information about users
  /// @param userAddress Address of the user to update
  /// @param communityId User follows om this community
  function followCommunity(
    UserLib.UserContext storage userContext,
    address userAddress,
    uint32 communityId
  ) internal {
    User storage user = getUserByAddress(userContext.users, userAddress);
    SecurityLib.checkRatingAndEnergy(
      userContext.roles,
      user,
      getUserRating(userContext.userRatingCollection, userAddress, communityId),
      userAddress,
      userAddress,
      0,
      SecurityLib.Action.followCommunity
    );

    bool isAdded;
    for (uint i; i < user.followedCommunities.length; i++) {
      require(user.followedCommunities[i] != communityId, "You already follow the community");

      if (user.followedCommunities[i] == 0 && !isAdded) {
        user.followedCommunities[i] = communityId;
        isAdded = true;
      }
    }
    if (!isAdded)
      user.followedCommunities.push(communityId);

    emit FollowedCommunity(userAddress, communityId);
  }

  /// @notice User usfollows community
  /// @param users The mapping containing all users
  /// @param userAddress Address of the user to update
  /// @param communityId User follows om this community
  function unfollowCommunity(
    UserCollection storage users,
    address userAddress,
    uint32 communityId
  ) internal {
    User storage user = getUserByAddress(users, userAddress);

    for (uint i; i < user.followedCommunities.length; i++) {
      if (user.followedCommunities[i] == communityId) {
        delete user.followedCommunities[i]; //method rewrite to 0
        
        emit UnfollowedCommunity(userAddress, communityId);
        return;
      }
    }
    require(false, "You are not following the community");
  }

  /// @notice Get the number of users
  /// @param self The mapping containing all users
  function getUsersCount(UserCollection storage self) internal view returns (uint256 count) {
    return self.userList.length;
  }

  /// @notice Get user info by index
  /// @param self The mapping containing all users
  /// @param index Index of the user to get
  function getUserByIndex(UserCollection storage self, uint256 index) internal view returns (User storage) {
    address addr = self.userList[index];
    return self.users[addr];
  }

  /// @notice Get user info by address
  /// @param self The mapping containing all users
  /// @param addr Address of the user to get
  function getUserByAddress(UserCollection storage self, address addr) internal view returns (User storage) {
    User storage user = self.users[addr];
    require(user.ipfsDoc.hash != bytes32(0x0), "User does not exist");
    return user;
  }

  function getUserRating(UserRatingCollection storage self, address addr, uint32 communityId) internal view returns (int32) {
    int32 rating = self.communityRatingForUser[addr].userRating[communityId].rating;
    return rating;
  }

  /// @notice Check user existence
  /// @param self The mapping containing all users
  /// @param addr Address of the user to check
  function isExists(UserCollection storage self, address addr) internal view returns (bool) {
    return self.users[addr].ipfsDoc.hash != bytes32(0x0);
  }

  /// @notice Check user delegated permissions for certain actions
  /// @param delegations User delegations
  /// @param delegateUser Delegate user address
  function setDelegateUser(UserDelegationCollection storage delegations, address delegateUser) internal {
    delegations.delegateUser = delegateUser;
  }
  
  
  /// @notice Check user delegated permissions for certain actions
  /// @param delegateUser Delegate user address
  /// @param userAddress Address of the user to check
  function isDelegateUser(UserDelegationCollection storage delegations, address delegateUser, address userAddress) internal view returns (bool) {
    return delegateUser == delegations.delegateUser && delegations.userDelegations[userAddress] ==1;
  }

  function updateUsersRating(UserLib.UserContext storage userContext, UserRatingChange[] memory usersRating, uint32 communityId) internal {
    for (uint i; i < usersRating.length; i++) {
      updateUserRating(userContext, usersRating[i].user, usersRating[i].rating, communityId);
    }
  }

  /// @notice Add rating to user
  /// @param userAddr user's rating will be change
  /// @param rating value for add to user's rating
  function updateUserRating(UserLib.UserContext storage userContext, User storage user, address userAddr, int32 rating, uint32 communityId) internal {
    if (rating == 0) return;

    updateRatingBase(userContext, user, userAddr, rating, communityId);
  }

  function updateUserRating(UserLib.UserContext storage userContext, address userAddr, int32 rating, uint32 communityId) internal {
    if (rating == 0) return;

    User storage user = getUserByAddress(userContext.users, userAddr);
    updateRatingBase(userContext, user, userAddr, rating, communityId);
  }

  function updateRatingBase(UserLib.UserContext storage userContext, User storage user, address userAddr, int32 rating, uint32 communityId) internal {
    uint16 currentPeriod = RewardLib.getPeriod(CommonLib.getTimestamp());
    
    CommunityRatingForUser storage communityUser = userContext.userRatingCollection.communityRatingForUser[userAddr];
    UserRating storage userRating = communityUser.userRating[communityId];
    if (!userRating.isActive) {
      userRating.rating = START_USER_RATING;
      userRating.payOutRating = START_USER_RATING;
      userRating.isActive = true;
    }

    int32 newRating = userRating.rating += rating;
    uint256 pastPeriodsCount = communityUser.rewardPeriods.length;

    RewardLib.UserPeriodRewards storage userPeriodRewards = communityUser.userPeriodRewards[currentPeriod];
    RewardLib.WeekReward storage weekReward = userContext.weekRewardContainer.weekReward[currentPeriod];
    if (pastPeriodsCount == 0 || communityUser.rewardPeriods[pastPeriodsCount - 1] != currentPeriod) {
      weekReward.activeUsersInPeriod.push(userAddr);
      communityUser.rewardPeriods.push(currentPeriod);
    }

    if (!userPeriodRewards.periodRating[communityId].isActive) {
      userPeriodRewards.periodRating[communityId].isActive = true;    // need?
      userPeriodRewards.rewardCommunities.push(communityId);
    }

    int32 ratingToReward = userPeriodRewards.periodRating[communityId].ratingToReward;
    int32 ratingToRewardChange = 0;

    if (pastPeriodsCount > 0) {
      uint16 previousWeekNumber = communityUser.rewardPeriods[pastPeriodsCount - 1]; // period now

      int32 paidOutRating = userRating.payOutRating - ratingToReward;
      
      // If current week rating is smaller then past week reward then use it as base for the past week reward.
      int32 previousWeekRating = communityUser.userPeriodRewards[previousWeekNumber].periodRating[communityId].rating;
      int32 baseRewardRating =
        CommonLib.minInt32(previousWeekRating, newRating);
      
      ratingToRewardChange =
        (baseRewardRating - paidOutRating) -
        ratingToReward;  // equal user_week_rating_after_change -
                         // pay_out_rating;
      
      // If current preiod rating drops to negative reward then rating to award for current period should be 0
      if (ratingToRewardChange + ratingToReward < 0)
        ratingToRewardChange = -ratingToReward;
    }

    userPeriodRewards.periodRating[communityId].rating = newRating;
    userPeriodRewards.periodRating[communityId].ratingToReward += ratingToRewardChange;
    userRating.rating = newRating;
    userRating.payOutRating += ratingToRewardChange;
    weekReward.rating += ratingToRewardChange;

    if (rating > 0) {
      AchievementLib.updateUserAchievements(userContext.achievementsContainer, userAddr, AchievementCommonLib.AchievementsType.Rating, int64(newRating));
    }
  }

  function getStatusEnergy(int32 rating) internal returns (uint16) {
    if (rating < 0) {
      return 0;
    } else if (rating < 100) {
      return 300;
    } else if (rating < 500) {
      return 600;
    } else if (rating < 1000) {
      return 900;
    } else if (rating < 2500) {
      return 1200;
    } else if (rating < 5000) {
      return 1500;
    } else if (rating < 10000) {
      return 1800;
    } else {
      return 2100;
    }
  }
}