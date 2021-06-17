pragma solidity >=0.5.0;
import "hardhat/console.sol";

library IpfsLib  {
    struct IpfsHash {
        bytes32 ipfsHash;
        bytes32 ipfsHash2; // Not currently used and added for the future compatibility
    }
}