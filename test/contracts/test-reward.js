const { expect } = require("chai");
const crypto = require("crypto");
const { wait, getBalance } = require('./utils');

const ratingChanges = [
	{actions: ['add', 'add'], ratings: [4, 3], result: 4},
	// {actions: ['add', 'subtract less'], ratings: [4, -3], result: 1},
	// {actions: ['add', 'subtract equal'], ratings: [4, -4], result: 0},
	// {actions: ['add', 'subtract more'], ratings: [4, -5], result: 0},
	// {actions: ['subtract', 'add less'], ratings: [-4, 3], result: 0},
	// {actions: ['subtract', 'add more'], ratings: [-4, 5], result: 0},
	// {actions: ['subtract', 'subtract'], ratings: [-4, -3], result: 0},
];

const createTags = (countOfTags) =>
        getHashesContainer(countOfTags).map((hash) => {
            const hash2 = '0x0000000000000000000000000000000000000000000000000000000000000000';
            return {"ipfsDoc": {hash, hash2}}
        });
const getHashesContainer = (size) =>
        Array.apply(null, { length: size }).map(() => "0x" + crypto.randomBytes(32).toString("hex"));

describe("Test wallet", function () {

	describe("Test payout rating", function () {

		for (const {actions, ratings, result} of ratingChanges) {
			it(`Test ${actions[0]} rating in 1st period and ${actions[1]} rating in 2nt period`, async function () {
				const peeranha = await createContract();
				const hashContainer = getHashContainer();

				await peeranha.createUser(hashContainer[1]);
				await peeranha.createCommunity(hashContainer[2], createTags(5));
				console.log("Communties count:")
				console.log(await peeranha.getCommunitiesCount())
		

				await peeranha.addUserRating(peeranha.deployTransaction.from, 40, 1);
				console.log("User rating:")
				console.log(await peeranha.getUserRating(peeranha.deployTransaction.from, 1));

				await wait(periodLength);
				await peeranha.addUserRating(peeranha.deployTransaction.from, 3, 1);
				const newuserRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
				// console.log(newuserRating)
				const userRewardPerid = await peeranha.getRatingToReward(peeranha.deployTransaction.from, 0, 1);
				console.log(userRewardPerid)
				console.log("**************************");
				const userRewardPerid2 = await peeranha.getRatingToReward(peeranha.deployTransaction.from, 1, 1);
				console.log(await peeranha.getRatingToReward(peeranha.deployTransaction.from, 1, 1))
				console.log(await peeranha.getRatingToReward(peeranha.deployTransaction.from, 0, 0))
				console.log(await peeranha.getRatingToReward(peeranha.deployTransaction.from, 2, 1))
				console.log(await peeranha.getRatingToReward(peeranha.deployTransaction.from, 3, 1))
				console.log(await peeranha.getRatingToReward(peeranha.deployTransaction.from, 4, 1))
				console.log(await peeranha.getRatingToReward(peeranha.deployTransaction.from, 5, 1))
				console.log(await peeranha.getRatingToReward(peeranha.deployTransaction.from, 6, 1))
				console.log(await peeranha.getRatingToReward(peeranha.deployTransaction.from, 7, 1))
				console.log("User rating:")
				console.log(await peeranha.getUserRating(peeranha.deployTransaction.from, 1));
				console.log(userRewardPerid2)
				
				expect(userRewardPerid.ratingToReward).to.equal(0);
				expect(userRewardPerid2.ratingToReward).to.equal(result);
			});
		}

	// 	it("Test subtract rating in 1st and add rating in 2nd and 3rd periods", async function () {
	// 		const peeranha = await createContract();
	// 		const hashContainer = getHashContainer();

	// 		await peeranha.createUser(hashContainer[1]);

	// 		await peeranha.addUserRating(peeranha.deployTransaction.from, -4);
	// 		// console.log(userRating.rewardPeriods[0])
	// 		await wait(periodLength);
	// 		await peeranha.addUserRating(peeranha.deployTransaction.from, 5);
			
	// 		await wait(periodLength);
	// 		await peeranha.addUserRating(peeranha.deployTransaction.from, 3);

	// 		const newuserRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
	// 		console.log(newuserRating)
			

	// 		const userRewardPerid = await peeranha.getRatingToReward(peeranha.deployTransaction.from, newuserRating.rewardPeriods[0]);
	// 		console.log(userRewardPerid)
	// 		console.log("**************************");
	// 		const userRewardPerid2 = await peeranha.getRatingToReward(peeranha.deployTransaction.from, newuserRating.rewardPeriods[1]);
	// 		console.log(userRewardPerid2)
	// 		console.log("-----------------------");
	// 		const userRewardPerid3 = await peeranha.getRatingToReward(peeranha.deployTransaction.from, newuserRating.rewardPeriods[2]);
	// 		console.log(userRewardPerid3)

	// 		expect(userRewardPerid.ratingToReward).to.equal(0);
	// 		expect(userRewardPerid2.ratingToReward).to.equal(0);
	// 		expect(userRewardPerid3.ratingToReward).to.equal(1);
	// 	});

	// 	it("Test add rating in 1st and 3rd period", async function () {
	// 		const peeranha = await createContract();
	// 		const hashContainer = getHashContainer();

	// 		await peeranha.createUser(hashContainer[1]);

	// 		await peeranha.addUserRating(peeranha.deployTransaction.from, 5);
	// 		// console.log(userRating.rewardPeriods[0])
	// 		await wait(periodLength * 2);
	// 		await peeranha.addUserRating(peeranha.deployTransaction.from, 3);
			
			
	// 		await wait(periodLength * 2);
	// 		await peeranha.addUserRating(peeranha.deployTransaction.from, 2);


	// 		const newuserRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
	// 		console.log(newuserRating)
			

	// 		const userRewardPerid = await peeranha.getRatingToReward(peeranha.deployTransaction.from, newuserRating.rewardPeriods[0]);
	// 		console.log(userRewardPerid)
	// 		console.log("**************************");
	// 		const userRewardPerid2 = await peeranha.getRatingToReward(peeranha.deployTransaction.from, newuserRating.rewardPeriods[1]);
	// 		console.log(userRewardPerid2)
	// 		console.log("++++++++++++++++++++++++++");
	// 		const userRewardPerid3 = await peeranha.getRatingToReward(peeranha.deployTransaction.from, newuserRating.rewardPeriods[2]);
	// 		console.log(userRewardPerid3)

	// 		expect(userRewardPerid.ratingToReward).to.equal(0);
	// 		expect(userRewardPerid2.ratingToReward).to.equal(5);
	// 		expect(userRewardPerid3.ratingToReward).to.equal(3);
	// 	});
	// });

	// describe('Get reward', function(){

	// 	it("Test get reward", async function () {
	// 		const peeranha = await createContract();
	// 		const peeranhaContractAddress = await peeranha.resolvedAddress.then((value) => {
	// 			return value;
	// 		});
	// 		const token = await createContractToken(peeranhaContractAddress);
	// 		const hashContainer = getHashContainer();

	// 		await peeranha.createUser(hashContainer[1]);

	// 		await peeranha.addUserRating(peeranha.deployTransaction.from, 5);
	// 		await wait(periodLength);

	// 		await peeranha.addUserRating(peeranha.deployTransaction.from, 4);
			
	// 		await wait(periodLength);
	// 		await peeranha.addUserRating(peeranha.deployTransaction.from, 3);

	// 		const newuserRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
	// 		console.log(newuserRating);
			
	// 		const userRewardPerid2 = await peeranha.getRatingToReward(peeranha.deployTransaction.from, newuserRating.rewardPeriods[1]);

	// 		expect(userRewardPerid2.ratingToReward).to.equal(5);

	// 		await token.claimReward(newuserRating.rewardPeriods[1]);
	// 		const balance = await getBalance(token, peeranha.deployTransaction.from);
	// 		console.log(balance);

	// 		expect(balance).to.equal(userRewardPerid2.ratingToReward * coefficientToken);
	// 	});

	// 	it("Test get reward for 1st period", async function () {
	// 		const peeranha = await createContract();
	// 		const peeranhaContractAddress = await peeranha.resolvedAddress.then((value) => {
	// 			return value;
	// 		});
	// 		const token = await createContractToken(peeranhaContractAddress);
	// 		const hashContainer = getHashContainer();

	// 		await peeranha.createUser(hashContainer[1]);

	// 		await peeranha.addUserRating(peeranha.deployTransaction.from, 5);
	// 		await wait(periodLength);

	// 		await peeranha.addUserRating(peeranha.deployTransaction.from, 4);
			
	// 		const newuserRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
	// 		console.log(newuserRating)

	// 		console.log(await peeranha.getRatingToReward(peeranha.deployTransaction.from, newuserRating.rewardPeriods[0]));
	// 		console.log(await peeranha.getRatingToReward(peeranha.deployTransaction.from, newuserRating.rewardPeriods[1]));

	// 		await expect(token.claimReward(newuserRating.rewardPeriods[0]))
	// 		.to.be.revertedWith('No reward for you in this period');
	// 		expect(await getBalance(token, peeranha.deployTransaction.from)).to.eql(0);
	// 	});

	// 	it("Test get reward for the ongoing period", async function () {
	// 		const peeranha = await createContract();
	// 		const peeranhaContractAddress = await peeranha.resolvedAddress.then((value) => {
	// 			return value;
	// 		});
	// 		const token = await createContractToken(peeranhaContractAddress);
	// 		const hashContainer = getHashContainer();

	// 		await peeranha.createUser(hashContainer[1]);

	// 		await peeranha.addUserRating(peeranha.deployTransaction.from, 5);
	// 		await wait(periodLength);

	// 		await peeranha.addUserRating(peeranha.deployTransaction.from, 4);
			
	// 		const newuserRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
	// 		console.log(newuserRating);

	// 		await expect(token.claimReward(newuserRating.rewardPeriods[1]), 'Transaction was not reverted')
	// 		.to.be.revertedWith("This period isn't ended yet!");
	// 		expect(await getBalance(token, peeranha.deployTransaction.from)).to.eql(0);
	// 	}).retries(2);

	// 	it("Test get reward for undefined period", async function () {
	// 		const peeranha = await createContract();
	// 		const peeranhaContractAddress = await peeranha.resolvedAddress.then((value) => {
	// 			return value;
	// 		});
	// 		const token = await createContractToken(peeranhaContractAddress);
	// 		const hashContainer = getHashContainer();

	// 		await peeranha.createUser(hashContainer[1]);

	// 		await peeranha.addUserRating(peeranha.deployTransaction.from, 5);
	// 		await wait(periodLength);

			
	// 		const newuserRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
	// 		console.log(newuserRating)

	// 		console.log(await peeranha.getRatingToReward(peeranha.deployTransaction.from, newuserRating.rewardPeriods[0]));

	// 		await expect(token.claimReward(newuserRating.rewardPeriods[0] - 1))
	// 		.to.be.revertedWith('No reward for you in this period');
	// 		expect(await getBalance(token, peeranha.deployTransaction.from)).to.eql(0);
	// 	});

	// 	it("Test twice pick up 1 reward", async function () {
	// 		const peeranha = await createContract();
	// 		const peeranhaContractAddress = await peeranha.resolvedAddress.then((value) => {
	// 			return value;
	// 		});
	// 		const token = await createContractToken(peeranhaContractAddress);
	// 		const hashContainer = getHashContainer();

	// 		await peeranha.createUser(hashContainer[1]);

	// 		await peeranha.addUserRating(peeranha.deployTransaction.from, 5);
	// 		await wait(periodLength);

	// 		await peeranha.addUserRating(peeranha.deployTransaction.from, 4);
			
	// 		await wait(periodLength);
	// 		await peeranha.addUserRating(peeranha.deployTransaction.from, 3);

	// 		const newuserRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
	// 		console.log(newuserRating)
			

	// 		const userRewardPerid = await peeranha.getRatingToReward(peeranha.deployTransaction.from, newuserRating.rewardPeriods[0]);
	// 		const userRewardPerid2 = await peeranha.getRatingToReward(peeranha.deployTransaction.from, newuserRating.rewardPeriods[1]);
	// 		const userRewardPerid3 = await peeranha.getRatingToReward(peeranha.deployTransaction.from, newuserRating.rewardPeriods[2]);

	// 		expect(userRewardPerid.ratingToReward).to.equal(0);
	// 		expect(userRewardPerid2.ratingToReward).to.equal(5);
	// 		expect(userRewardPerid3.ratingToReward).to.equal(4);

	// 		console.log(userRewardPerid2);
	// 		console.log(newuserRating.rewardPeriods[1])

	// 		await token.claimReward(newuserRating.rewardPeriods[1]);
	// 		const balance = await getBalance(token, peeranha.deployTransaction.from);
	// 		console.log(balance);

	// 		await expect(token.claimReward(newuserRating.rewardPeriods[1])).to.be.revertedWith('You already picked up this reward.');
	// 	});
	});
	const createContract = async function () {
		const PostLib = await ethers.getContractFactory("PostLib")
		const postLib = await PostLib.deploy();
		const Peeranha = await ethers.getContractFactory("Peeranha", {
		libraries: {
				PostLib: postLib.address,
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

	const getHashContainer = () => {
		return [
			"0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1",
			"0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82",
			"0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
		];
	};

	const coefficientToken = 10;
	const periodLength = 3000;
});
