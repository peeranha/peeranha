pragma solidity ^0.7.3;
pragma abicoder v2;

import "./libraries/NFTLib.sol";
import "./libraries/AchievementCommonLib.sol";
import "./interfaces/IPeeranhaNFT.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

///
//   Init contract owner
// owner init by peranhaNFTAddress
// peeranhaNFT.transferOwnership(peeranhaAddress)
///

contract PeeranhaNFT is ERC721Upgradeable, IPeeranhaNFT, OwnableUpgradeable {
  NFTLib.AchievementNFTsContainer achievementsNFTContainer;

  function initialize(string memory name, string memory symbol) public initializer {
    __NFT_init(name, symbol);
    __Ownable_init_unchained();
  }

  function __NFT_init(string memory name, string memory symbol) internal initializer {
    __ERC721_init(name, symbol);
  }

  function __Token_init_unchained() internal initializer {
  }

  function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override (ERC721Upgradeable) {
    super._beforeTokenTransfer(from, to, amount);
  }

  event ConfigureNewAchievementNFT(uint64 achievementId);

  function configureNewAchievementNFT(
    uint64 achievementId,
    uint64 maxCount,
    string memory achievementURI,
    AchievementCommonLib.AchievementsType achievementsType
  ) 
    external
    onlyOwner()
    override
  {
    NFTLib.AchievementNFTsConfigs storage achievementNFT = achievementsNFTContainer.achievementsNFTConfigs[++achievementsNFTContainer.achievementsCount];
    require(achievementId == achievementsNFTContainer.achievementsCount, "Wrong achievement Id");
    require(maxCount > 0, "Max count of achievements must be more than 0");
    require(maxCount < NFTLib.POOL_NFT, "Max count of achievements must be less than 1 000 000");

    achievementNFT.maxCount = maxCount;
    achievementNFT.achievementURI = achievementURI;
    achievementNFT.achievementsType = achievementsType;

    emit ConfigureNewAchievementNFT(achievementId);
  }

  // unit test: peeranha token call this action
  function mint(
    address user,
    uint64 achievementId
  )
    external
    onlyOwner()
    override
  {
    NFTLib.AchievementNFTsConfigs storage achievementNFT = achievementsNFTContainer.achievementsNFTConfigs[achievementId];
    achievementNFT.factCount++;
    uint64 tokenId = (achievementId - 1) * NFTLib.POOL_NFT + achievementNFT.factCount;

    _safeMint(user, tokenId);          // || _mint
    _setTokenURI(tokenId, achievementNFT.achievementURI);

    // check uri?
  }

  function getAchievementsNFTConfig(uint64 achievementId) external view returns (NFTLib.AchievementNFTsConfigs memory) {
    return achievementsNFTContainer.achievementsNFTConfigs[achievementId];
  }
}
