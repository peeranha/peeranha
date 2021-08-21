pragma solidity >=0.5.0;

import "./PostLib.sol";
import "./IpfsLib.sol";

/// @title Users
/// @notice Provides information about registered user
/// @dev Users information is stored in the mapping on the main contract
library UserLib {
  struct User {
    IpfsLib.IpfsHash ipfsDoc;
    int32 rating;
    uint32 timeCreate;
  }
  
  struct UserCollection {
    mapping(address => User) users;
    address[] userList;
  }
  
  event UserCreated(address userAddress, bytes32 ipfsHash, bytes32 ipfsHash2);
  event UserUpdated(address userAddress, bytes32 ipfsHash, bytes32 ipfsHash2);

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
    user.timeCreate = CommonLib.getTimestamp();

    self.userList.push(userAddress);
    emit UserCreated(userAddress, ipfsHash, bytes32(0x0));
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
    emit UserUpdated(userAddress, ipfsHash, bytes32(0x0));
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

  /// @notice Add rating to user
  /// @param self The mapping containing all users
  /// @param addr user's rating will be change
  /// @param rating value for add to user's rating
  function updateRating(UserCollection storage self, address addr, int rating) internal {
    User storage user = getUserByAddress(self, addr);
    user.rating += int32(rating);
  }

  function updateUsersRating(UserCollection storage self, PostLib.ChangeUserRating[] memory usersRating) internal {
    for (uint i; i < usersRating.length; i++) {
      updateUserRating(self, usersRating[i].user, usersRating[i].rating);
    }
  }

  function updateUserRating(UserCollection storage self, address userAdrr, int8 rating) internal {
    if (rating == 0) return;
    User storage user = getUserByAddress(self, userAdrr);
    user.rating += rating;
  }
}