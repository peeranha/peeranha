const { expect } = require("chai");
const { wait, getInt, getAddressContract, createContract } = require('./utils');
const bs58 = require('bs58');

const AchievementsType = { "Rating":0 }

///
// to do
// fix tests
///

describe("Test NFT", function () {
	it("Add achievement", async function () {
		const { peeranha, peeranhaNFT } = await initContracts();
		const URIContainer = getURIContainer();

		await peeranha.configureNewAchievement(111, 15, URIContainer[0], AchievementsType.Rating);
		const peeranhaAchievement = await peeranha.getAchievementConfig(1)

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
		const { peeranha, peeranhaNFT } = await initContracts();
		const URIContainer = getURIContainer();

		await peeranha.configureNewAchievement(1, 15, URIContainer[0], AchievementsType.Rating);
		await peeranha.configureNewAchievement(999999, 100, URIContainer[1], AchievementsType.Rating);
		const peeranhaAchievement1 = await peeranha.getAchievementConfig(1);
		const peeranhaAchievement2 = await peeranha.getAchievementConfig(2);

		await expect(await getInt(peeranhaAchievement1.maxCount)).to.equal(1);
		await expect(await getInt(peeranhaAchievement2.maxCount)).to.equal(999999);

		const peeranhaAchievementNFT1 = await peeranhaNFT.getAchievementsNFTConfig(1);
		const peeranhaAchievementNFT2 = await peeranhaNFT.getAchievementsNFTConfig(2);
		await expect(await getInt(peeranhaAchievementNFT1.maxCount)).to.equal(1);
		await expect(await getInt(peeranhaAchievementNFT2.maxCount)).to.equal(999999);
	});

	it("Add achievement with 0 token pool", async function () {
		const { peeranha } = await initContracts();
		const URIContainer = getURIContainer();
	
		await expect(peeranha.configureNewAchievement(0, 15, URIContainer[0], AchievementsType.Rating))
		.to.be.revertedWith('Max count of achievements must be more than 0');
	});

	it("Add achievement with exceeded token pool", async function () {
		const { peeranha } = await initContracts();
		const URIContainer = getURIContainer();
	
		await expect(peeranha.configureNewAchievement(1000000, 15, URIContainer[0], AchievementsType.Rating))
		.to.be.revertedWith('Max count of achievements must be less than 1 000 000');
	});

	it("Add achievement without admin rights", async function () {
		const { peeranha } = await initContracts();
		const signers = await ethers.getSigners();
		const URIContainer = getURIContainer();
	
		await expect(peeranha.connect(signers[1]).configureNewAchievement(100, 15, URIContainer[0], AchievementsType.Rating))
		.to.be.revertedWith('Peeranha: must have admin role');
	});

	it("New admin add achievement", async function () {
		const { peeranha, peeranhaNFT } = await initContracts();
		const hashContainer = getHashContainer();
		const signers = await ethers.getSigners();
		const URIContainer = getURIContainer();

		await peeranha.createUser(hashContainer[0]);
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.giveAdminPermission(signers[1].address);

		const tokensCount = await peeranhaNFT.balanceOf(peeranha.deployTransaction.from);
		await expect(await getInt(tokensCount)).to.equal(0);
		peeranha.connect(signers[1]).configureNewAchievement(100, 15, URIContainer[0], AchievementsType.Rating);
	});

	it("Add achievement without owner rights", async function () {
		const { peeranha, peeranhaNFT } = await initContracts();
		const hashContainer = getHashContainer();
		const signers = await ethers.getSigners();
		const URIContainer = getURIContainer();

		await peeranha.createUser(hashContainer[0]);
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);

		const tokensCount = await peeranhaNFT.balanceOf(peeranha.deployTransaction.from);
		await expect(await getInt(tokensCount)).to.equal(0);
		await expect(peeranha.connect(signers[1]).configureNewAchievement(100, 15, URIContainer[0], AchievementsType.Rating))
		.to.be.revertedWith('Peeranha: must have admin role');
	});

	it("Call NFT action from another contract", async function () {
		const { peeranha, peeranhaNFT } = await initContracts();
		const hashContainer = getHashContainer();
		const signers = await ethers.getSigners();
		const URIContainer = getURIContainer();

		await peeranha.createUser(hashContainer[0]);
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);

		const tokensCount = await peeranhaNFT.balanceOf(peeranha.deployTransaction.from);
		await expect(await getInt(tokensCount)).to.equal(0);

		await expect(peeranhaNFT.configureNewAchievementNFT(1, 15, URIContainer[0], AchievementsType.Rating))
		.to.be.revertedWith('Ownable: caller is not the owner');

		await expect(peeranhaNFT.configureNewAchievementNFT(1, 15, URIContainer[0], AchievementsType.Rating))
		.to.be.revertedWith('Ownable: caller is not the owner');
	});

	it("Test give 1st NFT", async function () {
		const { peeranha, peeranhaNFT } = await initContracts();
		const hashContainer = getHashContainer();
		const URIContainer = getURIContainer();

		await peeranha.createUser(hashContainer[1]);

		await peeranha.configureNewAchievement(5, 15, URIContainer[0], AchievementsType.Rating);
		await peeranha.addUserRating(peeranha.deployTransaction.from, 10);
		
		const peeranhaAchievement = await peeranha.getAchievementConfig(1)
		await expect(await getInt(peeranhaAchievement.factCount)).to.equal(1);

		const peeranhaAchievementNFT = await peeranhaNFT.getAchievementsNFTConfig(1)
		await expect(await getInt(peeranhaAchievementNFT.factCount)).to.equal(1);

		const tokensCount = await peeranhaNFT.balanceOf(peeranha.deployTransaction.from);
		await expect(await getInt(tokensCount)).to.equal(1);
		
		const tokenId = await peeranhaNFT.tokenOfOwnerByIndex(peeranha.deployTransaction.from, 0);
		await expect(await getInt(tokenId)).to.equal(1);
	});

	it("Test add achievement after user achieved its requirements", async function () {
		const { peeranha, peeranhaNFT } = await initContracts();
		const hashContainer = getHashContainer();
		const URIContainer = getURIContainer();

		await peeranha.createUser(hashContainer[1]);

		await peeranha.addUserRating(peeranha.deployTransaction.from, 10);
		await peeranha.configureNewAchievement(5, 15, URIContainer[0], AchievementsType.Rating);

		const tokensCount = await peeranhaNFT.balanceOf(peeranha.deployTransaction.from);
		await expect(await getInt(tokensCount)).to.equal(0);

		await peeranha.addUserRating(peeranha.deployTransaction.from, 1);
		const tokensCountAfter = await peeranhaNFT.balanceOf(peeranha.deployTransaction.from);
		await expect(await getInt(tokensCountAfter)).to.equal(1);
		const tokenIdAfter = await peeranhaNFT.tokenOfOwnerByIndex(peeranha.deployTransaction.from, 0);
		await expect(await getInt(tokenIdAfter)).to.equal(1);
	});

	it("Test give 1st NFT (try double)", async function () {
		const { peeranha, peeranhaNFT } = await initContracts();
		const hashContainer = getHashContainer();
		const URIContainer = getURIContainer();

		await peeranha.createUser(hashContainer[1]);

		await peeranha.configureNewAchievement(5, 15, URIContainer[1], AchievementsType.Rating);
		await peeranha.addUserRating(peeranha.deployTransaction.from, 5);
		await peeranha.addUserRating(peeranha.deployTransaction.from, -1);
		await peeranha.addUserRating(peeranha.deployTransaction.from, 1);

		const peeranhaAchievement = await peeranha.getAchievementConfig(1)
		await expect(await getInt(peeranhaAchievement.factCount)).to.equal(1);
	
		const peeranhaAchievementNFT = await peeranhaNFT.getAchievementsNFTConfig(1)
		await expect(await getInt(peeranhaAchievementNFT.factCount)).to.equal(1);
	});

	it("Test give 1st NFT low rating", async function () {
		const { peeranha, peeranhaNFT } = await initContracts();
		const hashContainer = getHashContainer();
		const URIContainer = getURIContainer();

		await peeranha.createUser(hashContainer[1]);

		await peeranha.configureNewAchievement(5, 15, URIContainer[0], AchievementsType.Rating);
		await peeranha.addUserRating(peeranha.deployTransaction.from, 1);

		const peeranhaAchievement = await peeranha.getAchievementConfig(1)
		await expect(await getInt(peeranhaAchievement.factCount)).to.equal(0);
	
		const peeranhaAchievementNFT = await peeranhaNFT.getAchievementsNFTConfig(1)
		await expect(await getInt(peeranhaAchievementNFT.factCount)).to.equal(0);
	});

	it("Test give NFT 2 users", async function () {
		const { peeranha, peeranhaNFT } = await initContracts();
		const hashContainer = getHashContainer();
		const URIContainer = getURIContainer();
		const signers = await ethers.getSigners();

		await peeranha.createUser(hashContainer[1]);
		await peeranha.connect(signers[1]).createUser(hashContainer[0]);

		await peeranha.configureNewAchievement(5, 15, URIContainer[0], AchievementsType.Rating);

		await peeranha.addUserRating(peeranha.deployTransaction.from, 10);
		await peeranha.addUserRating(signers[1].address, 10);

		const peeranhaAchievement = await peeranha.getAchievementConfig(1)
		await expect(await getInt(peeranhaAchievement.factCount)).to.equal(2);
		const peeranhaAchievementNFT = await peeranhaNFT.getAchievementsNFTConfig(1)
		await expect(await getInt(peeranhaAchievementNFT.factCount)).to.equal(2);

		const tokensCountFirstUser = await peeranhaNFT.balanceOf(peeranha.deployTransaction.from);
		await expect(await getInt(tokensCountFirstUser)).to.equal(1);
		const tokenIdFirstUser = await peeranhaNFT.tokenOfOwnerByIndex(peeranha.deployTransaction.from, 0);
		await expect(await getInt(tokenIdFirstUser)).to.equal(1);

		const tokensCountSecondUser = await peeranhaNFT.balanceOf(signers[1].address);
		await expect(await getInt(tokensCountSecondUser)).to.equal(1);
		const tokenIdSecondUser = await peeranhaNFT.tokenOfOwnerByIndex(signers[1].address, 0);
		await expect(await getInt(tokenIdSecondUser)).to.equal(2);
	});

	it("Test give NFT 3 users with maximum count 2", async function () {
		const { peeranha, peeranhaNFT } = await initContracts();
		const hashContainer = getHashContainer();
		const signers = await ethers.getSigners();
		const URIContainer = getURIContainer();

		await peeranha.createUser(hashContainer[1]);
		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.connect(signers[2]).createUser(hashContainer[1]);

		await peeranha.configureNewAchievement(2, 15, URIContainer[1], AchievementsType.Rating);
		await peeranha.addUserRating(peeranha.deployTransaction.from, 10);
		await peeranha.addUserRating(signers[1].address, 10);
		await peeranha.addUserRating(signers[2].address, 10);

		const peeranhaAchievement = await peeranha.getAchievementConfig(1)
		await expect(await getInt(peeranhaAchievement.factCount)).to.equal(2);
		const peeranhaAchievementNFT = await peeranhaNFT.getAchievementsNFTConfig(1)
		await expect(await getInt(peeranhaAchievementNFT.factCount)).to.equal(2);

		const tokensCountFirstUser = await peeranhaNFT.balanceOf(peeranha.deployTransaction.from);
		await expect(await getInt(tokensCountFirstUser)).to.equal(1);
		const tokenIdFirstUser = await peeranhaNFT.tokenOfOwnerByIndex(peeranha.deployTransaction.from, 0);
		await expect(await getInt(tokenIdFirstUser)).to.equal(1);

		const tokensCountSecondUser = await peeranhaNFT.balanceOf(signers[1].address);
		await expect(await getInt(tokensCountSecondUser)).to.equal(1);
		const tokenIdSecondUser = await peeranhaNFT.tokenOfOwnerByIndex(signers[1].address, 0);
		await expect(await getInt(tokenIdSecondUser)).to.equal(2);

		const tokensCountThirdUser = await peeranhaNFT.balanceOf(signers[2].address);
		await expect(await getInt(tokensCountThirdUser)).to.equal(0);
	});

	it("Test give NFTs for 2 achievements", async function () {
		const { peeranha, peeranhaNFT } = await initContracts();
		const hashContainer = getHashContainer();
		const URIContainer = getURIContainer();

		await peeranha.createUser(hashContainer[1]);

		await peeranha.configureNewAchievement(5, 15, URIContainer[0], AchievementsType.Rating);
		await peeranha.configureNewAchievement(5, 20, URIContainer[1], AchievementsType.Rating);
		await peeranha.addUserRating(peeranha.deployTransaction.from, 5);

		const tokensCount1 = await peeranhaNFT.balanceOf(peeranha.deployTransaction.from);
		await expect(await getInt(tokensCount1)).to.equal(1);
		const peeranhaAchievement1 = await peeranha.getAchievementConfig(2)
		await expect(await getInt(peeranhaAchievement1.factCount)).to.equal(0);
		const peeranhaAchievementNFT1 = await peeranhaNFT.getAchievementsNFTConfig(2)
		await expect(await getInt(peeranhaAchievementNFT1.factCount)).to.equal(0);

		await peeranha.addUserRating(peeranha.deployTransaction.from, 5);

		const tokensCountAfter = await peeranhaNFT.balanceOf(peeranha.deployTransaction.from);
		await expect(await getInt(tokensCountAfter)).to.equal(2);
		const peeranhaAchievement2 = await peeranha.getAchievementConfig(2)
		await expect(await getInt(peeranhaAchievement2.factCount)).to.equal(1);
		const peeranhaAchievementNFT2 = await peeranhaNFT.getAchievementsNFTConfig(2)
		await expect(await getInt(peeranhaAchievementNFT2.factCount)).to.equal(1);

		const tokenId2 = await peeranhaNFT.tokenOfOwnerByIndex(peeranha.deployTransaction.from, 1);
		await expect(await getInt(tokenId2)).to.equal(1000001);
	});

	it("Test transfer token", async function () {
		const { peeranha, peeranhaNFT } = await initContracts();
		const hashContainer = getHashContainer();
		const URIContainer = getURIContainer();
		const signers = await ethers.getSigners();

		await peeranha.createUser(hashContainer[1]);
		await peeranha.connect(signers[1]).createUser(hashContainer[0]);

		await peeranha.configureNewAchievement(5, 15, URIContainer[0], AchievementsType.Rating);
		await peeranha.addUserRating(peeranha.deployTransaction.from, 10);

		const tokensCountFirstUser = await peeranhaNFT.balanceOf(peeranha.deployTransaction.from);
		await expect(await getInt(tokensCountFirstUser)).to.equal(1);
		const tokenIdFirstUser = await peeranhaNFT.tokenOfOwnerByIndex(peeranha.deployTransaction.from, 0);
		await expect(await getInt(tokenIdFirstUser)).to.equal(1);
		const tokensCountSecondUser = await peeranhaNFT.balanceOf(signers[1].address);
		await expect(await getInt(tokensCountSecondUser)).to.equal(0);

		peeranhaNFT.transferFrom(peeranha.deployTransaction.from, signers[1].address, 1) 

		const tokensCountFirstUser2 = await peeranhaNFT.balanceOf(peeranha.deployTransaction.from);
		await expect(await getInt(tokensCountFirstUser2)).to.equal(0);
		const tokensCountSecondUser2 = await peeranhaNFT.balanceOf(signers[1].address);
		await expect(await getInt(tokensCountSecondUser2)).to.equal(1);
		const tokenIdSecondUser2 = await peeranhaNFT.tokenOfOwnerByIndex(signers[1].address, 0);
		await expect(await getInt(tokenIdSecondUser2)).to.equal(1);
	});


	const createContractNFT = async function () {
		const NFT = await ethers.getContractFactory("PeeranhaNFT");
		const nft = await NFT.deploy();
		await nft.deployed();
        await nft.initialize("nft", "ecs");
		return nft;
	};

	const initContracts = async function () {
		const peeranhaNFT = await createContractNFT();
		const peeranhaNFTContractAddress = await getAddressContract(peeranhaNFT);
		const peeranha = await createContract(peeranhaNFTContractAddress);
		const peeranhaContractAddress = await getAddressContract(peeranha);
		await peeranhaNFT.transferOwnership(peeranhaContractAddress);

		return { "peeranhaNFT": peeranhaNFT,
				 "peeranha": peeranha				  
		}
	}

	const getHashContainer = () => {
		return [
			"0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1",
			"0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82",
			"0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
		];
	};

	const getURIContainer = () => {
		return [
			"0xe15b8d21c4b0507d289a6323d71f1c010b11300894755b2de46e8a149c52c999",
			"0x65ba7459c0e361157727c42aa6a3a7e0e398105c2de00cc85b10cd2960aac4ee",
			"0x4a38adfa5bc07d6d7f276275b0c04f628d7bf76e38f93cacf9bb76f263446413",
		];
	};
});
