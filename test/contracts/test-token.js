const { expect } = require("chai");
const {
	wait, getBalance, getInt, createPeerenhaAndTokenContract, getHashContainer, getUserReward, parseEther, getOwnerMinted, getTotalSupply,
	periodUserReward, PeriodTime, fraction, setRetingOnePeriod, ratingChanges, twiceChengeRatingIn1Period, twiceChengeRatingIn2NDPeriod, ratingChangesSkipPeriod, poolToken,
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
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
				const hashContainer = getHashContainer();
		
				await peeranhaUser.createUser(hashContainer[1]);
		
				await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, ratings, 1);

				const rewardPeriods = await peeranhaUser.getActiveUserPeriods(peeranhaUser.deployTransaction.from)
			
				const userPeriodRating = await peeranhaUser.getPeriodRating(peeranhaUser.deployTransaction.from, rewardPeriods[0], 1);
				expect(userPeriodRating.ratingToReward).to.equal(result.ratingToReward);
				expect(userPeriodRating.penalty).to.equal(result.penalty);

				const periodRewardShares = await peeranhaUser.getPeriodReward(rewardPeriods[0]);
				expect(periodRewardShares).to.equal(periodRewards);
			}).retries(2);
		}

		for (const {actions, ratings, result, periodRewards} of twiceChengeRatingIn1Period) {
			it(`Test ${actions[0]} rating in 1st period and ${actions[1]} rating in 1st period`, async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
				const hashContainer = getHashContainer();
				await peeranhaUser.createUser(hashContainer[1]);
		
		 		await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, ratings[0], 1);
				await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, ratings[1], 1);

				const rewardPeriods = await peeranhaUser.getActiveUserPeriods(peeranhaUser.deployTransaction.from)
				console.log(rewardPeriods)
				expect(rewardPeriods.length).to.equal(1);

				const userPeriodRating = await peeranhaUser.getPeriodRating(peeranhaUser.deployTransaction.from, rewardPeriods[0], 1);
				expect(userPeriodRating.ratingToReward).to.equal(result.ratingToReward);
				expect(userPeriodRating.penalty).to.equal(result.penalty);

				const periodRewardShares = await peeranhaUser.getPeriodReward(rewardPeriods[0]);
				expect(periodRewardShares).to.equal(periodRewards);
			}).retries(2);
		}

		for (const {actions, ratings, results, periodRewards} of ratingChanges) {
			it(`Test ${actions[0]} rating in 1st period and ${actions[1]} rating in 2nt period`, async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
				const hashContainer = getHashContainer();
				await peeranhaUser.createUser(hashContainer[1]);
		
				await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, ratings[0], 1);
				
				await wait(PeriodTime);
				await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, ratings[1], 1);
		
				const rewardPeriods = await peeranhaUser.getActiveUserPeriods(peeranhaUser.deployTransaction.from)
				console.log(rewardPeriods)
				expect(rewardPeriods.length).to.equal(2);
				
				const userPeriodRating = await peeranhaUser.getPeriodRating(peeranhaUser.deployTransaction.from, rewardPeriods[0], 1);
				expect(userPeriodRating.ratingToReward).to.equal(results[0].ratingToReward);
				expect(userPeriodRating.penalty).to.equal(results[0].penalty);
				
				const userPeriodRating1 = await peeranhaUser.getPeriodRating(peeranhaUser.deployTransaction.from, rewardPeriods[1], 1);
				expect(userPeriodRating1.ratingToReward).to.equal(results[1].ratingToReward);
				expect(userPeriodRating1.penalty).to.equal(results[1].penalty);

				const periodRewardShares = await peeranhaUser.getPeriodReward(rewardPeriods[0]);
				expect(periodRewardShares).to.equal(periodRewards[0]);
				
				const periodRewardShares2 = await peeranhaUser.getPeriodReward(rewardPeriods[1]);
				expect(periodRewardShares2).to.equal(periodRewards[1]);
			});
		}

		for (const {actions, ratings, results, periodRewards} of twiceChengeRatingIn2NDPeriod) {		// new
			it(`Test ${actions[0]} rating in 1st period and ${actions[1]} rating in 2nt period and ${actions[2]} rating in 2nt`, async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
				const hashContainer = getHashContainer();
				await peeranhaUser.createUser(hashContainer[1]);
		
				await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, ratings[0], 1);
				
				await wait(PeriodTime);
				await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, ratings[1], 1);
				await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, ratings[2], 1);
		
				const rewardPeriods = await peeranhaUser.getActiveUserPeriods(peeranhaUser.deployTransaction.from)
				console.log(rewardPeriods)
				expect(rewardPeriods.length).to.equal(2);
				
				const userPeriodRating = await peeranhaUser.getPeriodRating(peeranhaUser.deployTransaction.from, rewardPeriods[0], 1);
				expect(userPeriodRating.ratingToReward).to.equal(results[0].ratingToReward);
				expect(userPeriodRating.penalty).to.equal(results[0].penalty);
				
				const userPeriodRating1 = await peeranhaUser.getPeriodRating(peeranhaUser.deployTransaction.from, rewardPeriods[1], 1);
				expect(userPeriodRating1.ratingToReward).to.equal(results[1].ratingToReward);
				expect(userPeriodRating1.penalty).to.equal(results[1].penalty);

				const periodRewardShares = await peeranhaUser.getPeriodReward(rewardPeriods[0]);
				expect(periodRewardShares).to.equal(periodRewards[0]);
				
				const periodRewardShares2 = await peeranhaUser.getPeriodReward(rewardPeriods[1]);
				expect(periodRewardShares2).to.equal(periodRewards[1]);
			}).retries(2);
		}

		for (const {actions, ratings, results, periodRewards} of ratingChangesSkipPeriod) {
			it(`Test ${actions[0]} rating in 1st period and ${actions[1]} rating in 3nt period`, async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
				const hashContainer = getHashContainer();
		
				await peeranhaUser.createUser(hashContainer[1]);
		
				await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, ratings[0], 1);
				
				await wait(PeriodTime * 2);
				await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, ratings[1], 1);
		
				const rewardPeriods = await peeranhaUser.getActiveUserPeriods(peeranhaUser.deployTransaction.from)
				console.log(rewardPeriods)

				const userPeriodRating = await peeranhaUser.getPeriodRating(peeranhaUser.deployTransaction.from, rewardPeriods[0], 1);
				expect(userPeriodRating.ratingToReward).to.equal(results[0].ratingToReward);
				expect(userPeriodRating.penalty).to.equal(results[0].penalty);
				
				const userPeriodRating1 = await peeranhaUser.getPeriodRating(peeranhaUser.deployTransaction.from, rewardPeriods[1], 1);
				expect(userPeriodRating1.ratingToReward).to.equal(results[1].ratingToReward);
				expect(userPeriodRating1.penalty).to.equal(results[1].penalty);

				const periodRewardShares = await peeranhaUser.getPeriodReward(rewardPeriods[0]);
				expect(periodRewardShares).to.equal(periodRewards[0]);

				const periodReward2 = await peeranhaUser.getPeriodReward(rewardPeriods[1]);
				expect(periodReward2).to.equal(periodRewards[1]);
			});
		}
	});

	describe('Get reward', function(){

		it("Test get reward", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();

			await peeranhaUser.createUser(hashContainer[1]);

			await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 5, 1);
			await wait(PeriodTime);

			await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 1, 1);
			await wait(PeriodTime);

			const rewardPeriods = await peeranhaUser.getActiveUserPeriods(peeranhaUser.deployTransaction.from)
			
			const ratingToReward = await peeranhaUser.getRatingToReward(peeranhaUser.deployTransaction.from, rewardPeriods[0], 1);
			expect(ratingToReward).to.equal(5);

			await token.claimReward(rewardPeriods[0]);
			const balance = await getBalance(token, peeranhaUser.deployTransaction.from);

			expect(balance).to.equal(periodUserReward * fraction);
		});

		it("Test get reward for the ongoing period", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(hashContainer[1]);

			await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 5, 1);
			await wait(PeriodTime);

			await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 4, 1);
			const rewardPeriods = await peeranhaUser.getActiveUserPeriods(peeranhaUser.deployTransaction.from)

			await expect(token.claimReward(rewardPeriods[0]), 'Transaction was not reverted')
			.to.be.revertedWith("period_not_ended");
			expect(await getBalance(token, peeranhaUser.deployTransaction.from)).to.eql(0);
		}).retries(2);

		it("Test get reward for undefined period", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();

			await peeranhaUser.createUser(hashContainer[1]);

			await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 5, 1);
			await wait(PeriodTime);

			const rewardPeriods = await peeranhaUser.getActiveUserPeriods(peeranhaUser.deployTransaction.from)

			await expect(token.claimReward(rewardPeriods[0] - 1))
			.to.be.revertedWith('no_reward');
			expect(await getBalance(token, peeranhaUser.deployTransaction.from)).to.eql(0);
		});

		it("Test twice pick up 1 reward", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();

			await peeranhaUser.createUser(hashContainer[1]);

			await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 5, 1);
			await wait(PeriodTime);

			await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 4, 1);
			await wait(PeriodTime);

			const rewardPeriods = await peeranhaUser.getActiveUserPeriods(peeranhaUser.deployTransaction.from)
			await token.claimReward(rewardPeriods[0]);
			await expect(token.claimReward(rewardPeriods[0])).to.be.revertedWith('reward_already_picked_up.');
		});

		///
		// to do max reward
		///
	});

	describe("mint for owner", function () {
		it("mint 5 tokens", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(hashContainer[1]);

			const ownerMintTokens = parseEther("5");
			await token.mint(ownerMintTokens)
			const balance = await getBalance(token, peeranhaUser.deployTransaction.from);

			await expect(await getInt(ownerMintTokens)).to.equal(balance);
			await expect(balance).to.equal(await getOwnerMinted(token));
			await expect(balance).to.equal(await getTotalSupply(token));
		});

		it("mint 5 and 2 tokens", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(hashContainer[1]);

			await token.mint(parseEther("5"))
			await token.mint(parseEther("2"))
			const sumOwnerMintTokens = parseEther("7");

			const balance = await getBalance(token, peeranhaUser.deployTransaction.from);

			await expect(await getInt(sumOwnerMintTokens)).to.equal(balance);
			await expect(balance).to.equal(await getOwnerMinted(token));
			await expect(balance).to.equal(await getTotalSupply(token));
		});

		it("mint max tokens", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(hashContainer[1]);

			const ownerMintTokens = parseEther("40000000");
			await token.mint(ownerMintTokens)
			const balance = await getBalance(token, peeranhaUser.deployTransaction.from);

			await expect(await getInt(ownerMintTokens)).to.equal(balance);
			await expect(balance).to.equal(await getOwnerMinted(token));
			await expect(balance).to.equal(await getTotalSupply(token));
		});

		it("mint more than max tokens", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(hashContainer[1]);

			const ownerMintTokens = parseEther("40000001");
			await expect(token.mint(ownerMintTokens)).to.be.revertedWith('max_owner_mint_exceeded');
		});
	});

	// describe('Split reward', function(){

	// 	it("split reward (2 users)", async function () {
	// 		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
	// 		const hashContainer = getHashContainer();
	// 		const signers = await ethers.getSigners();

	// 		await peeranhaUser.createUser(hashContainer[1]);
	// 		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);


	// 		await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 60, 1);
	// 		await peeranhaUser.addUserRating(signers[1].address, 50, 1);
	// 		await wait(PeriodTime);

	// 		await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 1, 1);
	// 		await peeranhaUser.addUserRating(signers[1].address, 1, 1);
	// 		await wait(PeriodTime);
			
	// 		await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 1, 1);
	// 		await peeranhaUser.addUserRating(signers[1].address, 1, 1);


	// 		const rewardPeriods = await peeranhaUser.getActiveUserPeriods(peeranhaUser.deployTransaction.from)
			
	// 		const ratingToReward = await peeranhaUser.getRatingToReward(peeranhaUser.deployTransaction.from, rewardPeriods[1], 1);
	// 		expect(ratingToReward).to.equal(60);

	// 		await token.claimReward(rewardPeriods[1]);
	// 		const balance = await getBalance(token, peeranhaUser.deployTransaction.from);

	// 		await token.claimReward(rewardPeriods[1]);
	// 		const balance2 = await getBalance(token, signers[1].address);
			
	// 		const userReward = await getUserReward(60, 110);
	// 		const userReward2 = await getUserReward(50, 110);
	// 		expect(balance).to.equal(userReward);
	// 		expect(balance2).to.equal(userReward2);
	// 	});
	// });






	// it("split reward (2 users)", async function () {
	// 	const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
	// 	const hashContainer = getHashContainer();
	// 	const signers = await ethers.getSigners();

	// 	await peeranhaUser.createUser(hashContainer[1]);


	// 	await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 60, 1);
	// 	await wait(PeriodTime);

	// 	// await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 1, 1);
	// 	await wait(PeriodTime);
		
	// 	await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 1, 1);

	// 	const rewardPeriods = await peeranhaUser.getActiveUserPeriods(peeranhaUser.deployTransaction.from)
		
	// 	const ratingToReward = await peeranhaUser.getRatingToReward(peeranhaUser.deployTransaction.from, rewardPeriods[1], 1);
	// 	expect(ratingToReward).to.equal(60);

	// 	console.log(rewardPeriods)
	// 	console.log(await peeranhaUser.getRatingToReward(peeranhaUser.deployTransaction.from, rewardPeriods[0], 1))


	// 	// await token.claimReward(rewardPeriods[1]);
	// 	// const balance = await getBalance(token, peeranhaUser.deployTransaction.from);

	// 	// await token.claimReward(rewardPeriods[1]);
	// 	// const balance2 = await getBalance(token, signers[1].address);
		
	// 	// const userReward = await getUserReward(60, 110);
	// 	// const userReward2 = await getUserReward(50, 110);
	// 	// expect(balance).to.equal(userReward);
	// 	// expect(balance2).to.equal(userReward2);
	// });
});
