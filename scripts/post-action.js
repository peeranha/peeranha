const { ethers } = require("hardhat");
const IpfsAPI = require('ipfs-api');
const bs58 = require('bs58');
const { IPFS_API_HOST, IPFS_API_PORT, IPFS_PROTOCOL, PEERANHA_ADDRESS } = require('../env.json');


function getIpfsApi() {
  return IpfsAPI({
    host: IPFS_API_HOST,
    port: IPFS_API_PORT,
    protocol: IPFS_PROTOCOL,
  });
}

async function saveText(text) {
  const buf = Buffer.from(text, 'utf8');
  const saveResult = await getIpfsApi().add(buf);
  return saveResult[0].hash;
}

function getBytes32FromIpfsHash(ipfsListing) {
  return "0x"+bs58.decode(ipfsListing).slice(2).toString('hex')
}

const testAccount = {
  displayName: "testAccount",
  company: "Peeranha",
  position: "TestInfo",
  location: "TestInfo",
  about: "TestInfo",
  avatar: "f"
};

async function getBytes32FromData(data) {
  const ipfsHash = await saveText(JSON.stringify(data));
  return getBytes32FromIpfsHash(ipfsHash)
}

async function main() {
  const Peeranha = await ethers.getContractFactory("Peeranha");
  const peeranha = await Peeranha.attach(PEERANHA_ADDRESS);
  console.log("Posting action");

  await peeranha.createUser(await getBytes32FromData(testAccount));
  // await peeranha.updateUser(await getBytes32FromData(testAccount));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });