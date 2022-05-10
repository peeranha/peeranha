const { expect } = require("chai");
const { 
	wait, getHashContainer, getHashesContainer, createTags, createContract, createPeerenhaAndTokenContract,
	StartEnergy, PeriodTime, PostTypeEnum, energyDownVotePost, energyDownVoteReply, energyDownVoteComment, energyUpvotePost, energyUpvoteReply, energyUpvoteComment,
	energyPublicationPost, energyPublicationReply, energyPublicationComment, energyUpdateProfile, energyEditItem, energyDeleteItem, energyBestReply,
	energyFollowCommunity, energyForumVoteCancel, energyCreateCommunity, energyCreateTag, energyArray
} = require('./utils');

describe("Test energy", function () {
	for (const { rating, energy, status } of energyArray) {
		
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

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			const user = await peeranhaUser.getUserByAddress(signers[1].address);
			expect(user.energy).to.equal(energy - energyPublicationPost);		
		});
	}

	// it("Test action with negetive rating", async function () {	// need?
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
	// 	const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));

	// 	await peeranha.addUserRating(signers[1].address, -20, 1);		// -10 rating = 0 energy? will check 0 energy
	// 	await wait(PeriodTime);

	// 	await expect(peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1])).to.be.revertedWith('low_rating_post');
	// });

	// it("Test energy. Publication post", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));

	// 	await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	const user = await peeranha.getUserByAddress(signers[1].address);

	// 	await expect(user.energy).to.equal(StartEnergy - energyPublicationPost);		
	// });

	// it("Test energy. Publication post (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));

	// 	await peeranha.setEnergy(signers[1].address, 1);
	// 	await expect(peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]))
	// 	.to.be.revertedWith('Not enough energy!');
	// });

	// it("Test energy. Publication reply", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //  	const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

	// 	await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
	// 	const user = await peeranha.getUserByAddress(signers[1].address);

	// 	await expect(user.energy).to.equal(StartEnergy - energyPublicationReply);		
	// });

	// it("Test energy. Publication reply (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //  	const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

	// 	await peeranha.setEnergy(signers[1].address, 1);
	// 	await expect(peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false))
	// 	.to.be.revertedWith('Not enough energy!');
	// });

	// it("Test energy. Publication comment", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 30, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

	// 	await peeranha.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1]);
	// 	await peeranha.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[1]);
	// 	const user = await peeranha.getUserByAddress(signers[1].address);

	// 	await expect(user.energy).to.equal(StartEnergy - energyPublicationComment - energyPublicationComment);		
	// });

	// it("Test energy. Publication comment (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 30, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);

	// 	await peeranha.setEnergy(signers[1].address, 1);
	// 	await expect(peeranha.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1]))
	// 	.to.be.revertedWith('Not enough energy!');
	// });

	// it("Test energy. Publication comment to reply (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 30, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);

	// 	await peeranha.setEnergy(signers[1].address, 1);
	// 	await expect(peeranha.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[1]))
	// 	.to.be.revertedWith('Not enough energy!');
	// });

	// it("Test energy. Edit post", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));

	// 	await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[2], []);
	// 	const user = await peeranha.getUserByAddress(signers[1].address);

	// 	await expect(user.energy).to.equal(StartEnergy - energyPublicationPost - energyEditItem);		
	// });

	// it("Test energy. Edit post (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));

	// 	await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.setEnergy(signers[1].address, 1);

	// 	await expect(peeranha.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[2], []))
	// 		.to.be.revertedWith('Not enough energy!');
	// });

	// it("Test energy. Edit reply", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //  	const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
	// 	await peeranha.connect(signers[1]).editReply(signers[1].address, 1, 1, hashContainer[2])

	// 	const user = await peeranha.getUserByAddress(signers[1].address);
	// 	await expect(user.energy).to.equal(StartEnergy - energyPublicationReply - energyEditItem);		
	// });

	// it("Test energy. Edit reply (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));

	// 	await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
		
	// 	await peeranha.setEnergy(signers[1].address, 1);
	// 	await expect(peeranha.connect(signers[1]).editReply(signers[1].address, 1, 1, hashContainer[2]))
	// 		.to.be.revertedWith('Not enough energy!');
	// });

	// it("Test energy. Edit comment", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 30, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

	// 	await peeranha.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1]);
	// 	await peeranha.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[1]);
	// 	await peeranha.connect(signers[1]).editComment(signers[1].address, 1, 0, 1, hashContainer[2]);
	// 	await peeranha.connect(signers[1]).editComment(signers[1].address, 1, 1, 1, hashContainer[2]);

	// 	const user = await peeranha.getUserByAddress(signers[1].address);
	// 	await expect(user.energy).to.equal(StartEnergy - 2 * (energyPublicationComment + energyEditItem));		
	// });

	// it("Test energy. Edit comment (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));

	// 	await peeranha.addUserRating(signers[1].address, 30, 1);
	// 	await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1]);
		
	// 	await peeranha.setEnergy(signers[1].address, 1);
	// 	await expect(peeranha.connect(signers[1]).editComment(signers[1].address, 1, 0, 1, hashContainer[2]))
	// 		.to.be.revertedWith('Not enough energy!');
	// });

	// it("Test energy. Edit comment for reply (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));

	// 	await peeranha.addUserRating(signers[1].address, 30, 1);
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
	// 	await peeranha.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[1]);
		
	// 	await peeranha.setEnergy(signers[1].address, 1);
	// 	await expect(peeranha.connect(signers[1]).editComment(signers[1].address, 1, 1, 1, hashContainer[2]))
	// 		.to.be.revertedWith('Not enough energy!');
	// });

	// it("Test energy. upvote post", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 30, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1);
	// 	const user = await peeranha.getUserByAddress(signers[1].address);

	// 	await expect(user.energy).to.equal(StartEnergy - energyUpvotePost);		
	// });

	// it("Test energy. upvote post (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

	// 	await peeranha.setEnergy(signers[1].address, 0);
	// 	await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1))
	// 	.to.be.revertedWith('Not enough energy!');
	// });

	// it("Test energy. down vote post", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 0);

	// 	const user = await peeranha.getUserByAddress(signers[1].address);
	// 	await expect(user.energy).to.equal(StartEnergy - energyDownVotePost);		
	// });

	// it("Test energy. down vote post (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

	// 	await peeranha.setEnergy(signers[1].address, 1);
	// 	await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 0))
	// 	.to.be.revertedWith('Not enough energy!');	
	// });

	// it("Test energy. Cancel upvote post", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1);
	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1);
	// 	const user = await peeranha.getUserByAddress(signers[1].address);

	// 	await expect(user.energy).to.equal(StartEnergy - (energyUpvotePost + energyForumVoteCancel));		
	// });

	// it("Test energy. Cancel upvote (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1);

	// 	await peeranha.setEnergy(signers[1].address, 0);
	// 	await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1))
	// 	.to.be.revertedWith('Not enough energy!');
	// });

	// it("Test energy. Cancel down vote post", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 0);
	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 0);

	// 	const user = await peeranha.getUserByAddress(signers[1].address);
	// 	await expect(user.energy).to.equal(StartEnergy - (energyDownVotePost + energyUpvotePost));		
	// });

	// it("Test energy. Cancel down vote post (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 0)

	// 	await peeranha.setEnergy(signers[1].address, 0);
	// 	await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 0))
	// 	.to.be.revertedWith('Not enough energy!');	
	// });

	// it("Test energy. upvote reply", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1);

	// 	const user = await peeranha.getUserByAddress(signers[1].address);
	// 	await expect(user.energy).to.equal(StartEnergy - energyUpvoteReply);		
	// });

	// it("Test energy. upvote reply (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

	// 	await peeranha.setEnergy(signers[1].address, 0);
	// 	await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1))
	// 	.to.be.revertedWith('Not enough energy!');
	// });

	// it("Test energy. down vote reply", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 0);
	// 	const user = await peeranha.getUserByAddress(signers[1].address);

	// 	await expect(user.energy).to.equal(StartEnergy - energyDownVoteReply);
	// });

	// it("Test energy. down vote reply (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

	// 	await peeranha.setEnergy(signers[1].address, 1);
	// 	await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 0))
	// 	.to.be.revertedWith('Not enough energy!');	
	// });

	// it("Test energy. Cancel upvote reply", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1);
	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1);

	// 	const user = await peeranha.getUserByAddress(signers[1].address);
	// 	await expect(user.energy).to.equal(StartEnergy - (energyUpvoteReply + energyForumVoteCancel));		
	// });

	// it("Test energy. Cancel upvote reply (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1);

	// 	await peeranha.setEnergy(signers[1].address, 0);
	// 	await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1))
	// 	.to.be.revertedWith('Not enough energy!');
	// });

	// it("Test energy. Cancel down vote reply", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 0);
	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 0);
	// 	const user = await peeranha.getUserByAddress(signers[1].address);

	// 	await expect(user.energy).to.equal(StartEnergy - (energyDownVoteReply + energyUpvoteReply));
	// });

	// it("Test energy. Cancel down vote reply (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 0);

	// 	await peeranha.setEnergy(signers[1].address, 0);
	// 	await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 0))
	// 	.to.be.revertedWith('Not enough energy!');	
	// });

	// it("Test energy. upvote comment", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
	// 	await peeranha.createComment(peeranha.deployTransaction.from, 1, 0, hashContainer[1]);
	// 	await peeranha.createComment(peeranha.deployTransaction.from, 1, 1, hashContainer[1]);

	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 1);
	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 1);

	// 	const user = await peeranha.getUserByAddress(signers[1].address);
	// 	await expect(user.energy).to.equal(StartEnergy - energyUpvoteComment * 2);	
	// });

	// it("Test energy. upvote comment (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
	// 	await peeranha.createComment(peeranha.deployTransaction.from, 1, 0, hashContainer[1]);
	// 	await peeranha.createComment(peeranha.deployTransaction.from, 1, 1, hashContainer[1]);

	// 	await peeranha.setEnergy(signers[1].address, 0);
	// 	await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 1))
	// 	.to.be.revertedWith('Not enough energy!');
	// 	await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 1))
	// 	.to.be.revertedWith('Not enough energy!');
	// });

	// it("Test energy. down vote comment", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
	// 	await peeranha.createComment(peeranha.deployTransaction.from, 1, 0, hashContainer[1]);
	// 	await peeranha.createComment(peeranha.deployTransaction.from, 1, 1, hashContainer[1]);

	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 0);
	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 0);

	// 	const user = await peeranha.getUserByAddress(signers[1].address);
	// 	await expect(user.energy).to.equal(StartEnergy - energyDownVoteComment * 2);
	// });

	// it("Test energy. down vote comment (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
	// 	await peeranha.createComment(peeranha.deployTransaction.from, 1, 0, hashContainer[1]);
	// 	await peeranha.createComment(peeranha.deployTransaction.from, 1, 1, hashContainer[1]);

	// 	await peeranha.setEnergy(signers[1].address, 0);
	// 	await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 0))
	// 	.to.be.revertedWith('Not enough energy!');
	// 	await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 0))
	// 	.to.be.revertedWith('Not enough energy!');	
	// });

	// it("Test energy. Cancel upvote comment", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
	// 	await peeranha.createComment(peeranha.deployTransaction.from, 1, 0, hashContainer[1]);
	// 	await peeranha.createComment(peeranha.deployTransaction.from, 1, 1, hashContainer[1]);

	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 1);
	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 1);
	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 1);
	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 1);

	// 	const user = await peeranha.getUserByAddress(signers[1].address);
	// 	await expect(user.energy).to.equal(StartEnergy - (energyUpvoteComment + energyForumVoteCancel) * 2);	
	// });

	// it("Test energy. Cancel upvote comment (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
	// 	await peeranha.createComment(peeranha.deployTransaction.from, 1, 0, hashContainer[1]);
	// 	await peeranha.createComment(peeranha.deployTransaction.from, 1, 1, hashContainer[1]);

	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 1);
	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 1);

	// 	await peeranha.setEnergy(signers[1].address, 0);
	// 	await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 1))
	// 	.to.be.revertedWith('Not enough energy!');
	// 	await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 1))
	// 	.to.be.revertedWith('Not enough energy!');
	// });

	// it("Test energy. Cancel down vote comment", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
	// 	await peeranha.createComment(peeranha.deployTransaction.from, 1, 0, hashContainer[1]);
	// 	await peeranha.createComment(peeranha.deployTransaction.from, 1, 1, hashContainer[1]);

	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 0);
	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 0);
	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 0);
	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 0);

	// 	const user = await peeranha.getUserByAddress(signers[1].address);
	// 	await expect(user.energy).to.equal(StartEnergy - (energyDownVoteComment + energyUpvoteComment) * 2);
	// });

	// it("Test energy. Cancel down vote comment (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 100, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
	// 	await peeranha.createComment(peeranha.deployTransaction.from, 1, 0, hashContainer[1]);
	// 	await peeranha.createComment(peeranha.deployTransaction.from, 1, 1, hashContainer[1]);

	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 0);
	// 	await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 0);

	// 	await peeranha.setEnergy(signers[1].address, 0);
	// 	await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 1, 0))
	// 	.to.be.revertedWith('Not enough energy!');
	// 	await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 1, 0))
	// 	.to.be.revertedWith('Not enough energy!');	
	// });

	// it("Test energy. delete post", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.connect(signers[1]).deletePost(signers[1].address, 1);

	// 	const user = await peeranha.getUserByAddress(signers[1].address);
	// 	await expect(user.energy).to.equal(StartEnergy - (energyPublicationPost + energyDeleteItem));		
	// });

	// it("Test energy. delete post (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		
	// 	await peeranha.setEnergy(signers[1].address, 1);
	// 	await expect(peeranha.connect(signers[1]).deletePost(signers[1].address, 1))
	// 	.to.be.revertedWith('Not enough energy!');		
	// });

	// it("Test energy. delete reply", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
	// 	await peeranha.connect(signers[1]).deleteReply(signers[1].address, 1, 1);

		
	// 	const user = await peeranha.getUserByAddress(signers[1].address);
	// 	await expect(user.energy).to.equal(StartEnergy - (energyPublicationReply + energyDeleteItem));		
	// });

	// it("Test energy. delete reply (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
		
	// 	await peeranha.setEnergy(signers[1].address, 1);
	// 	await expect(peeranha.connect(signers[1]).deleteReply(signers[1].address, 1, 1))
	// 	.to.be.revertedWith('Not enough energy!');		
	// });

	// it("Test energy. delete comment", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 35, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
	// 	await peeranha.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1]);
	// 	await peeranha.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[1]);
	// 	await peeranha.connect(signers[1]).deleteComment(signers[1].address, 1, 0, 1);
	// 	await peeranha.connect(signers[1]).deleteComment(signers[1].address, 1, 1, 1);

	// 	const user = await peeranha.getUserByAddress(signers[1].address);
	// 	await expect(user.energy).to.equal(StartEnergy - 2 * (energyPublicationComment + energyDeleteItem));		
	// });

	// it("Test energy. delete comment (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 35, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1]);

	// 	await peeranha.setEnergy(signers[1].address, 1);
	// 	await expect(peeranha.connect(signers[1]).deleteComment(signers[1].address, 1, 0, 1))
	// 	.to.be.revertedWith('Not enough energy!');
	// });

	// it("Test energy. delete comment for reply (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 35, 1);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
	// 	await peeranha.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[1]);

	// 	await peeranha.setEnergy(signers[1].address, 1);
	// 	await expect(peeranha.connect(signers[1]).deleteComment(signers[1].address, 1, 1, 1))
	// 	.to.be.revertedWith('Not enough energy!');
	// });

	// it("Test energy. edit profile", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.connect(signers[1]).updateUser(signers[1].address, hashContainer[0]);

	// 	const user = await peeranha.getUserByAddress(signers[1].address);
	// 	await expect(user.energy).to.equal(StartEnergy - energyUpdateProfile);
	// });

	// it("Test energy. edit profile (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);

	// 	await peeranha.setEnergy(signers[1].address, 0);
	// 	await expect(peeranha.connect(signers[1]).updateUser(signers[1].address, hashContainer[0]))
	// 		.to.be.revertedWith('Not enough energy!');
	// });

	// it("Test energy. MarkBestReply", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

	// 	await peeranha.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);

	// 	const user = await peeranha.getUserByAddress(signers[1].address);
	// 	await expect(user.energy).to.equal(StartEnergy - energyPublicationPost - energyBestReply);
	// });

	// it("Test energy. MarkBestReply and unmark", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

	// 	await peeranha.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);
	// 	await peeranha.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);

	// 	const user = await peeranha.getUserByAddress(signers[1].address);
	// 	await expect(user.energy).to.equal(StartEnergy - energyPublicationPost - energyBestReply * 2);
	// });

	// it("Test energy. MarkBestReply (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

	// 	await peeranha.setEnergy(signers[1].address, energyBestReply - 1);
	// 	await expect(peeranha.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1))
	// 		.to.be.revertedWith('Not enough energy!');
	// });

	// it("Test energy. MarkBestReply and unmark (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

	// 	await peeranha.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);

	// 	await peeranha.setEnergy(signers[1].address, energyBestReply - 1);
	// 	await expect(peeranha.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1))
	// 		.to.be.revertedWith('Not enough energy!');
	// });

	// it("Test energy. Follow community", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));

	// 	await peeranha.connect(signers[1]).followCommunity(signers[1].address, 1);

	// 	const user = await peeranha.getUserByAddress(signers[1].address);
	// 	await expect(user.energy).to.equal(StartEnergy - energyFollowCommunity);
	// });

	// it("Test energy. Follow community (energy not enough)", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));

	// 	await peeranha.setEnergy(signers[1].address, energyFollowCommunity - 1);
	// 	await expect(peeranha.connect(signers[1]).followCommunity(signers[1].address, 1))
	// 	.to.be.revertedWith('Not enough energy!');
	// });

	// it("Test energy. Unfollow community", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.createUser(hashContainer[1]);

	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));

	// 	await peeranha.connect(signers[1]).followCommunity(signers[1].address, 1);
	// 	await peeranha.connect(signers[1]).unfollowCommunity(signers[1].address, 1);

	// 	const user = await peeranha.getUserByAddress(signers[1].address);
	// 	await expect(user.energy).to.equal(StartEnergy - energyFollowCommunity);
	// });

	// // it("Test energy. Unfollow community (energy not enough)", async function () {	// dont need?
	// // 	const peeranha = await createContract();
	// // 	const hashContainer = getHashContainer();
    // //     const ipfsHashes = getHashesContainer(2);
	// // 	const signers = await ethers.getSigners();
	// // 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// // 	await peeranha.createUser(hashContainer[1]);

	// // 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));

	// // 	await peeranha.connect(signers[1]).followCommunity(signers[1].address, 1);

	// // 	await peeranha.setEnergy(signers[1].address, energyFollowCommunity - 1);
	// // 	await expect(peeranha.connect(signers[1]).unfollowCommunity(signers[1].address, 1))
	// // 	.to.be.revertedWith('Not enough energy!');
	// // });

	// it("Test energy. Actions by administrator", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);
	// 	const signers = await ethers.getSigners();
	// 	await peeranha.createUser(hashContainer[1]);
	// 	await peeranha.connect(signers[1]).createUser(hashContainer[1]);
	// 	await peeranha.addUserRating(signers[1].address, 35, 1);
	// 	await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	// 	await peeranha.createTag(1, hashContainer[1]);
	// 	await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
	// 	await peeranha.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1]);
	// 	await peeranha.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[1]);

	// 	await peeranha.followCommunity(peeranha.deployTransaction.from, 1);
	// 	await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createReply(peeranha.deployTransaction.from, 2, 0, hashContainer[1], false);
	// 	await peeranha.createComment(peeranha.deployTransaction.from, 2, 0, hashContainer[1]);
	// 	await peeranha.createComment(peeranha.deployTransaction.from, 2, 1, hashContainer[1]);
	// 	await peeranha.editPost(peeranha.deployTransaction.from, 2, hashContainer[2], []);
	// 	await peeranha.editReply(peeranha.deployTransaction.from, 2, 1, hashContainer[2]);
	// 	await peeranha.editComment(peeranha.deployTransaction.from, 2, 0, 1, hashContainer[2]);
	// 	await peeranha.editComment(peeranha.deployTransaction.from, 2, 1, 1, hashContainer[2]);
	// 	await peeranha.voteItem(peeranha.deployTransaction.from, 1, 0, 0, 1);
	// 	await peeranha.voteItem(peeranha.deployTransaction.from, 1, 1, 0, 1);
	// 	await peeranha.voteItem(peeranha.deployTransaction.from, 1, 0, 1, 1);
	// 	await peeranha.voteItem(peeranha.deployTransaction.from, 1, 1, 1, 1);
	// 	await peeranha.voteItem(peeranha.deployTransaction.from, 1, 0, 0, 0);
	// 	await peeranha.voteItem(peeranha.deployTransaction.from, 1, 1, 0, 0);
	// 	await peeranha.voteItem(peeranha.deployTransaction.from, 1, 0, 1, 0);
	// 	await peeranha.voteItem(peeranha.deployTransaction.from, 1, 1, 1, 0);
	// 	await peeranha.changeStatusBestReply(peeranha.deployTransaction.from, 2, 1);
	// 	await peeranha.changeStatusBestReply(peeranha.deployTransaction.from, 2, 1);
	// 	await peeranha.deleteComment(peeranha.deployTransaction.from, 1, 0, 1);
	// 	await peeranha.deleteComment(peeranha.deployTransaction.from, 1, 1, 1);
	// 	await peeranha.deleteReply(peeranha.deployTransaction.from, 1, 1);
	// 	await peeranha.deletePost(peeranha.deployTransaction.from, 1);

	// 	const user = await peeranha.getUserByAddress(signers[0].address);
	// 	await expect(user.energy).to.equal(StartEnergy);
	// });
});
