pragma solidity >=0.5.0;

/// @title Users
/// @notice Provides information about registered user
/// @dev Users information is stored in the mapping on the main contract
library UserLib {
  struct User {
    bytes32 ipfsHash;
    bytes32 ipfsHash2; // Not currently used and added for the future compatibility
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
    require(self.users[userAddress].ipfsHash == bytes32(0x0), "User exists");
    self.users[userAddress].ipfsHash = ipfsHash;
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
    require(self.users[userAddress].ipfsHash != bytes32(0x0), "User does not exist");
    self.users[userAddress].ipfsHash = ipfsHash;
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
  function getUserByIndex(UserCollection storage self, uint256 index) internal view returns (User memory) {
    address addr = self.userList[index];
    return self.users[addr];
  }

  /// @notice Get user info by address
  /// @param self The mapping containing all users
  /// @param addr Address of the user to get
  function getUserByAddress(UserCollection storage self, address addr) internal view returns (User memory) {
    User storage user = self.users[addr];
    require(user.ipfsHash != bytes32(0x0), "User does not exist");
    return user;
  }

  /// @notice Check user existence
  /// @param self The mapping containing all users
  /// @param addr Address of the user to check
  function isExists(UserCollection storage self, address addr) internal view returns (bool) {
    return self.users[addr].ipfsHash != bytes32(0x0);
  }

  /// @notice Add rating to user
  /// @param self The mapping containing all users
  /// @param user user's rating will be change
  /// @param rating value for add to user's rating
  function updateRating(UserCollection storage self, address user, int256 rating) internal {
    ///
    // will add content
    ///
  }
}