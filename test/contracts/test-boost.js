const { expect } = require("chai");
const { parseEther }  = require("ethers/lib/utils");
const {
	wait, getBalance, getInt, createPeerenhaAndTokenContract, getHashContainer, periodRewardCoefficient , PeriodTime, fraction, ratingChanges,
} = require('./utils');

///
// с бустом уменьшить рейтинг
// при добавлении буста проверять период
///

describe("Test boost", function () {

	describe("add boost", function () {

		it("Test add boost", async function () {
			const { peeranha, token, accountDeployed} = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranha.createUser(hashContainer[1]);
			await token.mintForOwner(parseEther("1.2"))

			await token.setStake(accountDeployed, parseEther("1"))
			const userBoostPeriods = await token.getStakeUserPeriods(accountDeployed);

			let userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[0]); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();

			const boostPeriods = await token.getStakeTotalPeriods();
			let stakeTokens = await token.getStake(boostPeriods[0]);
			let totalStakedAmount = stakeTokens[0]
			totalStakedAmount = await (await getInt(totalStakedAmount)).toString();

			let stakingUsersCount = stakeTokens[1]
			stakingUsersCount = await (await getInt(stakingUsersCount)).toString();
			
			await expect(userStakeTokens).to.equal(parseEther("1"));
		});

		it("Test add boost (get stake in previous period)", async function () {
			const { peeranha, token, accountDeployed} = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranha.createUser(hashContainer[1]);
			await token.mintForOwner(parseEther("1.2"))

			await token.setStake(accountDeployed, parseEther("1"))
			const userBoostPeriods = await token.getStakeUserPeriods(accountDeployed);

			let userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[0] - 1); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();
			
			await expect(userStakeTokens).to.equal(parseEther("0"));
		});

		it("Test add boost (get stake in next period)", async function () {
			const { peeranha, token, accountDeployed} = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranha.createUser(hashContainer[1]);
			await token.mintForOwner(parseEther("1.2"))

			await token.setStake(accountDeployed, parseEther("1"))
			const userBoostPeriods = await token.getStakeUserPeriods(accountDeployed);
			let userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[0] + 1); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();

			await expect(userStakeTokens).to.equal(parseEther("1"));
		});

		it("Test add 3 boost", async function () {
			const { peeranha, token, accountDeployed} = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranha.createUser(hashContainer[1]);
			await token.mintForOwner(parseEther("3"))

			await token.setStake(accountDeployed, parseEther("1"))
			await wait(PeriodTime * 3)

			await token.setStake(accountDeployed, parseEther("1.5"))
			await wait(PeriodTime * 3)

			await token.setStake(accountDeployed, parseEther("2"))
			await wait(PeriodTime * 3)

			const userBoostPeriods = await token.getStakeUserPeriods(accountDeployed);

			console.log(userBoostPeriods)
			let userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[0] - 2); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();
			await expect(userStakeTokens).to.equal(parseEther("0"));

			userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[0] - 1); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();
			await expect(userStakeTokens).to.equal(parseEther("0"));

			userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[0]); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();
			await expect(userStakeTokens).to.equal(parseEther("1"));

			userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[1] - 2); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();
			await expect(userStakeTokens).to.equal(parseEther("1"));

			userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[1] - 1); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();
			await expect(userStakeTokens).to.equal(parseEther("1"));

			userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[1]); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();
			await expect(userStakeTokens).to.equal(parseEther("1.5"));
			
			userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[2] - 2);
			userStakeTokens = await (await getInt(userStakeTokens)).toString();
			await expect(userStakeTokens).to.equal(parseEther("1.5"));

			userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[2] - 1); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();
			await expect(userStakeTokens).to.equal(parseEther("1.5"));

			userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[2]); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();
			await expect(userStakeTokens).to.equal(parseEther("2"));

			userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[2] + 1); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();
			await expect(userStakeTokens).to.equal(parseEther("2"));

			userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[2] + 2); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();
			await expect(userStakeTokens).to.equal(parseEther("2"));

			userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[2] + 10); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();
			await expect(userStakeTokens).to.equal(parseEther("2"));


			console.log("_____firs period_____")
			const boostPeriods = await token.getStakeTotalPeriods();
			let stakeTokens = await token.getStake(boostPeriods[0]);
			let totalStakedAmount = stakeTokens[0]
			totalStakedAmount = await (await getInt(totalStakedAmount)).toString();
			console.log(totalStakedAmount)

			let stakingUsersCount = stakeTokens[1]
			stakingUsersCount = await (await getInt(stakingUsersCount)).toString();
			console.log(stakingUsersCount)

			console.log("_____second period_____")
			stakeTokens = await token.getStake(boostPeriods[1]);
			totalStakedAmount = stakeTokens[0]
			totalStakedAmount = await (await getInt(totalStakedAmount)).toString();
			console.log(totalStakedAmount)

			stakingUsersCount = stakeTokens[1]
			stakingUsersCount = await (await getInt(stakingUsersCount)).toString();
			console.log(stakingUsersCount)

			console.log("_____therd period_____")
			stakeTokens = await token.getStake(boostPeriods[2]);
			totalStakedAmount = stakeTokens[0]
			totalStakedAmount = await (await getInt(totalStakedAmount)).toString();
			console.log(totalStakedAmount)

			stakingUsersCount = stakeTokens[1]
			stakingUsersCount = await (await getInt(stakingUsersCount)).toString();
			console.log(stakingUsersCount)
		});
	});

	describe("add boost and get reward", function () {

		it("add rating the same periods when add boost", async function () {
			const { peeranha, token, accountDeployed} = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranha.createUser(hashContainer[1]);
			await token.mintForOwner(parseEther("1"))

			await token.setStake(accountDeployed, parseEther("1"))

			await peeranha.addUserRating(peeranha.deployTransaction.from, 5, 1);
			await wait(PeriodTime * 2);

			await wait(PeriodTime);

			const userBoostPeriods = await token.getStakeUserPeriods(accountDeployed);
			const rewardPeriods = await peeranha.getAcctiveUserPeriods(peeranha.deployTransaction.from)
			
			const periodRewardShares = await peeranha.getPeriodReward(rewardPeriods[0]);
			console.log(periodRewardShares);
			console.log(rewardPeriods)
			console.log(userBoostPeriods)
			expect(periodRewardShares).to.equal(5 * periodRewardCoefficient);


			// const ratingToReward = await peeranha.getRatingToReward(peeranha.deployTransaction.from, rewardPeriods[1], 1);
			// expect(ratingToReward).to.equal(5);

			// await token.claimReward(peeranha.deployTransaction.from, rewardPeriods[1]);
			// const balance = await getBalance(token, peeranha.deployTransaction.from);
			
			// expect(balance).to.equal(5 * coefficientToken * fraction);
		});

		it("add rating in next periods when add boost", async function () {
			const { peeranha, token, accountDeployed} = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranha.createUser(hashContainer[1]);
			await token.mintForOwner(parseEther("1"))

			await token.setStake(accountDeployed, parseEther("1"))
			await wait(PeriodTime);

			await peeranha.addUserRating(peeranha.deployTransaction.from, 5, 1);
			await wait(PeriodTime * 2);

			// const boostPeriods = await token.getStakeTotalPeriods();
			const userBoostPeriods = await token.getStakeUserPeriods(accountDeployed);
			const rewardPeriods = await peeranha.getAcctiveUserPeriods(peeranha.deployTransaction.from)
			
			console.log(userBoostPeriods)
			console.log(rewardPeriods)
			const ratingToReward = await peeranha.getRatingToReward(peeranha.deployTransaction.from, rewardPeriods[0], 1);

			const periodRewardShares = await peeranha.getPeriodReward(rewardPeriods[0]);
			console.log(periodRewardShares);
			expect(periodRewardShares).to.equal(5 * 6 * periodRewardCoefficient);
			expect(ratingToReward).to.equal(5);

			// await token.claimReward(peeranha.deployTransaction.from, rewardPeriods[1]);
			// const balance = await getBalance(token, peeranha.deployTransaction.from);
			// expect(balance).to.equal(5 * 6 * coefficientToken * fraction);
		});

		it("add 0 rating in next periods when add boost", async function () {
			const { peeranha, token, accountDeployed} = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranha.createUser(hashContainer[1]);
			await token.mintForOwner(parseEther("1"))

			await token.setStake(accountDeployed, parseEther("1"))
			await wait(PeriodTime);

			await peeranha.addUserRating(peeranha.deployTransaction.from, 5, 1);
			await wait(PeriodTime);

			await peeranha.addUserRating(peeranha.deployTransaction.from, -5, 1);
			await wait(PeriodTime);

			const boostPeriods = await token.getStakeTotalPeriods();
			const userBoostPeriods = await token.getStakeUserPeriods(accountDeployed);
			const rewardPeriods = await peeranha.getAcctiveUserPeriods(peeranha.deployTransaction.from)
			
			console.log(userBoostPeriods)
			console.log(rewardPeriods)
			const ratingToReward = await peeranha.getRatingToReward(peeranha.deployTransaction.from, rewardPeriods[1], 1);
			expect(ratingToReward).to.equal(0);

			await expect(token.claimReward(peeranha.deployTransaction.from, rewardPeriods[1]))
			.to.be.revertedWith('no_reward');
		});
	})
});
