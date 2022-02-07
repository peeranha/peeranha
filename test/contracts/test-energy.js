const { expect } = require("chai");
const crypto = require("crypto");
const { wait, getBalance } = require('./utils');

const PostTypeEnum = {"ExpertPost":0, "CommonPost":1, "Tutorial":2}

describe("Test energy", function () {
    const StartEnergy = 300;
	const PeriodTime = 14000


	const energyDownVotePost = 5;
  	const energyDownVoteReply = 3;
  	const energyDownVoteComment = 2;
  	const energyUpvotePost = 1;
  	const energyUpvoteReply = 1;
  	const energyUpvoteComment = 1;
  	const energyPublicationPost = 10;
  	const energyPublicationReply = 6;
  	const energyPublicationComment = 4;
  	const energyUpdateProfile = 1;
  	const energyEditItem = 2;
  	const energyDeleteItem = 2;
  	const energyBestReply = 1;
	const energyFollowCommunity = 1;
	const energyCreateCommunity = 125;
	const energyCreateTag = 75;

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
		
		it(`Test check start energy for ${status} status`, async function () {
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
		.to.be.revertedWith('Not enough energy!');
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
		.to.be.revertedWith('Not enough energy!');
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
		.to.be.revertedWith('Not enough energy!');
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
		.to.be.revertedWith('Not enough energy!');
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
			.to.be.revertedWith('Not enough energy!');
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
			.to.be.revertedWith('Not enough energy!');
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
		await peeranha.createReply(1, 0, hashContainer[1], false);

		await peeranha.connect(signers[1]).createComment(1, 0, hashContainer[1]);
		await peeranha.connect(signers[1]).createComment(1, 1, hashContainer[1]);
		await peeranha.connect(signers[1]).editComment(1, 0, 1, hashContainer[2]);
		await peeranha.connect(signers[1]).editComment(1, 1, 1, hashContainer[2]);

		const user = await peeranha.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - 2 * (energyPublicationComment + energyEditItem));		
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
			.to.be.revertedWith('Not enough energy!');
	});

	it("Test energy. Edit comment for reply (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.addUserRating(signers[1].address, 30);
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);
		await peeranha.connect(signers[1]).createComment(1, 1, hashContainer[1]);
		
		await peeranha.setEnergy(signers[1].address, 1);
		await expect(peeranha.connect(signers[1]).editComment(1, 1, 1, hashContainer[2]))
			.to.be.revertedWith('Not enough energy!');
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

	it("Test energy. upvote post (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 100);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

		await peeranha.setEnergy(signers[1].address, 0);
		await expect(peeranha.connect(signers[1]).voteItem(1, 0, 0, 1))
		.to.be.revertedWith('Not enough energy!');
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

	it("Test energy. down vote post (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 100);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

		await peeranha.setEnergy(signers[1].address, 1);
		await expect(peeranha.connect(signers[1]).voteItem(1, 0, 0, 0))
		.to.be.revertedWith('Not enough energy!');	
	});

	it("Test energy. Cancel upvote post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 100);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

		await peeranha.connect(signers[1]).voteItem(1, 0, 0, 1);
		await peeranha.connect(signers[1]).voteItem(1, 0, 0, 1);
		const user = await peeranha.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - (energyUpvotePost + energyDownVotePost));		
	});

	it("Test energy. Cancel upvote (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 100);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.connect(signers[1]).voteItem(1, 0, 0, 1);

		await peeranha.setEnergy(signers[1].address, 0);
		await expect(peeranha.connect(signers[1]).voteItem(1, 0, 0, 1))
		.to.be.revertedWith('Not enough energy!');
	});

	it("Test energy. Cancel down vote post", async function () {
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
		await peeranha.connect(signers[1]).voteItem(1, 0, 0, 0);

		const user = await peeranha.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - (energyDownVotePost + energyUpvotePost));		
	});

	it("Test energy. Cancel down vote post (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 100);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.connect(signers[1]).voteItem(1, 0, 0, 0)

		await peeranha.setEnergy(signers[1].address, 0);
		await expect(peeranha.connect(signers[1]).voteItem(1, 0, 0, 0))
		.to.be.revertedWith('Not enough energy!');	
	});

	it("Test energy. upvote reply", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 100);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);

		await peeranha.connect(signers[1]).voteItem(1, 1, 0, 1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyUpvoteReply);		
	});

	it("Test energy. upvote reply (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 100);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);

		await peeranha.setEnergy(signers[1].address, 0);
		await expect(peeranha.connect(signers[1]).voteItem(1, 1, 0, 1))
		.to.be.revertedWith('Not enough energy!');
	});

	it("Test energy. down vote reply", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 100);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);

		await peeranha.connect(signers[1]).voteItem(1, 1, 0, 0);
		const user = await peeranha.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - energyDownVoteReply);
	});

	it("Test energy. down vote reply (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 100);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);

		await peeranha.setEnergy(signers[1].address, 1);
		await expect(peeranha.connect(signers[1]).voteItem(1, 1, 0, 0))
		.to.be.revertedWith('Not enough energy!');	
	});

	it("Test energy. Cancel upvote reply", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 100);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);

		await peeranha.connect(signers[1]).voteItem(1, 1, 0, 1);
		await peeranha.connect(signers[1]).voteItem(1, 1, 0, 1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - (energyUpvoteReply + energyDownVoteReply));		
	});

	it("Test energy. Cancel upvote reply (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 100);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);
		await peeranha.connect(signers[1]).voteItem(1, 1, 0, 1);

		await peeranha.setEnergy(signers[1].address, 0);
		await expect(peeranha.connect(signers[1]).voteItem(1, 1, 0, 1))
		.to.be.revertedWith('Not enough energy!');
	});

	it("Test energy. Cancel down vote reply", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 100);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);

		await peeranha.connect(signers[1]).voteItem(1, 1, 0, 0);
		await peeranha.connect(signers[1]).voteItem(1, 1, 0, 0);
		const user = await peeranha.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - (energyDownVoteReply + energyUpvoteReply));
	});

	it("Test energy. Cancel down vote reply (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 100);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);
		await peeranha.connect(signers[1]).voteItem(1, 1, 0, 0);

		await peeranha.setEnergy(signers[1].address, 0);
		await expect(peeranha.connect(signers[1]).voteItem(1, 1, 0, 0))
		.to.be.revertedWith('Not enough energy!');	
	});

	it("Test energy. upvote comment", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 100);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);
		await peeranha.createComment(1, 0, hashContainer[1]);
		await peeranha.createComment(1, 1, hashContainer[1]);

		await peeranha.connect(signers[1]).voteItem(1, 0, 1, 1);
		await peeranha.connect(signers[1]).voteItem(1, 1, 1, 1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyUpvoteComment * 2);	
	});

	it("Test energy. upvote comment (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 100);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);
		await peeranha.createComment(1, 0, hashContainer[1]);
		await peeranha.createComment(1, 1, hashContainer[1]);

		await peeranha.setEnergy(signers[1].address, 0);
		await expect(peeranha.connect(signers[1]).voteItem(1, 0, 1, 1))
		.to.be.revertedWith('Not enough energy!');
		await expect(peeranha.connect(signers[1]).voteItem(1, 1, 1, 1))
		.to.be.revertedWith('Not enough energy!');
	});

	it("Test energy. down vote comment", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 100);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);
		await peeranha.createComment(1, 0, hashContainer[1]);
		await peeranha.createComment(1, 1, hashContainer[1]);

		await peeranha.connect(signers[1]).voteItem(1, 0, 1, 0);
		await peeranha.connect(signers[1]).voteItem(1, 1, 1, 0);

		const user = await peeranha.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyDownVoteComment * 2);
	});

	it("Test energy. down vote comment (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 100);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);
		await peeranha.createComment(1, 0, hashContainer[1]);
		await peeranha.createComment(1, 1, hashContainer[1]);

		await peeranha.setEnergy(signers[1].address, 0);
		await expect(peeranha.connect(signers[1]).voteItem(1, 0, 1, 0))
		.to.be.revertedWith('Not enough energy!');
		await expect(peeranha.connect(signers[1]).voteItem(1, 1, 1, 0))
		.to.be.revertedWith('Not enough energy!');	
	});

	it("Test energy. Cancel upvote comment", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 100);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);
		await peeranha.createComment(1, 0, hashContainer[1]);
		await peeranha.createComment(1, 1, hashContainer[1]);

		await peeranha.connect(signers[1]).voteItem(1, 0, 1, 1);
		await peeranha.connect(signers[1]).voteItem(1, 1, 1, 1);
		await peeranha.connect(signers[1]).voteItem(1, 0, 1, 1);
		await peeranha.connect(signers[1]).voteItem(1, 1, 1, 1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - (energyUpvoteComment + energyDownVoteComment) * 2);	
	});

	it("Test energy. Cancel upvote comment (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 100);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);
		await peeranha.createComment(1, 0, hashContainer[1]);
		await peeranha.createComment(1, 1, hashContainer[1]);

		await peeranha.connect(signers[1]).voteItem(1, 0, 1, 1);
		await peeranha.connect(signers[1]).voteItem(1, 1, 1, 1);

		await peeranha.setEnergy(signers[1].address, 0);
		await expect(peeranha.connect(signers[1]).voteItem(1, 0, 1, 1))
		.to.be.revertedWith('Not enough energy!');
		await expect(peeranha.connect(signers[1]).voteItem(1, 1, 1, 1))
		.to.be.revertedWith('Not enough energy!');
	});

	it("Test energy. Cancel down vote comment", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 100);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);
		await peeranha.createComment(1, 0, hashContainer[1]);
		await peeranha.createComment(1, 1, hashContainer[1]);

		await peeranha.connect(signers[1]).voteItem(1, 0, 1, 0);
		await peeranha.connect(signers[1]).voteItem(1, 1, 1, 0);
		await peeranha.connect(signers[1]).voteItem(1, 0, 1, 0);
		await peeranha.connect(signers[1]).voteItem(1, 1, 1, 0);

		const user = await peeranha.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - (energyDownVoteComment + energyUpvoteComment) * 2);
	});

	it("Test energy. Cancel down vote comment (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 100);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);
		await peeranha.createComment(1, 0, hashContainer[1]);
		await peeranha.createComment(1, 1, hashContainer[1]);

		await peeranha.connect(signers[1]).voteItem(1, 0, 1, 0);
		await peeranha.connect(signers[1]).voteItem(1, 1, 1, 0);

		await peeranha.setEnergy(signers[1].address, 0);
		await expect(peeranha.connect(signers[1]).voteItem(1, 0, 1, 0))
		.to.be.revertedWith('Not enough energy!');
		await expect(peeranha.connect(signers[1]).voteItem(1, 1, 1, 0))
		.to.be.revertedWith('Not enough energy!');	
	});

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

	it("Test energy. delete post (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		
		await peeranha.setEnergy(signers[1].address, 1);
		await expect(peeranha.connect(signers[1]).deletePost(1))
		.to.be.revertedWith('Not enough energy!');		
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

	it("Test energy. delete reply (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
		
		await peeranha.setEnergy(signers[1].address, 1);
		await expect(peeranha.connect(signers[1]).deleteReply(1, 1))
		.to.be.revertedWith('Not enough energy!');		
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
		await peeranha.createReply(1, 0, hashContainer[1], false);
		await peeranha.connect(signers[1]).createComment(1, 0, hashContainer[1]);
		await peeranha.connect(signers[1]).createComment(1, 1, hashContainer[1]);
		await peeranha.connect(signers[1]).deleteComment(1, 0, 1);
		await peeranha.connect(signers[1]).deleteComment(1, 1, 1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - 2 * (energyPublicationComment + energyDeleteItem));		
	});

	it("Test energy. delete comment (energy not enough)", async function () {
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

		await peeranha.setEnergy(signers[1].address, 1);
		await expect(peeranha.connect(signers[1]).deleteComment(1, 0, 1))
		.to.be.revertedWith('Not enough energy!');
	});

	it("Test energy. delete comment for reply (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 35);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
		await peeranha.connect(signers[1]).createComment(1, 1, hashContainer[1]);

		await peeranha.setEnergy(signers[1].address, 1);
		await expect(peeranha.connect(signers[1]).deleteComment(1, 1, 1))
		.to.be.revertedWith('Not enough energy!');
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

	it("Test energy. edit profile (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);

		await peeranha.setEnergy(signers[1].address, 0);
		await expect(peeranha.connect(signers[1]).updateUser(hashContainer[0]))
			.to.be.revertedWith('Not enough energy!');
	});

	it("Test energy. MarkBestReply", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);

		await peeranha.connect(signers[1]).changeStatusBestReply(1, 1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyPublicationPost - energyBestReply);
	});

	it("Test energy. MarkBestReply and unmark", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);

		await peeranha.connect(signers[1]).changeStatusBestReply(1, 1);
		await peeranha.connect(signers[1]).changeStatusBestReply(1, 1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyPublicationPost - energyBestReply * 2);
	});

	it("Test energy. MarkBestReply (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);

		await peeranha.setEnergy(signers[1].address, energyBestReply - 1);
		await expect(peeranha.connect(signers[1]).changeStatusBestReply(1, 1))
			.to.be.revertedWith('Not enough energy!');
	});

	it("Test energy. MarkBestReply and unmark (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);

		await peeranha.connect(signers[1]).changeStatusBestReply(1, 1);

		await peeranha.setEnergy(signers[1].address, energyBestReply - 1);
		await expect(peeranha.connect(signers[1]).changeStatusBestReply(1, 1))
			.to.be.revertedWith('Not enough energy!');
	});

	it("Test energy. Follow community", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.connect(signers[1]).followCommunity(1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyFollowCommunity);
	});

	it("Test energy. Follow community (energy not enough)", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.setEnergy(signers[1].address, energyFollowCommunity - 1);
		await expect(peeranha.connect(signers[1]).followCommunity(1))
		.to.be.revertedWith('Not enough energy!');
	});

	it("Test energy. Unfollow community", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.connect(signers[1]).followCommunity(1);
		await peeranha.connect(signers[1]).unfollowCommunity(1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyFollowCommunity);
	});

	// it("Test energy. Unfollow community (energy not enough)", async function () {	// dont need?
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));

	// 	await peeranha.connect(signers[1]).followCommunity(1);

	// 	await peeranha.setEnergy(signers[1].address, energyFollowCommunity - 1);
	// 	await expect(peeranha.connect(signers[1]).unfollowCommunity(1))
	// 	.to.be.revertedWith('Not enough energy!');
	// });

	it("Test energy. Actions by administrator", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranha.createUser(hashContainer[1]);
		await peeranha.connect(signers[1]).createUser(hashContainer[1]);
		await peeranha.addUserRating(signers[1].address, 35);
		await peeranha.createCommunity(ipfsHashes[0], createTags(5));
		await peeranha.createTag(1, hashContainer[1]);
		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
		await peeranha.connect(signers[1]).createComment(1, 0, hashContainer[1]);
		await peeranha.connect(signers[1]).createComment(1, 1, hashContainer[1]);

		await peeranha.followCommunity(1);
		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(2, 0, hashContainer[1], false);
		await peeranha.createComment(2, 0, hashContainer[1]);
		await peeranha.createComment(2, 1, hashContainer[1]);
		await peeranha.editPost(2, hashContainer[2], []);
		await peeranha.editReply(2, 1, hashContainer[2]);
		await peeranha.editComment(2, 0, 1, hashContainer[2]);
		await peeranha.editComment(2, 1, 1, hashContainer[2]);
		await peeranha.voteItem(1, 0, 0, 1);
		await peeranha.voteItem(1, 1, 0, 1);
		await peeranha.voteItem(1, 0, 1, 1);
		await peeranha.voteItem(1, 1, 1, 1);
		await peeranha.voteItem(1, 0, 0, 0);
		await peeranha.voteItem(1, 1, 0, 0);
		await peeranha.voteItem(1, 0, 1, 0);
		await peeranha.voteItem(1, 1, 1, 0);
		await peeranha.changeStatusBestReply(2, 1);
		await peeranha.changeStatusBestReply(2, 1);
		await peeranha.deleteComment(1, 0, 1);
		await peeranha.deleteComment(1, 1, 1);
		await peeranha.deleteReply(1, 1);
		await peeranha.deletePost(1);

		const user = await peeranha.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
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
