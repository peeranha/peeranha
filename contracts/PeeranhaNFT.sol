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
    AchievementCommonLib.AchievementsType nftType = getAchievementTypeForNft(amount);
    if (nftType == AchievementCommonLib.AchievementsType.SoulRating) {
      require(from == address(0) || to == address(0), "You_can_not_transfer_soul_bound");
    }

    super._beforeTokenTransfer(from, to, amount);
  }

  function getAchievementTypeForNft(
    uint256 NftId
  ) 
    private
    view
    returns (AchievementCommonLib.AchievementsType)
  {
    uint64 achievementId = uint64((NftId / NFTLib.POOL_NFT) + 1);
    NFTLib.AchievementNFTsConfigs storage achievementNFT = achievementsNFTContainer.achievementsNFTConfigs[achievementId];
    return achievementNFT.achievementsType;
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
    onlyRole(OWNER_MINTER_ROLE)
    override
  {
    require(achievementsNFTContainer.achievementsCount >= achievementId && achievementId != 0, "NFT does not exist");
    NFTLib.AchievementNFTsConfigs storage achievementNFT = achievementsNFTContainer.achievementsNFTConfigs[achievementId];
    require(AchievementCommonLib.isAchievementAvailable(achievementNFT.maxCount, achievementNFT.factCount), "all_nfts_was_given");
    achievementNFT.factCount++;
    uint256 tokenId = (achievementId - 1) * NFTLib.POOL_NFT + achievementNFT.factCount;

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
