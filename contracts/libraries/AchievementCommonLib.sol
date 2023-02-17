//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./NFTLib.sol";

/// @title AchievementCommonLib
/// @notice
/// @dev
library AchievementCommonLib {
  enum AchievementsType { Rating, Manual, SoulRating }

  function isAchievementAvailable(uint64 maxCount, uint64 factCount) internal pure returns (bool) {
    return maxCount > factCount || (maxCount == 0 && factCount < NFTLib.POOL_NFT);
  }
}