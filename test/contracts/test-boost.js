const { expect } = require("chai");
const { parseEther }  = require("ethers/lib/utils");
const {
	wait, getBalance, availableBalanceOf, getInt, createPeerenhaAndTokenContract, getHashContainer, periodRewardCoefficient , PeriodTime, fraction, ratingChanges,
} = require('./utils');

///
// с бустом уменьшить рейтинг
// при добавлении буста проверять период
///

describe("Test boost", function () {

	describe("add boost", function () {

		it("Test add boost", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await token.mint(parseEther("2.2"))

			await token.setStake(accountDeployed, parseEther("1"))
			
			const userBoostPeriods = await token.getStakeUserPeriods(accountDeployed);
			expect(userBoostPeriods.length).to.equal(1);

			let userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[0]); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();
			await expect(userStakeTokens).to.equal(parseEther("1"));

			const boostPeriods = await token.getStakeTotalPeriods();
			expect(boostPeriods.length).to.equal(1);
			await expect(boostPeriods[0]).to.equal(userBoostPeriods[0]);

			let stakeTokens = await token.getStake(boostPeriods[0]);
			let totalStakedAmount = stakeTokens[0]
			totalStakedAmount = await (await getInt(totalStakedAmount));
			await expect(totalStakedAmount).to.equal(await getInt(parseEther("1")));

			let stakingUsersCount = stakeTokens[1]
			stakingUsersCount = await (await getInt(stakingUsersCount));
			await expect(stakingUsersCount).to.equal(1);
			
			let availableBalance = await availableBalanceOf(token, peeranhaUser.deployTransaction.from);
			await expect(availableBalance).to.equal(await getInt(parseEther("1.2")));

			let balance = await getBalance(token, peeranhaUser.deployTransaction.from);
			await expect(balance).to.equal(await getInt(parseEther("2.2")));
		});

		it("Test change boost in the same period (set more) + (check unfreeze tokens)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await token.mint(parseEther("2.2"))

			await token.setStake(accountDeployed, parseEther("1.1"))
			await token.setStake(accountDeployed, parseEther("2.1"))

			const userBoostPeriods = await token.getStakeUserPeriods(accountDeployed);
			expect(userBoostPeriods.length).to.equal(1);

			let userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[0]); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();
			await expect(userStakeTokens).to.equal(parseEther("2.1"));

			const boostPeriods = await token.getStakeTotalPeriods();
			expect(boostPeriods.length).to.equal(1);
			await expect(boostPeriods[0]).to.equal(userBoostPeriods[0]);

			let stakeTokens = await token.getStake(boostPeriods[0]);
			let totalStakedAmount = stakeTokens[0]
			totalStakedAmount = await (await getInt(totalStakedAmount));
			await expect(totalStakedAmount).to.equal(await getInt(parseEther("2.1")));

			let stakingUsersCount = stakeTokens[1]
			stakingUsersCount = await (await getInt(stakingUsersCount));
			await expect(stakingUsersCount).to.equal(1);
			
			let availableBalance = await availableBalanceOf(token, peeranhaUser.deployTransaction.from);
			await expect(availableBalance).to.equal(await getInt(parseEther("0.1")));

			let balance = await getBalance(token, peeranhaUser.deployTransaction.from);
			await expect(balance).to.equal(await getInt(parseEther("2.2")));

			await wait(PeriodTime)
			await peeranhaUser.updateUser(signers[0].address, hashContainer[1]);
			availableBalance = await availableBalanceOf(token, peeranhaUser.deployTransaction.from);
			await expect(availableBalance).to.equal(await getInt(parseEther("0.1")));
			balance = await getBalance(token, peeranhaUser.deployTransaction.from);
			await expect(balance).to.equal(await getInt(parseEther("2.2")));
		}).retries(3);

		it("Test change boost in the same period (set less) + (check unfreeze tokens)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await token.mint(parseEther("2.2"))

			await token.setStake(accountDeployed, parseEther("2.1"))
			await token.setStake(accountDeployed, parseEther("1"))

			const userBoostPeriods = await token.getStakeUserPeriods(accountDeployed);
			expect(userBoostPeriods.length).to.equal(1);

			let userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[0]); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();
			await expect(userStakeTokens).to.equal(parseEther("1"));

			const boostPeriods = await token.getStakeTotalPeriods();
			expect(boostPeriods.length).to.equal(1);
			await expect(boostPeriods[0]).to.equal(userBoostPeriods[0]);

			let stakeTokens = await token.getStake(boostPeriods[0]);
			let totalStakedAmount = stakeTokens[0]
			totalStakedAmount = await (await getInt(totalStakedAmount));
			await expect(totalStakedAmount).to.equal(await getInt(parseEther("1")));

			let stakingUsersCount = stakeTokens[1]
			stakingUsersCount = await (await getInt(stakingUsersCount));
			await expect(stakingUsersCount).to.equal(1);
			
			let availableBalance = await availableBalanceOf(token, peeranhaUser.deployTransaction.from);
			await expect(availableBalance).to.equal(await getInt(parseEther("1.2")));

			let balance = await getBalance(token, peeranhaUser.deployTransaction.from);
			await expect(balance).to.equal(await getInt(parseEther("2.2")));

			await wait(PeriodTime)
			await peeranhaUser.updateUser(signers[0].address, hashContainer[1]);
			availableBalance = await availableBalanceOf(token, peeranhaUser.deployTransaction.from);
			await expect(availableBalance).to.equal(await getInt(parseEther("1.2")));
			balance = await getBalance(token, peeranhaUser.deployTransaction.from);
			await expect(balance).to.equal(await getInt(parseEther("2.2")));
		}).retries(3);
		
		it("Test change boost next period (set more) + (check unfreeze tokens)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await token.mint(parseEther("2.2"))

			await token.setStake(accountDeployed, parseEther("1.1"))
			await wait(PeriodTime)
			await token.setStake(accountDeployed, parseEther("2.1"))

			const userBoostPeriods = await token.getStakeUserPeriods(accountDeployed);
			expect(userBoostPeriods.length).to.equal(2);

			let userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[1]); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();
			await expect(userStakeTokens).to.equal(parseEther("2.1"));

			const boostPeriods = await token.getStakeTotalPeriods();
			expect(boostPeriods.length).to.equal(2);
			await expect(boostPeriods[1]).to.equal(userBoostPeriods[1]);

			let stakeTokens = await token.getStake(boostPeriods[1]);
			let totalStakedAmount = stakeTokens[0]
			totalStakedAmount = await (await getInt(totalStakedAmount));
			await expect(totalStakedAmount).to.equal(await getInt(parseEther("2.1")));

			let stakingUsersCount = stakeTokens[1]
			stakingUsersCount = await (await getInt(stakingUsersCount));
			await expect(stakingUsersCount).to.equal(1);
			
			let availableBalance = await availableBalanceOf(token, peeranhaUser.deployTransaction.from);
			await expect(availableBalance).to.equal(await getInt(parseEther("0.1")));

			let balance = await getBalance(token, peeranhaUser.deployTransaction.from);
			await expect(balance).to.equal(await getInt(parseEther("2.2")));

			await wait(PeriodTime)
			await peeranhaUser.updateUser(signers[0].address, hashContainer[1]);
			availableBalance = await availableBalanceOf(token, peeranhaUser.deployTransaction.from);
			await expect(availableBalance).to.equal(await getInt(parseEther("0.1")));
			balance = await getBalance(token, peeranhaUser.deployTransaction.from);
			await expect(balance).to.equal(await getInt(parseEther("2.2")));
		}).retries(3);

		it("Test change boost next period (set less) + (check unfreeze tokens)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await token.mint(parseEther("2.2"))

			await token.setStake(accountDeployed, parseEther("2.1"))
			await wait(PeriodTime)
			await token.setStake(accountDeployed, parseEther("1"))

			const userBoostPeriods = await token.getStakeUserPeriods(accountDeployed);
			expect(userBoostPeriods.length).to.equal(2);

			let userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[1]); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();
			await expect(userStakeTokens).to.equal(parseEther("1"));

			const boostPeriods = await token.getStakeTotalPeriods();
			expect(boostPeriods.length).to.equal(2);
			await expect(boostPeriods[1]).to.equal(userBoostPeriods[1]);

			let stakeTokens = await token.getStake(boostPeriods[1]);
			let totalStakedAmount = stakeTokens[0]
			totalStakedAmount = await (await getInt(totalStakedAmount));
			await expect(totalStakedAmount).to.equal(await getInt(parseEther("1")));

			let stakingUsersCount = stakeTokens[1]
			stakingUsersCount = await (await getInt(stakingUsersCount));
			await expect(stakingUsersCount).to.equal(1);
			
			let availableBalance = await availableBalanceOf(token, peeranhaUser.deployTransaction.from);
			await expect(availableBalance).to.equal(await getInt(parseEther("0.1")));	// 2.1 still freeze 

			let balance = await getBalance(token, peeranhaUser.deployTransaction.from);
			await expect(balance).to.equal(await getInt(parseEther("2.2")));

			await wait(PeriodTime)
			await peeranhaUser.updateUser(signers[0].address, hashContainer[1]);

			availableBalance = await availableBalanceOf(token, peeranhaUser.deployTransaction.from);
			await expect(availableBalance).to.equal(await getInt(parseEther("1.2")));		// unfreeze
			balance = await getBalance(token, peeranhaUser.deployTransaction.from);
			await expect(balance).to.equal(await getInt(parseEther("2.2")));
		}).retries(3);

		it("Test change boost 2 periods left (set more) + (check unfreeze tokens)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await token.mint(parseEther("2.2"))

			await token.setStake(accountDeployed, parseEther("1.1"))
			await wait(PeriodTime * 2)
			await token.setStake(accountDeployed, parseEther("2.1"))

			const userBoostPeriods = await token.getStakeUserPeriods(accountDeployed);
			expect(userBoostPeriods.length).to.equal(2);

			let userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[1]); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();
			await expect(userStakeTokens).to.equal(parseEther("2.1"));

			const boostPeriods = await token.getStakeTotalPeriods();
			expect(boostPeriods.length).to.equal(2);
			await expect(boostPeriods[1]).to.equal(userBoostPeriods[1]);

			let stakeTokens = await token.getStake(boostPeriods[1]);
			let totalStakedAmount = stakeTokens[0]
			totalStakedAmount = await (await getInt(totalStakedAmount));
			await expect(totalStakedAmount).to.equal(await getInt(parseEther("2.1")));

			let stakingUsersCount = stakeTokens[1]
			stakingUsersCount = await (await getInt(stakingUsersCount));
			await expect(stakingUsersCount).to.equal(1);
			
			let availableBalance = await availableBalanceOf(token, peeranhaUser.deployTransaction.from);
			await expect(availableBalance).to.equal(await getInt(parseEther("0.1")));

			let balance = await getBalance(token, peeranhaUser.deployTransaction.from);
			await expect(balance).to.equal(await getInt(parseEther("2.2")));

			await wait(PeriodTime)
			await peeranhaUser.updateUser(signers[0].address, hashContainer[1]);
			availableBalance = await availableBalanceOf(token, peeranhaUser.deployTransaction.from);
			await expect(availableBalance).to.equal(await getInt(parseEther("0.1")));
			balance = await getBalance(token, peeranhaUser.deployTransaction.from);
			await expect(balance).to.equal(await getInt(parseEther("2.2")));
		}).retries(3);

		it("Test change boost 2 periods left (set less) + (check unfreeze tokens)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await token.mint(parseEther("2.2"))

			await token.setStake(accountDeployed, parseEther("2.1"))
			await wait(PeriodTime)
			await token.setStake(accountDeployed, parseEther("1"))

			const userBoostPeriods = await token.getStakeUserPeriods(accountDeployed);
			expect(userBoostPeriods.length).to.equal(2);

			let userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[1]); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();
			await expect(userStakeTokens).to.equal(parseEther("1"));

			const boostPeriods = await token.getStakeTotalPeriods();
			expect(boostPeriods.length).to.equal(2);
			await expect(boostPeriods[1]).to.equal(userBoostPeriods[1]);

			let stakeTokens = await token.getStake(boostPeriods[1]);
			let totalStakedAmount = stakeTokens[0]
			totalStakedAmount = await (await getInt(totalStakedAmount));
			await expect(totalStakedAmount).to.equal(await getInt(parseEther("1")));

			let stakingUsersCount = stakeTokens[1]
			stakingUsersCount = await (await getInt(stakingUsersCount));
			await expect(stakingUsersCount).to.equal(1);
			
			let availableBalance = await availableBalanceOf(token, peeranhaUser.deployTransaction.from);
			await expect(availableBalance).to.equal(await getInt(parseEther("0.1")));	// 2.1 still freeze 

			let balance = await getBalance(token, peeranhaUser.deployTransaction.from);
			await expect(balance).to.equal(await getInt(parseEther("2.2")));

			await wait(PeriodTime)
			await peeranhaUser.updateUser(signers[0].address, hashContainer[1]);
			
			availableBalance = await availableBalanceOf(token, peeranhaUser.deployTransaction.from);
			await expect(availableBalance).to.equal(await getInt(parseEther("1.2")));	// 1.1 unfreeze 

			balance = await getBalance(token, peeranhaUser.deployTransaction.from);
			await expect(balance).to.equal(await getInt(parseEther("2.2")));
		}).retries(3);

		

		it("Test add boost (get stake in previous period)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await token.mint(parseEther("1.2"))

			await token.setStake(accountDeployed, parseEther("1"))
			const userBoostPeriods = await token.getStakeUserPeriods(accountDeployed);

			let userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[0] - 1); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();
			
			await expect(userStakeTokens).to.equal(parseEther("0"));
		});

		it("Test add boost (get stake in next period)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await token.mint(parseEther("1.2"))

			await token.setStake(accountDeployed, parseEther("1"))
			const userBoostPeriods = await token.getStakeUserPeriods(accountDeployed);
			let userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[0] + 1); 
			userStakeTokens = await (await getInt(userStakeTokens)).toString();

			await expect(userStakeTokens).to.equal(parseEther("1"));
		});

		// it("Test add 3 boost (!! set periodLength 3 sec)", async function () {		// set period time 3 sec and run this
		// 	const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		// 	const hashContainer = getHashContainer();
		//  const signers = await ethers.getSigners();
		// 	await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		// 	await token.mint(parseEther("3"))

		// 	await token.setStake(accountDeployed, parseEther("1"))
		// 	await wait(PeriodTime * 3)

		// 	await token.setStake(accountDeployed, parseEther("1.5"))
		// 	await wait(PeriodTime * 3)

		// 	await token.setStake(accountDeployed, parseEther("2"))
		// 	await wait(PeriodTime * 3)

		// 	const userBoostPeriods = await token.getStakeUserPeriods(accountDeployed);
		// 	expect(userBoostPeriods.length).to.equal(3);

		// 	let userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[0] - 2); 
		// 	userStakeTokens = await (await getInt(userStakeTokens)).toString();
		// 	await expect(userStakeTokens).to.equal(parseEther("0"));

		// 	userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[0] - 1); 
		// 	userStakeTokens = await (await getInt(userStakeTokens)).toString();
		// 	await expect(userStakeTokens).to.equal(parseEther("0"));

		// 	userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[0]); 
		// 	userStakeTokens = await (await getInt(userStakeTokens)).toString();
		// 	await expect(userStakeTokens).to.equal(parseEther("1"));

		// 	userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[1] - 2); 
		// 	userStakeTokens = await (await getInt(userStakeTokens)).toString();
		// 	await expect(userStakeTokens).to.equal(parseEther("1"));

		// 	userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[1] - 1); 
		// 	userStakeTokens = await (await getInt(userStakeTokens)).toString();
		// 	await expect(userStakeTokens).to.equal(parseEther("1"));

		// 	userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[1]); 
		// 	userStakeTokens = await (await getInt(userStakeTokens)).toString();
		// 	await expect(userStakeTokens).to.equal(parseEther("1.5"));
			
		// 	userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[2] - 2);
		// 	userStakeTokens = await (await getInt(userStakeTokens)).toString();
		// 	await expect(userStakeTokens).to.equal(parseEther("1.5"));

		// 	userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[2] - 1); 
		// 	userStakeTokens = await (await getInt(userStakeTokens)).toString();
		// 	await expect(userStakeTokens).to.equal(parseEther("1.5"));

		// 	userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[2]); 
		// 	userStakeTokens = await (await getInt(userStakeTokens)).toString();
		// 	await expect(userStakeTokens).to.equal(parseEther("2"));

		// 	userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[2] + 1); 
		// 	userStakeTokens = await (await getInt(userStakeTokens)).toString();
		// 	await expect(userStakeTokens).to.equal(parseEther("2"));

		// 	userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[2] + 2); 
		// 	userStakeTokens = await (await getInt(userStakeTokens)).toString();
		// 	await expect(userStakeTokens).to.equal(parseEther("2"));

		// 	userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[2] + 10); 
		// 	userStakeTokens = await (await getInt(userStakeTokens)).toString();
		// 	await expect(userStakeTokens).to.equal(parseEther("2"));

		// 	console.log("_____firs period_____")
		// 	const boostPeriods = await token.getStakeTotalPeriods();
		// 	let stakeTokens = await token.getStake(boostPeriods[0]);
		// 	let totalStakedAmount = stakeTokens[0]
		// 	totalStakedAmount = await getInt(totalStakedAmount);
		// 	expect(totalStakedAmount).to.equal(await getInt(parseEther("1")));

		// 	let stakingUsersCount = stakeTokens[1]
		// 	stakingUsersCount = await getInt(stakingUsersCount);
		// 	expect(stakingUsersCount).to.equal(1);

		// 	console.log("_____second period_____")
		// 	stakeTokens = await token.getStake(boostPeriods[1]);
		// 	totalStakedAmount = stakeTokens[0]
		// 	totalStakedAmount = await getInt(totalStakedAmount);
		// 	expect(totalStakedAmount).to.equal(await getInt(parseEther("1.5")));

		// 	stakingUsersCount = stakeTokens[1]
		// 	stakingUsersCount = await getInt(stakingUsersCount);
		// 	expect(stakingUsersCount).to.equal(1);

		// 	console.log("_____therd period_____")
		// 	stakeTokens = await token.getStake(boostPeriods[2]);
		// 	totalStakedAmount = stakeTokens[0]
		// 	totalStakedAmount = await getInt(totalStakedAmount);
		// 	expect(totalStakedAmount).to.equal(await getInt(parseEther("2")));

		// 	stakingUsersCount = stakeTokens[1]
		// 	stakingUsersCount = await getInt(stakingUsersCount);
		// 	expect(stakingUsersCount).to.equal(1);
		// });

		// it("Test chenge the same period", async function () {
		// 	const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		// 	const hashContainer = getHashContainer();
		//  const signers = await ethers.getSigners();
		// 	await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		// 	await token.mint(parseEther("1.2"))

		// 	await token.setStake(accountDeployed, parseEther("1"))
		// 	const userBoostPeriods = await token.getStakeUserPeriods(accountDeployed);

		// 	let userStakeTokens = await token.getUserStake(accountDeployed, userBoostPeriods[0]); 
		// 	userStakeTokens = await (await getInt(userStakeTokens)).toString();

		// 	const boostPeriods = await token.getStakeTotalPeriods();
		// 	let stakeTokens = await token.getStake(boostPeriods[0]);
		// 	let totalStakedAmount = stakeTokens[0]
		// 	totalStakedAmount = await (await getInt(totalStakedAmount)).toString();

		// 	let stakingUsersCount = stakeTokens[1]
		// 	stakingUsersCount = await (await getInt(stakingUsersCount)).toString();
			
		// 	await expect(userStakeTokens).to.equal(parseEther("1"));
		// });
	});

	describe("add boost and get reward", function () {

		it("add rating the same periods when add boost", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await token.mint(parseEther("1"))

			await token.setStake(accountDeployed, parseEther("1"))

			await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 5, 1);
			await wait(PeriodTime * 2);

			const userBoostPeriods = await token.getStakeUserPeriods(accountDeployed);
			const rewardPeriods = await peeranhaUser.getActiveUserPeriods(peeranhaUser.deployTransaction.from)
			
			const periodRewardShares = await peeranhaUser.getPeriodReward(rewardPeriods[0]);
			console.log(periodRewardShares);
			console.log(rewardPeriods)
			console.log(userBoostPeriods)
			expect(rewardPeriods[0] + 1).to.equal(userBoostPeriods[0]);
			expect(periodRewardShares).to.equal(5 * periodRewardCoefficient);


			// const ratingToReward = await peeranhaUser.getRatingToReward(peeranhaUser.deployTransaction.from, rewardPeriods[1], 1);
			// expect(ratingToReward).to.equal(5);

			// await token.claimReward(signers[0].address, rewardPeriods[1]);
			// const balance = await availableBalanceOf(token, peeranhaUser.deployTransaction.from);
			
			// expect(balance).to.equal(5 * coefficientToken * fraction);
		}).retries(3);

		it("add rating in next periods when add boost", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await token.mint(parseEther("1"))

			await token.setStake(accountDeployed, parseEther("1"))
			await wait(PeriodTime);

			await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 5, 1);
			await wait(PeriodTime * 2);

			// const boostPeriods = await token.getStakeTotalPeriods();
			const userBoostPeriods = await token.getStakeUserPeriods(accountDeployed);
			const rewardPeriods = await peeranhaUser.getActiveUserPeriods(peeranhaUser.deployTransaction.from)
			
			console.log(userBoostPeriods)
			console.log(rewardPeriods)
			const ratingToReward = await peeranhaUser.getRatingToReward(peeranhaUser.deployTransaction.from, rewardPeriods[0], 1);

			const periodRewardShares = await peeranhaUser.getPeriodReward(rewardPeriods[0]);
			console.log(periodRewardShares);
			expect(periodRewardShares).to.equal(5 * 6 * periodRewardCoefficient);
			expect(ratingToReward).to.equal(5);

			// await token.claimReward(signers[0].address, rewardPeriods[1]);
			// const balance = await availableBalanceOf(token, peeranhaUser.deployTransaction.from);
			// expect(balance).to.equal(5 * 6 * coefficientToken * fraction);
		}).retries(3);

		it("add 0 rating in next periods when add boost", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await token.mint(parseEther("1"))

			await token.setStake(accountDeployed, parseEther("1"))
			await wait(PeriodTime);

			await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 5, 1);
			await wait(PeriodTime);

			await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, -5, 1);
			await wait(PeriodTime);

			const boostPeriods = await token.getStakeTotalPeriods();
			const userBoostPeriods = await token.getStakeUserPeriods(accountDeployed);
			const rewardPeriods = await peeranhaUser.getActiveUserPeriods(peeranhaUser.deployTransaction.from)
			
			console.log(userBoostPeriods)
			console.log(rewardPeriods)
			const ratingToReward = await peeranhaUser.getRatingToReward(peeranhaUser.deployTransaction.from, rewardPeriods[1], 1);
			expect(ratingToReward).to.equal(0);

			await expect(token.claimReward(signers[0].address, rewardPeriods[0]))
			.to.be.revertedWith('no_reward');
		}).retries(3);
	})
});
