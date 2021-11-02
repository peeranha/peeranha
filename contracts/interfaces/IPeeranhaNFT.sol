pragma solidity >=0.5.0;
pragma abicoder v2;

import "../libraries/NFTLib.sol";


interface IPeeranhaNFT {
  function mintNFT(address recipient, uint64 tokenId, uint64 achievementId) external;
  function setTokenURI(uint64 achievementId, uint64 maxCount, string memory achievementURI, NFTLib.AchievementType achievementType) external;
}