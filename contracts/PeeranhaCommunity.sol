//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./libraries/CommunityLib.sol";
import "./base/NativeMetaTransaction.sol";

import "./interfaces/IPeeranhaCommunity.sol";
import "./interfaces/IPeeranhaUser.sol";


contract PeeranhaCommunity is IPeeranhaCommunity, Initializable, NativeMetaTransaction {
    using CommunityLib for CommunityLib.CommunityCollection;
    using CommunityLib for CommunityLib.Community;

    CommunityLib.CommunityCollection communities;
    IPeeranhaUser peeranhaUser;

    function initialize(address peeranhaUserContractAddress) public initializer {
        peeranhaUser = IPeeranhaUser(peeranhaUserContractAddress);
        __Peeranha_init();
    }
    
    function __Peeranha_init() public onlyInitializing {
        __NativeMetaTransaction_init("PeeranhaCommunity");
    }

    function dispatcherCheck(address user) internal {
        if (user != _msgSender()) {
            peeranhaUser.onlyDispatcher(_msgSender());
        }
    }


    /**
     * @dev Create new community.
     *
     * Requirements:
     *
     * - Must be a new community.
     * - Sender must be a admin.
     */
    function createCommunity(address user, bytes32 ipfsHash, CommunityLib.Tag[] memory tags) public {
        dispatcherCheck(user);
        peeranhaUser.checkHasRole(user, UserLib.ActionRole.Admin, 0);
        uint32 communityId = communities.createCommunity(ipfsHash, tags);
        peeranhaUser.initCommunityAdminPermission(user, communityId);
    }

    /**
     * @dev Edit community info.
     *
     * Requirements:
     *
     * - Must be an existing community.  
     * - Sender must be admin or community admin.
     */
    function updateCommunity(address user, uint32 communityId, bytes32 ipfsHash) public {
        dispatcherCheck(user);
        onlyExistingAndNotFrozenCommunity(user, communityId);
        peeranhaUser.checkHasRole(user, UserLib.ActionRole.AdminOrCommunityAdmin, communityId);
        communities.updateCommunity(communityId, ipfsHash);
    }

    /**
     * @dev Freeze community.
     *
     * Requirements:
     *
     * - Must be an existing community.  
     * - Sender must be admin or community admin.
     */
    function freezeCommunity(address user, uint32 communityId) public {
        dispatcherCheck(user);
        onlyExistingAndNotFrozenCommunity(user, communityId);
        peeranhaUser.checkHasRole(user, UserLib.ActionRole.AdminOrCommunityAdmin, communityId);
        communities.freeze(communityId);
    }

    /**
     * @dev Unfreeze community.
     *
     * Requirements:
     *
     * - Must be an existing community.  
     * - Sender must be admin and community moderator.
     */
    function unfreezeCommunity(address user, uint32 communityId) public {
        dispatcherCheck(user);
        peeranhaUser.checkHasRole(user, UserLib.ActionRole.AdminOrCommunityAdmin, communityId);
        communities.unfreeze(communityId);
    }

    /**
     * @dev Create new tag.
     *
     * Requirements:
     *
     * - Must be a new tag.
     * - Must be an existing community. 
     * - Must be admin and community admin
     */
    function createTag(address user, uint32 communityId, bytes32 ipfsHash) public { // community admin || global moderator
        dispatcherCheck(user);
        onlyExistingAndNotFrozenCommunity(user, communityId);
        peeranhaUser.checkHasRole(user, UserLib.ActionRole.AdminOrCommunityAdmin, communityId);
        communities.createTag(communityId, ipfsHash);
    }

    /**
     * @dev Edit tag info.
     *
     * Requirements:
     *
     * - Must be an existing commuity. 
     * - Must be an existing tag.  
     * - Sender must be admin or community admin.
     */
    function updateTag(address user, uint32 communityId, uint8 tagId, bytes32 ipfsHash) public onlyExistingTag(tagId, communityId) {
        dispatcherCheck(user);
        peeranhaUser.checkHasRole(user, UserLib.ActionRole.AdminOrCommunityAdmin, communityId);
        communities.updateTag(tagId, communityId, ipfsHash);
    }

    /**
     * @dev Get communities count.
     */
    function getCommunitiesCount() public  view returns (uint32 count) {
        return communities.getCommunitiesCount();
    }

    /**
     * @dev Get community info by id.
     *
     * Requirements:
     *
     * - Must be an existing community.
     */
    function getCommunity(uint32 communityId) public  view returns (CommunityLib.Community memory) {
        return communities.getCommunity(communityId);
    }

    /**
     * @dev Get tags count in community.
     *
     * Requirements:
     *
     * - Must be an existing community.
     */
    function getTagsCount(uint32 communityId) public  view returns (uint8 count) {
        return communities.getTagsCount(communityId);
    }

    /**
     * @dev Get tags in community.
     *
     * Requirements:
     *
     * - Must be an existing community.
     * - must be a tags.
     */
    function getTags(uint32 communityId) public  view returns (CommunityLib.Tag[] memory) {
        return communities.getTags(communityId);
    }

    /**
     * @dev Get tag in community.
     *
     * Requirements:
     *
     * - Must be an existing community.
     * - Must be a tag.
     */
    function getTag(uint32 communityId, uint8 tagId) public  view
    onlyExistingTag(tagId, communityId) 
    returns (CommunityLib.Tag memory) {
        return communities.getTag(communityId, tagId);
    }

    function onlyExistingAndNotFrozenCommunity(address userAddress, uint32 communityId) public view override {
        bool isFrozenCommunity = CommunityLib.onlyExistingAndNotFrozenCommunity(communities, communityId);

        if (isFrozenCommunity) {
            (bool isHasRole,) = peeranhaUser.isHasRoles(userAddress, UserLib.ActionRole.AdminOrCommunityAdminOrCommunityModerator, communityId);
            require(isHasRole,
                "Community is frozen"
            );
        }
    }

    modifier onlyExistingTag(uint8 tagId, uint32 communityId) {
        CommunityLib.onlyExistingTag(communities, tagId, communityId);
        _;
    }
    
    function checkTags(uint32 communityId, uint8[] memory tags) public  view override {
        CommunityLib.checkTags(communities, communityId, tags);
    }

    function getVersion() public pure returns (uint256) {
        return 41;
    }
}