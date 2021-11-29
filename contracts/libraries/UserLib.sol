pragma abicoder v2;
pragma solidity >=0.5.0;

import "./CommonLib.sol";
import "./IpfsLib.sol";
import "./RewardLib.sol";
import "./SecurityLib.sol";

/// @title Users
/// @notice Provides information about registered user
/// @dev Users information is stored in the mapping on the main contract
library UserLib {
  int32 constant START_USER_RATING = 10;
  uint256 constant ACCOUNT_STAT_RESET_PERIOD = 8; // 259200 - 3 Days

  struct User {
    IpfsLib.IpfsHash ipfsDoc;
    int32 rating;
    int32 payOutRating;
    uint16 energy;
    uint32 lastUpdatePeriod;
    uint256 creationTime;
    bytes32[] roles;
    uint32[] followedCommunities;
    uint16[] rewardPeriods;
  }
  
  struct UserCollection {
    mapping(address => User) users;
    address[] userList;
  }

  struct UserRatingChange {
    address user;
    int32 rating;
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
    user.rating = START_USER_RATING;
    user.payOutRating = START_USER_RATING;
    user.energy = getStatusEnergy(START_USER_RATING);

    self.userList.push(userAddress);

    emit UserCreated(userAddress);
  }

  /// @notice Update new user info record
  /// @param self The mapping containing all users
  /// @param userAddress Address of the user to update
  /// @param ipfsHash IPFS hash of document with user information
  function update(
    UserCollection storage self,
    SecurityLib.Roles storage roles,
    address userAddress,
    bytes32 ipfsHash
  ) internal {
    User storage user = getUserByAddress(self, userAddress);
    SecurityLib.checkRatingAndEnergy(   //moderator can edit
      roles,
      user,
      userAddress,
      userAddress,
      0,
      SecurityLib.Action.updateProfile
    );
    user.ipfsDoc.hash = ipfsHash;

    emit UserUpdated(userAddress);
  }

  /// @notice User follows community
  /// @param self The mapping containing all users
  /// @param userAddress Address of the user to update
  /// @param communityId User follows om this community
  function followCommunity(
    UserCollection storage self,
    address userAddress,
    uint32 communityId
  ) internal {
    User storage user = self.users[userAddress];
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
  /// @param self The mapping containing all users
  /// @param userAddress Address of the user to update
  /// @param communityId User follows om this community
  function unfollowCommunity(
    UserCollection storage self,
    address userAddress,
    uint32 communityId
  ) internal {
    User storage user = self.users[userAddress];

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

  /// @notice Check user existence
  /// @param self The mapping containing all users
  /// @param addr Address of the user to check
  function isExists(UserCollection storage self, address addr) internal view returns (bool) {
    return self.users[addr].ipfsDoc.hash != bytes32(0x0);
  }

  function updateUsersRating(UserCollection storage self, RewardLib.UserRewards storage userRewards, UserRatingChange[] memory usersRating) internal {
    for (uint i; i < usersRating.length; i++) {
      updateUserRating(self, userRewards, usersRating[i].user, usersRating[i].rating);
    }
  }

  /// @notice Add rating to user
  /// @param self The mapping containing all users
  /// @param userAddr user's rating will be change
  /// @param rating value for add to user's rating
  function updateUserRating(UserCollection storage self, RewardLib.UserRewards storage userRewards, address userAddr, int32 rating) internal {  // name action?
    if (rating == 0) return;

    User storage user = getUserByAddress(self, userAddr);
    updateRatingBase(self, userRewards, user, userAddr, rating);
  }

  /// @notice Add rating to user
  /// @param self The mapping containing all users
  /// @param userAddr user's rating will be change
  /// @param rating value for add to user's rating
  function updateUserRating(UserCollection storage self, RewardLib.UserRewards storage userRewards, User storage user, address userAddr, int32 rating) internal {
    if (rating == 0) return;

    updateRatingBase(self, userRewards, user, userAddr, rating);
  }

  function updateRatingBase(UserCollection storage self, RewardLib.UserRewards storage userRewards, User storage user, address userAddr, int32 rating) internal {
    uint16 currentPeriod = RewardLib.getPeriod(CommonLib.getTimestamp());
    // User storage user = getUserByAddress(self, userAddr);
    int32 newRating = user.rating += rating;
    uint256 pastPeriodsCount = user.rewardPeriods.length;
    
    RewardLib.PeriodRating storage currentWeekRating = RewardLib.getUserPeriodRating(userRewards, userAddr, currentPeriod);
    bool isFirstTransactionOnThisWeek = pastPeriodsCount == 0 || user.rewardPeriods[pastPeriodsCount - 1] != currentPeriod; 
    if (isFirstTransactionOnThisWeek) {
      user.rewardPeriods.push(currentPeriod);
    }
    
    int32 ratingToReward = currentWeekRating.ratingToReward;
    int32 ratingToRewardChange = 0;
  
    // Reward for current week is based on rating earned for the previous week. Current week will be rewarded next week.
    if (pastPeriodsCount > 0) {
      uint16 previousWeekNumber = user.rewardPeriods[pastPeriodsCount - 1]; // period now
      RewardLib.PeriodRating storage previousWeekRating =  RewardLib.getUserPeriodRating(userRewards, userAddr, previousWeekNumber);


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
  }

  function getStatusEnergy(int32 rating) internal returns (uint16) {
    uint16 maxEnergy;
    if (rating < 0) {
      maxEnergy = 0;
    } else if (rating < 100) {
      maxEnergy = 300;
    } else if (rating < 500) {
      maxEnergy = 600;
    } else if (rating < 1000) {
      maxEnergy = 900;
    } else if (rating < 2500) {
      maxEnergy = 1200;
    } else if (rating < 5000) {
      maxEnergy = 1500;
    } else if (rating < 10000) {
      maxEnergy = 1800;
    } else {
      maxEnergy = 2100;
    }
    return maxEnergy;
  }
}