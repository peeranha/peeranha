const { expect } = require("chai");
const { parseEther }  = require("ethers/lib/utils");
const {
	wait, getBalance, getInt, createPeerenhaAndTokenContract, getHashContainer, coefficientToken , PeriodTime, fraction, ratingChanges,
} = require('./utils');


describe("Test boost", function () {

	describe("add boost", function () {

		it("Test add boost", async function () {
			const { peeranha, token, accountDeployed} = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranha.createUser(hashContainer[1]);
			await token.mintForOwner(parseEther("1.2"))

			await token.setBoost(accountDeployed, parseEther("1"))
			const userBoostPeriods = await token.getUserBoostPeriods(accountDeployed);

			let userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[0]); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();

			const boostPeriods = await token.getBoostPeriods();
			let stakeTokens = await token.getStake(boostPeriods[0]);
			let allStake = stakeTokens[0]
			allStake = await (await getInt(allStake)).toString();

			let countStaking = stakeTokens[1]
			countStaking = await (await getInt(countStaking)).toString();
			
			await expect(userStakeTokens).to.equal(parseEther("1"));
		});

		it("Test add boost (get stake in previous period)", async function () {
			const { peeranha, token, accountDeployed} = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranha.createUser(hashContainer[1]);
			await token.mintForOwner(parseEther("1.2"))

			await token.setBoost(accountDeployed, parseEther("1"))
			const userBoostPeriods = await token.getUserBoostPeriods(accountDeployed);

			let userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[0] - 1); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();
			
			await expect(userStakeTokens).to.equal(parseEther("0"));
		});

		it("Test add boost (get stake in next period)", async function () {
			const { peeranha, token, accountDeployed} = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranha.createUser(hashContainer[1]);
			await token.mintForOwner(parseEther("1.2"))

			await token.setBoost(accountDeployed, parseEther("1"))
			const userBoostPeriods = await token.getUserBoostPeriods(accountDeployed);
			let userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[0] + 1); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();

			await expect(userStakeTokens).to.equal(parseEther("1"));
		});

		it("Test add 3 boost", async function () {
			const { peeranha, token, accountDeployed} = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranha.createUser(hashContainer[1]);
			await token.mintForOwner(parseEther("3"))

			await token.setBoost(accountDeployed, parseEther("1"))
			await wait(PeriodTime * 3)

			await token.setBoost(accountDeployed, parseEther("1.5"))
			await wait(PeriodTime * 3)

			await token.setBoost(accountDeployed, parseEther("2"))
			await wait(PeriodTime * 3)

			const userBoostPeriods = await token.getUserBoostPeriods(accountDeployed);

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

			// userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[2] - 2); 			//// fix!!!!!  result - 0
			// userStakeTokens = await (await getInt(userStakeTokens)).toString();
			// await expect(userStakeTokens).to.equal(parseEther("1.5"));

			// userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[2] - 1); 
			// userStakeTokens = await (await getInt(userStakeTokens)).toString();
			// await expect(userStakeTokens).to.equal(parseEther("1.5"));

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
			const boostPeriods = await token.getBoostPeriods();
			let stakeTokens = await token.getStake(boostPeriods[0]);
			let allStake = stakeTokens[0]
			allStake = await (await getInt(allStake)).toString();
			console.log(allStake)

			let countStaking = stakeTokens[1]
			countStaking = await (await getInt(countStaking)).toString();
			console.log(countStaking)

			console.log("_____second period_____")
			stakeTokens = await token.getStake(boostPeriods[1]);
			allStake = stakeTokens[0]
			allStake = await (await getInt(allStake)).toString();
			console.log(allStake)

			countStaking = stakeTokens[1]
			countStaking = await (await getInt(countStaking)).toString();
			console.log(countStaking)

			console.log("_____therd period_____")
			stakeTokens = await token.getStake(boostPeriods[2]);
			allStake = stakeTokens[0]
			allStake = await (await getInt(allStake)).toString();
			console.log(allStake)

			countStaking = stakeTokens[1]
			countStaking = await (await getInt(countStaking)).toString();
			console.log(countStaking)
		});
	});

	describe("add boost and get reward", function () {

		it("add rating the same periods when add boost", async function () {
			const { peeranha, token, accountDeployed} = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranha.createUser(hashContainer[1]);
			await token.mintForOwner(parseEther("1"))

			await token.setBoost(accountDeployed, parseEther("1"))
			const userBoostPeriods = await token.getUserBoostPeriods(accountDeployed);

			await peeranha.addUserRating(peeranha.deployTransaction.from, 5, 1);
			await wait(PeriodTime);

			await peeranha.addUserRating(peeranha.deployTransaction.from, 1, 1);
			await wait(PeriodTime);
			
			await peeranha.addUserRating(peeranha.deployTransaction.from, 1, 1);


			const rewardPeriods = await peeranha.getAcctiveUserPeriods(peeranha.deployTransaction.from)
			
			console.log(userBoostPeriods)
			console.log(rewardPeriods)
			const ratingToReward = await peeranha.getRatingToReward(peeranha.deployTransaction.from, rewardPeriods[1], 1);
			// expect(ratingToReward).to.equal(5);

			await token.claimReward(peeranha.deployTransaction.from, rewardPeriods[1]);
			const balance = await getBalance(token, peeranha.deployTransaction.from);
			console.log(balance / fraction)
			
			// expect(balance).to.equal(userReward);
		});
	})
});
