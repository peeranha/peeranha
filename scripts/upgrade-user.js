const { ethers, upgrades } = require("hardhat");
const { USER_ADDRESS } = require('../env.json');

async function main() {
  const UserLib = await ethers.getContractFactory("UserLib");
  console.log("Deploying UserLib...");
  const userLib = await UserLib.deploy();
  console.log("UserLib deployed to:", userLib.address);
  
  console.log("Start upgrading Peeranha User contract");
  const PeeranhaUser = await ethers.getContractFactory("PeeranhaUser", {
    libraries: {
      UserLib: userLib.address
    }
  });
  
  const peeranhaUser = await upgrades.upgradeProxy(USER_ADDRESS, PeeranhaUser, {unsafeAllowLinkedLibraries: true, timeout: 0});
  console.log("Peeranha User upgraded at address:", peeranhaUser.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });