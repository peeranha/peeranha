pragma solidity >=0.5.0;
pragma abicoder v2;
import "./IpfsLib.sol";
import "./CommonLib.sol";

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

    modifier onlyExistingAndNotFrozen(CommunityCollection storage self, uint32 id){
        require(
            self.communities[id].info.ipfsDoc.hash != bytes32(0x0),
            "Community does not exist"
        );
        require(!self.communities[id].info.isFrozen,
            "Community is frozen"
        );
        _;
    }

    event CommunityCreated(uint32 id, bytes32 ipfsHash, bytes32 ipfsHash2, Tag[] tags);
    event CommunityUpdated(uint32 id, bytes32 ipfsHash);
    event TagCreated(uint32 communityId, uint32 tagId, bytes32 ipfsHash, bytes32 ipfsHash2);
    event CommunityFrozen(uint32 commintyId);
    event CommunityUnfrozen(uint32 commintyId);

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
        emit CommunityCreated(self.communityCount, ipfsHash, bytes32(0x0), tags);
        return self.communityCount;
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
        self.communities[communityId].info.ipfsDoc.hash = ipfsHash;
        emit CommunityUpdated(communityId, ipfsHash);
    }

    /// @notice Create new tag info record
    /// @param self The mapping containing all communities
    /// @param communityId Id of the community in which tag is creating
    /// @param ipfsHash IPFS hash of document with community information
    function createTag (
        CommunityCollection storage self, 
        uint32 communityId,
        bytes32 ipfsHash
    ) internal onlyExistingAndNotFrozen(self, communityId) {
        CommunityContainer storage community = self.communities[communityId];
        Tag storage newTag = community.tags[++community.info.tagsCount];
        require(newTag.ipfsDoc.hash == bytes32(0x0), "Tag exists");
        newTag.ipfsDoc.hash = ipfsHash;
        emit TagCreated(community.info.tagsCount, communityId, ipfsHash, bytes32(0x0));
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
        return self.communities[communityId].info.tagsCount;
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
        Tag[] memory iterableTags = new Tag[](community.info.tagsCount);
        for (uint8 i = 1; i <= community.info.tagsCount; i++) {
            iterableTags[i - 1] = community.tags[i];
        }
        return iterableTags;
    }

    /// @notice Freeze the community
    /// @param self The mapping containing all communities
    /// @param communityId Address of the community to freeze
    function freeze(CommunityCollection storage self, uint32 communityId)  
    internal onlyExistingAndNotFrozen(self, communityId) {                          // rename to freezeCommunity
        self.communities[communityId].info.isFrozen = true;
        emit CommunityFrozen(communityId);
    }

    /// @notice Unfreeze the community
    /// @param self The mapping containing all communities
    /// @param communityId Address of the community to unfreeze
    function unfreeze(CommunityCollection storage self, uint32 communityId) internal { // rename to unfreezeCommunity
        require(
            self.communities[communityId].info.ipfsDoc.hash != bytes32(0x0),
            "Community does not exist"
        );
        self.communities[communityId].info.isFrozen = false;
        emit CommunityUnfrozen(communityId);
    }
}
