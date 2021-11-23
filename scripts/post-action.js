const { ethers } = require("hardhat");
const { create } = require('ipfs-http-client');
const bs58 = require('bs58');
const { IPFS_API_URL, PEERANHA_ADDRESS, TOKEN_ADDRESS, POSTLIB_ADDRESS } = require('../env.json');
const { testAccount, NFT, achievements } = require('./common-action');


function getIpfsApi() {
  return create(IPFS_API_URL);
}

async function saveText(text) {
  const buf = Buffer.from(text, 'utf8');
  const saveResult = await getIpfsApi().add(buf);
  return saveResult.cid.toString();
}

function getBytes32FromIpfsHash(ipfsListing) {
  return "0x"+bs58.decode(ipfsListing).slice(2).toString('hex')
}

async function getBytes32FromData(data) {
  const ipfsHash = await saveText(JSON.stringify(data));
  console.log("Uploaded file to IPFS - " + ipfsHash);
  return getBytes32FromIpfsHash(ipfsHash)
}

async function main() {
  const Peeranha = await ethers.getContractFactory("Peeranha", {
		libraries: {
			PostLib: POSTLIB_ADDRESS,
		}
	});
  const peeranha = await Peeranha.attach(PEERANHA_ADDRESS);
  console.log("Posting action");

  result = await peeranha.createUser(await getBytes32FromData(testAccount));
  console.log(JSON.stringify(result))
  // await peeranha.updateUser(await getBytes32FromData(testAccount));
}

async function initAchievement(peeranha) {
  for (const { maxCount, lowerBound, type, path } of achievements) {
    console.log("Init achievement. Lower bound: " + lowerBound  + ", max count: " + maxCount);
    const buffer = Buffer.from(path);
    console.log(buffer);

    const saveResult = await getIpfsApi().add(buffer);
    const ipfsImage = await getBytes32FromData(saveResult);
    let nft = NFT;
    nft.image = ipfsImage;

    await peeranha.configureNewAchievement(maxCount, lowerBound, await getBytes32FromData(nft), type);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });