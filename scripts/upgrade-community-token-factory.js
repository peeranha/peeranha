const { ethers, upgrades } = require("hardhat");
const { COMMUNITY_TOKEN_FACTORY_ADDRESS } = require('../env.json');
const { getChainName, verifyContract } = require('./common-action');

async function main() {
  // console.log(`Peeranha community token factory. address: ${""}`)
  
  const CommunityTokenRewardFactory = await ethers.getContractFactory("CommunityTokenRewardFactory");
  console.log("Upgrading CommunityTokenRewardFactory...");
  const communityTokenRewardFactory = await upgrades.upgradeProxy(COMMUNITY_TOKEN_FACTORY_ADDRESS, CommunityTokenRewardFactory, {timeout: 0});
  console.log("CommunityTokenRewardFactory upgraded at:", communityTokenRewardFactory.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });