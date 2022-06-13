const { ethers } = require("hardhat");
const { create } = require('ipfs-http-client');
const bs58 = require('bs58');
const { IPFS_API_URL, USER_ADDRESS, IPFS_API_URL_THE_GRAPH } = require('../env.json');
const { achievements, PATH } = require('./common-action');
var fs = require('fs');

function getIpfsApi() {
  return create(IPFS_API_URL);
}

function getIpfsApiTheGraph() {
  return create(IPFS_API_URL_THE_GRAPH);
}

async function saveTextTheGraph(buf) {
  const graphSaveResult = await getIpfsApiTheGraph().add(buf);
  console.log(`Saved file to the graph IPFS - ${graphSaveResult.cid.toString()}`)
}

async function saveIpfsText(buf) {
  const saveResult = await getIpfsApi().add(buf);
  console.log(`Saved file to our IPFS - ${saveResult.cid.toString()}`)
  return saveResult;
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
  const graphSaveResult = await getIpfsApiTheGraph().add(buf);
  console.log(`Saved file to the graph IPFS - ${graphSaveResult.cid.toString()}`)
  const saveResult = await getIpfsApi().add(buf);
  console.log(`Saved file to our IPFS - ${saveResult.cid.toString()}`)
  
  return saveResult.cid.toString();
}

async function getBytes32FromData(data) {
  const ipfsHash = await saveText(JSON.stringify(data));
  console.log("Uploaded file to IPFS - " + ipfsHash);
  return getBytes32FromIpfsHash(ipfsHash)
}

async function main() {
  console.log("Begin initializing NFTs");
  console.log(`Images path: ${PATH}`);
  
  const PeeranhaUser = await ethers.getContractFactory("PeeranhaUser");
  const peeranhaUser = await PeeranhaUser.attach(USER_ADDRESS);
  await initAchievement(peeranhaUser);

  console.log('DONE!');
}

async function initAchievement(peeranhaUser) {
  for (const { maxCount, lowerBound, type, path, name, description, attributes } of achievements("prod")) {
    const buffer = fs.readFileSync(path)
    const imgHash = "ipfs://" + await saveFile(buffer);
    let nft = {
      name: name,
      description: description,
      image: imgHash,
      attributes: attributes,
    };
    console.log(`init NFT ${name}`);
    const nftIPFS = "ipfs://" + await saveText(JSON.stringify(nft));
    const tx = await peeranhaUser.configureNewAchievement(maxCount, lowerBound, nftIPFS, type);
    console.log(`Sent transaction ${tx.hash} to init NFT ${name}`);

    console.log(`Waiting for confirmation`)
    await tx.wait();
    console.log(`Confirmed.`);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });