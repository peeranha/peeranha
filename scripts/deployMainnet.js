const { ethers, upgrades } = require("hardhat");
const { MINTABLE_ERC20_PREDICATE_PROXY, MINTABLE_ERC712_PREDICATE_PROXY } = require('../env.json');

async function main() {

  const PeeranhaMainnetNFT = await ethers.getContractFactory("PeeranhaMainnetNFT");
  console.log("Deploying PeeranhaMainnetNFT...");
  const peeranhaMainnetNFT = await upgrades.deployProxy(PeeranhaMainnetNFT, ["PEERNFT", "PEERNFT", MINTABLE_ERC712_PREDICATE_PROXY], {timeout: 0});
  console.log("Peeranha NFT mainnet deployed to:", peeranhaMainnetNFT.address);

  const PeeranhaMainnetToken = await ethers.getContractFactory("PeeranhaMainnetToken");
  console.log("Deploying PeeranhaMainnetToken mainnet...");
  const peeranhaMainnetToken = await upgrades.deployProxy(PeeranhaMainnetToken, ["PEER", "PEER", MINTABLE_ERC20_PREDICATE_PROXY], {timeout: 0});
  console.log("Peeranha token mainnet deployed to:", peeranhaMainnetToken.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });