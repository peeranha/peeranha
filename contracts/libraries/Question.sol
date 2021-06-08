pragma solidity >=0.5.0;
import "./Utils.sol";

/// @title Question
/// @notice Provides information about registered user  //
/// @dev Users information is stored in the mapping on the main contract  //
library Question_lib  {//

  // uint32 public question_asked = 4294967294;
  struct Comment { //bool isExists?
    uint8 id;
    string name;
    uint256 post_time;
    bool isExists;
    Assert_lib.IpfsHash ipfs_link;
    /*std::vector<int_key_value> properties;
    std::vector<history_item> history;*/
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
    //std::vector<int_key_value> properties;
    //std::vector<history_item> history;
  }

  struct Question {
    uint32 id;
    uint16 community_id;
    uint256 post_time;
    string name;
    string title;
    Answer[] answers;
    Comment[] comments;
    uint16 correct_answer_id;
    bool isExists;
    Assert_lib.IpfsHash ipfs_link;
    //std::vector<uint32_t> tags;
    //int16_t rating;
    //std::vector<int_key_value> properties;    // type question + isDeleted?
  }


  ///
  // template ?
  ///
  struct Collection_question {
    mapping(uint32 => Question) questions;
    uint32 size;
  }

  // struct Collection_answer {
  //   mapping(uint32 => Answer) answers;
  //   uint32 size;
  // }

  // struct Collection_comment {
  //   mapping(uint32 => Comment) comments;
  //   uint32 size;
  // }
  

  /// @notice Create new user info record                       //
  /// @param name The mapping containing all users              //
  /// @param community_id Address of the user to create         //
  /// @param title IPFS hash of document with user information  //
  /// @param question_id IPFS hash of document with user information  //
  
  function Post_question(
    Assert_lib.IpfsHash memory ipfs_link,
    string memory name,
    uint16 community_id,
    string memory title,
    uint32 question_id,   //?
    Collection_question storage self
    /*const IpfsHash &ipfs_link 
    const std::vector<uint32_t> tags,*/
  ) public {
    Assert_lib.Assert_title(title);
    require(self.size == question_id , "Id question is engaged");
    ///
    //check community, ipfs, tags
    ///

    ///
    //update user statistics + rating
    ///
    self.questions[question_id] = Question(
      question_id,
      community_id,
      block.timestamp,
      name,
      title,
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

  /// @notice Create new user info record                       //
  /// @param name The mapping containing all users              //
  /// @param question_id Address of the user to create         //
  /// @param official_answer IPFS hash of document with user information  //
  
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
    string memory title,
    Assert_lib.IpfsHash memory ipfs_link
  ) public {
    require(self.size <= question_id , "Question not found");
    require(self.questions[question_id].isExists, "Question isn't existed");
    
    Question storage question = self.questions[question_id];
    question.community_id = community_id;
    question.title = title;
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

