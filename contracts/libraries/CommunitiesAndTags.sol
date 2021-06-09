pragma solidity >=0.5.0;
pragma abicoder v2;


/// @title Communities
/// @notice Provides information about created communities
/// @dev Community information is stored in the mapping on the main contract
library CommunitiesAndTags {
    struct CommunityInfo {
        bytes32 ipfsHash;
    }

    struct TagInfo {
        bytes32 ipfsHash;
    }

    struct Community {
        CommunityInfo info;
        mapping(uint32 => TagInfo) tagList;
        uint32 tagsCount;
    }

    struct CommunityCollection {
        mapping(uint32 => Community) communities;
        uint32 communityCount;
    }

    event CommunityCreated(uint32 id, bytes32 ipfsHash, TagInfo[] suggestedTags);
    event CommunityUpdated(uint32 id, bytes32 ipfsHash);
    event TagCreated(uint32 communityId, uint32 tagId, bytes32 ipfsHash);

    /// @notice Create new community info record
    /// @param self The mapping containing all communities
    /// @param id Id of the community to create
    /// @param ipfsHash IPFS hash of document with community information
    function createCommunity(
        CommunityCollection storage self,
        uint32 id,
        bytes32 ipfsHash,
        TagInfo[] memory suggestedTags
    ) internal {
        require(
            self.communities[id].info.ipfsHash == bytes32(0x0),
            "Community exists"
        );

        Community storage community = self.communities[id];
        community.info.ipfsHash = ipfsHash;
        community.tagsCount = uint32(suggestedTags.length);
        for (uint32 i = 1; i <= uint32(suggestedTags.length); i++) {
            community.tagList[i] = suggestedTags[i - 1];
        }
        self.communityCount++;
        emit CommunityCreated(id, ipfsHash, suggestedTags);
    }

    /// @notice Update community info record
    /// @param self The mapping containing all communities
    /// @param id Address of the community to update
    /// @param ipfsHash IPFS hash of document with user information
    function updateCommunity(
        CommunityCollection storage self,
        uint32 id,
        bytes32 ipfsHash
    ) internal {
        require(
            self.communities[id].info.ipfsHash != bytes32(0x0),
            "Community does not exist"
        );
        self.communities[id].info.ipfsHash = ipfsHash;
        emit CommunityUpdated(id, ipfsHash);
    }

    /// @notice Create new tag info record
    /// @param self The mapping containing all communities
    /// @param communityId Id of the community in which tag is creating
    /// @param tagId Id of the tag to create
    /// @param ipfsHash IPFS hash of document with community information
    function createTag (
        CommunityCollection storage self, 
        uint32 communityId,
        uint32 tagId,
        bytes32 ipfsHash
    ) internal {
        Community storage community = self.communities[communityId];
        TagInfo storage newTag = community.tagList[tagId];
        require(newTag.ipfsHash == bytes32(0x0), "Tag exists");
        newTag.ipfsHash = ipfsHash;
        community.tagsCount++;
        emit TagCreated(tagId, communityId, ipfsHash);
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
    /// @param id Address of the community to get
    function getCommunityById(CommunityCollection storage self, uint32 id)
        internal
        view
        returns (CommunityInfo memory)
    {
        return self.communities[id].info;
    }

    /// @notice Get the number of tags in community
    /// @param self The mapping containing all communities
    /// @param id Address of the community to get tags count
    function getTagsCountByCommunityId(CommunityCollection storage self, uint32 id)
        internal
        view
        returns (uint32 count)
    {
        return self.communities[id].tagsCount;
    }

    /// @notice Get list of tags in community
    /// @param self The mapping containing all communities
    /// @param id Address of the community to get tags
    function getTagsByCommunityId(CommunityCollection storage self, uint32 id)
        internal
        view
        returns (TagInfo[] memory)
    {
        Community storage community = self.communities[id];
        TagInfo[] memory iterableTags = new TagInfo[](community.tagsCount);
        for (uint32 i = 1; i <= community.tagsCount; i++) {
            iterableTags[i - 1] = community.tagList[i];
        }
        return iterableTags;
    }
}
