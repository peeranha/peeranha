const { ethers, upgrades } = require("hardhat");

async function main() {
  const Peeranha = await ethers.getContractFactory("Peeranha");
  console.log("Deploying Peeranha...");
  const peeranha = await upgrades.deployProxy(Peeranha, ["Peeranha", "PEER"]);
  console.log("Peeranha deployed to:", peeranha.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });