pragma solidity ^0.7.3;
pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20CappedUpgradeable.sol";

import "./libraries/User.sol";
import "./libraries/PostLib.sol";

import "./interfaces/IPeeranha.sol";

contract Peeranha is IPeeranha, Initializable, AccessControlUpgradeable, ERC20Upgradeable, ERC20PausableUpgradeable, ERC20CappedUpgradeable  {
  using User for User.Collection;
  using User for User.Info;

  using PostLib for PostLib.Content;
  using PostLib for PostLib.PostCollection;

  User.Collection users;
  PostLib.PostCollection posts;
  
  function __Peeranha_init(string memory name, string memory symbol, uint256 cap) internal initializer {
    __AccessControl_init_unchained();
    __ERC20_init_unchained(name, symbol);
    __Pausable_init_unchained();
    __ERC20Capped_init_unchained(cap);
    __ERC20Pausable_init_unchained();
    __Peeranha_init_unchained(name, symbol, cap);
  }

  function __Peeranha_init_unchained(string memory name, string memory symbol, uint256 cap) internal initializer {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setupRole(PAUSER_ROLE, msg.sender);
  }

  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

  function __Peeranha_init() internal initializer {
    __AccessControl_init_unchained();
    __Pausable_init_unchained();
    __Peeranha_init_unchained();
  }

  function __Peeranha_init_unchained() internal initializer {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setupRole(PAUSER_ROLE, msg.sender);
  }

  /**
   * @dev Signup for user account.
   *
   * Requirements:
   *
   * - Must be a new user.
   */
  function createUser(bytes32 ipfsHash) external override {
    users.create(msg.sender, ipfsHash);
  }

  /**
   * @dev Edit user profile.
   *
   * Requirements:
   *
   * - Must be an existing user.
   */
  function updateUser(bytes32 ipfsHash) external override {
    users.update(msg.sender, ipfsHash);
  }
  
  /**
   * @dev Pauses all token transfers.
   *
   * See {ERC20Pausable} and {Pausable-_pause}.
   *
   * Requirements:
   *
   * - the caller must have the `PAUSER_ROLE`.
   */
  function pause() public virtual {
    require(hasRole(PAUSER_ROLE, msg.sender), "Peeranha: must have pauser role to pause");
    _pause();
  }

  /**
   * @dev Unpauses all token transfers.
   *
   * See {ERC20Pausable} and {Pausable-_unpause}.
   *
   * Requirements:
   *
   * - the caller must have the `PAUSER_ROLE`.
   */
  function unpause() public virtual {
    require(hasRole(PAUSER_ROLE, msg.sender), "Peeranha: must have pauser role to unpause");
    _unpause();
  }

  function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override(ERC20Upgradeable, ERC20PausableUpgradeable, ERC20CappedUpgradeable) {
    super._beforeTokenTransfer(from, to, amount);
  }

  function publicationPost(address name, uint8 communityId, bytes32 ipfsHash) external override {
    posts.publicationPost(name, communityId, ipfsHash);
  }

  function editPost(address name, uint32 postId, uint8 communityId, bytes32 ipfsHash) external override {
    posts.editPost(name, postId, communityId, ipfsHash);
  }

  function deletePost(address name, uint32 postId) external override {
    posts.deletePost(name, postId);
  }

  function postReply(address name, uint32 postId, bool officialReply, uint16[] memory path, bytes32 ipfsHash) external override {
    posts.postReply(name, postId, officialReply, path, ipfsHash);
  }

  function editReply(address name, uint32 postId, uint16[] memory path, uint16 replyId, bool officialReply, bytes32 ipfsHash) external override { 
    posts.editReply(name, postId, path, replyId, officialReply, ipfsHash);
  }

  function deleteReply(address name, uint32 postId, uint16[] memory path, uint16 replyId) external override { 
    posts.deleteReply(name, postId, path, replyId);
  }

  function postComment(address name, uint32 postId, uint16[] memory path, bytes32 ipfsHash) external override {
    posts.postComment(name, postId, path, ipfsHash);
  }

  function editComment(address name, uint32 postId, uint16[] memory path, uint8 commentId, bytes32 ipfsHash) external override {
    posts.editComment(name, postId, path, commentId, ipfsHash);
  }

  function deleteComment(address name, uint32 postId, uint16[] memory path, uint8 commentId) external override {
    posts.deleteComment(name, postId, path, commentId);
  }

  function getPostByIndex(uint32 postId) external view returns (PostLib.Content memory) {
    return posts.getPostByIndex(postId);
  }

  function getReplyByPath(uint32 postId, uint16[] memory path, uint16 replyId) external view returns (PostLib.Content memory) {
    return posts.getReplyByPath(postId, path, replyId);
  }

  function getCommentByPath(uint32 postId, uint16[] memory path, uint8 commentId) external view returns (PostLib.Content memory) {
    return posts.getCommentByPath(postId, path, commentId);
  }
}