const { expect } = require("chai");
const crypto = require("crypto");
const { wait, getBalance } = require('./utils');

const PostTypeEnum = {"ExpertPost":0, "CommonPost":1, "Tutorial":2}

describe("Test energy", function () {
    const StartEnergy = 300;
	const PeriodTime = 8000


	const energyDownVotePost = 5;
  	const energyDownVoteReply = 3;
  	const ENERGY_DOWNVOTE_COMMENT = 2;
  	const energyUpvotePost = 1;
  	const energyUpvoteReply = 1;
  	const ENERGY_UPVOTE_COMMENT = 1;
  	const ENERGY_FORUM_VOTE_CHANGE = 1;
  	const energyPublicationPost = 10;
  	const energyPublicationReply = 6;
  	const energyPublicationComment = 4;
  	const energyUpdateProfile = 1;
  	const energyEditItem = 2;
  	const energyDeleteItem = 2;
  	const energyBestReply = 1;

	  const energyArray = [
		{rating: 99, energy: 300, status: "Stranger"},
		{rating: 499, energy: 600, status: "Newbie"},
		{rating: 999, energy: 900, status: "Junior"},
		{rating: 2499, energy: 1200, status: "Resident"},
		{rating: 4999, energy: 1500, status: "Senior"},
		{rating: 9999, energy: 1800, status: "Hero"},
		{rating: 10001, energy: 2100, status: "SuperHero"},
	];

	let startRating = 0;
	for (const { rating, energy, status } of energyArray) {
		
		xit(`Test check start energy for ${status} status`, async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
        	const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[1]);
			await peeranha.connect(signers[2]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.addUserRating(signers[1].address, startRating - 9);
			await peeranha.addUserRating(signers[2].address, rating - 10);
			await wait(PeriodTime);

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[2]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			const user1 = await peeranha.getUserByAddress(signers[1].address);
			const user2 = await peeranha.getUserByAddress(signers[2].address);
			startRating = user2.rating;

			expect(user1.energy).to.equal(energy - energyPublicationPost);		
			expect(user2.energy).to.equal(energy - energyPublicationPost);		
		});
	}

	it("Test action with negetive rating", async function () {	// need?
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
		const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.createUser(hashContainer[1]);
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.addUserRating(signers[1].address, -20);		// -10 rating = 0 energy? will check 0 energy
		await wait(PeriodTime);

		await expect(peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1])).to.be.revertedWith('Your rating is too small for publication post. You need 0 ratings');
	});

	it("Test energy. Publication post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		const user = await peeranha.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - energyPublicationPost);		
	});

	it("Test energy. Publication post (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.setEnergy(signers[1].address, 1);
		await expect(peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]))
		.to.be.revertedWith('Not enought energy!');
	});

	it("Test energy. Publication reply", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
     	const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

		await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
		const user = await peeranha.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - energyPublicationReply);		
	});

	it("Test energy. Publication reply (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
     	const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

		await peeranha.setEnergy(signers[1].address, 1);
		await expect(peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false))
		.to.be.revertedWith('Not enought energy!');
	});

	it("Test energy. Publication comment", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 30);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);

		await peeranha.connect(signers[1]).createComment(1, 0, hashContainer[1]);
		await peeranha.connect(signers[1]).createComment(1, 1, hashContainer[1]);
		const user = await peeranha.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - energyPublicationComment - energyPublicationComment);		
	});

	it("Test energy. Publication comment (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 30);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);

		await peeranha.setEnergy(signers[1].address, 1);
		await expect(peeranha.connect(signers[1]).createComment(1, 0, hashContainer[1]))
		.to.be.revertedWith('Not enought energy!');
	});

	it("Test energy. Publication comment to reply (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 30);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);

		await peeranha.setEnergy(signers[1].address, 1);
		await expect(peeranha.connect(signers[1]).createComment(1, 1, hashContainer[1]))
		.to.be.revertedWith('Not enought energy!');
	});

	it("Test energy. Edit post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.connect(signers[1]).editPost(1, hashContainer[2], []);
		const user = await peeranha.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - energyPublicationPost - energyEditItem);		
	});

	it("Test energy. Edit post (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.setEnergy(signers[1].address, 1);

		await expect(peeranha.connect(signers[1]).editPost(1, hashContainer[2], []))
			.to.be.revertedWith('Not enought energy!');
	});

	it("Test energy. Edit reply", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
     	const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
		await peeranha.connect(signers[1]).editReply(1, 1, hashContainer[2])

		const user = await peeranha.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyPublicationReply - energyEditItem);		
	});

	it("Test energy. Edit reply (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
		
		await peeranha.setEnergy(signers[1].address, 1);
		await expect(peeranha.connect(signers[1]).editReply(1, 1, hashContainer[2]))
			.to.be.revertedWith('Not enought energy!');
	});

	it("Test energy. Edit comment", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 30);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

		await peeranha.connect(signers[1]).createComment(1, 0, hashContainer[1]);
		await peeranha.connect(signers[1]).editComment(1, 0, 1, hashContainer[2]);

		const user = await peeranha.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyPublicationComment - energyEditItem);		
	});

	it("Test energy. Edit comment (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.addUserRating(signers[1].address, 30);
		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.connect(signers[1]).createComment(1, 0, hashContainer[1]);
		
		await peeranha.setEnergy(signers[1].address, 1);
		await expect(peeranha.connect(signers[1]).editComment(1, 0, 1, hashContainer[2]))
			.to.be.revertedWith('Not enought energy!');
	});

	it("Test energy. upvote post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 30);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

		await peeranha.connect(signers[1]).voteItem(1, 0, 0, 1);
		const user = await peeranha.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - energyUpvotePost);		
	});

	it("Test energy. down vote post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 100);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

		await peeranha.connect(signers[1]).voteItem(1, 0, 0, 0);

		const user = await peeranha.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyDownVotePost);		
	});

	///
	// to do vote post (energy not enough) -> setEnergy()
	/// 


	/////////////////////////////////////////////////////////////////////////////////////////////////////
	// it("Test energy. upvote reply", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 30);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(1, 0, hashContainer[1], false);

	// 	await peeranha.connect(signers[1]).voteItem(1, 1, 0, 1);
	// 	const user = await peeranha.getUserByAddress(signers[1].address);

	// 	await expect(user.energy).to.equal(StartEnergy - energyUpvoteReply);		
	// });

	// it("Test energy. down vote reply", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100);
	// 	await wait(PeriodTime);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(1, 0, hashContainer[1], false);

	// 	const user1 = await peeranha.getUserByAddress(signers[1].address);
	// 	console.log(user1);

	// 	await peeranha.connect(signers[1]).voteItem(1, 1, 0, 0);
	// 	const user = await peeranha.getUserByAddress(signers[1].address);

	// 	await expect(user.energy).to.equal(600 - energyDownVoteReply);						//////////////// 600		
	// });
	///////////////////////////////////////////////////////////////////////////////////////////////////////

	
	//
	// to do vote comment
	//

	///
	// to do follow / unfollow
	///

	it("Test energy. delete post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.connect(signers[1]).deletePost(1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - (energyPublicationPost + energyDeleteItem));		
	});

	it("Test energy. delete reply", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
		await peeranha.connect(signers[1]).deleteReply(1, 1);

		
		const user = await peeranha.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - (energyPublicationReply + energyDeleteItem));		
	});

	it("Test energy. delete comment", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 35);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.connect(signers[1]).createComment(1, 0, hashContainer[1]);
		await peeranha.connect(signers[1]).deleteComment(1, 0, 1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - (energyPublicationComment + energyDeleteItem));		
	});

	it("Test energy. edit profile", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.connect(signers[1]).updateUser(hashContainer[0]);

		const user = await peeranha.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyUpdateProfile);
	});

	it("Test energy. edit profile, negative rating", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);

		await peeranha.setEnergy(signers[1].address, 0);
		await expect(peeranha.connect(signers[1]).updateUser(hashContainer[0]))
			.to.be.revertedWith('Not enought energy!');
	});

	it("Test energy. MarkBestReply", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);

		await peeranha.connect(signers[1]).changeStatusBestReply(1, 1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyPublicationReply - energyBestReply);
	});

	it("Test energy. MarkBestReply and unmark", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);

		await peeranha.connect(signers[1]).changeStatusBestReply(1, 1);
		await peeranha.connect(signers[1]).changeStatusBestReply(1, 1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyPublicationReply - energyBestReply * 2);
	});

	it("Test energy. MarkBestReply (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);

		await peeranha.setEnergy(signers[1].address, energyBestReply - 1);
		await expect(peeranha.connect(signers[1]).changeStatusBestReply(1, 1))
			.to.be.revertedWith('Not enought energy!');
	});

	it("Test energy. MarkBestReply and unmark (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);

		await peeranha.connect(signers[1]).changeStatusBestReply(1, 1);

		await peeranha.setEnergy(signers[1].address, energyBestReply - 1);
		await expect(peeranha.connect(signers[1]).changeStatusBestReply(1, 1))
			.to.be.revertedWith('Not enought energy!');
	});


	const createContract = async function () {
		const PostLib = await ethers.getContractFactory("PostLib")
		const postLib = await PostLib.deploy();
		const Peeranha = await ethers.getContractFactory("Peeranha", {
		libraries: {
				PostLib: postLib.address,
		}
		});
		const peeranha = await Peeranha.deploy();
		await peeranha.deployed();
        await peeranha.__Peeranha_init();
		return peeranha;
	};

	const getHashContainer = () => {
		return [
			"0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1",
			"0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82",
			"0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
		];
	};

	const getHashesContainer = (size) =>
        Array.apply(null, { length: size }).map(() => "0x" + crypto.randomBytes(32).toString("hex"));

    const createTags = (countOfTags) =>
        getHashesContainer(countOfTags).map((hash) => {
            const hash2 = '0x0000000000000000000000000000000000000000000000000000000000000000';
            return {"ipfsDoc": {hash, hash2}}
        });
});
