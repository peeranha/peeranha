const { ethers } = require("hardhat");
const { create } = require('ipfs-http-client');
const bs58 = require('bs58');
const { IPFS_API_URL, PEERANHA_ADDRESS } = require('../env.json');

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

const testAccount = {
  displayName: "testMainAcc",
  company: "Peeranha",
  position: "TestInfo",
  location: "TestInfo",
  about: "TestInfo",
  avatar: "f"
};

const testCommunity = {
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
  const Peeranha = await ethers.getContractFactory("Peeranha");
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

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });