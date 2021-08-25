const { ethers, upgrades } = require("hardhat");
const { PEERANHA_ADDRESS } = require('../env.json');

async function main() {
  const Peeranha = await ethers.getContractFactory("Peeranha");
  console.log("Upgrading Peeranha...");
  const peeranha = await upgrades.upgradeProxy(PEERANHA_ADDRESS, Peeranha);
  console.log("Peeranha upgraded at address:", peeranha.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });