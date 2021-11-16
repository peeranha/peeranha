pragma solidity ^0.7.3;
pragma abicoder v2;

import "./libraries/NFTLib.sol";
import "./libraries/AchievementLib.sol";
import "./interfaces/IPeeranha.sol";
import "./interfaces/IPeeranhaNFT.sol";

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";   //132k gas

contract PeeranhaNFT is ERC721Upgradeable, IPeeranhaNFT, OwnableUpgradeable {
  NFTLib.AchievementsContainerNFT achievementsContainerNFT;
  IPeeranha peeranha;
  uint32 constant POOL_NFT = 1000000;   // 2 value

  using CountersUpgradeable for CountersUpgradeable.Counter;
  CountersUpgradeable.Counter private _tokenIds;

  function initialize(string memory name, string memory symbol) public initializer {
    __NFT_init(name, symbol);
    __Ownable_init();
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

  function createNewAchievement(
    uint64 achievementId,
    uint64 maxCount,
    string memory achievementURI,
    AchievementLib.AchievementsType achievementsType
  ) 
    external
    onlyOwner()
    override 
  {
    NFTLib.AchievementConfigsNFT storage achievementNFT = achievementsContainerNFT.achievementsConfigsNFT[achievementId];
    achievementNFT.maxCount = maxCount;
    achievementNFT.achievementURI = achievementURI;
    achievementNFT.achievementsType = achievementsType;
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
    NFTLib.AchievementConfigsNFT storage achievementNFT = achievementsContainerNFT.achievementsConfigsNFT[achievementId];
    achievementNFT.factCount++;
    uint64 localTokenId = (achievementId - 1) * POOL_NFT + achievementNFT.factCount;
    require(tokenId == localTokenId, "Error token ID ??");

    _safeMint(recipient, tokenId);          // || _mint
    _setTokenURI(tokenId, achievementNFT.achievementURI);

    // check uri?
  }

  function getNFT(uint64 achievementId) external view returns (NFTLib.AchievementConfigsNFT memory) {
    return achievementsContainerNFT.achievementsConfigsNFT[achievementId];
  }
}
