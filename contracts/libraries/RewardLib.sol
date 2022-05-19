//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./CommonLib.sol";
import "./UserLib.sol";


/// @title RewardLib
/// @notice
/// @dev
library RewardLib {
  uint256 constant PERIOD_LENGTH = 4;          // 7 day = 1 period //
  uint256 constant START_PERIOD_TIME = 1652930614;  // September 28, 2021 8:20:23 PM GMT+03:00 DST

  struct PeriodRating {
    uint32 ratingToReward;
    uint32 penalty;
    bool isActive;
  }

  struct PeriodRewardContainer {
    mapping(uint16 => PeriodRewardShares) periodRewardShares; // period
  }

  struct PeriodRewardShares {
    uint256 totalRewardShares;
    address[] activeUsersInPeriod;
  }

  struct UserPeriodRewards {
    uint32[] rewardCommunities;
    mapping(uint32 => PeriodRating) periodRating;  //communityID
  }


  /// @notice Get perion
  /// @param time Unix time. Usual now()
  function getPeriod(uint32 time) internal pure returns (uint16) {
    return uint16((time - START_PERIOD_TIME) / PERIOD_LENGTH);
  }
}