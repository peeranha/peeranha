const { ethers, upgrades } = require("hardhat");

async function main() {
  const PeeranhaCommunityTokenFactory = await ethers.getContractFactory("PeeranhaCommunityTokenFactory");
  console.log("Deploying PeeranhaCommunityTokenFactory...");
  const peeranhaCommunityTokenFactory = await upgrades.deployProxy(PeeranhaCommunityTokenFactory, [], {timeout: 0});
  console.log("Peeranha Community Token Factory deployed to:", peeranhaCommunityTokenFactory.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });