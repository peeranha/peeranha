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
		
		const buf = Buffer.from("../image/image1.png");
  		const saveResult = await getIpfsApi().add(buf);
  		const IPFSimage = await getBytes32FromData(saveResult);
	
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

	it("Test give 1st achievement", async function () {
		const peeranhaNFT = await createContractNFT();
		const hashContainer = getHashContainer();

		const buf = Buffer.from("../image/image1.png");
  		const saveResult = await getIpfsApi().add(buf);
  		const IPFSimage = await getBytes32FromData(saveResult);

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

	it("Test give 1st achievement (try double)", async function () {
		const peeranhaNFT = await createContractNFT();
		const hashContainer = getHashContainer();

		const buf = Buffer.from("../image/image1.png");
  		const saveResult = await getIpfsApi().add(buf);
  		const IPFSimage = await getBytes32FromData(saveResult);

		const peeranhaNFTContractAddress = await peeranhaNFT.resolvedAddress.then((value) => {
			return value;
		});
		const peeranha = await createContract(peeranhaNFTContractAddress);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.configureNewAchievement(5, 15, IPFSimage, AchievementsType.Rating);
		await peeranha.addUserRating(peeranha.deployTransaction.from, 10);
		await peeranha.addUserRating(peeranha.deployTransaction.from, 10);

		const peeranhaAchievement = await peeranha.getNFT(1)
		await expect(await getInt(peeranhaAchievement.factCount)).to.equal(1);
	
		const peeranhaAchievementNFT = await peeranhaNFT.getNFT(1)
		await expect(await getInt(peeranhaAchievementNFT.factCount)).to.equal(1);
	});

	it("Test give 1st achievement low rating", async function () {
		const peeranhaNFT = await createContractNFT();
		const hashContainer = getHashContainer();

		const buf = Buffer.from("../image/image1.png");
  		const saveResult = await getIpfsApi().add(buf);
  		const IPFSimage = await getBytes32FromData(saveResult);

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

	it("Test give achive 2 users", async function () {
		const peeranhaNFT = await createContractNFT();
		const hashContainer = getHashContainer();
		const signers = await ethers.getSigners();

		const buf = Buffer.from("../image/image1.png");
  		const saveResult = await getIpfsApi().add(buf);
  		const IPFSimage = await getBytes32FromData(saveResult);

		const peeranhaNFTContractAddress = await peeranhaNFT.resolvedAddress.then((value) => {
			return value;
		});
		const peeranha = await createContract(peeranhaNFTContractAddress);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.connect(signers[1]).createUser(hashContainer[0]);

		await peeranha.configureNewAchievement(5, 15, IPFSimage, AchievementsType.Rating);
		await peeranha.addUserRating(peeranha.deployTransaction.from, 10);
		await peeranha.connect(signers[1]).addUserRating(peeranha.deployTransaction.from, 10);

		const peeranhaAchievement = await peeranha.getNFT(2)
		await expect(await getInt(peeranhaAchievement.factCount)).to.equal(0);
	
		const peeranhaAchievementNFT = await peeranhaNFT.getNFT(2)
		await expect(await getInt(peeranhaAchievementNFT.factCount)).to.equal(0);
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
});
