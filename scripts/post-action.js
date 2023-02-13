const { ethers, network } = require("hardhat");
const { create } = require("ipfs-http-client");
const bs58 = require("bs58");
const {
  GLOBAL_ADMIN_ADDRESS,
  IPFS_API_URL,
  USER_ADDRESS,
  NFT_ADDRESS,
  TOKEN_ADDRESS,
  POSTLIB_ADDRESS,
  USERLIB_ADDRESS,
  COMMUNITY_ADDRESS,
  CONTENT_ADDRESS,
  IPFS_API_URL_THE_GRAPH,
  INFURA_API_KEY,
} = require("../env.json");
const { testAccount, Language, NFT, achievements, testCommunity, testTag, testPost, testReply, testComment, postTranslation, replyTranslation, commentTranslation } = require("./common-action");
const crypto = require("crypto");
const fs = require("fs");
const { PROTOCOL_ADMIN_ROLE } = require("../test/contracts/utils");

const PostTypeEnum = { ExpertPost: 0, CommonPost: 1, Tutorial: 2, Documentatation: 3 };

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

const testDocumentating = {
  id: "5",
  children: [
    {id: "6", children: []},
    {id: "7", children: [
      {id: "8", children: [
        {id: "9", children: []}
      ]}
    ]}
  ]
};


async function main() {
  await contentFunctions();
  // await userFunctions();
  // await communityFunctions();
}

async function userFunctions() {
  const PeeranhaUser = await ethers.getContractFactory("PeeranhaUser", {
		libraries: {
			UserLib: USERLIB_ADDRESS,
		}
	});
  const peeranhaUser = await PeeranhaUser.attach(USER_ADDRESS);
  const signers = await ethers.getSigners();

  const txObj = await peeranhaUser.createUser(signers[0].address, await getBytes32FromData(testAccount));
  // const txObj = await peeranhaUser.giveCommunityAdminPermission("0x8E0184b7312339b9CbB6Ad18298512A62E600dCf", 2);
  // const txObj = await peeranhaUser.revokeCommunityModeratorPermission("0x8E0184b7312339b9CbB6Ad18298512A62E600dCf", 2);
  // const txObj = await peeranhaUser.grantRole(PROTOCOL_ADMIN_ROLE, "0xf5800B1a93C4b0A87a60E9751d1309Ce93CC0D3A")

  console.log(`Contract: PeeranhaUser - ${USER_ADDRESS}`)
  console.log(`Submitted transaction - ${JSON.stringify(txObj)}`);
  console.log(`Waiting for transaction confirmation`);
  await txObj.wait();
  console.log('Transaction confirmed');
}

async function communityFunctions() {
  const PeeranhaCommunity = await ethers.getContractFactory("PeeranhaCommunity");
  const peeranhaCommunity = await PeeranhaCommunity.attach(COMMUNITY_ADDRESS);

  const signers = await ethers.getSigners();

  const txObj = await peeranhaCommunity.createCommunity(signers[0].address, await getBytes32FromData(testCommunity), await getTags(5));
  // const txObj = await peeranhaCommunity.updateCommunity(signers[0].address, 3, await getBytes32FromData(testCommunity));

  console.log(`Submitted transaction - ${JSON.stringify(txObj)}`);
  console.log(`Waiting for transaction confirmation`);
  await txObj.wait();
  console.log('Transaction confirmed');
}

async function contentFunctions() {
  const PeeranhaContent = await ethers.getContractFactory("PeeranhaContent", {
		libraries: {
			PostLib: POSTLIB_ADDRESS,
		}
	});
  const peeranhaContent = await PeeranhaContent.attach(CONTENT_ADDRESS);

  // const txObj = await peeranhaContent.createPost(1, await getBytes32FromData(testPost), PostTypeEnum.ExpertPost, [1], Language.Chinese);
  // const txObj = await peeranhaContent.editPost(signers[0].address, 1, await getBytes32FromData(testPost), [], Language.Vietnamese);
  // const txObj = await peeranhaContent.createReply(1, 0, await getBytes32FromData(testReply), true, Language.Spanish);
  // const txObj = await peeranhaContent.editReply(1, 1, await getBytes32FromData(testReply), true, Language.Vietnamese);
  // const txObj = await peeranhaContent.createComment(1, 1, await getBytes32FromData(testComment), Language.Chinese);
  // const txObj = await peeranhaContent.editComment(1, 0, 1, await getBytes32FromData(testComment), Language.Vietnamese)
  // const txObj = await peeranhaContent.updateDocumentationTree(1, await getBytes32FromData(testDocumentating));
  // const txObj = await peeranhaContent.createTranslations(1, 1, 1, [Language.English], [await getBytes32FromData(commentTranslation)]);
  // const txObj = await peeranhaContent.editTranslations(1, 1, 1, [Language.English], [await getBytes32FromData(commentTranslation)]);
  // const txObj = await peeranhaContent.deleteTranslations(1, 0, 0, [Language.English]);
 
  const signers = await ethers.getSigners();
  // const txObj = await peeranhaContent.createPost(signers[0].address, 1, await getBytes32FromData(testPost), PostTypeEnum.Documentatation, []);
  // const txObj = await peeranhaContent.editPost(signers[0].address, 8, await getBytes32FromData(testPost), []);
  // const txObj = await peeranhaContent.createReply(signers[0].address, 3, 0, await getBytes32FromData(testReply), true);
  // const txObj = await peeranhaContent.editReply(signers[0].address, 3, 2, await getBytes32FromData(testReply), true);
  const txObj = await peeranhaContent.updateDocumentationTree(signers[0].address, 1, await getBytes32FromData(testDocumentating));

  console.log(`Submitted transaction - ${JSON.stringify(txObj)}`);
  console.log(`Waiting for transaction confirmation`);
  await txObj.wait();
  console.log('Transaction confirmed');
}

async function nftFunctions() {
  const PeeranhaNFT = await ethers.getContractFactory("PeeranhaNFT");
  const peeranhaNFT = await PeeranhaNFT.attach(NFT_ADDRESS);

  await peeranhaNFT.transferFrom("0x3EF542C3bdEe02A4CB21aAa6587178A0a813a23D", "0x543230635B057332CF2335C16185923c3a3B316f", 30000001)
}

async function initAchievement(peeranhaUser) {
  for (const { maxCount, lowerBound, type, path } of achievements("test")) {
    console.log(
      "Init achievement. Lower bound: " +
        lowerBound +
        ", max count: " +
        maxCount
    );
    const buffer = Buffer.from(path);

    const ipfsImage = await getIpfsApi().add(buffer);
    let nft = NFT;
    nft.image = "ipfs://" + ipfsImage.path;

    console.log(nft);
    const nftIPFS = "ipfs://" + await saveText(JSON.stringify(nft));
    console.log(`NFt Ipfs ${nftIPFS}`)
    
    await peeranhaUser.configureNewAchievement(
      maxCount,
      lowerBound,
      nftIPFS,
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
