//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./CommonLib.sol";
import "./UserLib.sol";


/// @title RewardLib
/// @notice
/// @dev
library RewardLib {
  uint256 constant PERIOD_LENGTH = 6;          // 7 day = 1 period //
  uint256 constant START_PERIOD_TIME = 1674231634;  // June 15, 2022 12:00:00 AM GMT

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


  /// @notice Get current perion
  function getPeriod() internal view returns (uint16) {
    return uint16((CommonLib.getTimestamp() - START_PERIOD_TIME) / PERIOD_LENGTH);
  }
}