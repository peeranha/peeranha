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
  bytes32 constant DEFAULT_IPFS = bytes32(0xc09b19f65afd0df610c90ea00120bccd1fc1b8c6e7cdbe440376ee13e156a5bc);

  int16 constant MINIMUM_RATING = -300;
  int16 constant POST_QUESTION_ALLOWED = 0;
  int16 constant POST_REPLY_ALLOWED = 0;
  int16 constant POST_COMMENT_ALLOWED = 35;
  int16 constant POST_OWN_COMMENT_ALLOWED = 0;

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
    uint32 ratingToReward;
    uint32 penalty;
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

  struct BannedUsers {
    mapping(address => BannedUserInfo) bannedUserInfo;
  }

  struct BannedUserInfo {
    mapping(uint32 => bool) userCommunityBans;  // communityId
    bool isGlobalBan;
  }

  struct UserRatingChange {
    address user;
    int32 rating;
  }

  struct UserDelegationCollection {
    mapping(address => uint) userDelegations;
    address delegateUser;
  }

  enum Action {
    NONE,
    PublicationPost,
    PublicationReply,
    PublicationComment,
    EditItem,
    DeleteItem,
    UpVotePost,
    DownVotePost,
    UpVoteReply,
    DownVoteReply,
    VoteComment,
    CancelVote,
    BestReply,
    UpdateProfile,
    FollowCommunity
  }

  enum ActionRole {
    NONE,
    Bot,
    Admin,
    Dispatcher,
    AdminOrCommunityModerator,
    AdminOrCommunityAdmin,
    CommunityAdmin,
    CommunityModerator,
    AdminOrCommunityAdminOrCommunityModerator
  }

  event UserCreated(address indexed userAddress);
  event UserUpdated(address indexed userAddress);
  event FollowedCommunity(address indexed userAddress, uint32 indexed communityId);
  event UnfollowedCommunity(address indexed userAddress, uint32 indexed communityId);
  event BanUser(address indexed userAddress, address indexed targetUserAddress);
  event UnBanUser(address indexed userAddress, address indexed targetUserAddress);
  event BanCommunityUser(address indexed userAddress, address indexed targetUserAddress, uint32 indexed communityId);
  event UnBanCommunityUser(address indexed userAddress, address indexed targetUserAddress, uint32 indexed communityId);


  /// @notice Create new user info record
  /// @param self The mapping containing all users
  /// @param userAddress Address of the user to create 
  /// @param ipfsHash IPFS hash of document with user information
  function create(
    UserCollection storage self,
    address userAddress,
    bytes32 ipfsHash
  ) internal {
    // TODO CHECK ipfsHash ? not null
    require(self.users[userAddress].ipfsDoc.hash == bytes32(0x0), "user_exists");

    User storage user = self.users[userAddress];
    user.ipfsDoc.hash = ipfsHash;
    user.energy = getStatusEnergy();
    user.lastUpdatePeriod = RewardLib.getPeriod();

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
      UserLib.create(self, userAddress, DEFAULT_IPFS);
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
    // TODO CHECK ipfsHash ? not null
    User storage user = checkRatingAndEnergy(
      userContext,
      userAddress,
      userAddress,
      0,
      Action.UpdateProfile
    );
    user.ipfsDoc.hash = ipfsHash;   // todo add check? gas

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
  ) public {
    User storage user = checkRatingAndEnergy(
      userContext,
      userAddress,
      userAddress,
      0,
      Action.FollowCommunity
    );

    bool isAlreadyFollowed;
    for (uint i; i < user.followedCommunities.length; i++) {
      if (user.followedCommunities[i] == communityId) {
        isAlreadyFollowed = true;
        break;
      }
    }
    if (!isAlreadyFollowed)
      user.followedCommunities.push(communityId);

    emit FollowedCommunity(userAddress, communityId);
  }

  /// @notice User unfollows community
  /// @param userContext The mapping containing all users
  /// @param userAddress Address of the user to update
  /// @param communityId User follows om this community
  function unfollowCommunity(
    UserContext storage userContext,
    address userAddress,
    uint32 communityId
  ) public {
    User storage user = checkRatingAndEnergy(
      userContext,
      userAddress,
      userAddress,
      0,
      Action.FollowCommunity
    );

    for (uint i; i < user.followedCommunities.length; i++) {
      if (user.followedCommunities[i] == communityId) {
        // Move the last element into the place to delete
        user.followedCommunities[i] = user.followedCommunities[user.followedCommunities.length - 1];

        // Remove the last element
        user.followedCommunities.pop();
        
        emit UnfollowedCommunity(userAddress, communityId);
        return;
      }
    }
    revert("comm_not_followed");
  }

  /// @notice Ban user
  /// @param bannedUsers The mapping containing all info about users`s bans
  /// @param targetUserAddress The address of the user who will be ban
  function banUser(
    BannedUsers storage bannedUsers,
    address userAddress,
    address targetUserAddress
  ) public {
    require(!isBannedUser(bannedUsers, targetUserAddress, 0), "Already_banned");
    bannedUsers.bannedUserInfo[targetUserAddress].isGlobalBan = true;

    emit BanUser(userAddress, targetUserAddress);
  }

  /// @notice unBan user
  /// @param bannedUsers The mapping containing all info about users`s bans
  /// @param targetUserAddress The address of the user who will be unBan
  function unBanUser(
    BannedUsers storage bannedUsers,
    address userAddress,
    address targetUserAddress
  ) public {
    require(isBannedUser(bannedUsers, targetUserAddress, 0), "User_is_not_banned");
    bannedUsers.bannedUserInfo[targetUserAddress].isGlobalBan = false;

    emit UnBanUser(userAddress, targetUserAddress);
  }

  /// @notice Ban user in community
  /// @param bannedUsers The mapping containing all info about users`s bans
  /// @param targetUserAddress The address of the user who will be ban
  /// @param communityId The community where the user will be ban
  function banCommunityUser(
    BannedUsers storage bannedUsers,
    address userAddress,
    address targetUserAddress,
    uint32 communityId
  ) public {
    require(!isBannedUser(bannedUsers, targetUserAddress, communityId), "Already_banned");
    bannedUsers.bannedUserInfo[targetUserAddress].userCommunityBans[communityId] = true;

    emit BanCommunityUser(userAddress, targetUserAddress, communityId);
  }

  /// @notice unBan user in community
  /// @param bannedUsers The mapping containing all info about users`s bans
  /// @param targetUserAddress The address of the user who will be unBan
  /// @param communityId The community where the user will be unBan
  function unBanCommunityUser(
    BannedUsers storage bannedUsers,
    address userAddress,
    address targetUserAddress,
    uint32 communityId
  ) public {
    require(isBannedUser(bannedUsers, targetUserAddress, communityId), "User_is_not_banned");
    bannedUsers.bannedUserInfo[targetUserAddress].userCommunityBans[communityId] = false;

    emit UnBanCommunityUser(userAddress, targetUserAddress, communityId);
  }

  /// @notice Is banned user in community
  /// @param bannedUsers The mapping containing all info about users`s bans
  /// @param userAddress user address
  /// @param communityId community id
  function isBannedUser(BannedUsers storage bannedUsers, address userAddress, uint32 communityId) internal view returns (bool isBanned) {
    bool isCommunityBan =  bannedUsers.bannedUserInfo[userAddress].userCommunityBans[communityId];
    bool isGlobalBan = bannedUsers.bannedUserInfo[userAddress].isGlobalBan;
    return isCommunityBan || isGlobalBan;
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
    return self.communityRatingForUser[addr].userRating[communityId].rating;
  }

  function getUserRatingCollection(UserRatingCollection storage self, address addr, uint32 communityId) internal view returns (UserRating memory) {
    return self.communityRatingForUser[addr].userRating[communityId];
  }

  /// @notice Check user existence
  /// @param self The mapping containing all users
  /// @param addr Address of the user to check
  function isExists(UserCollection storage self, address addr) internal view returns (bool) {
    return self.users[addr].ipfsDoc.hash != bytes32(0x0);
  }

  function updateUsersRating(UserLib.UserContext storage userContext, AchievementLib.AchievementsMetadata storage achievementsMetadata, UserRatingChange[] memory usersRating, uint32 communityId) public {
    for (uint i; i < usersRating.length; i++) {
      updateUserRating(userContext, achievementsMetadata, usersRating[i].user, usersRating[i].rating, communityId);
    }
  }

  function updateUserRating(UserLib.UserContext storage userContext, AchievementLib.AchievementsMetadata storage achievementsMetadata, address userAddr, int32 rating, uint32 communityId) public {
    if (rating == 0 || userAddr == CommonLib.BOT_ADDRESS) return;
    updateRatingBase(userContext, achievementsMetadata, userAddr, rating, communityId);
  }

  function updateRatingBase(UserContext storage userContext, AchievementLib.AchievementsMetadata storage achievementsMetadata, address userAddr, int32 rating, uint32 communityId) public {
    uint16 currentPeriod = RewardLib.getPeriod();
    
    CommunityRatingForUser storage userCommunityRating = userContext.userRatingCollection.communityRatingForUser[userAddr];
    // Initialize user rating in the community if this is the first rating change
    if (!userCommunityRating.userRating[communityId].isActive) {
      userCommunityRating.userRating[communityId].rating = START_USER_RATING;
      userCommunityRating.userRating[communityId].isActive = true;
    }

    uint256 pastPeriodsCount = userCommunityRating.rewardPeriods.length;
    
    // If this is the first user rating change in any community
    if (pastPeriodsCount == 0 || userCommunityRating.rewardPeriods[pastPeriodsCount - 1] != currentPeriod) {
      RewardLib.PeriodRewardShares storage periodRewardShares = userContext.periodRewardContainer.periodRewardShares[currentPeriod];
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
      AchievementCommonLib.AchievementsType[] memory newArray = new AchievementCommonLib.AchievementsType[](2);
      newArray[0] = AchievementCommonLib.AchievementsType.Rating;
      newArray[1] = AchievementCommonLib.AchievementsType.SoulRating; // {} ???
      AchievementLib.updateUserAchievements(userContext.achievementsContainer, achievementsMetadata, userAddr, newArray, int64(userCommunityRating.userRating[communityId].rating), communityId);
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
          dataUpdateUserRatingCurrentPeriod.changeRating = rating + CommonLib.toInt32FromUint256(dataUpdateUserRatingPreviousPeriod.ratingToReward) - CommonLib.toInt32FromUint256(dataUpdateUserRatingPreviousPeriod.penalty);
        } else {
          dataUpdateUserRatingCurrentPeriod.changeRating = rating;
        }
      } else {
        if (isFirstTransactionInPeriod && dataUpdateUserRatingPreviousPeriod.penalty > dataUpdateUserRatingPreviousPeriod.ratingToReward) {
          dataUpdateUserRatingCurrentPeriod.changeRating = CommonLib.toInt32FromUint256(dataUpdateUserRatingPreviousPeriod.ratingToReward) - CommonLib.toInt32FromUint256(dataUpdateUserRatingPreviousPeriod.penalty);
        }

        int32 differentRatingPreviousPeriod; // name    // move to if()?
        int32 differentRatingCurrentPeriod;
        if (rating > 0 && dataUpdateUserRatingPreviousPeriod.penalty > 0) {
          if (dataUpdateUserRatingPreviousPeriod.ratingToReward == 0) {
            dataUpdateUserRatingCurrentPeriod.changeRating += rating;
          } else {
            differentRatingPreviousPeriod = rating - CommonLib.toInt32FromUint256(dataUpdateUserRatingPreviousPeriod.penalty);
            if (differentRatingPreviousPeriod >= 0) {
              dataUpdateUserRatingPreviousPeriod.changeRating = CommonLib.toInt32FromUint256(dataUpdateUserRatingPreviousPeriod.penalty);
              dataUpdateUserRatingCurrentPeriod.changeRating = differentRatingPreviousPeriod;
            } else {
              dataUpdateUserRatingPreviousPeriod.changeRating = rating;
            }
          }
        } else if (rating < 0 && dataUpdateUserRatingPreviousPeriod.ratingToReward > dataUpdateUserRatingPreviousPeriod.penalty) {

          differentRatingCurrentPeriod = CommonLib.toInt32FromUint256(dataUpdateUserRatingCurrentPeriod.penalty) - rating;   // penalty is always positive, we need add rating to penalty
          if (differentRatingCurrentPeriod > CommonLib.toInt32FromUint256(dataUpdateUserRatingCurrentPeriod.ratingToReward)) {
            dataUpdateUserRatingCurrentPeriod.changeRating -= CommonLib.toInt32FromUint256(dataUpdateUserRatingCurrentPeriod.ratingToReward) - CommonLib.toInt32FromUint256(dataUpdateUserRatingCurrentPeriod.penalty);  // - current ratingToReward
            dataUpdateUserRatingPreviousPeriod.changeRating = rating - dataUpdateUserRatingCurrentPeriod.changeRating;                                       // + previous penalty
            if (CommonLib.toInt32FromUint256(dataUpdateUserRatingPreviousPeriod.ratingToReward) < CommonLib.toInt32FromUint256(dataUpdateUserRatingPreviousPeriod.penalty) - dataUpdateUserRatingPreviousPeriod.changeRating) {
              int32 extraPenalty = CommonLib.toInt32FromUint256(dataUpdateUserRatingPreviousPeriod.penalty) - CommonLib.toInt32FromUint256(dataUpdateUserRatingPreviousPeriod.ratingToReward) - dataUpdateUserRatingPreviousPeriod.changeRating;
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
        if (dataUpdateUserRatingPreviousPeriod.changeRating > 0) previousPeriodRating.penalty -= CommonLib.toUInt32FromInt32(dataUpdateUserRatingPreviousPeriod.changeRating);
        else previousPeriodRating.penalty += CommonLib.toUInt32FromInt32(-dataUpdateUserRatingPreviousPeriod.changeRating);

        dataUpdateUserRatingPreviousPeriod.ratingToRewardChange = getRatingToRewardChange(CommonLib.toInt32FromUint256(dataUpdateUserRatingPreviousPeriod.ratingToReward) - CommonLib.toInt32FromUint256(dataUpdateUserRatingPreviousPeriod.penalty), CommonLib.toInt32FromUint256(dataUpdateUserRatingPreviousPeriod.ratingToReward) - CommonLib.toInt32FromUint256(dataUpdateUserRatingPreviousPeriod.penalty) + dataUpdateUserRatingPreviousPeriod.changeRating);
        if (dataUpdateUserRatingPreviousPeriod.ratingToRewardChange > 0) {
          userContext.periodRewardContainer.periodRewardShares[previousPeriod].totalRewardShares += CommonLib.toUInt32FromInt32(getRewardShare(userContext, userAddr, previousPeriod, dataUpdateUserRatingPreviousPeriod.ratingToRewardChange));
        } else {
          userContext.periodRewardContainer.periodRewardShares[previousPeriod].totalRewardShares -= CommonLib.toUInt32FromInt32(-getRewardShare(userContext, userAddr, previousPeriod, dataUpdateUserRatingPreviousPeriod.ratingToRewardChange));
        }
      }
    }

    if (dataUpdateUserRatingCurrentPeriod.changeRating != 0) {
      dataUpdateUserRatingCurrentPeriod.ratingToRewardChange = getRatingToRewardChange(CommonLib.toInt32FromUint256(dataUpdateUserRatingCurrentPeriod.ratingToReward) - CommonLib.toInt32FromUint256(dataUpdateUserRatingCurrentPeriod.penalty), CommonLib.toInt32FromUint256(dataUpdateUserRatingCurrentPeriod.ratingToReward) - CommonLib.toInt32FromUint256(dataUpdateUserRatingCurrentPeriod.penalty) + dataUpdateUserRatingCurrentPeriod.changeRating);
      if (dataUpdateUserRatingCurrentPeriod.ratingToRewardChange > 0) {
        userContext.periodRewardContainer.periodRewardShares[currentPeriod].totalRewardShares += CommonLib.toUInt32FromInt32(getRewardShare(userContext, userAddr, currentPeriod, dataUpdateUserRatingCurrentPeriod.ratingToRewardChange));
      } else {
        userContext.periodRewardContainer.periodRewardShares[currentPeriod].totalRewardShares -= CommonLib.toUInt32FromInt32(-getRewardShare(userContext, userAddr, currentPeriod, dataUpdateUserRatingCurrentPeriod.ratingToRewardChange));
      }

      int32 changeRating;
      if (dataUpdateUserRatingCurrentPeriod.changeRating > 0) {
        changeRating = dataUpdateUserRatingCurrentPeriod.changeRating - CommonLib.toInt32FromUint256(dataUpdateUserRatingCurrentPeriod.penalty);
        if (changeRating >= 0) {
          currentPeriodRating.penalty = 0;
          currentPeriodRating.ratingToReward += CommonLib.toUInt32FromInt32(changeRating);
        } else {
          currentPeriodRating.penalty = CommonLib.toUInt32FromInt32(-changeRating);
        }

      } else if (dataUpdateUserRatingCurrentPeriod.changeRating < 0) {
        changeRating = CommonLib.toInt32FromUint256(dataUpdateUserRatingCurrentPeriod.ratingToReward) + dataUpdateUserRatingCurrentPeriod.changeRating;
        if (changeRating <= 0) {
          currentPeriodRating.ratingToReward = 0;
          currentPeriodRating.penalty += CommonLib.toUInt32FromInt32(-changeRating);
        } else {
          currentPeriodRating.ratingToReward = CommonLib.toUInt32FromInt32(changeRating);
        }
      }
    }

    // Activate period rating for community if this is the first change
    if (isFirstTransactionInPeriod) {
      currentPeriodRating.isActive = true;
    }
  }

  function getRewardShare(UserLib.UserContext storage userContext, address userAddr, uint16 period, int32 rating) private view returns (int32) { // FIX
    return CommonLib.toInt32FromUint256(userContext.peeranhaToken.getBoost(userAddr, period)) * rating;
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
    view
    returns (User storage)
  {
    UserLib.User storage user = UserLib.getUserByAddress(userContext.users, actionCaller);
    int32 userRating = UserLib.getUserRating(userContext.userRatingCollection, actionCaller, communityId);
        
    (int16 ratingAllowed, string memory message,) = getRatingAndRatingForAction(actionCaller, dataUser, action);
    require(userRating >= ratingAllowed, message);
    // reduceEnergy(user, energy);

    return user;
  }

  function getRatingAndRatingForAction( // TODO getRatingAndRatingForAction -> getRatingAndEnergyForAction
    address actionCaller,
    address dataUser,
    Action action
  ) private pure returns (int16 ratingAllowed, string memory message, uint8 energy) {
    if (action == Action.NONE) {
    } else if (action == Action.PublicationPost) {
      ratingAllowed = POST_QUESTION_ALLOWED;
      message = "low_rating_post";
      energy = ENERGY_POST_QUESTION;

    } else if (action == Action.PublicationReply) {
      ratingAllowed = POST_REPLY_ALLOWED;
      message = "low_rating_reply";
      energy = ENERGY_POST_ANSWER;

    } else if (action == Action.PublicationComment) {
      if (actionCaller == dataUser) {
        ratingAllowed = POST_OWN_COMMENT_ALLOWED;
      } else {
        ratingAllowed = POST_COMMENT_ALLOWED;
      }
      message = "low_rating_comment";
      energy = ENERGY_POST_COMMENT;

    } else if (action == Action.EditItem) {
      require(actionCaller == dataUser, "not_allowed_edit");
      ratingAllowed = MINIMUM_RATING;
      message = "low_rating_edit";
      energy = ENERGY_MODIFY_ITEM;

    } else if (action == Action.DeleteItem) {
      require(actionCaller == dataUser, "not_allowed_delete");
      ratingAllowed = 0;
      message = "low_rating_delete"; // delete own item?
      energy = ENERGY_DELETE_ITEM;

    } else if (action == Action.UpVotePost) {
      require(actionCaller != dataUser, "not_allowed_vote_post");   // toDO unittest post/reply/comment upvote+downvote
      ratingAllowed = UPVOTE_POST_ALLOWED;
      message = "low_rating_upvote_post";
      energy = ENERGY_UPVOTE_QUESTION;

    } else if (action == Action.UpVoteReply) {
      require(actionCaller != dataUser, "not_allowed_vote_reply");
      ratingAllowed = UPVOTE_REPLY_ALLOWED;
      message = "low_rating_upvote_reply";
      energy = ENERGY_UPVOTE_ANSWER;

    } else if (action == Action.VoteComment) {
      require(actionCaller != dataUser, "not_allowed_vote_comment");
      ratingAllowed = VOTE_COMMENT_ALLOWED;
      message = "low_rating_vote_comment";
      energy = ENERGY_VOTE_COMMENT;

    } else if (action == Action.DownVotePost) {
      require(actionCaller != dataUser, "not_allowed_vote_post");
      ratingAllowed = DOWNVOTE_POST_ALLOWED;
      message = "low_rating_downvote_post";
      energy = ENERGY_DOWNVOTE_QUESTION;

    } else if (action == Action.DownVoteReply) {
      require(actionCaller != dataUser, "not_allowed_vote_reply");
      ratingAllowed = DOWNVOTE_REPLY_ALLOWED;
      message = "low_rating_downvote_reply";
      energy = ENERGY_DOWNVOTE_ANSWER;

    } else if (action == Action.CancelVote) {
      ratingAllowed = CANCEL_VOTE;
      message = "low_rating_cancel_vote";
      energy = ENERGY_FORUM_VOTE_CANCEL;

    } else if (action == Action.BestReply) {
      ratingAllowed = MINIMUM_RATING;
      message = "low_rating_mark_best";
      energy = ENERGY_MARK_REPLY_AS_CORRECT;

    } else if (action == Action.UpdateProfile) {
      energy = ENERGY_UPDATE_PROFILE;
      message = "low_update_profile";   //TODO uniTest

    } else if (action == Action.FollowCommunity) {
      ratingAllowed = MINIMUM_RATING;
      message = "low_rating_follow_comm";
      energy = ENERGY_FOLLOW_COMMUNITY;

    } else {
      revert("not_allowed_action");
    }
  }

  function reduceEnergy(UserLib.User storage user, uint8 energy) internal {
    uint16 currentPeriod = RewardLib.getPeriod();
    uint32 periodsHavePassed = currentPeriod - user.lastUpdatePeriod;

    uint16 userEnergy;
    if (periodsHavePassed == 0) {
      userEnergy = user.energy;
    } else {
      userEnergy = getStatusEnergy();
      user.lastUpdatePeriod = currentPeriod;
    }

    require(userEnergy >= energy, "low_energy");
    user.energy = userEnergy - energy;
  }

  function getStatusEnergy() internal pure returns (uint16) {
    return 1000;
  }

  function getPeriodRewardShares(UserContext storage userContext, uint16 period) internal view returns(RewardLib.PeriodRewardShares memory) {
    return userContext.periodRewardContainer.periodRewardShares[period];
  }

  function getUserRewardCommunities(UserContext storage userContext, address user, uint16 rewardPeriod) internal view returns(uint32[] memory) {
    return userContext.userRatingCollection.communityRatingForUser[user].userPeriodRewards[rewardPeriod].rewardCommunities;
  }
}