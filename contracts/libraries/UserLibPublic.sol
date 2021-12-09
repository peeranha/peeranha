pragma abicoder v2;
pragma solidity >=0.5.0;

import "./UserLib.sol";
import "./CommonLib.sol";
import "./SecurityLib.sol";

/// @title Users
/// @notice Provides information about registered user
/// @dev Users information is stored in the mapping on the main contract
library UserLibPublic {
  int32 constant START_USER_RATING = 10;
  uint256 constant ACCOUNT_STAT_RESET_PERIOD = 14; // 259200 - 3 Days

  event UserCreated(address userAddress);
  event UserUpdated(address userAddress);
  event FollowedCommunity(address userAddress, uint32 communityId);
  event UnfollowedCommunity(address userAddress, uint32 communityId);


  /// @notice Create new user info record
  /// @param self The mapping containing all users
  /// @param userAddress Address of the user to create 
  /// @param ipfsHash IPFS hash of document with user information
  function create(
    UserLib.UserCollection storage self,
    address userAddress,
    bytes32 ipfsHash
  ) public {
    require(self.users[userAddress].ipfsDoc.hash == bytes32(0x0), "User exists");

    UserLib.User storage user = self.users[userAddress];
    user.ipfsDoc.hash = ipfsHash;
    user.creationTime = CommonLib.getTimestamp();
    user.rating = START_USER_RATING;
    user.payOutRating = START_USER_RATING;
    user.energy = UserLib.getStatusEnergy(START_USER_RATING);

    self.userList.push(userAddress);

    emit UserCreated(userAddress);
  }

  /// @notice Update new user info record
  /// @param userContext All information about users
  /// @param userAddress Address of the user to update
  /// @param ipfsHash IPFS hash of document with user information
  function update(
    UserLib.UserContext storage userContext,
    address userAddress,
    bytes32 ipfsHash
  ) public {
    UserLib.User storage user = UserLib.getUserByAddress(userContext.users, userAddress);
    SecurityLib.checkRatingAndEnergy(
      userContext.roles,
      user,
      userAddress,
      userAddress,
      0,
      SecurityLib.Action.updateProfile
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
  ) public {
    UserLib.User storage user = UserLib.getUserByAddress(userContext.users, userAddress);
    SecurityLib.checkRatingAndEnergy(
      userContext.roles,
      user,
      userAddress,
      userAddress,
      0,
      SecurityLib.Action.followCommunity
    );

    bool isAdded;
    for (uint i; i < user.followedCommunities.length; i++) {
      require(user.followedCommunities[i] != communityId, "You already follow the community");

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
    UserLib.UserCollection storage users,
    address userAddress,
    uint32 communityId
  ) public {
    UserLib.User storage user = UserLib.getUserByAddress(users, userAddress);

    for (uint i; i < user.followedCommunities.length; i++) {
      if (user.followedCommunities[i] == communityId) {
        delete user.followedCommunities[i]; //method rewrite to 0
        
        emit UnfollowedCommunity(userAddress, communityId);
        return;
      }
    }
    require(false, "You are not following the community");
  }
}