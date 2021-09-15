// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;
// pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/utils/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";

import "./CommunityLib.sol";
import "./UserLib.sol";
// import "./CommonLib.sol";


library SecurityLib {
  enum Action {
    publicationPost,
    publicationReply,
    publicationComment,
    deleteItem,
    upVotePost,
    downVotePost,
    upVoteReply,
    downVoteReply,
    upVoteComment,
    downVoteComment,
    officialReply
  }
  
  int16 constant POST_QUESTION_ALLOWED = 0;
  int16 constant POST_REPLY_ALLOWED = 0;
  int16 constant POST_OWN_COMMENT_ALLOWED = 35;
  int16 constant POST_COMMENT_ALLOWED = 35;

  int16 constant UPVOTE_POST_ALLOWED = 35;
  int16 constant DOWNVOTE_POST_ALLOWED = 100;
  int16 constant UPVOTE_REPLY_ALLOWED = 35;
  int16 constant DOWNVOTE_REPLY_ALLOWED = 100;
  int16 constant UPVOTE_COMMENT_ALLOWED = 0;
  int16 constant DOWNVOTE_COMMENT_ALLOWED = 0;

  using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;
  using AddressUpgradeable for address;

  struct RoleData {
    EnumerableSetUpgradeable.AddressSet members;
    bytes32 adminRole;
  }

  struct Roles {
    mapping (bytes32 => RoleData) _roles;
  }

  bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
  uint256 public constant COMMUNITY_ADMIN_ROLE = uint256(keccak256("COMMUNITY_ADMIN_ROLE"));
  uint256 public constant COMMUNITY_MODERATOR_ROLE = uint256(keccak256("COMMUNITY_MODERATOR_ROLE"));


  using UserLib for UserLib.UserCollection;
  using UserLib for UserLib.User;
  using CommunityLib for CommunityLib.CommunityCollection;
  using CommunityLib for CommunityLib.Community;

  modifier onlyExisitingUser(UserLib.UserCollection storage users, address user) {    ///
    require(users.isExists(user),
    "Peeranha: must be an existing user");
    _;
  } 

  function getCommunityRole(uint256 role, uint32 communityId) internal pure returns (bytes32) {
    return bytes32(role + communityId);
  }


//   modifier onlyExistingAndNotFrozenCommunity(CommunityLib.CommunityCollection storage communities, uint32 communityId) {
//     require(communities.getCommunitiesCount() >= communityId, "Peeranha: must be an existing community");
//     _;
//   }

  function checkRatingAndCommunityModerator(
  Roles storage self, 
  UserLib.UserCollection storage users, 
  address actionCaller,
  address dataUser,
  uint32 communityId, 
  Action action) internal {
    // if ((hasRole(self, getCommunityRole(COMMUNITY_MODERATOR_ROLE, communityId), msg.sender) || 
    //   hasRole(self, DEFAULT_ADMIN_ROLE, msg.sender))) return;
    
    // int16 ratingAllowen;
    // string memory message;
    // if (action == Action.publicationPost) {
    //   ratingAllowen = POST_QUESTION_ALLOWED;
    //   message = "Your rating is too small to upvote. You need 0 ratings";

    // } else if (action == Action.publicationReply) {
    //   ratingAllowen = POST_REPLY_ALLOWED;
    //   message = "Your rating is too small to upvote. You need 0 ratings";

    // } else if (action == Action.publicationComment) {
    //   if (actionCaller == dataUser) {
    //     ratingAllowen = POST_OWN_COMMENT_ALLOWED;
    //     message = "Your rating is too small to upvote. You need 0 ratings";
    //   } else {
    //     ratingAllowen = POST_COMMENT_ALLOWED;
    //     message = "Your rating is too small to upvote. You need 35 ratings";
    //   }

    // } else if (action == Action.deleteItem) {
    //   require(actionCaller == dataUser, "You can not delete this item");
    //   return;

    // } else if (action == Action.upVotePost) {
    //   require(actionCaller != dataUser, "You can not vote for own post");
    //   ratingAllowen = UPVOTE_POST_ALLOWED;
    //   message = "Your rating is too small to upvote. You need 35 ratings";

    // } else if (action == Action.upVoteReply) {
    //   require(actionCaller != dataUser, "You can not vote for own reply");
    //   ratingAllowen = UPVOTE_REPLY_ALLOWED;
    //   message = "Your rating is too small to upvote. You need 35 ratings";

    // } else if (action == Action.upVoteComment) {
    //   require(actionCaller != dataUser, "You can not vote for own comment");
    //   ratingAllowen = UPVOTE_COMMENT_ALLOWED;
    //   message = "Your rating is too small to upvote. You need 0 ratings";

    // } else if (action == Action.downVotePost) {
    //   require(actionCaller != dataUser, "You can not vote for own post");
    //   ratingAllowen = DOWNVOTE_POST_ALLOWED;
    //   message = "Your rating is too small to upvote. You need 35 ratings";

    // } else if (action == Action.downVoteReply) {
    //   require(actionCaller != dataUser, "You can not vote for own reply");
    //   ratingAllowen = DOWNVOTE_REPLY_ALLOWED;
    //   message = "Your rating is too small to upvote. You need 35 ratings";

    // } else if (action == Action.downVoteComment) {
    //   require(actionCaller != dataUser, "You can not vote for own comment");
    //   ratingAllowen = DOWNVOTE_COMMENT_ALLOWED;
    //   message = "Your rating is too small to upvote. You need 0 ratings";

    // } else {
    //   require(false, "Action not allowed");
    // }

    // int32 userRating = UserLib.getUserByAddress(users, actionCaller).rating;
    // require(userRating <= ratingAllowen, message);    // >=
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
     * bearer except when using {_setupRole}.
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
    function getRoleMember(Roles storage self, bytes32 role, uint256 index) public view returns (address) {
        return self._roles[role].members.at(index);
    }

    /**
     * @dev Returns the admin role that controls `role`. See {grantRole} and
     * {revokeRole}.
     *
     * To change a role's admin, use {_setRoleAdmin}.
     */
    function getRoleAdmin(Roles storage self, bytes32 role) public view returns (bytes32) {
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

    //     _revokeRole(role, account);
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

    //     _revokeRole(role, account);
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
    function _setupRole(Roles storage self, bytes32 role, address account) internal { //virtual?
        _grantRole(self, role, account);
    }

    /**
     * @dev Sets `adminRole` as ``role``'s admin role.
     *
     * Emits a {RoleAdminChanged} event.
     */
    // function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal virtual {
    //     emit RoleAdminChanged(role, _roles[role].adminRole, adminRole);
    //     _roles[role].adminRole = adminRole;
    // }

    function _grantRole(Roles storage self, bytes32 role, address account) private {
        if (self._roles[role].members.add(account)) {
            emit RoleGranted(role, account, msg.sender);                            //_msgSender()?
        }
    }

    function _revokeRole(Roles storage self, bytes32 role, address account) internal {
        if (self._roles[role].members.remove(account)) {
            emit RoleRevoked(role, account, msg.sender);
        }
    }
    // uint256[49] private __gap;
}