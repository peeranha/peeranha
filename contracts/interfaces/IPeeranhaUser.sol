pragma solidity >=0.5.0;

interface IPeeranhaUser {
    function createUser(bytes32 ipfsHash) external;
    function createUserByDelegate(address userAddress, bytes32 ipfsHash) external;
    function updateUser(address userAddress, bytes32 ipfsHash) external;
    function followCommunity(address userAddress, uint32 communityId) external;
    function unfollowCommunity(address userAddress, uint32 communityId) external;
}