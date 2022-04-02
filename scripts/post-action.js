const { ethers, network } = require("hardhat");
const { create } = require("ipfs-http-client");
const bs58 = require("bs58");
const {
  IPFS_API_URL,
  PEERANHA_ADDRESS,
  TOKEN_ADDRESS,
  POSTLIB_ADDRESS,
  IPFS_API_URL_THE_GRAPH,
  infuraApiKey
} = require("../env.json");
const { testAccount, NFT, achievements } = require("./common-action");
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
  const Peeranha = await ethers.getContractFactory("Peeranha", {
    libraries: {
      PostLib: POSTLIB_ADDRESS
    }
  });
  const peeranha = await Peeranha.attach(PEERANHA_ADDRESS);
  // console.log("Posting action");
  // result = await peeranha.createUser(await getBytes32FromData(testAccount));
  // result = await peeranha.addUserRating("0x3ef542c3bdee02a4cb21aaa6587178a0a813a23d", 4, 1);
  // console.log(JSON.stringify(result))

  const initCommunity = {
    description:
      "Filecoin is an open-source cloud storage marketplace, protocol, and incentive layer",
    language: "en",
    name: "FILECOIN TEST 9",
    tags: [],
    website: "https://filecoin.io"
  };

  const CATEGORIES_FILE_NAME = "scripts/categories.json";
  const USERS_FILE_NAME = "scripts/users.json";
  const DISCUSSIONS_FILE_NAME = "scripts/discussions.json";
  const ANSWERS_FILE_NAME = "scripts/answers.json";

  const provider = new ethers.providers.InfuraProvider(
    "maticmum",
    infuraApiKey
  );

  async function uploadForumData(community) {
    const readFile = async filename => {
      return JSON.parse(await fs.promises.readFile(filename));
    };

    const writeDataToFile = (path, data) => {
      fs.writeFile(path, JSON.stringify(data), err => {
        if (err) {
          console.log(err);
        }
      });
    };

    const createCommunity = async community => {
      const categories = await readFile(CATEGORIES_FILE_NAME);

      const communityWithTags = {
        ...community,
        tags: categories.map(category => ({
          name: category.name,
          description: category.description
            ? category.description
            : "TEXT TO BE FILLED OUT"
        }))
      };

      const tags = await Promise.all(
        communityWithTags.tags.map(async x => {
          const hash = getBytes32FromData(x);

          return {
            ipfsDoc: {
              hash,
              hash2: hash
            }
          };
        })
      );

      const txObj = await peeranha.createCommunity(
        await getBytes32FromData(communityWithTags),
        tags
      );

      console.log("wait for create community tx approve");

      await ethers.provider.waitForTransaction(txObj.hash);

      console.log("community created");
    };

    const createWalletsAndUsers = async () => {
      const createAndTopUpWallet = async () => {
        const createPrivateKey = () => {
          const getHashesContainer = size =>
            Array.apply(null, { length: size }).map(
              () => "0x" + crypto.randomBytes(32).toString("hex")
            );
          return getHashesContainer(1)[0];
        };

        const createWallet = privateKey => {
          return new ethers.Wallet(privateKey, provider);
        };

        const topUpWallet = async (
          mainWallet,
          amountInEther,
          receiverAddress
        ) => {
          let tx = {
            to: receiverAddress,
            // Convert currency unit from ether to wei
            value: ethers.utils.parseEther(amountInEther)
          };

          return await mainWallet
            .sendTransaction(tx)
            .then(txObj => {
              console.log("txHash", txObj.hash);
              return txObj;
            })
            .catch(err => console.log(err));
        };

        const wallets = await ethers.getSigners();

        const mainWallet = wallets[0];

        const userPrivateKey = createPrivateKey();

        const newWallet = createWallet(userPrivateKey);

        console.log("address:", newWallet.address);
        console.log("privateKey:", newWallet.privateKey);

        const txObj = await topUpWallet(mainWallet, "0.01", newWallet.address);

        return [newWallet, txObj];
      };

      const createNewUser = async (newWallet, user) => {
        const createUser = async (wallet, user) => {
          return await peeranha
            .connect(wallet)
            .createUser(await getBytes32FromData(user));
        };

        return await createUser(newWallet, user);
      };

      const users = await readFile(USERS_FILE_NAME);

      const topUpWalletHashes = [];

      const newWallets = [];

      for (let i = 0; i < users.length; i++) {
        const walletAndTxObj = await createAndTopUpWallet();

        newWallets.push(walletAndTxObj[0]);

        topUpWalletHashes.push(walletAndTxObj[1].hash);

        console.log(`top up wallet ${i}`);
      }

      console.log("wallets top up success");

      for (let i = 0; i < topUpWalletHashes.length; i++) {
        await ethers.provider.waitForTransaction(topUpWalletHashes[i]);

        console.log(`wallet ${i} top up approve`);
      }

      console.log("wallets top up approved");

      const createUserHashes = [];

      const newWalletsAndUsers = [];

      for (let i = 0; i < users.length; i++) {
        const formattedUser = {
          displayName: users[i].name
        };

        const txObj = await createNewUser(newWallets[i], formattedUser);

        createUserHashes.push(txObj.hash);

        newWalletsAndUsers.push({
          wallet: newWallets[i],
          displayName: formattedUser.displayName
        });

        console.log(`user ${i}`);
      }

      console.log("all users created");

      for (let i = 0; i < createUserHashes.length; i++) {
        await ethers.provider.waitForTransaction(createUserHashes[i]);

        console.log(`user txobj ${i}`);
      }

      console.log("users creations approved");

      console.log("new Wallets And Users created");

      return newWalletsAndUsers;
    };

    const createPosts = async (walletsAndUsers, communityId) => {
      const tags = await readFile(CATEGORIES_FILE_NAME);

      const createPost = async (wallet, post, tagNumber, communityId) => {
        return await peeranha
          .connect(wallet)
          .createPost(
            communityId,
            await getBytes32FromData(post),
            PostTypeEnum.CommonPost,
            [tagNumber]
          );
      };

      const createPostHashes = [];

      const postsAndRepliesIds = [];

      let newPostId;

      for (let i = 1; ; i++) {
        let res = await peeranha.getPost(i);

        if (res[1] === "0x0000000000000000000000000000000000000000") {
          newPostId = i;
          break;
        }

        console.log(`existing post ${i}`);
      }

      console.log(`new post Id = ${newPostId}`);

      for (let i = 0; i < discussions.length; i++) {
        const walletAndUser = walletsAndUsers.find(
          walletAndUser =>
            walletAndUser.displayName === discussions[i].author.name
        );

        const userWallet = walletAndUser.wallet;

        const newPost = {
          title: discussions[i].title,
          content: discussions[i].content
        };

        const tagIdFromDiscussion = discussions[i].categories.id;

        const tagNumber =
          tags.map(tag => tag.id).indexOf(tagIdFromDiscussion) + 1;

        const txObj = await createPost(
          userWallet,
          newPost,
          tagNumber,
          communityId
        );

        postsAndRepliesIds.push({
          postId: newPostId,
          repliesIds: discussions[i].replies
        });

        createPostHashes.push(txObj.hash);

        console.log(`post ${newPostId}`);

        newPostId++;
      }

      for (let i = 0; i < createPostHashes.length; i++) {
        await ethers.provider.waitForTransaction(createPostHashes[i]);

        console.log(`post ${i} tx approve`);
      }

      return postsAndRepliesIds;
    };

    const createReplies = async (walletsAndUsers, postsAndRepliesIds) => {
      const createReply = async (userWallet, postId, reply) => {
        return await peeranha
          .connect(userWallet)
          .createReply(postId, 0, getBytes32FromData(reply), false);
      };

      for (let i = 0; i < postsAndRepliesIds.length; i++) {
        if (postsAndRepliesIds[i].repliesIds.length !== 0) {
          const answer = answers.find(
            answer => answer.id === postsAndRepliesIds[i].repliesIds[0]
          );

          const walletAndUser = walletsAndUsers.find(
            walletAndUser => walletAndUser.displayName === answer.author.name
          );

          const userWallet = walletAndUser.wallet;

          await createReply(userWallet, postsAndRepliesIds[i].postId, {
            content: answer.content
          });

          console.log(`reply ${i}`);
        }
      }
    };

    const discussions = await readFile(DISCUSSIONS_FILE_NAME);

    const answers = await readFile(ANSWERS_FILE_NAME);

    await createCommunity(community);

    const newWalletsAndUsers = await createWalletsAndUsers();

    writeDataToFile(
      "scripts/wallets.json",
      newWalletsAndUsers.map(walletAndUser => ({
        walletAddress: walletAndUser.wallet.address,
        walletPrivateKey: walletAndUser.wallet.privateKey,
        userName: walletAndUser.displayName
      }))
    );

    const communityId = await peeranha.getCommunitiesCount();

    const postsAndRepliesIds = await createPosts(
      newWalletsAndUsers,
      communityId
    );

    console.log("all posts created");

    await createReplies(newWalletsAndUsers, postsAndRepliesIds);

    console.log("all replies created");
  }

  await uploadForumData(initCommunity);

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
