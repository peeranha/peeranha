const { expect } = require("chai");
const {
	wait, getBalance, createContract, createContractToken, getHashContainer, coefficientToken , PeriodTime, fraction, ratingChanges,
} = require('./utils');

///
// to do: active users
// active in 2 community
///

describe("Test wallet", function () {

	describe("Test payout rating", function () {

		for (const {actions, ratings, result} of ratingChanges) {
			it(`Test ${actions[0]} rating in 1st period and ${actions[1]} rating in 2nt period`, async function () {
				const peeranha = await createContract();
				const hashContainer = getHashContainer();
		
				await peeranha.createUser(hashContainer[1]);
		
				await peeranha.addUserRating(peeranha.deployTransaction.from, ratings[0], 1);
				
				await wait(PeriodTime);
				await peeranha.addUserRating(peeranha.deployTransaction.from, ratings[1], 1);
		
				const rewardPeriods = await peeranha.getAcctiveUserPeriods(peeranha.deployTransaction.from)
				console.log(rewardPeriods)
				
				const userRewardPerid = await peeranha.getRatingToReward(peeranha.deployTransaction.from, rewardPeriods[0], 1);
				console.log(userRewardPerid)
				console.log("**************************");
				const userRewardPerid2 = await peeranha.getRatingToReward(peeranha.deployTransaction.from, rewardPeriods[1], 1);
				console.log(userRewardPerid2)
				
				expect(userRewardPerid).to.equal(0);
				expect(userRewardPerid2).to.equal(result);
			});
		}

		it("Test subtract rating in 1st and add rating in 2nd and 3rd periods", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();

			await peeranha.createUser(hashContainer[1]);

			await peeranha.addUserRating(peeranha.deployTransaction.from, -4, 1);
			// console.log(userRating.rewardPeriods[0])
			await wait(PeriodTime);
			await peeranha.addUserRating(peeranha.deployTransaction.from, 5, 1);
			
			await wait(PeriodTime);
			await peeranha.addUserRating(peeranha.deployTransaction.from, 3, 1);

			const rewardPeriods = await peeranha.getAcctiveUserPeriods(peeranha.deployTransaction.from)
			console.log(rewardPeriods)

			const userRewardPerid = await peeranha.getRatingToReward(peeranha.deployTransaction.from, rewardPeriods[0], 1);
			console.log(userRewardPerid)
			console.log("**************************");
			const userRewardPerid2 = await peeranha.getRatingToReward(peeranha.deployTransaction.from, rewardPeriods[1], 1);
			console.log(userRewardPerid2)
			console.log("-----------------------");
			const userRewardPerid3 = await peeranha.getRatingToReward(peeranha.deployTransaction.from, rewardPeriods[2], 1);
			console.log(userRewardPerid3)

			expect(userRewardPerid).to.equal(0);
			expect(userRewardPerid2).to.equal(0);
			expect(userRewardPerid3).to.equal(1);
		});

		it("Test add rating in 1st and 3rd period", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();

			await peeranha.createUser(hashContainer[1]);

			await peeranha.addUserRating(peeranha.deployTransaction.from, 5, 1);
			// console.log(userRating.rewardPeriods[0])
			await wait(PeriodTime * 2);
			await peeranha.addUserRating(peeranha.deployTransaction.from, 3, 1);
			
			
			await wait(PeriodTime * 2);
			await peeranha.addUserRating(peeranha.deployTransaction.from, 2, 1);

			const rewardPeriods = await peeranha.getAcctiveUserPeriods(peeranha.deployTransaction.from)

			const userRewardPerid = await peeranha.getRatingToReward(peeranha.deployTransaction.from, rewardPeriods[0], 1);
			console.log(userRewardPerid)
			console.log("**************************");
			const userRewardPerid2 = await peeranha.getRatingToReward(peeranha.deployTransaction.from, rewardPeriods[1], 1);
			console.log(userRewardPerid2)
			console.log("++++++++++++++++++++++++++");
			const userRewardPerid3 = await peeranha.getRatingToReward(peeranha.deployTransaction.from, rewardPeriods[2], 1);
			console.log(userRewardPerid3)

			expect(userRewardPerid).to.equal(0);
			expect(userRewardPerid2).to.equal(5);
			expect(userRewardPerid3).to.equal(3);
		});
	});

	describe('Get reward', function(){

		it("Test get reward", async function () {
			const peeranha = await createContract();
			const peeranhaContractAddress = await peeranha.resolvedAddress.then((value) => {
				return value;
			});
			const token = await createContractToken(peeranhaContractAddress);
			const hashContainer = getHashContainer();

			await peeranha.createUser(hashContainer[1]);

			await peeranha.addUserRating(peeranha.deployTransaction.from, 5, 1);
			await wait(PeriodTime);

			await peeranha.addUserRating(peeranha.deployTransaction.from, 1, 1);
			await wait(PeriodTime);
			
			await peeranha.addUserRating(peeranha.deployTransaction.from, 1, 1);

			const rewardPeriods = await peeranha.getAcctiveUserPeriods(peeranha.deployTransaction.from)
			
			const ratingToReward = await peeranha.getRatingToReward(peeranha.deployTransaction.from, rewardPeriods[1], 1);
			expect(ratingToReward).to.equal(5);

			await token.claimReward(rewardPeriods[1]);		// 0 ?
			const balance = await getBalance(token, peeranha.deployTransaction.from);

			expect(balance).to.equal(5 * coefficientToken * fraction);
		});

		it("Test get reward for 1st period", async function () {
			const peeranha = await createContract();
			const peeranhaContractAddress = await peeranha.resolvedAddress.then((value) => {
				return value;
			});
			const token = await createContractToken(peeranhaContractAddress);
			const hashContainer = getHashContainer();

			await peeranha.createUser(hashContainer[1]);

			await peeranha.addUserRating(peeranha.deployTransaction.from, 5, 1);
			await wait(PeriodTime);

			await peeranha.addUserRating(peeranha.deployTransaction.from, 4, 1);

			const rewardPeriods = await peeranha.getAcctiveUserPeriods(peeranha.deployTransaction.from)

			await expect(token.claimReward(rewardPeriods[0]))
			.to.be.revertedWith('No reward for you in this period');
			expect(await getBalance(token, peeranha.deployTransaction.from)).to.eql(0);
		});

		it("Test get reward for the ongoing period", async function () {
			const peeranha = await createContract();
			const peeranhaContractAddress = await peeranha.resolvedAddress.then((value) => {
				return value;
			});
			const token = await createContractToken(peeranhaContractAddress);
			const hashContainer = getHashContainer();

			await peeranha.createUser(hashContainer[1]);

			await peeranha.addUserRating(peeranha.deployTransaction.from, 5, 1);

			await wait(PeriodTime);
			await peeranha.addUserRating(peeranha.deployTransaction.from, 4, 1);
			const rewardPeriods = await peeranha.getAcctiveUserPeriods(peeranha.deployTransaction.from)

			await expect(token.claimReward(rewardPeriods[1]), 'Transaction was not reverted')
			.to.be.revertedWith("This period isn't ended yet!");
			expect(await getBalance(token, peeranha.deployTransaction.from)).to.eql(0);
		}).retries(2);

		it("Test get reward for undefined period", async function () {
			const peeranha = await createContract();
			const peeranhaContractAddress = await peeranha.resolvedAddress.then((value) => {
				return value;
			});
			const token = await createContractToken(peeranhaContractAddress);
			const hashContainer = getHashContainer();

			await peeranha.createUser(hashContainer[1]);

			await peeranha.addUserRating(peeranha.deployTransaction.from, 5, 1);
			await wait(PeriodTime);

			const rewardPeriods = await peeranha.getAcctiveUserPeriods(peeranha.deployTransaction.from)

			await expect(token.claimReward(rewardPeriods[0] - 1))
			.to.be.revertedWith('No reward for you in this period');
			expect(await getBalance(token, peeranha.deployTransaction.from)).to.eql(0);
		});

		// it("Test twice pick up 1 reward", async function () {
		// 	const peeranha = await createContract();
		// 	const peeranhaContractAddress = await peeranha.resolvedAddress.then((value) => {
		// 		return value;
		// 	});
		// 	const token = await createContractToken(peeranhaContractAddress);
		// 	const hashContainer = getHashContainer();

		// 	await peeranha.createUser(hashContainer[1]);

		// 	await peeranha.addUserRating(peeranha.deployTransaction.from, 5, 1);
		// 	await wait(PeriodTime);

		// 	await peeranha.addUserRating(peeranha.deployTransaction.from, 4, 1);
			
		// 	await wait(PeriodTime);
		// 	await peeranha.addUserRating(peeranha.deployTransaction.from, 3, 1);

		// 	const rewardPeriods = await peeranha.getAcctiveUserPeriods(peeranha.deployTransaction.from)

		// 	const userRewardPerid = await peeranha.getRatingToReward(peeranha.deployTransaction.from, rewardPeriods[0], 1);
		// 	const userRewardPerid2 = await peeranha.getRatingToReward(peeranha.deployTransaction.from, rewardPeriods[1], 1);
		// 	const userRewardPerid3 = await peeranha.getRatingToReward(peeranha.deployTransaction.from, rewardPeriods[2], 1);

		// 	console.log()
		// 	expect(userRewardPerid).to.equal(0);
		// 	expect(userRewardPerid2).to.equal(5);
		// 	expect(userRewardPerid3).to.equal(4);

		// 	console.log(userRewardPerid2);
		// 	console.log(rewardPeriods[1])

		// 	await token.claimReward(rewardPeriods[1]);

		// 	console.log("|||||||||||||||||||||||||||||||")
		// 	const shiftReward = await token.getShiftRewards(rewardPeriods[0]);
		// 	console.log(await getInt(shiftReward))
		// 	const shiftRewardd = await token.getShiftRewards(rewardPeriods[1]);
		// 	console.log(await getInt(shiftRewardd))
		// 	const balance = await getBalance(token, peeranha.deployTransaction.from);
		// 	console.log(balance);

		// 	await expect(token.claimReward(rewardPeriods[1])).to.be.revertedWith('You already picked up this reward.');
		// });
	});
});
