pragma solidity >=0.5.0;
pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/utils/math/SafeCastUpgradeable.sol";

/// @title CommonLib
/// @notice
/// @dev
library CommonLib {
  uint16 constant QUICK_REPLY_TIME_SECONDS = 900; // 6

  struct IpfsHash {
      bytes32 hash;
      bytes32 hash2; // Not currently used and added for the future compatibility
  }

  /// @notice get timestamp in uint32 format
  function getTimestamp() internal view returns (uint32) {
    return SafeCastUpgradeable.toUint32(block.timestamp);
  }

  function toInt32(int value) internal view returns (int32) {
    return SafeCastUpgradeable.toInt32(value);
  }

  /**
  * @dev Returns the largest of two numbers.
  */
  function maxInt32(int32 a, int32 b) internal pure returns (int32) {
    return a >= b ? a : b;
  }

  /**
  * @dev Returns the smallest of two numbers.
  */
  function minInt32(int32 a, int32 b) internal pure returns (int32) {
    return a < b ? a : b;
  }

  function minUint256(uint256 a, uint256 b) internal pure returns (uint256) {
    return a < b ? a : b;
  }

  function isEmptyIpfs (
      bytes32 hash
  ) internal pure returns(bool) {
      return hash == bytes32(0x0);
  }
}