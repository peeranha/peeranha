pragma solidity ^0.7.3;
import "./libraries/NFTLib.sol";
import "./interfaces/IPeeranha.sol";
import "./interfaces/IPeeranhaNFT.sol";

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

contract PeeranhaNft is ERC721Upgradeable, IPeeranhaNFT {
  // NFTLib.AchievementsContainer achievementsContainer;
  IPeeranha peeranha;

  using CountersUpgradeable for CountersUpgradeable.Counter;
  CountersUpgradeable.Counter private _tokenIds;

  function initialize(string memory name, string memory symbol) public initializer {
    __NFT_init(name, symbol);
  }

  function initPeeranhaContract(address peeranhaContractAddress) public initializer {
    peeranha = IPeeranha(peeranhaContractAddress);
  }

  function __NFT_init(string memory name, string memory symbol) internal initializer {
    __ERC721_init(name, symbol);
  }

  function __Token_init_unchained() internal initializer {
  }

  function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override (ERC721Upgradeable) {
    super._beforeTokenTransfer(from, to, amount);
  }

  function setTokenURI(uint64 achievementId, uint64 posAchievement, string memory _tokenURI) external {
    uint64 tokenId = (achievementId - 1) * 1000000 + posAchievement;
    _setTokenURI(tokenId, _tokenURI);
  }

  function mintNFT(address recipient, uint64 achievementId)
  external
  override
  // onlyOwner
  /*returns (uint256) */ {
    _safeMint(recipient, achievementId);          // || _mint
    // check uri?
  }
}
