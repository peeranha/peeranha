pragma solidity >=0.5.0;
pragma abicoder v2;
import "./IpfsLib.sol";

/// @title Communities
/// @notice Provides information about created communities
/// @dev Community information is stored in the mapping on the main contract
library CommunityLib {
    struct Community {
        IpfsLib.IpfsHash ipfsDoc;
        uint8 tagsCount;
        uint32 timeCreate;
        bool isFrozen;
    }

    struct Tag {
        IpfsLib.IpfsHash ipfsDoc;
    }

    struct CommunityContainer {
        Community info;
        mapping(uint32 => Tag) tags;
    }

    struct CommunityCollection {
        mapping(uint32 => CommunityContainer) communities;
        uint32 communityCount;
    }

    // modifier onlyExistingAndNotFrozen(CommunityCollection storage self, uint32 id){
    //     require(
    //         self.communities[id].info.ipfsDoc.hash != bytes32(0x0),
    //         "Community does not exist"
    //     );
    //     require(!self.communities[id].info.isFrozen,
    //         "Community is frozen"
    //     );
    //     _;
    // }

    event CommunityCreated(address user, uint32 id);
    event CommunityUpdated(address user, uint32 id);
    event TagCreated(address user, uint8 tagId, uint32 communityId);
    event TagUpdated(address user, uint8 tagId, uint32 communityId);
    event CommunityFrozen(address user, uint32 communityId);
    event CommunityUnfrozen(address user, uint32 communityId);

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
        returns (uint8 count) 
    {
        return self.communities[communityId].info.tagsCount;
    }

    /// @notice Get list of tags in community
    /// @param self The mapping containing all communities
    /// @param communityId Address of the community to get tags
    function getTags(CommunityCollection storage self, uint32 communityId)
        internal
        view
        returns (Tag[] memory)
    {
        CommunityContainer storage community = self.communities[communityId];
        Tag[] memory iterableTags = new Tag[](community.info.tagsCount);
        for (uint8 i = 1; i <= community.info.tagsCount; i++) {
            iterableTags[i - 1] = community.tags[i];
        }
        return iterableTags;
    }

    /// @notice Get tag in community
    /// @param self The mapping containing all communities
    /// @param communityId Address of the community to get tags
    /// @param tagId Address of the tag
    function getTag(CommunityCollection storage self, uint32 communityId, uint8 tagId)
        internal
        view
        returns (Tag memory)
    {
        return self.communities[communityId].tags[tagId];
    }

    function onlyExistingAndNotFrozenCommunity(CommunityCollection storage self, uint32 communityId) internal {
        Community storage community = self.communities[communityId].info;

        require(
            community.ipfsDoc.hash != bytes32(0x0),
            "C1"
        );
        require(!community.isFrozen,
            "C2"
        );
    }

    function onlyExistingTag(CommunityCollection storage self, uint8 tagId, uint32 communityId) internal view {
        require(
            self.communities[communityId].tags[tagId].ipfsDoc.hash != bytes32(0x0),
            "C3"
        );
    }

    function checkTags(CommunityCollection storage self, uint32 communityId, uint8[] memory tags) internal {
        Community storage community = self.communities[communityId].info;

        for (uint32 i = 0; i < tags.length; i++) {
            require(community.tagsCount >= tags[i], "C4");
            require(tags[i] != 0, "C5");
        }
    }
}
