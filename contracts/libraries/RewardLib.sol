pragma solidity >=0.5.0;
pragma abicoder v2;
import "../Peeranha.sol";
import "./CommonLib.sol";
import "./UserLib.sol";



/// @title RewardLib
/// @notice
/// @dev
library RewardLib {
  uint32 constant PERIOD_LENGTH = 3;             // 7 day = 1 week //
  uint256 constant START_PERIOD_TIME = 1632967903;  // September 28, 2021 8:20:23 PM GMT+03:00 DST
  uint256 constant coefficientToken = 10;

  struct PeriodRating {
    int32 rating;
    int32 ratingToReward;
  }

  struct StatusRewardContainer {
    mapping(address => mapping(uint16 => StatusReward)) statusReward;
  }

  struct StatusReward {
    bool isPaid;
  }

  struct UserRewards {
    mapping(address => mapping(uint16 => PeriodRating)) userRewards;
  }

  /// @notice Get information about the user's reward
  /// @param userRewards The mapping containing all user's rewards
  /// @param user The use who has rewards
  /// @param period The period which we get reward
  function getUserPeriodRating(RewardLib.UserRewards storage userRewards, address user, uint16 period) internal view returns (RewardLib.PeriodRating storage) {
    return userRewards.userRewards[user][period];
  }

  function getRewardStatus(StatusRewardContainer storage statusReward, address user, uint16 period) internal view returns (StatusReward storage) {
    return statusReward.statusReward[user][period];
  }

  /// @notice Get tokens' coefficient to 1 rating
  function getRewardCoefficient() internal view returns (uint256) {
    return coefficientToken;
  }


  /// @notice Get perion
  /// @param time Unix time. Usual now()
  function getPeriod(uint32 time) internal view returns (uint16) {
    return uint16((time - START_PERIOD_TIME) / PERIOD_LENGTH);
  }

  // function findInternal(RewardLib.PeriodRating[] storage periodsRating, uint16 begin, uint16 end, uint16 period, bool look) internal returns (RewardLib.PeriodRating storage, bool) {
  //   uint16 len = end - begin;
  //   // if (len == 0 || (len == 1 && periodsRating[begin].period != period)) {
  //     require(!look, "No reward for you in this period");
      
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