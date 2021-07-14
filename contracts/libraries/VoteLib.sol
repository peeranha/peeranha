pragma solidity >=0.5.0;
pragma abicoder v2;

import "./PostLib.sol";
import "./UserLib.sol";

import "hardhat/console.sol";

/// @title VoteLib
/// @notice Provides information about operation with posts                     //
/// @dev posts information is stored in the mapping on the main contract        ///
library VoteLib  {
    enum VoteResource { Downvote, Upvoted, Downvoted, CorrecReply, FirstReply, Reply15Minutes }

    using UserLib for UserLib.UserCollection;
    using UserLib for UserLib.User;

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
    int8 constant CorrectExpertReply = 0;
    int8 constant FirstExpertReply = 0;
    int8 constant Reply15MinutesExpert = 0;

    //common reply 
    int8 constant DownvoteCommonReply = 0;
    int8 constant UpvotedCommonReply = 0;
    int8 constant DownvotedCommonReply = 0;
    int8 constant CorrectCommonReply = 0;
    int8 constant FirstCommonReply = 0;
    int8 constant Reply15MinutesCommon = 0;

    //tutorial reply
    // int8 constant DownvoteTutorialReply = 0;
    // int8 constant UpvotedTutorialReply = 0;
    // int8 constant DownvotedTutorialReply = 0;

///////////////////////////////////////////////////////////////////////////////////////////////

    // //expert comment
    // int8 constant DownvoteExpertComment = 0;
    // int8 constant UpvotedExpertComment = 0;
    // int8 constant DownvotedExpertComment = 0;

    // //common comment 
    // int8 constant DownvoteCommonComment = 0;
    // int8 constant UpvotedCommonComment = 0;
    // int8 constant DownvotedCommonComment = 0;

    //tutorial comment
    // int8 constant DownvoteTutorialComment = 0;
    // int8 constant UpvotedTutorialComment = 0;
    // int8 constant DownvotedTutorialComment = 0;

    function getRatingPost(
        PostLib.TypePost typePost,
        VoteResource voteResource
    ) internal pure returns (int8) {     //internal?
 
        if (PostLib.TypePost.ExpertPost == typePost) {          //switch, gas?
            if (VoteResource.Downvote == voteResource) return DownvoteExpertPost;
            else if (VoteResource.Upvoted == voteResource) return UpvotedExpertPost;
            else if (VoteResource.Downvoted == voteResource) return DownvotedExpertPost;

        } else if (PostLib.TypePost.CommonPost == typePost) {
            if (VoteResource.Downvote == voteResource) return DownvoteCommonPost;
            else if (VoteResource.Upvoted == voteResource) return UpvotedCommonPost;
            else if (VoteResource.Downvoted == voteResource) return DownvotedCommonPost;

        } else if (PostLib.TypePost.Tutorial == typePost) {
            if (VoteResource.Downvote == voteResource) return DownvoteTutorial;
            else if (VoteResource.Upvoted == voteResource) return DownvoteTutorial;
            else if (VoteResource.Downvoted == voteResource) return DownvoteTutorial;

        }
        require(false, "TypePost or voteResource dont found");      
    }

    function getRatingReply(
        PostLib.TypePost typePost,
        VoteResource voteResource
    ) internal pure returns (int8) {     //internal?
 
        if (PostLib.TypePost.ExpertPost == typePost) {          //switch, gas?
            if (VoteResource.Downvote == voteResource) return DownvoteExpertReply;
            else if (VoteResource.Upvoted == voteResource) return UpvotedExpertReply;
            else if (VoteResource.Downvoted == voteResource) return DownvotedExpertReply;
            else if (VoteResource.CorrecReply == voteResource) return CorrectExpertReply;
            else if (VoteResource.FirstReply == voteResource) return FirstExpertReply;
            else if (VoteResource.Reply15Minutes == voteResource) return Reply15MinutesExpert;

        } else if (PostLib.TypePost.CommonPost == typePost) {
            if (VoteResource.Downvote == voteResource) return DownvoteCommonReply;
            else if (VoteResource.Upvoted == voteResource) return UpvotedCommonReply;
            else if (VoteResource.Downvoted == voteResource) return DownvotedCommonReply;
            else if (VoteResource.CorrecReply == voteResource) return CorrectCommonReply;
            else if (VoteResource.FirstReply == voteResource) return FirstCommonReply;
            else if (VoteResource.Reply15Minutes == voteResource) return Reply15MinutesCommon;

        }
        return 0;    
    }

    function getHistoryVote(
        address user,
        mapping(address => int256) storage historyVote
    ) private view returns (int256) {
        return historyVote[user];
    }

    function changeHistory(
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