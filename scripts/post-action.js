const { ethers, network } = require("hardhat");
const fetch = require('node-fetch');
const { create } = require("ipfs-http-client");
const bs58 = require("bs58");
const {
  GLOBAL_ADMIN_ADDRESS,
  USER_ADDRESS,
  NFT_ADDRESS,
  TOKEN_ADDRESS,
  POSTLIB_ADDRESS,
  USERLIB_ADDRESS,
  COMMUNITY_ADDRESS,
  CONTENT_ADDRESS,
  API_ENDPOINT,
  INFURA_API_KEY,
} = require("../env.json");
const { testAccount, Language, NFT, achievements, testCommunity, testTag, testPost, testReply, testComment, postTranslation, replyTranslation, commentTranslation } = require("./common-action");
const crypto = require("crypto");
const fs = require("fs");
const { PROTOCOL_ADMIN_ROLE, DISPATCHER_ROLE, BOT_ROLE } = require("../test/contracts/utils");
const abiDecoder = require('abi-decoder'); // eslint-disable-line import/no-extraneous-dependencies
const abi = require('../../peeranha-subgraph/abis/PeeranhaContent.json');

const PostTypeEnum = { ExpertPost: 0, CommonPost: 1, Tutorial: 2, Documentatation: 3 };
const SAVE_FILE_SERVICE = "save-file"
const OTIMISTIC_TRANSACTION = "optimistic-transaction"

async function getBytes32FromData(data) {
  const convertData = { content: Buffer.from(JSON.stringify(data), 'utf8'), encoding: 'Buffer' }
  const ipfsHash = await saveDataIpfsS3(convertData);
  console.log("Uploaded file to IPFS - " + JSON.stringify(ipfsHash));
  return getBytes32FromIpfsHash(ipfsHash);
}

async function getOptimisticData(txHash, chainId) { // fix get network
  // console.log(`${JSON.stringify(ethers.getDefaultProvider())}`);
  console.log(`data: ${txHash}`)
  const convertData = { transactionHash: txHash, network: 1}
  const ipfsHash = await callOptimisticLambda(convertData);
  console.log("Uploaded file to IPFS - " + JSON.stringify(ipfsHash));
  return getBytes32FromIpfsHash(ipfsHash);
}

function getBytes32FromIpfsHash(ipfsResponse) {
  if (ipfsResponse?.OK) {
    const cid = ipfsResponse.body.cid;
    console.log(`cid: ${cid}`)
    return (
      "0x" +
      bs58
        .decode(cid)
        .slice(2)
        .toString("hex")
    );
  } else {
    console.log('\x1b[41m', `Error ipfs: ${JSON.stringify(ipfsResponse)}`, '\x1b[0m');
    return null;
  }
}

async function saveDataIpfsS3(file) {
  return await callService(SAVE_FILE_SERVICE, { file });
}

async function callOptimisticLambda(data) {
  return await callService(OTIMISTIC_TRANSACTION, data);
}

async function callService(service, props, isGet = false) {
  const url = new URL(API_ENDPOINT + service);

  if (isGet) {
    url.search = new URLSearchParams(props).toString();
  }

  const rawResponse = await fetch(url, {
    method: isGet ? 'GET' : 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': isGet ? '' : 'application/json',
    },
    ...(!isGet ? { body: JSON.stringify(props) } : {}),
  });
  const response = await rawResponse.json();

  if (rawResponse.status < 200 || rawResponse.status > 208) {
    return {
      errorMessage: response.message,
      errorCode: response.code,
    };
  }

  return {
    OK: true,
    body: response,
  };
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

async function decodeData(transactionHash) {
  console.log(`transactionHash ${transactionHash}`)
  abiDecoder.addABI(abi);
  const tx = await ethers.provider.getTransaction(transactionHash);
  if (!tx) {
    console.log(`transaction does not found ${transactionHash}`)
  }
  const txData = tx.data;

  const decodedData = abiDecoder.decodeMethod(txData);
  console.log(JSON.stringify(decodedData));
  console.log();
}

async function getError() {
  const tx = await ethers.provider.getTransaction("0x174f99fea2fe14a3e8372a3271850477e28789dc5151f29044db70b9ca933bbf");
  // const tx = await ethers.provider.getTransactionReceipt("0x2523840a7c454c71adabe80e7539de16a6bf6b4a1fe3164255330a584fc7b563");
  console.log(tx);

  // const unsignedTx = {
  //     to: tx.to,
  //     nonce: tx.nonce,
  //     gasLimit: tx.gasLimit,
  //     gasPrice: tx.gasPrice,
  //     data: tx.data,
  //     value: tx.value,
  //     chainId: tx.chainId
  // };
  // const signature = {
  //     v: tx.v,
  //     r: tx.r,
  //     s: tx.s
  // }

  // const raw = ethers.utils.serializeTransaction(unsignedTx, signature);
  // console.log(raw);

  // const txLog = ethers.utils.parseTransaction(raw)
  // console.log(txLog);

}

async function main() {
  // await getOptimisticData("0xf488cafb971f94c0b45de6abf8c7968c6f1a2506e9a9a806fc9bea826827802d");
  // await getError()
  // await decodeData('0x403869bfc17d33e2292c3eeb6e7b83ff5957c5d6802fc3e7eb00844246e26d5e');
  // await decodeData('0x910ca38dc611cbd003e5240f0fb3d11bb1345cdfe6d6cc41b30bf9bdf90a7ea5');
  // await decodeData('0xcffe3ffa01eb5dfe6757f1834fdd55373ceac3250e8f567f1932f8b7b7f72105');
  await contentFunctions();
  // await userFunctions();
  // await communityFunctions();
}

async function userFunctions() {
  const signers = await ethers.getSigners();
  const PeeranhaUser = await ethers.getContractFactory("PeeranhaUser", {
		libraries: {
			UserLib: USERLIB_ADDRESS,
		}
	});
  const peeranhaUser = await PeeranhaUser.attach(USER_ADDRESS);

  // const txObj = await peeranhaUser.createUser(signers[0].address, await getBytes32FromData(testAccount));
  // const txObj = await peeranhaUser.isUserExists(signers[0].address);
  // const txObj = await peeranhaUser.updateUser(signers[0].address, await getBytes32FromData(testAccount));
  // const txObj = await peeranhaUser.addUserRating("0x48086ef90c4a9e86bbff12d02d447929a6fa824b", 100, 2);
  // const txObj = await peeranhaUser.giveCommunityModeratorPermission("0xE902761E0207A8470caA51FA11f397069FdADa2b", 2);
  // const txObj = await peeranhaUser.grantRole(PROTOCOL_ADMIN_ROLE, "0x31339c62c0a44b875297945edb93d88092b5fa91")
  // const txObj = await peeranhaUser.grantRole(DISPATCHER_ROLE, "0xdf5C1E9B4a97C83b72E3d34f254729c39a206F6E")
  // const txObj = await peeranhaUser.grantRole(BOT_ROLE, "0xdf5C1E9B4a97C83b72E3d34f254729c39a206F6E")
  // const txObj = await peeranhaUser.grantRole(PROTOCOL_ADMIN_ROLE, "0x570895fd1f7d529606e495885f6eaf1924baa08e");
  // const txObj = await peeranhaUser.revokeRole(PROTOCOL_ADMIN_ROLE, "0x9fBE2C1d7B0Ebeddb2faEF30Be00Ed838f19E499")
  // const txObj = await peeranhaUser.followCommunity(signers[0].address, 1);
  // const txObj = await peeranhaUser.unfollowCommunity(signers[0].address, 1);
  // const txObj = await peeranhaUser.banCommunityUser(signers[0].address, "0x48086ef90c4a9e86bbff12d02d447929a6fa824b", 2);
  const txObj = await peeranhaUser.unBanCommunityUser(signers[0].address, "0x48086ef90c4a9E86BbFF12d02d447929A6fa824B", 2);
  // const txObj = await peeranhaUser.isBanedUser("0x48086ef90c4a9E86BbFF12d02d447929A6fa824B", 2);
  // const txObj = await peeranhaUser.isProtocolAdmin("0x9fBE2C1d7B0Ebeddb2faEF30Be00Ed838f19E499");
  // const txObj = await peeranhaUser.getUserRatingCollection("0x9fBE2C1d7B0Ebeddb2faEF30Be00Ed838f19E499", 2);
  // const txObj = await peeranhaUser.getUsersCount();
  // const txObj = await peeranhaUser.getUsersCount();
  // const txObj = await peeranhaUser.getUserByAddress("0xd06b205d2826b481e64492f85694d07e57a17b19");

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
  // const txObj = await peeranhaCommunity.createCommunity(signers[0].address, await getBytes32FromData(testCommunity), await getTags(5));
  // const txObj = await peeranhaCommunity.updateCommunity(signers[0].address, 3, await getBytes32FromData(testCommunity));
  // const txObj = await peeranhaCommunity.freezeCommunity(signers[0].address, 2);
  const txObj = await peeranhaCommunity.unfreezeCommunity(signers[0].address, 2);
  // const txObj = await peeranhaCommunity.getCommunity(2);

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
  const signers = await ethers.getSigners();

  // const ipfsResponse = await getBytes32FromData(testPost);
  // if (!ipfsResponse) {
  //   console.log('\x1b[41m', `Error ipfs: ${JSON.stringify(ipfsResponse)}`, '\x1b[0m');
  //   return;
  // }

  // const txObj = await peeranhaContent.createPost(signers[0].address, 2, ipfsResponse, PostTypeEnum.CommonPost, [1,3], Language.English);
  // const txObj = await peeranhaContent.editPost(signers[0].address, 336, await getBytes32FromData(testPost), [4,3], 2, PostTypeEnum.CommonPost, Language.English);
  const txObj = await peeranhaContent.createReply(signers[0].address, 600, 0, await getBytes32FromData(testReply), false, Language.Chinese);
  // const txObj = await peeranhaContent.editReply(signers[0].address, 1, 1, await getBytes32FromData(testReply), true, Language.Vietnamese);
  // const txObj = await peeranhaContent.createComment(signers[0].address, 315, 0, await getBytes32FromData(testComment), Language.English);
  // const txObj = await peeranhaContent.editComment(signers[0].address, 2, 1, 1, await getBytes32FromData(testComment), Language.English)
  // const txObj = await peeranhaContent.updateDocumentationTree(1, await getBytes32FromData(testDocumentating));
  // const txObj = await peeranhaContent.createTranslations(signers[0].address, 2, 0, 0, [Language.Spanish], [await getBytes32FromData(postTranslation)]);
  // const txObj = await peeranhaContent.editTranslations(signers[0].address, 2, 0, 0, [Language.Spanish], [await getBytes32FromData(postTranslation)]);
  // const txObj = await peeranhaContent.deleteTranslations(signers[0].address, 1, 0, 0, [Language.English]);
  // const txObj = await peeranhaContent.updateDocumentationTree(signers[0].address, 1, await getBytes32FromData(testDocumentating));
  // const txObj = await peeranhaContent.getVersion();

  // const txObj = await peeranhaContent.getPost(485);
  // const txObj = await peeranhaContent.getReply(594, 3);
  // const txObj = await peeranhaContent.getComment(315, 0, 1);

  // await getOptimisticData(txObj.hash, 1);

  console.log(`Submitted transaction - ${JSON.stringify(txObj)}`);
  console.log(`Waiting for transaction confirmation`);
  console.log(`txObj.hash ${txObj.hash}`);
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
