pragma solidity >=0.5.0;

/// @title Communities
/// @notice Provides information about created communities
/// @dev Community information is stored in the mapping on the main contract
library Community {
    struct Info {
        bytes32 ipfsHash;
    }

    struct Collection {
        mapping(uint => Info) communities;
        uint[] communityList;
    }

    event CommunityCreated(uint communityAddress, bytes32 ipfsHash);
    event CommunityUpdated(uint communityAddress, bytes32 ipfsHash);

    /// @notice Create new community info record
    /// @param self The mapping containing all communities
    /// @param communityId Id of the community to create
    /// @param ipfsHash IPFS hash of document with community information
    function create(
        Collection storage self,
        uint communityId,
        bytes32 ipfsHash
    ) internal {
        require(self.communities[communityId].ipfsHash == bytes32(0x0), "Community exists");
        self.communities[communityId].ipfsHash = ipfsHash;
        self.communityList.push(communityId);
        emit CommunityCreated(communityId, ipfsHash);
    }

    /// @notice Update community info record
    /// @param self The mapping containing all communities
    /// @param communityId Address of the community to update
    /// @param ipfsHash IPFS hash of document with user information
    function update(
        Collection storage self,
        uint communityId,
        bytes32 ipfsHash
    ) internal {
        require(self.communities[communityId].ipfsHash != bytes32(0x0), "Community does not exist");
        self.communities[communityId].ipfsHash = ipfsHash;
        emit CommunityUpdated(communityId, ipfsHash);
    }

    /// @notice Get the number of communities
    /// @param self The mapping containing all communities
    function getCommunitiesCount(
        Collection storage self
    ) internal view returns (uint count) {
        return self.communityList.length;
    }

    /// @notice Get community info by id
    /// @param self The mapping containing all communities
    /// @param communityId Address of the community to get
    function getCommunityById(
        Collection storage self,
        uint communityId
    ) internal view returns (Info memory) {
        return self.communities[communityId];
    }
}