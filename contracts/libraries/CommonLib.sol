pragma solidity >=0.5.0;
pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/utils/SafeCastUpgradeable.sol";

import "./IpfsLib.sol";
import "./CommunityLib.sol";
import "hardhat/console.sol";

/// @title CommonLib
/// @notice
/// @dev
library CommonLib {
    /// @notice Convert uint256 to uint32
    /// @param value uint256
    function convertUint256toUint32(
        uint256 value
    ) internal view returns (uint32) {
        return SafeCastUpgradeable.toUint32(value);
    }
}