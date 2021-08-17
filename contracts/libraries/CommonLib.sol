pragma solidity >=0.5.0;
pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/utils/SafeCastUpgradeable.sol";

/// @title CommonLib
/// @notice
/// @dev
library CommonLib {
    uint16 constant quickReplyTimeSeconds = 900;

    /// @notice get timestamp in uint32 format
    function getTimestamp() internal view returns (uint32) {
        return SafeCastUpgradeable.toUint32(block.timestamp);
    }

    function toInt32(int value) internal view returns (int32) {
        return SafeCastUpgradeable.toInt32(value);
    }
}