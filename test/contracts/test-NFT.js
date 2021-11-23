const { expect } = require("chai");
const { wait, getInt, getURI } = require('./utils');
const bs58 = require('bs58');

const AchievementsType = { "Rating":0 }


describe("Test NFT", function () {
	it("Add achievement", async function () {
		const peeranhaNFT = await createContractNFT();
		const peeranhaNFTContractAddress = await peeranhaNFT.resolvedAddress.then((value) => {
			return value;
		});
		const peeranha = await createContract(peeranhaNFTContractAddress);

		const URI = await getURI("../image/image1.png");
		await peeranha.configureNewAchievement(111, 15, URI, AchievementsType.Rating);
		
		const peeranhaAchievement = await peeranha.getNFT(1)
		await expect(await getInt(peeranhaAchievement.maxCount)).to.equal(111);
		await expect(await getInt(peeranhaAchievement.factCount)).to.equal(0);
		await expect(await getInt(peeranhaAchievement.lowerBound)).to.equal(15);
		await expect(peeranhaAchievement.achievementsType).to.equal(0);

		const peeranhaAchievementNFT = await peeranhaNFT.getNFT(1)
		await expect(await getInt(peeranhaAchievementNFT.maxCount)).to.equal(111);
		await expect(await getInt(peeranhaAchievementNFT.factCount)).to.equal(0);
		await expect(peeranhaAchievementNFT.achievementURI).to.equal(URI);
		await expect(peeranhaAchievementNFT.achievementsType).to.equal(0);
	});

	it("Test give 1st NFT", async function () {
		const peeranhaNFT = await createContractNFT();
		const hashContainer = getHashContainer();
		const peeranhaNFTContractAddress = await peeranhaNFT.resolvedAddress.then((value) => {
			return value;
		});
		const peeranha = await createContract(peeranhaNFTContractAddress);
		await peeranha.createUser(hashContainer[1]);

		const URI = await getURI("../image/image1.png");
		await peeranha.configureNewAchievement(5, 15, URI, AchievementsType.Rating);
		await peeranha.addUserRating(peeranha.deployTransaction.from, 10);
		
		const peeranhaAchievement = await peeranha.getNFT(1)
		await expect(await getInt(peeranhaAchievement.factCount)).to.equal(1);

		const peeranhaAchievementNFT = await peeranhaNFT.getNFT(1)
		await expect(await getInt(peeranhaAchievementNFT.factCount)).to.equal(1);

		const tokensCount = await peeranhaNFT.balanceOf(peeranha.deployTransaction.from);
		await expect(await getInt(tokensCount)).to.equal(1);
		
		const tokenId = await peeranhaNFT.tokenOfOwnerByIndex(peeranha.deployTransaction.from, 0);
		await expect(await getInt(tokenId)).to.equal(1);
	});

	it("Test give 1st NFT (try double)", async function () {
		const peeranhaNFT = await createContractNFT();
		const hashContainer = getHashContainer();
		const peeranhaNFTContractAddress = await peeranhaNFT.resolvedAddress.then((value) => {
			return value;
		});
		const peeranha = await createContract(peeranhaNFTContractAddress);
		await peeranha.createUser(hashContainer[1]);

		const URI = await getURI("../image/image1.png");
		await peeranha.configureNewAchievement(5, 15, URI, AchievementsType.Rating);

		await peeranha.addUserRating(peeranha.deployTransaction.from, 10);
		await peeranha.addUserRating(peeranha.deployTransaction.from, 10);

		const peeranhaAchievement = await peeranha.getNFT(1)
		await expect(await getInt(peeranhaAchievement.factCount)).to.equal(1);
	
		const peeranhaAchievementNFT = await peeranhaNFT.getNFT(1)
		await expect(await getInt(peeranhaAchievementNFT.factCount)).to.equal(1);
	});

	it("Test give 1st NFT low rating", async function () {
		const peeranhaNFT = await createContractNFT();
		const hashContainer = getHashContainer();
		const peeranhaNFTContractAddress = await peeranhaNFT.resolvedAddress.then((value) => {
			return value;
		});
		const peeranha = await createContract(peeranhaNFTContractAddress);
		await peeranha.createUser(hashContainer[1]);

		const URI = await getURI("../image/image1.png");
		await peeranha.configureNewAchievement(5, 15, URI, AchievementsType.Rating);
		await peeranha.addUserRating(peeranha.deployTransaction.from, 1);

		const peeranhaAchievement = await peeranha.getNFT(1)
		await expect(await getInt(peeranhaAchievement.factCount)).to.equal(0);
	
		const peeranhaAchievementNFT = await peeranhaNFT.getNFT(1)
		await expect(await getInt(peeranhaAchievementNFT.factCount)).to.equal(0);
	});

	it("Test give NFT 2 users", async function () {
		const peeranhaNFT = await createContractNFT();
		const hashContainer = getHashContainer();
		const signers = await ethers.getSigners();
		const peeranhaNFTContractAddress = await peeranhaNFT.resolvedAddress.then((value) => {
			return value;
		});
		const peeranha = await createContract(peeranhaNFTContractAddress);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.connect(signers[1]).createUser(hashContainer[0]);

		const URI = await getURI("../image/image1.png");
		await peeranha.configureNewAchievement(5, 15, URI, AchievementsType.Rating);

		await peeranha.addUserRating(peeranha.deployTransaction.from, 10);
		await peeranha.addUserRating(signers[1].address, 10);

		const peeranhaAchievement = await peeranha.getNFT(1)
		await expect(await getInt(peeranhaAchievement.factCount)).to.equal(2);
		const peeranhaAchievementNFT = await peeranhaNFT.getNFT(1)
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

	it("Test transfer token", async function () {
		const peeranhaNFT = await createContractNFT();
		const hashContainer = getHashContainer();
		const signers = await ethers.getSigners();
		const peeranhaNFTContractAddress = await peeranhaNFT.resolvedAddress.then((value) => {
			return value;
		});
		const peeranha = await createContract(peeranhaNFTContractAddress);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.connect(signers[1]).createUser(hashContainer[0]);

		const URI = await getURI("../image/image1.png");
		await peeranha.configureNewAchievement(5, 15, URI, AchievementsType.Rating);
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


	const createContract = async function (peeranhaNFTAddress) {
		const PostLib = await ethers.getContractFactory("PostLib")
		const postLib = await PostLib.deploy();
		const Peeranha = await ethers.getContractFactory("Peeranha", {
		libraries: {
				PostLib: postLib.address,
		}
		});
		const peeranha = await Peeranha.deploy();
		await peeranha.deployed();
        await peeranha.initialize(peeranhaNFTAddress);
		return peeranha;
	};

	const createContractNFT = async function () {
		const NFT = await ethers.getContractFactory("PeeranhaNFT");
		const nft = await NFT.deploy();
		await nft.deployed();
        await nft.initialize("nft", "ecs");
		return nft;
	};

	const getHashContainer = () => {
		return [
			"0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1",
			"0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82",
			"0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
		];
	};
});
