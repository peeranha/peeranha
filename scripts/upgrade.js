const { ethers, upgrades } = require("hardhat");
const { POSTLIB_ADDRESS, COMMUNITY_ADDRESS, CONTENT_ADDRESS, NFT_ADDRESS, TOKEN_ADDRESS, USER_ADDRESS } = require('../env.json');

async function main() {
  /*const PeeranhaUserExisting = await ethers.getContractFactory("PeeranhaUser");
  console.log("Pulling proxy info for PeeranhaUser...");
  await upgrades.forceImport(USER_ADDRESS, PeeranhaUserExisting, {timeout: 0});

  const PeeranhaCommunityExisting = await ethers.getContractFactory("PeeranhaCommunity");
  console.log("Pulling proxy info for PeeranhaCommunity...");
  await upgrades.forceImport(COMMUNITY_ADDRESS, PeeranhaCommunityExisting, {timeout: 0});

  const PeeranhaContentExisting = await ethers.getContractFactory("PeeranhaContent", {
    libraries: {
      PostLib: POSTLIB_ADDRESS
    }
  });
  console.log("Pulling proxy info for PeeranhaContent...");
  await upgrades.forceImport(CONTENT_ADDRESS, PeeranhaContentExisting, {unsafeAllowLinkedLibraries: true, timeout: 0});

  const PeeranhaNFTExisting = await ethers.getContractFactory("PeeranhaNFT");
  console.log("Pulling proxy info for PeeranhaNFT...");
  await upgrades.forceImport(NFT_ADDRESS, PeeranhaNFTExisting, {timeout: 0});

  const PeeranhaTokenExisting = await ethers.getContractFactory("PeeranhaToken");
  console.log("Pulling proxy info for PeeranhaToken...");
  await upgrades.forceImport(TOKEN_ADDRESS, PeeranhaTokenExisting, {timeout: 0});*/

  const PostLib = await ethers.getContractFactory("PostLib");
  console.log("Deploying PostLib...");
  const postLib = await PostLib.deploy();
  console.log("PostLib deployed to:", postLib.address);

  const UserLib = await ethers.getContractFactory("UserLib");
  console.log("Deploying UserLib...");
  const userLib = await UserLib.deploy();
  console.log("UserLib deployed to:", userLib.address);

  const PeeranhaUser = await ethers.getContractFactory("PeeranhaUser", {
    libraries: {
      UserLib: userLib.address
    }
  });
  
  console.log("Upgrading PeeranhaUser...");
  const peeranhaUser = await upgrades.upgradeProxy(USER_ADDRESS, PeeranhaUser, {unsafeAllowLinkedLibraries: true, timeout: 0});
  console.log("Peeranha User upgraded at:", peeranhaUser.address);

  const PeeranhaCommunity = await ethers.getContractFactory("PeeranhaCommunity");
  console.log("Upgrading PeeranhaCommunity...");
  const peeranhaCommunity = await upgrades.upgradeProxy(COMMUNITY_ADDRESS, PeeranhaCommunity, {timeout: 0});
  console.log("Peeranha Community upgraded at:", peeranhaCommunity.address);

  const PeeranhaContent = await ethers.getContractFactory("PeeranhaContent", {
    libraries: {
      PostLib: postLib.address
    }
  });

  console.log("Upgrading PeeranhaContent...");
  const peeranhaContent = await upgrades.upgradeProxy(CONTENT_ADDRESS, PeeranhaContent, {unsafeAllowLinkedLibraries: true, timeout: 0});
  console.log("PeeranhaContent upgraded at:", peeranhaContent.address);
  
  const PeeranhaNFT = await ethers.getContractFactory("PeeranhaNFT");
  console.log("Upgrading PeeranhaNFT...");
  const peeranhaNFT = await upgrades.upgradeProxy(NFT_ADDRESS, PeeranhaNFT, {timeout: 0});
  console.log("Peeranha NFT upgraded at:", peeranhaNFT.address);

  const PeeranhaToken = await ethers.getContractFactory("PeeranhaToken");
  console.log("Upgrading PeeranhaToken...");
  const peeranhaToken = await upgrades.upgradeProxy(TOKEN_ADDRESS, PeeranhaToken, {timeout: 0});
  console.log("Peeranha token upgraded at:", peeranhaToken.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });