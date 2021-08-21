const { ethers, upgrades } = require("hardhat");
const { IPFS_CDN_HOST, IPFS_PROTOCOL, PEERANHA_ADDRESS } = require('../env.json');
const bs58 = require('bs58');
const fetch = require("node-fetch");

async function getText(hash) {
  const response = await fetch(getFileUrl(hash)).then(x => x.text());
  return response;
}

function getFileUrl(hash) {
  return `${IPFS_PROTOCOL}://${IPFS_CDN_HOST}/${hash}`;
}

function getIpfsHashFromBytes32(bytes32Hex) {
  const hashHex = "1220" + bytes32Hex.slice(2)
  const hashBytes = Buffer.from(hashHex, 'hex');
  const hashStr = bs58.encode(hashBytes)
  return hashStr;
}

async function main() {
  const Peeranha = await ethers.getContractFactory("Peeranha");
  const peeranha = await Peeranha.attach(PEERANHA_ADDRESS);
  console.log("Query data")
  
  const userCount = await peeranha.getUsersCount();
  console.log("\nUsers count:");
  console.log(userCount);

  const user = await peeranha.getUserByIndex(1);
  // const user = await peeranha.getUserByAddress("0xA78Ad0bEd0A8A09De82e9B243Ed86D3dC5a9f46e");
  const userData = await getText(getIpfsHashFromBytes32(user.ipfsHash));
  console.log("\nUser data:")
  console.log(JSON.parse(userData));
  
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });