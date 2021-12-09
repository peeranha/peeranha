pragma solidity >=0.5.0;
pragma abicoder v2;

import "./PostLib.sol";
import "./IpfsLib.sol";
import "./VoteLib.sol";
import "./UserLib.sol";
import "./SecurityLib.sol";

/// @title PostLib
/// @notice Provides information about operation with posts
/// @dev posts information is stored in the mapping on the main contract
library PostLibPublic {
    using UserLib for UserLib.UserCollection;
    uint256 constant DELETE_TIME = 604800;    //7 days       // name??


    event PostEdited(address user, uint256 postId);
    event ReplyEdited(address user, uint256 postId, uint16 replyId);
    event CommentEdited(address user, uint256 postId, uint16 parentReplyId, uint8 commentId);
    event PostDeleted(address user, uint256 postId);
    event ReplyDeleted(address user, uint256 postId, uint16 replyId);
    event CommentDeleted(address user, uint256 postId, uint16 parentReplyId, uint8 commentId);
    event StatusOfficialReplyChanged(address user, uint256 postId, uint16 replyId);
    event StatusBestReplyChanged(address user, uint256 postId, uint16 replyId);


    /// @notice Edit post
    /// @param self The mapping containing all posts
    /// @param userContext All information about users
    /// @param userAddr Author of the comment
    /// @param postId The post where the comment will be post
    /// @param ipfsHash IPFS hash of document with post information
    function editPost(                                                  //LAST MODIFIED?
        PostLib.PostCollection storage self,
        UserLib.UserContext storage userContext,
        address userAddr,
        uint256 postId,
        bytes32 ipfsHash,
        uint8[] memory tags
    ) public {
        PostLib.PostContainer storage postContainer = PostLib.getPostContainer(self, postId);
        require(!IpfsLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");
        require(userAddr == postContainer.info.author, "You can not edit this post. It is not your.");
        SecurityLib.checkRatingAndEnergy(
            userContext.roles,
            UserLib.getUserByAddress(userContext.users, userAddr),
            userAddr,
            postContainer.info.author,
            postContainer.info.communityId,
            SecurityLib.Action.editItem
        );

        if(!IpfsLib.isEmptyIpfs(ipfsHash) && postContainer.info.ipfsDoc.hash != ipfsHash)
            postContainer.info.ipfsDoc.hash = ipfsHash;
        if (tags.length > 0)
            postContainer.info.tags = tags;

        emit PostEdited(userAddr, postId);
    }

    /// @notice Edit reply
    /// @param self The mapping containing all posts
    /// @param userContext All information about users
    /// @param userAddr Author of the comment
    /// @param postId The post where the comment will be post
    /// @param replyId The reply which will be change
    /// @param ipfsHash IPFS hash of document with reply information
    function editReply(                                                         //LAST MODIFIED?
        PostLib.PostCollection storage self,
        UserLib.UserContext storage userContext,
        address userAddr,
        uint256 postId,
        uint16 replyId,
        bytes32 ipfsHash
    ) public {
        PostLib.PostContainer storage postContainer = PostLib.getPostContainer(self, postId);
        PostLib.ReplyContainer storage replyContainer = PostLib.getReplyContainerSafe(postContainer, replyId);
        require(!IpfsLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");
        require(userAddr == replyContainer.info.author, "You can not edit this Reply. It is not your.");
        SecurityLib.checkRatingAndEnergy(
            userContext.roles,
            UserLib.getUserByAddress(userContext.users, userAddr),
            userAddr,
            replyContainer.info.author,
            postContainer.info.communityId,
            SecurityLib.Action.editItem
        );

        if (replyContainer.info.ipfsDoc.hash != ipfsHash)
            replyContainer.info.ipfsDoc.hash = ipfsHash;
        
        emit ReplyEdited(userAddr, postId, replyId);
    }

    /// @notice Edit comment
    /// @param self The mapping containing all posts
    /// @param userContext All information about users
    /// @param userAddr Author of the comment
    /// @param postId The post where the comment will be post
    /// @param parentReplyId The reply where the reply will be edit
    /// @param commentId The comment which will be change
    /// @param ipfsHash IPFS hash of document with comment information
    function editComment(                                           //LAST MODIFIED?
        PostLib.PostCollection storage self,
        UserLib.UserContext storage userContext,
        address userAddr,
        uint256 postId,
        uint16 parentReplyId,
        uint8 commentId,
        bytes32 ipfsHash
    ) public {
        PostLib.PostContainer storage postContainer = PostLib.getPostContainer(self, postId);
        PostLib.CommentContainer storage commentContainer = PostLib.getCommentContainerSave(postContainer, parentReplyId, commentId);
        require(!IpfsLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");
        require(userAddr == commentContainer.info.author, "You can not edit this comment. It is not your.");
        SecurityLib.checkRatingAndEnergy(
            userContext.roles,
            UserLib.getUserByAddress(userContext.users, userAddr),
            userAddr,
            commentContainer.info.author,
            postContainer.info.communityId,
            SecurityLib.Action.editItem
        );

        if (commentContainer.info.ipfsDoc.hash != ipfsHash)
            commentContainer.info.ipfsDoc.hash = ipfsHash;
        
        emit CommentEdited(userAddr, postId, parentReplyId, commentId);
    }

    /// @notice Delete post
    /// @param self The mapping containing all posts
    /// @param userContext All information about users
    /// @param userAddr User who deletes post
    /// @param postId Post which will be deleted
    function deletePost(
        PostLib.PostCollection storage self,
        UserLib.UserContext storage userContext,
        address userAddr,
        uint256 postId
    ) public {
        PostLib.PostContainer storage postContainer = PostLib.getPostContainer(self, postId);
        int32 userRating = UserLib.getUserByAddress(userContext.users, userAddr).rating;
        SecurityLib.checkRatingAndEnergy(
            userContext.roles,
            UserLib.getUserByAddress(userContext.users, userAddr),
            userAddr,
            postContainer.info.author,
            postContainer.info.communityId,
            SecurityLib.Action.deleteItem
        );

        uint256 time = CommonLib.getTimestamp();
        if (time - postContainer.info.postTime < DELETE_TIME) {      //unit test ?
            if (postContainer.info.rating > 0) {
                            UserLib.updateUserRating(userContext, postContainer.info.author,
                                -VoteLib.getUserRatingChange(   postContainer.info.postType, 
                                                                VoteLib.ResourceAction.Upvoted,
                                                                PostLib.TypeContent.Post) * postContainer.info.rating);
            }
    
            for (uint16 i = 1; i <= postContainer.info.replyCount; i++) {
                deductReplyRating(userContext, postContainer.info.postType, postContainer.replies[i], postContainer.info.bestReply == i);
            }
        }
        
        if (userAddr == postContainer.info.author)
            UserLib.updateUserRating(userContext, postContainer.info.author, VoteLib.DeleteOwnPost);
        else 
            UserLib.updateUserRating(userContext, postContainer.info.author, VoteLib.ModeratorDeletePost);

        postContainer.info.isDeleted = true;
        emit PostDeleted(userAddr, postId);
    }

    /// @notice Delete reply
    /// @param self The mapping containing all posts
    /// @param userContext All information about users
    /// @param userAddr User who deletes reply
    /// @param postId The post where will be deleted reply
    /// @param replyId Reply which will be deleted
    function deleteReply(
        PostLib.PostCollection storage self,
        UserLib.UserContext storage userContext,
        address userAddr,
        uint256 postId,
        uint16 replyId
    ) public {
        PostLib.PostContainer storage postContainer = PostLib.getPostContainer(self, postId);
        require(postContainer.info.bestReply != replyId, "You can not delete the best reply."); // unit test
        PostLib.ReplyContainer storage replyContainer = PostLib.getReplyContainerSafe(postContainer, replyId);
        SecurityLib.checkRatingAndEnergy(
            userContext.roles,
            UserLib.getUserByAddress(userContext.users, userAddr),
            userAddr,
            replyContainer.info.author,
            postContainer.info.communityId,
            SecurityLib.Action.deleteItem
        );

        uint256 time = CommonLib.getTimestamp();
        if (time - postContainer.info.postTime < DELETE_TIME) {  //unit test ?
            deductReplyRating(
                userContext,
                postContainer.info.postType,
                replyContainer,
                replyContainer.info.parentReplyId == 0 && postContainer.info.bestReply == replyId
            );
        }
        if (userAddr == replyContainer.info.author)
            UserLib.updateUserRating(userContext, replyContainer.info.author, VoteLib.DeleteOwnReply);
        else 
            UserLib.updateUserRating(userContext, replyContainer.info.author, VoteLib.ModeratorDeleteReply);

        replyContainer.info.isDeleted = true;
        postContainer.info.deletedReplyCount++;
        emit ReplyDeleted(userAddr, postId, replyId);
    }

    /// @notice Take reply rating from the author
    /// @param userContext All information about users
    /// @param postType Type post: expert, common, tutorial
    /// @param replyContainer Reply from which the rating is taken
    function deductReplyRating (
        UserLib.UserContext storage userContext,
        PostLib.PostType postType,
        PostLib.ReplyContainer storage replyContainer,
        bool isBestReply
    ) private {
        if (IpfsLib.isEmptyIpfs(replyContainer.info.ipfsDoc.hash) || replyContainer.info.isDeleted)
            return;

        int32 changeReplyAuthorRating;
        if (replyContainer.info.rating >= 0) {
            changeReplyAuthorRating -= VoteLib.getUserRatingChangeForReplyAction( postType,
                                                                            VoteLib.ResourceAction.Upvoted) * replyContainer.info.rating;
            
            // best reply

            if (replyContainer.info.isFirstReply) {
                changeReplyAuthorRating -= -VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.FirstReply);
            }
            if (replyContainer.info.isQuickReply) {
                changeReplyAuthorRating -= VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.QuickReply);
            }
            if (isBestReply && postType != PostLib.PostType.Tutorial) {
                changeReplyAuthorRating -= VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.AcceptReply);
                UserLib.updateUserRating(userContext, msg.sender, -VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.AcceptedReply));
            }
        }

        if (changeReplyAuthorRating != 0) {
            UserLib.updateUserRating(
                userContext, 
                replyContainer.info.author, 
                changeReplyAuthorRating
            );
        }
    }

    /// @notice Delete comment
    /// @param self The mapping containing all posts
    /// @param userContext All information about users
    /// @param userAddr User who deletes comment
    /// @param postId The post where will be deleted comment
    /// @param parentReplyId The reply where the reply will be deleted
    /// @param commentId Comment which will be deleted
    function deleteComment(
        PostLib.PostCollection storage self,
        UserLib.UserContext storage userContext,
        address userAddr,
        uint256 postId,
        uint16 parentReplyId,
        uint8 commentId
    ) public {
        PostLib.PostContainer storage postContainer = PostLib.getPostContainer(self, postId);
        PostLib.CommentContainer storage commentContainer = PostLib.getCommentContainerSave(postContainer, parentReplyId, commentId);
        SecurityLib.checkRatingAndEnergy(
            userContext.roles,
            UserLib.getUserByAddress(userContext.users, userAddr),
            userAddr,
            commentContainer.info.author,
            postContainer.info.communityId,
            SecurityLib.Action.deleteItem
        );

        if (userAddr == commentContainer.info.author)
            UserLib.updateUserRating(userContext, commentContainer.info.author, VoteLib.DeleteOwnComment);
        else 
            UserLib.updateUserRating(userContext, commentContainer.info.author, VoteLib.ModeratorDeleteComment);

        commentContainer.info.isDeleted = true;
        emit CommentDeleted(userAddr, postId, parentReplyId, commentId);
    }

    /// @notice Change status official reply
    /// @param self The mapping containing all posts
    /// @param roles Permissions user
    /// @param userAddr Who called action
    /// @param postId Post where will be change reply status
    /// @param replyId Reply which will change status
    function changeStatusOfficialReply(
        PostLib.PostCollection storage self,
        SecurityLib.Roles storage roles,
        address userAddr,
        uint256 postId,
        uint16 replyId
    ) public {
        // check permistion
        PostLib.PostContainer storage postContainer = PostLib.getPostContainer(self, postId);
        require((SecurityLib.hasRole(roles, SecurityLib.getCommunityRole(SecurityLib.COMMUNITY_MODERATOR_ROLE, postContainer.info.communityId), userAddr)), 
                    "Must have community moderator role");
        PostLib.getReplyContainerSafe(postContainer, replyId);
         
        if (postContainer.info.officialReply == replyId)
            postContainer.info.officialReply = 0;
        else
            postContainer.info.officialReply = replyId;
        
        emit StatusOfficialReplyChanged(userAddr, postId, postContainer.info.officialReply);
    }

    /// @notice Change status best reply
    /// @param self The mapping containing all posts
    /// @param userContext All information about users
    /// @param userAddr Who called action
    /// @param postId The post where will be change reply status
    /// @param replyId Reply which will change status
    function changeStatusBestReply (
        PostLib.PostCollection storage self,
        UserLib.UserContext storage userContext,
        address userAddr,
        uint256 postId,
        uint16 replyId
    ) public {
        PostLib.PostContainer storage postContainer = PostLib.getPostContainer(self, postId);
        PostLib.ReplyContainer storage replyContainer = PostLib.getReplyContainerSafe(postContainer, replyId);
        address replyOwner = replyContainer.info.author;        // mb rewrite

        if (postContainer.info.bestReply == replyId) {
            if (replyContainer.info.author != userAddr) {       // unit test
                UserLib.updateUserRating(userContext, replyContainer.info.author, -VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.AcceptReply));
                UserLib.updateUserRating(userContext, userAddr, -VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.AcceptedReply));
            }
            postContainer.info.bestReply = 0;
        } else {
            if (postContainer.info.bestReply != 0) {
                PostLib.ReplyContainer storage oldBestReplyContainer = PostLib.getReplyContainerSafe(postContainer, replyId);

                if (oldBestReplyContainer.info.author != userAddr) {    // unit test
                    UserLib.updateUserRating(userContext, oldBestReplyContainer.info.author, -VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.AcceptReply));
                    UserLib.updateUserRating(userContext, userAddr, -VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.AcceptedReply));
                }
                replyOwner = oldBestReplyContainer.info.author;
            }

            if (replyContainer.info.author != userAddr) {   // unit test
                UserLib.updateUserRating(userContext, replyContainer.info.author, VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.AcceptReply));
                UserLib.updateUserRating(userContext, userAddr, VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.AcceptedReply));
            }
            postContainer.info.bestReply = replyId;
        }

        SecurityLib.checkRatingAndEnergy(
            userContext.roles,
            UserLib.getUserByAddress(userContext.users, userAddr),
            userAddr,
            replyOwner,
            postContainer.info.communityId,
            SecurityLib.Action.bestReply
        );    // unit test (forum)

        emit StatusBestReplyChanged(userAddr, postId, postContainer.info.bestReply);
    }
}