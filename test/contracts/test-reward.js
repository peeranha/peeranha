const { expect } = require("chai");
const {
	wait, getBalance, getInt, createPeerenhaAndTokenContract, getHashContainer, getUserReward , periodUserReward, PeriodTime, fraction, setRetingOnePeriod, ratingChanges, twiceChengeRatingIn1Period, ratingChangesSkipPeriod, poolToken,
} = require('./utils');

///
// to do: active users
// active in 2 community
// reduce reward 52 periods?
// несколько обновлений рейтинга в период!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! twiceChengeRatingIn1Period... (в 1-й период готово)
// в проверке ревордов добавить проверку PeriodRewardShares (for)
///

describe("Test wallet", function () {

	describe("Test add rating to reward", function () {

		for (const {actions, ratings, result, periodRewards} of setRetingOnePeriod) {
			it(`Test ${actions} rating in 1st period`, async function () {
				const { peeranha, token, accountDeployed} = await createPeerenhaAndTokenContract();
				const hashContainer = getHashContainer();
		
				await peeranha.createUser(hashContainer[1]);
		
				await peeranha.addUserRating(peeranha.deployTransaction.from, ratings, 1);

				const rewardPeriods = await peeranha.getAcctiveUserPeriods(peeranha.deployTransaction.from)
			
				const userPeriodRating = await peeranha.getPeriodRating(peeranha.deployTransaction.from, rewardPeriods[0], 1);
				expect(userPeriodRating.ratingToReward).to.equal(result.ratingToReward);
				expect(userPeriodRating.penalty).to.equal(result.penalty);

				const periodRewardShares = await peeranha.getPeriodReward(rewardPeriods[0]);
				expect(periodRewardShares).to.equal(periodRewards);
			});
		}

		for (const {actions, ratings, result, periodRewards} of twiceChengeRatingIn1Period) {
			it(`Test ${actions[0]} rating in 1st period and ${actions[1]} rating in 1st period`, async function () {
				const { peeranha, token, accountDeployed} = await createPeerenhaAndTokenContract();
				const hashContainer = getHashContainer();
				await peeranha.createUser(hashContainer[1]);
		
		 		await peeranha.addUserRating(peeranha.deployTransaction.from, ratings[0], 1);
				await peeranha.addUserRating(peeranha.deployTransaction.from, ratings[1], 1);

				const rewardPeriods = await peeranha.getAcctiveUserPeriods(peeranha.deployTransaction.from)
				console.log(rewardPeriods)
				expect(rewardPeriods.length).to.equal(1);

				const userPeriodRating = await peeranha.getPeriodRating(peeranha.deployTransaction.from, rewardPeriods[0], 1);
				expect(userPeriodRating.ratingToReward).to.equal(result.ratingToReward);
				expect(userPeriodRating.penalty).to.equal(result.penalty);

				const periodRewardShares = await peeranha.getPeriodReward(rewardPeriods[0]);
				expect(periodRewardShares).to.equal(periodRewards);
			}).retries(2);
		}

		for (const {actions, ratings, results, periodRewards} of ratingChanges) {
			it(`Test ${actions[0]} rating in 1st period and ${actions[1]} rating in 2nt period`, async function () {
				const { peeranha, token, accountDeployed} = await createPeerenhaAndTokenContract();
				const hashContainer = getHashContainer();
				await peeranha.createUser(hashContainer[1]);
		
				await peeranha.addUserRating(peeranha.deployTransaction.from, ratings[0], 1);
				
				await wait(PeriodTime);
				await peeranha.addUserRating(peeranha.deployTransaction.from, ratings[1], 1);
		
				const rewardPeriods = await peeranha.getAcctiveUserPeriods(peeranha.deployTransaction.from)
				console.log(rewardPeriods)
				expect(rewardPeriods.length).to.equal(2);
				
				const userPeriodRating = await peeranha.getPeriodRating(peeranha.deployTransaction.from, rewardPeriods[0], 1);
				expect(userPeriodRating.ratingToReward).to.equal(results[0].ratingToReward);
				expect(userPeriodRating.penalty).to.equal(results[0].penalty);
				
				const userPeriodRating1 = await peeranha.getPeriodRating(peeranha.deployTransaction.from, rewardPeriods[1], 1);
				expect(userPeriodRating1.ratingToReward).to.equal(results[1].ratingToReward);
				expect(userPeriodRating1.penalty).to.equal(results[1].penalty);

				const periodRewardShares = await peeranha.getPeriodReward(rewardPeriods[0]);
				expect(periodRewardShares).to.equal(periodRewards[0]);
				
				const periodRewardShares2 = await peeranha.getPeriodReward(rewardPeriods[1]);
				expect(periodRewardShares2).to.equal(periodRewards[1]);
			});
		}

		for (const {actions, ratings, results, periodRewards} of ratingChanges) {		// new
			it(`Test ${actions[0]} rating in 1st period and ${actions[1]} rating in 2nt period`, async function () {
				const { peeranha, token, accountDeployed} = await createPeerenhaAndTokenContract();
				const hashContainer = getHashContainer();
				await peeranha.createUser(hashContainer[1]);
		
				await peeranha.addUserRating(peeranha.deployTransaction.from, ratings[0], 1);
				
				await wait(PeriodTime);
				await peeranha.addUserRating(peeranha.deployTransaction.from, ratings[1], 1);
		
				const rewardPeriods = await peeranha.getAcctiveUserPeriods(peeranha.deployTransaction.from)
				console.log(rewardPeriods)
				expect(rewardPeriods.length).to.equal(2);
				
				const userPeriodRating = await peeranha.getPeriodRating(peeranha.deployTransaction.from, rewardPeriods[0], 1);
				expect(userPeriodRating.ratingToReward).to.equal(results[0].ratingToReward);
				expect(userPeriodRating.penalty).to.equal(results[0].penalty);
				
				const userPeriodRating1 = await peeranha.getPeriodRating(peeranha.deployTransaction.from, rewardPeriods[1], 1);
				expect(userPeriodRating1.ratingToReward).to.equal(results[1].ratingToReward);
				expect(userPeriodRating1.penalty).to.equal(results[1].penalty);

				const periodRewardShares = await peeranha.getPeriodReward(rewardPeriods[0]);
				expect(periodRewardShares).to.equal(periodRewards[0]);
				
				const periodRewardShares2 = await peeranha.getPeriodReward(rewardPeriods[1]);
				expect(periodRewardShares2).to.equal(periodRewards[1]);
			});
		}

		for (const {actions, ratings, results, periodRewards} of ratingChangesSkipPeriod) {
			it(`Test ${actions[0]} rating in 1st period and ${actions[1]} rating in 3nt period`, async function () {
				const { peeranha, token, accountDeployed} = await createPeerenhaAndTokenContract();
				const hashContainer = getHashContainer();
		
				await peeranha.createUser(hashContainer[1]);
		
				await peeranha.addUserRating(peeranha.deployTransaction.from, ratings[0], 1);
				
				await wait(PeriodTime * 2);
				await peeranha.addUserRating(peeranha.deployTransaction.from, ratings[1], 1);
		
				const rewardPeriods = await peeranha.getAcctiveUserPeriods(peeranha.deployTransaction.from)
				console.log(rewardPeriods)

				const userPeriodRating = await peeranha.getPeriodRating(peeranha.deployTransaction.from, rewardPeriods[0], 1);
				expect(userPeriodRating.ratingToReward).to.equal(results[0].ratingToReward);
				expect(userPeriodRating.penalty).to.equal(results[0].penalty);
				
				const userPeriodRating1 = await peeranha.getPeriodRating(peeranha.deployTransaction.from, rewardPeriods[1], 1);
				expect(userPeriodRating1.ratingToReward).to.equal(results[1].ratingToReward);
				expect(userPeriodRating1.penalty).to.equal(results[1].penalty);

				const periodRewardShares = await peeranha.getPeriodReward(rewardPeriods[0]);
				expect(periodRewardShares).to.equal(periodRewards[0]);

				const periodReward2 = await peeranha.getPeriodReward(rewardPeriods[1]);
				expect(periodReward2).to.equal(periodRewards[1]);
			});
		}
	});

	describe('Get reward', function(){

		it("Test get reward", async function () {
			const { peeranha, token, accountDeployed} = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();

			await peeranha.createUser(hashContainer[1]);

			await peeranha.addUserRating(peeranha.deployTransaction.from, 5, 1);
			await wait(PeriodTime);

			await peeranha.addUserRating(peeranha.deployTransaction.from, 1, 1);
			await wait(PeriodTime);

			const rewardPeriods = await peeranha.getAcctiveUserPeriods(peeranha.deployTransaction.from)
			
			const ratingToReward = await peeranha.getRatingToReward(peeranha.deployTransaction.from, rewardPeriods[0], 1);
			expect(ratingToReward).to.equal(5);

			await token.claimReward(peeranha.deployTransaction.from, rewardPeriods[0]);
			const balance = await getBalance(token, peeranha.deployTransaction.from);

			expect(balance).to.equal(periodUserReward * fraction);
		});

		it("Test get reward for the ongoing period", async function () {
			const { peeranha, token, accountDeployed} = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranha.createUser(hashContainer[1]);

			await peeranha.addUserRating(peeranha.deployTransaction.from, 5, 1);
			await wait(PeriodTime);

			await peeranha.addUserRating(peeranha.deployTransaction.from, 4, 1);
			const rewardPeriods = await peeranha.getAcctiveUserPeriods(peeranha.deployTransaction.from)

			await expect(token.claimReward(peeranha.deployTransaction.from, rewardPeriods[0]), 'Transaction was not reverted')
			.to.be.revertedWith("period_not_ended");
			expect(await getBalance(token, peeranha.deployTransaction.from)).to.eql(0);
		}).retries(2);

		it("Test get reward for undefined period", async function () {
			const { peeranha, token, accountDeployed} = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();

			await peeranha.createUser(hashContainer[1]);

			await peeranha.addUserRating(peeranha.deployTransaction.from, 5, 1);
			await wait(PeriodTime);

			const rewardPeriods = await peeranha.getAcctiveUserPeriods(peeranha.deployTransaction.from)

			await expect(token.claimReward(peeranha.deployTransaction.from, rewardPeriods[0] - 1))
			.to.be.revertedWith('no_reward');
			expect(await getBalance(token, peeranha.deployTransaction.from)).to.eql(0);
		});

		it("Test twice pick up 1 reward", async function () {
			const { peeranha, token, accountDeployed} = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();

			await peeranha.createUser(hashContainer[1]);

			await peeranha.addUserRating(peeranha.deployTransaction.from, 5, 1);
			await wait(PeriodTime);

			await peeranha.addUserRating(peeranha.deployTransaction.from, 4, 1);
			await wait(PeriodTime);

			const rewardPeriods = await peeranha.getAcctiveUserPeriods(peeranha.deployTransaction.from)
			await token.claimReward(peeranha.deployTransaction.from, rewardPeriods[0]);
			await expect(token.claimReward(peeranha.deployTransaction.from, rewardPeriods[0])).to.be.revertedWith('reward_already_picked_up.');
		});

		///
		// to do max reward
		///
	});

	describe('Split reward', function(){

		it("split reward (2 users)", async function () {
			const { peeranha, token, accountDeployed} = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[1]);


			await peeranha.addUserRating(peeranha.deployTransaction.from, 60, 1);
			await peeranha.addUserRating(signers[1].address, 50, 1);
			await wait(PeriodTime);

			await peeranha.addUserRating(peeranha.deployTransaction.from, 1, 1);
			await peeranha.addUserRating(signers[1].address, 1, 1);
			await wait(PeriodTime);
			
			await peeranha.addUserRating(peeranha.deployTransaction.from, 1, 1);
			await peeranha.addUserRating(signers[1].address, 1, 1);


			const rewardPeriods = await peeranha.getAcctiveUserPeriods(peeranha.deployTransaction.from)
			
			const ratingToReward = await peeranha.getRatingToReward(peeranha.deployTransaction.from, rewardPeriods[1], 1);
			expect(ratingToReward).to.equal(60);

			await token.claimReward(peeranha.deployTransaction.from, rewardPeriods[1]);
			const balance = await getBalance(token, peeranha.deployTransaction.from);

			await token.claimReward(signers[1].address, rewardPeriods[1]);
			const balance2 = await getBalance(token, signers[1].address);
			
			const userReward = await getUserReward(60, 110);
			const userReward2 = await getUserReward(50, 110);
			expect(balance).to.equal(userReward);
			expect(balance2).to.equal(userReward2);
		});
	});








	// it("split reward (2 users)", async function () {
	// 	const { peeranha, token, accountDeployed} = await createPeerenhaAndTokenContract();
	// 	const hashContainer = getHashContainer();
	// 	const signers = await ethers.getSigners();

	// 	await peeranha.createUser(hashContainer[1]);


	// 	await peeranha.addUserRating(peeranha.deployTransaction.from, 60, 1);
	// 	await wait(PeriodTime);

	// 	// await peeranha.addUserRating(peeranha.deployTransaction.from, 1, 1);
	// 	await wait(PeriodTime);
		
	// 	await peeranha.addUserRating(peeranha.deployTransaction.from, 1, 1);

	// 	const rewardPeriods = await peeranha.getAcctiveUserPeriods(peeranha.deployTransaction.from)
		
	// 	const ratingToReward = await peeranha.getRatingToReward(peeranha.deployTransaction.from, rewardPeriods[1], 1);
	// 	expect(ratingToReward).to.equal(60);

	// 	console.log(rewardPeriods)
	// 	console.log(await peeranha.getRatingToReward(peeranha.deployTransaction.from, rewardPeriods[0], 1))


	// 	// await token.claimReward(peeranha.deployTransaction.from, rewardPeriods[1]);
	// 	// const balance = await getBalance(token, peeranha.deployTransaction.from);

	// 	// await token.claimReward(signers[1].address, rewardPeriods[1]);
	// 	// const balance2 = await getBalance(token, signers[1].address);
		
	// 	// const userReward = await getUserReward(60, 110);
	// 	// const userReward2 = await getUserReward(50, 110);
	// 	// expect(balance).to.equal(userReward);
	// 	// expect(balance2).to.equal(userReward2);
	// });
});
