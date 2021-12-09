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
    bytes32[] roles;
    uint32[] followedCommunities;
    uint16[] rewardPeriods;
    uint256 creationTime;

    int32 rating;
    int32 payOutRating;
    uint16 energy;
    uint32 lastUpdatePeriod;
  }

  /// users The mapping containing all users
  struct UserContext {
    UserLib.UserCollection users;
    RewardLib.UserRewards userRewards;
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
    require(user.ipfsDoc.hash != bytes32(0x0), "U1");
    return user;
  }

  /// @notice Check user existence
  /// @param self The mapping containing all users
  /// @param addr Address of the user to check
  function isExists(UserCollection storage self, address addr) internal view returns (bool) {
    return self.users[addr].ipfsDoc.hash != bytes32(0x0);
  }

  function updateUsersRating(UserLib.UserContext storage userContext, UserRatingChange[] memory usersRating) internal {
    for (uint i; i < usersRating.length; i++) {
      updateUserRating(userContext, usersRating[i].user, usersRating[i].rating);
    }
  }

  /// @notice Add rating to user
  /// @param userAddr user's rating will be change
  /// @param rating value for add to user's rating
  function updateUserRating(UserLib.UserContext storage userContext, User storage user, address userAddr, int32 rating) internal {
    if (rating == 0) return;

    updateRatingBase(userContext, user, userAddr, rating);
  }

  function updateUserRating(UserLib.UserContext storage userContext, address userAddr, int32 rating) internal {
    if (rating == 0) return;

    User storage user = getUserByAddress(userContext.users, userAddr);
    updateRatingBase(userContext, user, userAddr, rating);
  }

  function updateRatingBase(UserLib.UserContext storage userContext, User storage user, address userAddr, int32 rating) internal {
    uint16 currentPeriod = RewardLib.getPeriod(CommonLib.getTimestamp());
    int32 newRating = user.rating += rating;
    uint256 pastPeriodsCount = user.rewardPeriods.length;
    
    RewardLib.PeriodRating storage currentWeekRating = RewardLib.getUserPeriodRating(userContext.userRewards, userAddr, currentPeriod);
    bool isFirstTransactionOnThisWeek = pastPeriodsCount == 0 || user.rewardPeriods[pastPeriodsCount - 1] != currentPeriod; 
    if (isFirstTransactionOnThisWeek) {
      user.rewardPeriods.push(currentPeriod);
    }
    
    int32 ratingToReward = currentWeekRating.ratingToReward;
    int32 ratingToRewardChange = 0;
  
    // Reward for current week is based on rating earned for the previous week. Current week will be rewarded next week.
    if (pastPeriodsCount > 0) {
      uint16 previousWeekNumber = user.rewardPeriods[pastPeriodsCount - 1]; // period now
      RewardLib.PeriodRating storage previousWeekRating =  RewardLib.getUserPeriodRating(userContext.userRewards, userAddr, previousWeekNumber);


      int32 paidOutRating = user.payOutRating - ratingToReward;
      
      // If current week rating is smaller then past week reward then use it as base for the past week reward.
      int32 baseRewardRating =
        CommonLib.minInt32(previousWeekRating.rating, newRating);
      
      ratingToRewardChange =
        (baseRewardRating - paidOutRating) -
        ratingToReward;  // equal user_week_rating_after_change -
                          // pay_out_rating;
      
      // If current preiod rating drops to negative reward then rating to award for current period should be 0
      if (ratingToRewardChange + ratingToReward < 0)
        ratingToRewardChange = -ratingToReward;
    }

    currentWeekRating.rating = newRating;
    currentWeekRating.ratingToReward += ratingToRewardChange;
    user.rating = newRating;
    user.payOutRating += ratingToRewardChange;

    if (rating > 0) {
      AchievementLib.updateUserAchievements(userContext.achievementsContainer, userAddr, AchievementCommonLib.AchievementsType.Rating, int64(newRating));
    }
  }

  function getStatusEnergy(int32 rating) internal pure returns (uint16) {
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