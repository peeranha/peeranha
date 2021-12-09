pragma solidity >=0.5.0;

import "./UserLib.sol";
import "./SecurityLib.sol";

import "@openzeppelin/contracts-upgradeable/utils/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

library SecurityLibPublic {
  using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;
  using AddressUpgradeable for address;

  /**
    * @dev Emitted when `newAdminRole` is set as ``role``'s admin role, replacing `previousAdminRole`
    *
    * `DEFAULT_ADMIN_ROLE` is the starting admin for all roles, despite
    * {RoleAdminChanged} not being emitted signaling this.
    *
    * _Available since v3.1._
    */
  // event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole); // need?

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

  function setupRole(UserLib.UserContext storage userContext, bytes32 role, address account) public { // in main contract?
    grantRole(userContext, role, account);
  }

  function revokeRole(UserLib.UserContext storage userContext, bytes32 role, address account) public {
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

  function grantRole(UserLib.UserContext storage userContext, bytes32 role, address account) public {
    if (userContext.roles._roles[role].members.add(account)) {
      userContext.userRoles.userRoles[account].push(role);   
      emit RoleGranted(role, account, msg.sender);
    }
  }
}
