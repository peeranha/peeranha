//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./VoteLib.sol";
import "./UserLib.sol";
import "./AchievementLib.sol";
import "../interfaces/IPeeranhaUser.sol";
import "../interfaces/IPeeranhaCommunity.sol";

/// @title PostLib
/// @notice Provides information about operation with posts
/// @dev posts information is stored in the mapping on the main contract
library PostLib  {
    using UserLib for UserLib.UserCollection;
    uint256 constant DELETE_TIME = 604800;    //7 days (10)     // name??

    enum VoteDirection { downVote, cancelDownVote, upVote, cancelUpVote }
    enum PostType { ExpertPost, CommonPost, Tutorial }
    enum TypeContent { Post, Reply, Comment }

    struct Comment {
        CommonLib.IpfsHash ipfsDoc;
        address author;
        int32 rating;
        uint32 postTime;
        uint8 propertyCount;
        bool isDeleted;
    }

    struct CommentContainer {
        Comment info;
        mapping(uint8 => bytes32) properties;
        mapping(address => int256) historyVotes;
        address[] votedUsers;
    }

    struct Reply {
        CommonLib.IpfsHash ipfsDoc;
        address author;
        int32 rating;
        uint32 postTime;
        uint16 parentReplyId;
        uint8 commentCount;
        uint8 propertyCount;

        bool isFirstReply;
        bool isQuickReply;
        bool isDeleted;
    }

    struct ReplyContainer {
        Reply info;
        mapping(uint8 => CommentContainer) comments;
        mapping(uint8 => bytes32) properties;
        mapping(address => int256) historyVotes;
        address[] votedUsers;
    }

    struct Post {
        PostType postType;
        address author;
        int32 rating;
        uint32 postTime;
        uint32 communityId;

        uint16 officialReply;
        uint16 bestReply;
        uint8 propertyCount;
        uint8 commentCount;
        uint16 replyCount;
        uint16 deletedReplyCount;
        bool isDeleted;

        uint8[] tags;
        CommonLib.IpfsHash ipfsDoc;
    }

    struct PostContainer {
        Post info;
        mapping(uint16 => ReplyContainer) replies;
        mapping(uint8 => CommentContainer) comments;
        mapping(uint8 => bytes32) properties;
        mapping(address => int256) historyVotes;
        address[] votedUsers;
    }

    struct PostCollection {
        mapping(uint256 => PostContainer) posts;
        uint256 postCount;
        IPeeranhaCommunity peeranhaCommunity;
        IPeeranhaUser peeranhaUser; 
    }

    event PostCreated(address indexed user, uint32 indexed communityId, uint256 indexed postId); 
    event ReplyCreated(address indexed user, uint256 indexed postId, uint16 parentReplyId, uint16 replyId);
    event CommentCreated(address indexed user, uint256 indexed postId, uint16 parentReplyId, uint8 commentId);
    event PostEdited(address indexed user, uint256 indexed postId);
    event ReplyEdited(address indexed user, uint256 indexed postId, uint16 replyId);
    event CommentEdited(address indexed user, uint256 indexed postId, uint16 parentReplyId, uint8 commentId);
    event PostDeleted(address indexed user, uint256 indexed postId);
    event ReplyDeleted(address indexed user, uint256 indexed postId, uint16 replyId);
    event CommentDeleted(address indexed user, uint256 indexed postId, uint16 parentReplyId, uint8 commentId);
    event StatusOfficialReplyChanged(address indexed user, uint256 indexed postId, uint16 replyId);
    event StatusBestReplyChanged(address indexed user, uint256 indexed postId, uint16 replyId);
    event ForumItemVoted(address indexed user, uint256 indexed postId, uint16 replyId, uint8 commentId, VoteDirection voteDirection);
    event ChangePostType(address indexed user, uint256 indexed postId, PostType newPostType);

    /// @notice Publication post 
    /// @param self The mapping containing all posts
    /// @param userAddr Author of the post
    /// @param communityId Community where the post will be ask
    /// @param ipfsHash IPFS hash of document with post information
    function createPost(
        PostCollection storage self,
        address userAddr,
        uint32 communityId, 
        bytes32 ipfsHash,
        PostType postType,
        uint8[] memory tags
    ) public {
        self.peeranhaCommunity.onlyExistingAndNotFrozenCommunity(communityId);
        self.peeranhaCommunity.checkTags(communityId, tags);
        
        self.peeranhaUser.checkPermission(
            userAddr,
            userAddr,
            communityId,
            UserLib.Action.publicationPost,
            UserLib.Permission.NONE,
            true
        );

        require(!CommonLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");
        require(tags.length > 0, "At least one tag is required.");

        PostContainer storage post = self.posts[++self.postCount];
        post.info.ipfsDoc.hash = ipfsHash;
        post.info.postType = postType;
        post.info.author = userAddr;
        post.info.postTime = CommonLib.getTimestamp();
        post.info.communityId = communityId;
        post.info.tags = tags;

        emit PostCreated(userAddr, communityId, self.postCount);
    }

    /// @notice Post reply
    /// @param self The mapping containing all posts
    /// @param userAddr Author of the reply
    /// @param postId The post where the reply will be post
    /// @param parentReplyId The reply where the reply will be post
    /// @param ipfsHash IPFS hash of document with reply information
    /// @param isOfficialReply Flag is showing "official reply" or not
    function createReply(
        PostCollection storage self,
        address userAddr,
        uint256 postId,
        uint16 parentReplyId,
        bytes32 ipfsHash,
        bool isOfficialReply
    ) public {
        PostContainer storage postContainer = getPostContainer(self, postId);
        require(postContainer.info.postType != PostType.Tutorial, "You can not publish replies in tutorial.");

        self.peeranhaUser.checkPermission(
            userAddr,
            postContainer.info.author,
            postContainer.info.communityId,
            UserLib.Action.publicationReply,
            parentReplyId == 0 && isOfficialReply ? 
                UserLib.Permission.communityModerator :
                UserLib.Permission.NONE,
            true
        );

        /*  
            Check gas one more 
            isOfficialReply ? UserLib.Action.publicationOfficialReply : UserLib.Action.publicationReply
            remove: require((UserLib.hasRole(userContex ...
            20k in gas contract, +20 gas in common reply (-20 in official reply), but Avg gas -20 ?
         */
        require(!CommonLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");
        require(
            parentReplyId == 0 || 
            (postContainer.info.postType != PostType.ExpertPost && postContainer.info.postType != PostType.CommonPost), 
            "User is forbidden to reply on reply for Expert and Common type of posts"
        ); // unit tests (reply on reply)

        ReplyContainer storage replyContainer;
        if (postContainer.info.postType == PostType.ExpertPost || postContainer.info.postType == PostType.CommonPost) {
          uint16 countReplies = uint16(postContainer.info.replyCount);

          for (uint16 i = 1; i <= countReplies; i++) {
            replyContainer = getReplyContainer(postContainer, i);
            require(userAddr != replyContainer.info.author || replyContainer.info.isDeleted,
                "Users can not publish 2 replies for expert and common posts.");
          }
        }

        replyContainer = postContainer.replies[++postContainer.info.replyCount];
        uint32 timestamp = CommonLib.getTimestamp();
        if (parentReplyId == 0) {
            if (isOfficialReply) {
                postContainer.info.officialReply = postContainer.info.replyCount;
            }

            if (postContainer.info.postType != PostType.Tutorial && postContainer.info.author != userAddr) {
                if (postContainer.info.replyCount - postContainer.info.deletedReplyCount == 1) {    // unit test
                    replyContainer.info.isFirstReply = true;
                    self.peeranhaUser.updateUserRating(userAddr, VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.FirstReply), postContainer.info.communityId);
                }
                if (timestamp - postContainer.info.postTime < CommonLib.QUICK_REPLY_TIME_SECONDS) {
                    replyContainer.info.isQuickReply = true;
                    self.peeranhaUser.updateUserRating(userAddr, VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.QuickReply), postContainer.info.communityId);
                }
            }
        } else {
          getReplyContainerSafe(postContainer, parentReplyId);
          replyContainer.info.parentReplyId = parentReplyId;  
        }

        replyContainer.info.author = userAddr;
        replyContainer.info.ipfsDoc.hash = ipfsHash;
        replyContainer.info.postTime = timestamp;

        emit ReplyCreated(userAddr, postId, parentReplyId, postContainer.info.replyCount);
    }

    /// @notice Post comment
    /// @param self The mapping containing all posts
    /// @param userAddr Author of the comment
    /// @param postId The post where the comment will be post
    /// @param parentReplyId The reply where the comment will be post
    /// @param ipfsHash IPFS hash of document with comment information
    function createComment(
        PostCollection storage self,
        address userAddr,
        uint256 postId,
        uint16 parentReplyId,
        bytes32 ipfsHash
    ) public {
        PostContainer storage postContainer = getPostContainer(self, postId);
        require(!CommonLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");

        Comment storage comment;    ///
        uint8 commentId;            // struct ?
        address author;             ///
        if (parentReplyId == 0) {
            commentId = ++postContainer.info.commentCount;
            comment = postContainer.comments[commentId].info;
            author = postContainer.info.author;
        } else {
            ReplyContainer storage replyContainer = getReplyContainerSafe(postContainer, parentReplyId);
            commentId = ++replyContainer.info.commentCount;
            comment = replyContainer.comments[commentId].info;
            author = replyContainer.info.author;
        }

        self.peeranhaUser.checkPermission(
            userAddr,
            author,
            postContainer.info.communityId,
            UserLib.Action.publicationComment,
            UserLib.Permission.NONE,
            true
        );

        comment.author = userAddr;
        comment.ipfsDoc.hash = ipfsHash;
        comment.postTime = CommonLib.getTimestamp();

        emit CommentCreated(userAddr, postId, parentReplyId, commentId);
    }

    /// @notice Edit post
    /// @param self The mapping containing all posts
    /// @param userAddr Author of the comment
    /// @param postId The post where the comment will be post
    /// @param ipfsHash IPFS hash of document with post information
    function editPost(
        PostCollection storage self,
        address userAddr,
        uint256 postId,
        bytes32 ipfsHash,
        uint8[] memory tags
    ) public {
        PostContainer storage postContainer = getPostContainer(self, postId);
        self.peeranhaCommunity.checkTags(postContainer.info.communityId, tags);

        self.peeranhaUser.checkPermission(
            userAddr,
            postContainer.info.author,
            postContainer.info.communityId,
            UserLib.Action.editItem,
            UserLib.Permission.NONE,
            false
        );
        require(!CommonLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");
        require(userAddr == postContainer.info.author, "You can not edit this post. It is not your.");      // error for moderator (fix? will add new flag)

        if(!CommonLib.isEmptyIpfs(ipfsHash) && postContainer.info.ipfsDoc.hash != ipfsHash)
            postContainer.info.ipfsDoc.hash = ipfsHash;
        if (tags.length > 0)
            postContainer.info.tags = tags;

        emit PostEdited(userAddr, postId);
    }

    /// @notice Edit reply
    /// @param self The mapping containing all posts
    /// @param userAddr Author of the comment
    /// @param postId The post where the comment will be post
    /// @param replyId The reply which will be change
    /// @param ipfsHash IPFS hash of document with reply information
    function editReply(
        PostCollection storage self,
        address userAddr,
        uint256 postId,
        uint16 replyId,
        bytes32 ipfsHash
    ) public {
        PostContainer storage postContainer = getPostContainer(self, postId);
        ReplyContainer storage replyContainer = getReplyContainerSafe(postContainer, replyId);
        self.peeranhaUser.checkPermission(
            userAddr,
            replyContainer.info.author,
            postContainer.info.communityId,
            UserLib.Action.editItem,
            UserLib.Permission.NONE,
            false
        );
        require(!CommonLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");
        require(userAddr == replyContainer.info.author, "You can not edit this Reply. It is not your.");

        if (replyContainer.info.ipfsDoc.hash != ipfsHash)
            replyContainer.info.ipfsDoc.hash = ipfsHash;
        
        emit ReplyEdited(userAddr, postId, replyId);
    }

    /// @notice Edit comment
    /// @param self The mapping containing all posts
    /// @param userAddr Author of the comment
    /// @param postId The post where the comment will be post
    /// @param parentReplyId The reply where the reply will be edit
    /// @param commentId The comment which will be change
    /// @param ipfsHash IPFS hash of document with comment information
    function editComment(
        PostCollection storage self,
        address userAddr,
        uint256 postId,
        uint16 parentReplyId,
        uint8 commentId,
        bytes32 ipfsHash
    ) public {
        PostContainer storage postContainer = getPostContainer(self, postId);
        CommentContainer storage commentContainer = getCommentContainerSave(postContainer, parentReplyId, commentId);
        self.peeranhaUser.checkPermission(
            userAddr,
            commentContainer.info.author,
            postContainer.info.communityId,
            UserLib.Action.editItem,
            UserLib.Permission.NONE,
            false
        );
        require(!CommonLib.isEmptyIpfs(ipfsHash), "Invalid ipfsHash.");
        require(userAddr == commentContainer.info.author, "You can not edit this comment. It is not your.");

        if (commentContainer.info.ipfsDoc.hash != ipfsHash)
            commentContainer.info.ipfsDoc.hash = ipfsHash;
        
        emit CommentEdited(userAddr, postId, parentReplyId, commentId);
    }

    /// @notice Delete post
    /// @param self The mapping containing all posts
    /// @param userAddr User who deletes post
    /// @param postId Post which will be deleted
    function deletePost(
        PostCollection storage self,
        address userAddr,
        uint256 postId
    ) public {
        PostContainer storage postContainer = getPostContainer(self, postId);
        self.peeranhaUser.checkPermission(
            userAddr,
            postContainer.info.author,
            postContainer.info.communityId,
            UserLib.Action.deleteItem,
            UserLib.Permission.NONE,
            false
        );

        uint256 time = CommonLib.getTimestamp();
        if (time - postContainer.info.postTime < DELETE_TIME || userAddr == postContainer.info.author) {
            VoteLib.StructRating memory typeRating = getTypesRating(postContainer.info.postType);
            (int32 positive, int32 negative) = getHistoryInformations(postContainer.historyVotes, postContainer.votedUsers, postContainer.votedUsers.length);

            int32 changeUserRating = typeRating.upvotedPost * positive + typeRating.downvotedPost * negative;
            if (changeUserRating > 0) {
                self.peeranhaUser.updateUserRating(
                    postContainer.info.author,
                    -changeUserRating,
                    postContainer.info.communityId
                );
            }
        }
        if (postContainer.info.bestReply != 0) {
            self.peeranhaUser.updateUserRating(postContainer.info.author, -VoteLib.getUserRatingChangeForReplyAction(postContainer.info.postType, VoteLib.ResourceAction.AcceptedReply), postContainer.info.communityId);
        }

        if (time - postContainer.info.postTime < DELETE_TIME) {    
            for (uint16 i = 1; i <= postContainer.info.replyCount; i++) {
                deductReplyRating(self, postContainer.info.postType, postContainer.replies[i], postContainer.info.bestReply == i, postContainer.info.communityId);
            }
        }
        
        if (userAddr == postContainer.info.author)
            self.peeranhaUser.updateUserRating(postContainer.info.author, VoteLib.DeleteOwnPost, postContainer.info.communityId);
        else
            self.peeranhaUser.updateUserRating(postContainer.info.author, VoteLib.ModeratorDeletePost, postContainer.info.communityId);

        postContainer.info.isDeleted = true;
        emit PostDeleted(userAddr, postId);
    }

    /// @notice Delete reply
    /// @param self The mapping containing all posts
    /// @param userAddr User who deletes reply
    /// @param postId The post where will be deleted reply
    /// @param replyId Reply which will be deleted
    function deleteReply(
        PostCollection storage self,
        address userAddr,
        uint256 postId,
        uint16 replyId
    ) public {
        PostContainer storage postContainer = getPostContainer(self, postId);
        ReplyContainer storage replyContainer = getReplyContainerSafe(postContainer, replyId);
        self.peeranhaUser.checkPermission(
            userAddr,
            replyContainer.info.author,
            postContainer.info.communityId,
            UserLib.Action.deleteItem,
            UserLib.Permission.NONE,
            false
        );
        ///
        // bug
        // checkPermission has check "require(actionCaller == dataUser, "not_allowed_delete");"
        // behind this check is "if actionCaller == moderator -> return"
        // in this step can be only a moderator or reply's owner
        // a reply owner can not delete best reply, but a moderator can
        // next require check that reply's owner can not delete best reply
        // bug if reply's owner is moderator any way error
        ///
        require(postContainer.info.bestReply != replyId || userAddr != replyContainer.info.author, "You can not delete the best reply.");


        uint256 time = CommonLib.getTimestamp();
        if (time - replyContainer.info.postTime < DELETE_TIME || userAddr == replyContainer.info.author) {
            deductReplyRating(
                self,
                postContainer.info.postType,
                replyContainer,
                replyContainer.info.parentReplyId == 0 && postContainer.info.bestReply == replyId,
                postContainer.info.communityId
            );
        }
        if (userAddr == replyContainer.info.author)
            self.peeranhaUser.updateUserRating(replyContainer.info.author, VoteLib.DeleteOwnReply, postContainer.info.communityId);
        else
            self.peeranhaUser.updateUserRating(replyContainer.info.author, VoteLib.ModeratorDeleteReply, postContainer.info.communityId);

        replyContainer.info.isDeleted = true;
        postContainer.info.deletedReplyCount++;
        emit ReplyDeleted(userAddr, postId, replyId);
    }

    /// @notice Take reply rating from the author
    /// @param postType Type post: expert, common, tutorial
    /// @param replyContainer Reply from which the rating is taken
    function deductReplyRating (
        PostCollection storage self,
        PostType postType,
        ReplyContainer storage replyContainer,
        bool isBestReply,
        uint32 communityId
    ) private {
        if (CommonLib.isEmptyIpfs(replyContainer.info.ipfsDoc.hash) || replyContainer.info.isDeleted)
            return;

        int32 changeReplyAuthorRating;
        if (replyContainer.info.rating >= 0) {
            if (replyContainer.info.isFirstReply) {
                changeReplyAuthorRating += -VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.FirstReply);
            }
            if (replyContainer.info.isQuickReply) {
                changeReplyAuthorRating += -VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.QuickReply);
            }
            if (isBestReply && postType != PostType.Tutorial) {
                changeReplyAuthorRating += -VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.AcceptReply);
            }
        }

        // change user rating considering reply rating
        VoteLib.StructRating memory typeRating = getTypesRating(postType);
        (int32 positive, int32 negative) = getHistoryInformations(replyContainer.historyVotes, replyContainer.votedUsers, replyContainer.votedUsers.length);
        int32 changeUserRating = typeRating.upvotedReply * positive + typeRating.downvotedReply * negative;
        if (changeUserRating > 0) {
            changeReplyAuthorRating += -changeUserRating;
        }

        if (changeReplyAuthorRating != 0) {
            self.peeranhaUser.updateUserRating(
                replyContainer.info.author, 
                changeReplyAuthorRating,
                communityId
            );
        }
    }

    /// @notice Delete comment
    /// @param self The mapping containing all posts
    /// @param userAddr User who deletes comment
    /// @param postId The post where will be deleted comment
    /// @param parentReplyId The reply where the reply will be deleted
    /// @param commentId Comment which will be deleted
    function deleteComment(
        PostCollection storage self,
        address userAddr,
        uint256 postId,
        uint16 parentReplyId,
        uint8 commentId
    ) public {
        PostContainer storage postContainer = getPostContainer(self, postId);
        CommentContainer storage commentContainer = getCommentContainerSave(postContainer, parentReplyId, commentId);
        self.peeranhaUser.checkPermission(
            userAddr,
            commentContainer.info.author,
            postContainer.info.communityId,
            UserLib.Action.deleteItem,
            UserLib.Permission.NONE,
            false
        );

        if (userAddr == commentContainer.info.author)
            self.peeranhaUser.updateUserRating(commentContainer.info.author, VoteLib.DeleteOwnComment, postContainer.info.communityId);
        else
            self.peeranhaUser.updateUserRating(commentContainer.info.author, VoteLib.ModeratorDeleteComment, postContainer.info.communityId);

        commentContainer.info.isDeleted = true;
        emit CommentDeleted(userAddr, postId, parentReplyId, commentId);
    }

    /// @notice Change status official reply
    /// @param self The mapping containing all posts
    /// @param userAddr Who called action
    /// @param postId Post where will be change reply status
    /// @param replyId Reply which will change status
    function changeStatusOfficialReply(
        PostCollection storage self,
        address userAddr,
        uint256 postId,
        uint16 replyId
    ) public {
        // check + energy?
        PostContainer storage postContainer = getPostContainer(self, postId);
        self.peeranhaUser.checkPermission(
            userAddr,
            userAddr,
            postContainer.info.communityId,
            UserLib.Action.NONE,
            UserLib.Permission.communityModerator,
            false
        );

        getReplyContainerSafe(postContainer, replyId);
         
        if (postContainer.info.officialReply == replyId)
            postContainer.info.officialReply = 0;
        else
            postContainer.info.officialReply = replyId;
        
        emit StatusOfficialReplyChanged(userAddr, postId, postContainer.info.officialReply);
    }

    /// @notice Change status best reply
    /// @param self The mapping containing all posts
    /// @param userAddr Who called action
    /// @param postId The post where will be change reply status
    /// @param replyId Reply which will change status
    function changeStatusBestReply (
        PostCollection storage self,
        address userAddr,
        uint256 postId,
        uint16 replyId
    ) public {
        PostContainer storage postContainer = getPostContainer(self, postId);
        require(postContainer.info.author == userAddr, "Only owner by post can change statust best reply.");
        ReplyContainer storage replyContainer = getReplyContainerSafe(postContainer, replyId);

        if (postContainer.info.bestReply == replyId) {
            updateRatingForBestReply(self, postContainer.info.postType, userAddr, replyContainer.info.author, false, postContainer.info.communityId);
            postContainer.info.bestReply = 0;
        } else {
            if (postContainer.info.bestReply != 0) {
                ReplyContainer storage oldBestReplyContainer = getReplyContainerSafe(postContainer, postContainer.info.bestReply);

                updateRatingForBestReply(self, postContainer.info.postType, userAddr, oldBestReplyContainer.info.author, false, postContainer.info.communityId);
            }

            updateRatingForBestReply(self, postContainer.info.postType, userAddr, replyContainer.info.author, true, postContainer.info.communityId);
            postContainer.info.bestReply = replyId;
        }
        self.peeranhaUser.checkPermission(
            userAddr,
            postContainer.info.author,
            postContainer.info.communityId,
            UserLib.Action.bestReply,
            UserLib.Permission.NONE,
            false
        );  // unit test (forum)

        emit StatusBestReplyChanged(userAddr, postId, postContainer.info.bestReply);
    }

    function updateRatingForBestReply (
        PostCollection storage self,
        PostType postType,
        address authorPost,
        address authorReply,
        bool isMark,
        uint32 communityId
    ) private {
        if (authorPost != authorReply) {
            self.peeranhaUser.updateUserRating(
                authorPost, 
                isMark ?
                    VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.AcceptedReply) :
                    -VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.AcceptedReply),
                communityId
            );

            self.peeranhaUser.updateUserRating(
                authorReply,
                isMark ?
                    VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.AcceptReply) :
                    -VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.AcceptReply),
                communityId
            );
        }
    }

    /// @notice Vote for post, reply or comment
    /// @param self The mapping containing all posts
    /// @param userAddr Who called action
    /// @param postId Post where will be change rating
    /// @param replyId Reply which will be change rating
    /// @param commentId Comment which will be change rating
    /// @param isUpvote Upvote or downvote
    // TODO voteDirection upvote/downvote cancel upbote, cancel downVote
    function voteForumItem(
        PostCollection storage self,
        address userAddr,
        uint256 postId,
        uint16 replyId,
        uint8 commentId,
        bool isUpvote
    ) public {
        PostContainer storage postContainer = getPostContainer(self, postId);
        PostType postType = postContainer.info.postType;

        VoteDirection voteDirection;
        if (commentId != 0) {
            CommentContainer storage commentContainer = getCommentContainerSave(postContainer, replyId, commentId);
            require(userAddr != commentContainer.info.author, "You can not vote for own comment.");
            voteDirection = voteComment(self, commentContainer, postContainer.info.communityId, userAddr, isUpvote);

        } else if (replyId != 0) {
            ReplyContainer storage replyContainer = getReplyContainerSafe(postContainer, replyId);
            require(userAddr != replyContainer.info.author, "You can not vote for own reply.");
            voteDirection = voteReply(self, replyContainer, postContainer.info.communityId, userAddr, postType, isUpvote);


        } else {
            require(userAddr != postContainer.info.author, "You can not vote for own post.");
            voteDirection = votePost(self, postContainer, userAddr, postType, isUpvote);
        }

        emit ForumItemVoted(userAddr, postId, replyId, commentId, voteDirection);
    }

    // @notice Vote for post
    /// @param self The mapping containing all posts
    /// @param postContainer Post where will be change rating
    /// @param votedUser User who voted
    /// @param postType Type post expert, common, tutorial
    /// @param isUpvote Upvote or downvote
    function votePost(
        PostCollection storage self,
        PostContainer storage postContainer,
        address votedUser,
        PostType postType,
        bool isUpvote
    ) public returns (VoteDirection) {
        (int32 ratingChange, bool isCancel) = VoteLib.getForumItemRatingChange(votedUser, postContainer.historyVotes, isUpvote, postContainer.votedUsers);
        self.peeranhaUser.checkPermission(
            votedUser,
            postContainer.info.author,
            postContainer.info.communityId,
            isCancel ?
                UserLib.Action.cancelVote :
                (ratingChange > 0 ?
                    UserLib.Action.upVotePost :
                    UserLib.Action.downVotePost
                ),
            UserLib.Permission.NONE,
            false
        ); 

        vote(self, postContainer.info.author, votedUser, postType, isUpvote, ratingChange, TypeContent.Post, postContainer.info.communityId);
        postContainer.info.rating += ratingChange;
        
        return isCancel ?
                (ratingChange < 0 ?
                    VoteDirection.cancelUpVote :
                    VoteDirection.cancelDownVote 
                ) :
                (ratingChange > 0 ?
                    VoteDirection.upVote :
                    VoteDirection.downVote
                );
    }
 
    // @notice Vote for reply
    /// @param self The mapping containing all posts
    /// @param replyContainer Reply where will be change rating
    /// @param votedUser User who voted
    /// @param postType Type post expert, common, tutorial
    /// @param isUpvote Upvote or downvote
    function voteReply(
        PostCollection storage self,
        ReplyContainer storage replyContainer,
        uint32 communityId,
        address votedUser,
        PostType postType,
        bool isUpvote
    ) public returns (VoteDirection) {
        (int32 ratingChange, bool isCancel) = VoteLib.getForumItemRatingChange(votedUser, replyContainer.historyVotes, isUpvote, replyContainer.votedUsers);
        self.peeranhaUser.checkPermission(
            votedUser,
            replyContainer.info.author,
            communityId,
            isCancel ?
                UserLib.Action.cancelVote :
                (ratingChange > 0 ?
                    UserLib.Action.upVoteReply :
                    UserLib.Action.downVoteReply
                ),
            UserLib.Permission.NONE,
            false
        ); 

        vote(self, replyContainer.info.author, votedUser, postType, isUpvote, ratingChange, TypeContent.Reply, communityId);
        int32 oldRating = replyContainer.info.rating;
        replyContainer.info.rating += ratingChange;
        int32 newRating = replyContainer.info.rating; // or oldRating + ratingChange gas

        if (replyContainer.info.isFirstReply) {
            if (oldRating < 0 && newRating >= 0) {
                self.peeranhaUser.updateUserRating(replyContainer.info.author, VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.FirstReply), communityId);
            } else if (oldRating >= 0 && newRating < 0) {
                self.peeranhaUser.updateUserRating(replyContainer.info.author, -VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.FirstReply), communityId);
            }
        }

        if (replyContainer.info.isQuickReply) {
            if (oldRating < 0 && newRating >= 0) {
                self.peeranhaUser.updateUserRating(replyContainer.info.author, VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.QuickReply), communityId);
            } else if (oldRating >= 0 && newRating < 0) {
                self.peeranhaUser.updateUserRating(replyContainer.info.author, -VoteLib.getUserRatingChangeForReplyAction(postType, VoteLib.ResourceAction.QuickReply), communityId);
            }
        }

        return isCancel ?
            (ratingChange < 0 ?
                VoteDirection.cancelUpVote :
                VoteDirection.cancelDownVote 
            ) :
            (ratingChange > 0 ?
                VoteDirection.upVote :
                VoteDirection.downVote
            );
    }

    // @notice Vote for comment
    /// @param self The mapping containing all posts
    /// @param commentContainer Comment where will be change rating
    /// @param votedUser User who voted
    /// @param isUpvote Upvote or downvote
    function voteComment(
        PostCollection storage self,
        CommentContainer storage commentContainer,
        uint32 communityId,
        address votedUser,
        bool isUpvote
    ) private returns (VoteDirection) {
        (int32 ratingChange, bool isCancel) = VoteLib.getForumItemRatingChange(votedUser, commentContainer.historyVotes, isUpvote, commentContainer.votedUsers);
        self.peeranhaUser.checkPermission(
            votedUser,
            commentContainer.info.author,
            communityId,
            isCancel ? 
                UserLib.Action.cancelVote :
                UserLib.Action.voteComment,
            UserLib.Permission.NONE,
            false
        );

        commentContainer.info.rating += ratingChange;

        return isCancel ?
            (ratingChange < 0 ?
                VoteDirection.cancelUpVote :
                VoteDirection.cancelDownVote 
            ) :
            (ratingChange > 0 ?
                VoteDirection.upVote :
                VoteDirection.downVote
            );
    }

    // @notice Сount users' rating after voting per a reply or post
    /// @param self The mapping containing all posts
    /// @param author Author post, reply or comment where voted
    /// @param votedUser User who voted
    /// @param postType Type post expert, common, tutorial
    /// @param isUpvote Upvote or downvote
    /// @param ratingChanged The value shows how the rating of a post or reply has changed.
    /// @param typeContent Type content post, reply or comment
    function vote (
        PostCollection storage self,
        address author,
        address votedUser,
        PostType postType,
        bool isUpvote,
        int32 ratingChanged,
        TypeContent typeContent,
        uint32 communityId
    ) private {
       UserLib.UserRatingChange[] memory usersRating = new UserLib.UserRatingChange[](2);

        if (isUpvote) {
            usersRating[0].user = author;
            usersRating[0].rating = VoteLib.getUserRatingChange(postType, VoteLib.ResourceAction.Upvoted, typeContent);

            if (ratingChanged == 2) {
                usersRating[0].rating += VoteLib.getUserRatingChange(postType, VoteLib.ResourceAction.Downvoted, typeContent) * -1;

                usersRating[1].user = votedUser;
                usersRating[1].rating = VoteLib.getUserRatingChange(postType, VoteLib.ResourceAction.Downvote, typeContent) * -1; 
            }

            if (ratingChanged < 0) {
                usersRating[0].rating *= -1;
                usersRating[1].rating *= -1;
            } 
        } else {
            usersRating[0].user = author;
            usersRating[0].rating = VoteLib.getUserRatingChange(postType, VoteLib.ResourceAction.Downvoted, typeContent);

            usersRating[1].user = votedUser;
            usersRating[1].rating = VoteLib.getUserRatingChange(postType, VoteLib.ResourceAction.Downvote, typeContent);

            if (ratingChanged == -2) {
                usersRating[0].rating += VoteLib.getUserRatingChange(postType, VoteLib.ResourceAction.Upvoted, typeContent) * -1;
            }

            if (ratingChanged > 0) {
                usersRating[0].rating *= -1;
                usersRating[1].rating *= -1;  
            }
        }
        self.peeranhaUser.updateUsersRating(usersRating, communityId);
    }

    function changePostType(
        PostCollection storage self,
        address userAddr,
        uint256 postId,
        PostType newPostType
    ) public {
        PostContainer storage postContainer = getPostContainer(self, postId);
        self.peeranhaUser.checkPermission(
            userAddr,
            userAddr,
            postContainer.info.communityId,
            UserLib.Action.NONE,
            UserLib.Permission.adminOrCommunityModerator,       // will chech
            false
        );
        require(newPostType != postContainer.info.postType, "This post type is already set.");
        
        VoteLib.StructRating memory oldTypeRating = getTypesRating(postContainer.info.postType);
        VoteLib.StructRating memory newTypeRating = getTypesRating(newPostType);

        int32 positive;
        int32 negative;
        for (uint32 i; i < postContainer.votedUsers.length; i++) {
            if(postContainer.historyVotes[postContainer.votedUsers[i]] == 1) positive++;
            else if(postContainer.historyVotes[postContainer.votedUsers[i]] == -1) negative++;
        }
        int32 changeUserRating = (newTypeRating.upvotedPost - oldTypeRating.upvotedPost) * positive +
                                (newTypeRating.downvotedPost - oldTypeRating.downvotedPost) * negative;
        self.peeranhaUser.updateUserRating(postContainer.info.author, changeUserRating, postContainer.info.communityId);

        for (uint16 replyId = 1; replyId <= postContainer.info.replyCount; replyId++) {
            ReplyContainer storage replyContainer = getReplyContainer(postContainer, replyId);
            positive = 0;
            negative = 0;
            for (uint32 i; i < replyContainer.votedUsers.length; i++) {
                if(replyContainer.historyVotes[replyContainer.votedUsers[i]] == 1) positive++;
                else if (replyContainer.historyVotes[replyContainer.votedUsers[i]] == -1) negative++;
            }

            changeUserRating = (newTypeRating.upvotedReply - oldTypeRating.upvotedReply) * positive +
                                    (newTypeRating.downvotedReply - oldTypeRating.downvotedReply) * negative;
            if (replyContainer.info.isFirstReply) {
                changeUserRating += newTypeRating.firstReply - oldTypeRating.firstReply;
            }
            if (replyContainer.info.isQuickReply) {
                changeUserRating += newTypeRating.quickReply - oldTypeRating.quickReply;
            }

            self.peeranhaUser.updateUserRating(replyContainer.info.author, changeUserRating, postContainer.info.communityId);
        }

        if (postContainer.info.bestReply != 0) {
            self.peeranhaUser.updateUserRating(postContainer.info.author, newTypeRating.acceptedReply - oldTypeRating.acceptedReply, postContainer.info.communityId);
            self.peeranhaUser.updateUserRating(
                getReplyContainerSafe(postContainer, postContainer.info.bestReply).info.author,
                newTypeRating.acceptReply - oldTypeRating.acceptReply,
                postContainer.info.communityId
            );
        }

        postContainer.info.postType = newPostType;
        emit ChangePostType(userAddr, postId, newPostType);
    }

    function getTypesRating(        //name?
        PostType postType
    ) private pure returns (VoteLib.StructRating memory) {
        if (postType == PostType.ExpertPost)
            return VoteLib.getExpertRating();
        else if (postType == PostType.CommonPost)
            return VoteLib.getCommonRating();
        else if (postType == PostType.Tutorial)
            return VoteLib.getTutorialRating();
        
        revert("invalid_post_type");
    }

    /// @notice Return post
    /// @param self The mapping containing all posts
    /// @param postId The postId which need find
    function getPostContainer(
        PostCollection storage self,
        uint256 postId
    ) public view returns (PostContainer storage) {
        PostContainer storage post = self.posts[postId];
        require(!CommonLib.isEmptyIpfs(post.info.ipfsDoc.hash), "Post does not exist.");
        require(!post.info.isDeleted, "Post has been deleted.");
        
        return post;
    }

    /// @notice Return reply, the reply is not checked on delete one
    /// @param postContainer The post where is the reply
    /// @param replyId The replyId which need find
    function getReplyContainer(
        PostContainer storage postContainer,
        uint16 replyId
    ) public view returns (ReplyContainer storage) {
        ReplyContainer storage replyContainer = postContainer.replies[replyId];

        require(!CommonLib.isEmptyIpfs(replyContainer.info.ipfsDoc.hash), "Reply does not exist.");
        return replyContainer;
    }

    /// @notice Return reply, the reply is checked on delete one
    /// @param postContainer The post where is the reply
    /// @param replyId The replyId which need find
    function getReplyContainerSafe(
        PostContainer storage postContainer,
        uint16 replyId
    ) public view returns (ReplyContainer storage) {
        ReplyContainer storage replyContainer = getReplyContainer(postContainer, replyId);
        require(!replyContainer.info.isDeleted, "Reply has been deleted.");

        return replyContainer;
    }

    /// @notice Return comment, the comment is not checked on delete one
    /// @param postContainer The post where is the comment
    /// @param parentReplyId The parent reply
    /// @param commentId The commentId which need find
    function getCommentContainer(
        PostContainer storage postContainer,
        uint16 parentReplyId,
        uint8 commentId
    ) public view returns (CommentContainer storage) {
        CommentContainer storage commentContainer;

        if (parentReplyId == 0) {
            commentContainer = postContainer.comments[commentId];  
        } else {
            ReplyContainer storage reply = getReplyContainerSafe(postContainer, parentReplyId);
            commentContainer = reply.comments[commentId];
        }
        require(!CommonLib.isEmptyIpfs(commentContainer.info.ipfsDoc.hash), "Comment does not exist.");

        return commentContainer;
    }

    /// @notice Return comment, the comment is checked on delete one
    /// @param postContainer The post where is the comment
    /// @param parentReplyId The parent reply
    /// @param commentId The commentId which need find
    function getCommentContainerSave(
        PostContainer storage postContainer,
        uint16 parentReplyId,
        uint8 commentId
    ) public view returns (CommentContainer storage) {
        CommentContainer storage commentContainer = getCommentContainer(postContainer, parentReplyId, commentId);

        require(!commentContainer.info.isDeleted, "Comment has been deleted.");
        return commentContainer;
    }

    /// @notice Return post for unit tests
    /// @param self The mapping containing all posts
    /// @param postId The post which need find
    function getPost(
        PostCollection storage self,
        uint256 postId
    ) public view returns (Post memory) {        
        return self.posts[postId].info;
    }

    /// @notice Return reply for unit tests
    /// @param self The mapping containing all posts
    /// @param postId The post where is the reply
    /// @param replyId The reply which need find
    function getReply(
        PostCollection storage self, 
        uint256 postId, 
        uint16 replyId
    ) public view returns (Reply memory) {
        PostContainer storage postContainer = self.posts[postId];
        return getReplyContainer(postContainer, replyId).info;
    }

    /// @notice Return comment for unit tests
    /// @param self The mapping containing all posts
    /// @param postId Post where is the reply
    /// @param parentReplyId The parent reply
    /// @param commentId The comment which need find
    function getComment(
        PostCollection storage self, 
        uint256 postId,
        uint16 parentReplyId,
        uint8 commentId
    ) public view returns (Comment memory) {
        PostContainer storage postContainer = self.posts[postId];
        return getCommentContainer(postContainer, parentReplyId, commentId).info;
    }

    /// @notice Get flag status vote (upvote/dovnvote) for post/reply/comment
    /// @param self The mapping containing all posts
    /// @param userAddr Author of the vote
    /// @param postId The post where need to get flag status
    /// @param replyId The reply where need to get flag status
    /// @param commentId The comment where need to get flag status
    // return value:
    // downVote = -1
    // NONE = 0
    // upVote = 1
    function getStatusHistory(
        PostCollection storage self, 
        address userAddr,
        uint256 postId,
        uint16 replyId,
        uint8 commentId
    ) public view returns (int256) {
        PostContainer storage postContainer = getPostContainer(self, postId);

        int256 statusHistory;
        if (commentId != 0) {
            CommentContainer storage commentContainer = getCommentContainerSave(postContainer, replyId, commentId);
            statusHistory = commentContainer.historyVotes[userAddr];
        } else if (replyId != 0) {
            ReplyContainer storage replyContainer = getReplyContainerSafe(postContainer, replyId);
            statusHistory = replyContainer.historyVotes[userAddr];
        } else {
            statusHistory = postContainer.historyVotes[userAddr];
        }

        return statusHistory;
    }

    // TODO: Add doc comment
    function getHistoryInformations(
        mapping(address => int256) storage historyVotes,
        address[] storage votedUsers,
        uint256 countVotedUsers
    ) private view returns (int32, int32) {
        int32 positive;
        int32 negative;
        for (uint256 i; i < countVotedUsers; i++) {
            if(historyVotes[votedUsers[i]] == 1) positive++;
            else if(historyVotes[votedUsers[i]] == -1) negative++;
        }
        return (positive, negative);
    }
}