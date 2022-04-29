pragma abicoder v2;
pragma solidity >=0.5.0;

import "@openzeppelin/contracts-upgradeable/utils/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

import "./CommonLib.sol";
import "./RewardLib.sol";
import "./AchievementLib.sol";
import "./AchievementCommonLib.sol";
import "./AchievementCommonLib.sol";
import "../interfaces/IPeeranhaToken.sol";


/// @title Users
/// @notice Provides information about registered user
/// @dev Users information is stored in the mapping on the main contract
library UserLib {
  using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;
  using AddressUpgradeable for address;

  int32 constant START_USER_RATING = 10;
  uint256 constant ACCOUNT_STAT_RESET_PERIOD = 14; // 259200 - 3 Days

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

  bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
  uint256 public constant COMMUNITY_ADMIN_ROLE = uint256(keccak256("COMMUNITY_ADMIN_ROLE"));
  uint256 public constant COMMUNITY_MODERATOR_ROLE = uint256(keccak256("COMMUNITY_MODERATOR_ROLE"));


  struct User {
    CommonLib.IpfsHash ipfsDoc;
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
    bool isActive;
  }


  /// users The mapping containing all users
  struct UserContext {
    UserLib.UserCollection users;
    UserLib.UserRatingCollection userRatingCollection;
    UserLib.UserDelegationCollection userDelegationCollection;
    RewardLib.WeekRewardContainer weekRewardContainer;
    UserLib.Roles roles;
    UserLib.UserRoles userRoles;
    AchievementLib.AchievementsContainer achievementsContainer;
    IPeeranhaToken peeranhaToken;
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

  enum Action {
    publicationPost,
    publicationReply,
    publicationComment,
    editItem,
    deleteItem,
    changePostType,
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

  struct RoleData {
    EnumerableSetUpgradeable.AddressSet members;
    bytes32 adminRole;
  }

  struct Roles {
    mapping (bytes32 => RoleData) _roles;
  }

  struct UserRoles {
    mapping (address => bytes32[]) userRoles;
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
    require(self.users[userAddress].ipfsDoc.hash == bytes32(0x0), "user_exists");

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
    require(msgSender == self.userDelegationCollection.delegateUser, "invld_user");
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
    UserLib.checkRatingAndEnergy(
      userContext.roles,
      user,
      0,
      userAddress,
      userAddress,
      0,
      UserLib.Action.updateProfile
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
    UserLib.checkRatingAndEnergy(
      userContext.roles,
      user,
      getUserRating(userContext.userRatingCollection, userAddress, communityId),
      userAddress,
      userAddress,
      0,
      UserLib.Action.followCommunity
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
    return delegateUser == delegations.delegateUser && delegations.userDelegations[userAddress] == 1;
  }

  function updateUsersRating(UserLib.UserContext storage userContext, UserRatingChange[] memory usersRating, uint32 communityId) internal {
    for (uint i; i < usersRating.length; i++) {
      updateUserRating(userContext, usersRating[i].user, usersRating[i].rating, communityId);
    }
  }

  /// @notice Add rating to user
  /// @param userAddr user's rating will be change
  /// @param rating value for add to user's rating
  function updateUserRating(UserLib.UserContext storage userContext, User storage user, address userAddr, int32 rating, uint32 communityId) internal { // delete "user" argument
    if (rating == 0) return;

    updateRatingBase(userContext, userAddr, rating, communityId);
  }

  function updateUserRating(UserLib.UserContext storage userContext, address userAddr, int32 rating, uint32 communityId) internal {
    if (rating == 0) return;

    User storage user = getUserByAddress(userContext.users, userAddr);
    updateRatingBase(userContext, userAddr, rating, communityId);
  }

  function updateRatingBase(UserLib.UserContext storage userContext, address userAddr, int32 rating, uint32 communityId) internal {
    uint16 currentPeriod = RewardLib.getPeriod(CommonLib.getTimestamp());
    
    CommunityRatingForUser storage communityUser = userContext.userRatingCollection.communityRatingForUser[userAddr];
    if (!communityUser.userRating[communityId].isActive) {
      communityUser.userRating[communityId].rating = START_USER_RATING;
      communityUser.userRating[communityId].isActive = true;
    }

    uint256 pastPeriodsCount = communityUser.rewardPeriods.length;

    RewardLib.UserPeriodRewards storage userPeriodRewards = communityUser.userPeriodRewards[currentPeriod];
    RewardLib.PeriodRating storage periodRating = communityUser.userPeriodRewards[currentPeriod].periodRating[communityId];

    RewardLib.WeekReward storage weekReward = userContext.weekRewardContainer.weekReward[currentPeriod];
    if (pastPeriodsCount == 0 || communityUser.rewardPeriods[pastPeriodsCount - 1] != currentPeriod) {
      weekReward.activeUsersInPeriod.push(userAddr);
      communityUser.rewardPeriods.push(currentPeriod);
      pastPeriodsCount++;
    }

    bool isFirstTransactionInPeriod;
    if (!periodRating.isActive) {
      periodRating.isActive = true;
      isFirstTransactionInPeriod = true;
      userPeriodRewards.rewardCommunities.push(communityId);
    }

    // pastPeriodsCount = communityUser.rewardPeriods.length; // ?? rewrite

    int32 lastRatingToReward = periodRating.ratingToReward;
    int32 lastRatingToRewardPreviousPeriod;
    if (pastPeriodsCount == 1) {
      periodRating.ratingToReward += rating;

    } else {
      uint16 previousPeriod = communityUser.rewardPeriods[pastPeriodsCount - 2];
      RewardLib.PeriodRating storage previousPeriodRating = communityUser.userPeriodRewards[previousPeriod].periodRating[communityId];
      lastRatingToRewardPreviousPeriod = previousPeriodRating.ratingToReward;

      if (previousPeriod == currentPeriod - 1) {
        if (previousPeriodRating.ratingToReward <= 0) {
          if (isFirstTransactionInPeriod)
            periodRating.ratingToReward = previousPeriodRating.ratingToReward + rating;
          else
            periodRating.ratingToReward += rating;

        } else {
          if (rating > 0) {
            periodRating.ratingToReward += rating;

          } else {
            if (previousPeriodRating.ratingToReward > 0) {
              if (previousPeriodRating.ratingToReward + rating <= 0){
                periodRating.ratingToReward += rating + previousPeriodRating.ratingToReward;
                previousPeriodRating.ratingToReward = 0;
              } else {
                previousPeriodRating.ratingToReward += rating;
              }

            } else {
              periodRating.ratingToReward += rating;
            }
          }
        }

        lastRatingToRewardPreviousPeriod = getRatingToReward(lastRatingToRewardPreviousPeriod, previousPeriodRating.ratingToReward); 
        if (lastRatingToRewardPreviousPeriod != 0) {
          userContext.weekRewardContainer.weekReward[previousPeriod].tokens += getBoostedReward(userContext, userAddr, previousPeriod, lastRatingToRewardPreviousPeriod);
        }

      } else {
        if (isFirstTransactionInPeriod && previousPeriodRating.ratingToReward < 0)
          periodRating.ratingToReward = previousPeriodRating.ratingToReward + rating;
        else
          periodRating.ratingToReward += rating;
      }
    }

    lastRatingToReward = getRatingToReward(lastRatingToReward, periodRating.ratingToReward);
    if (lastRatingToReward != 0) {
      weekReward.tokens += getBoostedReward(userContext, userAddr, currentPeriod, lastRatingToReward);
    }
    communityUser.userRating[communityId].rating += rating;

    if (rating > 0) {
      AchievementLib.updateUserAchievements(userContext.achievementsContainer, userAddr, AchievementCommonLib.AchievementsType.Rating, int64(communityUser.userRating[communityId].rating));
    }
  }

  function getBoostedReward(UserLib.UserContext storage userContext, address userAddr, uint16 period, int32 rating) private returns (int32) {
    return userContext.peeranhaToken.getBoost(userAddr, period) * rating;
  }

  function getRatingToReward(int32 lastRatingToReward, int32 newRatingToReward) private pure returns (int32) {
    if (lastRatingToReward >= 0 && newRatingToReward >= 0) return newRatingToReward - lastRatingToReward;
    else if(lastRatingToReward > 0 && newRatingToReward < 0) return -lastRatingToReward;
    else if(lastRatingToReward < 0 && newRatingToReward > 0) return newRatingToReward;
    return 0; // from negative to negative
  }

  function getCommunityRole(uint256 role, uint32 communityId) internal pure returns (bytes32) {
    return bytes32(role + communityId);
  }

  function checkRatingAndEnergy(
    Roles storage role,
    UserLib.User storage user,
    int32 userRating,
    address actionCaller,
    address dataUser,
    uint32 communityId,
    Action action
  )
    internal
  {
    if (hasModeratorRole(role, actionCaller, communityId)) return;
    
    int16 ratingAllowed;
    string memory message;
    uint8 energy;
    if (action == Action.publicationPost) {
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

    } else if (action == Action.changePostType) {
      require(false, "not_allowed_change_type");

    } else if (action == Action.upVotePost) {
      require(actionCaller != dataUser, "not_allowed_vote_post");   // в функции есть You can not vote for own post
      ratingAllowed = UPVOTE_POST_ALLOWED;
      message = "low rating to upvote (35 min)";
      energy = ENERGY_UPVOTE_QUESTION;

    } else if (action == Action.upVoteReply) {
      require(actionCaller != dataUser, "not_allowed_vote_reply"); // в функции есть You can not vote for own reply
      ratingAllowed = UPVOTE_REPLY_ALLOWED;
      message = "low_rating_upvote_post";
      energy = ENERGY_UPVOTE_ANSWER;

    } else if (action == Action.voteComment) {
      require(actionCaller != dataUser, "not_allowed_vote_comment"); // в функции есть You can not vote for own comment
      ratingAllowed = VOTE_COMMENT_ALLOWED;
      message = "low_rating_vote_comment";
      energy = ENERGY_VOTE_COMMENT;

    } else if (action == Action.downVotePost) {
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

    } else if (action == Action.followCommunity) {
      ratingAllowed = MINIMUM_RATING;
      message = "low_rating_follow_comm";
      energy = ENERGY_FOLLOW_COMMUNITY;

    } else {
      require(false, "not_allowed_action");
    }

    require(userRating >= ratingAllowed, message);
    reduceEnergy(user, userRating, energy);
  }

  function reduceEnergy(UserLib.User storage user, int32 userRating, uint8 energy) internal {    
    int32 rating = userRating;
    uint256 currentTime = CommonLib.getTimestamp();
    uint16 currentPeriod = uint16((currentTime - user.creationTime) / UserLib.ACCOUNT_STAT_RESET_PERIOD);
    uint32 periodsHavePassed = currentPeriod - user.lastUpdatePeriod;

    uint16 userEnergy;
    if (periodsHavePassed == 0) {
      userEnergy = user.energy;
    } else {
      userEnergy = UserLib.getStatusEnergy(userRating);
      user.lastUpdatePeriod = currentPeriod;
    }

    require(userEnergy >= energy, "Not enough energy!");
    user.energy = userEnergy - energy;
  }

  function hasModeratorRole(
    Roles storage self,
    address user,
    uint32 communityId
  ) 
    internal 
    returns (bool) 
  {
    if ((hasRole(self, getCommunityRole(COMMUNITY_MODERATOR_ROLE, communityId), user) ||
      hasRole(self, DEFAULT_ADMIN_ROLE, user))) return true;
    
    return false;
  }

  /**
    * @dev Emitted when `newAdminRole` is set as ``role``'s admin role, replacing `previousAdminRole`
    *
    * `DEFAULT_ADMIN_ROLE` is the starting admin for all roles, despite
    * {RoleAdminChanged} not being emitted signaling this.
    *
    * _Available since v3.1._
    */
  event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole);

  /**
    * @dev Emitted when `account` is granted `role`.
    *
    * `sender` is the account that originated the contract call, an admin role
    * bearer except when using {setupRole}.
    */
  event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);

  /**
    * @dev Emitted when `account` is revoked `role`.
    *
    * `sender` is the account that originated the contract call:
    *   - if using `revokeRole`, it is the admin role bearer
    *   - if using `renounceRole`, it is the role bearer (i.e. `account`)
    */
  event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);

  /**
    * @dev Returns `true` if `account` has been granted `role`.
    */
  function hasRole(Roles storage self, bytes32 role, address account) internal view returns (bool) {
      return self._roles[role].members.contains(account);
  }

  /**
    * @dev Returns the number of accounts that have `role`. Can be used
    * together with {getRoleMember} to enumerate all bearers of a role.
    */
  function getRoleMemberCount(Roles storage self, bytes32 role) internal view returns (uint256) {
      return self._roles[role].members.length();
  }

  /**
    * @dev Returns one of the accounts that have `role`. `index` must be a
    * value between 0 and {getRoleMemberCount}, non-inclusive.
    *
    * Role bearers are not sorted in any particular way, and their ordering may
    * change at any point.
    *
    * WARNING: When using {getRoleMember} and {getRoleMemberCount}, make sure
    * you perform all queries on the same block. See the following
    * https://forum.openzeppelin.com/t/iterating-over-elements-on-enumerableset-in-openzeppelin-contracts/2296[forum post]
    * for more information.
    */
  function getRoleMember(Roles storage self, bytes32 role, uint256 index) internal view returns (address) {
      return self._roles[role].members.at(index);
  }

  /**
    * @dev Returns the admin role that controls `role`. See {grantRole} and
    * {revokeRole}.
    *
    * To change a role's admin, use {_setRoleAdmin}.
    */
  function getRoleAdmin(Roles storage self, bytes32 role) internal view returns (bytes32) {
      return self._roles[role].adminRole;
  }

  /**
    * @dev Grants `role` to `account`.
    *
    * If `account` had not been already granted `role`, emits a {RoleGranted}
    * event.
    *
    * Requirements:
    *
    * - the caller must have ``role``'s admin role.
    */
  // function grantRole(bytes32 role, address account) public virtual {
  //     require(hasRole(_roles[role].adminRole, _msgSender()), "AccessControl: sender must be an admin to grant");

  //     _grantRole(role, account);
  // }

  /**
    * @dev Revokes `role` from `account`.
    *
    * If `account` had been granted `role`, emits a {RoleRevoked} event.
    *
    * Requirements:
    *
    * - the caller must have ``role``'s admin role.
    */
  // function revokeRole(bytes32 role, address account) public virtual {
  //     require(hasRole(_roles[role].adminRole, _msgSender()), "AccessControl: sender must be an admin to revoke");

  //     revokeRole(role, account);
  // }

  /**
    * @dev Revokes `role` from the calling account.
    *
    * Roles are often managed via {grantRole} and {revokeRole}: this function's
    * purpose is to provide a mechanism for accounts to lose their privileges
    * if they are compromised (such as when a trusted device is misplaced).
    *
    * If the calling account had been granted `role`, emits a {RoleRevoked}
    * event.
    *
    * Requirements:
    *
    * - the caller must be `account`.
    */
  // function renounceRole(bytes32 role, address account) public virtual {
  //     require(account == _msgSender(), "AccessControl: can only renounce roles for self");

  //     revokeRole(role, account);
  // }

  /**
    * @dev Grants `role` to `account`.
    *
    * If `account` had not been already granted `role`, emits a {RoleGranted}
    * event. Note that unlike {grantRole}, this function doesn't perform any
    * checks on the calling account.
    *
    * [WARNING]
    * ====
    * This function should only be called from the constructor when setting
    * up the initial roles for the system.
    *
    * Using this function in any other way is effectively circumventing the admin
    * system imposed by {AccessControl}.
    * ====
    */
  function setupRole(UserLib.UserContext storage userContext, bytes32 role, address account) internal {
      grantRole(userContext, role, account);
  }

  function revokeRole(UserLib.UserContext storage userContext, bytes32 role, address account) internal {
    if (userContext.roles._roles[role].members.remove(account)) {
      emit RoleRevoked(role, account, msg.sender);

      uint256 length = userContext.userRoles.userRoles[account].length;
      for(uint32 i = 0; i < length; i++) {
        if(userContext.userRoles.userRoles[account][i] == role) {
          if (i < length - 1) {
            userContext.userRoles.userRoles[account][i] = userContext.userRoles.userRoles[account][length - 1];
            userContext.userRoles.userRoles[account].pop();
          } else userContext.userRoles.userRoles[account].pop();
        }
      }
    }
  }

  function getPermissions(UserRoles storage self, address account) internal view returns (bytes32[] memory) {
    return self.userRoles[account];
  }

  function grantRole(UserLib.UserContext storage userContext, bytes32 role, address account) internal {
    if (userContext.roles._roles[role].members.add(account)) {
      userContext.userRoles.userRoles[account].push(role);   
      emit RoleGranted(role, account, msg.sender);
    }
  }

  function onlyCommunityModerator(Roles storage self, uint32 communityId) internal {
    require((hasRole(self, getCommunityRole(COMMUNITY_MODERATOR_ROLE, communityId), msg.sender)), 
        "not_allowed_not_moderator");
  }

    function onlyCommunityAdmin(Roles storage self, uint32 communityId) internal {
    require((hasRole(self, getCommunityRole(COMMUNITY_ADMIN_ROLE, communityId), msg.sender)), 
        "not_allowed_not_comm_admin");
  }

  function onlyAdminOrCommunityAdmin(Roles storage self, uint32 communityId) internal {
    require(hasRole(self, DEFAULT_ADMIN_ROLE, msg.sender) || 
        (hasRole(self, getCommunityRole(COMMUNITY_ADMIN_ROLE, communityId), msg.sender)), 
        "not_allowed_admin_or_comm_admin");
  }

  function onlyAdminOrCommunityModerator(Roles storage self, uint32 communityId) internal {
    require(hasRole(self, DEFAULT_ADMIN_ROLE, msg.sender) ||
        (hasRole(self, getCommunityRole(COMMUNITY_MODERATOR_ROLE, communityId), msg.sender)), 
        "not_allowed_admin_or_comm_admin");
  }

  function onlyAdmin(Roles storage self) internal {
    require(hasRole(self, DEFAULT_ADMIN_ROLE, msg.sender), 
        "not_allowed_not_admin");
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