pragma solidity >=0.5.0;
import "hardhat/console.sol";

library IpfsLib  {
    struct IpfsHash {
        bytes32 hash;
        bytes32 hash2; // Not currently used and added for the future compatibility
    }

    function checkIpfs (
        bytes32 hash,
        string memory text
    ) internal {
        require(hash != bytes32(0x0), text);
    }
}