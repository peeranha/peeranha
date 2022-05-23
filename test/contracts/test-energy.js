const { expect } = require("chai");
const { 
	wait, getHashContainer, getHashesContainer, createTags, createContract, createPeerenhaAndTokenContract,
	StartEnergy, PeriodTime, PostTypeEnum, energyDownVotePost, energyDownVoteReply, energyDownVoteComment, energyUpvotePost, energyUpvoteReply, energyUpvoteComment,
	energyPublicationPost, energyPublicationReply, energyPublicationComment, energyUpdateProfile, energyEditItem, energyDeleteItem, energyBestReply,
	energyFollowCommunity, energyForumVoteCancel, energyCreateCommunity, energyCreateTag, energyArray
} = require('./utils');

// TODO
describe("Test energy", function () {
	/*for (const { rating, energy, status } of energyArray) {
		
		it(`Test check start energy for ${status} status`, async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
        	const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaUser.addUserRating(signers[1].address, rating - 10, 1);
			await wait(PeriodTime + 10000);

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			const user = await peeranhaUser.getUserByAddress(signers[1].address);
			expect(user.energy).to.equal(energy - energyPublicationPost);		
		});
	}

	it("Test action with negetive rating", async function () {	// need?
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
		const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

		await peeranhaUser.addUserRating(signers[1].address, -20, 1);		// -10 rating = 0 energy? will check 0 energy
		await wait(PeriodTime);

		await expect(peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1])).to.be.revertedWith('low_rating_post');
	});*/

	it("Test energy. Publication post", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

		await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		const user = await peeranhaUser.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - energyPublicationPost);		
	});

	it("Test energy. Publication post (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]))
		.to.be.revertedWith('low_energy');
	}).retries(2);

	it("Test energy. Publication reply", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
     	const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.createUser(hashContainer[1]);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

		await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
		const user = await peeranhaUser.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - energyPublicationReply);		
	});

	it("Test energy. Publication reply (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
     	const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false))
		.to.be.revertedWith('low_energy');
	}).retries(2);

	it("Test energy. Publication comment", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 30, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);

		await peeranhaContent.connect(signers[1]).createComment(1, 0, hashContainer[1]);
		await peeranhaContent.connect(signers[1]).createComment(1, 1, hashContainer[1]);
		const user = await peeranhaUser.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - energyPublicationComment - energyPublicationComment);		
	});

	it("Test energy. Publication comment (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 30, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).createComment(1, 0, hashContainer[1]))
		.to.be.revertedWith('low_energy');
	}).retries(2);

	it("Test energy. Publication comment to reply (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 30, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);

		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).createComment(1, 1, hashContainer[1]))
		.to.be.revertedWith('low_energy');
	}).retries(2);

	it("Test energy. Edit post", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

		await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.connect(signers[1]).editPost(1, hashContainer[2], []);
		const user = await peeranhaUser.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - energyPublicationPost - energyEditItem);		
	});

	it("Test energy. Edit post (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

		await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaUser.setEnergy(signers[1].address, 1);

		await expect(peeranhaContent.connect(signers[1]).editPost(1, hashContainer[2], []))
			.to.be.revertedWith('low_energy');
	}).retries(2);

	it("Test energy. Edit reply", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
     	const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

		await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
		await peeranhaContent.connect(signers[1]).editReply(1, 1, hashContainer[2])

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyPublicationReply - energyEditItem);		
	}).retries(2);

	it("Test energy. Edit reply (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

		await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
		
		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).editReply(1, 1, hashContainer[2]))
			.to.be.revertedWith('low_energy');
	}).retries(2);

	/*it("Test energy. Edit comment", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 30, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);

		await peeranhaContent.connect(signers[1]).createComment(1, 0, hashContainer[1]);
		await peeranhaContent.connect(signers[1]).createComment(1, 1, hashContainer[1]);
		await peeranhaContent.connect(signers[1]).editComment(1, 0, 1, hashContainer[2]);
		await peeranhaContent.connect(signers[1]).editComment(1, 1, 1, hashContainer[2]);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - 2 * (energyPublicationComment + energyEditItem));		
	});

	it("Test energy. Edit comment (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.connect(signers[1]).createComment(1, 0, hashContainer[1]);
		
		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).editComment(1, 0, 1, hashContainer[2]))
			.to.be.revertedWith('low_energy');
	}).retries(2);

	it("Test energy. Edit comment for reply (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

		await peeranhaUser.addUserRating(signers[1].address, 30, 1);
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);
		await peeranhaContent.connect(signers[1]).createComment(1, 1, hashContainer[1]);
		
		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).editComment(1, 1, 1, hashContainer[2]))
			.to.be.revertedWith('low_energy');
	}).retries(2);

	it("Test energy. upvote post", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 30, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

		await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 1);
		const user = await peeranhaUser.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - energyUpvotePost);		
	});

	it("Test energy. upvote post (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

		
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 0);
		await expect(peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 1))
		.to.be.revertedWith('low_energy');
	}).retries(2);

	it("Test energy. down vote post", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

		await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 0);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyDownVotePost);		
	});

	it("Test energy. down vote post (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 0))
		.to.be.revertedWith('low_energy');	
	}).retries(2);

	it("Test energy. Cancel upvote post", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

		await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 1);
		await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 1);
		const user = await peeranhaUser.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - (energyUpvotePost + energyForumVoteCancel));		
	});

	it("Test energy. Cancel upvote (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);
		await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 1);

		await peeranhaUser.setEnergy(signers[1].address, 0);
		await expect(peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 1))
		.to.be.revertedWith('low_energy');
	}).retries(2);

	it("Test energy. Cancel down vote post", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);
		await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 0);
		await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 0);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - (energyDownVotePost + energyUpvotePost));		
	});

	it("Test energy. Cancel down vote post (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 0)

		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 0);
		await expect(peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 0))
		.to.be.revertedWith('low_energy');	
	}).retries(2);

	it("Test energy. upvote reply", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);

		await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 1);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyUpvoteReply);		
	});

	it("Test energy. upvote reply (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);

		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 0);
		await expect(peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 1))
		.to.be.revertedWith('low_energy');
	}).retries(2);

	it("Test energy. down vote reply", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);

		await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 0);
		const user = await peeranhaUser.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - energyDownVoteReply);
	});

	it("Test energy. down vote reply (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);

		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 0))
		.to.be.revertedWith('low_energy');	
	}).retries(2);

	it("Test energy. Cancel upvote reply", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);

		await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 1);
		await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 1);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - (energyUpvoteReply + energyForumVoteCancel));		
	});

	it("Test energy. Cancel upvote reply (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);
		await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 1);

		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 0);
		await expect(peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 1))
		.to.be.revertedWith('low_energy');
	}).retries(2);

	it("Test energy. Cancel down vote reply", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);

		await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 0);
		await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 0);
		const user = await peeranhaUser.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - (energyDownVoteReply + energyUpvoteReply));
	});

	it("Test energy. Cancel down vote reply (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);
		await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 0);

		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 0);
		await expect(peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 0))
		.to.be.revertedWith('low_energy');	
	}).retries(2);

	it("Test energy. upvote comment", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);
		await peeranhaContent.createComment(1, 0, hashContainer[1]);
		await peeranhaContent.createComment(1, 1, hashContainer[1]);

		await peeranhaContent.connect(signers[1]).voteItem(1, 0, 1, 1);
		await peeranhaContent.connect(signers[1]).voteItem(1, 1, 1, 1);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyUpvoteComment * 2);	
	});

	it("Test energy. upvote comment (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);
		await peeranhaContent.createComment(1, 0, hashContainer[1]);
		await peeranhaContent.createComment(1, 1, hashContainer[1]);

		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 0);
		await expect(peeranhaContent.connect(signers[1]).voteItem(1, 0, 1, 1))
		.to.be.revertedWith('low_energy');
		await expect(peeranhaContent.connect(signers[1]).voteItem(1, 1, 1, 1))
		.to.be.revertedWith('low_energy');
	}).retries(2);

	it("Test energy. down vote comment", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);
		await peeranhaContent.createComment(1, 0, hashContainer[1]);
		await peeranhaContent.createComment(1, 1, hashContainer[1]);

		await peeranhaContent.connect(signers[1]).voteItem(1, 0, 1, 0);
		await peeranhaContent.connect(signers[1]).voteItem(1, 1, 1, 0);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyDownVoteComment * 2);
	});

	it("Test energy. down vote comment (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);
		await peeranhaContent.createComment(1, 0, hashContainer[1]);
		await peeranhaContent.createComment(1, 1, hashContainer[1]);

		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 0);
		await expect(peeranhaContent.connect(signers[1]).voteItem(1, 0, 1, 0))
		.to.be.revertedWith('low_energy');
		await expect(peeranhaContent.connect(signers[1]).voteItem(1, 1, 1, 0))
		.to.be.revertedWith('low_energy');	
	}).retries(2);

	it("Test energy. Cancel upvote comment", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);
		await peeranhaContent.createComment(1, 0, hashContainer[1]);
		await peeranhaContent.createComment(1, 1, hashContainer[1]);

		await peeranhaContent.connect(signers[1]).voteItem(1, 0, 1, 1);
		await peeranhaContent.connect(signers[1]).voteItem(1, 1, 1, 1);
		await peeranhaContent.connect(signers[1]).voteItem(1, 0, 1, 1);
		await peeranhaContent.connect(signers[1]).voteItem(1, 1, 1, 1);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - (energyUpvoteComment + energyForumVoteCancel) * 2);	
	});

	it("Test energy. Cancel upvote comment (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);
		await peeranhaContent.createComment(1, 0, hashContainer[1]);
		await peeranhaContent.createComment(1, 1, hashContainer[1]);

		await peeranhaContent.connect(signers[1]).voteItem(1, 0, 1, 1);
		await peeranhaContent.connect(signers[1]).voteItem(1, 1, 1, 1);

		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 0);
		await expect(peeranhaContent.connect(signers[1]).voteItem(1, 0, 1, 1))
		.to.be.revertedWith('low_energy');
		await expect(peeranhaContent.connect(signers[1]).voteItem(1, 1, 1, 1))
		.to.be.revertedWith('low_energy');
	}).retries(2);

	it("Test energy. Cancel down vote comment", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);
		await peeranhaContent.createComment(1, 0, hashContainer[1]);
		await peeranhaContent.createComment(1, 1, hashContainer[1]);

		await peeranhaContent.connect(signers[1]).voteItem(1, 0, 1, 0);
		await peeranhaContent.connect(signers[1]).voteItem(1, 1, 1, 0);
		await peeranhaContent.connect(signers[1]).voteItem(1, 0, 1, 0);
		await peeranhaContent.connect(signers[1]).voteItem(1, 1, 1, 0);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - (energyDownVoteComment + energyUpvoteComment) * 2);
	});

	it("Test energy. Cancel down vote comment (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);
		await peeranhaContent.createComment(1, 0, hashContainer[1]);
		await peeranhaContent.createComment(1, 1, hashContainer[1]);

		await peeranhaContent.connect(signers[1]).voteItem(1, 0, 1, 0);
		await peeranhaContent.connect(signers[1]).voteItem(1, 1, 1, 0);

		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 0);
		await expect(peeranhaContent.connect(signers[1]).voteItem(1, 0, 1, 0))
		.to.be.revertedWith('low_energy');
		await expect(peeranhaContent.connect(signers[1]).voteItem(1, 1, 1, 0))
		.to.be.revertedWith('low_energy');	
	}).retries(2);

	it("Test energy. delete post", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.createUser(hashContainer[1]);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.connect(signers[1]).deletePost(1);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - (energyPublicationPost + energyDeleteItem));		
	});

	it("Test energy. delete post (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).deletePost(1))
		.to.be.revertedWith('low_energy');		
	}).retries(2);

	it("Test energy. delete reply", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.createUser(hashContainer[1]);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
		await peeranhaContent.connect(signers[1]).deleteReply(1, 1);

		
		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - (energyPublicationReply + energyDeleteItem));		
	});

	it("Test energy. delete reply (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
		
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).deleteReply(1, 1))
		.to.be.revertedWith('low_energy');		
	}).retries(2);

	it("Test energy. delete comment", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 35, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);
		await peeranhaContent.connect(signers[1]).createComment(1, 0, hashContainer[1]);
		await peeranhaContent.connect(signers[1]).createComment(1, 1, hashContainer[1]);
		await peeranhaContent.connect(signers[1]).deleteComment(1, 0, 1);
		await peeranhaContent.connect(signers[1]).deleteComment(1, 1, 1);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - 2 * (energyPublicationComment + energyDeleteItem));		
	});

	it("Test energy. delete comment (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 35, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.connect(signers[1]).createComment(1, 0, hashContainer[1]);

		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).deleteComment(1, 0, 1))
		.to.be.revertedWith('low_energy');
	}).retries(2);

	it("Test energy. delete comment for reply (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 35, 1);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
		await peeranhaContent.connect(signers[1]).createComment(1, 1, hashContainer[1]);

		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).deleteComment(1, 1, 1))
		.to.be.revertedWith('low_energy');
	}).retries(2);

	it("Test energy. edit profile", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.connect(signers[1]).updateUser(hashContainer[0]);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyUpdateProfile);
	});

	it("Test energy. edit profile (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);

		await peeranhaUser.setEnergy(signers[1].address, 0);
		await expect(peeranhaUser.connect(signers[1]).updateUser(hashContainer[0]))
			.to.be.revertedWith('low_energy');
	}).retries(2);

	it("Test energy. MarkBestReply", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.createUser(hashContainer[1]);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);

		await peeranhaContent.connect(signers[1]).changeStatusBestReply(1, 1);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyPublicationPost - energyBestReply);
	});

	it("Test energy. MarkBestReply and unmark", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.createUser(hashContainer[1]);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);

		await peeranhaContent.connect(signers[1]).changeStatusBestReply(1, 1);
		await peeranhaContent.connect(signers[1]).changeStatusBestReply(1, 1);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyPublicationPost - energyBestReply * 2);
	});

	it("Test energy. MarkBestReply (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);

		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, energyBestReply - 1);
		await expect(peeranhaContent.connect(signers[1]).changeStatusBestReply(1, 1))
			.to.be.revertedWith('low_energy');
	}).retries(2);

	it("Test energy. MarkBestReply and unmark (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(1, 0, hashContainer[1], false);

		await peeranhaContent.connect(signers[1]).changeStatusBestReply(1, 1);

		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, energyBestReply - 1);
		await expect(peeranhaContent.connect(signers[1]).changeStatusBestReply(1, 1))
			.to.be.revertedWith('low_energy');
	}).retries(2);

	it("Test energy. Follow community", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.createUser(hashContainer[1]);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

		await peeranhaUser.connect(signers[1]).followCommunity(1);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyFollowCommunity);
	});

	it("Test energy. Follow community (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, energyFollowCommunity - 1);
		await expect(peeranhaUser.connect(signers[1]).followCommunity(1))
		.to.be.revertedWith('low_energy');
	}).retries(2);

	it("Test energy. Unfollow community", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.createUser(hashContainer[1]);

		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

		await peeranhaUser.connect(signers[1]).followCommunity(1);
		await peeranhaUser.connect(signers[1]).unfollowCommunity(1);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyFollowCommunity);
	});

	// it("Test energy. Unfollow community (energy not enough)", async function () {	// dont need?
	// 	const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranhaUser.createUser(hashContainer[1]);

	// 	await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

	// 	await peeranhaUser.connect(signers[1]).followCommunity(1);

	// 	await peeranhaUser.setEnergy(signers[1].address, energyFollowCommunity - 1);
	// 	await expect(peeranhaUser.connect(signers[1]).unfollowCommunity(1))
	// 	.to.be.revertedWith('low_energy');
	// });

	it("Test energy. Actions by administrator", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 35, 1);
		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
		await peeranhaUser.createTag(1, hashContainer[1]);
		await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
		await peeranhaContent.connect(signers[1]).createComment(1, 0, hashContainer[1]);
		await peeranhaContent.connect(signers[1]).createComment(1, 1, hashContainer[1]);

		await peeranhaUser.followCommunity(1);
		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.createReply(2, 0, hashContainer[1], false);
		await peeranhaContent.createComment(2, 0, hashContainer[1]);
		await peeranhaContent.createComment(2, 1, hashContainer[1]);
		await peeranhaContent.editPost(2, hashContainer[2], []);
		await peeranhaContent.editReply(2, 1, hashContainer[2]);
		await peeranhaContent.editComment(2, 0, 1, hashContainer[2]);
		await peeranhaContent.editComment(2, 1, 1, hashContainer[2]);
		await peeranhaContent.voteItem(1, 0, 0, 1);
		await peeranhaContent.voteItem(1, 1, 0, 1);
		await peeranhaContent.voteItem(1, 0, 1, 1);
		await peeranhaContent.voteItem(1, 1, 1, 1);
		await peeranhaContent.voteItem(1, 0, 0, 0);
		await peeranhaContent.voteItem(1, 1, 0, 0);
		await peeranhaContent.voteItem(1, 0, 1, 0);
		await peeranhaContent.voteItem(1, 1, 1, 0);
		await peeranhaContent.changeStatusBestReply(2, 1);
		await peeranhaContent.changeStatusBestReply(2, 1);
		await peeranhaContent.deleteComment(1, 0, 1);
		await peeranhaContent.deleteComment(1, 1, 1);
		await peeranhaContent.deleteReply(1, 1);
		await peeranhaContent.deletePost(1);

		const user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
	});
	*/
});
