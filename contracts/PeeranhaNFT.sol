//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./libraries/NFTLib.sol";
import "./libraries/AchievementCommonLib.sol";
import "./base/ChildMintableERC721Upgradeable.sol";
import "./interfaces/IPeeranhaNFT.sol";

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";


contract PeeranhaNFT is IPeeranhaNFT, ChildMintableERC721Upgradeable, OwnableUpgradeable {
  NFTLib.AchievementNFTsContainer achievementsNFTContainer;

  function initialize(string memory name, string memory symbol, address peeranhaUserContractAddress, address childChainManager) public initializer {
    __NFT_init(name, symbol, childChainManager);
    __Ownable_init_unchained();
    transferOwnership(peeranhaUserContractAddress);
  }

  function __NFT_init(string memory name, string memory symbol, address childChainManager) internal onlyInitializing {
    __ChildMintableERC721Upgradeable_init(name, symbol, childChainManager);
  }

  function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override (ChildMintableERC721Upgradeable) {
    super._beforeTokenTransfer(from, to, amount);
  }

  // This is to support Native meta transactions
  // never use msg.sender directly, use _msgSender() instead
  function _msgSender()
      internal
      override(ContextUpgradeable, ChildMintableERC721Upgradeable)
      view
      returns (address sender)
  {
      return ChildMintableERC721Upgradeable._msgSender();
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
    uint64 tokenId = (achievementId - 1) * NFTLib.POOL_NFT + achievementNFT.factCount;    // uint256?

    _safeMint(user, tokenId);          // || _mint
    _setTokenURI(tokenId, achievementNFT.achievementURI);
  }

  function getAchievementsNFTConfig(uint64 achievementId) external view returns (NFTLib.AchievementNFTsConfigs memory) {
    return achievementsNFTContainer.achievementsNFTConfigs[achievementId];
  }
}
