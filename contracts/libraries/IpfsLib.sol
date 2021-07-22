pragma solidity >=0.5.0;

library IpfsLib  {
    struct IpfsHash {
        bytes32 hash;
        bytes32 hash2; // Not currently used and added for the future compatibility
    }

    function isEmptyIpfs (
        bytes32 hash
    ) internal view returns(bool) {
        if (hash == bytes32(0x0)) {
            return true;
        }

        return false;
    }
}