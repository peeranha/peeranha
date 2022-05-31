const { ethers, network } = require("hardhat");
const { create } = require("ipfs-http-client");
const bs58 = require("bs58");
const {
  IPFS_API_URL,
  USER_ADDRESS,
  NFT_ADDRESS,
  TOKEN_ADDRESS,
  POSTLIB_ADDRESS,
  COMMUNITYLIB_ADDRESS,
  IPFS_API_URL_THE_GRAPH,
  INFURA_API_KEY
} = require("../env.json");
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

const testTag = {
  title: "testTagNew",
  description: "testNewTag1"
};

const testPost = {
  title: "Test post",
  content: "Test post description"
};

const testReply = {
  content: "Second reply postID 1"
};

const testComment = {
  content: "Edited First comment postID 1"
};

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

async function main() {
  const PeeranhaNFT = await ethers.getContractFactory("PeeranhaNFT");
  const peeranhaNFT = await PeeranhaNFT.attach(NFT_ADDRESS);

  // console.log("1")
  // peeranha.giveCommunityAdminPermission("0x8a9685d3827a740ec9b1efdd0a05ff62039868ad", 1)
  // console.log("2")
  // peeranha.giveCommunityModeratorPermission("0xc4ed6fc2e633430b4b982a8b3baa6fc8c62a037e", 1)
  // console.log("3")

  // console.log("Posting action");
  // await peeranha.createUser(await getBytes32FromData(testAccount));
  // console.log(JSON.stringify(result))

  // await peeranha.createCommunity(await getBytes32FromData(testCommunity), await getTags(5));
  await peeranhaNFT.transferFrom("0x3EF542C3bdEe02A4CB21aAa6587178A0a813a23D", "0xf5800B1a93C4b0A87a60E9751d1309Ce93CC0D3A", 1);
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
  // await peeranha.voteItem(1, 0, 3, true);
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

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
