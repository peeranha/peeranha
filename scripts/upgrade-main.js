const { ethers, upgrades } = require("hardhat");
const { PEERANHA_ADDRESS, POSTLIB_ADDRESS, COMMUNITYLIB_ADDRESS } = require('../env.json');

async function main() {
  const Peeranha = await ethers.getContractFactory("Peeranha", {
    libraries: {
      PostLib: POSTLIB_ADDRESS,
      CommunityLib: COMMUNITYLIB_ADDRESS,
    }
  });
  console.log("Deploying Peeranha...");
  const peeranha = await upgrades.upgradeProxy(PEERANHA_ADDRESS, Peeranha, {unsafeAllowLinkedLibraries: true});
  console.log("Peeranha deployed to:", peeranha.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });