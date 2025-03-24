
const { ethers, upgrades } = require("hardhat");
const { USER_ADDRESS, COMMUNITY_ADDRESS, CONTENT_ADDRESS, NFT_ADDRESS, TOKEN_ADDRESS, USERLIB_ADDRESS, POSTLIB_ADDRESS } = require('../env.json');

async function main() {
  const PeeranhaUser = await ethers.getContractFactory("PeeranhaUser", {
    libraries: {
      UserLib: USERLIB_ADDRESS
    }
  });
  const PeeranhaCommunity = await ethers.getContractFactory("PeeranhaCommunity");
  const PeeranhaContent = await ethers.getContractFactory("PeeranhaContent", {
    libraries: {
      PostLib: POSTLIB_ADDRESS
    }
  });
  const PeeranhaNFT = await ethers.getContractFactory("PeeranhaNFT");
  const PeeranhaToken = await ethers.getContractFactory("PeeranhaToken");

  console.log(`USER_ADDRESS: ${USER_ADDRESS}`);
  console.log('Starting force import for Peeranah User...')
  const peeranhaUser = await upgrades.forceImport(USER_ADDRESS, PeeranhaUser, {unsafeAllowLinkedLibraries: true, timeout: 0});
  console.log('Force import ended.')
  console.log('Starting force import for Peeranah Community...')
  const peeranhaCommunity = await upgrades.forceImport(COMMUNITY_ADDRESS, PeeranhaCommunity, {timeout: 0});
  console.log('Force import ended.')
  console.log('Starting force import for Peeranah Content...')
  const peeranhaContent = await upgrades.forceImport(CONTENT_ADDRESS, PeeranhaContent, {unsafeAllowLinkedLibraries: true, timeout: 0});
  console.log('Force import ended.')
  console.log('Starting force import for Peeranah NFT...')
  const peeranhaNFT = await upgrades.forceImport(NFT_ADDRESS, PeeranhaNFT, {timeout: 0});
  console.log('Force import ended.')
  console.log('Starting force import for Peeranah Token...')
  const peeranhaToken = await upgrades.forceImport(TOKEN_ADDRESS, PeeranhaToken, {timeout: 0});
  console.log('Force import ended.')
}



main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });