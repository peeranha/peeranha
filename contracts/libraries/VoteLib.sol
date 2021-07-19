pragma solidity >=0.5.0;
pragma abicoder v2;

import "./PostLib.sol";

/// @title VoteLib
/// @notice Provides information about operation with posts                     //
/// @dev posts information is stored in the mapping on the main contract        ///
library VoteLib  {
    enum ResourceAction { Downvote, Upvoted, Downvoted, BestReply, FirstReply, Reply15Minutes }

    //expert post
    int8 constant DownvoteExpertPost = -1;
    int8 constant UpvotedExpertPost = 0;
    int8 constant DownvotedExpertPost = 0;

    //common post 
    int8 constant DownvoteCommonPost = -1;
    int8 constant UpvotedCommonPost = 0;
    int8 constant DownvotedCommonPost = 0;

    //tutorial 
    int8 constant DownvoteTutorial = -1;    //autorAction
    int8 constant UpvotedTutorial = 0;
    int8 constant DownvotedTutorial = 0;

/////////////////////////////////////////////////////////////////////////////

    //expert reply
    int8 constant DownvoteExpertReply = 0;
    int8 constant UpvotedExpertReply = 0;
    int8 constant DownvotedExpertReply = 0;
    int8 constant AcceptExpertReply = 0;
    int8 constant FirstExpertReply = 0;
    int8 constant Reply15MinutesExpert = 0;

    //common reply 
    int8 constant DownvoteCommonReply = 0;
    int8 constant UpvotedCommonReply = 0;
    int8 constant DownvotedCommonReply = 0;
    int8 constant AcceptCommonReply = 0;
    int8 constant FirstCommonReply = 0;
    int8 constant Reply15MinutesCommon = 0;

    /// @notice Get value Rating for post action
    /// @param typePost Type post: expertPost, commonPost, tutorial
    /// @param resourceAction Rating action: Downvote, Upvoted, Downvoted
    function getUserRatingChangeForPostAction(
        PostLib.TypePost typePost,
        ResourceAction resourceAction
    ) internal pure returns (int8) {
 
        if (PostLib.TypePost.ExpertPost == typePost) {          //switch, gas?
            if (ResourceAction.Downvote == resourceAction) return DownvoteExpertPost;
            else if (ResourceAction.Upvoted == resourceAction) return UpvotedExpertPost;
            else if (ResourceAction.Downvoted == resourceAction) return DownvotedExpertPost;

        } else if (PostLib.TypePost.CommonPost == typePost) {
            if (ResourceAction.Downvote == resourceAction) return DownvoteCommonPost;
            else if (ResourceAction.Upvoted == resourceAction) return UpvotedCommonPost;
            else if (ResourceAction.Downvoted == resourceAction) return DownvotedCommonPost;

        } else if (PostLib.TypePost.Tutorial == typePost) {
            if (ResourceAction.Downvote == resourceAction) return DownvoteTutorial;
            else if (ResourceAction.Upvoted == resourceAction) return UpvotedTutorial;
            else if (ResourceAction.Downvoted == resourceAction) return DownvotedTutorial;

        }
        require(false, "TypePost or voteResource is not found");      
    }

    /// @notice Get value Rating for rating action
    /// @param typePost Type post: expertPost, commonPost, tutorial
    /// @param resourceAction Rating action: Downvote, Upvoted, Downvoted, BestReply...
    function getUserRatingChangeForReplyAction(
        PostLib.TypePost typePost,
        ResourceAction resourceAction
    ) internal pure returns (int8) {
 
        if (PostLib.TypePost.ExpertPost == typePost) {          //switch, gas?
            if (ResourceAction.Downvote == resourceAction) return DownvoteExpertReply;
            else if (ResourceAction.Upvoted == resourceAction) return UpvotedExpertReply;
            else if (ResourceAction.Downvoted == resourceAction) return DownvotedExpertReply;
            else if (ResourceAction.BestReply == resourceAction) return AcceptExpertReply;
            else if (ResourceAction.FirstReply == resourceAction) return FirstExpertReply;
            else if (ResourceAction.Reply15Minutes == resourceAction) return Reply15MinutesExpert;

        } else if (PostLib.TypePost.CommonPost == typePost) {
            if (ResourceAction.Downvote == resourceAction) return DownvoteCommonReply;
            else if (ResourceAction.Upvoted == resourceAction) return UpvotedCommonReply;
            else if (ResourceAction.Downvoted == resourceAction) return DownvotedCommonReply;
            else if (ResourceAction.BestReply == resourceAction) return AcceptCommonReply;
            else if (ResourceAction.FirstReply == resourceAction) return FirstCommonReply;
            else if (ResourceAction.Reply15Minutes == resourceAction) return Reply15MinutesCommon;

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
        bool isUpvote
    ) internal returns (int8) {
        int history = getHistoryVote(actionAddress, historyVotes);
        int8 changeRating;
        
        if (isUpvote) {
            if (history == -1) {
                historyVotes[actionAddress] = 1;
                changeRating += 2;
            } else if (history == 0) {
                historyVotes[actionAddress] = 1;
                changeRating ++;
            } else if (history == 1) {
                historyVotes[actionAddress] = 0;
                changeRating --;
            }
        } else {
            if (history == -1) {
                historyVotes[actionAddress] = 0;
                changeRating += 1;
            } else if (history == 0) {
                historyVotes[actionAddress] = -1;
                changeRating --;
            } else if (history == 1) {
                historyVotes[actionAddress] = -1;
                changeRating -= 2;
            }
        }

        return changeRating;
    }
}