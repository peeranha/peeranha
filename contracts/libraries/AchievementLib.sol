//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../interfaces/IPeeranhaNFT.sol";
import "../interfaces/IPeeranhaSoulBound.sol";
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

  struct SoulAchievementConfig {
    int64 lowerBound;
    AchievementCommonLib.AchievementsType achievementsType;
  }

  struct SoulAchievementsContainer {
    mapping(uint32 => uint64[]) communitiesAchievement; 
    mapping(uint64 => SoulAchievementConfig) achievementsConfigs;
    mapping(address => mapping(uint64 => bool)) userAchievementsIssued;
    uint64 achievementsCount;
    IPeeranhaSoulBound peeranhaSoulBound;
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

  function updateUserAchievements (
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

  function configureNewSoulAchievement (
    SoulAchievementsContainer storage achievementsContainer,
    int64 lowerBound,
    uint32 communityId,
    string memory achievementURI,
    AchievementCommonLib.AchievementsType achievementsType
  ) 
    internal 
  {
    uint64 achievementId = ++achievementsContainer.achievementsCount;
    achievementsContainer.communitiesAchievement[communityId].push(achievementId);
    AchievementLib.SoulAchievementConfig storage achievementConfig = achievementsContainer.achievementsConfigs[achievementId];
    achievementConfig.lowerBound = lowerBound;
    achievementConfig.achievementsType = achievementsType;

    achievementsContainer.peeranhaSoulBound.configureNewSoulBoundAchievement(achievementsContainer.achievementsCount, achievementURI, achievementsType);
  }

  function updateUserSoulAchievements (
    SoulAchievementsContainer storage achievementsContainer,
    address user,
    uint32 communityId,
    AchievementCommonLib.AchievementsType achievementsType,
    int64 currentValue
  )
    internal
  {
    if (achievementsType == AchievementCommonLib.AchievementsType.Rating) {
      SoulAchievementConfig storage achievementConfig;
      uint256 communitiesAchievementLength = achievementsContainer.communitiesAchievement[communityId].length;
      for (uint64 i; i < communitiesAchievementLength; i++) {
        uint64 achievementId = achievementsContainer.communitiesAchievement[communityId][i];
        achievementConfig = achievementsContainer.achievementsConfigs[achievementId];

        if (achievementConfig.lowerBound > currentValue) continue;
        if (achievementsContainer.userAchievementsIssued[user][achievementId]) continue; //already issued
        achievementsContainer.userAchievementsIssued[user][achievementId] = true;
        achievementsContainer.peeranhaSoulBound.mint(user, i);
      }
    }
  }
}