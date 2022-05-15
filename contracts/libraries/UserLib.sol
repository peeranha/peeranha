//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./CommonLib.sol";
import "./RewardLib.sol";
import "./AchievementLib.sol";
import "./AchievementCommonLib.sol";
import "../interfaces/IPeeranhaToken.sol";
import "../interfaces/IPeeranhaCommunity.sol";
import "../interfaces/IPeeranhaContent.sol";


/// @title Users
/// @notice Provides information about registered user
/// @dev Users information is stored in the mapping on the main contract
library UserLib {
  int32 constant START_USER_RATING = 10;

  int16 constant MINIMUM_RATING = -300;
  int16 constant POST_QUESTION_ALLOWED = 0;
  int16 constant POST_REPLY_ALLOWED = 0;
  int16 constant POST_COMMENT_ALLOWED = 35;

  int16 constant UPVOTE_POST_ALLOWED = 35;
  int16 constant DOWNVOTE_POST_ALLOWED = 100;
  int16 constant UPVOTE_REPLY_ALLOWED = 35;
  int16 constant DOWNVOTE_REPLY_ALLOWED = 100;
  int16 constant VOTE_COMMENT_ALLOWED = 0;
  int16 constant CANCEL_VOTE = 0;

  int16 constant UPDATE_PROFILE_ALLOWED = 0;

  uint8 constant ENERGY_DOWNVOTE_QUESTION = 5;
  uint8 constant ENERGY_DOWNVOTE_ANSWER = 3;
  uint8 constant ENERGY_DOWNVOTE_COMMENT = 2;
  uint8 constant ENERGY_UPVOTE_QUESTION = 1;
  uint8 constant ENERGY_UPVOTE_ANSWER = 1;
  uint8 constant ENERGY_VOTE_COMMENT = 1;
  uint8 constant ENERGY_FORUM_VOTE_CANCEL = 1;
  uint8 constant ENERGY_POST_QUESTION = 10;
  uint8 constant ENERGY_POST_ANSWER = 6;
  uint8 constant ENERGY_POST_COMMENT = 4;
  uint8 constant ENERGY_MODIFY_ITEM = 2;
  uint8 constant ENERGY_DELETE_ITEM = 2;

  uint8 constant ENERGY_MARK_REPLY_AS_CORRECT = 1;
  uint8 constant ENERGY_UPDATE_PROFILE = 1;
  uint8 constant ENERGY_CREATE_TAG = 75;            // only Admin
  uint8 constant ENERGY_CREATE_COMMUNITY = 125;     // only admin
  uint8 constant ENERGY_FOLLOW_COMMUNITY = 1;
  uint8 constant ENERGY_REPORT_PROFILE = 5;         //
  uint8 constant ENERGY_REPORT_QUESTION = 3;        //
  uint8 constant ENERGY_REPORT_ANSWER = 2;          //
  uint8 constant ENERGY_REPORT_COMMENT = 1;         //

  struct User {
    CommonLib.IpfsHash ipfsDoc;
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
    bool isActive;
  }

  struct DataUpdateUserRating {
    int32 ratingToReward;
    int32 penalty;
    int32 changeRating;
    int32 ratingToRewardChange;
  }


  /// users The mapping containing all users
  struct UserContext {
    UserLib.UserCollection users;     // rename to usersCollection
    UserLib.UserRatingCollection userRatingCollection;
    RewardLib.PeriodRewardContainer periodRewardContainer;
    AchievementLib.AchievementsContainer achievementsContainer;
    
    IPeeranhaToken peeranhaToken;
    IPeeranhaCommunity peeranhaCommunity;
    IPeeranhaContent peeranhaContent;
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

  // TODO: Rename enum memers to begin with capital
  enum Action {
    NONE,
    publicationPost,
    publicationReply,
    publicationComment,
    editItem,
    deleteItem,
    upVotePost,
    downVotePost,
    upVoteReply,
    downVoteReply,
    voteComment,
    cancelVote,
    officialReply,
    bestReply,
    updateProfile,
    followCommunity
  }

  // TODO: Rename enum memers to begin with capital and use camel case
  // TODO: Rename enum to ActionRole
  enum Permission {
    NONE,
    admin,
    adminOrCommunityModerator,
    adminOrCommunityAdmin,
    communityAdmin,
    communityModerator
  }

  event UserCreated(address indexed userAddress);
  event UserUpdated(address indexed userAddress);
  event FollowedCommunity(address indexed userAddress, uint32 indexed communityId);
  event UnfollowedCommunity(address indexed userAddress, uint32 indexed communityId);


  /// @notice Create new user info record
  /// @param self The mapping containing all users
  /// @param userAddress Address of the user to create 
  /// @param ipfsHash IPFS hash of document with user information
  function create(
    UserCollection storage self,
    address userAddress,
    bytes32 ipfsHash
  ) internal {
    require(self.users[userAddress].ipfsDoc.hash == bytes32(0x0), "user_exists");

    User storage user = self.users[userAddress];
    user.ipfsDoc.hash = ipfsHash;
    user.energy = getStatusEnergy(START_USER_RATING);
    user.lastUpdatePeriod = RewardLib.getPeriod(CommonLib.getTimestamp());

    self.userList.push(userAddress);

    emit UserCreated(userAddress);
  }

  /// @notice Create new user info record
  /// @param self The mapping containing all users
  /// @param userAddress Address of the user to create 
  function createIfDoesNotExist(
    UserCollection storage self,
    address userAddress
  ) internal {
    if (!UserLib.isExists(self, userAddress)) {
      UserLib.create(self, userAddress, bytes32(0xf5cd5e9d6332d6b2a532459dfc262f67d4111a914d00edb7aadd29c30d8ac322));
    }
  }

  /// @notice Update new user info record
  /// @param userContext All information about users
  /// @param userAddress Address of the user to update
  /// @param ipfsHash IPFS hash of document with user information
  function update(
    UserContext storage userContext,
    address userAddress,
    bytes32 ipfsHash
  ) internal {
    User storage user = checkRatingAndEnergy(
      userContext,
      userAddress,
      userAddress,
      0,
      Action.updateProfile
    );
    user.ipfsDoc.hash = ipfsHash;

    emit UserUpdated(userAddress);
  }

  /// @notice User follows community
  /// @param userContext All information about users
  /// @param userAddress Address of the user to update
  /// @param communityId User follows om this community
  function followCommunity(
    UserContext storage userContext,
    address userAddress,
    uint32 communityId
  ) internal {
    User storage user = checkRatingAndEnergy(
      userContext,
      userAddress,
      userAddress,
      0,
      Action.followCommunity
    );

    bool isAdded;
    for (uint i; i < user.followedCommunities.length; i++) {
      require(user.followedCommunities[i] != communityId, "already_followed");

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
    require(false, "comm_not_followed");
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
    require(user.ipfsDoc.hash != bytes32(0x0), "user_not_found");
    return user;
  }

  function getUserRating(UserRatingCollection storage self, address addr, uint32 communityId) internal view returns (int32) {
    int32 rating = self.communityRatingForUser[addr].userRating[communityId].rating;
    return rating;
  }

  /// @notice Check user existence
  /// @param self The mapping containing all users
  /// @param addr Address of the user to check
  function isExists(UserCollection storage self, address addr) internal view returns (bool) { // need?
    return self.users[addr].ipfsDoc.hash != bytes32(0x0);
  }

  function updateUsersRating(UserLib.UserContext storage userContext, UserRatingChange[] memory usersRating, uint32 communityId) internal {
    for (uint i; i < usersRating.length; i++) {
      updateUserRating(userContext, usersRating[i].user, usersRating[i].rating, communityId);
    }
  }

  function updateUserRating(UserLib.UserContext storage userContext, address userAddr, int32 rating, uint32 communityId) internal {
    if (rating == 0) return;
    updateRatingBase(userContext, userAddr, rating, communityId);
  }

  function updateRatingBase(UserContext storage userContext, address userAddr, int32 rating, uint32 communityId) internal {
    uint16 currentPeriod = RewardLib.getPeriod(CommonLib.getTimestamp());
    
    CommunityRatingForUser storage userCommunityRating = userContext.userRatingCollection.communityRatingForUser[userAddr];
    // Initialize user rating in the community if this is the first rating change
    if (!userCommunityRating.userRating[communityId].isActive) {
      userCommunityRating.userRating[communityId].rating = START_USER_RATING;
      userCommunityRating.userRating[communityId].isActive = true;
    }

    uint256 pastPeriodsCount = userCommunityRating.rewardPeriods.length;
    RewardLib.PeriodRewardShares storage periodRewardShares = userContext.periodRewardContainer.periodRewardShares[currentPeriod];
    
    // If this is the first user rating change in any community
    if (pastPeriodsCount == 0 || userCommunityRating.rewardPeriods[pastPeriodsCount - 1] != currentPeriod) {
      periodRewardShares.activeUsersInPeriod.push(userAddr);
      userCommunityRating.rewardPeriods.push(currentPeriod);
    } else {  // rewrite
      pastPeriodsCount--;
    }

    RewardLib.UserPeriodRewards storage userPeriodRewards = userCommunityRating.userPeriodRewards[currentPeriod];
    RewardLib.PeriodRating storage userPeriodCommuntiyRating = userPeriodRewards.periodRating[communityId];

    // If this is the first user rating change in this period for current community
    if (!userPeriodCommuntiyRating.isActive) {
      userPeriodRewards.rewardCommunities.push(communityId);
    }

    uint16 previousPeriod;
    if(pastPeriodsCount > 0) {
      previousPeriod = userCommunityRating.rewardPeriods[pastPeriodsCount - 1];
    } else {
      // this means that there is no other previous period
      previousPeriod = currentPeriod;
    }

    updateUserPeriodRating(userContext, userCommunityRating, userAddr, rating, communityId, currentPeriod, previousPeriod);

    userCommunityRating.userRating[communityId].rating += rating;

    if (rating > 0) {
      AchievementLib.updateUserAchievements(userContext.achievementsContainer, userAddr, AchievementCommonLib.AchievementsType.Rating, int64(userCommunityRating.userRating[communityId].rating));
    }
  }

  function updateUserPeriodRating(UserContext storage userContext, CommunityRatingForUser storage userCommunityRating, address userAddr, int32 rating, uint32 communityId, uint16 currentPeriod, uint16 previousPeriod) private {
    RewardLib.PeriodRating storage currentPeriodRating = userCommunityRating.userPeriodRewards[currentPeriod].periodRating[communityId];
    bool isFirstTransactionInPeriod = !currentPeriodRating.isActive;

    DataUpdateUserRating memory dataUpdateUserRatingCurrentPeriod;
    dataUpdateUserRatingCurrentPeriod.ratingToReward = currentPeriodRating.ratingToReward;
    dataUpdateUserRatingCurrentPeriod.penalty = currentPeriodRating.penalty;
    
    if (currentPeriod == previousPeriod) {   //first period rating?
      dataUpdateUserRatingCurrentPeriod.changeRating = rating;

    } else {
      RewardLib.PeriodRating storage previousPeriodRating = userCommunityRating.userPeriodRewards[previousPeriod].periodRating[communityId];
      
      DataUpdateUserRating memory dataUpdateUserRatingPreviousPeriod;
      dataUpdateUserRatingPreviousPeriod.ratingToReward = previousPeriodRating.ratingToReward;
      dataUpdateUserRatingPreviousPeriod.penalty = previousPeriodRating.penalty;
      
      if (previousPeriod != currentPeriod - 1) {
        if (isFirstTransactionInPeriod && dataUpdateUserRatingPreviousPeriod.penalty > dataUpdateUserRatingPreviousPeriod.ratingToReward) {
          dataUpdateUserRatingCurrentPeriod.changeRating = rating + dataUpdateUserRatingPreviousPeriod.ratingToReward - dataUpdateUserRatingPreviousPeriod.penalty;
        } else {
          dataUpdateUserRatingCurrentPeriod.changeRating = rating;
        }
      } else {
        if (isFirstTransactionInPeriod && dataUpdateUserRatingPreviousPeriod.penalty > dataUpdateUserRatingPreviousPeriod.ratingToReward) {
          dataUpdateUserRatingCurrentPeriod.changeRating = dataUpdateUserRatingPreviousPeriod.ratingToReward - dataUpdateUserRatingPreviousPeriod.penalty;
        }

        int32 differentRatingPreviousPeriod; // name
        int32 differentRatingCurrentPeriod;
        if (rating > 0 && dataUpdateUserRatingPreviousPeriod.penalty > 0) {
          if (dataUpdateUserRatingPreviousPeriod.ratingToReward == 0) {
            differentRatingPreviousPeriod = rating - dataUpdateUserRatingPreviousPeriod.penalty;
            if (differentRatingPreviousPeriod >= 0) {
              dataUpdateUserRatingPreviousPeriod.changeRating = dataUpdateUserRatingPreviousPeriod.penalty;
              dataUpdateUserRatingCurrentPeriod.changeRating = differentRatingPreviousPeriod;
            } else {
              dataUpdateUserRatingPreviousPeriod.changeRating = rating;
              dataUpdateUserRatingCurrentPeriod.changeRating += rating;
            }
          } else {
            differentRatingPreviousPeriod = rating - dataUpdateUserRatingPreviousPeriod.penalty;
            if (differentRatingPreviousPeriod >= 0) {
              dataUpdateUserRatingPreviousPeriod.changeRating = dataUpdateUserRatingPreviousPeriod.penalty;
              dataUpdateUserRatingCurrentPeriod.changeRating = differentRatingPreviousPeriod;
            } else {
              dataUpdateUserRatingPreviousPeriod.changeRating = rating;
            }
          }
        } else if (rating < 0 && dataUpdateUserRatingPreviousPeriod.ratingToReward > dataUpdateUserRatingPreviousPeriod.penalty) {

          differentRatingCurrentPeriod = dataUpdateUserRatingCurrentPeriod.penalty - rating;   // penalty is always positive, we need add rating to penalty
          if (differentRatingCurrentPeriod > dataUpdateUserRatingCurrentPeriod.ratingToReward) {
            dataUpdateUserRatingCurrentPeriod.changeRating -= dataUpdateUserRatingCurrentPeriod.ratingToReward - dataUpdateUserRatingCurrentPeriod.penalty;  // - current ratingToReward
            dataUpdateUserRatingPreviousPeriod.changeRating = rating - dataUpdateUserRatingCurrentPeriod.changeRating;                                       // + previous penalty
            if (dataUpdateUserRatingPreviousPeriod.ratingToReward < dataUpdateUserRatingPreviousPeriod.penalty - dataUpdateUserRatingPreviousPeriod.changeRating) {
              int32 extraPenalty = dataUpdateUserRatingPreviousPeriod.penalty - dataUpdateUserRatingPreviousPeriod.changeRating - dataUpdateUserRatingPreviousPeriod.ratingToReward;
              dataUpdateUserRatingPreviousPeriod.changeRating += extraPenalty;  // - extra previous penalty
              dataUpdateUserRatingCurrentPeriod.changeRating -= extraPenalty;   // + extra current penalty
            }
          } else {
            dataUpdateUserRatingCurrentPeriod.changeRating = rating;
            // dataUpdateUserRatingCurrentPeriod.changeRating += 0;
          }
        } else {
          dataUpdateUserRatingCurrentPeriod.changeRating += rating;
        }
      }

      if (dataUpdateUserRatingPreviousPeriod.changeRating != 0) {
        previousPeriodRating.penalty += -dataUpdateUserRatingPreviousPeriod.changeRating;

        dataUpdateUserRatingPreviousPeriod.ratingToRewardChange = getRatingToRewardChange(dataUpdateUserRatingPreviousPeriod.ratingToReward - dataUpdateUserRatingPreviousPeriod.penalty, dataUpdateUserRatingPreviousPeriod.ratingToReward - dataUpdateUserRatingPreviousPeriod.penalty + dataUpdateUserRatingPreviousPeriod.changeRating);
        if (dataUpdateUserRatingPreviousPeriod.ratingToRewardChange != 0)
          userContext.periodRewardContainer.periodRewardShares[previousPeriod].totalRewardShares += getRewardShare(userContext, userAddr, previousPeriod, dataUpdateUserRatingPreviousPeriod.ratingToRewardChange);
      }
    }

    if (dataUpdateUserRatingCurrentPeriod.changeRating != 0) {
      dataUpdateUserRatingCurrentPeriod.ratingToRewardChange = getRatingToRewardChange(dataUpdateUserRatingCurrentPeriod.ratingToReward - dataUpdateUserRatingCurrentPeriod.penalty, dataUpdateUserRatingCurrentPeriod.ratingToReward - dataUpdateUserRatingCurrentPeriod.penalty + dataUpdateUserRatingCurrentPeriod.changeRating);
      if (dataUpdateUserRatingCurrentPeriod.ratingToRewardChange != 0)
        userContext.periodRewardContainer.periodRewardShares[currentPeriod].totalRewardShares += getRewardShare(userContext, userAddr, currentPeriod, dataUpdateUserRatingCurrentPeriod.ratingToRewardChange);

      int32 changeRating;
      if (dataUpdateUserRatingCurrentPeriod.changeRating > 0) {
        changeRating = dataUpdateUserRatingCurrentPeriod.changeRating - dataUpdateUserRatingCurrentPeriod.penalty;
        if (changeRating >= 0) {
          currentPeriodRating.penalty = 0;
          currentPeriodRating.ratingToReward += changeRating;
        } else {
          currentPeriodRating.penalty = -changeRating;
        }

      } else if (dataUpdateUserRatingCurrentPeriod.changeRating < 0) {
        changeRating = dataUpdateUserRatingCurrentPeriod.ratingToReward + dataUpdateUserRatingCurrentPeriod.changeRating;
        if (changeRating <= 0) {
          currentPeriodRating.ratingToReward = 0;
          currentPeriodRating.penalty += -changeRating;
        } else {
          currentPeriodRating.ratingToReward = changeRating;
        }
      }
    }

    // Activate period rating for community if this is the first change
    if (isFirstTransactionInPeriod) {
      currentPeriodRating.isActive = true;
    }
  }

  function getRewardShare(UserLib.UserContext storage userContext, address userAddr, uint16 period, int32 rating) private view returns (int32) { // FIX
    return userContext.peeranhaToken.getBoost(userAddr, period) * rating;
  }

  function getRatingToRewardChange(int32 previosRatingToReward, int32 newRatingToReward) private pure returns (int32) {
    if (previosRatingToReward >= 0 && newRatingToReward >= 0) return newRatingToReward - previosRatingToReward;
    else if(previosRatingToReward > 0 && newRatingToReward < 0) return -previosRatingToReward;
    else if(previosRatingToReward < 0 && newRatingToReward > 0) return newRatingToReward;
    return 0; // from negative to negative
  }

  function checkRatingAndEnergy(
    UserContext storage userContext,
    address actionCaller,
    address dataUser,
    uint32 communityId,
    Action action
  )
    internal 
    returns (User storage)
  {
    UserLib.User storage user = UserLib.getUserByAddress(userContext.users, dataUser);
    int32 userRating = UserLib.getUserRating(userContext.userRatingCollection, dataUser, communityId);
        
    // TODO: create a separate function that returns energy and min rating for an action
    int16 ratingAllowed;
    string memory message;
    uint8 energy;
    if (action == Action.NONE) {
      return user;
    } else if (action == Action.publicationPost) {
      ratingAllowed = POST_QUESTION_ALLOWED;
      message = "low_rating_post";
      energy = ENERGY_POST_QUESTION;
    } else if (action == Action.publicationReply) {
      ratingAllowed = POST_REPLY_ALLOWED;
      message = "low_rating_reply";
      energy = ENERGY_POST_ANSWER;

    } else if (action == Action.publicationComment) {
      ratingAllowed = POST_COMMENT_ALLOWED;
      message = "low_rating_own_post_comment";
      energy = ENERGY_POST_COMMENT;

    } else if (action == Action.editItem) {
      require(actionCaller == dataUser, "not_allowed_edit");
      ratingAllowed = MINIMUM_RATING;
      message = "low_rating_edit";
      energy = ENERGY_MODIFY_ITEM;

    } else if (action == Action.deleteItem) {
      require(actionCaller == dataUser, "not_allowed_delete");
      ratingAllowed = 0;
      message = "low_rating_delete_own"; // delete own item?
      energy = ENERGY_DELETE_ITEM;

    } else if (action == Action.upVotePost) {
      require(actionCaller != dataUser, "not_allowed_vote_post");
      ratingAllowed = UPVOTE_POST_ALLOWED;
      message = "low rating to upvote";
      energy = ENERGY_UPVOTE_QUESTION;

    } else if (action == Action.upVoteReply) {
      require(actionCaller != dataUser, "not_allowed_vote_reply");
      ratingAllowed = UPVOTE_REPLY_ALLOWED;
      message = "low_rating_upvote_post";
      energy = ENERGY_UPVOTE_ANSWER;

    } else if (action == Action.voteComment) {
      require(actionCaller != dataUser, "not_allowed_vote_comment");
      ratingAllowed = VOTE_COMMENT_ALLOWED;
      message = "low_rating_vote_comment";
      energy = ENERGY_VOTE_COMMENT;

    }
     else if (action == Action.downVotePost) {
      require(actionCaller != dataUser, "not_allowed_vote_post");
      ratingAllowed = DOWNVOTE_POST_ALLOWED;
      message = "low_rating_downvote_post";
      energy = ENERGY_DOWNVOTE_QUESTION;

    } else if (action == Action.downVoteReply) {
      require(actionCaller != dataUser, "not_allowed_vote_reply");
      ratingAllowed = DOWNVOTE_REPLY_ALLOWED;
      message = "low_rating_downvote_reply";
      energy = ENERGY_DOWNVOTE_ANSWER;

    } else if (action == Action.cancelVote) {
      ratingAllowed = CANCEL_VOTE;
      message = "low_rating_cancel_vote";
      energy = ENERGY_FORUM_VOTE_CANCEL;

    } else if (action == Action.bestReply) {
      ratingAllowed = MINIMUM_RATING;
      message = "low_rating_mark_best";
      energy = ENERGY_MARK_REPLY_AS_CORRECT;

    } else if (action == Action.updateProfile) { //userRating - always 0 (const)
      energy = ENERGY_UPDATE_PROFILE;

    } 
    else if (action == Action.followCommunity) {
      ratingAllowed = MINIMUM_RATING;
      message = "low_rating_follow_comm";
      energy = ENERGY_FOLLOW_COMMUNITY;

    } 
    else {
      require(false, "not_allowed_action");
    }

    require(userRating >= ratingAllowed, message);
    reduceEnergy(user, userRating, energy);

    return user;
  }

  function reduceEnergy(UserLib.User storage user, int32 userRating, uint8 energy) internal {    
    uint16 currentPeriod = RewardLib.getPeriod(CommonLib.getTimestamp());
    uint32 periodsHavePassed = currentPeriod - user.lastUpdatePeriod;

    uint16 userEnergy;
    if (periodsHavePassed == 0) {
      userEnergy = user.energy;
    } else {
      userEnergy = UserLib.getStatusEnergy(userRating);
      user.lastUpdatePeriod = currentPeriod;
    }

    require(userEnergy >= energy, "low_energy");
    user.energy = userEnergy - energy;
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