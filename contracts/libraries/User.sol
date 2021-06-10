pragma solidity >=0.5.0;

/// @title Users
/// @notice Provides information about registered user
/// @dev Users information is stored in the mapping on the main contract
library User {
  struct Info {
    bytes32 ipfsHash;
    bytes32 ipfsHash2; // Not currently used and added for the future compatibility
  }
  
  struct Collection {
    mapping(address => Info) users;
    address[] userList;
  }
  
  event UserCreated(address userAddress, bytes32 ipfsHash, bytes32 ipfsHash2);
  event UserUpdated(address userAddress, bytes32 ipfsHash, bytes32 ipfsHash2);

  /// @notice Create new user info record
  /// @param self The mapping containing all users
  /// @param userAddress Address of the user to create
  /// @param ipfsHash IPFS hash of document with user information
  function create(
    Collection storage self,
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
    Collection storage self,
    address userAddress,
    bytes32 ipfsHash
  ) internal {
    require(self.users[userAddress].ipfsHash != bytes32(0x0), "User does not exist");
    self.users[userAddress].ipfsHash = ipfsHash;
    emit UserUpdated(userAddress, ipfsHash, bytes32(0x0));
  }

  /// @notice Get the number of users
  /// @param self The mapping containing all users
  function getUsersCount(Collection storage self) internal view returns (uint256 count) {
    return self.userList.length;
  }

  /// @notice Get user info by index
  /// @param self The mapping containing all users
  /// @param index Index of the user to get
  function getUserByIndex(Collection storage self, uint256 index) internal view returns (Info memory) {
    address addr = self.userList[index];
    return self.users[addr];
  }

  /// @notice Get user info by address
  /// @param self The mapping containing all users
  /// @param addr Address of the user to get
  function getUserByAddress(Collection storage self, address addr) internal view returns (Info memory) {
    Info storage user = self.users[addr];
    require(user.ipfsHash != bytes32(0x0), "User does not exist");
    return user;
  }
}