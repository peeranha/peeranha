pragma solidity ^0.8.0;

import "./CommonLib.sol";
import "./PostLib.sol";

/// @title Communities
/// @notice Provides information about created communities
/// @dev Community information is stored in the mapping on the main contract
library CommunityLib {
    struct Community {
        CommonLib.IpfsHash ipfsDoc;
        uint8 tagsCount;
        uint32 timeCreate;
        bool isFrozen;
    }

    struct Tag {
        CommonLib.IpfsHash ipfsDoc;
    }

    struct CommunityContainer {
        Community info;
        mapping(uint32 => Tag) tags;
    }

    struct CommunityCollection {
        mapping(uint32 => CommunityContainer) communities;
        uint32 communityCount;
    }


    event CommunityCreated(address user, uint32 id);
    event CommunityUpdated(address user, uint32 id);
    event TagCreated(address user, uint8 tagId, uint32 communityId);
    event TagUpdated(address user, uint8 tagId, uint32 communityId);
    event CommunityFrozen(address user, uint32 communityId);
    event CommunityUnfrozen(address user, uint32 communityId);

    /// @notice Create new community info record
    /// @param self The mapping containing all communities
    /// @param ipfsHash IPFS hash of document with community information
    function createCommunity(
        CommunityCollection storage self,
        bytes32 ipfsHash,
        Tag[] memory tags
    ) internal returns(uint32){
        require(
            tags.length >= 5, 
            "Require at least 5 tags"
        );
        for(uint32 i = 0; i < tags.length; i++){
            for(uint32 j = 0; j < tags.length; j++){
                if (i != j){
                    require(
                        tags[i].ipfsDoc.hash != tags[j].ipfsDoc.hash,
                        "Require tags with unique names"
                    );
                }
            }
        }
        CommunityContainer storage community = self.communities[++self.communityCount];
        community.info.ipfsDoc.hash = ipfsHash;
        community.info.tagsCount = uint8(tags.length);
        community.info.timeCreate = CommonLib.getTimestamp();
        community.info.isFrozen = false;
        for (uint32 i = 1; i <= uint32(tags.length); i++) {
            community.tags[i] = tags[i - 1];
        }
        emit CommunityCreated(msg.sender, self.communityCount);
        return self.communityCount;
    }

    /// @notice Update community info record
    /// @param self The mapping containing all communities
    /// @param communityId Address of the community to update
    /// @param ipfsHash IPFS hash of document with community information
    function updateCommunity (
        CommunityCollection storage self,
        uint32 communityId,
        bytes32 ipfsHash
    ) internal {
        self.communities[communityId].info.ipfsDoc.hash = ipfsHash;

        emit CommunityUpdated(msg.sender, communityId);
    }

    /// @notice Create new tag info record
    /// @param self The mapping containing all communities
    /// @param communityId Id of the community in which tag is creating
    /// @param ipfsHash IPFS hash of document with community information
    function createTag (
        CommunityCollection storage self, 
        uint32 communityId,
        bytes32 ipfsHash
    ) internal {
        CommunityContainer storage community = self.communities[communityId];
        Tag storage newTag = community.tags[++community.info.tagsCount];
        require(newTag.ipfsDoc.hash == bytes32(0x0), "Tag exists");
        newTag.ipfsDoc.hash = ipfsHash;

        emit TagCreated(msg.sender, community.info.tagsCount, communityId);
    }

    /// @notice Update tag info record
    /// @param self The mapping containing all communities
    /// @param communityId Address of the community to update
    /// @param tagId Address of the tag to update
    /// @param ipfsHash IPFS hash of document with tag information
    function updateTag (
        CommunityCollection storage self,
        uint8 tagId,
        uint32 communityId,
        bytes32 ipfsHash
    ) internal {
        self.communities[communityId].tags[tagId].ipfsDoc.hash = ipfsHash;

        emit TagUpdated(msg.sender, tagId, communityId);
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

    /// @notice Freeze the community
    /// @param self The mapping containing all communities
    /// @param communityId Address of the community to freeze
    function freeze(CommunityCollection storage self, uint32 communityId)
    internal {
        self.communities[communityId].info.isFrozen = true;

        emit CommunityFrozen(msg.sender, communityId);
    }

    /// @notice Unfreeze the community
    /// @param self The mapping containing all communities
    /// @param communityId Address of the community to unfreeze
    function unfreeze(CommunityCollection storage self, uint32 communityId) internal {
        require(
            self.communities[communityId].info.ipfsDoc.hash != bytes32(0x0),
            "Community does not exist"
        );
        self.communities[communityId].info.isFrozen = false;

        emit CommunityUnfrozen(msg.sender, communityId);
    }

    function onlyExistingAndNotFrozenCommunity(CommunityCollection storage self, uint32 communityId) internal {
        Community storage community = self.communities[communityId].info;

        require(
            community.ipfsDoc.hash != bytes32(0x0),
            "Community does not exist"
        );
        require(!community.isFrozen,
            "Community is frozen"
        );
    }

    function onlyExistingTag(CommunityCollection storage self, uint8 tagId, uint32 communityId) internal view {
        require(
            self.communities[communityId].tags[tagId].ipfsDoc.hash != bytes32(0x0),
            "Tag does not exist"
        );
    }

    function checkTags(CommunityCollection storage self, uint32 communityId, uint8[] memory tags) internal {
        Community storage community = self.communities[communityId].info;

        for (uint32 i; i < tags.length; i++) {
            require(community.tagsCount >= tags[i], "Wrong tag id.");
            require(tags[i] != 0, "The community does not have tag with 0 id.");
        }
    }

    function checkTagsByPostId(CommunityCollection storage self, uint32 communityId, uint256 postId, uint8[] memory tags) internal {
        checkTags(self, communityId, tags);
    }
}
