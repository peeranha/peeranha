const { ethers, upgrades } = require("hardhat");
const { USER_ADDRESS } = require('../env.json');
const { getChainName, verifyContract } = require('./common-action');

async function main() {
  console.log(`Peeranha user address: ${USER_ADDRESS}`)
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
  
  const userLibProxyAddress = await userLib.resolvedAddress;
  const userProxyAddress = `0x${peeranhaUser.deployTransaction.data.slice(98)}`;
  const chainId = JSON.stringify(PeeranhaUser.signer.provider._network.chainId);

  const chainName = await getChainName(chainId);
  console.log(`Verify User contract: ${userProxyAddress} Chain Id: ${chainId}, chain name: ${chainName}`);
  await verifyContract(userProxyAddress, chainName);

  console.log(`Verify UserLib contract: ${userLibProxyAddress} Chain Id: ${chainId}, chain name: ${chainName}`);
  await verifyContract(userLibProxyAddress, chainName);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });