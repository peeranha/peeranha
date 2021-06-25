pragma solidity >=0.5.0;
pragma abicoder v2;

import "./PostLib.sol";
import "hardhat/console.sol";

/// @title VoteLib
/// @notice Provides information about operation with posts                     //
/// @dev posts information is stored in the mapping on the main contract        ///
library VoteLib  {
    enum VoteResource { Downvote, Upvoted, Downvoted, CorrecReply, FirstReply, Reply15Minutes }

    //expert post
    uint8 constant DownvoteExpertPost = 0;
    uint8 constant UpvotedExpertPost = 0;
    uint8 constant DownvotedExpertPost = 0;

    //common post 
    uint8 constant DownvoteCommonPost = 0;
    uint8 constant UpvotedCommonPost = 0;
    uint8 constant DownvotedCommonPost = 0;

    //tutorial 
    uint8 constant DownvoteTutorial = 0;
    uint8 constant UpvotedTutorial = 0;
    uint8 constant DownvotedTutorial = 0;

/////////////////////////////////////////////////////////////////////////////

    //expert reply
    uint8 constant DownvoteExpertReply = 0;
    uint8 constant UpvotedExpertReply = 0;
    uint8 constant DownvotedExpertReply = 0;
    uint8 constant CorrectExpertReply = 0;
    uint8 constant FirstExpertReply = 0;
    uint8 constant Reply15MinutesExpert = 0;

    //common reply 
    uint8 constant DownvoteCommonReply = 0;
    uint8 constant UpvotedCommonReply = 0;
    uint8 constant DownvotedCommonReply = 0;
    uint8 constant CorrectCommonReply = 0;
    uint8 constant FirstCommonReply = 0;
    uint8 constant Reply15MinutesCommon = 0;

    //tutorial reply
    uint8 constant DownvoteTutorialReply = 0;
    uint8 constant UpvotedTutorialReply = 0;
    uint8 constant DownvotedTutorialReply = 0;

///////////////////////////////////////////////////////////////////////////////////////////////

    //expert comment
    uint8 constant DownvoteExpertComment = 0;
    uint8 constant UpvotedExpertComment = 0;
    uint8 constant DownvotedExpertComment = 0;

    //common comment 
    uint8 constant DownvoteCommonComment = 0;
    uint8 constant UpvotedCommonComment = 0;
    uint8 constant DownvotedCommonComment = 0;

    //tutorial comment
    uint8 constant DownvoteTutorialComment = 0;
    uint8 constant UpvotedTutorialComment = 0;
    uint8 constant DownvotedTutorialComment = 0;

    function getActionRating(
        PostLib.TypePost typePost,
        VoteResource voteResource
    ) internal returns (uint8) {     //internal?
 
        if (PostLib.TypePost.ExpertPost == typePost) {          //switch, gas?
            if (VoteResource.Downvote == voteResource) return ;
            else if (VoteResource.Upvoted == voteResource) return ;
            else if (VoteResource.Downvoted == voteResource) return ;
            else if (VoteResource.CorrecReply == voteResource) return ;
            else if (VoteResource.FirstReply == voteResource) return ;
            else if (VoteResource.Reply15Minutes == voteResource) return ;

        } else if (PostLib.TypePost.CommonPost == typePost) {
            if (VoteResource.Downvote == voteResource) return ;
            else if (VoteResource.Upvoted == voteResource) return ;
            else if (VoteResource.Downvoted == voteResource) return ;
            else if (VoteResource.CorrecReply == voteResource) return ;
            else if (VoteResource.FirstReply == voteResource) return ;
            else if (VoteResource.Reply15Minutes == voteResource) return ;

        } else if (PostLib.TypePost.Tutorial == typePost) {
            if (VoteResource.Downvote == voteResource) return ;
            else if (VoteResource.Upvoted == voteResource) return ;
            else if (VoteResource.Downvoted == voteResource) return ;
            else if (VoteResource.CorrecReply == voteResource) return ;
            else if (VoteResource.FirstReply == voteResource) return ;
            else if (VoteResource.Reply15Minutes == voteResource) return ;
        }
        require(false, "TypePost or voteResource dont found");      
    }

    function getHistoryVote(
        //int256 userHistory                                        // -1 downvote, 0 - new, 1 - upvote
        mapping(address => int256) storage historyVote
    ) internal returns (int256) {
        int256 history = historyVote[msg.sender];

        return history;
    }

    function upVote(
        PostLib. Content memory content,
        int256 history
    ) internal returns (int256) {
        int256 changeRating = 0;
        if (history == -1) {
            // historyVote[msg.sender] = 1;
            // content.rating += 2;
            changeRating = 2;
        } else if (history == 0) {
            // historyVote[msg.sender] = 1;
            // content.rating ++;
            changeRating = 1;
        } else if (history == 1) {
            // historyVote[msg.sender] = 0;
            // content.rating --;
            changeRating = -1;
        }

        return changeRating; 
    }






    // non function - 21497
    // 9 - 22255 
    // 9(0) - 21827

    // non function - 21497
    // 3 - 21894
    // 3(0) - 21664

    // 1 if - 21647 2 - 21664  4 - 21716  (17)
}