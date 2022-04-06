const { ethers } = require("hardhat");
const { create } = require('ipfs-http-client');
const bs58 = require('bs58');
const { IPFS_API_URL, PEERANHA_ADDRESS, POSTLIB_ADDRESS, COMMUNITYLIB_ADDRESS, NFT_ADDRESS, IPFS_API_URL_THE_GRAPH } = require('../env.json');
const { achievements, PATH } = require('./common-action');
var fs = require('fs');

function getIpfsApi() {
  return create(IPFS_API_URL);
}

function getIpfsApiTheGraph() {
  return create(IPFS_API_URL_THE_GRAPH);
}

async function saveTextTheGraph(buf) {
  await getIpfsApiTheGraph().add(buf);
}

async function saveFileTheGraph(buf) {
  await getIpfsApiTheGraph().add(buf);
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
  await getIpfsApiTheGraph().add(buf);
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
  console.log("Begin initializing NFTs");
  console.log(`Images path: ${PATH}`);
  
  const PeeranhaNFT = await ethers.getContractFactory("PeeranhaNFT");
  const peeranhaNft = await PeeranhaNFT.attach(NFT_ADDRESS);
  const tx = await peeranhaNft.transferOwnership(PEERANHA_ADDRESS);
  console.log(`Send transaction to set owner for NFT contract - ${tx}.`);
  
  console.log(`Waiting for transaction ${tx.hash} to confirm.`)
  await tx.wait();
  console.log(`Transaction confirmed.`)

  const Peeranha = await ethers.getContractFactory("Peeranha", {
		libraries: {
			PostLib: POSTLIB_ADDRESS,
      CommunityLib: COMMUNITYLIB_ADDRESS,
		}
	});
  const peeranha = await Peeranha.attach(PEERANHA_ADDRESS);
  await initAchievement(peeranha);

  console.log('DONE!');
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
    const tx = await peeranha.configureNewAchievement(maxCount, lowerBound, await getBytes32FromData(nft), type);
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