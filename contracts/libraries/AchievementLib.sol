pragma solidity >=0.5.0;
pragma abicoder v2;

import "../interfaces/IPeeranhaNFT.sol";


/// @title AchievementLib
/// @notice
/// @dev
library AchievementLib {
  uint32 constant POOL_ACHIEVEMENT = 1000000;   // 2 value

  enum AchievementsType { Rating }

  struct AchievementConfig {
    uint64 factCount;
    uint64 maxCount;
    int64 lowerBound;
    AchievementsType achievementsType;
  }

  struct AchievementsContainer {
    mapping(uint64 => AchievementConfig) achievementsConfigs;
    mapping(address => mapping(uint64 => bool)) userAchievementsIssued;
    uint64 achievementsCount;
    IPeeranhaNFT peeranhaNFT;
  }

  function createAchievemt(
    AchievementsContainer storage achievementsContainer,
    AchievementsType achievementsType,
    int64 lowerBound,
    uint64 maxCount
  ) 
    internal 
  {
    require(maxCount != 0, "Max count of achievements must be more than 0");

    AchievementConfig storage countAchievement = achievementsContainer.achievementsConfigs[++achievementsContainer.achievementsCount];
    require(countAchievement.maxCount == 0, "This achievement id already exist");
    countAchievement.lowerBound = lowerBound;
    countAchievement.maxCount = maxCount;
    countAchievement.achievementsType = achievementsType;
  }

  function updateAchievement(
    AchievementsContainer storage achievementsContainer,
    address recipient,
    AchievementsType achievementsType,
    int64 lowerBound /*<- name?*/
  )
    internal
  {
    if (achievementsType == AchievementsType.Rating) {
      AchievementConfig storage countAchievement;
      for (uint64 i = 1; i <= achievementsContainer.achievementsCount; i++) {
        countAchievement = achievementsContainer.achievementsConfigs[i];

        if (countAchievement.maxCount <= countAchievement.factCount) continue;    // not exit/max
        if (countAchievement.lowerBound > lowerBound) continue;
        if (achievementsContainer.userAchievementsIssued[recipient][i]) continue; //already issued
        countAchievement.factCount++;
        achievementsContainer.userAchievementsIssued[recipient][i] = true;
        achievementsContainer.peeranhaNFT.mintNFT(recipient, (i - 1) * POOL_ACHIEVEMENT + countAchievement.factCount, i); // i - 1?
      }
    }
  }
}