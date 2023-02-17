//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../interfaces/IPeeranhaNFT.sol";
import "./AchievementCommonLib.sol";
import "./CommonLib.sol";


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

  struct AchievementsMetadata {
    mapping(uint64 => AchievementMetadata) metadata;  // achievementId
  }

  struct AchievementMetadata {
    mapping(uint8 => bytes32) properties;
    uint32 communityId;
  }

  function configureNewAchievement(
    AchievementsContainer storage achievementsContainer,
    AchievementsMetadata storage achievementsMetadata,
    uint64 maxCount,
    int64 lowerBound,
    string memory achievementURI,
    uint32 communityId,
    AchievementCommonLib.AchievementsType achievementsType
  ) 
    internal 
  {
    uint64 achievementId = ++achievementsContainer.achievementsCount;
    AchievementLib.AchievementConfig storage achievementConfig = achievementsContainer.achievementsConfigs[achievementId];
    achievementConfig.maxCount = maxCount;
    achievementConfig.lowerBound = lowerBound;
    achievementConfig.achievementsType = achievementsType;
    if (communityId != 0) {
      achievementsMetadata.metadata[achievementId].communityId = communityId;
    }

    achievementsContainer.peeranhaNFT.configureNewAchievementNFT(achievementId, maxCount, achievementURI, achievementsType);
  }

  function updateUserAchievements(
    AchievementsContainer storage achievementsContainer,
    AchievementsMetadata storage achievementsMetadata,
    address user,
    AchievementCommonLib.AchievementsType[] memory achievementsTypes,
    int64 currentValue,
    uint32 communityId
  )
    internal
  {
    AchievementConfig storage achievementConfig;
    for (uint64 i = 1; i <= achievementsContainer.achievementsCount; i++) { /// optimize ??
      achievementConfig = achievementsContainer.achievementsConfigs[i];
      
      for (uint j; j < achievementsTypes.length; j++) {
        if(achievementsTypes[j] == achievementConfig.achievementsType) {
          if (
            achievementsMetadata.metadata[i].communityId != communityId &&
            achievementsMetadata.metadata[i].communityId != 0
          ) continue;
          if (!CommonLib.isNotGivenNFTS(achievementConfig.maxCount, achievementConfig.factCount)) continue;
          if (achievementConfig.lowerBound > currentValue) continue;
          if (achievementsContainer.userAchievementsIssued[user][i]) continue; //already issued
          achievementConfig.factCount++;
          achievementsContainer.userAchievementsIssued[user][i] = true;
          achievementsContainer.peeranhaNFT.mint(user, i);
        }
      }
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
    require(!achievementsContainer.userAchievementsIssued[user][achievementId], "already issued");
    
    achievementConfig.factCount++;
    achievementsContainer.userAchievementsIssued[user][achievementId] = true;
    achievementsContainer.peeranhaNFT.mint(user, achievementId);
  }
}