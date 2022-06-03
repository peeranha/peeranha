const { ethers, network } = require("hardhat");
const { create } = require("ipfs-http-client");
const bs58 = require("bs58");
const {
  IPFS_API_URL,
  PEERANHA_ADDRESS,
  USER_ADDRESS,
  COMMUNITY_ADDRESS,
  CONTENT_ADDRESS,
  TOKEN_ADDRESS,
  POSTLIB_ADDRESS,
  COMMUNITYLIB_ADDRESS,
  IPFS_API_URL_THE_GRAPH,
  INFURA_API_KEY
} = require("../env-test.json");
const { testAccount, NFT, achievements, testCommunity } = require("./common-action");
const crypto = require("crypto");
const fs = require("fs");

const PostTypeEnum = { ExpertPost: 0, CommonPost: 1, Tutorial: 2 };

function getIpfsApi() {
  return create(IPFS_API_URL);
}

function getIpfsApiTheGraph() {
  return create(IPFS_API_URL_THE_GRAPH);
}

async function saveTextTheGraph(buf) {
  await getIpfsApiTheGraph().add(buf);
}

async function saveText(text) {
  const buf = Buffer.from(text, "utf8");
  const saveResult = await getIpfsApi().add(buf);
  await saveTextTheGraph(buf);
  return saveResult.cid.toString();
}

function getBytes32FromIpfsHash(ipfsListing) {
  return (
    "0x" +
    bs58
      .decode(ipfsListing)
      .slice(2)
      .toString("hex")
  );
}

async function getTags(countTags) {
  let tags = [];
  for (let i = 0; i < countTags; i++) {
    let text = testTag;
    text.title = "testTag" + i.toString();
    console.log(text);
    await tags.push({
      ipfsDoc: {
        hash: await getBytes32FromData(text),
        hash2: await getBytes32FromData(testTag)
      }
    });
  }

  return tags;
}

async function getBytes32FromData(data) {
  const ipfsHash = await saveText(JSON.stringify(data));
  console.log("Uploaded file to IPFS - " + ipfsHash);
  return getBytes32FromIpfsHash(ipfsHash);
}

const testTag = {
  title: "testTagNew",
  description: "testNewTag1"
};

const testComment = {
  content: "Edited First comment postID 1"
};

const testEmptyObj = {};

const testString = "myTest";

const testFalseFields = {
  dName: "mytestAccount2",
  com: "Peeranha2",
  loc: "TestInfo2",
  ava: "f2"
}

const mytestUser = {
  displayName: "mytestAccount",
  company: "Peeranha",
  position: "TestInfo",
  location: "TestInfo",
  about: "TestInfo",
  avatar: "111"
};

const mytestCommunity = {
  name: "mytestCommunity123.new",
  description: "testCommunity123.new",
  website: "www.new123",
  language: "ua.new123",
  avatar: "f",
}; 

const mytestPost = {
  title: "Test my second2333 day post",
  content: "Test second2333 day post description"
};

const mytestReply = {
  content: "test my first reply"
};

async function testUser() {
  const PeeranhaUser = await ethers.getContractFactory("PeeranhaUser");
  const peeranhaUser = await PeeranhaUser.attach(USER_ADDRESS);
  const result = await peeranhaUser.createUser(await getBytes32FromData(mytestUser)); // testFalseFields, testEmptyObj, testString
  // const result = await peeranhaUser.updateUser(await getBytes32FromData(mytestUser)); // testFalseFields, testEmptyObj, testString
}

async function testCommunity() {
  const PeeranhaCommunity = await ethers.getContractFactory("PeeranhaCommunity");
  const peeranhaCommunity = await PeeranhaCommunity.attach(COMMUNITY_ADDRESS);
  const result = await peeranhaCommunity.createCommunity(await getBytes32FromData(mytestCommunity), await getTags(5)); //testFalseFields, testEmptyObj, testString
  // const result = await peeranhaCommunity.updateCommunity(5, await getBytes32FromData(mytestCommunity)); // testFalseFields, testEmptyObj, testString
}

async function testPost() {
  const PostLib = await ethers.getContractFactory("PostLib");
  const postLib = await PostLib.deploy();
  const PeeranhaContent = await ethers.getContractFactory("PeeranhaContent", {
    libraries: {
      PostLib: postLib.address
    }});
  const peeranhaContent = await PeeranhaContent.attach(CONTENT_ADDRESS);
  const result = await peeranhaContent.createPost(1, await getBytes32FromData(mytestPost), PostTypeEnum.CommonPost, [3, 4]); // testFalseFields, testEmptyObj, testString
  // const result = await peeranhaContent.editPost(1, await getBytes32FromData(testPost), [1, 2]); // testFalseFields, testEmptyObj, testString
  // const result = await peeranhaContent.deletePost(2); // testFalseFields, testEmptyObj, testString
}

async function testReply() {
  const PostLib = await ethers.getContractFactory("PostLib")
  const postLib = await PostLib.deploy();
  const PeeranhaContent = await ethers.getContractFactory("PeeranhaContent", {
    libraries: {
        PostLib: postLib.address,
    }
})
    const peeranhaContent = await PeeranhaContent.attach(CONTENT_ADDRESS);
    const result = await peeranhaContent.createReply(4, 1, await getBytes32FromData(mytestReply), false); // testFalseFields, testEmptyObj, testString
    // const result = await peeranhaContent.editReply(1, 1, await getBytes32FromData(mytestReply)); // testFalseFields, testEmptyObj, testString
    // const result = await peeranhaContent.deleteReply(1, 1); // testFalseFields, testEmptyObj, testString
}

async function initAchievement(peeranha) {
  for (const { maxCount, lowerBound, type, path } of achievements) {
    console.log(
      "Init achievement. Lower bound: " +
        lowerBound +
        ", max count: " +
        maxCount
    );
    const buffer = Buffer.from(path);
    console.log(buffer);

    const saveResult = await getIpfsApi().add(buffer);
    const ipfsImage = await getBytes32FromData(saveResult);
    let nft = NFT;
    nft.image = ipfsImage;

    await peeranha.configureNewAchievement(
      maxCount,
      lowerBound,
      await getBytes32FromData(nft),
      type
    );
  }
}

async function main() {
  const Peeranha = await ethers.getContractFactory("Peeranha", {
    libraries: {
      PostLib: POSTLIB_ADDRESS,
      CommunityLib: COMMUNITYLIB_ADDRESS
    }
  });
  const peeranha = await Peeranha.attach(PEERANHA_ADDRESS);

  // await peeranha.createUser(await getBytes32FromData(testAccount));
  // await peeranha.createCommunity(await getBytes32FromData(testCommunity), await getTags(5));
  // await peeranha.addUserRating("0x3ef542c3bdee02a4cb21aaa6587178a0a813a23d", 4, 1);
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
  // await peeranha.voteItem(1, 0, 3, true);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
