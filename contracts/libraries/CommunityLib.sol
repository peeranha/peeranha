pragma solidity >=0.5.0;
pragma abicoder v2;

/// @title Communities
/// @notice Provides information about created communities
/// @dev Community information is stored in the mapping on the main contract
library CommunityLib {
    struct Community {
        bytes32 ipfsHash;
        bytes32 ipfsHash2;
    }

    struct Tag {
        bytes32 ipfsHash;
        bytes32 ipfsHash2;
    }

    struct CommunityContainer {
        Community info;
        mapping(uint256 => Tag) tags;
        uint8 tagsCount;
        bool isFrozen;
    }

    struct CommunityCollection {
        mapping(uint256 => CommunityContainer) communities;
        uint32 communityCount;
    }

    modifier onlyExistingAndNotFrozen(CommunityCollection storage self, uint32 id){
        require(
            self.communities[id].info.ipfsHash != bytes32(0x0),
            "Community does not exist"
        );
        require(!self.communities[id].isFrozen,
            "Community is frozen"
        );
        _;
    }

    event CommunityCreated(uint256 id, bytes32 ipfsHash, bytes32 ipfsHash2, Tag[] tags);
    event CommunityUpdated(uint256 id, bytes32 ipfsHash);
    event TagCreated(uint256 communityId, uint256 tagId, bytes32 ipfsHash, bytes32 ipfsHash2);
    event CommunityFrozen(uint256 commintyId);
    event CommunityUnfrozen(uint256 commintyId);

    /// @notice Create new community info record
    /// @param self The mapping containing all communities
    /// @param id Id of the community to create
    /// @param ipfsHash IPFS hash of document with community information
    function createCommunity(
        CommunityCollection storage self,
        uint32 id,
        bytes32 ipfsHash,
        Tag[] memory tags
    ) internal {
        require(
            self.communities[id].info.ipfsHash == bytes32(0x0),
            "Community exists"
        );
        require(
            tags.length >= 5, 
            "Require at least 5 tags"
        );
        for(uint256 i = 0; i < tags.length; i++){
            for(uint256 j = 0; j < tags.length; j++){
                if (i != j){
                    require(
                        tags[i].ipfsHash != tags[j].ipfsHash,
                        "Require tags with unique names"
                    );
                }
            }
        }
        CommunityContainer storage community = self.communities[id];
        community.info.ipfsHash = ipfsHash;
        community.tagsCount = uint8(tags.length);
        community.isFrozen = false;
        for (uint256 i = 1; i <= uint256(tags.length); i++) {
            community.tags[i] = tags[i - 1];
        }
        self.communityCount++;
        emit CommunityCreated(id, ipfsHash, bytes32(0x0), tags);
    }

    /// @notice Update community info record
    /// @param self The mapping containing all communities
    /// @param communityId Address of the community to update
    /// @param ipfsHash IPFS hash of document with user information
    function updateCommunity (
        CommunityCollection storage self,
        uint32 communityId,
        bytes32 ipfsHash
    ) internal onlyExistingAndNotFrozen(self, communityId) {
        self.communities[communityId].info.ipfsHash = ipfsHash;
        emit CommunityUpdated(communityId, ipfsHash);
    }

    /// @notice Create new tag info record
    /// @param self The mapping containing all communities
    /// @param communityId Id of the community in which tag is creating
    /// @param tagId Id of the tag to create
    /// @param ipfsHash IPFS hash of document with community information
    function createTag (
        CommunityCollection storage self, 
        uint32 communityId,
        uint256 tagId,
        bytes32 ipfsHash
    ) internal onlyExistingAndNotFrozen(self, communityId) {
        CommunityContainer storage community = self.communities[communityId];
        Tag storage newTag = community.tags[tagId];
        require(newTag.ipfsHash == bytes32(0x0), "Tag exists");
        newTag.ipfsHash = ipfsHash;
        community.tagsCount++;
        emit TagCreated(tagId, communityId, ipfsHash, bytes32(0x0));
    }

    /// @notice Get the number of communities
    /// @param self The mapping containing all communities
    function getCommunitiesCount(CommunityCollection storage self)
        internal
        view
        returns (uint32 count)
    {
        return self.communityCount;
    }

    /// @notice Get community info by id
    /// @param self The mapping containing all communities
    /// @param communityId Address of the community to get
    function getCommunity(CommunityCollection storage self, uint32 communityId)
        internal
        view
        onlyExistingAndNotFrozen(self, communityId) 
        returns (Community memory)
    {
        return self.communities[communityId].info;
    }

    /// @notice Get the number of tags in community
    /// @param self The mapping containing all communities
    /// @param communityId Address of the community to get tags count
    function getTagsCount(CommunityCollection storage self, uint32 communityId)
        internal
        view
        onlyExistingAndNotFrozen(self, communityId) 
        returns (uint8 count) 
    {
        return self.communities[communityId].tagsCount;
    }

    /// @notice Get list of tags in community
    /// @param self The mapping containing all communities
    /// @param communityId Address of the community to get tags
    function getTags(CommunityCollection storage self, uint32 communityId)
        internal
        view
        onlyExistingAndNotFrozen(self, communityId)
        returns (Tag[] memory)
    {
        CommunityContainer storage community = self.communities[communityId];
        Tag[] memory iterableTags = new Tag[](community.tagsCount);
        for (uint8 i = 1; i <= community.tagsCount; i++) {
            iterableTags[i - 1] = community.tags[i];
        }
        return iterableTags;
    }

    /// @notice Freeze the community
    /// @param self The mapping containing all communities
    /// @param communityId Address of the community to freeze
    function freeze(CommunityCollection storage self, uint32 communityId) 
    internal onlyExistingAndNotFrozen(self, communityId) {
        self.communities[communityId].isFrozen = true;
        emit CommunityFrozen(communityId);
    }

    /// @notice Unfreeze the community
    /// @param self The mapping containing all communities
    /// @param communityId Address of the community to unfreeze
    function unfreeze(CommunityCollection storage self, uint32 communityId) internal {
        require(
            self.communities[communityId].info.ipfsHash != bytes32(0x0),
            "Community does not exist"
        );
        self.communities[communityId].isFrozen = false;
        emit CommunityUnfrozen(communityId);
    }
}
