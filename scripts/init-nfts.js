const { ethers } = require("hardhat");
const { create } = require('ipfs-http-client');
const bs58 = require('bs58');
const { IPFS_API_URL, PEERANHA_ADDRESS, POSTLIB_ADDRESS, IPFS_API_URL_THE_GRAPH } = require('../env.json');
const { testAccount, NFT, achievements } = require('./common-action');
var fs = require('fs');
var PNG = require('png-js');
var FileReader = require('filereader');

const PostTypeEnum = {"ExpertPost":0, "CommonPost":1, "Tutorial":2}

function getIpfsApi() {
  return create(IPFS_API_URL);
}

function getIpfsApiTheGraph() {
  return create(IPFS_API_URL_THE_GRAPH);
}

async function saveTextTheGraph(buf) {
  const saveResult = await getIpfsApiTheGraph().add(buf);
}

async function saveFileTheGraph(buf) {
  const saveResult = await getIpfsApiTheGraph().add(buf);
}

async function saveText(text) {
  const buf = Buffer.from(text, 'utf8');
  const saveResult = await getIpfsApi().add(buf);
  await saveTextTheGraph(buf);
  return saveResult.cid.toString();
}

function getBytes32FromIpfsHash(ipfsListing) {
  return "0x"+bs58.decode(ipfsListing).slice(2).toString('hex')
}

async function saveFile(file) {
  const buf = Buffer.from(file);
  const saveResult2 = await getIpfsApiTheGraph().add(buf);
  const saveResult = await getIpfsApi().add(buf);

  await saveFileTheGraph(buf);

  return saveResult.cid.toString();
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
  console.log("Begin initializing achievemnts NFTs");
  await initAchievement(peeranha);
}

async function initAchievement(peeranha) {
  for (const { maxCount, lowerBound, type, path, name, description, attributes } of achievements("prod")) {
    const buffer = fs.readFileSync(path)
    const imgHash = await saveFile(buffer)  
    let nft = {
      name: name,
      description: description,
      image: imgHash,
      attributes: attributes,
    };
    await peeranha.configureNewAchievement(maxCount, lowerBound, await getBytes32FromData(nft), type);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });