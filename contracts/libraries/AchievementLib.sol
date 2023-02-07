//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

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
    AchievementConfig storage achievementConfig;
    for (uint64 i = 1; i <= achievementsContainer.achievementsCount; i++) { /// optimize ??
      achievementConfig = achievementsContainer.achievementsConfigs[i];
      if (achievementsType != achievementConfig.achievementsType) continue;

      if (achievementConfig.maxCount <= achievementConfig.factCount) continue;    // not exit/max
      if (achievementConfig.lowerBound > currentValue) continue;
      if (achievementsContainer.userAchievementsIssued[user][i]) continue; //already issued
      achievementConfig.factCount++;
      achievementsContainer.userAchievementsIssued[user][i] = true;
      achievementsContainer.peeranhaNFT.mint(user, i);
    }
  }

  function mintManualNFT(
    AchievementsContainer storage achievementsContainer,
    address user,
    uint64 achievementId
  )
    internal
  {
    AchievementConfig storage achievementConfig = achievementsContainer.achievementsConfigs[achievementId];
    require(achievementConfig.achievementsType == AchievementCommonLib.AchievementsType.Manual, "you_can_not_mint_the_type");
    require(achievementConfig.maxCount > achievementConfig.factCount, "all_nfts_was_given");
    require(!achievementsContainer.userAchievementsIssued[user][achievementId], "already issued");
    
    achievementConfig.factCount++;
    achievementsContainer.userAchievementsIssued[user][achievementId] = true;
    achievementsContainer.peeranhaNFT.mint(user, achievementId);
  }
}