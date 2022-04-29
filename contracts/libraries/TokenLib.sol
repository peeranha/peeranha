pragma solidity >=0.5.0;
pragma abicoder v2;


/// @title RewardLib
/// @notice
/// @dev
library TokenLib {
  uint256 constant COEFFICIENT_TOKEN = 10;

  struct StatusRewardContainer {
    mapping(address => mapping(uint16 => StatusReward)) statusReward;
  }

  struct StatusReward {
    bool isPaid;
  }

  struct BoostContainer {
    mapping(uint16 => CountBoost) userBoostCount;               // period
    uint16[] updateBoostInPeriod;
  }

  struct CountBoost {
    uint256 allStake;
    uint64 countStaking;    //name?
  }

  struct WeekUserBoost {
    mapping(address => UserBoost) weekUserBoost;
  }

  struct UserBoost {
    mapping(uint16 => uint256) stakedTokens;                    // period
    uint16[] updateUserBoostInPeriod;
  }
}