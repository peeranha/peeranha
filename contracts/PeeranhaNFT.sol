pragma solidity ^0.7.3;
pragma abicoder v2;

import "./libraries/NFTLib.sol";
import "./interfaces/IPeeranha.sol";
import "./interfaces/IPeeranhaNFT.sol";

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

contract PeeranhaNFT is ERC721Upgradeable, IPeeranhaNFT {
  NFTLib.AchievementsContainerNFT achievementsContainerNFT;
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

  function setTokenURI(
    uint64 achievementId,
    uint64 maxCount,
    string memory achievementURI,
    NFTLib.AchievementType achievementType
  ) 
    external 
    override 
  {
    NFTLib.CountAchievementsNFT storage achievementNFT = achievementsContainerNFT.countAchievementsNFT[achievementId];
    achievementNFT.maxCount = maxCount;
    achievementNFT.achievementURI = achievementURI;
    achievementNFT.achievementType = achievementType;
    achievementsContainerNFT.achievementsCount++;
  }

  function mintNFT(
    address recipient,
    uint64 tokenId,
    uint64 achievementId
  )
    external
    override
  {
    NFTLib.CountAchievementsNFT storage achievementNFT = achievementsContainerNFT.countAchievementsNFT[achievementId];
    achievementNFT.factCount++;
    uint64 localTokenId = (achievementId - 1) * 1000000 + achievementNFT.factCount;
    require(tokenId == localTokenId, "Error token ID ??");

    _safeMint(recipient, tokenId);          // || _mint
    _setTokenURI(tokenId, achievementNFT.achievementURI);

    // check uri?
  }

  function getNFT(uint64 achievementId) external view returns (NFTLib.CountAchievementsNFT memory) {
    return achievementsContainerNFT.countAchievementsNFT[achievementId];
  }
}
