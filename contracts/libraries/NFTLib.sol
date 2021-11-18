pragma solidity >=0.5.0;
pragma abicoder v2;

import "./AchievementCommonLib.sol";


/// @title NFTLib
/// @notice
/// @dev
library NFTLib {
  uint32 constant POOL_NFT = 1000000;

  struct AchievementNFTsConfigs {
    uint64 factCount;
    uint64 maxCount;
    string achievementURI;
    AchievementCommonLib.AchievementsType achievementsType;
  }

  struct AchievementNFTsContainer {
    mapping(uint64 => AchievementNFTsConfigs) achievementsConfigsNFT;
    uint64 achievementsCount;
  }
}