pragma solidity >=0.5.0;
pragma abicoder v2;

interface IPeeranhaNFT {
  function mintNFT(address recipient, uint64 tokenId, uint64 achievementId) external;
}