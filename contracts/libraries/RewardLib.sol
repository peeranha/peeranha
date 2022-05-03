pragma solidity >=0.5.0;
pragma abicoder v2;
import "../Peeranha.sol";
import "./CommonLib.sol";
import "./UserLib.sol";


/// @title RewardLib
/// @notice
/// @dev
library RewardLib {
  uint256 constant PERIOD_LENGTH = 3;          // 7 day = 1 period //
  uint256 constant START_PERIOD_TIME = 1651540350;  // September 28, 2021 8:20:23 PM GMT+03:00 DST

  struct PeriodRating {
    int32 ratingToReward;
    bool isActive;
  }

  struct PeriodRewardContainer {
    mapping(uint16 => PeriodRewardShares) periodRewardShares; // period
  }

  struct PeriodRewardShares {
    int32 totalRewardShares;
    address[] activeUsersInPeriod;
  }

  struct UserPeriodRewards {
    uint32[] rewardCommunities;
    mapping(uint32 => PeriodRating) periodRating;  //communityID
  }


  /// @notice Get perion
  /// @param time Unix time. Usual now()
  function getPeriod(uint32 time) internal view returns (uint16) {
    return uint16((time - START_PERIOD_TIME) / PERIOD_LENGTH);
  }

  // function findInternal(RewardLib.PeriodRating[] storage periodsRating, uint16 begin, uint16 end, uint16 period, bool look) internal returns (RewardLib.PeriodRating storage, bool) {
  //   uint16 len = end - begin;
  //   // if (len == 0 || (len == 1 && periodsRating[begin].period != period)) {
  //     require(!look, "no_reward");
      
  //     RewardLib.PeriodRating memory periodRating;
  //     periodsRating.push(periodRating);
  //     // return periodsRating[periodsRating.length -1];
  //     return (periodsRating[periodsRating.length -1], false);
  //     // return (false, false);
  //   // }

  //   // uint16 mid = begin + len / 2;
  //   // uint16 v = periodsRating[mid].period;
  //   // if (period < v)
  //   //   return findInternal(periodsRating, begin, mid, period, look);
  //   // else if (period > v)
  //   //   return findInternal(periodsRating, mid + 1, end, period, look);
  //   // else
  //   //   return periodsRating[mid];
  // }
}