pragma solidity >=0.5.0;

/// @title Assert_lib
/// @notice Provides information about registered user  //
/// @dev Users information is stored in the mapping on the main contract  //

library Assert_lib  {
  struct IpfsHash {
    bytes32 ipfsHash;
    bytes32 ipfsHash2; // Not currently used and added for the future compatibility
  }

  /// @notice Check valid title
  /// @param title The title question
  function Assert_title(string memory title) public pure {
    Assert_readble_string(title, 3, 256, "Invalid title length");
  }

  /// @notice Check valid title
  /// @param str The title question
  /// @param min_len The title question
  /// @param max_len The title question
  /// @param message The title question
  function Assert_readble_string(string memory str, uint256 min_len, uint256 max_len, string memory message) public pure {
    bool ok = true;
    uint256 str_len = bytes(str).length;
    if (str_len < min_len || str_len > max_len){
      ok = false;
    } /*else if (isspace(str[0]) || isspace(str[str.size() - 1])){
      ok = false;
    } else {
      for (int i = 1 ; i < str.size() - 1; ++i){
        if (isspace(str[i]) && isspace(str[i + 1])){
          ok = false;
        }
      }
    }*/
    require(ok, message);
  }

  // /// @notice Check valid title
  // /// @param question_id The title question
  // function Find_question(uint32 memory question_id) public pure {
  //   Assert_readble_string(title, 3, 256, "Invalid title length");
  // }
}
