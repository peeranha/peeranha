const delay = ms => new Promise(res => setTimeout(res, ms));
const { parseEther }  = require("ethers/lib/utils");
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
    const balance = await contract.availableBalanceOf(user);
	return await getInt(balance);
}

async function getOwnerMinted(contract) {
    const ownerMinted = await contract.ownerMinted();
	return await getInt(ownerMinted);
}

async function getTotalSupply(contract) {
    const totalSupply = await contract.totalSupply();
	return await getInt(totalSupply);
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

const getUserReward = async function (userRating, periodRating) {
    return (userRating * coefficientToken * fraction) * poolToken / (periodRating * coefficientToken * fraction);
}

const createPeerenhaAndTokenContract = async function () {
    const PeeranhaNFT = await ethers.getContractFactory("PeeranhaNFT");
    // TODO: use deployProxy
    const peeranhaNFT = await PeeranhaNFT.deploy();
    await peeranhaNFT.deployed();
    const peeranhaNFTContractAddress = await peeranhaNFT.resolvedAddress.then((value) => {
        return value;
    });
    
    const PeeranhaCommunity = await ethers.getContractFactory("PeeranhaCommunity");
    // TODO: use deployProxy
    const peeranhaCommunity = await PeeranhaCommunity.deploy();
    await peeranhaCommunity.deployed();
    const peeranhaCommunityContractAddress = await peeranhaCommunity.resolvedAddress.then((value) => {
        return value;
    });

    const Token = await ethers.getContractFactory("PeeranhaToken");
    // TODO: use deployProxy
    const token = await Token.deploy();
    await token.deployed();
    const peeranhaTokenContractAddress = await token.resolvedAddress.then((value) => {
        return value;
    });
    
    const PeeranhaUser = await ethers.getContractFactory("PeeranhaUser");
    const peeranhaUser = await PeeranhaUser.deploy();
    await peeranhaUser.deployed();
    const peeranhaUserContractAddress = await peeranhaUser.resolvedAddress.then((value) => {
        return value;
    });

    const PostLib = await ethers.getContractFactory("PostLib")
    const postLib = await PostLib.deploy();

    const PeeranhaContent = await ethers.getContractFactory("PeeranhaContent", {
        libraries: {
            PostLib: postLib.address,
        }
    })
    // TODO: use deployProxy
    const peeranhaContent = await PeeranhaContent.deploy();
    await peeranhaContent.deployed();
    const peeranhaContentAddress = await peeranhaContent.resolvedAddress.then((value) => {
        return value;
    });

    
    await peeranhaUser.initialize();
    await peeranhaContent.initialize(peeranhaCommunityContractAddress, peeranhaUserContractAddress);
    await peeranhaCommunity.initialize(peeranhaUserContractAddress);
    await token.initialize("Peeranha", "PEER", peeranhaUserContractAddress, peeranhaUserContractAddress); // fix address
    await peeranhaNFT.initialize("PeeranhaNFT", "PEERNFT", peeranhaUserContractAddress, "0x56fB95C7d03E24DB7f03B246506f80145e2Ca0f8");       // fix address
    
    await peeranhaUser.setContractAddresses(peeranhaCommunityContractAddress, peeranhaContentAddress, peeranhaNFTContractAddress, peeranhaTokenContractAddress);

    return {
        peeranhaContent: peeranhaContent,
        peeranhaUser: peeranhaUser,
        peeranhaCommunity: peeranhaCommunity,
        token: token,
        peeranhaNFT: peeranhaNFT,
        accountDeployed: peeranhaContent.deployTransaction.from,
    }
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

const hashContainer = getHashContainer();

const getHash = () => "0x" + crypto.randomBytes(32).toString("hex");

const registerTwoUsers = async function (peeranhaUser, signers, hashContainer) {
	await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
	await peeranhaUser.createUser(hashContainer[1]);
}

const createUserWithAnotherRating = async function (signer, rating, peeranhaUser, hashContainer) {
	await peeranhaUser.connect(signer).createUser(hashContainer[0]);
	await peeranhaUser.addUserRating(signer.address, rating, 1);
};

const getUsers = (hashes) => {
    const ipfsHash2 = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const creationTime = 0;
    const rating = 0;
    return hashes.map((hash) => {
      return [hash, ipfsHash2, rating, creationTime, []];
    })
}

const StartEnergy = 1000;       // was 300
const PeriodTime = 6000;
const QuickReplyTime = 6000; // in milliseconds, defines at CommonLib
const deleteTime = 10000;
const coefficientToken = 10;
const periodUserReward = 100;
const fraction = (10 ** 18);
const poolToken = 1000 * fraction;
const periodRewardCoefficient = 1000;

const setRetingOnePeriod = [
	{actions: 'positive', ratings: 4, result: {ratingToReward: 4, penalty: 0}, periodRewards: 4 * periodRewardCoefficient},
	{actions: 'positive', ratings: 1, result: {ratingToReward: 1, penalty: 0}, periodRewards: 1 * periodRewardCoefficient},
	{actions: 'negative', ratings: -1, result: {ratingToReward: 0, penalty: 1}, periodRewards: 0},
    {actions: 'negative', ratings: -4, result: {ratingToReward: 0, penalty: 4}, periodRewards: 0},
];

const twiceChengeRatingIn1Period = [
	{actions: ['add', 'add'], ratings: [4, 3], result: {ratingToReward: 7, penalty: 0}, periodRewards: 7 * periodRewardCoefficient},
	{actions: ['add', 'subtract less'], ratings: [4, -3], result: {ratingToReward: 1, penalty: 0}, periodRewards: 1 * periodRewardCoefficient},
	{actions: ['add', 'subtract equal'], ratings: [4, -4], result: {ratingToReward: 0, penalty: 0}, periodRewards: 0},
	{actions: ['add', 'subtract more'], ratings: [4, -5], result: {ratingToReward: 0, penalty: 1}, periodRewards: 0},
	{actions: ['subtract', 'add less'], ratings: [-4, 3], result: {ratingToReward: 0, penalty: 1}, periodRewards: 0},
	{actions: ['subtract', 'add more'], ratings: [-4, 5], result: {ratingToReward: 1, penalty: 0}, periodRewards: 1 * periodRewardCoefficient},
	{actions: ['subtract', 'subtract'], ratings: [-4, -3], result: {ratingToReward: 0, penalty: 7}, periodRewards: 0},
];

const ratingChanges = [
	{actions: ['add', 'add'], ratings: [4, 3], results: [{ratingToReward: 4, penalty: 0}, {ratingToReward: 3, penalty: 0}], periodRewards: [4 * periodRewardCoefficient, 3 * periodRewardCoefficient]},
	{actions: ['add', 'subtract less'], ratings: [4, -3], results: [{ratingToReward: 4, penalty: 3}, {ratingToReward: 0, penalty: 0}], periodRewards: [1 * periodRewardCoefficient, 0]},
	{actions: ['add', 'subtract equal'], ratings: [4, -4], results: [{ratingToReward: 4, penalty: 4}, {ratingToReward: 0, penalty: 0}], periodRewards: [0, 0]},
	{actions: ['add', 'subtract more'], ratings: [4, -5], results: [{ratingToReward: 4, penalty: 4}, {ratingToReward: 0, penalty: 1}], periodRewards: [0, 0]},
	{actions: ['subtract', 'add less'], ratings: [-4, 3], results: [{ratingToReward: 0, penalty: 4}, {ratingToReward: 0, penalty: 1}], periodRewards: [0, 0]},
	{actions: ['subtract', 'add more'], ratings: [-4, 5], results: [{ratingToReward: 0, penalty: 4}, {ratingToReward: 1, penalty: 0}], periodRewards: [0, 1 * periodRewardCoefficient]},
	{actions: ['subtract', 'subtract'], ratings: [-4, -3], results: [{ratingToReward: 0, penalty: 4}, {ratingToReward: 0, penalty: 7}], periodRewards: [0, 0]},
];

const activeIn1st2nd3rdPeriod = [
	{actions: ['add', 'add', 'add'], ratings: [4, 3, 2], results: [{ratingToReward: 4, penalty: 0}, {ratingToReward: 3, penalty: 0}, {ratingToReward: 2, penalty: 0}], periodRewards: [4 * periodRewardCoefficient, 3 * periodRewardCoefficient, 2 * periodRewardCoefficient]},
	{actions: ['add', 'add', 'subtract less'], ratings: [4, 3, -2], results: [{ratingToReward: 4, penalty: 0}, {ratingToReward: 3, penalty: 2}, {ratingToReward: 0, penalty: 0}], periodRewards: [4 * periodRewardCoefficient, 1 * periodRewardCoefficient, 0]},
	{actions: ['add', 'add', 'subtract equal'], ratings: [4, 3, -3], results: [{ratingToReward: 4, penalty: 0}, {ratingToReward: 3, penalty: 3}, {ratingToReward: 0, penalty: 0}], periodRewards: [4 * periodRewardCoefficient, 0, 0]},
	{actions: ['add', 'add', 'subtract equal2'], ratings: [4, 3, -7], results: [{ratingToReward: 4, penalty: 0}, {ratingToReward: 3, penalty: 3}, {ratingToReward: 0, penalty: 4}], periodRewards: [4 * periodRewardCoefficient, 0, 0]},
	{actions: ['add', 'add', 'subtract less2'], ratings: [4, 3, -6], results: [{ratingToReward: 4, penalty: 0}, {ratingToReward: 3, penalty: 3}, {ratingToReward: 0, penalty: 3}], periodRewards: [4 * periodRewardCoefficient, 0, 0]},
	{actions: ['add', 'add', 'subtract more'], ratings: [4, 3, -10], results: [{ratingToReward: 4, penalty: 0}, {ratingToReward: 3, penalty: 3}, {ratingToReward: 0, penalty: 7}], periodRewards: [4 * periodRewardCoefficient, 0, 0]},


    {actions: ['add', 'subtract less', 'add less'], ratings: [4, -3, 1], results: [{ratingToReward: 4, penalty: 3}, {ratingToReward: 0, penalty: 0}, {ratingToReward: 1, penalty: 0}], periodRewards: [1 * periodRewardCoefficient, 0, 1 * periodRewardCoefficient]},
    {actions: ['add', 'subtract less', 'add equal'], ratings: [4, -3, 3], results: [{ratingToReward: 4, penalty: 3}, {ratingToReward: 0, penalty: 0}, {ratingToReward: 3, penalty: 0}], periodRewards: [1 * periodRewardCoefficient, 0, 3 * periodRewardCoefficient]},
    {actions: ['add', 'subtract less', 'add more'], ratings: [4, -3, 4], results: [{ratingToReward: 4, penalty: 3}, {ratingToReward: 0, penalty: 0}, {ratingToReward: 4, penalty: 0}], periodRewards: [1 * periodRewardCoefficient, 0, 4 * periodRewardCoefficient]},
    {actions: ['add', 'subtract less', 'subtract less'], ratings: [4, -2, -1], results: [{ratingToReward: 4, penalty: 2}, {ratingToReward: 0, penalty: 0}, {ratingToReward: 0, penalty: 1}], periodRewards: [2 * periodRewardCoefficient, 0, 0]},
    {actions: ['add', 'subtract less', 'subtract equal'], ratings: [4, -2, -2], results: [{ratingToReward: 4, penalty: 2}, {ratingToReward: 0, penalty: 0}, {ratingToReward: 0, penalty: 2}], periodRewards: [2 * periodRewardCoefficient, 0, 0]},
    {actions: ['add', 'subtract less', 'subtract more'], ratings: [4, -2, -5], results: [{ratingToReward: 4, penalty: 2}, {ratingToReward: 0, penalty: 0}, {ratingToReward: 0, penalty: 5}], periodRewards: [2 * periodRewardCoefficient, 0, 0]},


    {actions: ['add', 'subtract equal', 'add less'], ratings: [4, -4, 2], results: [{ratingToReward: 4, penalty: 4}, {ratingToReward: 0, penalty: 0}, {ratingToReward: 2, penalty: 0}], periodRewards: [0, 0, 2 * periodRewardCoefficient]},
    {actions: ['add', 'subtract equal', 'add equal'], ratings: [4, -4, 4], results: [{ratingToReward: 4, penalty: 4}, {ratingToReward: 0, penalty: 0}, {ratingToReward: 4, penalty: 0}], periodRewards: [0, 0, 4 * periodRewardCoefficient]},
    {actions: ['add', 'subtract equal', 'add more'], ratings: [4, -4, 6], results: [{ratingToReward: 4, penalty: 4}, {ratingToReward: 0, penalty: 0}, {ratingToReward: 6, penalty: 0}], periodRewards: [0, 0, 6 * periodRewardCoefficient]},
    {actions: ['add', 'subtract equal', 'subtract less'], ratings: [4, -4, -1], results: [{ratingToReward: 4, penalty: 4}, {ratingToReward: 0, penalty: 0}, {ratingToReward: 0, penalty: 1}], periodRewards: [0, 0, 0]},
    {actions: ['add', 'subtract equal', 'subtract equal'], ratings: [4, -4, -4], results: [{ratingToReward: 4, penalty: 4}, {ratingToReward: 0, penalty: 0}, {ratingToReward: 0, penalty: 4}], periodRewards: [0, 0, 0]},
    {actions: ['add', 'subtract equal', 'subtract more'], ratings: [4, -4, -6], results: [{ratingToReward: 4, penalty: 4}, {ratingToReward: 0, penalty: 0}, {ratingToReward: 0, penalty: 6}], periodRewards: [0, 0, 0]},


    {actions: ['add', 'subtract more', 'add less'], ratings: [4, -6, 1], results: [{ratingToReward: 4, penalty: 4}, {ratingToReward: 0, penalty: 2}, {ratingToReward: 0, penalty: 1}], periodRewards: [0, 0, 0]},
    {actions: ['add', 'subtract more', 'add equal'], ratings: [4, -6, 6], results: [{ratingToReward: 4, penalty: 4}, {ratingToReward: 0, penalty: 2}, {ratingToReward: 4, penalty: 0}], periodRewards: [0, 0, 4 * periodRewardCoefficient]},
    {actions: ['add', 'subtract more', 'add more'], ratings: [4, -6, 8], results: [{ratingToReward: 4, penalty: 4}, {ratingToReward: 0, penalty: 2}, {ratingToReward: 6, penalty: 0}], periodRewards: [0, 0, 6 * periodRewardCoefficient]},
    {actions: ['add', 'subtract more', 'subtract less'], ratings: [4, -6, -1], results: [{ratingToReward: 4, penalty: 4}, {ratingToReward: 0, penalty: 2}, {ratingToReward: 0, penalty: 3}], periodRewards: [0, 0, 0]},
    {actions: ['add', 'subtract more', 'subtract more'], ratings: [4, -6, -10], results: [{ratingToReward: 4, penalty: 4}, {ratingToReward: 0, penalty: 2}, {ratingToReward: 0, penalty: 12}], periodRewards: [0, 0, 0]},
	
    
    // {actions: ['subtract', 'add less'], ratings: [-4, 3], results: [{ratingToReward: 0, penalty: 4}, {ratingToReward: 0, penalty: 1}], periodRewards: [0, 0]},
	
    
    // {actions: ['subtract', 'add more'], ratings: [-4, 5], results: [{ratingToReward: 0, penalty: 4}, {ratingToReward: 1, penalty: 0}], periodRewards: [0, 1 * periodRewardCoefficient]},
	// {actions: ['subtract', 'subtract'], ratings: [-4, -3], results: [{ratingToReward: 0, penalty: 4}, {ratingToReward: 0, penalty: 7}], periodRewards: [0, 0]},
];

const twiceChengeRatingIn2NDPeriod = [
	{actions: ['add', 'add', 'add'], ratings: [4, 3, 2], results: [{ratingToReward: 4, penalty: 0}, {ratingToReward: 5, penalty: 0}], periodRewards: [4 * periodRewardCoefficient, 5 * periodRewardCoefficient]},
	{actions: ['add', 'add', 'subtract less'], ratings: [4, 3, -2], results: [{ratingToReward: 4, penalty: 0}, {ratingToReward: 1, penalty: 0}], periodRewards: [4 * periodRewardCoefficient, 1 * periodRewardCoefficient]},
	{actions: ['add', 'add', 'subtract equal'], ratings: [4, 3, -3], results: [{ratingToReward: 4, penalty: 0}, {ratingToReward: 0, penalty: 0}], periodRewards: [4 * periodRewardCoefficient, 0]},
	{actions: ['add', 'add', 'subtract more'], ratings: [4, 3, -4], results: [{ratingToReward: 4, penalty: 1}, {ratingToReward: 0, penalty: 0}], periodRewards: [3 * periodRewardCoefficient, 0]},
	{actions: ['add', 'add', 'subtract more2'], ratings: [4, 3, -7], results: [{ratingToReward: 4, penalty: 4}, {ratingToReward: 0, penalty: 0}], periodRewards: [0, 0]},
	{actions: ['add', 'add', 'subtract more2'], ratings: [4, 3, -8], results: [{ratingToReward: 4, penalty: 4}, {ratingToReward: 0, penalty: 1}], periodRewards: [0, 0]},
    

    {actions: ['add', 'subtract less', 'add less'], ratings: [4, -2, 1], results: [{ratingToReward: 4, penalty: 1}, {ratingToReward: 0, penalty: 0}], periodRewards: [3 * periodRewardCoefficient, 0]},
    {actions: ['add', 'subtract less', 'add equal'], ratings: [4, -2, 2], results: [{ratingToReward: 4, penalty: 0}, {ratingToReward: 0, penalty: 0}], periodRewards: [4 * periodRewardCoefficient, 0]},
    {actions: ['add', 'subtract less', 'add more'], ratings: [4, -2, 5], results: [{ratingToReward: 4, penalty: 0}, {ratingToReward: 3, penalty: 0}], periodRewards: [4 * periodRewardCoefficient, 3 * periodRewardCoefficient]},
    {actions: ['add', 'subtract less', 'subtract less'], ratings: [4, -2, -1], results: [{ratingToReward: 4, penalty: 3}, {ratingToReward: 0, penalty: 0}], periodRewards: [1 * periodRewardCoefficient, 0]},
    {actions: ['add', 'subtract less', 'subtract equal'], ratings: [4, -2, -2], results: [{ratingToReward: 4, penalty: 4}, {ratingToReward: 0, penalty: 0}], periodRewards: [0, 0]},
    {actions: ['add', 'subtract less', 'subtract more'], ratings: [4, -2, -3], results: [{ratingToReward: 4, penalty: 4}, {ratingToReward: 0, penalty: 1}], periodRewards: [0, 0]},
    {actions: ['add', 'subtract less', 'subtract more'], ratings: [4, -2, -5], results: [{ratingToReward: 4, penalty: 4}, {ratingToReward: 0, penalty: 3}], periodRewards: [0, 0]},


    {actions: ['add', 'subtract equal', 'add less'], ratings: [4, -4, 3], results: [{ratingToReward: 4, penalty: 1}, {ratingToReward: 0, penalty: 0}], periodRewards: [3 * periodRewardCoefficient, 0]},
    {actions: ['add', 'subtract equal', "add equal"], ratings: [4, -4, 4], results: [{ratingToReward: 4, penalty: 0}, {ratingToReward: 0, penalty: 0}], periodRewards: [4 * periodRewardCoefficient, 0]},
    {actions: ['add', 'subtract equal', "add more"], ratings: [4, -4, 5], results: [{ratingToReward: 4, penalty: 0}, {ratingToReward: 1, penalty: 0}], periodRewards: [4 * periodRewardCoefficient, 1 * periodRewardCoefficient]},
    {actions: ['add', 'subtract equal', "subtract"], ratings: [4, -4, -2], results: [{ratingToReward: 4, penalty: 4}, {ratingToReward: 0, penalty: 2}], periodRewards: [0, 0]},
	
    
    {actions: ['add', 'subtract more', 'add less'], ratings: [4, -6, 1], results: [{ratingToReward: 4, penalty: 3}, {ratingToReward: 0, penalty: 2}], periodRewards: [1 * periodRewardCoefficient, 0]},
    {actions: ['add', 'subtract more', 'add less2'], ratings: [4, -6, 3], results: [{ratingToReward: 4, penalty: 1}, {ratingToReward: 0, penalty: 2}], periodRewards: [3 * periodRewardCoefficient, 0]},
    {actions: ['add', 'subtract more', 'add equal'], ratings: [4, -6, 6], results: [{ratingToReward: 4, penalty: 0}, {ratingToReward: 0, penalty: 0}], periodRewards: [4 * periodRewardCoefficient, 0]},
    {actions: ['add', 'subtract more', 'add more'], ratings: [4, -6, 7], results: [{ratingToReward: 4, penalty: 0}, {ratingToReward: 1, penalty: 0}], periodRewards: [4 * periodRewardCoefficient, 1 * periodRewardCoefficient]},
    {actions: ['add', 'subtract more', 'subtract'], ratings: [4, -6, -1], results: [{ratingToReward: 4, penalty: 4}, {ratingToReward: 0, penalty: 3}], periodRewards: [0, 0]},
	
    
    {actions: ['subtract', 'add less', 'add less'], ratings: [-5, 3, 1], results: [{ratingToReward: 0, penalty: 5}, {ratingToReward: 0, penalty: 1}], periodRewards: [0, 0]},
    {actions: ['subtract', 'add less', 'add equal'], ratings: [-5, 3, 2], results: [{ratingToReward: 0, penalty: 5}, {ratingToReward: 0, penalty: 0}], periodRewards: [0, 0]},
    {actions: ['subtract', 'add less', 'add more'], ratings: [-5, 3, 4], results: [{ratingToReward: 0, penalty: 5}, {ratingToReward: 2, penalty: 0}], periodRewards: [0, 2 * periodRewardCoefficient]},
    {actions: ['subtract', 'add less', 'subtract less'], ratings: [-5, 3, -1], results: [{ratingToReward: 0, penalty: 5}, {ratingToReward: 0, penalty: 3}], periodRewards: [0, 0]},
    {actions: ['subtract', 'add less', 'subtract equal'], ratings: [-5, 3, -3], results: [{ratingToReward: 0, penalty: 5}, {ratingToReward: 0, penalty: 5}], periodRewards: [0, 0]},
    {actions: ['subtract', 'add less', 'subtract more'], ratings: [-5, 3, -6], results: [{ratingToReward: 0, penalty: 5}, {ratingToReward: 0, penalty: 8}], periodRewards: [0, 0]},
	
    
    {actions: ['subtract', 'add more', 'add'], ratings: [-4, 6, 2], results: [{ratingToReward: 0, penalty: 4}, {ratingToReward: 4, penalty: 0}], periodRewards: [0, 4 * periodRewardCoefficient]},
    {actions: ['subtract', 'add more', 'subtract less'], ratings: [-4, 6, -1], results: [{ratingToReward: 0, penalty: 4}, {ratingToReward: 1, penalty: 0}], periodRewards: [0, 1 * periodRewardCoefficient]},
    {actions: ['subtract', 'add more', 'subtract equal'], ratings: [-4, 6, -2], results: [{ratingToReward: 0, penalty: 4}, {ratingToReward: 0, penalty: 0}], periodRewards: [0, 0]},
    {actions: ['subtract', 'add more', 'subtract more'], ratings: [-4, 6, -4], results: [{ratingToReward: 0, penalty: 4}, {ratingToReward: 0, penalty: 2}], periodRewards: [0, 0]},
    {actions: ['subtract', 'add more', 'subtract more2'], ratings: [-4, 6, -7], results: [{ratingToReward: 0, penalty: 4}, {ratingToReward: 0, penalty: 5}], periodRewards: [0, 0]},
	
    
    {actions: ['subtract', 'subtract', 'subtract'], ratings: [-4, -3, -2], results: [{ratingToReward: 0, penalty: 4}, {ratingToReward: 0, penalty: 9}], periodRewards: [0, 0]},
    {actions: ['subtract', 'subtract', 'add less'], ratings: [-4, -3, 2], results: [{ratingToReward: 0, penalty: 4}, {ratingToReward: 0, penalty: 5}], periodRewards: [0, 0]},
    {actions: ['subtract', 'subtract', 'add less 2'], ratings: [-4, -3, 3], results: [{ratingToReward: 0, penalty: 4}, {ratingToReward: 0, penalty: 4}], periodRewards: [0, 0]},
    {actions: ['subtract', 'subtract', 'add equal'], ratings: [-4, -3, 7], results: [{ratingToReward: 0, penalty: 4}, {ratingToReward: 0, penalty: 0}], periodRewards: [0, 0]},
    {actions: ['subtract', 'subtract', 'add more'], ratings: [-4, -3, 9], results: [{ratingToReward: 0, penalty: 4}, {ratingToReward: 2, penalty: 0}], periodRewards: [0, 2 * periodRewardCoefficient]},
];

const ratingChangesSkipPeriod = [
	{actions: ['add', 'add'], ratings: [4, 3], results: [{ratingToReward: 4, penalty: 0}, {ratingToReward: 3, penalty: 0}], periodRewards: [4 * periodRewardCoefficient, 3 * periodRewardCoefficient]},
	{actions: ['add', 'subtract less'], ratings: [4, -3], results: [{ratingToReward: 4, penalty: 0}, {ratingToReward: 0, penalty: 3}], periodRewards: [4 * periodRewardCoefficient, 0]},
	{actions: ['add', 'subtract equal'], ratings: [4, -4], results: [{ratingToReward: 4, penalty: 0}, {ratingToReward: 0, penalty: 4}], periodRewards: [4 * periodRewardCoefficient, 0]},
	{actions: ['add', 'subtract more'], ratings: [4, -5], results: [{ratingToReward: 4, penalty: 0}, {ratingToReward: 0, penalty: 5}], periodRewards: [4 * periodRewardCoefficient, 0]},
	{actions: ['subtract', 'add less'], ratings: [-4, 3], results: [{ratingToReward: 0, penalty: 4}, {ratingToReward: 0, penalty: 1}], periodRewards: [0, 0]},
	{actions: ['subtract', 'add more'], ratings: [-4, 5], results: [{ratingToReward: 0, penalty: 4}, {ratingToReward: 1, penalty: 0}], periodRewards: [0, 1 * periodRewardCoefficient]},
	{actions: ['subtract', 'subtract'], ratings: [-4, -3], results: [{ratingToReward: 0, penalty: 4}, {ratingToReward: 0, penalty: 7}], periodRewards: [0, 0]},
];

const StartRating = 10
const StartRatingWithoutAction = 0;

const PostTypeEnum = {"ExpertPost":0, "CommonPost":1, "Tutorial":2, "FAQ": 3}

                                                            // energy
const energyDownVotePost = 5;
const energyDownVoteReply = 3;
const energyVoteComment = 1;
const energyUpvotePost = 1;
const energyUpvoteReply = 1;
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
const UpvotedTutorial = 5;
const DownvotedTutorial = -2;

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
    wait, getBalance, getOwnerMinted, getTotalSupply, getInt, getAddressContract, createContract, createContractToken, getUsers, getUserReward, parseEther,
    getIdsContainer, getHashesContainer, createTags, getHashContainer, hashContainer, getHash, registerTwoUsers, createUserWithAnotherRating, createPeerenhaAndTokenContract,
    periodRewardCoefficient, StartEnergy, PeriodTime, QuickReplyTime, deleteTime, coefficientToken, periodUserReward, StartRating, StartRatingWithoutAction, PostTypeEnum, fraction, poolToken,
    setRetingOnePeriod, ratingChanges, ratingChangesSkipPeriod, twiceChengeRatingIn1Period, activeIn1st2nd3rdPeriod, twiceChengeRatingIn2NDPeriod, energyDownVotePost, energyDownVoteReply, energyVoteComment, energyUpvotePost, energyUpvoteReply,
	energyPublicationPost, energyPublicationReply, energyPublicationComment, energyUpdateProfile, energyEditItem, energyDeleteItem,
	energyBestReply, energyFollowCommunity, energyForumVoteCancel, energyCreateCommunity, energyCreateTag, energyArray,
    DownvoteExpertPost, UpvotedExpertPost, DownvotedExpertPost, DownvoteCommonPost, UpvotedCommonPost, DownvotedCommonPost,
    ModeratorDeletePost, DownvoteExpertReply, UpvotedExpertReply, DownvotedExpertReply, AcceptExpertReply, AcceptedExpertReply, 
    FirstExpertReply, QuickExpertReply, DownvoteCommonReply, UpvotedCommonReply, DownvotedCommonReply, AcceptCommonReply,
    AcceptedCommonReply, FirstCommonReply, QuickCommonReply, ModeratorDeleteReply, ModeratorDeleteComment,
    DownvoteTutorial, UpvotedTutorial, DownvotedTutorial, DeleteOwnPost, DeleteOwnReply,
};
