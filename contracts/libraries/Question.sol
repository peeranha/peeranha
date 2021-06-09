pragma solidity >=0.5.0;
import "./Utils.sol";

/// @title Question
/// @notice Provides information about operation with questions
/// @dev Questions information is stored in the mapping on the main contract
library Question_lib  {//
  // struct Comment {    //bool isExists?
  //   uint8 id;
  //   string name;
  //   uint256 post_time;
  //   bool isExists;
  //   Assert_lib.IpfsHash ipfsHash;
  //   //std::vector<history_item> history;
  // }

  // struct Answer { //bool isExists?
  //   string name;
  //   uint16 id;
  //   uint256 post_time;
  //   bool official_answer;
  //   Comment[] comments;
  //   bool isExists;
  //   Assert_lib.IpfsHash ipfsHash;
  //   //int16_t rating = 0;
  //   //std::vector<history_item> history;
  // }

  // struct Question {
  //   uint32 id;
  //   uint16 community_id;
  //   uint256 post_time;
  //   string name;
  //   Answer[] answers;
  //   Comment[] comments;
  //   uint16 correct_answer_id;
  //   bool isExists;
  //   Assert_lib.IpfsHash ipfsHash;
  //   //std::vector<uint32_t> tags;
  //   //int16_t rating;
  //   // type question 
  // }

  // struct Collection_question {
  //   mapping(uint32 => Question) questions;
  //   uint32 size;
  // }
  

  struct Content {
    string author;
    Assert_lib.IpfsHash ipfsHash;
    uint256 rating;
    uint256 post_time;
    mapping(uint256 => bytes32) properties;
    uint256 size_properties;
    bool isDeleted;
  }

  struct Comment {
    Content content;
    mapping(uint256 => Comment) comments;
    uint256 size_comments;
  }

  struct Reply {
    Content content;
    mapping(uint256 => Reply) replies;
    mapping(uint256 => Comment) comments;
    uint256 size_replies;
    uint256 size_comments;
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
  /// @param name author of the question
  /// @param communityId community where the question will ask
  /// @param ipfsHash IPFS hash of document with question information
  
  function Post_question(
    Collection storage self,
    string memory name,
    uint16 communityId,
    // string memory title, //check?  
    Assert_lib.IpfsHash storage ipfsHash
    //const std::vector<uint32_t> tags
  ) public {
    // Assert_lib.Assert_title(title);

    ///
    //check community, ipfs, tags
    ///

    ///
    //update user statistics + rating
    ///

    Post storage post = self.posts[self.size_posts];
    post.post.content.ipfsHash = ipfsHash;
    post.post.content.author = name;
    post.post.content.post_time = block.timestamp;
    post.communityId = communityId;

    self.size_posts++;

    ///
    //update community statistics
    //update tag statistics
    ///
  }

  /// @notice Post answer
  /// @param self The mapping containing all questions
  /// @param name author of the answer
  /// @param question_id question where the answer will post
  /// @param official_answer flag show                                      //
  /// @param ipfsHash IPFS hash of document with answer information
  
  function Post_answer(
    Collection storage self,
    string memory name,
    uint32 question_id,
    bool official_answer,
    uint[] memory path,
    Assert_lib.IpfsHash storage ipfsHash
  ) public {
    ///
    //check ipfs
    ///
    require(self.posts[question_id].post.content.ipfsHash.ipfsHash != bytes32(0x0), "Question isn't exist");
    
    ///
    //update user statistic + rating
    ///
    
    Reply storage reply = self.posts[question_id].post;
    
    for(uint256 i = 0; i < path.length; i++) {

    }

    // Post post = self.posts[question_id].content.
    // self.questions[question_id].answers[answer_id] = Answer(
    //   name,
    //   answer_id,
    //   block.timestamp,
    //   official_answer,
    //   new Comment[](0),
    //   true,
    //   ipfsHash
    // );


    ///
    // first answer / 15min
    ///
  }

  /// @notice Post comment
  /// @param self The mapping containing all questions
  /// @param name author of the answer
  /// @param question_id question where the comment will post
  /// @param answer_id answer where the comment will post
  /// @param ipfsHash IPFS hash of document with answer information

  function Post_comment(
    Collection storage self,
    string memory name,
    uint32 question_id,
    uint16 answer_id,
    Assert_lib.IpfsHash storage ipfsHash
  ) public {
    // require(self.size <= question_id , "Question not found");
    // require(self.questions[question_id].isExists, "Question isn't existed");
    // if (answer_id == 0) {
    //   uint16 comment_id = uint8(self.questions[question_id].comments.length);
    //   self.questions[question_id].comments[comment_id] = Comment(
    //     uint8(self.questions[question_id].comments.length),
    //     name,
    //     block.timestamp,
    //     true,
    //     ipfsHash
    //   );
    // } else {
    //   require(self.questions[question_id].answers.length > answer_id, "answer not found");
    //   uint8 comment_id = uint8(self.questions[question_id].answers[answer_id].comments.length);
    //   self.questions[question_id].answers[answer_id].comments.push(Comment(    //push?
    //     comment_id,
    //     name,
    //     block.timestamp,
    //     true,
    //     ipfsHash
    //   ));
    // }
  }

  function Edit_question(     //LAST_MODIFIED?
    Collection storage self,
    string memory name,
    uint32 question_id,
    uint16 community_id,
    // tags
    Assert_lib.IpfsHash storage ipfsHash
  ) public {
    // require(self.size <= question_id , "Question not found");
    // require(self.questions[question_id].isExists, "Question isn't existed");
    
    // Question storage question = self.questions[question_id];
    // question.community_id = community_id;
    // question.ipfsHash = ipfsHash;    
  }

  function Edit_answer(     //LAST_MODIFIED?
    Collection storage self,
    string memory name,
    uint32 question_id,
    uint16 answer_id,
    bool official_answer,
    Assert_lib.IpfsHash storage ipfsHash
  ) public {
    // require(self.size <= question_id , "Question not found");
    // require(self.questions[question_id].isExists, "Question isn't existed");
    // require(self.questions[question_id].answers.length > answer_id, "Answer not found");
    // require(self.questions[question_id].answers[answer_id].isExists, "Answer isn't existed");
    
    // Answer storage answer = self.questions[question_id].answers[answer_id];
    // answer.ipfsHash = ipfsHash;
    // if(answer.official_answer != official_answer)   //will check gas?
    //   answer.official_answer = official_answer;    
  }

  function Edit_comment(    //LAST_MODIFIED?
    Collection storage self,
    string memory name,
    uint32 question_id,
    uint16 answer_id,
    uint8 comment_id,
    Assert_lib.IpfsHash storage ipfsHash
  ) public {
    // require(self.size <= question_id , "Question not found");
    // require(self.questions[question_id].isExists, "Question isn't existed");
    // if (answer_id == 0) {
    //   require(self.questions[question_id].comments.length > answer_id, "Comment not found");
    //   require(self.questions[question_id].comments[comment_id].isExists, "Comment isn't existed");
    //   self.questions[question_id].comments[comment_id].ipfsHash = ipfsHash;
    // } else {
    //   require(self.questions[question_id].answers.length > answer_id, "Answer not found");
    //   require(self.questions[question_id].answers[answer_id].isExists, "Answer isn't existed");
    //   require(self.questions[question_id].answers[answer_id].comments.length > comment_id, "Comment not found");
    //   require(self.questions[question_id].answers[answer_id].comments[comment_id].isExists, "Comment isn't existed");
    //   self.questions[question_id].answers[answer_id].comments[comment_id].ipfsHash = ipfsHash;
    // }
  }

  function Delete_question(     //LAST_MODIFIED?
    Collection storage self,
    string memory name,
    uint32 question_id
  ) public {
    // require(self.size <= question_id , "Question not found");
    // require(self.questions[question_id].isExists, "Question isn't existed");
    
    // Question storage question = self.questions[question_id];
    // self.questions[question_id].isExists = false;
    ///
    // -rating
    // delete answer, - rating
    // delete comment?
    ///   
  }

  function Delete_answer(
    Collection storage self,
    string memory name,
    uint32 question_id,
    uint16 answer_id
  ) public {
    ///
    //check autor
    ///
    // require(self.size <= question_id , "Question not found");
    // require(self.questions[question_id].isExists, "Question isn't existed");
    // require(self.questions[question_id].answers.length > answer_id, "Answer not found");
    // require(self.questions[question_id].answers[answer_id].isExists, "Answer isn't existed");

    // self.questions[question_id].answers[answer_id].isExists = false;
    ///
    // - rating
    // delete comment?
    /// 
  }

  function Delete_comment(
    Collection storage self,
    string memory name,
    uint32 question_id,
    uint16 answer_id,
    uint8 comment_id
  ) public {
  //   require(self.size <= question_id , "Question not found");
  //   require(self.questions[question_id].isExists, "Question isn't existed");
  //   if (answer_id == 0) {
  //     require(self.questions[question_id].comments.length > answer_id, "Comment not found");
  //     require(self.questions[question_id].comments[comment_id].isExists, "Comment isn't existed");
  //     self.questions[question_id].comments[comment_id].isExists = false;
  //   } else {
  //     require(self.questions[question_id].answers.length > answer_id, "Answer not found");
  //     require(self.questions[question_id].answers[answer_id].isExists, "Answer isn't existed");
  //     require(self.questions[question_id].answers[answer_id].comments.length > comment_id, "Comment not found");
  //     require(self.questions[question_id].answers[answer_id].comments[comment_id].isExists, "Comment isn't existed");
  //     self.questions[question_id].answers[answer_id].comments[comment_id].isExists = false;
  //   }
  }
}