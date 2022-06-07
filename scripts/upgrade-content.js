const { ethers, upgrades } = require("hardhat");
const { CONTENT_ADDRESS } = require('../env.json');

async function main() {
  const PostLib = await ethers.getContractFactory("PostLib");
  console.log("Deploying PostLib...");
  const postLib = await PostLib.deploy();
  console.log("PostLib deployed to:", postLib.address);

  const PeeranhaContent = await ethers.getContractFactory("PeeranhaContent", {
    libraries: {
      PostLib: postLib.address
    }
  });

  console.log("Upgrading PeeranhaContent...");
  const peeranhaContent = await upgrades.upgradeProxy(CONTENT_ADDRESS, PeeranhaContent, {unsafeAllowLinkedLibraries: true, timeout: 0});
  console.log("PeeranhaContent upgraded at:", peeranhaContent.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });