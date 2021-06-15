pragma solidity >=0.5.0;
import "./Utils.sol";

/// @title Question
/// @notice Provides information about operation with questions
/// @dev Questions information is stored in the mapping on the main contract
library QuestionLib  {
  struct Content {
    address author;
    AssertLib.IpfsHash ipfsHash;
    uint256 rating;
    uint256 postTime;
    bool isDeleted;
  }

  struct Comment {
    Content content;
    mapping(uint256 => bytes32) properties;
    uint256 sizeProperties;
  }

  struct Reply {
    Content content;
    mapping(uint256 => Reply) replies;
    mapping(uint256 => Comment) comments;
    mapping(uint256 => bytes32) properties;
    uint256 sizeReplies;
    uint256 sizeComments;
    uint256 sizeProperties;
    bool officialAnswer;
  }

  struct Post {
    Reply post;
    uint256 communityId;
  }

  struct Collection {
    mapping(uint256 => Post) posts;
    uint256 size_posts;
  }


  /// @notice Post Question
  /// @param self The mapping containing all questions
  /// @param name Author of the question
  /// @param communityId Community where the question will be ask
  /// @param ipfsHash IPFS hash of document with question information
  
  function Post_question(
    Collection storage self,
    address name,
    uint16 communityId, 
    bytes32 ipfsHash    // bytes32 ipfsHash or Assert_lib.IpfsHash storage ipfsHash?
    //const std::vector<uint32_t> tags
  ) internal {

    ///
    //check community, ipfs, tags
    ///

    ///
    //update user statistics + rating
    ///

    Post storage post = self.posts[self.size_posts];
    post.post.content.ipfsHash.ipfsHash = ipfsHash;
    post.post.content.author = name;
    post.post.content.postTime = block.timestamp;
    post.communityId = communityId;

    self.size_posts++;

    ///
    //update community statistics
    //update tag statistics
    ///
  }

  /// @notice Post answer
  /// @param self The mapping containing all questions
  /// @param name Author of the answer
  /// @param questionId Question where the answer will be post
  /// @param officialAnswer Flag is showing "official answer" or not
  /// @param path The path where the answer will be post 
  /// @param ipfsHash IPFS hash of document with answer information
  
  function Post_answer(
    Collection storage self,
    address name,
    uint32 questionId,
    bool officialAnswer,
    uint[] memory path,
    bytes32 ipfsHash
  ) public {
    ///
    //check ipfs
    ///

    Reply storage reply = self.posts[questionId].post;     //inside the question
    require(reply.content.ipfsHash.ipfsHash != bytes32(0x0), "Question isn't exist");
    
    ///
    //update user statistic + rating
    ///

    if (path.length > 0) {
      uint256 lenght = path.length;
      for(uint256 i = 0; i < lenght; i++) {
        reply = reply.replies[path[i]];
        require(reply.content.ipfsHash.ipfsHash != bytes32(0x0), "Reply isn't exist");
      }
    }

    reply = reply.replies[reply.sizeReplies++];
    reply.content.author = name;
    reply.content.ipfsHash.ipfsHash = ipfsHash;
    reply.content.postTime = block.timestamp;
    if (officialAnswer)                          //without if?
      reply.officialAnswer = officialAnswer;

    ///
    // first answer / 15min
    ///
  }

  /// @notice Post comment
  /// @param self The mapping containing all questions
  /// @param name Author of the comment
  /// @param questionId Question where the comment will be post
  /// @param path The path where the comment will be post 
  /// @param ipfsHash IPFS hash of document with answer information

  function Post_comment(
    Collection storage self,
    address name,
    uint32 questionId,
    uint[] memory path,
    bytes32 ipfsHash
  ) public {
    Reply storage reply = self.posts[questionId].post;     //inside the question
    require(reply.content.ipfsHash.ipfsHash != bytes32(0x0), "Question isn't exist");

    if (path.length != 0) {
      uint256 lenght = path.length;
      for(uint256 i = 0; i < lenght; i++) {
        reply = reply.replies[path[i]];
        require(reply.content.ipfsHash.ipfsHash != bytes32(0x0), "Reply isn't exist");
      }
    }

    Content storage comment = reply.comments[reply.sizeComments++].content;
    comment.author = name;
    comment.ipfsHash.ipfsHash = ipfsHash;
    comment.postTime = block.timestamp;
  }

  /// @notice Edit question
  /// @param self The mapping containing all questions
  /// @param name Author of the comment
  /// @param questionId Question where the comment will be post
  /// @param ipfsHash IPFS hash of document with answer information

  function Edit_question(
    Collection storage self,
    address name,
    uint32 questionId,
    uint16 communityId,
    // tags
    bytes32 ipfsHash
  ) public {
    
    Post storage post = self.posts[questionId];     //inside the question
    require(post.post.content.ipfsHash.ipfsHash != bytes32(0x0), "Question isn't exist");
    require(post.post.content.isDeleted, "Question has deleted");
    
    post.communityId = communityId;
    post.post.content.ipfsHash.ipfsHash = ipfsHash;    
  }

  /// @notice Edit answer
  /// @param self The mapping containing all questions
  /// @param name Author of the comment
  /// @param questionId Question where the comment will be post
  /// @param path The path where the comment will be post 
  /// @param answerId The answer which will be change
  /// @param officialAnswer Flag is showing "official answer" or not
  /// @param ipfsHash IPFS hash of document with answer information

  function Edit_answer(
    Collection storage self,
    address name,
    uint32 questionId,
    uint[] memory path,
    uint256 answerId,
    bool officialAnswer,
    bytes32 ipfsHash
  ) public {

    Reply storage reply = self.posts[questionId].post;     //inside the question
    require(reply.content.ipfsHash.ipfsHash != bytes32(0x0), "Question isn't exist");
    require(reply.content.isDeleted, "Question has deleted");

    if (path.length > 0) {
      uint256 lenght = path.length;
      for(uint256 i = 0; i < lenght; i++) {
        reply = reply.replies[path[i]];
        require(reply.content.ipfsHash.ipfsHash != bytes32(0x0), "Reply isn't exist");
        require(reply.content.isDeleted, "Reply has deleted");
      }
    }

    reply = reply.replies[answerId];
    require(reply.content.ipfsHash.ipfsHash != bytes32(0x0), "Reply isn't exist");
    require(reply.content.isDeleted, "Reply has deleted");

    if (reply.content.ipfsHash.ipfsHash == ipfsHash)
      reply.content.ipfsHash.ipfsHash = ipfsHash;
    if (reply.officialAnswer != officialAnswer)                          //will check gas?
      reply.officialAnswer = officialAnswer;   
  }

  /// @notice Edit comment
  /// @param self The mapping containing all questions
  /// @param name Author of the comment
  /// @param questionId Question where the comment will be post
  /// @param path The path where the comment will be post
  /// @param commentId The comment which will be change
  /// @param ipfsHash IPFS hash of document with answer information

  function Edit_comment(    //LAST_MODIFIED?
    Collection storage self,
    address name,
    uint32 questionId,
    uint[] memory path,
    uint8 commentId,
    bytes32 ipfsHash
  ) public {
    Reply storage reply = self.posts[questionId].post;     //inside the question
    require(reply.content.ipfsHash.ipfsHash != bytes32(0x0), "Question isn't exist");
    require(reply.content.isDeleted, "Question has deleted");

    if (path.length != 0) {
      uint256 lenght = path.length;
      for(uint256 i = 0; i < lenght; i++) {
        reply = reply.replies[path[i]];
        require(reply.content.ipfsHash.ipfsHash != bytes32(0x0), "Reply isn't exist");
        require(reply.content.isDeleted, "Reply has deleted");
      }
    }

    Content storage comment = reply.comments[commentId].content;
    require(comment.ipfsHash.ipfsHash != bytes32(0x0), "comment isn't exist");
    require(comment.isDeleted, "Comment has deleted");

    if(comment.ipfsHash.ipfsHash == ipfsHash)
      comment.ipfsHash.ipfsHash = ipfsHash;
  }

  /// @notice Delete question
  /// @param self The mapping containing all questions
  /// @param name ?
  /// @param questionId Question which be delete

  function Delete_question(
    Collection storage self,
    address name,
    uint32 questionId
  ) public {
    Reply storage post = self.posts[questionId].post;     //inside the question
    require(post.content.ipfsHash.ipfsHash != bytes32(0x0), "Question isn't exist");
    require(post.content.isDeleted, "Question has already deleted");
    post.content.isDeleted = true;

    ///
    // -rating, update user statistic
    ///

    // for(uint256 i = 0; i < post.sizeComments; i++) {
    //   require(post.comments[i].content.ipfsHash.ipfsHash != bytes32(0x0), "Comment isn't exist");
    //   post.comments[i].content.isDeleted = true;
    //   // update user statistic
    // }
    
    for(uint256 i = 0; i < post.sizeReplies; i++) {
      if(post.replies[i].content.ipfsHash.ipfsHash == bytes32(0x0) || post.replies[i].content.isDeleted)
        continue;
      Reply storage localReply = post.replies[i];

      ///
      // -rating, update user statistic
      ///

      // for(uint256 j = 0; j < localReply.sizeComments; j++) {
      //   require(localReply.comments[j].content.ipfsHash.ipfsHash != bytes32(0x0), "Comment isn't exist");
      //   localReply.comments[j].content.isDeleted = true;
      //   //update user statistic
      // }
      // localReply.content.isDeleted = true;
    }  
  }

  /// @notice Delete answer
  /// @param self The mapping containing all questions
  /// @param name ?
  /// @param questionId Question where will be deleted answer
  /// @param path The path where the answer will be deleted
  /// @param answerId Answer which will be deleted

  function Delete_answer(
    Collection storage self,
    address name,
    uint32 questionId,
    uint[] memory path,
    uint16 answerId
  ) public {
    /*
    check author
    */
    Reply storage reply = self.posts[questionId].post;     //inside the question
    require(reply.content.ipfsHash.ipfsHash != bytes32(0x0), "Question isn't exist");
    require(reply.content.isDeleted, "Question has deleted");

    if (path.length > 0) {
      uint256 lenght = path.length;
      for(uint256 i = 0; i < lenght; i++) {
        require(reply.content.ipfsHash.ipfsHash != bytes32(0x0), "Reply isn't exist");
        require(reply.content.isDeleted, "Reply has deleted");
        reply = reply.replies[path[i]];
      }
    }

    reply = reply.replies[answerId];
    require(reply.content.ipfsHash.ipfsHash != bytes32(0x0), "Reply isn't exist");
    require(reply.content.isDeleted, "Reply has already deleted");
    reply.content.isDeleted = true;
    // for(uint256 j = 0; j < reply.sizeComments; j++) {
    //   if(reply.comments[j].content.ipfsHash.ipfsHash == bytes32(0x0) || reply.comments[j].content.isDeleted) {
    //     // reply.comments[j].content.isDeleted = true; 
    //     //update user statistic
    //   }
    // }
  }

  /// @notice Delete comment
  /// @param self The mapping containing all questions
  /// @param name ?
  /// @param questionId Question where will be deleted сщььуте
  /// @param path The path where the answer will be deleted
  /// @param commentId comment which will be deleted

  function Delete_comment(
    Collection storage self,
    address name,
    uint32 questionId,
    uint[] memory path,
    uint8 commentId
  ) public {
    Reply storage reply = self.posts[questionId].post;     //inside the question
    require(reply.content.ipfsHash.ipfsHash != bytes32(0x0), "Question isn't exist");
    require(reply.content.isDeleted, "Question has deleted");

    if (path.length > 0) {
      uint256 lenght = path.length;
      for(uint256 i = 0; i < lenght; i++) {
        reply = reply.replies[path[i]];
        require(reply.content.ipfsHash.ipfsHash != bytes32(0x0), "Reply isn't exist");
        require(reply.content.isDeleted, "Reply has deleted");
      }
    }

    Content storage comment = reply.comments[commentId].content;
    require(comment.ipfsHash.ipfsHash != bytes32(0x0), "comment isn't exist");
    require(comment.isDeleted, "Comment has already deleted");
    comment.isDeleted = true;
    //update user statistic
  }

  function getQuestionByIndex(Collection storage self, uint256 index) internal view returns (Content memory) {
    Content memory content = self.posts[index].post.content;
    return content;
  }
}