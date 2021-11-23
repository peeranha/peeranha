const { expect } = require("chai");
const { wait, getBalance, getInt } = require('./utils');
const { create } = require('ipfs-http-client');
const bs58 = require('bs58');

const AchievementsType = { "Rating":0 }
const IPFS_API_URL = "https://api.thegraph.com/ipfs/api/v0"


describe("Test NFT", function () {
	it("Add achievement", async function () {
		const peeranhaNFT = await createContractNFT();
		const peeranhaNFTContractAddress = await peeranhaNFT.resolvedAddress.then((value) => {
			return value;
		});
		const peeranha = await createContract(peeranhaNFTContractAddress);
  		const IPFSimage = await createIpfsImage("../image/image1.png");
	
		await peeranha.configureNewAchievement(111, 15, IPFSimage, AchievementsType.Rating);
		
		const peeranhaAchievement = await peeranha.getNFT(1)
		await expect(await getInt(peeranhaAchievement.maxCount)).to.equal(111);
		await expect(await getInt(peeranhaAchievement.factCount)).to.equal(0);
		await expect(await getInt(peeranhaAchievement.lowerBound)).to.equal(15);
		await expect(peeranhaAchievement.achievementsType).to.equal(0);

		const peeranhaAchievementNFT = await peeranhaNFT.getNFT(1)
		await expect(await getInt(peeranhaAchievementNFT.maxCount)).to.equal(111);
		await expect(await getInt(peeranhaAchievementNFT.factCount)).to.equal(0);
		await expect(peeranhaAchievementNFT.achievementURI).to.equal(IPFSimage);
		await expect(peeranhaAchievementNFT.achievementsType).to.equal(0);
	});

	it("Add achievement with 0 token pool", async function () {
		const peeranhaNFT = await createContractNFT();
		const peeranhaNFTContractAddress = await peeranhaNFT.resolvedAddress.then((value) => {
			return value;
		});
		const peeranha = await createContract(peeranhaNFTContractAddress);
		const IPFSimage = await createIpfsImage("../image/image1.png");
	
		await expect(peeranha.configureNewAchievement(0, 15, IPFSimage, AchievementsType.Rating))
		.to.be.revertedWith('Max count of achievements must be more than 0');
	});

	it("Add achievement with exceeded token pool", async function () {
		const peeranhaNFT = await createContractNFT();
		const peeranhaNFTContractAddress = await peeranhaNFT.resolvedAddress.then((value) => {
			return value;
		});
		const peeranha = await createContract(peeranhaNFTContractAddress);
		const IPFSimage = await createIpfsImage("../image/image1.png");
	
		await peeranha.configureNewAchievement(1000001, 15, IPFSimage, AchievementsType.Rating);
	});

	it("Add achievement without admin rights", async function () {
		const peeranhaNFT = await createContractNFT();
		const peeranhaNFTContractAddress = await peeranhaNFT.resolvedAddress.then((value) => {
			return value;
		});
		const signers = await ethers.getSigners();
		const peeranha = await createContract(peeranhaNFTContractAddress);
		const IPFSimage = await createIpfsImage("../image/image1.png");
	
		await expect(peeranha.connect(signers[1]).configureNewAchievement(1000000, 15, IPFSimage, AchievementsType.Rating))
		.to.be.revertedWith('Peeranha: must have admin role');
	});

	it("Add achievement without owner rights", async function () {
		const peeranhaNFT = await createContractNFT();
		const peeranhaNFTContractAddress = await peeranhaNFT.resolvedAddress.then((value) => {
			return value;
		});
		const hashContainer = getHashContainer();
		const signers = await ethers.getSigners();
		const peeranha = await createContract(peeranhaNFTContractAddress);
		const IPFSimage = await createIpfsImage("../image/image1.png");
		await peeranha.createUser(hashContainer[0]);
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.giveAdminPermission(signers[1].address);

		const tokensCount = await peeranhaNFT.balanceOf(peeranha.deployTransaction.from);
		await expect(await getInt(tokensCount)).to.equal(0);
		peeranha.connect(signers[1]).configureNewAchievement(1000000, 15, IPFSimage, AchievementsType.Rating);
	
		await peeranha.addUserRating(peeranha.deployTransaction.from, 10);
		
		const peeranhaAchievement = await peeranha.getNFT(1)
		await expect(await getInt(peeranhaAchievement.factCount)).to.equal(1);

		const peeranhaAchievementNFT = await peeranhaNFT.getNFT(1)
		await expect(await getInt(peeranhaAchievementNFT.factCount)).to.equal(1);

		const tokensCountAfter = await peeranhaNFT.balanceOf(peeranha.deployTransaction.from);
		await expect(await getInt(tokensCountAfter)).to.equal(1);
		
		const tokenId = await peeranhaNFT.tokenOfOwnerByIndex(peeranha.deployTransaction.from, 0);
		await expect(await getInt(tokenId)).to.equal(1);
	});

	it("Test give 1st NFT", async function () {
		const peeranhaNFT = await createContractNFT();
		const hashContainer = getHashContainer();
		const IPFSimage = await createIpfsImage("../image/image1.png");

		const peeranhaNFTContractAddress = await peeranhaNFT.resolvedAddress.then((value) => {
			return value;
		});
		const peeranha = await createContract(peeranhaNFTContractAddress);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.configureNewAchievement(5, 15, IPFSimage, AchievementsType.Rating);
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

	it("Test add achievement after user achieved its requirements", async function () {
		const peeranhaNFT = await createContractNFT();
		const hashContainer = getHashContainer();
		const IPFSimage = await createIpfsImage("../image/image1.png");

		const peeranhaNFTContractAddress = await peeranhaNFT.resolvedAddress.then((value) => {
			return value;
		});
		const peeranha = await createContract(peeranhaNFTContractAddress);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.addUserRating(peeranha.deployTransaction.from, 10);
		await peeranha.configureNewAchievement(5, 15, IPFSimage, AchievementsType.Rating);

		const tokensCount = await peeranhaNFT.balanceOf(peeranha.deployTransaction.from);
		await expect(await getInt(tokensCount)).to.equal(0);

		await peeranha.addUserRating(peeranha.deployTransaction.from, 1);
		const tokensCountAfter = await peeranhaNFT.balanceOf(peeranha.deployTransaction.from);
		await expect(await getInt(tokensCountAfter)).to.equal(1);
		const tokenIdAfter = await peeranhaNFT.tokenOfOwnerByIndex(peeranha.deployTransaction.from, 0);
		await expect(await getInt(tokenIdAfter)).to.equal(1);
	});

	it("Test give 1st NFT (try double)", async function () {
		const peeranhaNFT = await createContractNFT();
		const hashContainer = getHashContainer();
		const IPFSimage = await createIpfsImage("../image/image1.png");

		const peeranhaNFTContractAddress = await peeranhaNFT.resolvedAddress.then((value) => {
			return value;
		});
		const peeranha = await createContract(peeranhaNFTContractAddress);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.configureNewAchievement(5, 15, IPFSimage, AchievementsType.Rating);
		await peeranha.addUserRating(peeranha.deployTransaction.from, 5);
		await peeranha.addUserRating(peeranha.deployTransaction.from, -1);
		await peeranha.addUserRating(peeranha.deployTransaction.from, 1);

		const peeranhaAchievement = await peeranha.getNFT(1)
		await expect(await getInt(peeranhaAchievement.factCount)).to.equal(1);
	
		const peeranhaAchievementNFT = await peeranhaNFT.getNFT(1)
		await expect(await getInt(peeranhaAchievementNFT.factCount)).to.equal(1);
	});

	it("Test give 1st NFT low rating", async function () {
		const peeranhaNFT = await createContractNFT();
		const hashContainer = getHashContainer();
		const IPFSimage = await createIpfsImage("../image/image1.png");

		const peeranhaNFTContractAddress = await peeranhaNFT.resolvedAddress.then((value) => {
			return value;
		});
		const peeranha = await createContract(peeranhaNFTContractAddress);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.configureNewAchievement(5, 15, IPFSimage, AchievementsType.Rating);
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
		const IPFSimage = await createIpfsImage("../image/image1.png");

		const peeranhaNFTContractAddress = await peeranhaNFT.resolvedAddress.then((value) => {
			return value;
		});
		const peeranha = await createContract(peeranhaNFTContractAddress);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.connect(signers[1]).createUser(hashContainer[0]);

		await peeranha.configureNewAchievement(5, 15, IPFSimage, AchievementsType.Rating);
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

	it("Test give NFT 3 users with maximum count 2", async function () {
		const peeranhaNFT = await createContractNFT();
		const hashContainer = getHashContainer();
		const signers = await ethers.getSigners();
		const IPFSimage = await createIpfsImage("../image/image1.png");

		const peeranhaNFTContractAddress = await peeranhaNFT.resolvedAddress.then((value) => {
			return value;
		});
		const peeranha = await createContract(peeranhaNFTContractAddress);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.connect(signers[2]).createUser(hashContainer[1]);

		await peeranha.configureNewAchievement(2, 15, IPFSimage, AchievementsType.Rating);
		await peeranha.addUserRating(peeranha.deployTransaction.from, 10);
		await peeranha.addUserRating(signers[1].address, 10);
		await peeranha.addUserRating(signers[2].address, 10);

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

		const tokensCountThirdUser = await peeranhaNFT.balanceOf(signers[2].address);
		await expect(await getInt(tokensCountThirdUser)).to.equal(0);
	});

	it("Test transfer token", async function () {
		const peeranhaNFT = await createContractNFT();
		const hashContainer = getHashContainer();
		const signers = await ethers.getSigners();
		const IPFSimage = await createIpfsImage("../image/image1.png");

		const peeranhaNFTContractAddress = await peeranhaNFT.resolvedAddress.then((value) => {
			return value;
		});
		const peeranha = await createContract(peeranhaNFTContractAddress);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.connect(signers[1]).createUser(hashContainer[0]);

		await peeranha.configureNewAchievement(5, 15, IPFSimage, AchievementsType.Rating);
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

	const createContractToken = async function (peeranhaAddress) {
		const Token = await ethers.getContractFactory("PeeranhaToken");
		const token = await Token.deploy();
		await token.deployed();
        await token.initialize("token", "ecs", peeranhaAddress);
		return token;
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

	function getIpfsApi() {
		return create(IPFS_API_URL);
	}

	async function getBytes32FromData(data) {
		const ipfsHash = await saveText(JSON.stringify(data));
		return getBytes32FromIpfsHash(ipfsHash)
	}

	async function saveText(text) {
		const buf = Buffer.from(text, 'utf8');
		const saveResult = await getIpfsApi().add(buf);
		return saveResult.cid.toString();
	}

	function getBytes32FromIpfsHash(ipfsListing) {
		return "0x"+bs58.decode(ipfsListing).slice(2).toString('hex')
	}

	async function createIpfsImage(imagePass) {
		const buf = Buffer.from(imagePass);
  		const saveResult = await getIpfsApi().add(buf);
  		return await getBytes32FromData(saveResult);
	}
});
