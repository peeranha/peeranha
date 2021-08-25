const { ethers, upgrades } = require("hardhat");
const { IPFS_API_URL, PEERANHA_ADDRESS } = require('../env.json');
const { create } = require('ipfs-http-client');
const bs58 = require('bs58');

function getIpfsApi() {
  return create(IPFS_API_URL);
}

async function getText(hash) {
  console.log("Loading IPFS document by hash - " + hash)
  const bytesIterator = await getIpfsApi().cat(hash);
  
  let resultStr = ""
  let result;
  {
    result = await bytesIterator.next();
    resultStr += result.value.toString();
  } 
  while(!result.done)
  
  return resultStr;
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

  console.log("\nUser data from blockchain:")
  const user = await peeranha.getUserByIndex(0);
  console.log(JSON.stringify(user));

  console.log("\nUser data from ipfs:")
  // const user = await peeranha.getUserByAddress("0xA78Ad0bEd0A8A09De82e9B243Ed86D3dC5a9f46e");
  const userData = await getText(getIpfsHashFromBytes32(user.ipfsDoc.hash));
  console.log(userData);
  
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });