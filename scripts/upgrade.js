const { ethers, upgrades } = require("hardhat");
const { PEERANHA_ADDRESS } = require('../env.json');

async function main() {
  const PostLib = await ethers.getContractFactory("PostLib");
  console.log("Deploying PostLib...");
  const postLib = await PostLib.deploy();
  console.log("PostLib deployed to:", postLib.address);

  const Peeranha = await ethers.getContractFactory("Peeranha", {
    libraries: {
      PostLib: postLib.address,
    }
  });
  console.log("Upgrading Peeranha...");
  const peeranha = await upgrades.upgradeProxy(PEERANHA_ADDRESS, Peeranha, {unsafeAllowLinkedLibraries: true});
  console.log("Peeranha upgraded at address:", peeranha.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });