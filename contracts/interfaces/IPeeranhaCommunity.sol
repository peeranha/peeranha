pragma solidity >=0.5.0;
pragma abicoder v2;


interface IPeeranhaCommunity {
    function onlyExistingAndNotFrozenCommunity(uint32 communityId) external;
    function checkTags(uint32 communityId, uint8[] memory tags) external;
}