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

  /// @notice Get tokens' coefficient to 1 rating
  function getRewardCoefficient() internal view returns (uint256) {
    return COEFFICIENT_TOKEN;
  }
}