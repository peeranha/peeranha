const { ethers, upgrades } = require("hardhat");
const { MINTABLE_ERC20_PREDICATE_PROXY, MINTABLE_ERC712_PREDICATE_PROXY } = require('../env.json');

async function main() {

  const PeeranhaEtherNFT = await ethers.getContractFactory("PeeranhaEtherNFT");
  console.log("Deploying PeeranhaEtherNFT...");
  const peeranhaEtherNFT = await upgrades.deployProxy(PeeranhaEtherNFT, ["PEERNFT", "PEERNFT", MINTABLE_ERC712_PREDICATE_PROXY], {timeout: 0});
  console.log("Peeranha NFT mainnet deployed to:", peeranhaEtherNFT.address);

  const PeeranhaEtherToken = await ethers.getContractFactory("PeeranhaEtherToken");
  console.log("Deploying PeeranhaEtherToken mainnet...");
  const peeranhaEtherToken = await upgrades.deployProxy(PeeranhaEtherToken, ["PEER", "PEER", MINTABLE_ERC20_PREDICATE_PROXY], {timeout: 0});
  console.log("Peeranha token mainnet deployed to:", peeranhaEtherToken.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });