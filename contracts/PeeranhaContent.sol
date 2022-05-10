pragma solidity ^0.7.3;
pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

// import "./libraries/UserLib.sol";
// import "./libraries/CommunityLib.sol";
import "./libraries/PostLib.sol";
// import "./libraries/RewardLib.sol";
// import "./libraries/AchievementLib.sol";
// import "./libraries/AchievementCommonLib.sol";
// import "./libraries/ConfigurationLib.sol";

import "./interfaces/IPeeranhaContent.sol";
import "./interfaces/IPeeranhaUser.sol";
import "./interfaces/IPeeranhaCommunity.sol";


contract PeeranhaContent is IPeeranhaContent, Initializable {
    using PostLib for PostLib.Post;
    using PostLib for PostLib.Reply;
    using PostLib for PostLib.Comment;
    using PostLib for PostLib.PostCollection;

    PostLib.PostCollection posts;

    function initialize(address peeranhaCommunityContractAddress, address peeranhaUserContractAddress) public onlyInitializing {
        posts.peeranhaCommunity = IPeeranhaCommunity(peeranhaCommunityContractAddress);
        posts.peeranhaUser = IPeeranhaUser(peeranhaUserContractAddress);
    }


    function __AccessControl_init_unchained() internal onlyInitializing {
    }

    /**
     * @dev Create new post.
     *
     * Requirements:
     *
     * - must be a new post.
     * - must be a community.
     * - must be tags.
    */
    function createPost(address userAddress, uint32 communityId, bytes32 ipfsHash, PostLib.PostType postType, uint8[] memory tags) external override {
        posts.peeranhaCommunity.checkTags(communityId, tags);
        posts.peeranhaCommunity.onlyExistingAndNotFrozenCommunity(communityId);

        // UserLib.createIfDoesNotExist(userContext.users, msg.sender);
        posts.createPost(userAddress, communityId, ipfsHash, postType, tags);
    }

    /**
     * @dev Edit post info.
     *
     * Requirements:
     *
     * - must be a post.
     * - must be new info about post
     * - must be a community.
     * - must be tags
    */
    function editPost(address userAddress, uint256 postId, bytes32 ipfsHash, uint8[] memory tags) external override {
        posts.editPost(userAddress, postId, ipfsHash, tags);
    }

    /**
     * @dev delete post.
     *
     * Requirements:
     *
     * - must be a post.
    */
    function deletePost(address userAddress, uint256 postId) external override {
        posts.deletePost(userAddress, postId);
    }

    /**
     * @dev Create new reply.
     *
     * Requirements:
     *
     * - must be a post.
     * - must be a new reply. 
    */
    function createReply(address userAddress, uint256 postId, uint16 parentReplyId, bytes32 ipfsHash, bool isOfficialReply) external override {
        posts.createReply(userAddress, postId, parentReplyId, ipfsHash, isOfficialReply);
    }

    /**
     * @dev Edit reply.
     *
     * Requirements:
     *
     * - must be a reply.
     * - must be new info about reply.
    */
    function editReply(address userAddress, uint256 postId, uint16 replyId, bytes32 ipfsHash) external override {
        posts.editReply(userAddress, postId, replyId, ipfsHash);
    }

    /**
     * @dev Delete reply.
     *
     * Requirements:
     *
     * - must be a reply.
    */
    function deleteReply(address userAddress, uint256 postId, uint16 replyId) external override {
        posts.deleteReply(userAddress, postId, replyId);
    }

    /**
     * @dev Create new comment.
     *
     * Requirements:
     *
     * - must be a new comment.
     * - must be a post or a reply.
    */
    function createComment(address userAddress, uint256 postId, uint16 parentReplyId, bytes32 ipfsHash) external override {
        posts.createComment(userAddress, postId, parentReplyId, ipfsHash);
    }

    /**
     * @dev Edit comment.
     *
     * Requirements:
     *
     * - must be a comment.
     * - must be new info about reply.
    */
    function editComment(address userAddress, uint256 postId, uint16 parentReplyId, uint8 commentId, bytes32 ipfsHash) external override {
        posts.editComment(userAddress, postId, parentReplyId, commentId, ipfsHash);
    }

    /**
     * @dev Delete comment.
     *
     * Requirements:
     *
     * - must be a comment.
    */
    function deleteComment(address userAddress, uint256 postId, uint16 parentReplyId, uint8 commentId) external override {
        posts.deleteComment(userAddress, postId, parentReplyId, commentId);
    }

    // /**
    //  * @dev Change status official answer.
    //  *
    //  * Requirements:
    //  *
    //  * - must be a reply.
    //  * - the user must have right for change status oficial answer.
    // */ 
    function changeStatusOfficialReply(address userAddress, uint256 postId, uint16 replyId) external override {
        posts.changeStatusOfficialReply(userAddress, postId, replyId);
    }

    /**
     * @dev Change status best reply
     *
     * Requirements:
     *
     * - must be a reply.
     * - must be a role ?
    */ 
    function changeStatusBestReply(address userAddress, uint256 postId, uint16 replyId) external override {
        posts.changeStatusBestReply(userAddress, postId, replyId);
    }

    /**
     * @dev Vote post or reply or comment
     *
     * Requirements:
     *
     * - must be a post/reply/comment.
    */ 
    function voteItem(address userAddress, uint256 postId, uint16 replyId, uint8 commentId, bool isUpvote) external override {
        posts.voteForumItem(userAddress, postId, replyId, commentId, isUpvote);
    }

    function changePostType(address userAddress, uint256 postId, PostLib.PostType postType) external override {
        posts.changePostType(userAddress, postId, postType);
    }

    // check need for prod?
    /**
     * @dev Get a post by index.
     *
     * Requirements:
     *
     * - must be a post.
    */
    function getPost(uint256 postId) external view returns (PostLib.Post memory) {
        return posts.getPost(postId);
    }

    // check need for prod?
    /**
     * @dev Get a reply by index.
     *
     * Requirements:
     *
     * - must be a reply.
    */
    function getReply(uint256 postId, uint16 replyId) external view returns (PostLib.Reply memory) {
        return posts.getReply(postId, replyId);
    }

    // check need for prod?
    /**
     * @dev Get a comment by index.
     *
     * Requirements:
     *
     * - must be a comment.
    */
    function getComment(uint256 postId, uint16 parentReplyId, uint8 commentId) external view returns (PostLib.Comment memory) {
        return posts.getComment(postId, parentReplyId, commentId);
    }

    function getStatusHistory(address user, uint256 postId, uint16 replyId, uint8 commentId) external view returns (int256) {
        return PostLib.getStatusHistory(posts, user, postId, replyId, commentId);
    }

    // ///
    // // TO DO
    // // to remove it in prod
    // /// ?
    // function getVotedUsers(uint256 postId, uint16 replyId, uint8 commentId) external view returns (address[] memory) {
    //     return PostLib.getVotedUsers(posts, postId, replyId, commentId);
    // }

    // function onlyExistingAndNotFrozenCommunity(uint32 communityId) private {
    //     peeranhaCommunity.onlyExistingAndNotFrozenCommunity(communityId);
    // }
    
    // // modifier onlyExistingTag(uint8 tagId, uint32 communityId) {
    // //     CommunityLib.onlyExistingTag(communities, tagId, communityId);
    // //     _;
    // // }
    
    // // modifier checkTags(uint32 communityId, uint8[] memory tags) {
    // //     CommunityLib.checkTags(communities, communityId, tags);
    // //     _;
    // // }

    // // modifier checkTagsByPostId(uint256 postId, uint8[] memory tags) {
    // //     PostLib.PostContainer storage postContainer = PostLib.getPostContainer(posts, postId);
    // //     CommunityLib.checkTagsByPostId(communities, postContainer.info.communityId, postId, tags);
    // //     _;
    // // }
}