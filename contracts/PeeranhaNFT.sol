pragma solidity ^0.7.3;
pragma abicoder v2;

import "./libraries/NFTLib.sol";
import "./libraries/AchievementCommonLib.sol";
import "./interfaces/IPeeranha.sol";
import "./interfaces/IPeeranhaNFT.sol";

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";   //132k gas    /// delete role? new Option 66k

contract PeeranhaNFT is ERC721Upgradeable, IPeeranhaNFT {
  address public owner;

  NFTLib.AchievementNFTsContainer achievementsNFTContainer;
  IPeeranha peeranha;

  using CountersUpgradeable for CountersUpgradeable.Counter;
  CountersUpgradeable.Counter private _tokenIds;

  function initialize(string memory name, string memory symbol) public initializer {
    __NFT_init(name, symbol);
    Ownable_init_unchained();
  }

  function Ownable_init_unchained() internal initializer {
    owner = msg.sender;
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
    NFTLib.AchievementNFTsConfigs storage achievementNFT = achievementsNFTContainer.achievementsConfigsNFT[++achievementsNFTContainer.achievementsCount];
    require(achievementId == achievementsNFTContainer.achievementsCount, "Wrong achievement Id");
    require(maxCount > 0, "Max count of achievements must be more than 0");
    require(maxCount < NFTLib.POOL_NFT, "Max count of achievements must be less than 1 000 000");

    achievementNFT.maxCount = maxCount;
    achievementNFT.achievementURI = achievementURI;
    achievementNFT.achievementsType = achievementsType;

    emit ConfigureNewAchievementNFT(achievementId);
  }

  function mint(
    address user,
    uint64 achievementId
  )
    external
    override
  {
    NFTLib.AchievementNFTsConfigs storage achievementNFT = achievementsNFTContainer.achievementsConfigsNFT[achievementId];
    achievementNFT.factCount++;
    uint64 tokenId = (achievementId - 1) * NFTLib.POOL_NFT + achievementNFT.factCount;

    _safeMint(user, tokenId);          // || _mint
    _setTokenURI(tokenId, achievementNFT.achievementURI);

    // check uri?
  }

  function getNFT(uint64 achievementId) external view returns (NFTLib.AchievementNFTsConfigs memory) {
    return achievementsNFTContainer.achievementsConfigsNFT[achievementId];
  }

  modifier onlyOwner() {
    require(true, "Caller is not the owner"); /// owner == msg.sender
    _;
  }
}
