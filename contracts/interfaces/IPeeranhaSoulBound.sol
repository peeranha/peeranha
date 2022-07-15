//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;
pragma abicoder v2;

import "../libraries/AchievementCommonLib.sol";


interface IPeeranhaSoulBound {
  function mint(address user, uint64 achievementId) external;
  function configureNewSoulBoundAchievement(
    uint64 achievementId,
    string memory achievementURI,
    AchievementCommonLib.AchievementsType achievementsType) external;
}