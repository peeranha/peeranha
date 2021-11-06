pragma solidity >=0.5.0;
pragma abicoder v2;

import "../interfaces/IPeeranhaNFT.sol";


/// @title NFTLib
/// @notice
/// @dev
library NFTLib {
  enum AchievementType { Rating }

  struct CountAchievement {
    uint64 factCount;
    uint64 maxCount;
    int64 lowerBound;
    AchievementType achievementType;
  }

  struct AchievementsContainer {
    mapping(uint64 => CountAchievement) countAchievements;
    mapping(address => mapping(uint64 => bool)) userAchievementsIssued;
    uint64 achievementsCount;
    IPeeranhaNFT peeranhaNFT;
  }


  struct CountAchievementsNFT {
    uint64 factCount;
    uint64 maxCount;
    string achievementURI;
    AchievementType achievementType;
  }

  struct AchievementsContainerNFT {
    mapping(uint64 => CountAchievementsNFT) countAchievementsNFT;
    uint64 achievementsCount;
  }

  function createAchievemt(
    AchievementsContainer storage achievementsContainer,
    AchievementType achievementType,
    int64 lowerBound,
    uint64 maxCount
  ) 
    internal 
  {
    require(maxCount != 0, "Max count of achievements must be more than 0");

    CountAchievement storage countAchievement = achievementsContainer.countAchievements[++achievementsContainer.achievementsCount];
    require(countAchievement.maxCount == 0, "This achievement id already exist");
    countAchievement.lowerBound = lowerBound;
    countAchievement.maxCount = maxCount;
    countAchievement.achievementType = achievementType;
  }

  function updateAchievement(
    AchievementsContainer storage achievementsContainer,
    address recipient,
    AchievementType achievementType,
    int64 lowerBound /*<- name?*/
  )
    internal
  {
    if (achievementType == AchievementType.Rating) {
      CountAchievement storage countAchievement;
      for (uint64 i = 1; i <= achievementsContainer.achievementsCount; i++) {
        countAchievement = achievementsContainer.countAchievements[i];

        if (countAchievement.maxCount <= countAchievement.factCount) continue;    // not exit/max
        if (countAchievement.lowerBound > lowerBound) continue;
        if (achievementsContainer.userAchievementsIssued[recipient][i]) continue; //already issued
        countAchievement.factCount++;
        achievementsContainer.userAchievementsIssued[recipient][i] = true;
        achievementsContainer.peeranhaNFT.mintNFT(recipient, (i - 1) * 1000000 + countAchievement.factCount, i); // i - 1?
      }
    }
  }
}