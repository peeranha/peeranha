const delay = ms => new Promise(res => setTimeout(res, ms));
const crypto = require("crypto");

///
// to do
// connect value with change-env-values
///

async function wait(ms) {
    console.log("delay:" + ms)
    await delay(ms);
}

async function getBalance(contract, user) {
    const balance = await contract.stakeBalanceOf(user);
	return await getInt(balance);
}

async function getInt(value) {
	return await parseInt(value._hex, 16);
}

async function getAddressContract(contract) {
    const contractAddress = await contract.resolvedAddress.then((address) => {
        return address;
    });
	return contractAddress;
}

const createContract = async function () {
    const PostLib = await ethers.getContractFactory("PostLib")
    const CommunityLib = await ethers.getContractFactory("CommunityLib")
    const postLib = await PostLib.deploy();
    const communityLib = await CommunityLib.deploy();
    const Peeranha = await ethers.getContractFactory("Peeranha", {
    libraries: {
            PostLib: postLib.address,
            CommunityLib: communityLib.address,
    }
    });
    const peeranha = await Peeranha.deploy();
    await peeranha.deployed();
    await peeranha.__Peeranha_init();
    return peeranha;
};

const createContractToken = async function (peeranhaAddress) {
    const Token = await ethers.getContractFactory("PeeranhaToken");
    const token = await Token.deploy();
    await token.deployed();
    await token.initialize("token", "ecs", peeranhaAddress);
    return token;
};

const getUserReward = async function (userRating, weekRating) {
    return (userRating * coefficientToken * fraction) * poolToken / (weekRating * coefficientToken * fraction);
}

const createPeerenhaAndTokenContract = async function () {
    const PostLib = await ethers.getContractFactory("PostLib")
    const CommunityLib = await ethers.getContractFactory("CommunityLib")
    const postLib = await PostLib.deploy();
    const communityLib = await CommunityLib.deploy();
    const Peeranha = await ethers.getContractFactory("Peeranha", {
    libraries: {
            PostLib: postLib.address,
            CommunityLib: communityLib.address,
    }
    });
    const peeranha = await Peeranha.deploy();
    await peeranha.deployed();
    await peeranha.__Peeranha_init();

    const peeranhaContractAddress = await peeranha.resolvedAddress.then((value) => {
        return value;
    });

    const Token = await ethers.getContractFactory("PeeranhaToken");
    const token = await Token.deploy();
    await token.deployed();
    await token.initialize("token", "ecs", peeranhaContractAddress);

    const tokenContractAddress = await token.resolvedAddress.then((value) => {
        return value;
    });
    await peeranha.setTokenContract(tokenContractAddress);

    return { peeranha: peeranha, token: token, accountDeployed: peeranha.deployTransaction.from};
};

const getIdsContainer = (countOfCommunities) =>
    Array.apply(null, { length: countOfCommunities }).map((undefined, index) => ++index);

const getHashesContainer = (size) =>
    Array.apply(null, { length: size }).map(() => "0x" + crypto.randomBytes(32).toString("hex"));

const createTags = (countOfTags) =>
    getHashesContainer(countOfTags).map((hash) => {
        const hash2 = '0x0000000000000000000000000000000000000000000000000000000000000000';
        return {"ipfsDoc": {hash, hash2}}
    });
    
const getHashContainer = () => {
    return [
        "0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1",
        "0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82",
        "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
    ];
};

const getHash = () => "0x" + crypto.randomBytes(32).toString("hex");

const registerTwoUsers = async function (peeranha, signers, hashContainer) {
	await peeranha.connect(signers[1]).createUser(hashContainer[0]);
	await peeranha.createUser(hashContainer[1]);
}

const createUserWithAnotherRating = async function (signer, rating, peeranha, hashContainer) {
	await peeranha.connect(signer).createUser(hashContainer[0]);
	await peeranha.addUserRating(signer.address, rating, 1);
};

const getUsers = (hashes) => {
    const ipfsHash2 = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const creationTime = 0;
    const rating = 0;
    return hashes.map((hash) => {
      return [hash, ipfsHash2, rating, creationTime, []];
    })
}

const StartEnergy = 300;
const PeriodTime = 3000
const QuickReplyTime = 6000; // in milliseconds, defines at CommonLib
const deleteTime = 10000;
const coefficientToken = 10;
const weekUserReward = 100;
const fraction = (10 ** 18);
const poolToken = 1000 * fraction;
const weekRewardCoefficient = 1000;

const ratingChanges = [
	{actions: ['add', 'add'], ratings: [4, 3], results: [4, 3], weekRewards: [4 * weekRewardCoefficient, 3 * weekRewardCoefficient]},
	{actions: ['add', 'subtract less'], ratings: [4, -3], results: [1, 0], weekRewards: [1 * weekRewardCoefficient, 0]},
	{actions: ['add', 'subtract equal'], ratings: [4, -4], results: [0, 0], weekRewards: [0, 0]},
	{actions: ['add', 'subtract more'], ratings: [4, -5], results: [0, -1], weekRewards: [0, 0]},
	{actions: ['subtract', 'add less'], ratings: [-4, 3], results: [-4, -1], weekRewards: [0, 0]},
	{actions: ['subtract', 'add more'], ratings: [-4, 5], results: [-4, 1], weekRewards: [0, 1 * weekRewardCoefficient]},
	{actions: ['subtract', 'subtract'], ratings: [-4, -3], results: [-4, -7], weekRewards: [0, 0]},
];

const setReting = [
	{actions: 'positive', ratings: 4, result: 4, weekRewards: 4 * weekRewardCoefficient},
	{actions: 'positive', ratings: 1, result: 1, weekRewards: 1 * weekRewardCoefficient},
	{actions: 'negative', ratings: -1, result: -1, weekRewards: 0},
    {actions: 'negative', ratings: -4, result: -4, weekRewards: 0},
];

const ratingChangesInOneperiod = [
	{actions: ['add', 'add'], ratings: [4, 3], result: 7},
	{actions: ['add', 'subtract less'], ratings: [4, -3], result: 1},
	{actions: ['add', 'subtract equal'], ratings: [4, -4], result: 0},
	{actions: ['add', 'subtract more'], ratings: [4, -5], result: -1},
	{actions: ['subtract', 'add less'], ratings: [-4, 3], result: -1},
	{actions: ['subtract', 'add more'], ratings: [-4, 5], result: 1},
	{actions: ['subtract', 'subtract'], ratings: [-4, -3], result: -7},
];

const ratingChangesSkipPeriod = [
	{actions: ['add', 'add'], ratings: [4, 3], result: [4, 3], weekRewards: [4 * weekRewardCoefficient, 3 * weekRewardCoefficient]},
	{actions: ['add', 'subtract less'], ratings: [4, -3], result: [4, -3], weekRewards: [4 * weekRewardCoefficient, 0]},
	{actions: ['add', 'subtract equal'], ratings: [4, -4], result: [4, -4], weekRewards: [4 * weekRewardCoefficient, 0]},
	{actions: ['add', 'subtract more'], ratings: [4, -5], result: [4, -5], weekRewards: [4 * weekRewardCoefficient, 0]},
	{actions: ['subtract', 'add less'], ratings: [-4, 3], result: [-4, -1], weekRewards: [0, 0]},
	{actions: ['subtract', 'add more'], ratings: [-4, 5], result: [-4, 1], weekRewards: [0, 1 * weekRewardCoefficient]},
	{actions: ['subtract', 'subtract'], ratings: [-4, -3], result: [-4, -7], weekRewards: [0, 0]},
];

const StartRating = 10
const StartRatingWithoutAction = 0;

const PostTypeEnum = {"ExpertPost":0, "CommonPost":1, "Tutorial":2}

                                                            // energy
const energyDownVotePost = 5;
const energyDownVoteReply = 3;
const energyDownVoteComment = 2;
const energyUpvotePost = 1;
const energyUpvoteReply = 1;
const energyUpvoteComment = 1;
const energyPublicationPost = 10;
const energyPublicationReply = 6;
const energyPublicationComment = 4;
const energyUpdateProfile = 1;
const energyEditItem = 2;
const energyDeleteItem = 2;
const energyBestReply = 1;
const energyFollowCommunity = 1;
const energyForumVoteCancel = 1;
const energyCreateCommunity = 125;
const energyCreateTag = 75;
const energyArray = [
    {rating: 99, energy: 300, status: "Stranger"},
    {rating: 499, energy: 600, status: "Newbie"},
    {rating: 999, energy: 900, status: "Junior"},
    {rating: 2499, energy: 1200, status: "Resident"},
    {rating: 4999, energy: 1500, status: "Senior"},
    {rating: 9999, energy: 1800, status: "Hero"},
    {rating: 10001, energy: 2100, status: "SuperHero"},
];

                                                            // rating
//expert post 
const DownvoteExpertPost = -1;
const UpvotedExpertPost = 5;
const DownvotedExpertPost = -2;
    
//common post 
const DownvoteCommonPost = -1;
const UpvotedCommonPost = 1;
const DownvotedCommonPost = -1;

//tutorial 
const DownvoteTutorial = -1;    //autorAction
const UpvotedTutorial = 1;
const DownvotedTutorial = -1;

const DeleteOwnPost = -1;

const ModeratorDeletePost = -2;
    
//////////////////////////////////////
    
//expert reply
const DownvoteExpertReply = -1;
const UpvotedExpertReply = 10;
const DownvotedExpertReply = -2;
const AcceptExpertReply = 15;
const AcceptedExpertReply = 2;
const FirstExpertReply = 5;
const QuickExpertReply = 5;
    
//common reply 
const DownvoteCommonReply = -1;
const UpvotedCommonReply = 1;
const DownvotedCommonReply = -1;
const AcceptCommonReply = 3;
const AcceptedCommonReply = 1;
const FirstCommonReply = 1;
const QuickCommonReply = 1;

const DeleteOwnReply = -1;
        
const ModeratorDeleteReply = -2;
    
////////////////////////////////////////
const ModeratorDeleteComment = -1;


module.exports = { 
    wait, getBalance, getInt, getAddressContract, createContract, createContractToken, getUsers, getUserReward,
    getIdsContainer, getHashesContainer, createTags, getHashContainer, getHash, registerTwoUsers, createUserWithAnotherRating, createPeerenhaAndTokenContract,
    StartEnergy, PeriodTime, QuickReplyTime, deleteTime, coefficientToken, weekUserReward, StartRating, StartRatingWithoutAction, PostTypeEnum, fraction, poolToken,
    setReting, ratingChanges, ratingChangesSkipPeriod, ratingChangesInOneperiod, energyDownVotePost, energyDownVoteReply, energyDownVoteComment, energyUpvotePost, energyUpvoteReply, energyUpvoteComment,
	energyPublicationPost, energyPublicationReply, energyPublicationComment, energyUpdateProfile, energyEditItem, energyDeleteItem,
	energyBestReply, energyFollowCommunity, energyForumVoteCancel, energyCreateCommunity, energyCreateTag, energyArray,
    DownvoteExpertPost, UpvotedExpertPost, DownvotedExpertPost, DownvoteCommonPost, UpvotedCommonPost, DownvotedCommonPost,
    ModeratorDeletePost, DownvoteExpertReply, UpvotedExpertReply, DownvotedExpertReply, AcceptExpertReply, AcceptedExpertReply, 
    FirstExpertReply, QuickExpertReply, DownvoteCommonReply, UpvotedCommonReply, DownvotedCommonReply, AcceptCommonReply,
    AcceptedCommonReply, FirstCommonReply, QuickCommonReply, ModeratorDeleteReply, ModeratorDeleteComment,
    DownvoteTutorial, UpvotedTutorial, DownvotedTutorial, DeleteOwnPost, DeleteOwnReply,
};
