const { expect } = require("chai");
const { 
	wait, createPeerenhaAndTokenContract, registerTwoUsers, createUserWithAnotherRating, getHashContainer, getHashesContainer, createTags,
	PostTypeEnum, StartRating, StartRatingWithoutAction, deleteTime, DeleteOwnReply, QuickReplyTime,
    DownvoteExpertPost, UpvotedExpertPost, DownvotedExpertPost, DownvoteCommonPost, UpvotedCommonPost, DownvotedCommonPost,
    ModeratorDeletePost, DownvoteExpertReply, UpvotedExpertReply, DownvotedExpertReply, AcceptExpertReply, AcceptedExpertReply, 
    FirstExpertReply, QuickExpertReply, DownvoteCommonReply, UpvotedCommonReply, DownvotedCommonReply, AcceptCommonReply,
    AcceptedCommonReply, FirstCommonReply, QuickCommonReply, ModeratorDeleteReply, ModeratorDeleteComment,
	DownvoteTutorial, UpvotedTutorial, DownvotedTutorial, DeleteOwnPost,
} = require('./utils');

///
// rewrite to common user do action
// finish Test best reply expert -> common...
// Test upVote own comment
// upvote/downvote comment
// different community
// upvote/ downvote comment -> delete
///

describe("Test vote", function () {

	describe("Test upVote post", function () {

		it("Test upVote expert post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(StartRating + UpvotedExpertPost);
			await expect(post.rating).to.equal(1);
			
			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('0x01');
		});

		it("Test upVote common post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(StartRating + UpvotedCommonPost);
			await expect(post.rating).to.equal(1);

			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('0x01');
		});

		/* - */ xit("Test upVote tutorial post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(StartRating + UpvotedTutorial);
			await expect(post.rating).to.equal(1);
			
			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('0x01');
		});
	});

	describe("Test double upVote post", function () {

		it("Test double upVote expert post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.addUserRating(signers[1].address, 25, 1);
			const oldUserRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			const post = await peeranhaContent.getPost(1);
            await expect(userRating).to.equal(oldUserRating);
			await expect(post.rating).to.equal(0);

			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});

		it("Test double upVote common post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.addUserRating(signers[1].address, 25, 1);
			const oldUserRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(oldUserRating);
			await expect(post.rating).to.equal(0);

			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});

		/* - */ xit("Test double upVote tutorial post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(StartRating);
			await expect(post.rating).to.equal(0);
		});
	});

	describe("Test upVote own post", function () {

		it("Test upVote own expert post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1)).to.be.revertedWith('You can not vote for own post');

			
			const userRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1)
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(StartRatingWithoutAction);
			await expect(post.rating).to.equal(0);
		});

		it("Test upVote own common post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await expect(peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1)).to.be.revertedWith('You can not vote for own post');

			const userRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1)
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(StartRatingWithoutAction);
			await expect(post.rating).to.equal(0);
		});

		it("Test upVote own tutorial post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await expect(peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1)).to.be.revertedWith('You can not vote for own post');

			const userRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1)
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(StartRatingWithoutAction);
			await expect(post.rating).to.equal(0);
		});
	});

	describe("Test downVote post", function () {

		it("Test downVote expert post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(StartRating + DownvotedExpertPost);
			await expect(userRating2).to.equal(StartRating + DownvoteExpertPost);
			await expect(post.rating).to.equal(-1);

			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('-0x01');
		});

		it("Test downVote common post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(StartRating + DownvotedCommonPost);
			await expect(userRating2).to.equal(StartRating + DownvoteCommonPost);
			await expect(post.rating).to.equal(-1);

			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('-0x01');
		});

		it("Test downVote tutorial post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(StartRating + DownvotedTutorial);
			await expect(userRating2).to.equal(StartRating + DownvoteTutorial);
			await expect(post.rating).to.equal(-1);

         const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('-0x01');
		});
	});

	describe("Test double downVote post", function () {

		it("Test double downVote expert post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 0);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 0);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRatingAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(StartRating);
			await expect(userRatingAction).to.equal(StartRating);
			await expect(post.rating).to.equal(0);

			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});

		it("Test double downVote common post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 0);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRatingAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(StartRating);
			await expect(userRatingAction).to.equal(StartRating);
			await expect(post.rating).to.equal(0);

			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});

		it("Test double downVote tutorial post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 0);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRatingAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(StartRating);
			await expect(userRatingAction).to.equal(StartRating);
			await expect(post.rating).to.equal(0);

            const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});
	});

	describe("Test downVote own post", function () {

		it("Test downVote own expert post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 0)).to.be.revertedWith('You can not vote for own post');

			const userRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(StartRatingWithoutAction);
			await expect(post.rating).to.equal(0);
		});

		it("Test downVote own common post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await expect(peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 0)).to.be.revertedWith('You can not vote for own post');

			const userRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(StartRatingWithoutAction);
			await expect(post.rating).to.equal(0);
		});

		it("Test downVote own tutorial post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await expect(peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 0)).to.be.revertedWith('You can not vote for own post');

			const userRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(StartRatingWithoutAction);
			await expect(post.rating).to.equal(0);
		});
	});

	describe("Test change vote for post", function () {

		it("Test downVote after upvote expert post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRatingAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(StartRating + DownvotedExpertPost);
			await expect(userRatingAction).to.equal(StartRating + DownvoteExpertPost);
			await expect(post.rating).to.equal(-1);

			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('-0x01');
		});

		it("Test upvote after downvote expert post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await registerTwoUsers(peeranhaUser, signers, hashContainer);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 0);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRatingAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(StartRating + UpvotedExpertPost);
			await expect(userRatingAction).to.equal(StartRating);
			await expect(post.rating).to.equal(1);

			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('0x01');
		});

		it("Test downvote after upvote common post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await registerTwoUsers(peeranhaUser, signers, hashContainer);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRatingAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(StartRating + DownvotedCommonPost);
			await expect(userRatingAction).to.equal(StartRating + DownvoteCommonPost);
			await expect(post.rating).to.equal(-1);

			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('-0x01');
		});
		
		it("Test upvote after downvote common post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await registerTwoUsers(peeranhaUser, signers, hashContainer);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 0);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRatingAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(StartRating + UpvotedCommonPost);
			await expect(userRatingAction).to.equal(StartRating);
			await expect(post.rating).to.equal(1);

			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('0x01');
		});

        it("Test downvote after upvote tutorial post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await registerTwoUsers(peeranhaUser, signers, hashContainer);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRatingAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(StartRating + DownvotedTutorial);
			await expect(userRatingAction).to.equal(StartRating + DownvoteTutorial);
			await expect(post.rating).to.equal(-1);

			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('-0x01');
		});

		it("Test upvote after downvote tutorial post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await registerTwoUsers(peeranhaUser, signers, hashContainer);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 0);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRatingAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(StartRating + UpvotedTutorial);
			await expect(userRatingAction).to.equal(StartRating);
			await expect(post.rating).to.equal(1);

            const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('0x01');
		});
	});

	describe("Test delete post after vote for post", function () {

		it("Test delete post after upvote expert post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRatingAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);	
			await expect(userRating).to.equal(StartRating + UpvotedExpertPost);
			await expect(userRatingAction).to.equal(StartRatingWithoutAction);

			await peeranhaContent.connect(signers[1]).deletePost(signers[1].address, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);	
			await expect(newUserRating).to.equal(StartRating + DeleteOwnPost);
			await expect(newUserActionRating).to.equal(StartRatingWithoutAction);
		});

		it("Test delete post after upvote common post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRatingAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);	
			await expect(userRating).to.equal(StartRating + UpvotedCommonPost);
			await expect(userRatingAction).to.equal(StartRatingWithoutAction);

			await peeranhaContent.connect(signers[1]).deletePost(signers[1].address, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);	
			await expect(newUserRating).to.equal(StartRating + DeleteOwnPost);
			await expect(newUserActionRating).to.equal(StartRatingWithoutAction);
		});

		it("Test delete post after upvote tutorial ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);


			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRatingAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);	
			await expect(userRating).to.equal(StartRating + UpvotedTutorial);
			await expect(userRatingAction).to.equal(StartRatingWithoutAction);

			await peeranhaContent.connect(signers[1]).deletePost(signers[1].address, 1);
			
			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(StartRating + DeleteOwnPost);
			await expect(newUserActionRating).to.equal(StartRatingWithoutAction);
		});

		it("Test delete post after downvote expert post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.addUserRating(signers[1].address, 10, 1);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 0);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRatingAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRating + DownvotedExpertPost + 10);		// + 10 because addUserRating(...)
			await expect(userRatingAction).to.equal(StartRating + DownvoteExpertPost);

			await peeranhaContent.connect(signers[1]).deletePost(signers[1].address, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(StartRating + DownvotedExpertPost + DeleteOwnPost + 10);	// + 10 because addUserRating(...)
			await expect(newUserActionRating).to.equal(StartRating + DownvoteExpertPost);
		});

		it("Test delete post after downvote common post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.addUserRating(signers[1].address, 10, 1);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRatingAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRating + DownvotedCommonPost + 10); 		// + 10 because addUserRating(...)
			await expect(userRatingAction).to.equal(StartRating + DownvoteCommonPost);

			await peeranhaContent.connect(signers[1]).deletePost(signers[1].address, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(StartRating + DownvotedCommonPost + DeleteOwnPost + 10); // + 10 because addUserRating(...)
			await expect(newUserActionRating).to.equal(StartRating + DownvoteCommonPost);
		});

		it("Test delete post after downvote tutorial", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRatingAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRating + DownvotedTutorial);
			await expect(userRatingAction).to.equal(StartRating + DownvoteTutorial);

			await peeranhaContent.connect(signers[1]).deletePost(signers[1].address, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(StartRating + DownvotedCommonPost + DeleteOwnPost);
			await expect(newUserActionRating).to.equal(StartRating + DownvoteCommonPost);
		});
	});

	describe("Test delete post after vote for reply", function () {

		it("Test delete post after upvote expert reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);

			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			
			const userRating2 = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating2).to.equal(userRating + UpvotedExpertReply);
			await expect(userActionRating2).to.equal(userActionRating);

			await peeranhaContent.deletePost(peeranhaContent.deployTransaction.from, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
            await expect(newUserRating).to.equal(StartRating);
			await expect(newUserActionRating).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test delete post after upvote common reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);

			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);

			const userRating2 = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			
			await expect(userRating2).to.equal(userRating + UpvotedCommonReply);
			await expect(userActionRating2).to.equal(userActionRating);

			await peeranhaContent.deletePost(peeranhaContent.deployTransaction.from, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(StartRating);
			await expect(newUserActionRating).to.equal(StartRating + DeleteOwnReply);
		});

		/* - */ xit("Test delete post after upvote tutorial reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);

			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);

			const userRating2 = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);		
			await expect(userRating2).to.equal(userRating);
			await expect(userActionRating2).to.equal(userActionRating);

			await peeranhaContent.deletePost(peeranhaContent.deployTransaction.from, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(StartRating);
			await expect(newUserActionRating).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test delete post after downvote expert reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);		
			await expect(userRating).to.equal(StartRating + DownvotedExpertReply);
			await expect(userActionRating).to.equal(StartRating + DownvoteExpertReply);

			await peeranhaContent.deletePost(peeranhaContent.deployTransaction.from, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);	

			await expect(newUserRating).to.equal(StartRating + DownvotedExpertReply);
			await expect(newUserActionRating).to.equal(StartRating + DownvoteExpertReply + DeleteOwnReply);	
		});

		it("Test delete post after downvote common reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRating + DownvotedCommonReply);
			await expect(userActionRating).to.equal(StartRating + DownvoteCommonReply);

			await peeranhaContent.deletePost(peeranhaContent.deployTransaction.from, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(StartRating + DownvotedCommonReply);
			await expect(newUserActionRating).to.equal(StartRating + DownvoteCommonReply + DeleteOwnReply);
		});

		/* - */ xit("Test delete post after downvote tutorial reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRating);
			await expect(userActionRating).to.equal(StartRating);

			await peeranhaContent.deletePost(peeranhaContent.deployTransaction.from, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(StartRating);
			await expect(newUserActionRating).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test delete post after choosing best expert reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			
			const userRating2 = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating2).to.equal(userRating + AcceptExpertReply);
			await expect(userActionRating2).to.equal(StartRating + AcceptedExpertReply);

			await peeranhaContent.deletePost(peeranhaContent.deployTransaction.from, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(StartRating);
			await expect(newUserActionRating).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test delete post after choosing best common reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);

			const userRating2 = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);	
			await expect(userRating2).to.equal(userRating + AcceptCommonReply);
			await expect(userActionRating2 ).to.equal(StartRating + AcceptedCommonReply);

			await peeranhaContent.deletePost(peeranhaContent.deployTransaction.from, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(StartRating);
			await expect(newUserActionRating).to.equal(StartRating + DeleteOwnReply);
		});

		/* - */ xit("Test delete post after choosing best tutorial reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);

			const userRating2 = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);		
			await expect(userRating2).to.equal(userRating);
			await expect(userActionRating2).to.equal(userActionRating);

			await peeranhaContent.deletePost(peeranhaContent.deployTransaction.from, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(StartRating);
			await expect(newUserActionRating).to.equal(StartRating + DeleteOwnReply);
		});
	});
	
	describe("Test delete post one period after vote for reply", function () {

		it("Test delete post one period after create expert reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);		
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);		

			await wait(deleteTime);	
			await peeranhaContent.deletePost(peeranhaContent.deployTransaction.from, 1);

            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);		
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);	
            await expect(newUserRating).to.equal(userRating);
			await expect(newUserActionRating).to.equal(userActionRating + DeleteOwnReply + StartRating);
		});

		it("Test delete post one period after create common reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);		
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);		

			await wait(deleteTime);
			await peeranhaContent.deletePost(peeranhaContent.deployTransaction.from, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);		
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);		

			await expect(newUserRating).to.equal(userRating);
			await expect(newUserActionRating).to.equal(userActionRating + StartRating + DeleteOwnReply);
		});

		/* - */ xit("Test delete post one period after create tutorial reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);

			await wait(deleteTime);
			await peeranhaContent.deletePost(peeranhaContent.deployTransaction.from, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(StartRating);
			await expect(newUserActionRating).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test delete post one period after upvote expert reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);

			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await wait(deleteTime);

			await peeranhaContent.deletePost(peeranhaContent.deployTransaction.from, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(userRating + UpvotedExpertReply);
			await expect(newUserActionRating).to.equal(userActionRating + StartRating + DeleteOwnReply);
		});

		it("Test delete post one period after upvote common reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);

			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await wait(deleteTime);

			await peeranhaContent.deletePost(peeranhaContent.deployTransaction.from, 1);

            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(userRating + UpvotedCommonReply);
			await expect(newUserActionRating).to.equal(userActionRating + StartRating + DeleteOwnReply);
		});

		/* - */ xit("Test delete post one period after upvote tutorial reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);

			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await wait(deleteTime);
			await peeranhaContent.deletePost(peeranhaContent.deployTransaction.from, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(StartRating);
			await expect(newUserActionRating).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test delete post one period after choosing best expert reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			await wait(deleteTime);

			await peeranhaContent.deletePost(peeranhaContent.deployTransaction.from, 1);

            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(userRating + AcceptExpertReply);
			await expect(newUserActionRating).to.equal(userActionRating + StartRating + DeleteOwnReply);
		});

		it("Test delete post one period after choosing best common reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
         const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			await wait(deleteTime);

			await peeranhaContent.deletePost(peeranhaContent.deployTransaction.from, 1);

         const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(userRating + AcceptCommonReply);
			await expect(newUserActionRating).to.equal(userActionRating + StartRating + DeleteOwnReply);
		});

		/* - */ xit("Test delete post one period after choosing best tutorial reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			await wait(deleteTime);
			await peeranhaContent.deletePost(peeranhaContent.deployTransaction.from, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(StartRating);
			await expect(newUserActionRating).to.equal(StartRating + DeleteOwnReply);
		});
	});

	describe("Test delete own post/reply", function () {

		it("Test delete own post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);	
			await peeranhaContent.deletePost(peeranhaContent.deployTransaction.from, 1);

         const userRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("Test delete own reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);

			await peeranhaContent.deleteReply(peeranhaContent.deployTransaction.from, 1, 1);
         const userRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnReply);
		});
	});

	describe("Test create first reply", function () {

		it("Test create first expert reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await wait(QuickReplyTime);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);

            const userRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRating + FirstExpertReply);

			const reply = await peeranhaContent.getReply(1, 1);
			await expect(reply.isFirstReply).to.equal(true);
			await expect(reply.isQuickReply).to.equal(false);
		});

		it("Test create first common reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await wait(QuickReplyTime);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);

            const userRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRating + FirstCommonReply);

			const reply = await peeranhaContent.getReply(1, 1);
			await expect(reply.isFirstReply).to.equal(true);
			await expect(reply.isQuickReply).to.equal(false);
		});

		/* - */ xit("Test create first tutorial reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await wait(QuickReplyTime);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);

			const userRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRating);

			const reply = await peeranhaContent.getReply(1, 1);
			await expect(reply.isFirstReply).to.equal(false);
			await expect(reply.isQuickReply).to.equal(false);
		});
	});

	describe("Test create first and quick reply", function () {

		it("Test create first and quick expert reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);

            const userRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

			const reply = await peeranhaContent.getReply(1, 1);
			await expect(reply.isFirstReply).to.equal(true);
			await expect(reply.isQuickReply).to.equal(true);
		});

		it("Test create first and quick common reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);

            const userRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);

			const reply = await peeranhaContent.getReply(1, 1);
			await expect(reply.isFirstReply).to.equal(true);
			await expect(reply.isQuickReply).to.equal(true);
		});

		/* - */ xit("Test create first and quick tutorial reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);

            const userRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRating);

			const reply = await peeranhaContent.getReply(1, 1);
			await expect(reply.isFirstReply).to.equal(false);
			await expect(reply.isQuickReply).to.equal(false);
		});
	});

	describe("Test create first and quick reply for own post", function () {

		it("Test create first and quick expert reply for own post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);

            const userRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRatingWithoutAction);

			const reply = await peeranhaContent.getReply(1, 1);
			await expect(reply.isFirstReply).to.equal(false);
			await expect(reply.isQuickReply).to.equal(false);
		});

		it("Test create first and quick common reply for own post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);

            const userRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRatingWithoutAction);

			const reply = await peeranhaContent.getReply(1, 1);
			await expect(reply.isFirstReply).to.equal(false);
			await expect(reply.isQuickReply).to.equal(false);
		});

		/* - */ xit("Test create first and quick tutorial reply for own post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);

            const userRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRating);

			const reply = await peeranhaContent.getReply(1, 1);
			await expect(reply.isFirstReply).to.equal(false);
			await expect(reply.isQuickReply).to.equal(false);
		});
	});

	describe("Test upVote reply", function () {

		it("Test upVote expert reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false)
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);

            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const reply = await peeranhaContent.getReply(1, 1);
			await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply + UpvotedExpertReply);
			await expect(reply.rating).to.equal(1);
			
			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('0x01');
		});

		it("Test upVote common reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false)
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);

            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const reply = await peeranhaContent.getReply(1, 1);
			await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply + UpvotedCommonReply);
			await expect(reply.rating).to.equal(1);
			
			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('0x01');
		});

		/* - */ xit("Test upVote tutorial reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false)
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);

         const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const reply = await peeranhaContent.getReply(1, 1);
			await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply + UpvotedCommonReply);
			await expect(reply.rating).to.equal(1);
			
			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('0x01');
		});
	});

	describe("Test downVote reply", function () {

		it("Test downVote expert reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false)
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);

            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const reply = await peeranhaContent.getReply(1, 1);
			await expect(userRating).to.equal(StartRating + DownvotedExpertReply);
			await expect(reply.rating).to.equal(-1);
			
			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('-0x01');
		});

		it("Test downVote common reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false)
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);

            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const reply = await peeranhaContent.getReply(1, 1);
			await expect(userRating).to.equal(StartRating + DownvotedCommonReply);
			await expect(reply.rating).to.equal(-1);
			
			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('-0x01');
		});

		/* - */ xit("Test downVote tutorial reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false)
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);

            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const reply = await peeranhaContent.getReply(1, 1);
			await expect(userRating).to.equal(StartRating + DownvotedCommonReply);
			await expect(reply.rating).to.equal(-1);
			
			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('-0x01');
		});
	});

	describe("Test double upVote reply", function () {

		it("Test double upVote expert reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.addUserRating(signers[1].address, 30, 1);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false)
			await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1);
			await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1);

            const userRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const reply = await peeranhaContent.getReply(1, 1);
			await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
			await expect(reply.rating).to.equal(0);
			
			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});

		it("Test double upVote common reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.addUserRating(signers[1].address, 30, 1);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false)
			await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1);
			await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1);

            const userRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const reply = await peeranhaContent.getReply(1, 1);
			await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			await expect(reply.rating).to.equal(0);
			
			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});

		/* - */ xit("Test double upVote tutorial reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false)
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);

            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const reply = await peeranhaContent.getReply(1, 1);
			await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			await expect(reply.rating).to.equal(0);
			
			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});
	});

	describe("Test double downVote reply", function () {

		it("Test double downVote expert reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false)
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);

            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const reply = await peeranhaContent.getReply(1, 1);
			await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
			await expect(reply.rating).to.equal(0);
			
			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});

		it("Test double downVote common reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false)
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);

            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const reply = await peeranhaContent.getReply(1, 1);
			await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			await expect(reply.rating).to.equal(0);
			
			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});

		/* - */ xit("Test double downVote tutorial reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false)
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);

            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const reply = await peeranhaContent.getReply(1, 1);
			await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			await expect(reply.rating).to.equal(0);
			
			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});
	});

	describe("Test upVote own reply", function () {

		it("Test upVote own expert reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false)
			await expect(peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1)).to.be.revertedWith('You can not vote for own reply');

            const userRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const reply = await peeranhaContent.getReply(1, 1);
			await expect(userRating).to.equal(StartRatingWithoutAction);
			await expect(reply.rating).to.equal(0);
		});

		it("Test upVote own common reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false)
			await expect(peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1)).to.be.revertedWith('You can not vote for own reply');

            const userRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const reply = await peeranhaContent.getReply(1, 1);
			await expect(userRating).to.equal(StartRatingWithoutAction);
			await expect(reply.rating).to.equal(0);
		});

		/* - */ xit("Test upVote own tutorial reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false)
			await expect(peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1)).to.be.revertedWith('You can not vote for own reply');

            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const reply = await peeranhaContent.getReply(1, 1);
			await expect(userRating).to.equal(StartRating);
			await expect(reply.rating).to.equal(0);
		});
	});

	describe("Test downVote own reply", function () {

		it("Test downVote own expert reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false)
			await expect(peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0)).to.be.revertedWith('You can not vote for own reply');

            const userRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const reply = await peeranhaContent.getReply(1, 1);
			await expect(userRating).to.equal(StartRatingWithoutAction);
			await expect(reply.rating).to.equal(0);
		});

		it("Test downVote own common reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false)
			await expect(peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0)).to.be.revertedWith('You can not vote for own reply');

            const userRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const reply = await peeranhaContent.getReply(1, 1);
			await expect(userRating).to.equal(StartRatingWithoutAction);
			await expect(reply.rating).to.equal(0);
			
			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});

		/* - */ xit("Test downVote own tutorial reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false)
			await expect(peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0)).to.be.revertedWith('You can not vote for own reply');

            const userRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const reply = await peeranhaContent.getReply(1, 1);
			await expect(userRating).to.equal(StartRatingWithoutAction);
			await expect(reply.rating).to.equal(0);
		});
	});

	describe("Test create 2 reply, one first and two quick", function () {

		it("Test create 2 expert reply, one first and two quick ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);
			
            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
			await expect(userRating2).to.equal(StartRating + QuickExpertReply);

			const firstReply = await peeranhaContent.getReply(1, 1);
			const secondReply = await peeranhaContent.getReply(1, 2);
			await expect(firstReply.isFirstReply).to.equal(true);
			await expect(firstReply.isQuickReply).to.equal(true);
			await expect(secondReply.isFirstReply).to.equal(false);
			await expect(secondReply.isQuickReply).to.equal(true);
		});

		it("Test create 2 common reply, one first and two quick ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			await expect(userRating2).to.equal(StartRating + QuickCommonReply);

			const firstReply = await peeranhaContent.getReply(1, 1);
			const secondReply = await peeranhaContent.getReply(1, 2);
			await expect(firstReply.isFirstReply).to.equal(true);
			await expect(firstReply.isQuickReply).to.equal(true);
			await expect(secondReply.isFirstReply).to.equal(false);
			await expect(secondReply.isQuickReply).to.equal(true);
		});

		/* - */ xit("Test create 2 tutorial reply, one first and two quick ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating);
			await expect(userRating2).to.equal(StartRating);

			const firstReply = await peeranhaContent.getReply(1, 1);
			const secondReply = await peeranhaContent.getReply(1, 2);
			await expect(firstReply.isFirstReply).to.equal(false);
			await expect(firstReply.isQuickReply).to.equal(false);
			await expect(secondReply.isFirstReply).to.equal(false);
			await expect(secondReply.isQuickReply).to.equal(false);
		});
	});

	describe("Test change vote for 2 reply, one first and two quick", function () {

		it("Test downVote after upVote 2 expert reply, one first and two quick ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 2, 0, 1);

			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 2, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DownvotedExpertReply);
			await expect(userRating2).to.equal(StartRating + DownvotedExpertReply);

			const statusHistory1 = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory1._hex).to.equal('-0x01');
			const statusHistory2 = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 2, 0);
			await expect(statusHistory2._hex).to.equal('-0x01');
		});

		it("Test downVote after upVote 2 common reply, one first and two quick ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 2, 0, 1);

			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 2, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DownvotedCommonReply);
			await expect(userRating2).to.equal(StartRating + DownvotedCommonReply);

			const statusHistory1 = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory1._hex).to.equal('-0x01');
			const statusHistory2 = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 2, 0);
			await expect(statusHistory2._hex).to.equal('-0x01');
		});

		/* - */ xit("Test downVote after upVote 2 tutorial reply, one first and two quick ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 2, 0, 1);

			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 2, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DownvotedCommonReply);
			await expect(userRating2).to.equal(StartRating + DownvotedCommonReply);

			const statusHistory1 = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory1._hex).to.equal('-0x01');
			const statusHistory2 = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 2, 0);
			await expect(statusHistory2._hex).to.equal('-0x01');
		});

		it("Test upVote after downVote 2 expert reply, one first and two quick ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 2, 0, 0);

			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 2, 0, 1);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating)
			.to.equal(StartRating + FirstExpertReply + QuickExpertReply + UpvotedExpertReply);
			await expect(userRating2)
			.to.equal(StartRating + QuickExpertReply + UpvotedExpertReply);

			const statusHistory1 = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory1._hex).to.equal('0x01');
			const statusHistory2 = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 2, 0);
			await expect(statusHistory2._hex).to.equal('0x01');
		});

		it("Test upVote after downVote 2 common reply, one first and two quick ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 2, 0, 0);

			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 2, 0, 1);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating)
			.to.equal(StartRating + FirstCommonReply + QuickCommonReply + UpvotedCommonReply);
			await expect(userRating2)
			.to.equal(StartRating + QuickCommonReply + UpvotedCommonReply);

			const statusHistory1 = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory1._hex).to.equal('0x01');
			const statusHistory2 = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 2, 0);
			await expect(statusHistory2._hex).to.equal('0x01');
		});

		/* - */ xit("Test upVote after downVote 2 tutorial reply, one first and two quick ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 2, 0, 0);

			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 2, 0, 1);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating)
			.to.equal(StartRating + FirstCommonReply + QuickCommonReply + UpvotedCommonReply);
			await expect(userRating2)
			.to.equal(StartRating + QuickCommonReply + UpvotedCommonReply);

			const statusHistory1 = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory1._hex).to.equal('0x01');
			const statusHistory2 = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 2, 0);
			await expect(statusHistory2._hex).to.equal('0x01');
		});
	});

	describe("Test delete 2 reply, one first and two quick", function () {

		it("Test delete 2 expert reply, one first and two quick ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);

			await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
			await peeranhaContent.connect(signers[2]).deleteReply(signers[2].address, 1, 2);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnReply);
			await expect(userRating2).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test delete 2 common reply, one first and two quick ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);

			await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
			await peeranhaContent.connect(signers[2]).deleteReply(signers[2].address, 1, 2);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnReply);
			await expect(userRating2).to.equal(StartRating + DeleteOwnReply);
		});

		/* - */ xit("Test delete 2 tutorial reply, one first and two quick ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);

			await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
			await peeranhaContent.connect(signers[2]).deleteReply(signers[2].address, 1, 2);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnReply);
			await expect(userRating2).to.equal(StartRating + DeleteOwnReply);
		});
	});

	describe("Test delete 2 upVoted reply, one first and two quick", function () {

		/* - */ xit("Test delete 2 upVoted expert reply, one first and two quick", async function () { // time
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[3]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);

			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 2, 0, 1);

			await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
			await peeranhaContent.connect(signers[2]).deleteReply(signers[2].address, 1, 2);

			await wait(QuickReplyTime);
			await peeranhaContent.connect(signers[3]).createReply(signers[3].address, 1, 0, hashContainer[2], false);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 3, 0, 1);
			await peeranhaContent.connect(signers[3]).deleteReply(signers[3].address, 1, 3);

            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
			const userRating3 = await peeranhaUser.getUserRating(signers[3].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnReply);
			await expect(userRating2).to.equal(StartRating + DeleteOwnReply);
			await expect(userRating3).to.equal(StartRating + DeleteOwnReply);
		});

		/* - */ xit("Test delete 2 upVoted common reply, one first and two quick ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);

			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 2, 0, 1);

			await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
			await peeranhaContent.connect(signers[2]).deleteReply(signers[2].address, 1, 2);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnReply);
			await expect(userRating2).to.equal(StartRating + DeleteOwnReply);
		});

		/* - */ xit("Test delete 2 upVoted tutorial reply, one first and two quick ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);

			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 2, 0, 1);

			await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
			await peeranhaContent.connect(signers[2]).deleteReply(signers[2].address, 1, 2);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnReply);
			await expect(userRating2).to.equal(StartRating + DeleteOwnReply);
		});
	});

	describe("Test delete 2 downVoted reply, one first and two quick", function () {

		it("Test delete 2 downVoted expert reply, one first and two quick ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);

			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 2, 0, 0);

			await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
			await peeranhaContent.connect(signers[2]).deleteReply(signers[2].address, 1, 2);

            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DownvotedExpertReply + DeleteOwnReply);
			await expect(userRating2).to.equal(StartRating + DownvotedExpertReply + DeleteOwnReply);
		});

		it("Test delete 2 downVoted common reply, one first and two quick ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);

			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 2, 0, 0);

			await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
			await peeranhaContent.connect(signers[2]).deleteReply(signers[2].address, 1, 2);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DownvotedCommonReply + DeleteOwnReply);
			await expect(userRating2).to.equal(StartRating + DownvotedCommonReply + DeleteOwnReply);
		});

		/* - */ xit("Test delete 2 downVoted tutorial reply, one first and two quick ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);

			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 2, 0, 0);

			await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
			await peeranhaContent.connect(signers[2]).deleteReply(signers[2].address, 1, 2);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DownvotedCommonReply + DeleteOwnReply);
			await expect(userRating2).to.equal(StartRating + DownvotedCommonReply + DeleteOwnReply);
		});
	});

	describe("Test delete first reply and post one more", function () {

		it("Test delete first expert reply and post one more by another user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
			
			const firstReply = await peeranhaContent.getReply(1, 1);
			await expect(firstReply.isFirstReply).to.equal(true);
			await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);

			const secondReply = await peeranhaContent.getReply(1, 2);
			await expect(secondReply.isFirstReply).to.equal(true);

			const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating2).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
		});

		it("Test delete first common reply and post one more by another user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			
			const firstReply = await peeranhaContent.getReply(1, 1);
			await expect(firstReply.isFirstReply).to.equal(true);

			await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);

			const secondReply = await peeranhaContent.getReply(1, 2);
			await expect(secondReply.isFirstReply).to.equal(true);

			const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating2).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
		});

		it("Test delete first expert reply and post one more by same user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
			
			const firstReply = await peeranhaContent.getReply(1, 1);
			await expect(firstReply.isFirstReply).to.equal(true);
			await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[2], false);

			const secondReply = await peeranhaContent.getReply(1, 2);
			await expect(secondReply.isFirstReply).to.equal(true);

			const userRating2 = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating2).to.equal(StartRating + FirstExpertReply + QuickExpertReply + DeleteOwnReply);
		});

		it("Test delete first common reply and post one more by same user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			
			const firstReply = await peeranhaContent.getReply(1, 1);
			await expect(firstReply.isFirstReply).to.equal(true);

			await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[2], false);

			const secondReply = await peeranhaContent.getReply(1, 2);
			await expect(secondReply.isFirstReply).to.equal(true);

			const userRating2 = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating2).to.equal(StartRating + FirstCommonReply + QuickCommonReply + DeleteOwnReply);
		});
	});

	describe("Test delete reply one period after vote for reply", function () {

		it("Test delete reply one period after create expert reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);

			await wait(deleteTime);
			await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newUserRating).to.equal(userRating + DeleteOwnReply);
		});

		it("Test delete reply one period after create common reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);

			await wait(deleteTime);
			await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newUserRating).to.equal(userRating + DeleteOwnReply);
		});

		/* - */ xit("Test delete reply one period after create tutorial reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);

			await wait(deleteTime);
			await peeranhaContent.deleteReply(peeranhaContent.deployTransaction.from, 1, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newUserRating).to.equal(StartRating);
		});

		it("Test delete reply one period after upvote expert reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);

			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await wait(deleteTime);
			await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newUserRating).to.equal(userRating + DeleteOwnReply + UpvotedExpertReply);
		});

		it("Test delete reply one period after upvote common reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);

			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await wait(deleteTime);
			await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newUserRating).to.equal(userRating + DeleteOwnReply + UpvotedCommonReply);
		});

		/* - */ xit("Test delete reply one period after upvote tutorial reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);

			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await wait(deleteTime);
			await peeranhaContent.deleteReply(peeranhaContent.deployTransaction.from, 1, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newUserRating).to.equal(StartRating);
		});
	});
	
	describe("Test mark reply as best", function () {

		it("Test mark expert reply as best", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);
			
			const oldUser1Rating = await peeranhaUser.getUserRating(signers[1].address, 1);          
			const oldUser2Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			await peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);
			const user1Rating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const user2Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			await expect(user2Rating).to.equal(oldUser2Rating + AcceptExpertReply);
			await expect(user1Rating).to.equal(oldUser1Rating + StartRating + AcceptedExpertReply);
		});

		it("Test mark common reply as best", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);
			
			const oldUser1Rating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const oldUser2Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			await peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);
			const user1Rating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const user2Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			await expect(user2Rating).to.equal(oldUser2Rating + AcceptCommonReply);
			await expect(user1Rating).to.equal(oldUser1Rating + StartRating + AcceptedCommonReply);
		});

		/* - */ xit("Test mark tutorial reply as best", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			const oldUser1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const oldUser2Rating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			const user1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user2Rating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(user2Rating).to.equal(oldUser2Rating + AcceptCommonReply);
			await expect(user1Rating).to.equal(oldUser1Rating + AcceptedCommonReply);
		});
	});

	describe("Test mark own reply as best", function () {

		it("Test mark own expert reply as best", async function () { // Need to be fixed
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);
			
			const oldUserRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			const userRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			await expect(userRating).to.equal(oldUserRating);
		});

		it("Test mark own common reply as best", async function () { // Need to be fixed
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);
			
			const oldUserRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			const userRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			await expect(userRating).to.equal(oldUserRating);
		});

		/* - */ xit("Test mark own tutorial reply as best", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);
			
			const oldUserRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			const userRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			await expect(userRating).to.equal(oldUserRating);
		});
	});

	describe("Test unmark reply as best", function () {

		it("Test unmark expert reply as best", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			const oldUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(oldUserRating);
		});

		it("Test unmark common reply as best", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			const oldUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(oldUserRating);
		});

		/* - */ xit("Test unmark tutorial reply as best", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			const oldUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(oldUserRating);
		});
	});

	describe("Test unmark own reply as best", function () {

		it("Test unmark own expert reply as best", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);
			
			const oldUserRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			const userRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			await expect(userRating).to.equal(oldUserRating);
		});

		it("Test unmark own common reply as best", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);
			
			const oldUserRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			const userRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			await expect(userRating).to.equal(oldUserRating);
		});

		/* - */ xit("Test unmark own tutorial reply as best", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);
			
			const oldUserRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			const userRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			await expect(userRating).to.equal(oldUserRating);
		});
	});

	describe("Test choose another reply as best", function () {

		it("Test choose another expert reply as best", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);

			const oldUser1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const oldUser2Rating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const oldUser3Rating = await peeranhaUser.getUserRating(signers[2].address, 1);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
            const user1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user2Rating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const user3Rating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(user2Rating).to.equal(oldUser2Rating + AcceptExpertReply);
			await expect(user1Rating).to.equal(oldUser1Rating + StartRating + AcceptedExpertReply);
			await expect(user3Rating).to.equal(oldUser3Rating);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 2);
            const user1EndRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user2EndRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const user3EndRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(user2EndRating).to.equal(oldUser2Rating);
			await expect(user1EndRating).to.equal(oldUser1Rating + StartRating + AcceptedExpertReply);
			await expect(user3EndRating).to.equal(oldUser3Rating + AcceptExpertReply);
		});

		it("Test choose another common reply as best", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);
			
			const oldUser1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const oldUser2Rating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const oldUser3Rating = await peeranhaUser.getUserRating(signers[2].address, 1);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			const user1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user2Rating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const user3Rating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(user2Rating).to.equal(oldUser2Rating + AcceptCommonReply);
			await expect(user1Rating).to.equal(oldUser1Rating + StartRating + AcceptedCommonReply);
			await expect(user3Rating).to.equal(oldUser3Rating);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 2);
			const user1EndRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user2EndRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const user3EndRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(user2EndRating).to.equal(oldUser2Rating);
			await expect(user1EndRating).to.equal(oldUser1Rating + StartRating + AcceptedCommonReply);
			await expect(user3EndRating).to.equal(oldUser3Rating + AcceptCommonReply);
		});

		/* - */ xit("Test choose another tutorial reply as best", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false);
			
			const oldUser1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const oldUser2Rating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const oldUser3Rating = await peeranhaUser.getUserRating(signers[2].address, 1);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			const user1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user2Rating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const user3Rating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(user2Rating).to.equal(oldUser2Rating + StartRating + AcceptCommonReply);
			await expect(user1Rating).to.equal(oldUser1Rating + AcceptedCommonReply);
			await expect(user3Rating).to.equal(oldUser3Rating);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 2);
			const user1EndRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user2EndRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const user3EndRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(user2EndRating).to.equal(oldUser2Rating);
			await expect(user1EndRating).to.equal(oldUser1Rating + StartRating + AcceptedCommonReply);
			await expect(user3EndRating).to.equal(oldUser3Rating + AcceptedCommonReply);
		});
	});

	describe("Test choose another reply as best (new reply is own)", function () {

		it("Test choose another expert reply as best (new reply is own)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[2], false);
			
			const oldUser1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const oldUser2Rating = await peeranhaUser.getUserRating(signers[1].address, 1);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			const user1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user2Rating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(user2Rating).to.equal(oldUser2Rating + AcceptExpertReply);
			await expect(user1Rating).to.equal(oldUser1Rating + StartRating + AcceptedExpertReply);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 2);
			const user1EndRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user2EndRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(user2EndRating).to.equal(oldUser2Rating);
			await expect(user1EndRating).to.equal(oldUser1Rating + StartRating);
		});

		it("Test choose another common reply as best (new reply is own)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[2], false);
			
			const oldUser1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const oldUser2Rating = await peeranhaUser.getUserRating(signers[1].address, 1);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			const user1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user2Rating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(user2Rating).to.equal(oldUser2Rating + AcceptCommonReply);
			await expect(user1Rating).to.equal(oldUser1Rating + StartRating + AcceptedCommonReply);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 2);
			const user1EndRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user2EndRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(user2EndRating).to.equal(oldUser2Rating);
			await expect(user1EndRating).to.equal(oldUser1Rating + StartRating);
		});

		/* - */ xit("Test choose another tutorial reply as best (new reply is own)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[2], false);
			
			const oldUser1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const oldUser2Rating = await peeranhaUser.getUserRating(signers[1].address, 1);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			const user1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user2Rating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(user2Rating).to.equal(oldUser2Rating + AcceptCommonReply);
			await expect(user1Rating).to.equal(oldUser1Rating + AcceptedCommonReply);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 2);
			const user1EndRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user2EndRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(user2EndRating).to.equal(oldUser2Rating);
			await expect(user1EndRating).to.equal(oldUser1Rating);
		});
	});

	describe("Test choose another reply as best (old reply is own)", function () {

		it("Test choose another expert reply as best (old reply is own)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);
			
			const oldUser1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const oldUser3Rating = await peeranhaUser.getUserRating(signers[2].address, 1);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			const user1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user3Rating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(user1Rating).to.equal(oldUser1Rating);
			await expect(user3Rating).to.equal(oldUser3Rating);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 2);
			const user1EndRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user3EndRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(user1EndRating).to.equal(oldUser1Rating + StartRating + AcceptedExpertReply);
			await expect(user3EndRating).to.equal(oldUser3Rating + AcceptExpertReply);
		});

		it("Test choose another common reply as best (old reply is own)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);
			
			const oldUser1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const oldUser3Rating = await peeranhaUser.getUserRating(signers[2].address, 1);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			const user1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user3Rating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(user1Rating).to.equal(oldUser1Rating);
			await expect(user3Rating).to.equal(oldUser3Rating);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 2);
			const user1EndRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user3EndRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(user1EndRating).to.equal(oldUser1Rating + StartRating + AcceptedCommonReply);
			await expect(user3EndRating).to.equal(oldUser3Rating + AcceptCommonReply);
		});

		/* - */ xit("Test choose another tutorial reply as best (old reply is own)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false);
			
			const oldUser1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const oldUser3Rating = await peeranhaUser.getUserRating(signers[2].address, 1);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			const user1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user3Rating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(user1Rating).to.equal(oldUser1Rating);
			await expect(user3Rating).to.equal(oldUser3Rating);

			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 2);
			const user1EndRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user3EndRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(user1EndRating).to.equal(oldUser1Rating + AcceptedCommonReply);
			await expect(user3EndRating).to.equal(oldUser3Rating + AcceptedCommonReply);
		});
	});

	describe("Test vote after delete post", function () {

		it("Test upvote post after delete post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).deletePost(signers[1].address, 1);
			await expect(peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1)).to.be.revertedWith('Post has been deleted.');
		});

		it("Test downvote post after delete post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).deletePost(signers[1].address, 1);
			await expect(peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 0)).to.be.revertedWith('Post has been deleted.');
		});

		it("Test upvote reply after delete post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.deletePost(peeranhaContent.deployTransaction.from, 1);
			await expect(peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1)).to.be.revertedWith('Post has been deleted.');
		});

		it("Test downvote reply after delete post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.deletePost(peeranhaContent.deployTransaction.from, 1);
			await expect(peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0)).to.be.revertedWith('Post has been deleted.');
		});

		it("Test choose reply as the best after delete post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.deletePost(peeranhaContent.deployTransaction.from, 1);
			await expect(peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1)).to.be.revertedWith('Post has been deleted.');
		});
	});

	describe("Test vote after delete reply", function () {

		it("Test upvote reply after delete reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.deleteReply(peeranhaContent.deployTransaction.from, 1, 1);
			await expect(peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1)).to.be.revertedWith('Reply has been deleted.');
		});

		it("Test downvote reply after delete reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.deleteReply(peeranhaContent.deployTransaction.from, 1, 1);
			await expect(peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0)).to.be.revertedWith('Reply has been deleted.');
		});

		it("Test choose reply as the best after delete reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.deleteReply(peeranhaContent.deployTransaction.from, 1, 1);
			await expect(peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1)).to.be.revertedWith('Reply has been deleted.');
		});
	});

	describe('Change post type', function () {
		it("Test upVote post expert -> common", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating + UpvotedExpertPost);

			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.CommonPost);
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + UpvotedCommonPost);

			const post = await peeranhaContent.getPost(1);
			await expect(post.postType).to.equal(PostTypeEnum.CommonPost);
		});

		xit("Test upVote post expert -> tutorial", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating + UpvotedExpertPost);

			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.Tutorial);
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + UpvotedTutorial);
		});

		it("Test upVote post common -> expert", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating + UpvotedCommonPost);

			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.ExpertPost);
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + UpvotedExpertPost);

			const post = await peeranhaContent.getPost(1);
			await expect(post.postType).to.equal(PostTypeEnum.ExpertPost);
		});

		xit("Test upVote post tutorial -> expert", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating + UpvotedTutorial);

			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.ExpertPost);
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + UpvotedExpertPost);
		});

		it("Test 2 upVote 2 downVote post expert -> common", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);

			await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

			const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);

			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.CommonPost);
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);
		});

		it("Test 2 upVote 2 downVote post common -> expert", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

			const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);

			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.ExpertPost);
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);
		});

		it("Test 4 zero vote post expert -> common", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

			const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating);

			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.CommonPost);
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating);
		});

		it("Test zero vote post common -> expert", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

			const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating);

			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.ExpertPost);
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating);
		});

		it("Test upVote reply expert -> common", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating + UpvotedExpertReply);

			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.CommonPost);
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + UpvotedCommonReply);
		});

		it("Test upVote reply common -> expert", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating + UpvotedCommonReply);

			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.ExpertPost);
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + UpvotedExpertReply);
		});

		it("Test downVote reply expert -> common", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);
			const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating + DownvotedExpertReply);

			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.CommonPost);
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + DownvotedCommonReply);
		});

		it("Test downVote reply common -> expert", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);
			const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating + DownvotedCommonReply);

			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.ExpertPost);
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + DownvotedExpertReply);
		});

		it("Test 2 upVote 2 downVote reply expert -> common", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

			const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating + UpvotedExpertReply * 2 + DownvotedExpertReply * 2);

			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.CommonPost);
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + UpvotedCommonReply * 2 + DownvotedCommonReply * 2);
		});

		it("Test 2 upVote 2 downVote reply common -> expert", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);
			
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

			const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating + UpvotedCommonReply * 2 + DownvotedCommonReply * 2);

			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.ExpertPost);
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + UpvotedExpertReply * 2 + DownvotedExpertReply * 2);
		});

		it("Test 4 zero vote reply expert -> common", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

			const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating);

			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.CommonPost);
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating);
		});

		it("Test zero vote reply common -> expert", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);


			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

			const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating);

			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.ExpertPost);
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating);
		});

		it("Test first/best reply expert -> common", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);
			
			const userRating =  await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.CommonPost);
			const newRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
		});

		it("Test first/best reply common -> expert", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);
			
			const userRating =  await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.CommonPost);
			const newRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
		});

		xit("Test best reply expert -> common", async function () {		//// merge develop
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);
			await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			
			const userPost = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userReply = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userReply.rating).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);
			await expect(userPost.rating).to.equal(StartRating + AcceptExpertPost);

			// await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.ExpertPost);
			// const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			// await expect(newRating).to.equal(StartRating);
		});
	});

	describe('Change the same type post', function () {

		it("Change the same type post (expert)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await expect(peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.ExpertPost))
			.to.be.revertedWith('This post type is already set.');
		});

		it("Change the same type post (common)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			
			await expect(peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.CommonPost))
			.to.be.revertedWith('This post type is already set.');
		});

        it("Change the same type post (common)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			
			await expect(peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.Tutorial))
			.to.be.revertedWith('This post type is already set.');
		});
	});

	describe('Actions after change post type', function () {
		it("Test upVote post after expert -> common", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.CommonPost);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
	
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + UpvotedCommonPost);

			const post = await peeranhaContent.getPost(1);
			await expect(post.postType).to.equal(PostTypeEnum.CommonPost);
		});

		xit("Test upVote post after expert -> tutorial", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.Tutorial);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + UpvotedTutorial);
		});

		it("Test upVote post after common -> expert", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			
			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.ExpertPost);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + UpvotedExpertPost);

			const post = await peeranhaContent.getPost(1);
			await expect(post.postType).to.equal(PostTypeEnum.ExpertPost);
		});

		xit("Test upVote post after tutorial -> expert", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			
			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.ExpertPost);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + UpvotedExpertPost);
		});

		it("Test 2 upVote 2 downVote post after expert -> common", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);


			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.CommonPost);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);
		});

		it("Test 2 upVote 2 downVote post after common -> expert", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);


			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			
			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.ExpertPost);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);
		});

		it("Test cancel vote post after expert -> common", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);


			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.CommonPost);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating);
		});

		it("Test cancel vote post after common -> expert", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);


			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.ExpertPost);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating);
		});

		it("Test upVote reply after expert -> common", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.CommonPost);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + UpvotedCommonReply);
		});

		it("Test upVote reply after common -> expert", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.ExpertPost);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + UpvotedExpertReply);
		});

		it("Test downVote reply after expert -> common", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.CommonPost);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + DownvotedCommonReply);
		});

		it("Test downVote reply after common -> expert", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.ExpertPost);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 0);
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + DownvotedExpertReply);
		});

		it("Test 2 upVote 2 downVote reply after expert -> common", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.CommonPost);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + UpvotedCommonReply * 2 + DownvotedCommonReply * 2);
		});

		it("Test 2 upVote 2 downVote reply after common -> expert", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.ExpertPost);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + UpvotedExpertReply * 2 + DownvotedExpertReply * 2);
		});

		it("Test cancel vote reply after expert -> common", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.CommonPost);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 1, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating);
		});

		it("Test cancel vote reply after common -> expert", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
			await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.ExpertPost);
			await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
			await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
			await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating);
		});

		it("Test first/best reply after expert -> common", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.CommonPost);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);
			
			const newRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
		});

		it("Test first/best reply after common -> expert", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.CommonPost);
			await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);
			
			const newRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
		});

		// xit("Test best reply expert -> common", async function () {		//// merge develop
		// 	const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		// 	const signers = await ethers.getSigners();
		// 	const hashContainer = getHashContainer();
		// 	const ipfsHashes = getHashesContainer(2);

		// 	await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
		// 	await peeranhaUser.createUser(hashContainer[1]);
		// 	await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

		// 	await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		// 	await peeranhaContent.createReply(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1], false);
		// 	await peeranhaContent.changeStatusBestReply(peeranhaContent.deployTransaction.from, 1, 1);
			
		// 	const userPost = await peeranhaUser.getUserRating(signers[1].address, 1);
		// 	const userReply = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
		// 	await expect(userReply.rating).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);
		// 	await expect(userPost.rating).to.equal(StartRating + AcceptExpertPost);

		// 	// await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.ExpertPost);
		// 	// const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
		// 	// await expect(newRating).to.equal(StartRating);
		// });
		// best reply

		it("Test delete post after change post type", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.CommonPost);
			await peeranhaContent.connect(signers[1]).deletePost(signers[1].address, 1);
			
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + DeleteOwnPost);
		});
		
		it("Test delete reply after change post type", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.changePostType(peeranhaContent.deployTransaction.from, 1, PostTypeEnum.CommonPost);
			await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
			
			const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newRating).to.equal(StartRating + DeleteOwnReply);
		});
	});




	

	// it("Test upVote own comment", async function () {
	// 	const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
	// 	const signers = await ethers.getSigners();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);

	// 	await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
	// 	await peeranhaUser.createUser(hashContainer[1]);
    //     await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

	// 	await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranhaContent.createComment(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1]);
	// 	await expect(peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 1, 1)).to.be.revertedWith('You can not vote for own comment.');
	// });


	// it("Test upVote expert comment", async function () {
	// 	const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
	// 	const signers = await ethers.getSigners();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);

	// 	await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
	// 	await peeranhaUser.addUserRating(signers[1].address, 25);
	// 	await peeranhaUser.createUser(hashContainer[1]);
    //     await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

	// 	await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranhaContent.createComment(peeranhaContent.deployTransaction.from, 1, 0, hashContainer[1])
    //     await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 1, 1);

	// 	const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
	// 	const post = await peeranhaContent.getPost(1);
	// 	await expect(userRating).to.equal(StartRating + UpvotedExpertPost);
	// 	await expect(post.rating).to.equal(1);
		
	// 	const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 0, 1);
	// 	await expect(statusHistory._hex).to.equal('0x01');
	// });

	// it("Test downVote expert comment", async function () {
	// 	const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
	// 	const signers = await ethers.getSigners();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);

	// 	await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
	// 	await peeranhaUser.addUserRating(signers[1].address, 25);
	// 	await peeranhaUser.createUser(hashContainer[1]);
    //     await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

	// 	await peeranhaContent.createPost(peeranhaContent.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1])
    //     await peeranhaContent.voteItem(peeranhaContent.deployTransaction.from, 1, 0, 1, 0);

	// 	const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
	// 	const post = await peeranhaContent.getPost(1);
	// 	// await expect(userRating).to.equal(StartRating + UpvotedExpertPost);
	// 	// await expect(post.rating).to.equal(1);
		
	// 	const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 0, 1);
	// 	await expect(statusHistory._hex).to.equal('-0x01');
	// });
});
