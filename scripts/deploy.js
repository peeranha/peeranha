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

  const PeeranhaCommunityTokenFactory = await ethers.getContractFactory("PeeranhaCommunityTokenFactory");
  console.log("Deploying PeeranhaCommunityTokenFactory...");
  const peeranhaCommunityTokenFactory = await upgrades.deployProxy(PeeranhaCommunityTokenFactory, [peeranhaUser.address, peeranhaCommunity.address], {timeout: 0});
  console.log("Peeranha community token factory deployed to:", peeranhaCommunityTokenFactory.address);

  console.log(` 
            Deployed to:
  Peeranha User: ${peeranhaUser.address}
  UserLib: ${userLib.address}
  PostLib: ${postLib.address}
  Peeranha Community: ${peeranhaCommunity.address}
  PeeranhaContent: ${peeranhaContent.address}
  Peeranha token: ${peeranhaToken.address}
  Peeranha NFT: ${peeranhaNFT.address}
  Peeranha community token factory: ${peeranhaCommunityTokenFactory.address}
  `)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });