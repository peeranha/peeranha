pragma solidity >=0.5.0;

/// @title Users
/// @notice Provides information about registered user
/// @dev Users information is stored in the mapping on the main contract
library User {
  struct Info {
    bytes32 ipfsHash;
  }
  
  struct Collection {
    mapping(address => Info) users;
    address[] userList;
  }
  
  event UserCreated(address userAddress, bytes32 ipfsHash);
  event UserUpdated(address userAddress, bytes32 ipfsHash);

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
    emit UserCreated(userAddress, ipfsHash);
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
    emit UserUpdated(userAddress, ipfsHash);
  }
}