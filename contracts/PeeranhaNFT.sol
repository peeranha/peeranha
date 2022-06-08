//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./libraries/NFTLib.sol";
import "./libraries/AchievementCommonLib.sol";
import "./base/ChildMintableERC721Upgradeable.sol";
import "./interfaces/IPeeranhaNFT.sol";


contract PeeranhaNFT is IPeeranhaNFT, ChildMintableERC721Upgradeable {
  
  bytes32 public constant OWNER_MINTER_ROLE = bytes32(keccak256("OWNER_MINTER_ROLE"));

  event ConfigureNewAchievementNFT(uint64 indexed achievementId);
  
  NFTLib.AchievementNFTsContainer achievementsNFTContainer;

  function initialize(string memory name, string memory symbol, address peeranhaUserContractAddress, address childChainManager) public initializer {
    __NFT_init(name, symbol, peeranhaUserContractAddress, childChainManager);
  }

  function __NFT_init(string memory name, string memory symbol, address peeranhaUserContractAddress, address childChainManager) internal onlyInitializing {
    __ChildMintableERC721Upgradeable_init(name, symbol, childChainManager);
    _grantRole(OWNER_MINTER_ROLE, peeranhaUserContractAddress);
    _setRoleAdmin(OWNER_MINTER_ROLE, DEFAULT_ADMIN_ROLE);
  }

  function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override (ChildMintableERC721Upgradeable) {
    super._beforeTokenTransfer(from, to, amount);
  }

  function configureNewAchievementNFT(
    uint64 achievementId,
    uint64 maxCount,
    string memory achievementURI,
    AchievementCommonLib.AchievementsType achievementsType
  ) 
    external
    onlyRole(OWNER_MINTER_ROLE)
    override
  {
    NFTLib.AchievementNFTsConfigs storage achievementNFT = achievementsNFTContainer.achievementsNFTConfigs[++achievementsNFTContainer.achievementsCount];
    require(achievementId == achievementsNFTContainer.achievementsCount, "Wrong achievement Id");
    require(maxCount > 0, "invalid_max_count");
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
    onlyRole(OWNER_MINTER_ROLE)
    override
  {
    NFTLib.AchievementNFTsConfigs storage achievementNFT = achievementsNFTContainer.achievementsNFTConfigs[achievementId];
    achievementNFT.factCount++;
    uint64 tokenId = (achievementId - 1) * NFTLib.POOL_NFT + achievementNFT.factCount;    // uint256?

    _safeMint(user, tokenId);          // || _mint
    _setTokenURI(tokenId, achievementNFT.achievementURI);
  }

  function getAchievementsNFTConfig(uint64 achievementId) external view returns (NFTLib.AchievementNFTsConfigs memory) {
    return achievementsNFTContainer.achievementsNFTConfigs[achievementId];
  }

  function getVersion() public pure returns (uint256) {
      return 1;
  }
}
