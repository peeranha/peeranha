const { ethers } = require("hardhat");
const { create } = require('ipfs-http-client');
const bs58 = require('bs58');
const { IPFS_API_URL, PEERANHA_ADDRESS, TOKEN_ADDRESS, POSTLIB_ADDRESS, IPFS_API_URL_THE_GRAPH } = require('../env.json');
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
  // return saveResult.cid.toString();
}

async function saveFileTheGraph(buf) {
  const saveResult = await getIpfsApiTheGraph().add(buf);
  // return saveResult.cid.toString();
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

const testCommunity = {     /// move to common acrion.js
  title: "testCommunity6.new",
  description: "testCommunity.new",
  website: "www.new",
  language: "ua.new",
};

const testTag = {
  title: "testTagNew",
  description: "testNewTag1",
};

const testPost = {
  title: "Test 1 post edited",
  content: "Edited"
};

const testReply = {
  content: "Second reply postID 1"
};

const testComment = {
  content: "Edited First comment postID 1"
};

async function getTags(countTags) {
  let tags = [];
  for(let i = 0; i < countTags; i++) {
    let text = testTag
    text.title = "testTag" + i.toString()
    console.log(text)
    await tags.push( 
    { 
      ipfsDoc:
      {
        hash: await getBytes32FromData(text),
        hash2: await getBytes32FromData(testTag)
      }
    })
  }

  return tags
}

async function getBytes32FromData(data) {
  const ipfsHash = await saveText(JSON.stringify(data));
  console.log("Uploaded file to IPFS - " + ipfsHash);
  return getBytes32FromIpfsHash(ipfsHash)
}

function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
      bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

async function main() {
  const Peeranha = await ethers.getContractFactory("Peeranha", {
		libraries: {
			PostLib: POSTLIB_ADDRESS,
		}
	});
  const peeranha = await Peeranha.attach(PEERANHA_ADDRESS);
  console.log("Posting action");

  //  result = await peeranha.createUser(await getBytes32FromData(testAccount));
  // console.log(JSON.stringify(result))
  // await peeranha.updateUser(await getBytes32FromData(testAccount));
  // await peeranha.createCommunity(await getBytes32FromData(testCommunity), await getTags(5));
  // await peeranha.updateCommunity(6, await getBytes32FromData(testCommunity));
  // await peeranha.freezeCommunity(1);
  // await peeranha.unfreezeCommunity(1);
  // await peeranha.createTag(1, await getBytes32FromData(testTag));
  // await peeranha.createPost(1, await getBytes32FromData(testPost), PostTypeEnum.CommonPost, [3, 4]);
  // await peeranha.createPost(1, await getBytes32FromData(testPost), PostTypeEnum.CommonPost, [3, 4]);
  // await peeranha.editPost(1, 1, await getBytes32FromData(testPost), [1, 2]);
  // await peeranha.deletePost(2);
  // await peeranha.createReply(1, 0, await getBytes32FromData(testReply), false);  //true
  // await peeranha.editReply(1, 1, await getBytes32FromData(testReply));
  // await peeranha.deleteReply(1, 1);
  // await peeranha.createComment(1, 0, await getBytes32FromData(testComment));
  // await peeranha.editComment(1, 0, 1, await getBytes32FromData(testComment));
  // await peeranha.deleteComment(1, 0, 1);
  await peeranha.voteItem(1, 0, 3, true);
}

async function initAchievement(peeranha) {
  for (const { maxCount, lowerBound, type, path, name, description, attributes } of achievements("test")) {
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