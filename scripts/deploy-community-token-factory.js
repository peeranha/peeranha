const { ethers, upgrades } = require("hardhat");
const { USER_ADDRESS, COMMUNITY_ADDRESS } = require('../env.json');

async function main() {
  const CommunityTokenRewardFactory = await ethers.getContractFactory("CommunityTokenRewardFactory");
  console.log("Deploying CommunityTokenRewardFactory...");
  const communityTokenRewardFactory = await upgrades.deployProxy(CommunityTokenRewardFactory, [USER_ADDRESS, COMMUNITY_ADDRESS], {timeout: 0});
  console.log("communityTokenRewardFactory deployed to:", communityTokenRewardFactory.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });