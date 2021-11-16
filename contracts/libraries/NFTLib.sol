pragma solidity >=0.5.0;
pragma abicoder v2;

import "../interfaces/IPeeranhaNFT.sol";
import "./AchievementLib.sol";


/// @title NFTLib
/// @notice
/// @dev
library NFTLib {
  struct AchievementConfigsNFT {
    uint64 factCount;
    uint64 maxCount;
    string achievementURI;
    AchievementLib.AchievementsType achievementsType;
  }

  struct AchievementsContainerNFT {
    mapping(uint64 => AchievementConfigsNFT) achievementsConfigsNFT;
    uint64 achievementsCount;
  }
}