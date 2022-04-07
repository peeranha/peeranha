const { ethers } = require("hardhat");
const { create } = require("ipfs-http-client");
const bs58 = require("bs58");
const {
  IPFS_API_URL,
  PEERANHA_ADDRESS,
  POSTLIB_ADDRESS,
  COMMUNITYLIB_ADDRESS,
  IPFS_API_URL_THE_GRAPH,
  infuraApiKey
} = require("../env.json");
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

async function getBytes32FromData(data) {
  const ipfsHash = await saveText(JSON.stringify(data));
  console.log("Uploaded file to IPFS - " + ipfsHash);
  return getBytes32FromIpfsHash(ipfsHash);
}

async function main() {
  const Peeranha = await ethers.getContractFactory("Peeranha", {
    libraries: {
      PostLib: POSTLIB_ADDRESS,
      CommunityLib: COMMUNITYLIB_ADDRESS,
    }
  });
  const peeranha = await Peeranha.attach(PEERANHA_ADDRESS);

  const initCommunity = {
    description:
      "Polygon is a decentralised Ethereum scaling platform that enables developers to build scalable user-friendly dApps with low transaction fees without ever sacrificing on security.",
    language: "en",
    name: "Polygon",
    tags: [],
    website: "https://polygon.technology/"
  };

  const CATEGORIES_FILE_NAME = "scripts/categories.json";
  const USERS_FILE_NAME = "scripts/users.json";
  const DISCUSSIONS_FILE_NAME = "scripts/discussions.json";
  const ANSWERS_FILE_NAME = "scripts/answers.json";

  const provider = ethers.providers.getDefaultProvider(
    'https://rpc-mumbai.maticvigil.com'
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
          description: `Questions related to ${category.name}`
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

          return await mainWallet.sendTransaction(tx);
        };

        const wallets = await ethers.getSigners();

        const mainWallet = wallets[0];

        const userPrivateKey = createPrivateKey();

        const newWallet = createWallet(userPrivateKey);

        console.log("address:", newWallet.address);
        console.log("privateKey:", newWallet.privateKey);

        const txObj = await runWithRetry(() => topUpWallet(mainWallet, "0.01", newWallet.address));

        return [newWallet, txObj];
      };

      const createNewUser = async (newWallet, user) => {
        const createUser = async (wallet, user) => {
          return await peeranha
            .connect(wallet)
            .createUser(await getBytes32FromData(user));
        };

        return await runWithRetry(() => createUser(newWallet, user));
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
            wallet.address,
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

        const txObj = await runWithRetry(() => createPost(
          userWallet,
          newPost,
          tagNumber,
          communityId
        ));

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
        console.log(`Reply from ${userWallet.address}`);
        return await peeranha
          .connect(userWallet)
          .createReply(userWallet.address, postId, 0, getBytes32FromData(reply), false);
      };

      for (let i = 0; i < postsAndRepliesIds.length; i++) {
        // if (i < 165) {
        //   continue;
        // }

        if (postsAndRepliesIds[i].repliesIds.length !== 0) {
          const answer = answers.find(
            answer => answer.id === postsAndRepliesIds[i].repliesIds[0]
          );

          if(!answer) {
            continue;
          }

          const walletAndUser = walletsAndUsers.find(
            walletAndUser => walletAndUser.displayName === answer.author.name
          );

          if(!walletAndUser) {
            continue;
          }

          const userWallet = walletAndUser.wallet;

          await runWithRetry(() => createReply(userWallet, postsAndRepliesIds[i].postId, {
            content: answer.content
          }));

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

    // const wallets = await readFile("scripts/wallets.json");

    // const newWalletsAndUsers = wallets.map(item => ({
    //   wallet: new ethers.Wallet(item.walletPrivateKey, provider),
    //   displayName: item.userName
    // }))

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
}

async function runWithRetry(func) {
  let iteration = 0;
  while(iteration < 3) {
    try
    {
      return await func();
    } catch(err) {
      console.log(`Retrying after error: ${err}`);
      await new Promise(r => setTimeout(r, 3000));
      iteration++;
    }
  }
  throw new Error('Failed after 3 retries');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
