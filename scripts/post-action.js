const { ethers } = require("hardhat");
const { create } = require('ipfs-http-client');
const bs58 = require('bs58');
const { IPFS_API_URL, PEERANHA_ADDRESS } = require('../env.json');


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

const testAccount = {
  displayName: "testAccount",
  company: "Peeranha",
  position: "TestInfo",
  location: "TestInfo",
  about: "TestInfo",
  avatar: "f"
};

const NFT = {
  name: "testAccount",
  description: "Peeranha",
  image: "",
  attributes: "TestInfo",
};

async function getBytes32FromData(data) {
  const ipfsHash = await saveText(JSON.stringify(data));
  console.log("Uploaded file to IPFS - " + ipfsHash);
  return getBytes32FromIpfsHash(ipfsHash)
}

async function main() {
  const Peeranha = await ethers.getContractFactory("Peeranha");
  const peeranha = await Peeranha.attach(PEERANHA_ADDRESS);
  console.log("Posting action");

  result = await peeranha.createUser(await getBytes32FromData(testAccount));
  console.log(JSON.stringify(result))
  // await peeranha.updateUser(await getBytes32FromData(testAccount));
}

const AchievementType = { "Rating": 0 }

const achievements = [
  { id: 1, type: AchievementType.Rating, path: "../image/image1.png"},
  { id: 2, type: AchievementType.Rating, path: "../image/image2.png"},
  { id: 3, type: AchievementType.Rating, path: "../image/image3.png"},
];

async function initAchievement(peeranha) {
  for (const { id, type, path } of achievements) {
    console.loglog("Init achievement:" + id);
    const buffer = Buffer.from(path);
    console.log(buffer);
    const saveResult = await getIpfsApi().add(buffer);
    const ipfsImage = await getBytes32FromData(saveResult);
    console.log(ipfsImage);
		await peeranha.setTokenURI(id, 5, 15, ipfsImage, type);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });