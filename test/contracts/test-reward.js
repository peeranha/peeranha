const { expect } = require("chai");
const { wait, getBalance } = require('./utils');


describe("Test vote", function () {
	// it("Test add rating in 3 periods", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();

	// 	await peeranha.createUser(hashContainer[1]);

	// 	await peeranha.addUserRating(peeranha.deployTransaction.from, 5);
	// 	// console.log(userRating.rewardPerids[0])
	// 	await wait(3000);

	// 	await peeranha.addUserRating(peeranha.deployTransaction.from, 4);
		
	// 	await wait(3000);
	// 	await peeranha.addUserRating(peeranha.deployTransaction.from, 3);

	// 	const newuserRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
	// 	console.log(newuserRating)
		

	// 	const userRewardPerid = await peeranha.getUserRewardPerid(peeranha.deployTransaction.from, newuserRating.rewardPerids[0]);
	// 	console.log(userRewardPerid)
	// 	console.log("**************************");
	// 	const userRewardPerid2 = await peeranha.getUserRewardPerid(peeranha.deployTransaction.from, newuserRating.rewardPerids[1]);
	// 	console.log(userRewardPerid2)
	// 	console.log("-----------------------");
	// 	const userRewardPerid3 = await peeranha.getUserRewardPerid(peeranha.deployTransaction.from, newuserRating.rewardPerids[2]);
	// 	console.log(userRewardPerid3)

	// 	await expect(userRewardPerid.ratingToAward).to.equal(0);
	// 	await expect(userRewardPerid2.ratingToAward).to.equal(5);
	// 	await expect(userRewardPerid3.ratingToAward).to.equal(4);
	// });

	// it("Test add rating in 1 and 3 period", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();

	// 	await peeranha.createUser(hashContainer[1]);

	// 	await peeranha.addUserRating(peeranha.deployTransaction.from, 5);
	// 	// console.log(userRating.rewardPerids[0])
	// 	await wait(3000);
	// 	await wait(3000);
	// 	await peeranha.addUserRating(peeranha.deployTransaction.from, 3);
		
		
	// 	await wait(6000);
	// 	await peeranha.addUserRating(peeranha.deployTransaction.from, 2);


	// 	const newuserRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
	// 	console.log(newuserRating)
		

	// 	const userRewardPerid = await peeranha.getUserRewardPerid(peeranha.deployTransaction.from, newuserRating.rewardPerids[0]);
	// 	console.log(userRewardPerid)
	// 	console.log("**************************");
	// 	const userRewardPerid2 = await peeranha.getUserRewardPerid(peeranha.deployTransaction.from, newuserRating.rewardPerids[1]);
	// 	console.log(userRewardPerid2)
	// 	console.log("++++++++++++++++++++++++++");
	// 	const userRewardPerid3 = await peeranha.getUserRewardPerid(peeranha.deployTransaction.from, newuserRating.rewardPerids[2]);
	// 	console.log(userRewardPerid3)

	// 	await expect(userRewardPerid.ratingToAward).to.equal(0);
	// 	await expect(userRewardPerid2.ratingToAward).to.equal(5);
	// 	await expect(userRewardPerid3.ratingToAward).to.equal(3);
	// });

	// it("Test subtract rating in 3 periods", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();

	// 	await peeranha.createUser(hashContainer[1]);

	// 	await peeranha.addUserRating(peeranha.deployTransaction.from, 5);
	// 	await wait(3000);

	// 	await peeranha.addUserRating(peeranha.deployTransaction.from, 4);
		
	// 	await wait(3000);
	// 	await peeranha.addUserRating(peeranha.deployTransaction.from, -3);

	// 	const newuserRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
	// 	console.log(newuserRating)
		

	// 	const userRewardPerid = await peeranha.getUserRewardPerid(peeranha.deployTransaction.from, newuserRating.rewardPerids[0]);
	// 	console.log(userRewardPerid)
	// 	console.log("**************************");
	// 	const userRewardPerid2 = await peeranha.getUserRewardPerid(peeranha.deployTransaction.from, newuserRating.rewardPerids[1]);
	// 	console.log(userRewardPerid2)
	// 	console.log("-----------------------");
	// 	const userRewardPerid3 = await peeranha.getUserRewardPerid(peeranha.deployTransaction.from, newuserRating.rewardPerids[2]);
	// 	console.log(userRewardPerid3)

	// 	await expect(userRewardPerid.ratingToAward).to.equal(0);
	// 	await expect(userRewardPerid2.ratingToAward).to.equal(5);
	// 	await expect(userRewardPerid3.ratingToAward).to.equal(1);
	// });

	it("Test get reward", async function () {
		const peeranha = await createContract();
		const token = await createContractToken();
		const hashContainer = getHashContainer();

		await peeranha.createUser(hashContainer[1]);

		await peeranha.addUserRating(peeranha.deployTransaction.from, 5);
		await wait(3000);

		await peeranha.addUserRating(peeranha.deployTransaction.from, 4);
		
		await wait(3000);
		await peeranha.addUserRating(peeranha.deployTransaction.from, 3);

		const newuserRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		console.log(newuserRating)
		

		const userRewardPerid = await peeranha.getUserRewardPerid(peeranha.deployTransaction.from, newuserRating.rewardPerids[0]);
		const userRewardPerid2 = await peeranha.getUserRewardPerid(peeranha.deployTransaction.from, newuserRating.rewardPerids[1]);
		const userRewardPerid3 = await peeranha.getUserRewardPerid(peeranha.deployTransaction.from, newuserRating.rewardPerids[2]);

		await expect(userRewardPerid.ratingToAward).to.equal(0);
		await expect(userRewardPerid2.ratingToAward).to.equal(5);
		await expect(userRewardPerid3.ratingToAward).to.equal(4);

		await token.getRewardd(newuserRating.rewardPerids[1]);
		const balance = await getBalance(token);
		console.log(balance);
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

	const createContractToken = async function () {
		const Token = await ethers.getContractFactory("ERC20Basic");
		const token = await Token.deploy();
		await token.deployed();
        await token.initialize("token", "ecs");
		return token;
	};

	const getHashContainer = () => {
		return [
			"0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1",
			"0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82",
			"0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
		];
	};
});
