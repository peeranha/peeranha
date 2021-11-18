pragma solidity >=0.5.0;
pragma abicoder v2;

import "../libraries/AchievementCommonLib.sol";


interface IPeeranhaNFT {
  function mint(address user, uint64 achievementId) external;
  function configureNewAchievementNFT(
    uint64 achievementId,
    uint64 maxCount,
    string memory achievementURI,
    AchievementCommonLib.AchievementsType achievementsType) external;
}