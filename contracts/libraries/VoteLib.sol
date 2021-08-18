pragma solidity >=0.5.0;
pragma abicoder v2;

import "./PostLib.sol";

/// @title VoteLib
/// @notice Provides information about operation with posts                     //
/// @dev posts information is stored in the mapping on the main contract        ///
library VoteLib  {
    enum ResourceAction { Downvote, Upvoted, Downvoted, AcceptReply, AcceptedReply, FirstReply, QuickReply }

    //expert post
    int8 constant DownvoteExpertPost = -1;
    int8 constant UpvotedExpertPost = 5;
    int8 constant DownvotedExpertPost = -2;
    int8 constant AcceptExpertPost = 2;         //Accept answer as correct for Expert Question

    //common post 
    int8 constant DownvoteCommonPost = -1;
    int8 constant UpvotedCommonPost = 1;
    int8 constant DownvotedCommonPost = -1;
    int8 constant AcceptCommonPost = 1;

    //tutorial 
    int8 constant DownvoteTutorial = -1;
    int8 constant UpvotedTutorial = 1;
    int8 constant DownvotedTutorial = -1 ;

    int8 constant DeleteOwnPost = -1;
    int8 constant ModeratorDeletePost = -2;

/////////////////////////////////////////////////////////////////////////////

    //expert reply
    int8 constant DownvoteExpertReply = -1;
    int8 constant UpvotedExpertReply = 10;
    int8 constant DownvotedExpertReply = -2;
    int8 constant AcceptExpertReply = 15;
    int8 constant AcceptedExpertReply = 2;
    int8 constant FirstExpertReply = 5;
    int8 constant QuickExpertReply = 5;

    //common reply 
    int8 constant DownvoteCommonReply = -1;
    int8 constant UpvotedCommonReply = 2;
    int8 constant DownvotedCommonReply = -1;
    int8 constant AcceptCommonReply = 3;
    int8 constant AcceptedCommonReply = 1;
    int8 constant FirstCommonReply = 1;
    int8 constant QuickCommonReply = 1;
    
    int8 constant DeleteOwnReply = -1;
    int8 constant ModeratorDeleteReply = -2;            // to do

/////////////////////////////////////////////////////////////////////////////////

    int8 constant ModeratorDeleteComment = -1;

    /// @notice Get value Rating for post action
    /// @param postType Type post: expertPost, commonPost, tutorial
    /// @param resourceAction Rating action: Downvote, Upvoted, Downvoted
    function getUserRatingChangeForPostAction(
        PostLib.PostType postType,
        ResourceAction resourceAction
    ) internal pure returns (int8) {
 
        if (PostLib.PostType.ExpertPost == postType) {          //switch, gas?
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
    ) internal pure returns (int8) {
 
        if (PostLib.PostType.ExpertPost == postType) {          //switch, gas?
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
    ) internal pure returns (int8) {
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
    function getHistoryVote(
        address user,
        mapping(address => int256) storage historyVote
    ) private view returns (int256) {
        return historyVote[user];
    }

    function getForumItemRatingChange(
        address actionAddress,
        mapping(address => int256) storage historyVotes,
        bool isUpvote,
        address[] storage votedUsers                              /// for comment
    ) internal returns (int8) {
        int history = getHistoryVote(actionAddress, historyVotes);
        int8 ratingChange;
        
        if (isUpvote) {
            if (history == -1) {
                historyVotes[actionAddress] = 1;
                ratingChange += 2;
            } else if (history == 0) {
                historyVotes[actionAddress] = 1;
                ratingChange++;
                votedUsers.push(actionAddress);
            } else if (history == 1) {
                historyVotes[actionAddress] = 0;
                ratingChange--;
            }
        } else {
            if (history == -1) {
                historyVotes[actionAddress] = 0;
                ratingChange++;
            } else if (history == 0) {
                historyVotes[actionAddress] = -1;
                ratingChange--;
                votedUsers.push(actionAddress);
            } else if (history == 1) {
                historyVotes[actionAddress] = -1;
                ratingChange -= 2;
            }
        }
        return ratingChange;
    }
}