pragma solidity >=0.5.0;

interface IPeeranhaUser {
    function createUser(bytes32 ipfsHash) external;
    function updateUser(bytes32 ipfsHash) external;
    function followCommunity(uint32 communityId) external;
    function unfollowCommunity(uint32 communityId) external;
}