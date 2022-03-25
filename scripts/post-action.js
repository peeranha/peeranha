const { ethers, network } = require("hardhat");
const { create } = require("ipfs-http-client");
const bs58 = require("bs58");
const {
  IPFS_API_URL,
  PEERANHA_ADDRESS,
  TOKEN_ADDRESS,
  POSTLIB_ADDRESS,
  IPFS_API_URL_THE_GRAPH
} = require("../env.json");
const { testAccount, NFT, achievements } = require("./common-action");
const crypto = require("crypto");

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

const testCommunity = {
  /// move to common acrion.js
  title: "testCommunity6.new",
  description: "testCommunity.new",
  website: "www.new",
  language: "ua.new"
};

const testTag = {
  title: "testTagNew",
  description: "testNewTag1"
};

const testPost = {
  title: "Test post by Vitalid uualldldlalalaaa",
  content: "Edited bkdkfkkdkfkfkfkfkfkfkffleroromffdfdsssdaslkklaskdklaff,fkf,mf,"
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
  const Peeranha = await ethers.getContractFactory("Peeranha", {
    libraries: {
      PostLib: POSTLIB_ADDRESS
    }
  });
  const peeranha = await Peeranha.attach(PEERANHA_ADDRESS);
  console.log("Posting action");

  async function importForumData() {
    const createPrivateKey = () => {
      const getHashesContainer = size =>
        Array.apply(null, { length: size }).map(
          () => "0x" + crypto.randomBytes(32).toString("hex")
        );
      return getHashesContainer(1)[0];
    };

    const createWallet = privateKey => {
      return new ethers.Wallet(privateKey, ethers.getDefaultProvider("goerli"));
    };

    const topUpWallet = async (amountInEther, receiverAddress) => {
      const mainWallet = await ethers.getSigners();

      let tx = {
        to: receiverAddress,
        // Convert currency unit from ether to wei
        value: ethers.utils.parseEther(amountInEther)
      };

      const txObj = await mainWallet[0]
        .sendTransaction(tx)
        .then(txObj => {
          console.log("txHash", txObj.hash);
          return txObj;
        })
        .catch(err => console.log(err));

      await ethers.provider.waitForTransaction(txObj.hash);
    };

    const createUser = async (wallet, account) => {
      return await peeranha
        .connect(wallet)
        .createUser(await getBytes32FromData(account));
    };

    const createPost = async (wallet, post) => {
      return await peeranha
          .connect(wallet)
          .createPost(2, await getBytes32FromData(post), PostTypeEnum.CommonPost, [3, 4]);
    };

    const userPrivateKey = createPrivateKey();

    const newWallet = createWallet(userPrivateKey);
    let privateKey = newWallet.privateKey;
    console.log(privateKey)

    await topUpWallet("0.005", newWallet.address);

    const res1 = await createUser(newWallet, await saveText(JSON.stringify(testAccount)));
    await ethers.provider.waitForTransaction(res1.hash);
    console.log(res1)
    //
    // const res2 = await createPost(newWallet, await saveText(JSON.stringify(testPost)));
    // console.log(res2)
    // await ethers.provider.waitForTransaction(res2.hash);
  }

  await importForumData();

  // console.log(await peeranha.getUserByAddress("0x8A9685D3827A740eC9b1eFdD0A05fF62039868ad"))
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
