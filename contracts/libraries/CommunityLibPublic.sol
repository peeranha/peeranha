pragma solidity >=0.5.0;
pragma abicoder v2;
import "./CommunityLib.sol";
import "./CommonLib.sol";
import "./PostLib.sol";

/// @title Communities
/// @notice Provides information about created communities
/// @dev Community information is stored in the mapping on the main contract
library CommunityLibPublic {
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
        CommunityLib.CommunityCollection storage self,
        bytes32 ipfsHash,
        CommunityLib.Tag[] memory tags
    ) public returns(uint32){
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
        CommunityLib.CommunityContainer storage community = self.communities[++self.communityCount];
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
        CommunityLib.CommunityCollection storage self,
        uint32 communityId,
        bytes32 ipfsHash
    ) public {
        self.communities[communityId].info.ipfsDoc.hash = ipfsHash;

        emit CommunityUpdated(msg.sender, communityId);
    }

    /// @notice Create new tag info record
    /// @param self The mapping containing all communities
    /// @param communityId Id of the community in which tag is creating
    /// @param ipfsHash IPFS hash of document with community information
    function createTag (
        CommunityLib.CommunityCollection storage self, 
        uint32 communityId,
        bytes32 ipfsHash
    ) public {
        CommunityLib.CommunityContainer storage community = self.communities[communityId];
        CommunityLib.Tag storage newTag = community.tags[++community.info.tagsCount];
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
        CommunityLib.CommunityCollection storage self,
        uint8 tagId,
        uint32 communityId,
        bytes32 ipfsHash
    ) public {
        self.communities[communityId].tags[tagId].ipfsDoc.hash = ipfsHash;

        emit TagUpdated(msg.sender, tagId, communityId);
    }

    /// @notice Freeze the community
    /// @param self The mapping containing all communities
    /// @param communityId Address of the community to freeze
    function freeze (
        CommunityLib.CommunityCollection storage self,
        uint32 communityId
    ) public {
        self.communities[communityId].info.isFrozen = true;

        emit CommunityFrozen(msg.sender, communityId);
    }

    /// @notice Unfreeze the community
    /// @param self The mapping containing all communities
    /// @param communityId Address of the community to unfreeze
    function unfreeze(
        CommunityLib.CommunityCollection storage self,
        uint32 communityId
    ) public {
        require(
            self.communities[communityId].info.ipfsDoc.hash != bytes32(0x0),
            "Community does not exist"
        );
        self.communities[communityId].info.isFrozen = false;

        emit CommunityUnfrozen(msg.sender, communityId);
    }

    function checkTagsByPostId(CommunityLib.CommunityCollection storage self, PostLib.PostCollection storage posts, uint256 postId, uint8[] memory tags) internal {
        PostLib.PostContainer storage postContainer = PostLib.getPostContainer(posts, postId);
        
        CommunityLib.checkTags(self, postContainer.info.communityId, tags); // duplicate checkTags ? (gas)
    }
}
