pragma solidity >=0.5.0;

import "./PostLib.sol";
import "./CommonLib.sol";
import "hardhat/console.sol";
import "./IpfsLib.sol";
import "./RewardLib.sol";
import "../Peeranha.sol";

/// @title Users
/// @notice Provides information about registered user
/// @dev Users information is stored in the mapping on the main contract
library UserLib {
  uint16 constant MIN_RATING = 900;
  uint16 constant MAX_RATING = 900;

  using CommunityLib for CommunityLib.CommunityCollection;

  struct User {
    IpfsLib.IpfsHash ipfsDoc;
    int32 rating;
    int32 payOutRating;
    uint256 creationTime;
    bytes32[] roles;
    uint32[] followedCommunities;
    PeriodRating[] reward;
  }

  struct PeriodRating {
    int32 rating;
    int32 ratingToAward;
    uint16 period;
    bool isPaid;
  }
  
  struct UserCollection {
    mapping(address => User) users;
    address[] userList;
  }

  event UserCreated(address userAddress);
  event UserUpdated(address userAddress);
  event FollowedCommunity(address userAddress, uint32 communityId);
  // event UnfollowedCommunity(address userAddress, uint32 communityId);


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

    self.userList.push(userAddress);
    // emit UserCreated(userAddress);
  }

  /// @notice Update new user info record
  /// @param self The mapping containing all users
  /// @param userAddress Address of the user to update
  /// @param ipfsHash IPFS hash of document with user information
  function update(
    UserCollection storage self,
    address userAddress,
    bytes32 ipfsHash
  ) internal {
    require(self.users[userAddress].ipfsDoc.hash != bytes32(0x0), "User does not exist");
    self.users[userAddress].ipfsDoc.hash = ipfsHash;
    // emit UserUpdated(userAddress);
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

    // emit FollowedCommunity(userAddress, communityId);
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
        
        // emit UnfollowedCommunity(userAddress, communityId);
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

  function updateUsersRating(UserCollection storage self, PostLib.UserRatingChange[] memory usersRating) internal {
    for (uint i; i < usersRating.length; i++) {
      updateUserRating(self, usersRating[i].user, usersRating[i].rating);
    }
  }

  /// @notice Add rating to user
  /// @param self The mapping containing all users
  /// @param userAddr user's rating will be change
  /// @param rating value for add to user's rating
  function updateUserRating(UserCollection storage self, address userAddr, int32 rating) internal {
    if (rating == 0) return;
    // User storage user = getUserByAddress(self, userAddr);
    // user.rating += rating;

    updateRatingBase(self, userAddr, rating);
  }

  function updateRatingBase(UserCollection storage self, address userAddr, int32 rating) internal {
    uint16 currentPeriod = RewardLib.getPeriod(CommonLib.getTimestamp());
    
    User storage user = getUserByAddress(self, userAddr);
    int32 newRating = user.rating += rating;
    if (newRating < MIN_RATING) newRating = MIN_RATING;
    if (newRating > MAX_RATING) newRating = MAX_RATING;

    PeriodRating storage thisWeekRating = RewardLib.getUserPeriod(user.reward, currentPeriod, false);
    bool isFirstTransactionOnThisWeek = (thisWeekRating.period == 0);
    int32 ratingToAward = isFirstTransactionOnThisWeek
                                  ? 0
                                  : thisWeekRating.ratingToAward;

    int32 ratingToAwardChange = 0;
    int32 payOutRating = user.payOutRating;
  
    // Very bad code.
    PeriodRating storage previousWeekRating =  RewardLib.getUserPeriod(user.reward, currentPeriod -1, false);
    if (previousWeekRating.period == 0) {
      PeriodRating storage riterPreviousWeekRating = user.reward[user.reward.length - 1];
      if (!isFirstTransactionOnThisWeek) {
        riterPreviousWeekRating = user.reward[user.reward.length - 2];
      }
      if (riterPreviousWeekRating.period == 0){      ////??????? 195
        /*previousWeekRating = period_rating_table.end();*/}
      else
        previousWeekRating = RewardLib.getUserPeriod(user.reward, riterPreviousWeekRating.period, false);
    }
    // Very bad code ends

    // Test 1(no information about previous week)
    if (previousWeekRating.period != user.reward[user.reward.length - 1].period) {
      int32 paidOutRating = payOutRating - ratingToAward;
      int32 userWeekRatingAfterChange =
        CommonLib.min(previousWeekRating.rating, newRating);
      ratingToAwardChange =
        (userWeekRatingAfterChange - paidOutRating) -
        ratingToAward;  // equal user_week_rating_after_change -
                          // pay_out_rating;
      // Test 2
      if (ratingToAwardChange + ratingToAward < 0)
        ratingToAwardChange = -ratingToAward;

      if (isFirstTransactionOnThisWeek) {
        // means that this is the first transaction on this week
        // There are two variants:
        // 1. There is no record about previous week(test 1 failed)
        //___In this case rating_to_award_change = 0;
        // 2. Record about previous week exist(test 1 succeed)
        //___The same above, Test 2 guarantees the value of
        //___ratnig_to_award_change >= 0;

        thisWeekRating.period = currentPeriod;
        thisWeekRating.rating = newRating;
        thisWeekRating.ratingToAward = ratingToAwardChange;
      } else {
        // The same above, Test 2 guarantees the value of
        // ratnig_to_award_change >= 0;
        
        thisWeekRating.rating = newRating;
        thisWeekRating.ratingToAward += ratingToAwardChange;
      }
    }
    user.rating += newRating;
    user.payOutRating += ratingToAwardChange;

  }

  function getPermissions(UserCollection storage self, address userAddr) internal view returns (bytes32[] memory) {
    return self.users[userAddr].roles;
  }

  function givePermission(UserCollection storage self, address userAddr, bytes32 role) internal {
    self.users[userAddr].roles.push(role);
  }

  function revokePermission(UserCollection storage self, address userAddr, bytes32 role) internal {
    uint256 length = self.users[userAddr].roles.length;
    for(uint32 i = 0; i < length; i++) {
      if(self.users[userAddr].roles[i] == role) {
        if (i < length - 1) {
          self.users[userAddr].roles[i] = self.users[userAddr].roles[length - 1];
          self.users[userAddr].roles.pop();
        } else self.users[userAddr].roles.pop();
      }
    }
  }
}