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
    int8 constant UpvotedExpertPost = 5;
    int8 constant DownvotedExpertPost = -2;
    int8 constant AcceptExpertPost = 2;         //Accept answer as correct for Expert Question

    //common post 
    int8 constant DownvoteCommonPost = -1;
    int8 constant UpvotedCommonPost = 1;
    int8 constant DownvotedCommonPost = -1;
    int8 constant AcceptCommonPost = 1;

    //tutorial 
    int8 constant DownvoteTutorial = -1;    //autorAction       //??
    int8 constant UpvotedTutorial = 1;                          //??
    int8 constant DownvotedTutorial = -1 ;                        //??

    int8 constant DeleteOwnPost = -1;
    int8 constant ModeratorDeletePost = -2;

/////////////////////////////////////////////////////////////////////////////

    //expert reply
    int8 constant DownvoteExpertReply = -1;
    int8 constant UpvotedExpertReply = 10;                                                      //post 10 reply 5?
    int8 constant DownvotedExpertReply = -2;
    int8 constant AcceptExpertReply = 15;
    int8 constant FirstExpertReply = 5;
    int8 constant Reply15MinutesExpert = 5;

    int8 constant FirstExpertReplyNegetiveRating = -5;
    int8 constant Reply15MinutesExpertNegetiveRating = -5;
    int8 constant DeleteFirstExpertReply = -5;
    int8 constant DeleteReply15MinutesExpert = -5;

    //common reply 
    int8 constant DownvoteCommonReply = -1;
    int8 constant UpvotedCommonReply = 2;
    int8 constant DownvotedCommonReply = -1;
    int8 constant AcceptCommonReply = 3;
    int8 constant FirstCommonReply = 1;
    int8 constant Reply15MinutesCommon = 1;

    int8 constant FirstCommonReplyNegetiveRating = -1;          //
    int8 constant Reply15MinutesCommonNegetiveRating = -1;      //
    int8 constant DeleteFirstCommonReply = -1;                  //to do
    int8 constant DeleteReply15MinutesCommon = -1;              //
    
    int8 constant DeleteOwnReply = -1;
    int8 constant ModeratorDeleteReply = -2;            // to do

/////////////////////////////////////////////////////////////////////////////////

    int8 constant ModeratorDeleteComment = -1;

    /// @notice Get value Rating for post action
    /// @param typePost Type post: expertPost, commonPost, tutorial
    /// @param resourceAction Rating action: Downvote, Upvoted, Downvoted
    function getUserRatingChangeForPostAction(
        PostLib.TypePost typePost,
        ResourceAction resourceAction
    ) private pure returns (int8) {
 
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
        return 0;
    }

    /// @notice Get value Rating for rating action
    /// @param typePost Type post: expertPost, commonPost, tutorial
    /// @param resourceAction Rating action: Downvote, Upvoted, Downvoted, BestReply...
    function getUserRatingChangeForReplyAction(
        PostLib.TypePost typePost,
        ResourceAction resourceAction
    ) private pure returns (int8) {
 
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

        } else if (PostLib.TypePost.Tutorial == typePost) {
            return 0;
        }
        
        require(false, "TypePost or voteResource is not found");
        return 0;
    }

    function getUserRatingChange(
        PostLib.TypePost typePost,
        ResourceAction resourceAction,
        PostLib.TypeContent typeContent
    ) internal pure returns (int8) {
        if (PostLib.TypeContent.Post == typeContent) {
            return getUserRatingChangeForPostAction(typePost, resourceAction);
        } else if (PostLib.TypeContent.Reply == typeContent) {
            return getUserRatingChangeForReplyAction(typePost, resourceAction);
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
        address[] storage usersVoted                              /// for comment
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
                usersVoted.push(actionAddress);
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
                usersVoted.push(actionAddress);
            } else if (history == 1) {
                historyVotes[actionAddress] = -1;
                changeRating -= 2;
            }
        }
        return changeRating;
    }
}