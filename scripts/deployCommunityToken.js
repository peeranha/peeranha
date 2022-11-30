const { ethers, upgrades } = require("hardhat");

const {
  IPFS_API_URL,

  FACTORY_ADDRESS,
  IPFS_API_URL_THE_GRAPH,
  INFURA_API_KEY
} = require("../env.json");


async function main() {
  const PeeranhaCommunityTokenFactory = await ethers.getContractFactory("PeeranhaCommunityTokenFactory");
  const peeranhaCommunityTokenFactory = await PeeranhaCommunityTokenFactory.attach(FACTORY_ADDRESS);

  const txObj = await peeranhaCommunityTokenFactory.createNewCommunityToken("name", "symbol", 0x0000000000000000000000000000000000000000, 1000, 10, 1655251200);
  console.log(`Submitted transaction - ${JSON.stringify(txObj)}`);
  console.log(`Waiting for transaction confirmation`);
  await txObj.wait();
  console.log('Transaction confirmed');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });