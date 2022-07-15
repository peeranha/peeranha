//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./libraries/NFTLib.sol";
import "./libraries/AchievementCommonLib.sol";
import "./base/ChildMintableERC721Upgradeable.sol";
import "./interfaces/IPeeranhaSoulBound.sol";


contract PeeranhaSoulBound is IPeeranhaSoulBound, ChildMintableERC721Upgradeable {
  
  bytes32 public constant OWNER_MINTER_ROLE = bytes32(keccak256("OWNER_MINTER_ROLE"));

  event ConfigureNewSoulBoundAchievement(uint64 indexed achievementId);
  
  NFTLib.AchievementSoulBoundContainer achievementSoulBoundContainer;

  function initialize(string memory name, string memory symbol, address peeranhaUserContractAddress, address childChainManager) public initializer {
    __SoulBound_init(name, symbol, peeranhaUserContractAddress, childChainManager);
  }

  function __SoulBound_init(string memory name, string memory symbol, address peeranhaUserContractAddress, address childChainManager) internal onlyInitializing {
    __ChildMintableERC721Upgradeable_init(name, symbol, childChainManager);
    _grantRole(OWNER_MINTER_ROLE, peeranhaUserContractAddress);
    _setRoleAdmin(OWNER_MINTER_ROLE, DEFAULT_ADMIN_ROLE);
  }

  function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override (ChildMintableERC721Upgradeable) {
    super._beforeTokenTransfer(from, to, amount);

    require(from == address(0) || to == address(0), "You_can_not_transfer_soul_bound");
  }

  function configureNewSoulBoundAchievement(
    uint64 achievementId,
    string memory achievementURI,
    AchievementCommonLib.AchievementsType achievementsType
  ) 
    external
    onlyRole(OWNER_MINTER_ROLE)
    override
  {
    NFTLib.AchievementSoulBoundConfigs storage achievementNFT = achievementSoulBoundContainer.achievementSoulBoundConfigs[++achievementSoulBoundContainer.achievementsCount];
    require(achievementId == achievementSoulBoundContainer.achievementsCount, "Wrong achievement Id");

    achievementNFT.achievementURI = achievementURI;
    achievementNFT.achievementsType = achievementsType;

    emit ConfigureNewSoulBoundAchievement(achievementId);
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
    NFTLib.AchievementSoulBoundConfigs storage achievementNFT = achievementSoulBoundContainer.achievementSoulBoundConfigs[achievementId];
    achievementNFT.factCount++;
    uint64 tokenId = (achievementId - 1) * NFTLib.POOL_NFT + achievementNFT.factCount;    // uint256?

    _safeMint(user, tokenId);          // || _mint
    _setTokenURI(tokenId, achievementNFT.achievementURI);
  }

  function getAchievementsNFTConfig(uint64 achievementId) external view returns (NFTLib.AchievementSoulBoundConfigs memory) {
    return achievementSoulBoundContainer.achievementSoulBoundConfigs[achievementId];
  }

  function getVersion() public pure returns (uint256) {
      return 1;
  }
}
