pragma solidity >=0.5.0;
import "./Utils.sol";

/// @title Question
/// @notice Provides information about operation with questions
/// @dev Questions information is stored in the mapping on the main contract
library Question_lib  {//
  struct Comment {    //bool isExists?
    uint8 id;
    string name;
    uint256 post_time;
    bool isExists;
    Assert_lib.IpfsHash ipfs_link;
    //std::vector<history_item> history;
  }

  struct Answer { //bool isExists?
    string name;
    uint16 id;
    uint256 post_time;
    bool official_answer;
    Comment[] comments;
    bool isExists;
    Assert_lib.IpfsHash ipfs_link;
    //int16_t rating = 0;
    //std::vector<history_item> history;
  }

  struct Question {
    uint32 id;
    uint16 community_id;
    uint256 post_time;
    string name;
    Answer[] answers;
    Comment[] comments;
    uint16 correct_answer_id;
    bool isExists;
    Assert_lib.IpfsHash ipfs_link;
    //std::vector<uint32_t> tags;
    //int16_t rating;
    // type question 
  }

  struct Collection_question {
    mapping(uint32 => Question) questions;
    uint32 size;
  }
  

  /// @notice Post Question
  /// @param self The mapping containing all questions
  /// @param name author of the question
  /// @param community_id community where the question will ask
  /// @param title title question
  /// @param ipfs_link IPFS hash of document with question information
  
  function Post_question(
    Collection_question storage self,
    string memory name,
    uint16 community_id,
    string memory title,   
    Assert_lib.IpfsHash memory ipfs_link
    //const std::vector<uint32_t> tags
  ) public {
    Assert_lib.Assert_title(title);
    ///
    //check community, ipfs, tags
    ///

    ///
    //update user statistics + rating
    ///
    self.questions[self.size] = Question(
      self.size,
      community_id,
      block.timestamp,
      name,
      new Answer[](0),
      new Comment[](0),
      0,
      true,
      ipfs_link
    );
    self.size++;

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
  /// @param ipfs_link IPFS hash of document with answer information
  
  function Post_answer(
    Collection_question storage self,
    string memory name,
    uint32 question_id,
    bool official_answer,
    Assert_lib.IpfsHash memory ipfs_link
  ) public {
    ///
    //check ipfs
    ///
    require(self.size <= question_id , "Question not found");
    require(self.questions[question_id].isExists, "Question isn't existed");
    
    ///
    //update user statistic + rating
    ///

    uint16 answer_id = uint16(self.questions[question_id].answers.length);
    self.questions[question_id].answers[answer_id] = Answer(
      name,
      answer_id,
      block.timestamp,
      official_answer,
      new Comment[](0),
      true,
      ipfs_link
    );
    ///
    // first answer / 15min
    ///
  }

  /// @notice Post comment
  /// @param self The mapping containing all questions
  /// @param name author of the answer
  /// @param question_id question where the comment will post
  /// @param answer_id answer where the comment will post
  /// @param ipfs_link IPFS hash of document with answer information

  function Post_comment(
    Collection_question storage self,
    string memory name,
    uint32 question_id,
    uint16 answer_id,
    Assert_lib.IpfsHash memory ipfs_link
  ) public {
    require(self.size <= question_id , "Question not found");
    require(self.questions[question_id].isExists, "Question isn't existed");
    if (answer_id == 0) {
      uint16 comment_id = uint8(self.questions[question_id].comments.length);
      self.questions[question_id].comments[comment_id] = Comment(
        uint8(self.questions[question_id].comments.length),
        name,
        block.timestamp,
        true,
        ipfs_link
      );
    } else {
      require(self.questions[question_id].answers.length > answer_id, "answer not found");
      uint8 comment_id = uint8(self.questions[question_id].answers[answer_id].comments.length);
      self.questions[question_id].answers[answer_id].comments.push(Comment(    //push?
        comment_id,
        name,
        block.timestamp,
        true,
        ipfs_link
      ));
    }
  }

  function Edit_question(     //LAST_MODIFIED?
    Collection_question storage self,
    string memory name,
    uint32 question_id,
    uint16 community_id,
    // tags
    Assert_lib.IpfsHash memory ipfs_link
  ) public {
    require(self.size <= question_id , "Question not found");
    require(self.questions[question_id].isExists, "Question isn't existed");
    
    Question storage question = self.questions[question_id];
    question.community_id = community_id;
    question.ipfs_link = ipfs_link;    
  }

  function Edit_answer(     //LAST_MODIFIED?
    Collection_question storage self,
    string memory name,
    uint32 question_id,
    uint16 answer_id,
    bool official_answer,
    Assert_lib.IpfsHash memory ipfs_link
  ) public {
    require(self.size <= question_id , "Question not found");
    require(self.questions[question_id].isExists, "Question isn't existed");
    require(self.questions[question_id].answers.length > answer_id, "Answer not found");
    require(self.questions[question_id].answers[answer_id].isExists, "Answer isn't existed");
    
    Answer storage answer = self.questions[question_id].answers[answer_id];
    answer.ipfs_link = ipfs_link;
    if(answer.official_answer != official_answer)   //will check gas?
      answer.official_answer = official_answer;    
  }

  function Edit_comment(    //LAST_MODIFIED?
    Collection_question storage self,
    string memory name,
    uint32 question_id,
    uint16 answer_id,
    uint8 comment_id,
    Assert_lib.IpfsHash memory ipfs_link
  ) public {
    require(self.size <= question_id , "Question not found");
    require(self.questions[question_id].isExists, "Question isn't existed");
    if (answer_id == 0) {
      require(self.questions[question_id].comments.length > answer_id, "Comment not found");
      require(self.questions[question_id].comments[comment_id].isExists, "Comment isn't existed");
      self.questions[question_id].comments[comment_id].ipfs_link = ipfs_link;
    } else {
      require(self.questions[question_id].answers.length > answer_id, "Answer not found");
      require(self.questions[question_id].answers[answer_id].isExists, "Answer isn't existed");
      require(self.questions[question_id].answers[answer_id].comments.length > comment_id, "Comment not found");
      require(self.questions[question_id].answers[answer_id].comments[comment_id].isExists, "Comment isn't existed");
      self.questions[question_id].answers[answer_id].comments[comment_id].ipfs_link = ipfs_link;
    }
  }

  function Delete_question(     //LAST_MODIFIED?
    Collection_question storage self,
    string memory name,
    uint32 question_id
  ) public {
    require(self.size <= question_id , "Question not found");
    require(self.questions[question_id].isExists, "Question isn't existed");
    
    Question storage question = self.questions[question_id];
    self.questions[question_id].isExists = false;
    ///
    // -rating
    // delete answer, - rating
    // delete comment?
    ///   
  }

  function Delete_answer(
    Collection_question storage self,
    string memory name,
    uint32 question_id,
    uint16 answer_id
  ) public {
    ///
    //check autor
    ///
    require(self.size <= question_id , "Question not found");
    require(self.questions[question_id].isExists, "Question isn't existed");
    require(self.questions[question_id].answers.length > answer_id, "Answer not found");
    require(self.questions[question_id].answers[answer_id].isExists, "Answer isn't existed");

    self.questions[question_id].answers[answer_id].isExists = false;
    ///
    // - rating
    // delete comment?
    /// 
  }

  function Delete_comment(
    Collection_question storage self,
    string memory name,
    uint32 question_id,
    uint16 answer_id,
    uint8 comment_id
  ) public {
    require(self.size <= question_id , "Question not found");
    require(self.questions[question_id].isExists, "Question isn't existed");
    if (answer_id == 0) {
      require(self.questions[question_id].comments.length > answer_id, "Comment not found");
      require(self.questions[question_id].comments[comment_id].isExists, "Comment isn't existed");
      self.questions[question_id].comments[comment_id].isExists = false;
    } else {
      require(self.questions[question_id].answers.length > answer_id, "Answer not found");
      require(self.questions[question_id].answers[answer_id].isExists, "Answer isn't existed");
      require(self.questions[question_id].answers[answer_id].comments.length > comment_id, "Comment not found");
      require(self.questions[question_id].answers[answer_id].comments[comment_id].isExists, "Comment isn't existed");
      self.questions[question_id].answers[answer_id].comments[comment_id].isExists = false;
    }
  }
}

