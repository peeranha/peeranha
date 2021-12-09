// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

import "./UserLib.sol";
import "./CommonLib.sol";

import "@openzeppelin/contracts-upgradeable/utils/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

library SecurityLib {
  enum Action {
    publicationPost,
    publicationReply,
    publicationComment,
    editItem,
    deleteItem,
    upVotePost,
    downVotePost,
    upVoteReply,
    downVoteReply,
    upVoteComment,
    downVoteComment,
    officialReply,
    bestReply,
    updateProfile,
    followCommunity
  }
  
  int16 constant MINIMUM_RATING = -300;
  int16 constant POST_QUESTION_ALLOWED = 0;
  int16 constant POST_REPLY_ALLOWED = 0;
  int16 constant POST_OWN_COMMENT_ALLOWED = 35;
  int16 constant POST_COMMENT_ALLOWED = 35;

  int16 constant UPVOTE_POST_REPLY_ALLOWED = 35;
  int16 constant DOWNVOTE_POST_REPLY_ALLOWED = 100;
  // int16 constant UPVOTE_REPLY_ALLOWED = 35;
  // int16 constant DOWNVOTE_REPLY_ALLOWED = 100;
  int16 constant UPVOTE_COMMENT_ALLOWED = 0;
  int16 constant DOWNVOTE_COMMENT_ALLOWED = 0;

  int16 constant UPDATE_PROFILE_ALLOWED = 0;


  uint8 constant ENERGY_DOWNVOTE_QUESTION_REPLY = 5;
  // uint8 constant ENERGY_DOWNVOTE_ANSWER = 3;
  uint8 constant ENERGY_DOWNVOTE_COMMENT = 2;
  uint8 constant ENERGY_UPVOTE_QUESTION_REPLY = 1;
  uint8 constant ENERGY_UPVOTE_ANSWER = 1;
  uint8 constant ENERGY_UPVOTE_COMMENT = 1;
  // uint8 constant ENERGY_FORUM_VOTE_CHANGE = 1;    ///
  uint8 constant ENERGY_POST_QUESTION = 10;
  uint8 constant ENERGY_POST_ANSWER = 6;
  uint8 constant ENERGY_POST_COMMENT = 4;
  uint8 constant ENERGY_MODIFY_ITEM = 2;
  uint8 constant ENERGY_DELETE_ITEM = 2;

  uint8 constant ENERGY_MARK_REPLY_AS_CORRECT = 1;
  uint8 constant ENERGY_UPDATE_PROFILE = 1;
  // uint8 constant ENERGY_CREATE_TAG = 75;            // only Admin
  // uint8 constant ENERGY_CREATE_COMMUNITY = 125;     // only admin
  uint8 constant ENERGY_FOLLOW_COMMUNITY = 1;
  // uint8 constant ENERGY_REPORT_PROFILE = 5;         //
  // uint8 constant ENERGY_REPORT_QUESTION = 3;        //
  // uint8 constant ENERGY_REPORT_ANSWER = 2;          //
  // uint8 constant ENERGY_REPORT_COMMENT = 1;         //

  using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;
  using AddressUpgradeable for address;

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

  bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
  uint256 public constant COMMUNITY_ADMIN_ROLE = uint256(keccak256("COMMUNITY_ADMIN_ROLE"));
  uint256 public constant COMMUNITY_MODERATOR_ROLE = uint256(keccak256("COMMUNITY_MODERATOR_ROLE"));

  function getCommunityRole(uint256 role, uint32 communityId) internal pure returns (bytes32) {
    return bytes32(role + communityId);
  }

  function checkRatingAndEnergy(
    Roles storage role,
    UserLib.User storage user,
    address actionCaller,
    address dataUser,
    uint32 communityId,
    Action action
  )
    internal
  {
    if (hasModeratorRole(role, actionCaller, communityId)) return;
    
    int16 ratingAllowen;
    uint8 energy;
    bool checkAuthor = true;
    if (action == Action.publicationPost) {
      ratingAllowen = POST_QUESTION_ALLOWED;
      energy = ENERGY_POST_QUESTION;

    } else if (action == Action.publicationReply) {
      ratingAllowen = POST_REPLY_ALLOWED;
      energy = ENERGY_POST_ANSWER;

    } else if (action == Action.publicationComment) {
      if (actionCaller == dataUser) {
        ratingAllowen = POST_OWN_COMMENT_ALLOWED;
      } else {
        ratingAllowen = POST_COMMENT_ALLOWED;
      }
      energy = ENERGY_POST_COMMENT;

    } else if (action == Action.editItem) {
      checkAuthor = actionCaller == dataUser;
      ratingAllowen = MINIMUM_RATING;
      energy = ENERGY_MODIFY_ITEM;

    } else if (action == Action.deleteItem) {
      checkAuthor = actionCaller == dataUser;
      ratingAllowen = 0;
      energy = ENERGY_DELETE_ITEM;

    } else if (action == Action.upVotePost) {
      checkAuthor = actionCaller != dataUser;
      ratingAllowen = UPVOTE_POST_REPLY_ALLOWED;
      energy = ENERGY_UPVOTE_QUESTION_REPLY;

    } else if (action == Action.upVoteComment) {
      checkAuthor = actionCaller != dataUser;
      ratingAllowen = UPVOTE_COMMENT_ALLOWED;
      energy = ENERGY_UPVOTE_COMMENT;

    } else if (action == Action.downVotePost) {
      checkAuthor = actionCaller != dataUser;
      ratingAllowen = DOWNVOTE_POST_REPLY_ALLOWED;
      energy = ENERGY_DOWNVOTE_QUESTION_REPLY;

    } else if (action == Action.downVoteComment) {
      checkAuthor = actionCaller != dataUser;
      ratingAllowen = DOWNVOTE_COMMENT_ALLOWED;
      energy = ENERGY_DOWNVOTE_COMMENT;

    } else if (action == Action.bestReply) {
      checkAuthor = actionCaller == dataUser;
      ratingAllowen = MINIMUM_RATING;
      energy = ENERGY_MARK_REPLY_AS_CORRECT;

    } else if (action == Action.updateProfile) {
      ratingAllowen = UPDATE_PROFILE_ALLOWED;
      energy = ENERGY_UPDATE_PROFILE;

    } else if (action == Action.followCommunity) {
      ratingAllowen = MINIMUM_RATING;
      energy = ENERGY_FOLLOW_COMMUNITY;

    } else {
      require(false, "S6");
    }

    require(checkAuthor, "S7");
    require(user.rating >= ratingAllowen);
    reduceEnergy(user, energy);
  }

  function reduceEnergy(UserLib.User storage user, uint8 energy) internal {    
    uint256 currentTime = CommonLib.getTimestamp();
    uint32 currentPeriod = uint32((currentTime - user.creationTime) / UserLib.ACCOUNT_STAT_RESET_PERIOD);
    uint32 periodsHavePassed = currentPeriod - user.lastUpdatePeriod;

    uint16 userEnergy;
    if (periodsHavePassed == 0) {
      userEnergy = user.energy;
    } else {
      userEnergy = UserLib.getStatusEnergy(user.rating); 
    }

    require(userEnergy >= energy, "A3");
    user.energy = userEnergy - energy;
    user.lastUpdatePeriod = currentPeriod;
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

  function getPermissions(UserRoles storage self, address account) internal view returns (bytes32[] memory) {
    return self.userRoles[account];
  }

  function onlyCommunityModerator(Roles storage self, uint32 communityId) internal {
    require((hasRole(self, getCommunityRole(COMMUNITY_MODERATOR_ROLE, communityId), msg.sender)), 
        "S1");
  }

  function onlyCommunityAdmin(Roles storage self, uint32 communityId) internal {
    require((hasRole(self, getCommunityRole(COMMUNITY_ADMIN_ROLE, communityId), msg.sender)), 
        "S2");
  }

  function onlyAdminOrCommunityAdmin(Roles storage self, uint32 communityId) internal {
    require(hasRole(self, DEFAULT_ADMIN_ROLE, msg.sender) || 
        (hasRole(self, getCommunityRole(COMMUNITY_ADMIN_ROLE, communityId), msg.sender)), 
        "S3");
  }

  function onlyAdminOrCommunityModerator(Roles storage self, uint32 communityId) internal {
    require(hasRole(self, DEFAULT_ADMIN_ROLE, msg.sender) ||
        (hasRole(self, getCommunityRole(COMMUNITY_MODERATOR_ROLE, communityId), msg.sender)), 
        "S4");
  }

  function onlyAdmin(Roles storage self) internal {
    require(hasRole(self, DEFAULT_ADMIN_ROLE, msg.sender), 
        "S5");
  }

  // uint256[49] private __gap;
}
