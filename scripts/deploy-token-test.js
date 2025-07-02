const { ethers, upgrades } = require("hardhat");
const { USER_ADDRESS, COMMUNITY_ADDRESS } = require('../env.json');

async function main() {
  const PeeranhaToken = await ethers.getContractFactory("PeeranhaTokenTestFac");
  console.log("Deploying PeeranhaToken TESt...");
  const peeranhaToken = await upgrades.deployProxy(PeeranhaToken, ["PETE", "PETE", "0x0000000000000000000000000000000000000000"], {timeout: 0});
  console.log("Peeranha token deployed to:", peeranhaToken.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });