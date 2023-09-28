const { ethers, upgrades } = require("hardhat");
const { USER_ADDRESS } = require('../env.json');
const { getChainName, verifyContract } = require('./common-action');

async function main() {
  const UserLib = await ethers.getContractFactory("UserLib");
  console.log("Deploying UserLib...");
  const userLib = await UserLib.deploy();
  console.log('\x1b[42m', `New userLib deployed to: ${userLib.address}`, '\x1b[0m \n');
  
  console.log("Start upgrading Peeranha User contract");
  const PeeranhaUser = await ethers.getContractFactory("PeeranhaUser", {
    libraries: {
      UserLib: userLib.address
    }
  });
  
  const peeranhaUser = await upgrades.upgradeProxy(USER_ADDRESS, PeeranhaUser, {unsafeAllowLinkedLibraries: true, timeout: 0});
  console.log('\x1b[42m', `Peeranha User upgraded: ${peeranhaUser.address}`, '\x1b[0m \n');
  
  const userLibProxyAddress = await userLib.resolvedAddress;
  const userProxyAddress = `0x${peeranhaUser.deployTransaction.data.slice(98)}`;
  const chainId = JSON.stringify(PeeranhaUser.signer.provider._network.chainId);

  const chainName = await getChainName(chainId);

  console.log(`Verify UserLib contract: ${userLibProxyAddress}. Chain Id: ${chainId}, chain name: ${chainName}`);
  await verifyContract(userLibProxyAddress, chainName);

  console.log(`Verify User contract: ${userProxyAddress}. Chain Id: ${chainId}, chain name: ${chainName}`);
  await verifyContract(userProxyAddress, chainName);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });