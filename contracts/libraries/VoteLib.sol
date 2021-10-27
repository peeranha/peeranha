pragma solidity >=0.5.0;
pragma abicoder v2;

import "./PostLib.sol";


/// @title VoteLib
/// @notice Provides information about operation with posts                     //
/// @dev posts information is stored in the mapping on the main contract        ///
library VoteLib  {
    enum ResourceAction { Downvote, Upvoted, Downvoted, AcceptReply, AcceptedReply, FirstReply, QuickReply }

    //expert post
    int32 constant DownvoteExpertPost = -1;
    int32 constant UpvotedExpertPost = 5;
    int32 constant DownvotedExpertPost = -2;
    int32 constant AcceptExpertPost = 2;         //Accept answer as correct for Expert Question

    //common post 
    int32 constant DownvoteCommonPost = -1;
    int32 constant UpvotedCommonPost = 1;
    int32 constant DownvotedCommonPost = -1;
    int32 constant AcceptCommonPost = 1;

    //tutorial 
    int32 constant DownvoteTutorial = -1;
    int32 constant UpvotedTutorial = 1;
    int32 constant DownvotedTutorial = -1 ;

    int32 constant DeleteOwnPost = -1;
    int32 constant ModeratorDeletePost = -2;

/////////////////////////////////////////////////////////////////////////////

    //expert reply
    int32 constant DownvoteExpertReply = -1;
    int32 constant UpvotedExpertReply = 10;
    int32 constant DownvotedExpertReply = -2;
    int32 constant AcceptExpertReply = 15;
    int32 constant AcceptedExpertReply = 2;
    int32 constant FirstExpertReply = 5;
    int32 constant QuickExpertReply = 5;

    //common reply 
    int32 constant DownvoteCommonReply = -1;
    int32 constant UpvotedCommonReply = 2;
    int32 constant DownvotedCommonReply = -1;
    int32 constant AcceptCommonReply = 3;
    int32 constant AcceptedCommonReply = 1;
    int32 constant FirstCommonReply = 1;
    int32 constant QuickCommonReply = 1;
    
    int32 constant DeleteOwnReply = -1;
    int32 constant ModeratorDeleteReply = -2;            // to do

/////////////////////////////////////////////////////////////////////////////////

    int32 constant ModeratorDeleteComment = -1;

    /// @notice Get value Rating for post action
    /// @param postType Type post: expertPost, commonPost, tutorial
    /// @param resourceAction Rating action: Downvote, Upvoted, Downvoted
    function getUserRatingChangeForPostAction(
        PostLib.PostType postType,
        ResourceAction resourceAction
    ) internal pure returns (int32) {
 
        if (PostLib.PostType.ExpertPost == postType) {
            if (ResourceAction.Downvote == resourceAction) return DownvoteExpertPost;
            else if (ResourceAction.Upvoted == resourceAction) return UpvotedExpertPost;
            else if (ResourceAction.Downvoted == resourceAction) return DownvotedExpertPost;

        } else if (PostLib.PostType.CommonPost == postType) {
            if (ResourceAction.Downvote == resourceAction) return DownvoteCommonPost;
            else if (ResourceAction.Upvoted == resourceAction) return UpvotedCommonPost;
            else if (ResourceAction.Downvoted == resourceAction) return DownvotedCommonPost;

        } else if (PostLib.PostType.Tutorial == postType) {
            if (ResourceAction.Downvote == resourceAction) return DownvoteTutorial;
            else if (ResourceAction.Upvoted == resourceAction) return UpvotedTutorial;
            else if (ResourceAction.Downvoted == resourceAction) return DownvotedTutorial;

        }
        require(false, "PostType or voteResource is not found");
        return 0;
    }

    /// @notice Get value Rating for rating action
    /// @param postType Type post: expertPost, commonPost, tutorial
    /// @param resourceAction Rating action: Downvote, Upvoted, Downvoted, AcceptReply...
    function getUserRatingChangeForReplyAction(
        PostLib.PostType postType,
        ResourceAction resourceAction
    ) internal pure returns (int32) {
 
        if (PostLib.PostType.ExpertPost == postType) {
            if (ResourceAction.Downvote == resourceAction) return DownvoteExpertReply;
            else if (ResourceAction.Upvoted == resourceAction) return UpvotedExpertReply;
            else if (ResourceAction.Downvoted == resourceAction) return DownvotedExpertReply;
            else if (ResourceAction.AcceptReply == resourceAction) return AcceptExpertReply;
            else if (ResourceAction.AcceptedReply == resourceAction) return AcceptedExpertReply;
            else if (ResourceAction.FirstReply == resourceAction) return FirstExpertReply;
            else if (ResourceAction.QuickReply == resourceAction) return QuickExpertReply;

        } else if (PostLib.PostType.CommonPost == postType) {
            if (ResourceAction.Downvote == resourceAction) return DownvoteCommonReply;
            else if (ResourceAction.Upvoted == resourceAction) return UpvotedCommonReply;
            else if (ResourceAction.Downvoted == resourceAction) return DownvotedCommonReply;
            else if (ResourceAction.AcceptReply == resourceAction) return AcceptCommonReply;
            else if (ResourceAction.AcceptedReply == resourceAction) return AcceptedCommonReply;
            else if (ResourceAction.FirstReply == resourceAction) return FirstCommonReply;
            else if (ResourceAction.QuickReply == resourceAction) return QuickCommonReply;

        } else if (PostLib.PostType.Tutorial == postType) {
            return 0;
        }
        
        require(false, "PostType or voteResource is not found");
        return 0;
    }

    function getUserRatingChange(
        PostLib.PostType postType,
        ResourceAction resourceAction,
        PostLib.TypeContent typeContent
    ) internal pure returns (int32) {
        if (PostLib.TypeContent.Post == typeContent) {
            return getUserRatingChangeForPostAction(postType, resourceAction);
        } else if (PostLib.TypeContent.Reply == typeContent) {
            return getUserRatingChangeForReplyAction(postType, resourceAction);
        }
        return 0;
    }

    /// @notice Get vote history
    /// @param user user who voted for content
    /// @param historyVote history vote all users
    // return value:
    // downVote = -1
    // nothing = 0
    // upVote = 1
    function getHistoryVote(
        address user,
        mapping(address => int256) storage historyVote
    ) private view returns (int256) {
        return historyVote[user];
    }

    /// @notice Get vote history                        ////
    /// @param address user who voted for content       //
    /// @param historyVotes history vote all users
    /// @param isUpvote Upvote or downvote
    /// @param votedUsers the list users who voted
    // fromUpVoteToDownVote = -2
    // downVote = -1
    // upVote = 1
    // fromDownVoteToUpVote = 2
    function getForumItemRatingChange(
        address actionAddress,
        mapping(address => int256) storage historyVotes,
        bool isUpvote,
        address[] storage votedUsers
    ) internal returns (int32) {
        int history = getHistoryVote(actionAddress, historyVotes);
        int32 ratingChange;
        
        if (isUpvote) {
            if (history == -1) {
                historyVotes[actionAddress] = 1;
                ratingChange = 2;
            } else if (history == 0) {
                historyVotes[actionAddress] = 1;
                ratingChange = 1;
                votedUsers.push(actionAddress);
            } else if (history == 1) {
                historyVotes[actionAddress] = 0;
                //clear votedUsers
                ratingChange = -1;
            }
        } else {
            if (history == -1) {
                historyVotes[actionAddress] = 0;
                //clear votedUsers
                ratingChange = 1;
            } else if (history == 0) {
                historyVotes[actionAddress] = -1;
                ratingChange = -1;
                votedUsers.push(actionAddress);
            } else if (history == 1) {
                historyVotes[actionAddress] = -1;
                ratingChange = -2;
            }
        }
        return ratingChange;
    }
}