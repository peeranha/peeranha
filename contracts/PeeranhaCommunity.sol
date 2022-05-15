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
    }


    /**
     * @dev Create new community.
     *
     * Requirements:
     *
     * - Must be a new community.
     */
    function createCommunity(bytes32 ipfsHash, CommunityLib.Tag[] memory tags) external {
        peeranhaUser.checkPermission(msg.sender, msg.sender, 0, UserLib.Action.NONE, UserLib.Permission.admin, false);
        uint32 communityId = communities.createCommunity(ipfsHash, tags);
        peeranhaUser.giveCommunityAdminPermission(msg.sender, communityId);
    }

    /**
     * @dev Edit community info.
     *
     * Requirements:
     *
     * - Must be an existing community.  
     * - Sender must be community moderator.
     */
    function updateCommunity(uint32 communityId, bytes32 ipfsHash) external {
        onlyExistingAndNotFrozenCommunityy(communityId);
        peeranhaUser.checkPermission(msg.sender, msg.sender, communityId, UserLib.Action.NONE, UserLib.Permission.adminOrCommunityModerator, false);

        communities.updateCommunity(communityId, ipfsHash);
    }

    /**
     * @dev Freeze community.
     *
     * Requirements:
     *
     * - Must be an existing community.  
     * - Sender must be community moderator.
     */
    function freezeCommunity(uint32 communityId) external {
        onlyExistingAndNotFrozenCommunityy(communityId);
        peeranhaUser.checkPermission(msg.sender, msg.sender, communityId, UserLib.Action.NONE, UserLib.Permission.adminOrCommunityAdmin, false);

        communities.freeze(communityId);
    }

    /**
     * @dev Unfreeze community.
     *
     * Requirements:
     *
     * - Must be an existing community.  
     * - Sender must be community moderator.
     */
    function unfreezeCommunity(uint32 communityId) external {
        peeranhaUser.checkPermission(msg.sender, msg.sender, communityId, UserLib.Action.NONE, UserLib.Permission.adminOrCommunityAdmin, false);

        communities.unfreeze(communityId);
    }

    /**
     * @dev Create new tag.
     *
     * Requirements:
     *
     * - Must be a new tag.
     * - Must be an existing community. 
     */
    function createTag(uint32 communityId, bytes32 ipfsHash) external { // community admin || global moderator
        onlyExistingAndNotFrozenCommunityy(communityId);
        peeranhaUser.checkPermission(msg.sender, msg.sender, communityId, UserLib.Action.NONE, UserLib.Permission.adminOrCommunityModerator, false);

        communities.createTag(communityId, ipfsHash);
    }

    /**
     * @dev Edit tag info.
     *
     * Requirements:
     *
     * - Must be an existing commuity. 
     * - Must be an existing tag.  
     * - Sender must be community moderator.
     */
    function updateTag(uint32 communityId, uint8 tagId, bytes32 ipfsHash) external 
    onlyExistingTag(tagId, communityId) {
        peeranhaUser.checkPermission(msg.sender, msg.sender, communityId, UserLib.Action.NONE, UserLib.Permission.adminOrCommunityModerator, false);

        communities.updateTag(tagId, communityId, ipfsHash);
    }

    /**
     * @dev Get communities count.
     */
    function getCommunitiesCount() external view returns (uint32 count) {
        return communities.getCommunitiesCount();
    }

    /**
     * @dev Get community info by id.
     *
     * Requirements:
     *
     * - Must be an existing community.
     */
    function getCommunity(uint32 communityId) external view returns (CommunityLib.Community memory) {
        return communities.getCommunity(communityId);
    }

    /**
     * @dev Get tags count in community.
     *
     * Requirements:
     *
     * - Must be an existing community.
     */
    function getTagsCount(uint32 communityId) external view returns (uint8 count) {
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
    function getTags(uint32 communityId) external view returns (CommunityLib.Tag[] memory) {
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
    function getTag(uint32 communityId, uint8 tagId) external view
    onlyExistingTag(tagId, communityId) 
    returns (CommunityLib.Tag memory) {
        return communities.getTag(communityId, tagId);
    }

    function onlyExistingAndNotFrozenCommunity(uint32 communityId) external view override {
        CommunityLib.onlyExistingAndNotFrozenCommunity(communities, communityId);
    }

    function onlyExistingAndNotFrozenCommunityy(uint32 communityId) private view {       // 2 function?
        CommunityLib.onlyExistingAndNotFrozenCommunity(communities, communityId);
    }
    
    modifier onlyExistingTag(uint8 tagId, uint32 communityId) {
        CommunityLib.onlyExistingTag(communities, tagId, communityId);
        _;
    }
    
    function checkTags(uint32 communityId, uint8[] memory tags) external view override {
        CommunityLib.checkTags(communities, communityId, tags);
    }
}