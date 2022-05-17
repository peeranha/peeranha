const { ethers, upgrades } = require("hardhat");
const { USER_ADDRESS } = require('../env.json');

async function main() {
  console.log("Start upgrading Peeranha User contract");
  const PeeranhaUser = await ethers.getContractFactory("PeeranhaUser");
  const peeranhaUser = await upgrades.upgradeProxy(USER_ADDRESS, PeeranhaUser);
  console.log("Peeranha User upgraded at address:", peeranhaUser.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });