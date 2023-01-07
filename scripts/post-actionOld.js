const { ethers } = require("hardhat");
const { create } = require('ipfs-http-client');
const bs58 = require('bs58');
const { IPFS_API_URL, IPFS_API_URL_THE_GRAPH, PEERANHA_ADDRESS, NFT_ADDRESS, TOKEN_ADDRESS, POSTLIB_ADDRESS } = require('../env.json');
const { testAccount, NFT, achievements } = require('./common-action');
var fs = require('fs');

const PostTypeEnum = {"ExpertPost":0, "CommonPost":1, "Tutorial":2}

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

async function main() {
  const Peeranha = await ethers.getContractFactory("Peeranha", {
		libraries: {
			PostLib: POSTLIB_ADDRESS,
		}
	});

  // const PeeranhaNFT = await ethers.getContractFactory("PeeranhaNFT");
  // const peeranhaNFT = await PeeranhaNFT.attach(NFT_ADDRESS);
  // await peeranhaNFT.transferOwnership(PEERANHA_ADDRESS);

  const peeranha = await Peeranha.attach(PEERANHA_ADDRESS);
  // console.log("Posting action");
  // await initAchievement(peeranha);

  // result = await peeranha.createUser(await getBytes32FromData(testAccount));
  result = await peeranha.addUserRating("0x033aa9c50ec70b0ebf2398827ea62eae764e2f05", 130, 1);
  console.log(`result ${result}`)
  const signers = await ethers.getSigners();
  //  result = await peeranha.addUserRating("0x3ef542c3bdee02a4cb21aaa6587178a0a813a23d", 4, 1);
  // console.log(JSON.stringify(result))
  // await peeranha.updateUser(signers[0].address, await getBytes32FromData(testAccount));
  // await peeranha.createCommunity(signers[0].address, await getBytes32FromData(testCommunity), await getTags(5));
  // await peeranha.updateCommunity(signers[0].address, 6, await getBytes32FromData(testCommunity));
  // await peeranha.freezeCommunity(signers[0].address, 1);
  // await peeranha.unfreezeCommunity(signers[0].address, 1);
  // await peeranha.createTag(signers[0].address, 1, await getBytes32FromData(testTag));
  // await peeranha.createPost(signers[0].address, 1, await getBytes32FromData(testPost), PostTypeEnum.CommonPost, [3, 4]);
  // await peeranha.createPost(signers[0].address, 1, await getBytes32FromData(testPost), PostTypeEnum.CommonPost, [3, 4]);
  // await peeranha.editPost(signers[0].address, 1, 1, await getBytes32FromData(testPost), [1, 2]);
  // await peeranha.deletePost(signers[0].address, 2);
  // await peeranha.createReply(signers[0].address, 1, 0, await getBytes32FromData(testReply), false);  //true
  // await peeranha.editReply(signers[0].address, 1, 1, await getBytes32FromData(testReply));
  // await peeranha.deleteReply(signers[0].address, 1, 1);
  // await peeranha.createComment(signers[0].address, 1, 0, await getBytes32FromData(testComment));
  // await peeranha.editComment(signers[0].address, 1, 0, 1, await getBytes32FromData(testComment));
  // await peeranha.deleteComment(signers[0].address, 1, 0, 1);
  // await peeranha.voteItem(signers[0].address, 1, 0, 3, true);
}

async function saveFile(file) {
  const buf = Buffer.from(file);
  const saveResult2 = await getIpfsApiTheGraph().add(buf);
  const saveResult = await getIpfsApi().add(buf);

  await saveFileTheGraph(buf);

  return saveResult.cid.toString();
}

async function saveFileTheGraph(buf) {
  const saveResult = await getIpfsApiTheGraph().add(buf);
  // return saveResult.cid.toString();
}

function getIpfsApiTheGraph() {
  return create(IPFS_API_URL_THE_GRAPH);
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

    console.log(maxCount)
    await peeranha.configureNewAchievement(maxCount, lowerBound, await getBytes32FromData(nft), type);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });