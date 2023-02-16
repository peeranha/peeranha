const { expect } = require("chai");
const { wait, getInt, getAddressContract, createPeerenhaAndTokenContract, hashContainer, createTags, getHashesContainer, PROTOCOL_ADMIN_ROLE, AchievementsType } = require('./utils');
const bs58 = require('bs58');


describe("Test NFT", function () {
	const ipfsHashes = getHashesContainer(2);

	it("Add achievement", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const URIContainer = getURIContainer();
		const signers = await ethers.getSigners();
		
		await peeranhaUser.createUser(signers[0].address, hashContainer[0]);

		await peeranhaUser.configureNewAchievement(111, 15, URIContainer[0], AchievementsType.Rating);
		const peeranhaAchievement = await peeranhaUser.getAchievementConfig(1)

		await expect(await getInt(peeranhaAchievement.maxCount)).to.equal(111);
		await expect(await getInt(peeranhaAchievement.factCount)).to.equal(0);
		await expect(await getInt(peeranhaAchievement.lowerBound)).to.equal(15);
		await expect(peeranhaAchievement.achievementsType).to.equal(0);

		const peeranhaAchievementNFT = await peeranhaNFT.getAchievementsNFTConfig(1)
		await expect(await getInt(peeranhaAchievementNFT.maxCount)).to.equal(111);
		await expect(await getInt(peeranhaAchievementNFT.factCount)).to.equal(0);
		await expect(peeranhaAchievementNFT.achievementURI).to.equal(URIContainer[0]);
		await expect(peeranhaAchievementNFT.achievementsType).to.equal(0);
	});

	it("Add achievement/ Boundary test", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const URIContainer = getURIContainer();
		const signers = await ethers.getSigners();

		await peeranhaUser.createUser(signers[0].address, hashContainer[0]);

		await peeranhaUser.configureNewAchievement(1, 15, URIContainer[0], AchievementsType.Rating);
		await peeranhaUser.configureNewAchievement(999999, 100, URIContainer[1], AchievementsType.Rating);
		const peeranhaAchievement1 = await peeranhaUser.getAchievementConfig(1);
		const peeranhaAchievement2 = await peeranhaUser.getAchievementConfig(2);

		await expect(await getInt(peeranhaAchievement1.maxCount)).to.equal(1);
		await expect(await getInt(peeranhaAchievement2.maxCount)).to.equal(999999);

		const peeranhaAchievementNFT1 = await peeranhaNFT.getAchievementsNFTConfig(1);
		const peeranhaAchievementNFT2 = await peeranhaNFT.getAchievementsNFTConfig(2);
		await expect(await getInt(peeranhaAchievementNFT1.maxCount)).to.equal(1);
		await expect(await getInt(peeranhaAchievementNFT2.maxCount)).to.equal(999999);
	});

	it("Add achievement with 0 token pool", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const URIContainer = getURIContainer();
		const signers = await ethers.getSigners();

		await peeranhaUser.createUser(signers[0].address, hashContainer[0]);
	
		await expect(peeranhaUser.configureNewAchievement(0, 15, URIContainer[0], AchievementsType.Rating))
		.to.be.revertedWith('invalid_max_count');
	});

	it("Add achievement with exceeded token pool", async function () {		// need?
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const URIContainer = getURIContainer();
		const signers = await ethers.getSigners();

		await peeranhaUser.createUser(signers[0].address, hashContainer[0]);
	
		await expect(peeranhaUser.configureNewAchievement(1000000, 15, URIContainer[0], AchievementsType.Rating))
		.to.be.revertedWith('Max count of achievements must be less than 1 000 000');
	});

	it("Add achievement without admin rights", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[0]);
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
		const URIContainer = getURIContainer();
	
		await expect(peeranhaUser.connect(signers[1]).configureNewAchievement(100, 15, URIContainer[0], AchievementsType.Rating))
		.to.be.revertedWith('not_allowed_not_admin');
	});

	it("New admin add achievement", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const signers = await ethers.getSigners();
		const URIContainer = getURIContainer();

		await peeranhaUser.createUser(signers[0].address, hashContainer[0]);
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.grantRole(PROTOCOL_ADMIN_ROLE, signers[1].address);

		const tokensCount = await peeranhaNFT.balanceOf(peeranhaUser.deployTransaction.from);
		await expect(await getInt(tokensCount)).to.equal(0);
		peeranhaUser.connect(signers[1]).configureNewAchievement(100, 15, URIContainer[0], AchievementsType.Rating);
	});

	it("Add achievement without admin rights", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const signers = await ethers.getSigners();
		const URIContainer = getURIContainer();

		await peeranhaUser.createUser(signers[0].address, hashContainer[0]);
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);

		const tokensCount = await peeranhaNFT.balanceOf(peeranhaUser.deployTransaction.from);
		await expect(await getInt(tokensCount)).to.equal(0);
		await expect(peeranhaUser.connect(signers[1]).configureNewAchievement(100, 15, URIContainer[0], AchievementsType.Rating))
		.to.be.revertedWith('not_allowed_not_admin');
	});

	it("Call NFT action from NFT contract", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const signers = await ethers.getSigners();
		const URIContainer = getURIContainer();

		await peeranhaUser.createUser(signers[0].address, hashContainer[0]);
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);

		const tokensCount = await peeranhaNFT.balanceOf(peeranhaUser.deployTransaction.from);
		await expect(await getInt(tokensCount)).to.equal(0);

		await expect(peeranhaNFT.configureNewAchievementNFT(1, 15, URIContainer[0], AchievementsType.Rating))
		.to.be.revertedWith('AccessControl: account 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 is missing role 0x2f9627ff5c142077d96045d38d0d6d2cd69818f8a475262b53db7ed0d39e7b22');
	});

	it("Test give 1st NFT", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const URIContainer = getURIContainer();
		const signers = await ethers.getSigners();

		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaUser.configureNewAchievement(5, 15, URIContainer[0], AchievementsType.Rating);
		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 10, 1);
		
		const peeranhaAchievement = await peeranhaUser.getAchievementConfig(1)
		await expect(await getInt(peeranhaAchievement.factCount)).to.equal(1);

		const peeranhaAchievementNFT = await peeranhaNFT.getAchievementsNFTConfig(1)
		await expect(await getInt(peeranhaAchievementNFT.factCount)).to.equal(1);

		const tokensCount = await peeranhaNFT.balanceOf(peeranhaUser.deployTransaction.from);
		await expect(await getInt(tokensCount)).to.equal(1);
		
		const tokenId = await peeranhaNFT.tokenOfOwnerByIndex(peeranhaUser.deployTransaction.from, 0); 
		await expect(await getInt(tokenId)).to.equal(1);

		const tokenURI = await peeranhaNFT.tokenURI(tokenId);
		await expect(tokenURI).to.equal(URIContainer[0]);
	});

	it("Test add achievement after user achieved its requirements", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const URIContainer = getURIContainer();
		const signers = await ethers.getSigners();

		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 10, 1);
		await peeranhaUser.configureNewAchievement(5, 15, URIContainer[0], AchievementsType.Rating);

		const tokensCount = await peeranhaNFT.balanceOf(peeranhaUser.deployTransaction.from);
		await expect(await getInt(tokensCount)).to.equal(0);

		await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 1, 1);
		const tokensCountAfter = await peeranhaNFT.balanceOf(peeranhaUser.deployTransaction.from);
		await expect(await getInt(tokensCountAfter)).to.equal(1);
		const tokenIdAfter = await peeranhaNFT.tokenOfOwnerByIndex(peeranhaUser.deployTransaction.from, 0);
		await expect(await getInt(tokenIdAfter)).to.equal(1);
	});

	it("Test give 1st NFT (try double)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const URIContainer = getURIContainer();
		const signers = await ethers.getSigners();

		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

		await peeranhaUser.configureNewAchievement(5, 15, URIContainer[1], AchievementsType.Rating);
		await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 5, 1);
		await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, -1, 1);
		await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 1, 1);

		const peeranhaAchievement = await peeranhaUser.getAchievementConfig(1)
		await expect(await getInt(peeranhaAchievement.factCount)).to.equal(1);
	
		const peeranhaAchievementNFT = await peeranhaNFT.getAchievementsNFTConfig(1)
		await expect(await getInt(peeranhaAchievementNFT.factCount)).to.equal(1);
	});

	it("Test give 1st NFT low rating", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const URIContainer = getURIContainer();
		const signers = await ethers.getSigners();

		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

		await peeranhaUser.configureNewAchievement(5, 15, URIContainer[0], AchievementsType.Rating);
		await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 1, 1);

		const peeranhaAchievement = await peeranhaUser.getAchievementConfig(1)
		await expect(await getInt(peeranhaAchievement.factCount)).to.equal(0);
	
		const peeranhaAchievementNFT = await peeranhaNFT.getAchievementsNFTConfig(1)
		await expect(await getInt(peeranhaAchievementNFT.factCount)).to.equal(0);
	});

	it("Test give NFT 2 users", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const URIContainer = getURIContainer();
		const signers = await ethers.getSigners();

		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaUser.configureNewAchievement(5, 15, URIContainer[0], AchievementsType.Rating);

		await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 10, 1);
		await peeranhaUser.addUserRating(signers[1].address, 10, 1);

		const peeranhaAchievement = await peeranhaUser.getAchievementConfig(1)
		await expect(await getInt(peeranhaAchievement.factCount)).to.equal(2);
		const peeranhaAchievementNFT = await peeranhaNFT.getAchievementsNFTConfig(1)
		await expect(await getInt(peeranhaAchievementNFT.factCount)).to.equal(2);

		const tokensCountFirstUser = await peeranhaNFT.balanceOf(peeranhaUser.deployTransaction.from);
		await expect(await getInt(tokensCountFirstUser)).to.equal(1);
		const tokenIdFirstUser = await peeranhaNFT.tokenOfOwnerByIndex(peeranhaUser.deployTransaction.from, 0);
		await expect(await getInt(tokenIdFirstUser)).to.equal(1);

		const tokensCountSecondUser = await peeranhaNFT.balanceOf(signers[1].address);
		await expect(await getInt(tokensCountSecondUser)).to.equal(1);
		const tokenIdSecondUser = await peeranhaNFT.tokenOfOwnerByIndex(signers[1].address, 0);
		await expect(await getInt(tokenIdSecondUser)).to.equal(2);

		const tokenURIFirstUser = await peeranhaNFT.tokenURI(tokenIdFirstUser);
		await expect(tokenURIFirstUser).to.equal(URIContainer[0]);
		const tokenURISecondUser = await peeranhaNFT.tokenURI(tokenIdSecondUser);
		await expect(tokenURISecondUser).to.equal(URIContainer[0]);
	});

	it("Test give NFT 3 users with maximum count 2", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const signers = await ethers.getSigners();
		const URIContainer = getURIContainer();

		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
		await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);
		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

		await peeranhaUser.configureNewAchievement(2, 15, URIContainer[1], AchievementsType.Rating);
		await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 10, 1);
		await peeranhaUser.addUserRating(signers[1].address, 10, 1);
		await peeranhaUser.addUserRating(signers[2].address, 10, 1);

		const peeranhaAchievement = await peeranhaUser.getAchievementConfig(1)
		await expect(await getInt(peeranhaAchievement.factCount)).to.equal(2);
		const peeranhaAchievementNFT = await peeranhaNFT.getAchievementsNFTConfig(1)
		await expect(await getInt(peeranhaAchievementNFT.factCount)).to.equal(2);

		const tokensCountFirstUser = await peeranhaNFT.balanceOf(peeranhaUser.deployTransaction.from);
		await expect(await getInt(tokensCountFirstUser)).to.equal(1);
		const tokenIdFirstUser = await peeranhaNFT.tokenOfOwnerByIndex(peeranhaUser.deployTransaction.from, 0);
		await expect(await getInt(tokenIdFirstUser)).to.equal(1);

		const tokensCountSecondUser = await peeranhaNFT.balanceOf(signers[1].address);
		await expect(await getInt(tokensCountSecondUser)).to.equal(1);
		const tokenIdSecondUser = await peeranhaNFT.tokenOfOwnerByIndex(signers[1].address, 0);
		await expect(await getInt(tokenIdSecondUser)).to.equal(2);

		const tokensCountThirdUser = await peeranhaNFT.balanceOf(signers[2].address);
		await expect(await getInt(tokensCountThirdUser)).to.equal(0);
	});

	it("Test give NFTs for 2 achievements", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const URIContainer = getURIContainer();
		const signers = await ethers.getSigners();

		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

		await peeranhaUser.configureNewAchievement(5, 15, URIContainer[0], AchievementsType.Rating);
		await peeranhaUser.configureNewAchievement(5, 20, URIContainer[1], AchievementsType.Rating);

		await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 5, 1);

		const tokensCount1 = await peeranhaNFT.balanceOf(peeranhaUser.deployTransaction.from);
		await expect(await getInt(tokensCount1)).to.equal(1);
		const peeranhaAchievement1 = await peeranhaUser.getAchievementConfig(2)
		await expect(await getInt(peeranhaAchievement1.factCount)).to.equal(0);
		const peeranhaAchievementNFT1 = await peeranhaNFT.getAchievementsNFTConfig(2)
		await expect(await getInt(peeranhaAchievementNFT1.factCount)).to.equal(0);
		await expect(peeranhaAchievementNFT1.achievementURI).to.equal(URIContainer[1]);

		await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 5, 1);

		const tokensCountAfter = await peeranhaNFT.balanceOf(peeranhaUser.deployTransaction.from);
		await expect(await getInt(tokensCountAfter)).to.equal(2);
		const peeranhaAchievement2 = await peeranhaUser.getAchievementConfig(2)
		await expect(await getInt(peeranhaAchievement2.factCount)).to.equal(1);
		const peeranhaAchievementNFT2 = await peeranhaNFT.getAchievementsNFTConfig(2)
		await expect(await getInt(peeranhaAchievementNFT2.factCount)).to.equal(1);

		const tokenId = await peeranhaNFT.tokenOfOwnerByIndex(peeranhaUser.deployTransaction.from, 0);
		await expect(await getInt(tokenId)).to.equal(1);
		const tokenId2 = await peeranhaNFT.tokenOfOwnerByIndex(peeranhaUser.deployTransaction.from, 1);
		await expect(await getInt(tokenId2)).to.equal(1000001);

		const tokenURIFirstUser = await peeranhaNFT.tokenURI(tokenId);
		await expect(tokenURIFirstUser).to.equal(URIContainer[0]);
		const tokenURISecondUser = await peeranhaNFT.tokenURI(tokenId2);
		await expect(tokenURISecondUser).to.equal(URIContainer[1]);
	});

	it("Test transfer token", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const URIContainer = getURIContainer();
		const signers = await ethers.getSigners();

		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

		await peeranhaUser.configureNewAchievement(5, 15, URIContainer[0], AchievementsType.Rating);
		await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 10, 1);

		const tokensCountFirstUser = await peeranhaNFT.balanceOf(peeranhaUser.deployTransaction.from);
		await expect(await getInt(tokensCountFirstUser)).to.equal(1);
		const tokenIdFirstUser = await peeranhaNFT.tokenOfOwnerByIndex(peeranhaUser.deployTransaction.from, 0);
		await expect(await getInt(tokenIdFirstUser)).to.equal(1);
		const tokensCountSecondUser = await peeranhaNFT.balanceOf(signers[1].address);
		await expect(await getInt(tokensCountSecondUser)).to.equal(0);

		peeranhaNFT.transferFrom(peeranhaUser.deployTransaction.from, signers[1].address, 1) 

		const tokensCountFirstUser2 = await peeranhaNFT.balanceOf(peeranhaUser.deployTransaction.from);
		await expect(await getInt(tokensCountFirstUser2)).to.equal(0);
		const tokensCountSecondUser2 = await peeranhaNFT.balanceOf(signers[1].address);
		await expect(await getInt(tokensCountSecondUser2)).to.equal(1);
		const tokenIdSecondUser2 = await peeranhaNFT.tokenOfOwnerByIndex(signers[1].address, 0);
		await expect(await getInt(tokenIdSecondUser2)).to.equal(1);
	});

	it("Test update rating after transfer", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const URIContainer = getURIContainer();
		const signers = await ethers.getSigners();

		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

		await peeranhaUser.configureNewAchievement(5, 15, URIContainer[0], AchievementsType.Rating);
		await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 10, 1);

		peeranhaNFT.transferFrom(peeranhaUser.deployTransaction.from, signers[1].address, 1) 

		await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 10, 1);
		
		const tokensCount = await peeranhaNFT.balanceOf(peeranhaUser.deployTransaction.from);
		await expect(await getInt(tokensCount)).to.equal(0);
		const peeranhaAchievement = await peeranhaUser.getAchievementConfig(1)
		await expect(await getInt(peeranhaAchievement.factCount)).to.equal(1);
		const peeranhaAchievementNFT = await peeranhaNFT.getAchievementsNFTConfig(1)
		await expect(await getInt(peeranhaAchievementNFT.factCount)).to.equal(1);
	});

	describe("Test manual NFT", function () {

		it("Test add manual achievement", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const URIContainer = getURIContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[0]);

			await peeranhaUser.configureNewAchievement(10, 0, URIContainer[0], AchievementsType.Manual);

			const peeranhaAchievement = await peeranhaUser.getAchievementConfig(1)
			await expect(await getInt(peeranhaAchievement.maxCount)).to.equal(10);
			await expect(await getInt(peeranhaAchievement.factCount)).to.equal(0);
			await expect(await getInt(peeranhaAchievement.lowerBound)).to.equal(0);
			await expect(peeranhaAchievement.achievementsType).to.equal(1);
	
			const peeranhaAchievementNFT = await peeranhaNFT.getAchievementsNFTConfig(1)
			await expect(await getInt(peeranhaAchievementNFT.maxCount)).to.equal(10);
			await expect(await getInt(peeranhaAchievementNFT.factCount)).to.equal(0);
			await expect(peeranhaAchievementNFT.achievementURI).to.equal(URIContainer[0]);
			await expect(peeranhaAchievementNFT.achievementsType).to.equal(1);
		});

		it("Test give manual achievement", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const URIContainer = getURIContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[0]);

			await peeranhaUser.configureNewAchievement(10, 0, URIContainer[0], AchievementsType.Manual);
			await peeranhaUser.mintManualNFT(signers[0].address, 1);

			const peeranhaAchievement = await peeranhaUser.getAchievementConfig(1)
			await expect(await getInt(peeranhaAchievement.maxCount)).to.equal(10);
			await expect(await getInt(peeranhaAchievement.factCount)).to.equal(1);
			await expect(await getInt(peeranhaAchievement.lowerBound)).to.equal(0);
			await expect(peeranhaAchievement.achievementsType).to.equal(1);

			const peeranhaAchievementNFT = await peeranhaNFT.getAchievementsNFTConfig(1)
			await expect(await getInt(peeranhaAchievementNFT.maxCount)).to.equal(10);
			await expect(await getInt(peeranhaAchievementNFT.factCount)).to.equal(1);
			await expect(peeranhaAchievementNFT.achievementURI).to.equal(URIContainer[0]);
			await expect(peeranhaAchievementNFT.achievementsType).to.equal(1);
		});

		it("Test twice give manual achievement", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const URIContainer = getURIContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[0]);

			await peeranhaUser.configureNewAchievement(10, 0, URIContainer[0], AchievementsType.Manual);
			await peeranhaUser.mintManualNFT(signers[0].address, 1);
			await expect(peeranhaUser.mintManualNFT(signers[0].address, 1))
				.to.be.revertedWith('already issued');
		});

		it("Test mint over manual nft", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const URIContainer = getURIContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[0]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);

			await peeranhaUser.configureNewAchievement(2, 0, URIContainer[0], AchievementsType.Manual);
			await peeranhaUser.mintManualNFT(signers[0].address, 1);
			await peeranhaUser.mintManualNFT(signers[1].address, 1);
			await expect(peeranhaUser.mintManualNFT(signers[2].address, 1))
				.to.be.revertedWith('all_nfts_was_given');
		});

		it("Test give not exist manual achievement", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const URIContainer = getURIContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[0]);

			await expect(peeranhaUser.mintManualNFT(signers[0].address, 1))
				.to.be.revertedWith('you_can_not_mint_the_type');	// NFT does not exist
		});

		it("Test mint rating achievement", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const URIContainer = getURIContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[0]);

			await peeranhaUser.configureNewAchievement(10, 0, URIContainer[0], AchievementsType.Rating);
			await expect(peeranhaUser.mintManualNFT(signers[0].address, 1))
				.to.be.revertedWith('you_can_not_mint_the_type');
		});

		it("Add manual achievement without admin rights", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const URIContainer = getURIContainer();
	
			await peeranhaUser.createUser(signers[0].address, hashContainer[0]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
	
			const tokensCount = await peeranhaNFT.balanceOf(peeranhaUser.deployTransaction.from);
			await expect(await getInt(tokensCount)).to.equal(0);
			await expect(peeranhaUser.connect(signers[1]).configureNewAchievement(100, 15, URIContainer[0], AchievementsType.Manual))
				.to.be.revertedWith('not_allowed_not_admin');
		});

		it("Add manual achievement without admin rights", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const URIContainer = getURIContainer();
			await peeranhaUser.createUser(signers[0].address, hashContainer[0]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
	
			const tokensCount = await peeranhaNFT.balanceOf(peeranhaUser.deployTransaction.from);
			await expect(await getInt(tokensCount)).to.equal(0);
			await peeranhaUser.configureNewAchievement(100, 15, URIContainer[0], AchievementsType.Manual);

			await expect(peeranhaUser.connect(signers[1]).mintManualNFT(signers[0].address, 1))
				.to.be.revertedWith('not_allowed_not_admin');
		});

		it("Call NFT action from NFT contract (config manual achievement)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const URIContainer = getURIContainer();
			await peeranhaUser.createUser(signers[0].address, hashContainer[0]);
	
			await expect(peeranhaNFT.configureNewAchievementNFT(1, 15, URIContainer[0], AchievementsType.Manual))
				.to.be.revertedWith('AccessControl: account 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 is missing role 0x2f9627ff5c142077d96045d38d0d6d2cd69818f8a475262b53db7ed0d39e7b22');
		});

		xit("Call NFT action from NFT contract (mint manual achievement)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const URIContainer = getURIContainer();
			await peeranhaUser.createUser(signers[0].address, hashContainer[0]);
	
			await expect(peeranhaNFT.mint(signers[0].address, 1))
				.to.be.revertedWith('AccessControl: account 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 is missing role 0x2f9627ff5c142077d96045d38d0d6d2cd69818f8a475262b53db7ed0d39e7b22');
		});
	});

	const getURIContainer = () => {
		return [
			"0xe15b8d21c4b0507d289a6323d71f1c010b11300894755b2de46e8a149c52c999",
			"0x65ba7459c0e361157727c42aa6a3a7e0e398105c2de00cc85b10cd2960aac4ee",
			"0x4a38adfa5bc07d6d7f276275b0c04f628d7bf76e38f93cacf9bb76f263446413",
		];
	};
});
