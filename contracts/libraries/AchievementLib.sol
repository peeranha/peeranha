pragma solidity >=0.5.0;
pragma abicoder v2;

import "../interfaces/IPeeranhaNFT.sol";
import "./AchievementCommonLib.sol";


/// @title AchievementLib
/// @notice
/// @dev
library AchievementLib {
  struct AchievementConfig {
    uint64 factCount;
    uint64 maxCount;
    int64 lowerBound;
    AchievementCommonLib.AchievementsType achievementsType;
  }

  struct AchievementsContainer {
    mapping(uint64 => AchievementConfig) achievementsConfigs;
    mapping(address => mapping(uint64 => bool)) userAchievementsIssued;
    uint64 achievementsCount;
    IPeeranhaNFT peeranhaNFT;
  }

  function configureNewAchievement(
    AchievementsContainer storage achievementsContainer,
    uint64 maxCount,
    int64 lowerBound,
    string memory achievementURI,
    AchievementCommonLib.AchievementsType achievementsType
  ) 
    internal 
  {
    require(maxCount > 0, "invalid_max_count");

    AchievementLib.AchievementConfig storage achievementConfig = achievementsContainer.achievementsConfigs[++achievementsContainer.achievementsCount];
    achievementConfig.maxCount = maxCount;
    achievementConfig.lowerBound = lowerBound;
    achievementConfig.achievementsType = achievementsType;

    achievementsContainer.peeranhaNFT.configureNewAchievementNFT(achievementsContainer.achievementsCount, maxCount, achievementURI, achievementsType);
  }

  function updateUserAchievements(
    AchievementsContainer storage achievementsContainer,
    address user,
    AchievementCommonLib.AchievementsType achievementsType,
    int64 currentValue
  )
    internal
  {
    if (achievementsType == AchievementCommonLib.AchievementsType.Rating) {
      AchievementConfig storage achievementConfig;
      for (uint64 i = 1; i <= achievementsContainer.achievementsCount; i++) { /// optimize ??
        achievementConfig = achievementsContainer.achievementsConfigs[i];

        if (achievementConfig.maxCount <= achievementConfig.factCount) continue;    // not exit/max
        if (achievementConfig.lowerBound > currentValue) continue;
        if (achievementsContainer.userAchievementsIssued[user][i]) continue; //already issued
        achievementConfig.factCount++;
        achievementsContainer.userAchievementsIssued[user][i] = true;
        achievementsContainer.peeranhaNFT.mint(user, i);
      }
    }
  }
}