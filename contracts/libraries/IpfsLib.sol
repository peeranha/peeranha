pragma solidity >=0.5.0;

library IpfsLib  {
    struct IpfsHash {
        bytes32 hash;
        bytes32 hash2; // Not currently used and added for the future compatibility
    }

    function assertIsNotEmptyIpfs (
        bytes32 hash,
        string memory errorMessage
    ) internal view {
        require(hash != bytes32(0x0), errorMessage);
    }
}