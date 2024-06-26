const { expect } = require("chai");
const { 
	wait, getHashContainer, getHashesContainer, createTags, createContract, createPeerenhaAndTokenContract,
	StartEnergy, PeriodTime, PostTypeEnum, energyDownVotePost, energyDownVoteReply, energyVoteComment, energyUpvotePost, energyUpvoteReply,
	energyPublicationPost, energyPublicationReply, energyPublicationComment, energyUpdateProfile, energyEditItem, energyDeleteItem, energyBestReply,
	energyFollowCommunity, energyForumVoteCancel, energyCreateCommunity, energyCreateTag, energyArray, TRANSACTION_DELAY, LanguagesEnum
} = require('./utils');

// TODO
describe("Test energy", function () {
	/*for (const { rating, energy, status } of energyArray) {
		
		it(`Test check start energy for ${status} status`, async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
        	const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaUser.addUserRating(signers[1].address, rating - 10, 1);
			await wait(PeriodTime + 10000);

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

			const user = await peeranhaUser.getUserByAddress(signers[1].address);
			expect(user.energy).to.equal(energy - energyPublicationPost);		
		});
	}

	xit("Test action with negetive rating", async function () {	// need?
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
		const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

		await peeranhaUser.addUserRating(signers[1].address, -20, 1);		// -10 rating = 0 energy? will check 0 energy
		await wait(PeriodTime);

		await expect(peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English)).to.be.revertedWith('low_rating_post');
	});*/

	xit("Test energy. Publication post", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
		const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

		await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		
		await wait(TRANSACTION_DELAY);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - energyPublicationPost);		
	});

	xit("Test energy. Publication post (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
		const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 1);
		
		await wait(TRANSACTION_DELAY);

		await expect(peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English))
		.to.be.revertedWith('low_energy');
	}).retries(2);

	xit("Test energy. Publication reply", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
     	const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

		await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
		const user = await peeranhaUser.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - energyPublicationReply);		
	});

	xit("Test energy. Publication reply (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
     	const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English))
		.to.be.revertedWith('low_energy');
	}).retries(60);

	xit("Test energy. Publication comment", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 30, 1);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

		await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1], LanguagesEnum.English);
		await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[1], LanguagesEnum.English);
		const user = await peeranhaUser.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - energyPublicationComment - energyPublicationComment);		
	}).retries(5);

	xit("Test energy. Publication comment (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 30, 1);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1], LanguagesEnum.English))
		.to.be.revertedWith('low_energy');
	}).retries(5);

	xit("Test energy. Publication comment to reply (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 30, 1);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[1], LanguagesEnum.English))
		.to.be.revertedWith('low_energy');
	}).retries(5);

	xit("Test energy. Edit post", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

		await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[2], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
		const user = await peeranhaUser.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - energyPublicationPost - energyEditItem);		
	}).retries(5);

	xit("Test energy. Edit post (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

		await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaUser.setEnergy(signers[1].address, 1);

		await wait(TRANSACTION_DELAY);

		await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[2], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English))
			.to.be.revertedWith('low_energy');
	}).retries(5);

	xit("Test energy. Edit reply", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
     	const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

		await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
		await peeranhaContent.connect(signers[1]).editReply(signers[1].address, 1, 1, hashContainer[2], false, LanguagesEnum.English)

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyPublicationReply - energyEditItem);		
	}).retries(10);

	xit("Test energy. Edit reply (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

		await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
		
		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).editReply(signers[1].address, 1, 1, hashContainer[2], false, LanguagesEnum.English))
			.to.be.revertedWith('low_energy');
	}).retries(60);

	xit("Test energy. Edit comment", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 30, 1);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

		await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1], LanguagesEnum.English);
		await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[1], LanguagesEnum.English);
		await peeranhaContent.connect(signers[1]).editComment(signers[1].address, 1, 0, 1, hashContainer[2], LanguagesEnum.English);
		await peeranhaContent.connect(signers[1]).editComment(signers[1].address, 1, 1, 1, hashContainer[2], LanguagesEnum.English);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - 2 * (energyPublicationComment + energyEditItem));		
	}).retries(3);

	xit("Test energy. Edit comment (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaUser.addUserRating(signers[1].address, 30, 1);
		await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1], LanguagesEnum.English);
		
		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).editComment(signers[1].address, 1, 0, 1, hashContainer[2], LanguagesEnum.English))
			.to.be.revertedWith('low_energy');
	}).retries(2);

	xit("Test energy. Edit comment for reply (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

		await peeranhaUser.addUserRating(signers[1].address, 30, 1);
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
		await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[1], LanguagesEnum.English);
		
		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).editComment(signers[1].address, 1, 1, 1, hashContainer[2], LanguagesEnum.English))
			.to.be.revertedWith('low_energy');
	}).retries(2);

	xit("Test energy. upvote post", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 30, 1);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1);
		const user = await peeranhaUser.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - energyUpvotePost);		
	});

	xit("Test energy. upvote post (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

		
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 0);
		await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1))
		.to.be.revertedWith('low_energy');
	}).retries(2);

	xit("Test energy. down vote post", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 0);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyDownVotePost);		
	});

	xit("Test energy. down vote post (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 0))
		.to.be.revertedWith('low_energy');	
	}).retries(3);

	xit("Test energy. Cancel upvote post", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1);
		const user = await peeranhaUser.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - (energyUpvotePost + energyForumVoteCancel));		
	}).retries(4);

	xit("Test energy. Cancel upvote (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1);

		await peeranhaUser.setEnergy(signers[1].address, 0);
		await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1))
		.to.be.revertedWith('low_energy');
	}).retries(2);

	xit("Test energy. Cancel down vote post", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 0);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 0);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - (energyDownVotePost + energyUpvotePost));		
	}).retries(3);

	xit("Test energy. Cancel down vote post (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 30, 1);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 0)

		await peeranhaUser.setEnergy(signers[1].address, 0);
		await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 0))
		.to.be.revertedWith('low_energy');	
	}).retries(2);

	xit("Test energy. upvote reply", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyUpvoteReply);		
	});

	xit("Test energy. upvote reply (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 0);
		await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1))
		.to.be.revertedWith('low_energy');
	}).retries(2);

	xit("Test energy. down vote reply", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 0);
		const user = await peeranhaUser.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - energyDownVoteReply);
	});

	xit("Test energy. down vote reply (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);
		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 0))
		.to.be.revertedWith('low_energy');	
	}).retries(15);

	xit("Test energy. Cancel upvote reply", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - (energyUpvoteReply + energyForumVoteCancel));		
	}).retries(3);

	xit("Test energy. Cancel upvote reply (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
		
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1);

		await peeranhaUser.setEnergy(signers[1].address, 0);
		await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1))
		.to.be.revertedWith('low_energy');
	}).retries(2);

	xit("Test energy. Cancel down vote reply", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 0);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 0);
		const user = await peeranhaUser.getUserByAddress(signers[1].address);

		await expect(user.energy).to.equal(StartEnergy - (energyDownVoteReply + energyUpvoteReply));
	}).retries(3);

	xit("Test energy. Cancel down vote reply (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
		
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 0);

		await peeranhaUser.setEnergy(signers[1].address, 0);
		await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 0))
		.to.be.revertedWith('low_energy');	
	}).retries(2);

	xit("Test energy. upvote comment", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
		await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.English);
		await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.English);

		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 1);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 1);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyVoteComment * 2);	
	}).retries(2);

	xit("Test energy. upvote comment (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
		await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.English);
		await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.English);

		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 0);
		await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 1))
		.to.be.revertedWith('low_energy');
		await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 1))
		.to.be.revertedWith('low_energy');
	}).retries(2);

	xit("Test energy. down vote comment", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
		await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.English);
		await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.English);

		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 0);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 0);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyVoteComment * 2);
	}).retries(2);

	xit("Test energy. down vote comment (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
		await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.English);
		await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.English);

		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.setEnergy(signers[1].address, 0);
		await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 0))
		.to.be.revertedWith('low_energy');
		await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 0))
		.to.be.revertedWith('low_energy');	
	}).retries(2);

	xit("Test energy. Cancel upvote comment", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
		await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.English);
		await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.English);

		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 1);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 1);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 1);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 1);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - (energyVoteComment + energyForumVoteCancel) * 2);	
	}).retries(2);

	xit("Test energy. Cancel upvote comment (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
		await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.English);
		await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.English);

		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 1);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 1);

		await peeranhaUser.addUserRating(signers[1].address, 1, 1);
		await peeranhaUser.setEnergy(signers[1].address, 0);
		await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 1))
		.to.be.revertedWith('low_energy');
		await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 1))
		.to.be.revertedWith('low_energy');
	}).retries(3);

	xit("Test energy. Cancel down vote comment", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
		await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.English);
		await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.English);

		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 0);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 0);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 0);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 0);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - (energyVoteComment + energyVoteComment) * 2);
	}).retries(10);

	xit("Test energy. Cancel down vote comment (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
		await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.English);
		await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.English);

		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 100, 1);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 0);
		await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 0);

		
		await peeranhaUser.addUserRating(signers[1].address, 1, 1);
		await peeranhaUser.setEnergy(signers[1].address, 0);
		await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 0))
		.to.be.revertedWith('low_energy');
		await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 0))
		.to.be.revertedWith('low_energy');	
	}).retries(5);

	xit("Test energy. delete post", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.connect(signers[1]).deletePost(signers[1].address, 1);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - (energyPublicationPost + energyDeleteItem));		
	});

	xit("Test energy. delete post (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		
		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).deletePost(signers[1].address, 1))
		.to.be.revertedWith('low_energy');		
	}).retries(2);

	xit("Test energy. delete reply", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
		await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);

		
		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - (energyPublicationReply + energyDeleteItem));		
	});

	xit("Test energy. delete reply (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
		
		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1))
		.to.be.revertedWith('low_energy');		
	}).retries(2);

	xit("Test energy. delete comment", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
		const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 35, 1);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 35, 1);
		await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1], LanguagesEnum.English);
		
		await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[1], LanguagesEnum.English);

		await peeranhaContent.connect(signers[1]).deleteComment(signers[1].address, 1, 0, 1);

		await peeranhaContent.connect(signers[1]).deleteComment(signers[1].address, 1, 1, 1);

		await wait(TRANSACTION_DELAY);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		expect(user.energy).to.equal(StartEnergy - 2 * (energyPublicationComment + energyDeleteItem));		
	}).retries(5);

	xit("Test energy. delete comment (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 35, 1);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1], LanguagesEnum.English);

		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).deleteComment(signers[1].address, 1, 0, 1))
		.to.be.revertedWith('low_energy');
	}).retries(2);

	xit("Test energy. delete comment for reply (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 35, 1);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
		await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[1], LanguagesEnum.English);

		await peeranhaUser.setEnergy(signers[1].address, 1);
		await expect(peeranhaContent.connect(signers[1]).deleteComment(signers[1].address, 1, 1, 1))
		.to.be.revertedWith('low_energy');
	}).retries(3);

	xit("Test energy. edit profile", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.connect(signers[1]).updateUser(signers[1].address, hashContainer[0]);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyUpdateProfile);
	});

	xit("Test energy. edit profile (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);

		await peeranhaUser.setEnergy(signers[1].address, 0);
		await expect(peeranhaUser.connect(signers[1]).updateUser(signers[1].address, hashContainer[0]))
			.to.be.revertedWith('low_energy');
	}).retries(30);

	xit("Test energy. MarkBestReply", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

		await peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyPublicationPost - energyBestReply);
	}).retries(5);

	xit("Test energy. MarkBestReply and unmark", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

		await peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);
		await peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyPublicationPost - energyBestReply * 2);
	}).retries(5);

	xit("Test energy. MarkBestReply (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

		await peeranhaUser.setEnergy(signers[1].address, energyBestReply - 1);
		await expect(peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1))
			.to.be.revertedWith('low_energy');
	}).retries(5);

	xit("Test energy. MarkBestReply and unmark (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

		await peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);

		await peeranhaUser.setEnergy(signers[1].address, energyBestReply - 1);
		await expect(peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1))
			.to.be.revertedWith('low_energy');
	}).retries(5);

	xit("Test energy. Follow community", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

		await peeranhaUser.connect(signers[1]).followCommunity(signers[1].address, 1);

		await wait(TRANSACTION_DELAY);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - energyFollowCommunity);
	}).retries(5);

	xit("Test energy. Follow community (energy not enough)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
		const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		
		await peeranhaUser.setEnergy(signers[1].address, energyFollowCommunity - 1);

		await wait(TRANSACTION_DELAY);

		await expect(peeranhaUser.connect(signers[1]).followCommunity(signers[1].address, 1))
		.to.be.revertedWith('low_energy');
	}).retries(5);

	xit("Test energy. Unfollow community", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

		
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.connect(signers[1]).followCommunity(signers[1].address, 1);
		await peeranhaUser.connect(signers[1]).unfollowCommunity(signers[1].address, 1);

		const user = await peeranhaUser.getUserByAddress(signers[1].address);
		await expect(user.energy).to.equal(StartEnergy - 2 * energyFollowCommunity);
	}).retries(5);

	// xit("Test energy. Unfollow community (energy not enough)", async function () {	// dont need?
	// 	const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
	// 	await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

	// 	await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

	// 	await peeranhaUser.connect(signers[1]).followCommunity(signers[1].address, 1);

	// 	await peeranhaUser.setEnergy(signers[1].address, energyFollowCommunity - 1);
	// 	await expect(peeranhaUser.connect(signers[1]).unfollowCommunity(signers[1].address, 1))
	// 	.to.be.revertedWith('low_energy');
	// });

	xit("Test energy. Actions by administrator", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaUser.addUserRating(signers[1].address, 35, 1);
		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		let user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaCommunity.createTag(signers[0].address, 1, hashContainer[1]);
		await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1], LanguagesEnum.English);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[1], LanguagesEnum.English);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);

		// await peeranhaUser.followCommunity(signers[0].address, 1);
		// user = await peeranhaUser.getUserByAddress(signers[0].address);
		// await expect(user.energy).to.equal(StartEnergy); 	// ack
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.createReply(signers[0].address, 2, 0, hashContainer[1], false, LanguagesEnum.English);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.createComment(signers[0].address, 2, 0, hashContainer[1], LanguagesEnum.English);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.createComment(signers[0].address, 2, 1, hashContainer[1], LanguagesEnum.English);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.editPost(signers[0].address, 2, hashContainer[2], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.editReply(signers[0].address, 2, 1, hashContainer[2], false, LanguagesEnum.English);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.editComment(signers[0].address, 2, 0, 1, hashContainer[2], LanguagesEnum.English);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.editComment(signers[0].address, 2, 1, 1, hashContainer[2], LanguagesEnum.English);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.voteItem(signers[0].address, 1, 0, 1, 1);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.voteItem(signers[0].address, 1, 1, 1, 1);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 0);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.voteItem(signers[0].address, 1, 0, 1, 0);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.voteItem(signers[0].address, 1, 1, 1, 0);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.changeStatusBestReply(signers[0].address, 2, 1);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.changeStatusBestReply(signers[0].address, 2, 1);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.deleteComment(signers[0].address, 1, 0, 1);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.deleteComment(signers[0].address, 1, 1, 1);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.deleteReply(signers[0].address, 1, 1);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);
		await peeranhaContent.deletePost(signers[0].address, 1);
		user = await peeranhaUser.getUserByAddress(signers[0].address);
		await expect(user.energy).to.equal(StartEnergy);

		// await peeranhaUser.unfollowCommunity(signers[0].address, 1);
		// user = await peeranhaUser.getUserByAddress(signers[0].address);
		// await expect(user.energy).to.equal(StartEnergy); 	// ack

		// await peeranhaUser.update(hashContainer[2]);
		// user = await peeranhaUser.getUserByAddress(signers[0].address);
		// await expect(user.energy).to.equal(StartEnergy); 	// ack
	});
});
