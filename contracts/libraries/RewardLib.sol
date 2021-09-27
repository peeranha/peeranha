pragma solidity >=0.5.0;
pragma abicoder v2;
import "../Peeranha.sol";
import "./CommonLib.sol";
import "./UserLib.sol";



/// @title RewardLib
/// @notice
/// @dev
library RewardLib {
  uint32 constant PERIOD_LENGTH = 604800;             // 7 day = 1 week //
  uint256 constant START_PERIOD_TIME = 1576454400;  // December 16th, 2019 00:00:00
  int32 constant coefficientToken = 10;


  /// @notice ///
  // function getReward(address user, uint16 period) internal {
    // Peeranha baseaddress = Peeranha(0x279787A2A5E83DD23f9E5D2cEf1F4846308Ffc1E);
    // int32 ratingToAward = baseaddress.getReward(user, period);

    // require(ratingToAward > 0, "No reward for you in this period");
    // require(RewardLib.getPeriod(CommonLib.getTimestamp()) > period, "This period isn't ended yet!");
  // }

  function getUserPeriod(UserLib.PeriodRating[] storage periodsRating, uint16 period, bool look) internal returns (UserLib.PeriodRating storage) {
    return findInternal(periodsRating, 0, uint16(periodsRating.length), period, look); // look??
  }

  function findInternal(UserLib.PeriodRating[] storage periodsRating, uint16 begin, uint16 end, uint16 period, bool look) internal returns (UserLib.PeriodRating storage) {
    uint16 len = end - begin;
    if (len == 0 || (len == 1 && periodsRating[begin].period != period)) {
      require(!look, "No reward for you in this period");
      
      UserLib.PeriodRating memory periodRating;
      periodsRating.push(periodRating);
      return periodsRating[periodsRating.length -1];
    }

    uint16 mid = begin + len / 2;
    uint16 v = periodsRating[mid].period;
    if (period < v)
      return findInternal(periodsRating, begin, mid, period, look);
    else if (period > v)
      return findInternal(periodsRating, mid + 1, end, period, look);
    else
      return periodsRating[mid];
  }

  function getCoefficientReward() internal view returns (int32) {
    return coefficientToken;
  }


  function getPeriod(uint32 time) internal view returns (uint16) {
    return uint16((time - START_PERIOD_TIME) / PERIOD_LENGTH);
  }
}