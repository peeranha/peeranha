//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

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
    mapping(uint64 => AchievementNFTsConfigs) achievementsNFTConfigs;
    uint64 achievementsCount;
  }
}