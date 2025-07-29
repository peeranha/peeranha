const { ethers, upgrades } = require("hardhat");
const { USER_ADDRESS, COMMUNITY_ADDRESS } = require('../env.json');

async function main() {
  const PeeranhaToken = await ethers.getContractFactory("TestDeploy");
  console.log("Deploying TestDeploy...");
  const peeranhaToken = await upgrades.deployProxy(PeeranhaToken, [], {timeout: 0});
  console.log("Peeranha TestDeploy to:", peeranhaToken.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });