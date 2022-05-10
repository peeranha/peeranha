const { ethers, upgrades } = require("hardhat");

const { POLYGON_CHILD_MANAGER_ADDRESS } = require('../env.json');

async function main() {
  const PostLib = await ethers.getContractFactory("PostLib");
  console.log("Deploying PostLib...");
  const postLib = await PostLib.deploy();
  console.log("PostLib deployed to:", postLib.address);

  const CommunityLib = await ethers.getContractFactory("CommunityLib");
  console.log("Deploying CommunityLib...");
  const communityLib = await CommunityLib.deploy();
  console.log("CommunityLib deployed to:", communityLib.address);

  const PeeranhaNFT = await ethers.getContractFactory("PeeranhaNFT");
  const peeranhaNFT = await upgrades.deployProxy(PeeranhaNFT, ["PEERNFT", "PEERNFT", POLYGON_CHILD_MANAGER_ADDRESS]);
  console.log("Peeranha NFT deployed to:", peeranhaNFT.address);

  const Peeranha = await ethers.getContractFactory("Peeranha", {
    libraries: {
      PostLib: postLib.address,
      CommunityLib: communityLib.address,
    }
  });
  console.log("Deploying Peeranha...");
  const peeranha = await upgrades.deployProxy(Peeranha, [peeranhaNFT.address], {unsafeAllowLinkedLibraries: true});
  console.log("Peeranha deployed to:", peeranha.address);
  
  const PeeranhaToken = await ethers.getContractFactory("PeeranhaToken");
  const peeranhaToken = await upgrades.deployProxy(PeeranhaToken, ["PEER", "PEER", peeranha.address, POLYGON_CHILD_MANAGER_ADDRESS]);
  console.log("Peeranha token deployed to:", peeranhaToken.address);

  await peeranha.setTokenContract(peeranhaToken.address);
  console.log("Set peeranhaToken address to peeranha", peeranhaToken.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });