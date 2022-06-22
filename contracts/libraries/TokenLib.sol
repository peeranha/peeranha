//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

/// @title RewardLib
/// @notice
/// @dev
library TokenLib {
  struct StatusRewardContainer {
    mapping(address => mapping(uint16 => StatusReward)) statusReward;
  }

  struct StatusReward {
    bool isPaid;
  }

  struct StakeTotalContainer {
    mapping(uint16 => StakeTotal) stakeTotals;               // period
    uint16[] stakeChangePeriods;
  }

  struct StakeTotal {
    uint256 totalStakedAmount;
    uint64 stakingUsersCount;
  }

  struct UserPeriodStake {
    mapping(address => StakeUserContainer) userPeriodStake;
  }

  struct StakeUserContainer {
    mapping(uint16 => UserStake) userStake;                    // period
    uint16[] stakeChangePeriods;
  }

  struct UserStake {
    uint256 stakedAmount;
    uint256 changedStake; // dont use
  }
}