//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/utils/math/SafeCastUpgradeable.sol";

/// @title CommonLib
/// @notice
/// @dev
library CommonLib {
  uint16 constant QUICK_REPLY_TIME_SECONDS = 900; // 6
  address public constant BOT_ADDRESS = 0x0000000000000000000000000000000000000001;

  enum MessengerType {
      Unknown,
      Telegram,
      Discord,
      Slack
  }

  struct IpfsHash {
      bytes32 hash;
      bytes32 hash2; // Not currently used and added for the future compatibility
  }

  /// @notice get timestamp in uint32 format
  function getTimestamp() internal view returns (uint32) {
    return SafeCastUpgradeable.toUint32(block.timestamp);
  }

  function toInt32(int value) internal pure returns (int32) {
    return SafeCastUpgradeable.toInt32(value);
  }

  function toInt32FromUint256(uint256 value) internal pure returns (int32) {
    int256 buffValue = SafeCastUpgradeable.toInt256(value);
    return SafeCastUpgradeable.toInt32(buffValue);
  }

  function toUInt32FromInt32(int256 value) internal pure returns (uint32) {
    uint256 buffValue = SafeCastUpgradeable.toUint256(value);
    return SafeCastUpgradeable.toUint32(buffValue);
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

  function stringToBytes32(string memory source) internal pure returns (bytes32 result) {
    bytes memory tempEmptyStringTest = bytes(source);
    if (tempEmptyStringTest.length == 0) {
        return 0x0;
    }

    assembly {
        result := mload(add(source, 32))
    }
  }
}