const { ethers, upgrades } = require("hardhat");

const { POLYGON_CHILD_MANAGER_ADDRESS } = require('../env.json');

async function main() {
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
      UserLib: userLib.address,
    }
  });
  
  console.log("Deploying PeeranhaUser...");
  const peeranhaUser = await upgrades.deployProxy(PeeranhaUser, [], {unsafeAllowLinkedLibraries: true, timeout: 0});
  console.log("Peeranha User deployed to:", peeranhaUser.address);

  const PeeranhaCommunity = await ethers.getContractFactory("PeeranhaCommunity");
  console.log("Deploying PeeranhaCommunity...");
  const peeranhaCommunity = await upgrades.deployProxy(PeeranhaCommunity, [peeranhaUser.address], {timeout: 0});
  console.log("Peeranha Community deployed to:", peeranhaCommunity.address);

  const PeeranhaContent = await ethers.getContractFactory("PeeranhaContent", {
    libraries: {
      PostLib: postLib.address
    }
  });

  console.log("Deploying PeeranhaContent...");
  const peeranhaContent = await upgrades.deployProxy(PeeranhaContent, [peeranhaCommunity.address, peeranhaUser.address], {unsafeAllowLinkedLibraries: true, timeout: 0});
  console.log("PeeranhaContent deployed to:", peeranhaContent.address);
  
  const PeeranhaNFT = await ethers.getContractFactory("PeeranhaNFT");
  console.log("Deploying PeeranhaNFT...");
  const peeranhaNFT = await upgrades.deployProxy(PeeranhaNFT, ["PEERNFT", "PEERNFT", peeranhaUser.address, POLYGON_CHILD_MANAGER_ADDRESS], {timeout: 0});
  console.log("Peeranha NFT deployed to:", peeranhaNFT.address);

  const PeeranhaToken = await ethers.getContractFactory("PeeranhaToken");
  console.log("Deploying PeeranhaToken...");
  const peeranhaToken = await upgrades.deployProxy(PeeranhaToken, ["PEER", "PEER", peeranhaUser.address, POLYGON_CHILD_MANAGER_ADDRESS], {timeout: 0});
  console.log("Peeranha token deployed to:", peeranhaToken.address);

  await peeranhaUser.setContractAddresses(peeranhaCommunity.address, peeranhaContent.address, peeranhaNFT.address, peeranhaToken.address);
  console.log("Set contract addresses to Peeranha User", peeranhaToken.address);

  console.log(`Contracts for post action`);
  console.log(`
    "USERLIB_ADDRESS": "${userLib.address}",
    "POSTLIB_ADDRESS": "${postLib.address}",
    "USER_ADDRESS": "${peeranhaUser.address}",
    "COMMUNITY_ADDRESS": "${peeranhaCommunity.address}",
    "CONTENT_ADDRESS": "${peeranhaContent.address}",
    "TOKEN_ADDRESS": "${peeranhaToken.address}",
    "NFT_ADDRESS": "${peeranhaNFT.address}",
  `);

  console.log(`Contracts for The Graph`);
  console.log(`
    "userAddress": "${peeranhaUser.address}",
    "communityAddress": "${peeranhaCommunity.address}",
    "contentAddress": "${peeranhaContent.address}",
    "tokenAddress": "${peeranhaToken.address}",
    "nftAddress": "${peeranhaNFT.address}",
  `);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });