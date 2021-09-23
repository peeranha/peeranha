pragma solidity >=0.5.0;
pragma abicoder v2;
import "../Peeranha.sol";
import "./CommonLib.sol";
import "./UserLib.sol";



/// @title RewardLib
/// @notice
/// @dev
library RewardLib {
  uint32 constant PERIOD_LENGTH = 604800;             // 7 day = 1 week
  uint256 constant START_PERIOD_TIME = 1576454400;  // December 16th, 2019 00:00:00


  /// @notice ///
  function getReward(address user, uint16 period) internal {

    // Peeranha baseaddress = Peeranha(0x279787A2A5E83DD23f9E5D2cEf1F4846308Ffc1E);
    // int32 ratingToAward = baseaddress.getReward(user, period);

    /* pay */

  }

  function getUserPeriod(UserLib.PeriodRating[] storage periodRating, uint16 period) internal returns (UserLib.PeriodRating storage) {
    return findInternal(periodRating, 0, uint16(periodRating.length), period);

  }

  function findInternal(UserLib.PeriodRating[] storage data, uint16 begin, uint16 end, uint16 period) internal returns (UserLib.PeriodRating storage) {
    uint16 len = end - begin;
    // require(!(len == 0 || (len == 1 && data[begin].period != period)), "No reward for you in this period");    // доделать

    uint16 mid = begin + len / 2;
    uint16 v = data[mid].period;
    if (period < v)
      return findInternal(data, begin, mid, period);
    else if (period > v)
      return findInternal(data, mid + 1, end, period);
    else
      return data[mid];
  }

  // function getRewardByAddress(Rewards storage self, address addr) internal view returns (UserLib.PeriodRating[] storage) {
  //   UserLib.PeriodRating[] storage reward = self.reward[addr];
  //   return reward;
  // }

//   asset token::get_user_reward(asset total_reward, int rating_to_reward,
//                              int total_rating) {
//   return total_reward * rating_to_reward / total_rating;
// }

  // function get_award(uint64_t rating_to_award, uint32_t total_rating_to_reward, uint64_t period) {
  
  //   return quantity;
  // }

  function pickupReward(address user, uint16 period) internal {
    require(getPeriod(CommonLib.getTimestamp()) > period, "This period isn't ended yet!");

    Peeranha baseaddress = Peeranha(0x279787A2A5E83DD23f9E5D2cEf1F4846308Ffc1E);
    int32 ratingToAward = baseaddress.getReward(user, period);
    
    // asset user_reward =
    //   get_user_reward(iter_total_reward->total_reward,
    //                   period_rating->rating_to_award * boost, total_rating_to_reward);
    // auto prom_quantity = get_award(period_rating->rating_to_award * boost, total_rating_to_reward, period);
    // if (prom_quantity.amount) {
    //   sub_balance(user_prom_leave, prom_quantity);
    //   user_reward += prom_quantity;
    // }
    // period_reward_table.emplace(user, [user_reward, period](auto &reward) {
    //   reward.period = period;
    //   reward.reward = user_reward;
    // });
    // add_balance(user, user_reward, _self);
  }

  function getPeriod(uint32 time) internal view returns (uint16) {
    return uint16((time - START_PERIOD_TIME) / PERIOD_LENGTH);
  }
}