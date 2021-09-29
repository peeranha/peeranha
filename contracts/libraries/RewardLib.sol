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
  uint256 constant START_PERIOD_TIME = 1632852461;  // September 28, 2021 8:20:23 PM GMT+03:00 DST
  uint256 constant coefficientToken = 10;


  /// @notice ///
  // function getReward(address user, uint16 period) internal {
    // Peeranha baseaddress = Peeranha(0x279787A2A5E83DD23f9E5D2cEf1F4846308Ffc1E);
    // int32 ratingToAward = baseaddress.getReward(user, period);

    // require(ratingToAward > 0, "No reward for you in this period");
    // require(RewardLib.getPeriod(CommonLib.getTimestamp()) > period, "This period isn't ended yet!");
  // }

  function getUserPeriod(UserLib.UsersRewardPerids storage usersRewardPerids, address user, uint16 period) internal view returns (UserLib.PeriodRating storage) {
    return usersRewardPerids.usersRewardPerids[user][period];
  }

  // function findInternal(UserLib.PeriodRating[] storage periodsRating, uint16 begin, uint16 end, uint16 period, bool look) internal returns (UserLib.PeriodRating storage, bool) {
  //   uint16 len = end - begin;
  //   // if (len == 0 || (len == 1 && periodsRating[begin].period != period)) {
  //     require(!look, "No reward for you in this period");
      
  //     UserLib.PeriodRating memory periodRating;
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

  function getCoefficientReward() internal view returns (uint256) {
    return coefficientToken;
  }


  function getPeriod(uint32 time) internal view returns (uint16) {
    return uint16((time - START_PERIOD_TIME) / PERIOD_LENGTH);
  }
}