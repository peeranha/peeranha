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
// Test delete post/reply after deleteTime for common and tutorial everywhere
//
// change post type add tests downvote + check change ratinf when downVote for action user
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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);

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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(StartRating + UpvotedCommonPost);
			await expect(post.rating).to.equal(1);

			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('0x01');
		});

		it("Test upVote tutorial post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 1);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 1);

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 1);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 1);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			const post = await peeranhaContent.getPost(1);
			await expect(userRating).to.equal(oldUserRating);
			await expect(post.rating).to.equal(0);

			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});

		it("Test double upVote tutorial post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);
			await peeranhaContent.voteItem(1, 0, 0, 1);

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.voteItem(1, 0, 0, 1)).to.be.revertedWith('error_vote_post');

			
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await expect(peeranhaContent.voteItem(1, 0, 0, 1)).to.be.revertedWith('error_vote_post');

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await expect(peeranhaContent.voteItem(1, 0, 0, 1)).to.be.revertedWith('error_vote_post');

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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 0);

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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 0);

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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 0);

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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 0);
			await peeranhaContent.voteItem(1, 0, 0, 0);
			
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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 0);
			await peeranhaContent.voteItem(1, 0, 0, 0);

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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 0);
			await peeranhaContent.voteItem(1, 0, 0, 0);

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.voteItem(1, 0, 0, 0)).to.be.revertedWith('error_vote_post');

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await expect(peeranhaContent.voteItem(1, 0, 0, 0)).to.be.revertedWith('error_vote_post');

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await expect(peeranhaContent.voteItem(1, 0, 0, 0)).to.be.revertedWith('error_vote_post');

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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);
			await peeranhaContent.voteItem(1, 0, 0, 0);

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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 0);
			await peeranhaContent.voteItem(1, 0, 0, 1);

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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);
			await peeranhaContent.voteItem(1, 0, 0, 0);

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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 0);
			await peeranhaContent.voteItem(1, 0, 0, 1);

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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);
			await peeranhaContent.voteItem(1, 0, 0, 0);

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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 0);
			await peeranhaContent.voteItem(1, 0, 0, 1);

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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRatingAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);	
			await expect(userRating).to.equal(StartRating + UpvotedExpertPost);
			await expect(userRatingAction).to.equal(StartRatingWithoutAction);

			await peeranhaContent.connect(signers[1]).deletePost(1);

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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRatingAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);	
			await expect(userRating).to.equal(StartRating + UpvotedCommonPost);
			await expect(userRatingAction).to.equal(StartRatingWithoutAction);

			await peeranhaContent.connect(signers[1]).deletePost(1);

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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRatingAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);	
			await expect(userRating).to.equal(StartRating + UpvotedTutorial);
			await expect(userRatingAction).to.equal(StartRatingWithoutAction);

			await peeranhaContent.connect(signers[1]).deletePost(1);
			
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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 0);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRatingAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRating + DownvotedExpertPost + 10);		// + 10 because addUserRating(...)
			await expect(userRatingAction).to.equal(StartRating + DownvoteExpertPost);

			await peeranhaContent.connect(signers[1]).deletePost(1);

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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRatingAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRating + DownvotedCommonPost + 10); 		// + 10 because addUserRating(...)
			await expect(userRatingAction).to.equal(StartRating + DownvoteCommonPost);

			await peeranhaContent.connect(signers[1]).deletePost(1);

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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRatingAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRating + DownvotedTutorial);
			await expect(userRatingAction).to.equal(StartRating + DownvoteTutorial);

			await peeranhaContent.connect(signers[1]).deletePost(1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(StartRating + DownvotedTutorial + DeleteOwnPost);
			await expect(newUserActionRating).to.equal(StartRating + DownvoteTutorial);
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);

			await peeranhaContent.voteItem(1, 1, 0, 1);
			
			const userRating2 = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating2).to.equal(userRating + UpvotedExpertReply);
			await expect(userActionRating2).to.equal(userActionRating);

			await peeranhaContent.deletePost(1);

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);

			await peeranhaContent.voteItem(1, 1, 0, 1);

			const userRating2 = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			
			await expect(userRating2).to.equal(userRating + UpvotedCommonReply);
			await expect(userActionRating2).to.equal(userActionRating);

			await peeranhaContent.deletePost(1);

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 1, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);		
			await expect(userRating).to.equal(StartRating + DownvotedExpertReply);
			await expect(userActionRating).to.equal(StartRating + DownvoteExpertReply);

			await peeranhaContent.deletePost(1);

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 1, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRating + DownvotedCommonReply);
			await expect(userActionRating).to.equal(StartRating + DownvoteCommonReply);

			await peeranhaContent.deletePost(1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(StartRating + DownvotedCommonReply);
			await expect(newUserActionRating).to.equal(StartRating + DownvoteCommonReply + DeleteOwnReply);
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);

			await peeranhaContent.changeStatusBestReply(1, 1);
			
			const userRating2 = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating2).to.equal(userRating + AcceptExpertReply);
			await expect(userActionRating2).to.equal(StartRating + AcceptedExpertReply);

			await peeranhaContent.deletePost(1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(StartRating);
			await expect(newUserActionRating).to.equal(StartRating + DeleteOwnPost);
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);

			await peeranhaContent.changeStatusBestReply(1, 1);

			const userRating2 = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);	
			await expect(userRating2).to.equal(userRating + AcceptCommonReply);
			await expect(userActionRating2 ).to.equal(StartRating + AcceptedCommonReply);

			await peeranhaContent.deletePost(1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(StartRating);
			await expect(newUserActionRating).to.equal(StartRating + DeleteOwnPost);
		});
	});
	
	describe("Test delete post after deleteTime", function () {

		it("Test delete post with upvotes after deleteTime by moderator", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);		
			await wait(deleteTime);	
			await peeranhaContent.deletePost(1);

            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);		
            await expect(newUserRating).to.equal(userRating + ModeratorDeletePost);
		});

		it("Test delete post with upvotes after deleteTime by post's owner", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);
			
			await wait(deleteTime);	
			await peeranhaContent.connect(signers[1]).deletePost(1);

            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);		
            await expect(newUserRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("Test delete post with upvotes after deleteTime by post's owner", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);
			
			await wait(deleteTime);	
			await peeranhaContent.connect(signers[1]).deletePost(1);

            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);		
            await expect(newUserRating).to.equal(StartRating + DeleteOwnPost);
		});
		
		it("Test delete post with expert reply after deleteTime", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);		
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);		

			await wait(deleteTime);	
			await peeranhaContent.deletePost(1);

            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);		
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);	
            await expect(newUserRating).to.equal(userRating);
			await expect(newUserActionRating).to.equal(userActionRating + DeleteOwnPost + StartRating);
		});

		it("Test delete post with common reply after deleteTime", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);		
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);		

			await wait(deleteTime);
			await peeranhaContent.deletePost(1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);		
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);		

			await expect(newUserRating).to.equal(userRating);
			await expect(newUserActionRating).to.equal(userActionRating + StartRating + DeleteOwnReply);
		});

		it("Test delete post with upveted expert reply after deleteTime", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);

			await peeranhaContent.voteItem(1, 1, 0, 1);
			await wait(deleteTime);

			await peeranhaContent.deletePost(1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(userRating + UpvotedExpertReply);
			await expect(newUserActionRating).to.equal(userActionRating + StartRating + DeleteOwnReply);
		});

		it("Test delete post with upveted common reply after deleteTime", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);

			await peeranhaContent.voteItem(1, 1, 0, 1);
			await wait(deleteTime);

			await peeranhaContent.deletePost(1);

            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(userRating + UpvotedCommonReply);
			await expect(newUserActionRating).to.equal(userActionRating + StartRating + DeleteOwnReply);
		});
		
		it("Test delete post with best expert reply after deleteTime", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);

			await peeranhaContent.changeStatusBestReply(1, 1);
		
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await wait(deleteTime);

			await peeranhaContent.deletePost(1);

            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(userRating);
			await expect(newUserActionRating).to.equal(userActionRating + DeleteOwnPost - AcceptedExpertReply);
		});

		it("Test delete post with best common reply after deleteTime", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);

			await peeranhaContent.changeStatusBestReply(1, 1);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);

			await wait(deleteTime);

			await peeranhaContent.deletePost(1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(newUserRating).to.equal(userRating);
			await expect(newUserActionRating).to.equal(userActionRating + DeleteOwnPost - AcceptedCommonReply);
		});
	});

	describe("Test delete own post/reply", function () {

		it("Test delete own post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);	
			await peeranhaContent.deletePost(1);

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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);

			await peeranhaContent.deleteReply(1, 1);
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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await wait(QuickReplyTime);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);

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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await wait(QuickReplyTime);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);

            const userRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRating + FirstCommonReply);

			const reply = await peeranhaContent.getReply(1, 1);
			await expect(reply.isFirstReply).to.equal(true);
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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);

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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);

            const userRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);

			const reply = await peeranhaContent.getReply(1, 1);
			await expect(reply.isFirstReply).to.equal(true);
			await expect(reply.isQuickReply).to.equal(true);
		});
	});

	describe("Test create first and quick reply for own post", function () {

		it("Test create first and quick expert reply for own post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);

            const userRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating).to.equal(StartRatingWithoutAction);

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false)
			await peeranhaContent.voteItem(1, 1, 0, 1);

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false)
			await peeranhaContent.voteItem(1, 1, 0, 1);

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false)
			await peeranhaContent.voteItem(1, 1, 0, 0);

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false)
			await peeranhaContent.voteItem(1, 1, 0, 0);

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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false)
			await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 1);
			await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 1);

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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false)
			await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 1);
			await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 1);

            const userRating = await peeranhaUser.getUserRating(signers[0].address, 1);
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false)
			await peeranhaContent.voteItem(1, 1, 0, 0);
			await peeranhaContent.voteItem(1, 1, 0, 0);

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false)
			await peeranhaContent.voteItem(1, 1, 0, 0);
			await peeranhaContent.voteItem(1, 1, 0, 0);

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false)
			await expect(peeranhaContent.voteItem(1, 1, 0, 1)).to.be.revertedWith('error_vote_reply');

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false)
			await expect(peeranhaContent.voteItem(1, 1, 0, 1)).to.be.revertedWith('error_vote_reply');

            const userRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const reply = await peeranhaContent.getReply(1, 1);
			await expect(userRating).to.equal(StartRatingWithoutAction);
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false)
			await expect(peeranhaContent.voteItem(1, 1, 0, 0)).to.be.revertedWith('error_vote_reply');

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false)
			await expect(peeranhaContent.voteItem(1, 1, 0, 0)).to.be.revertedWith('error_vote_reply');

            const userRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const reply = await peeranhaContent.getReply(1, 1);
			await expect(userRating).to.equal(StartRatingWithoutAction);
			await expect(reply.rating).to.equal(0);
			
			const statusHistory = await peeranhaContent.getStatusHistory(peeranhaContent.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('0x00');
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
			
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
			
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
			
			await peeranhaContent.voteItem(1, 1, 0, 1);
			await peeranhaContent.voteItem(1, 2, 0, 1);

			await peeranhaContent.voteItem(1, 1, 0, 0);
			await peeranhaContent.voteItem(1, 2, 0, 0);

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
			
			await peeranhaContent.voteItem(1, 1, 0, 1);
			await peeranhaContent.voteItem(1, 2, 0, 1);

			await peeranhaContent.voteItem(1, 1, 0, 0);
			await peeranhaContent.voteItem(1, 2, 0, 0);

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
			
			await peeranhaContent.voteItem(1, 1, 0, 0);
			await peeranhaContent.voteItem(1, 2, 0, 0);

			await peeranhaContent.voteItem(1, 1, 0, 1);
			await peeranhaContent.voteItem(1, 2, 0, 1);

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
			
			await peeranhaContent.voteItem(1, 1, 0, 0);
			await peeranhaContent.voteItem(1, 2, 0, 0);

			await peeranhaContent.voteItem(1, 1, 0, 1);
			await peeranhaContent.voteItem(1, 2, 0, 1);

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[2], false);

			await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
			await peeranhaContent.connect(signers[2]).deleteReply(1, 2);
			
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[2], false);

			await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
			await peeranhaContent.connect(signers[2]).deleteReply(1, 2);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnReply);
			await expect(userRating2).to.equal(StartRating + DeleteOwnReply);
		});
	});

	describe("Test delete 2 upVoted reply, one first and two quick", function () {

		it("Test delete 2 upVoted expert reply, one first and two quick", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[3]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[2], false);

			await peeranhaContent.voteItem(1, 1, 0, 1);
			await peeranhaContent.voteItem(1, 2, 0, 1);

			await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
			await peeranhaContent.connect(signers[2]).deleteReply(1, 2);

			await wait(QuickReplyTime);
			await peeranhaContent.connect(signers[3]).createReply(1, 0, hashContainer[2], false);
			await peeranhaContent.voteItem(1, 3, 0, 1);
			await peeranhaContent.connect(signers[3]).deleteReply(1, 3);

            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
			const userRating3 = await peeranhaUser.getUserRating(signers[3].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnReply);
			await expect(userRating2).to.equal(StartRating + DeleteOwnReply);
			await expect(userRating3).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test delete 2 upVoted common reply, one first and two quick ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[2], false);

			await peeranhaContent.voteItem(1, 1, 0, 1);
			await peeranhaContent.voteItem(1, 2, 0, 1);

			await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
			await peeranhaContent.connect(signers[2]).deleteReply(1, 2);
			
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[2], false);

			await peeranhaContent.voteItem(1, 1, 0, 0);
			await peeranhaContent.voteItem(1, 2, 0, 0);

			await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
			await peeranhaContent.connect(signers[2]).deleteReply(1, 2);

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[2], false);

			await peeranhaContent.voteItem(1, 1, 0, 0);
			await peeranhaContent.voteItem(1, 2, 0, 0);

			await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
			await peeranhaContent.connect(signers[2]).deleteReply(1, 2);
			
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
			
			const firstReply = await peeranhaContent.getReply(1, 1);
			await expect(firstReply.isFirstReply).to.equal(true);
			await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[2], false);

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			
			const firstReply = await peeranhaContent.getReply(1, 1);
			await expect(firstReply.isFirstReply).to.equal(true);

			await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[2], false);

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
			
			const firstReply = await peeranhaContent.getReply(1, 1);
			await expect(firstReply.isFirstReply).to.equal(true);
			await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[2], false);

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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			
			const firstReply = await peeranhaContent.getReply(1, 1);
			await expect(firstReply.isFirstReply).to.equal(true);

			await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[2], false);

			const secondReply = await peeranhaContent.getReply(1, 2);
			await expect(secondReply.isFirstReply).to.equal(true);

			const userRating2 = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating2).to.equal(StartRating + FirstCommonReply + QuickCommonReply + DeleteOwnReply);
		});
	});

	describe("Test delete reply after deleteTime", function () {

		it("Test delete expert reply after deleteTime by reply's owner", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);

			await wait(deleteTime);
			await peeranhaContent.connect(signers[1]).deleteReply(1, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newUserRating).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test delete expert reply after deleteTime by moderator", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);

			await wait(deleteTime);
			await peeranhaContent.deleteReply(1, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newUserRating).to.equal(userRating + ModeratorDeleteReply);
		});		

		it("Test delete common reply after deleteTime by reply's owner", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);

			await wait(deleteTime);
			await peeranhaContent.connect(signers[1]).deleteReply(1, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newUserRating).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test delete common reply after deleteTime by moderator", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);

			await wait(deleteTime);
			await peeranhaContent.deleteReply(1, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newUserRating).to.equal(userRating + ModeratorDeleteReply);
		});

		it("Test delete upveted expert reply after deleteTime by moderator", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);

			await peeranhaContent.voteItem(1, 1, 0, 1);
			await wait(deleteTime);
			await peeranhaContent.deleteReply(1, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newUserRating).to.equal(userRating + ModeratorDeletePost + UpvotedExpertReply);
		});

		it("Test delete upveted expert reply after deleteTime by reply's owner", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);

			await peeranhaContent.voteItem(1, 1, 0, 1);
			await wait(deleteTime);
			await peeranhaContent.deleteReply(1, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newUserRating).to.equal(userRating + ModeratorDeletePost + UpvotedExpertReply);
		});

		it("Test delete upveted expert reply after deleteTime by reply's owner", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);

			await peeranhaContent.voteItem(1, 1, 0, 1);
			await wait(deleteTime);
			await peeranhaContent.connect(signers[1]).deleteReply(1, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newUserRating).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test delete upveted common post after deleteTime by moderator", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);

			await peeranhaContent.voteItem(1, 1, 0, 1);
			await wait(deleteTime);
			await peeranhaContent.deleteReply(1, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newUserRating).to.equal(userRating + ModeratorDeletePost + UpvotedCommonReply);
		});
		
		it("Test delete upveted common post after deleteTime by reply's owner", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);

			await peeranhaContent.voteItem(1, 1, 0, 1);
			await wait(deleteTime);
			await peeranhaContent.connect(signers[1]).deleteReply(1, 1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newUserRating).to.equal(StartRating + DeleteOwnReply);
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
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
			
			const oldUser1Rating = await peeranhaUser.getUserRating(signers[1].address, 1);          
			const oldUser2Rating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await peeranhaContent.connect(signers[1]).changeStatusBestReply(1, 1);
			const user1Rating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const user2Rating = await peeranhaUser.getUserRating(signers[2].address, 1);
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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			
			const oldUser1Rating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const oldUser2Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			await peeranhaContent.connect(signers[1]).changeStatusBestReply(1, 1);
			const user1Rating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const user2Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			await expect(user2Rating).to.equal(oldUser2Rating + AcceptCommonReply);
			await expect(user1Rating).to.equal(oldUser1Rating + StartRating + AcceptedCommonReply);
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			
			const oldUserRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			await peeranhaContent.changeStatusBestReply(1, 1);
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			
			const oldUserRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			await peeranhaContent.changeStatusBestReply(1, 1);
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			
			const oldUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await peeranhaContent.changeStatusBestReply(1, 1);
			await peeranhaContent.changeStatusBestReply(1, 1);
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			
			const oldUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await peeranhaContent.changeStatusBestReply(1, 1);
			await peeranhaContent.changeStatusBestReply(1, 1);
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			
			const oldUserRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			await peeranhaContent.changeStatusBestReply(1, 1);
			await peeranhaContent.changeStatusBestReply(1, 1);
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			
			const oldUserRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			await peeranhaContent.changeStatusBestReply(1, 1);
			await peeranhaContent.changeStatusBestReply(1, 1);
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[2], false);

			const oldUser1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const oldUser2Rating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const oldUser3Rating = await peeranhaUser.getUserRating(signers[2].address, 1);

			await peeranhaContent.changeStatusBestReply(1, 1);
            const user1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user2Rating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const user3Rating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(user2Rating).to.equal(oldUser2Rating + AcceptExpertReply);
			await expect(user1Rating).to.equal(oldUser1Rating + StartRating + AcceptedExpertReply);
			await expect(user3Rating).to.equal(oldUser3Rating);

			await peeranhaContent.changeStatusBestReply(1, 2);
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
			
			const oldUser1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const oldUser2Rating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const oldUser3Rating = await peeranhaUser.getUserRating(signers[2].address, 1);

			await peeranhaContent.changeStatusBestReply(1, 1);
			const user1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user2Rating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const user3Rating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(user2Rating).to.equal(oldUser2Rating + AcceptCommonReply);
			await expect(user1Rating).to.equal(oldUser1Rating + StartRating + AcceptedCommonReply);
			await expect(user3Rating).to.equal(oldUser3Rating);

			await peeranhaContent.changeStatusBestReply(1, 2);
			const user1EndRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user2EndRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const user3EndRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(user2EndRating).to.equal(oldUser2Rating);
			await expect(user1EndRating).to.equal(oldUser1Rating + StartRating + AcceptedCommonReply);
			await expect(user3EndRating).to.equal(oldUser3Rating + AcceptCommonReply);
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.createReply(1, 0, hashContainer[2], false);
			
			const oldUser1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const oldUser2Rating = await peeranhaUser.getUserRating(signers[1].address, 1);

			await peeranhaContent.changeStatusBestReply(1, 1);
			const user1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user2Rating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(user2Rating).to.equal(oldUser2Rating + AcceptExpertReply);
			await expect(user1Rating).to.equal(oldUser1Rating + StartRating + AcceptedExpertReply);

			await peeranhaContent.changeStatusBestReply(1, 2);
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.createReply(1, 0, hashContainer[2], false);
			
			const oldUser1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const oldUser2Rating = await peeranhaUser.getUserRating(signers[1].address, 1);

			await peeranhaContent.changeStatusBestReply(1, 1);
			const user1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user2Rating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(user2Rating).to.equal(oldUser2Rating + AcceptCommonReply);
			await expect(user1Rating).to.equal(oldUser1Rating + StartRating + AcceptedCommonReply);

			await peeranhaContent.changeStatusBestReply(1, 2);
			const user1EndRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user2EndRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(user2EndRating).to.equal(oldUser2Rating);
			await expect(user1EndRating).to.equal(oldUser1Rating + StartRating);
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
			
			const oldUser1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const oldUser3Rating = await peeranhaUser.getUserRating(signers[2].address, 1);

			await peeranhaContent.changeStatusBestReply(1, 1);
			const user1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user3Rating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(user1Rating).to.equal(oldUser1Rating);
			await expect(user3Rating).to.equal(oldUser3Rating);

			await peeranhaContent.changeStatusBestReply(1, 2);
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
			
			const oldUser1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const oldUser3Rating = await peeranhaUser.getUserRating(signers[2].address, 1);

			await peeranhaContent.changeStatusBestReply(1, 1);
			const user1Rating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user3Rating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(user1Rating).to.equal(oldUser1Rating);
			await expect(user3Rating).to.equal(oldUser3Rating);

			await peeranhaContent.changeStatusBestReply(1, 2);
			const user1EndRating = await peeranhaUser.getUserRating(signers[0].address, 1);
			const user3EndRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(user1EndRating).to.equal(oldUser1Rating + StartRating + AcceptedCommonReply);
			await expect(user3EndRating).to.equal(oldUser3Rating + AcceptCommonReply);
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

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).deletePost(1);
			await expect(peeranhaContent.voteItem(1, 0, 0, 1)).to.be.revertedWith('Post_deleted.');
		});

		it("Test downvote post after delete post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).deletePost(1);
			await expect(peeranhaContent.voteItem(1, 0, 0, 0)).to.be.revertedWith('Post_deleted.');
		});

		it("Test upvote reply after delete post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.deletePost(1);
			await expect(peeranhaContent.voteItem(1, 1, 0, 1)).to.be.revertedWith('Post_deleted.');
		});

		it("Test downvote reply after delete post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.deletePost(1);
			await expect(peeranhaContent.voteItem(1, 1, 0, 0)).to.be.revertedWith('Post_deleted.');
		});

		it("Test choose reply as the best after delete post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.deletePost(1);
			await expect(peeranhaContent.changeStatusBestReply(1, 1)).to.be.revertedWith('Post_deleted.');
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

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.deleteReply(1, 1);
			await expect(peeranhaContent.voteItem(1, 1, 0, 1)).to.be.revertedWith('Reply_deleted.');
		});

		it("Test downvote reply after delete reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.deleteReply(1, 1);
			await expect(peeranhaContent.voteItem(1, 1, 0, 0)).to.be.revertedWith('Reply_deleted.');
		});

		it("Test choose reply as the best after delete reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.deleteReply(1, 1);
			await expect(peeranhaContent.changeStatusBestReply(1, 1)).to.be.revertedWith('Reply_deleted.');
		});
	});

	describe('Change post type', function () {

		describe('Change post type', function () {

			it("Test change post type expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.changePostType(1, PostTypeEnum.CommonPost);
				
				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.CommonPost);
			});

			it("Test change post type expert -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await expect(peeranhaContent.changePostType(1, PostTypeEnum.Tutorial)).to.be.revertedWith('Error_postType');
			});

			it("Test change post type common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await peeranhaContent.changePostType(1, PostTypeEnum.ExpertPost);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.ExpertPost);
			});

			it("Test change post type common -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await expect(peeranhaContent.changePostType(1, PostTypeEnum.Tutorial)).to.be.revertedWith('Error_postType');
			});
			
			it("Test change post type tutoral -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				await expect(peeranhaContent.changePostType(1, PostTypeEnum.CommonPost)).to.be.revertedWith('Error_postType');
			});

			it("Test change post type tutoral -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				await expect(peeranhaContent.changePostType(1, PostTypeEnum.ExpertPost)).to.be.revertedWith('Error_postType');
			});
		});

		describe('Change post type after post upvote', function () {

			it("Test upVote post expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost);

				await peeranhaContent.changePostType(1, PostTypeEnum.CommonPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedCommonPost);
			});

			it("Test upVote post common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost);

				await peeranhaContent.changePostType(1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertPost);
			});
		});

		describe('Change post type after 2 post upvotes', function () {

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

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);

				await peeranhaContent.changePostType(1, PostTypeEnum.CommonPost);
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

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);

				await peeranhaContent.changePostType(1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);
			});
		});

		describe('Change post type after 4 cancel post upvote', function () {

			it("Test 4 cancel votes post expert -> common", async function () {
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

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				await peeranhaContent.voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating);

				await peeranhaContent.changePostType(1, PostTypeEnum.CommonPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating);
			});

			it("Test cancel votes post common -> expert", async function () {
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

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				await peeranhaContent.voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating);

				await peeranhaContent.changePostType(1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating);
			});
		});

		describe('Change post type after upvote reply', function () {		

			it("Test upVote reply expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertReply + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.changePostType(1, PostTypeEnum.CommonPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedCommonReply + FirstCommonReply + QuickCommonReply);
			});

			it("Test upVote reply common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonReply + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.changePostType(1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertReply + FirstExpertReply + QuickExpertReply);
			});
		});

		describe('Change post type after downVote reply', function () {		

			it("Test downVote reply expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.voteItem(1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedExpertReply);

				await peeranhaContent.changePostType(1, PostTypeEnum.CommonPost);
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

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedCommonReply);

				await peeranhaContent.changePostType(1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DownvotedExpertReply);
			});
		});

		describe('Change post type after 2 upVote 2 downVote reply', function () {	

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

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 1, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertReply * 2 + DownvotedExpertReply * 2 + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.changePostType(1, PostTypeEnum.CommonPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedCommonReply * 2 + DownvotedCommonReply * 2 + FirstCommonReply + QuickCommonReply);
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

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 1, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonReply * 2 + DownvotedCommonReply * 2 + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.changePostType(1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertReply * 2 + DownvotedExpertReply * 2 + FirstExpertReply + QuickExpertReply);
			});
		});

		describe('Change post type after 4 cancel vote reply', function () {	

			it("Test 4 cancel vote reply expert -> common", async function () {
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

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(1, 1, 0, 1);
				await peeranhaContent.voteItem(1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 1, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.changePostType(1, PostTypeEnum.CommonPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			});

			it("Test 4 cancel vote reply common -> expert", async function () {
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

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(1, 1, 0, 1);
				await peeranhaContent.voteItem(1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 1, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.changePostType(1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
			});
		});

		describe('Change post type first/quick reply 0 rating', function () {	

			it("Test first/quick reply expert -> common 0 rating", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createReply(1, 0, hashContainer[1], false);
				
				const userRating =  await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.changePostType(1, PostTypeEnum.CommonPost);
				const newRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(newRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			});

			it("Test first/quick reply common -> expert 0 rating", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createReply(1, 0, hashContainer[1], false);
				
				const userRating =  await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.changePostType(1, PostTypeEnum.CommonPost);
				const newRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(newRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			});
		});

		describe('Change post type first/quick/best reply', function () {	

			it("Test best reply expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				await peeranhaContent.changeStatusBestReply(1, 1);
				
				const ratingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const ratingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(ratingReply).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);
				await expect(ratingPost).to.equal(StartRating + AcceptedExpertReply);

				await peeranhaContent.changePostType(1, PostTypeEnum.CommonPost);
				const newRatingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const newRatingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingReply).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);
				await expect(newRatingPost).to.equal(StartRating + AcceptedCommonReply);
			});

			it("Test best reply common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				await peeranhaContent.changeStatusBestReply(1, 1);
				
				const ratingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const ratingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(ratingReply).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);
				await expect(ratingPost).to.equal(StartRating + AcceptedCommonReply);

				await peeranhaContent.changePostType(1, PostTypeEnum.ExpertPost);
				const newRatingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const newRatingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingReply).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);
				await expect(newRatingPost).to.equal(StartRating + AcceptedExpertReply);
			});
		});

		describe('Change the same type post', function () {

			it("Change the same type post (expert)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await expect(peeranhaContent.changePostType(1, PostTypeEnum.ExpertPost))
				.to.be.revertedWith('This post type is already set.');
			});

			it("Change the same type post (common)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				
				await expect(peeranhaContent.changePostType(1, PostTypeEnum.CommonPost))
				.to.be.revertedWith('This post type is already set.');
			});

			it("Change the same type post (tutorial)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
				await expect(peeranhaContent.changePostType(1, PostTypeEnum.Tutorial))
				.to.be.revertedWith('This post type is already set.');
			});
		});

		describe('Actions after change post type', function () {
		
			describe('upvote after change post type', function () {
			
				it("Test upVote post after expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					
					await peeranhaContent.changePostType(1, PostTypeEnum.CommonPost);
					await peeranhaContent.voteItem(1, 0, 0, 1);
			
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + UpvotedCommonPost);
				});

				it("Test upVote post after common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					
					await peeranhaContent.changePostType(1, PostTypeEnum.ExpertPost);
					await peeranhaContent.voteItem(1, 0, 0, 1);
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + UpvotedExpertPost);
				});
			});

			describe('2 upVote 2 downVote after change post type', function () {

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

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					
					await peeranhaContent.changePostType(1, PostTypeEnum.CommonPost);
					await peeranhaContent.voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

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

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					
					await peeranhaContent.changePostType(1, PostTypeEnum.ExpertPost);
					await peeranhaContent.voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);
				});
			});

			describe('4 cancel vote after change post type', function () {

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

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					
					await peeranhaContent.voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

					await peeranhaContent.changePostType(1, PostTypeEnum.CommonPost);
					await peeranhaContent.voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

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

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					
					await peeranhaContent.voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

					await peeranhaContent.changePostType(1, PostTypeEnum.ExpertPost);
					await peeranhaContent.voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating);
				});
			});

			describe('upVote reply after change post type', function () {

				it("Test upVote reply after expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					
					await peeranhaContent.changePostType(1, PostTypeEnum.CommonPost);
					await peeranhaContent.voteItem(1, 1, 0, 1);
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

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					
					await peeranhaContent.changePostType(1, PostTypeEnum.ExpertPost);
					await peeranhaContent.voteItem(1, 1, 0, 1);
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + UpvotedExpertReply);
				});
			});

			describe('downVote reply after change post type', function () {

				it("Test downVote reply after expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					
					await peeranhaContent.changePostType(1, PostTypeEnum.CommonPost);
					await peeranhaContent.voteItem(1, 1, 0, 0);
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

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					
					await peeranhaContent.changePostType(1, PostTypeEnum.ExpertPost);
					await peeranhaContent.voteItem(1, 1, 0, 0);
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + DownvotedExpertReply);
				});
			});

			describe('2 cancel vote for reply after change post type', function () {

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

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					
					await peeranhaContent.changePostType(1, PostTypeEnum.CommonPost);
					await peeranhaContent.voteItem(1, 1, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 1, 0, 0);

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

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					
					await peeranhaContent.changePostType(1, PostTypeEnum.ExpertPost);
					await peeranhaContent.voteItem(1, 1, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 1, 0, 0);

					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + UpvotedExpertReply * 2 + DownvotedExpertReply * 2);
				});
			});

			describe('Cancel vote for reply after change post type', function () {

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

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					
					await peeranhaContent.voteItem(1, 1, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 1, 0, 0);

					await peeranhaContent.changePostType(1, PostTypeEnum.CommonPost);
					await peeranhaContent.voteItem(1, 1, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 1, 0, 0);

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

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					
					await peeranhaContent.voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 1, 0, 0);

					await peeranhaContent.changePostType(1, PostTypeEnum.ExpertPost);
					await peeranhaContent.voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 1, 0, 0);

					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating);
				});
			});

			describe('publish first/quick reply after change post type', function () {

				it("Test first/quick reply after expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await peeranhaContent.changePostType(1, PostTypeEnum.CommonPost);
					await peeranhaContent.createReply(1, 0, hashContainer[1], false);
					
					const newRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
					await expect(newRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				});

				it("Test first/quick reply after common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await peeranhaContent.changePostType(1, PostTypeEnum.CommonPost);
					await peeranhaContent.createReply(1, 0, hashContainer[1], false);
					
					const newRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
					await expect(newRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				});
			});

			describe('mark as best reply after change post type', function () {

				it("Test best reply expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await peeranhaContent.createReply(1, 0, hashContainer[1], false);
					await peeranhaContent.changePostType(1, PostTypeEnum.CommonPost);
					await peeranhaContent.connect(signers[1]).changeStatusBestReply(1, 1);
					
					const userPost = await peeranhaUser.getUserRating(signers[1].address, 1);
					const userReply = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
					await expect(userReply).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);
					await expect(userPost).to.equal(StartRating + AcceptedCommonReply);
				});

				it("Test best reply common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					await peeranhaContent.createReply(1, 0, hashContainer[1], false);
					await peeranhaContent.changePostType(1, PostTypeEnum.ExpertPost);
					await peeranhaContent.connect(signers[1]).changeStatusBestReply(1, 1);
					
					const userPost = await peeranhaUser.getUserRating(signers[1].address, 1);
					const userReply = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
					await expect(userReply).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);
					await expect(userPost).to.equal(StartRating + AcceptedExpertReply);
				});
			});

			describe('delete post after change post type', function () {

				it("Test delete post after change post type expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await peeranhaContent.changePostType(1, PostTypeEnum.CommonPost);
					await peeranhaContent.connect(signers[1]).deletePost(1);
					
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + DeleteOwnPost);
				});
				
				it("Test delete reply after change post type common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

					await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					await peeranhaContent.changePostType(1, PostTypeEnum.ExpertPost);
					await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
					
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + DeleteOwnReply);
				});
			});
		});
	});

	describe('Test delete item with upvete and downvote from another user', function () {
		
		it("delete expert post with upVote and downVote", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);

			await peeranhaContent.connect(signers[2]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 0)

			await peeranhaContent.connect(signers[2]).deletePost(1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("delete expert post with 2 upVotes and downVote", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[3]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);
			await peeranhaUser.giveCommunityModeratorPermission(signers[3].address, 1);

			await peeranhaContent.connect(signers[2]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 0);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 1)
			await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 1)

			await peeranhaContent.connect(signers[2]).deletePost(1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("delete expert reply with upVote and downVote", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 1, 0, 1);
			await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 0)

			await peeranhaContent.connect(signers[2]).deleteReply(1, 1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnReply);
		});

		it("delete expert reply with 2 upVotes and downVote", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[3]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);
			await peeranhaUser.giveCommunityModeratorPermission(signers[3].address, 1);

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 1, 0, 0);
			await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 1)
			await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 1)

			await peeranhaContent.connect(signers[2]).deleteReply(1, 1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnReply);
		});

		it("delete expert post with  upVote and downVote reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);

			await peeranhaContent.connect(signers[2]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 1, 0, 1);
			await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 0)

			await peeranhaContent.connect(signers[2]).deletePost(1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("delete expert post with 2 upVotes and downVote reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[3]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);
			await peeranhaUser.giveCommunityModeratorPermission(signers[3].address, 1);

			await peeranhaContent.connect(signers[2]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 0, 0, 0);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 1)
			await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 1)

			await peeranhaContent.connect(signers[2]).deletePost(1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("delete expert post with upVote and downVote", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);

			await peeranhaContent.connect(signers[2]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 0)

			await peeranhaContent.connect(signers[2]).deletePost(1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("delete expert post with 2 upVotes and downVote", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[3]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);
			await peeranhaUser.giveCommunityModeratorPermission(signers[3].address, 1);

			await peeranhaContent.connect(signers[2]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 0);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 1)
			await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 1)

			await peeranhaContent.connect(signers[2]).deletePost(1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("delete expert reply with upVote and downVote", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 1, 0, 1);
			await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 0)

			await peeranhaContent.connect(signers[2]).deleteReply(1, 1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnReply);
		});

		it("delete expert reply with 2 upVotes and downVote", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[3]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);
			await peeranhaUser.giveCommunityModeratorPermission(signers[3].address, 1);

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 1, 0, 0);
			await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 1)
			await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 1)

			await peeranhaContent.connect(signers[2]).deleteReply(1, 1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnReply);
		});

		it("delete expert post with  upVote and downVote reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);

			await peeranhaContent.connect(signers[2]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 1, 0, 1);
			await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 0)

			await peeranhaContent.connect(signers[2]).deletePost(1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("delete expert post with 2 upVotes and downVote reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[3]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);
			await peeranhaUser.giveCommunityModeratorPermission(signers[3].address, 1);

			await peeranhaContent.connect(signers[2]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 0, 0, 0);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 1)
			await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 1)

			await peeranhaContent.connect(signers[2]).deletePost(1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("delete common post with upVote and downVote", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);

			await peeranhaContent.connect(signers[2]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 0)

			await peeranhaContent.connect(signers[2]).deletePost(1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("delete common post with 2 upVotes and downVote", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[3]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);
			await peeranhaUser.giveCommunityModeratorPermission(signers[3].address, 1);

			await peeranhaContent.connect(signers[2]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 0);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 1)
			await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 1)

			await peeranhaContent.connect(signers[2]).deletePost(1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("delete common reply with upVote and downVote", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 1, 0, 1);
			await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 0)

			await peeranhaContent.connect(signers[2]).deleteReply(1, 1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnReply);
		});

		it("delete common reply with 2 upVotes and downVote", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[3]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);
			await peeranhaUser.giveCommunityModeratorPermission(signers[3].address, 1);

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 1, 0, 0);
			await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 1)
			await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 1)

			await peeranhaContent.connect(signers[2]).deleteReply(1, 1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnReply);
		});

		it("delete common post with  upVote and downVote reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);

			await peeranhaContent.connect(signers[2]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 1, 0, 1);
			await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 0)

			await peeranhaContent.connect(signers[2]).deletePost(1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("delete common post with 2 upVotes and downVote reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[3]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);
			await peeranhaUser.giveCommunityModeratorPermission(signers[3].address, 1);

			await peeranhaContent.connect(signers[2]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 0, 0, 0);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 1)
			await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 1)

			await peeranhaContent.connect(signers[2]).deletePost(1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("delete common post with upVote and downVote", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);

			await peeranhaContent.connect(signers[2]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 0)

			await peeranhaContent.connect(signers[2]).deletePost(1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("delete common post with 2 upVotes and downVote", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[3]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);
			await peeranhaUser.giveCommunityModeratorPermission(signers[3].address, 1);

			await peeranhaContent.connect(signers[2]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 0);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 1)
			await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 1)

			await peeranhaContent.connect(signers[2]).deletePost(1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("delete expert reply with upVote and downVote", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 1, 0, 1);
			await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 0)

			await peeranhaContent.connect(signers[2]).deleteReply(1, 1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnReply);
		});

		it("delete common reply with 2 upVotes and downVote", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[3]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);
			await peeranhaUser.giveCommunityModeratorPermission(signers[3].address, 1);

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 1, 0, 0);
			await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 1)
			await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 1)

			await peeranhaContent.connect(signers[2]).deleteReply(1, 1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnReply);
		});

		it("delete common post with  upVote and downVote reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);

			await peeranhaContent.connect(signers[2]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 1, 0, 1);
			await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 0)

			await peeranhaContent.connect(signers[2]).deletePost(1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("delete common post with 2 upVotes and downVote reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[3]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);
			await peeranhaUser.giveCommunityModeratorPermission(signers[3].address, 1);

			await peeranhaContent.connect(signers[2]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 0, 0, 0);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 1)
			await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 1)

			await peeranhaContent.connect(signers[2]).deletePost(1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("delete tutorial post with upVote and downVote", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);

			await peeranhaContent.connect(signers[2]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 0)

			await peeranhaContent.connect(signers[2]).deletePost(1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("delete tutorial post with 2 upVotes and downVote", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[3]).createUser(hashContainer[0]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);
			await peeranhaUser.giveCommunityModeratorPermission(signers[3].address, 1);

			await peeranhaContent.connect(signers[2]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 0);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 1)
			await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 1)

			await peeranhaContent.connect(signers[2]).deletePost(1);

			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(userRating).to.equal(StartRating + DeleteOwnPost);
		});
	});

	describe("Test upVote own comment", function () {
		
		it("Test upVote own expert comment", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createComment(1, 0, hashContainer[1]);
			await expect(peeranhaContent.voteItem(1, 0, 1, 1)).to.be.revertedWith('error_vote_comment');
		});

		it("Test upVote own common comment", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createComment(1, 0, hashContainer[1]);
			await expect(peeranhaContent.voteItem(1, 0, 1, 1)).to.be.revertedWith('error_vote_comment');
		});
	});

	describe("Test downVote own comment", function () {
		
		it("Test downVote own expert comment", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createComment(1, 0, hashContainer[1]);
			await expect(peeranhaContent.voteItem(1, 0, 1, 0)).to.be.revertedWith('error_vote_comment');
		});

		it("Test downVote own common comment", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createComment(1, 0, hashContainer[1]);
			await expect(peeranhaContent.voteItem(1, 0, 1, 0)).to.be.revertedWith('error_vote_comment');
		});
	});

	describe("Test cancel vote and vote later", function () {	// TODO; add comment

		it("Test cancel vote post -> upvote post and delate post (expert)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);
			const votedUser = await peeranhaContent.getVotedUsers(1, 0, 0);
			await expect(votedUser).to.eql([signers[0].address]);

			await peeranhaContent.voteItem(1, 0, 0, 1);		// cancel vote
			const cancelVotedUser = await peeranhaContent.getVotedUsers(1, 0, 0);
			await expect(cancelVotedUser).to.eql(["0x0000000000000000000000000000000000000000"]);

			await peeranhaContent.voteItem(1, 0, 0, 1);
			const votedAgainUser = await peeranhaContent.getVotedUsers(1, 0, 0);
			await expect(votedAgainUser).to.eql(["0x0000000000000000000000000000000000000000", signers[0].address]);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(userRating).to.equal(StartRating + UpvotedExpertPost);

			await peeranhaContent.connect(signers[1]).deletePost(1);

			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(newUserRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("Test cancel vote post -> upvote post and delate post (common)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);
			await peeranhaContent.voteItem(1, 0, 0, 1);		// cancel vote
			await peeranhaContent.voteItem(1, 0, 0, 1);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(userRating).to.equal(StartRating + UpvotedCommonPost);

			await peeranhaContent.connect(signers[1]).deletePost(1);
			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(newUserRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("Test cancel vote post -> upvote post and delate post (tutorial)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);
			await peeranhaContent.voteItem(1, 0, 0, 1);		// cancel vote
			await peeranhaContent.voteItem(1, 0, 0, 1);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(userRating).to.equal(StartRating + UpvotedTutorial);

			await peeranhaContent.connect(signers[1]).deletePost(1);
			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(newUserRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("Test cancel vote post -> downvote post and delate post (expert)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);
			const votedUser = await peeranhaContent.getVotedUsers(1, 0, 0);
			await expect(votedUser).to.eql([signers[0].address]);

			await peeranhaContent.voteItem(1, 0, 0, 1);		// cancel vote
			const cancelVotedUser = await peeranhaContent.getVotedUsers(1, 0, 0);
			await expect(cancelVotedUser).to.eql(["0x0000000000000000000000000000000000000000"]);

			await peeranhaContent.voteItem(1, 0, 0, 0);
			const votedAgainUser = await peeranhaContent.getVotedUsers(1, 0, 0);
			await expect(votedAgainUser).to.eql(["0x0000000000000000000000000000000000000000", signers[0].address]);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(userRating).to.equal(StartRating + DownvotedExpertPost);

			await peeranhaContent.connect(signers[1]).deletePost(1);
			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(newUserRating).to.equal(StartRating + DeleteOwnPost + DownvotedExpertPost);
		});

		it("Test cancel vote post -> downvote post and delate post (common)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);
			await peeranhaContent.voteItem(1, 0, 0, 1);		// cancel vote
			await peeranhaContent.voteItem(1, 0, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(userRating).to.equal(StartRating + DownvotedCommonPost);

			await peeranhaContent.connect(signers[1]).deletePost(1);
			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(newUserRating).to.equal(StartRating + DeleteOwnPost + DownvotedCommonPost);
		});

		it("Test cancel vote post -> downvote post and delate post (tutorial)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);
			await peeranhaContent.voteItem(1, 0, 0, 1);		// cancel vote
			await peeranhaContent.voteItem(1, 0, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(userRating).to.equal(StartRating + DownvotedTutorial);

			await peeranhaContent.connect(signers[1]).deletePost(1);
			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(newUserRating).to.equal(StartRating + DeleteOwnPost + DownvotedTutorial);
		});

		it("Test cancel vote reply -> upvote reply and delate post (expert)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);

			await peeranhaContent.voteItem(1, 1, 0, 1);
			const votedUser = await peeranhaContent.getVotedUsers(1, 1, 0);
			await expect(votedUser).to.eql([signers[0].address]);

			await peeranhaContent.voteItem(1, 1, 0, 1);		// cancel vote
			const cancelVotedUser = await peeranhaContent.getVotedUsers(1, 1, 0);
			await expect(cancelVotedUser).to.eql(["0x0000000000000000000000000000000000000000"]);

			await peeranhaContent.voteItem(1, 1, 0, 1);
			const votedAgainUser = await peeranhaContent.getVotedUsers(1, 1, 0);
			await expect(votedAgainUser).to.eql(["0x0000000000000000000000000000000000000000", signers[0].address]);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(userRating).to.equal(StartRating + UpvotedExpertReply);

			await peeranhaContent.connect(signers[1]).deletePost(1);
			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(newUserRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("Test cancel vote reply -> upvote reply and delate post (common)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 1, 0, 1);
			await peeranhaContent.voteItem(1, 1, 0, 1);		// cancel vote
			await peeranhaContent.voteItem(1, 1, 0, 1);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(userRating).to.equal(StartRating + UpvotedCommonReply);

			await peeranhaContent.connect(signers[1]).deletePost(1);
			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(newUserRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("Test cancel vote reply -> downvote reply and delate post (expert)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 1, 0, 1);
			const votedUser = await peeranhaContent.getVotedUsers(1, 1, 0);
			await expect(votedUser).to.eql([signers[0].address]);

			await peeranhaContent.voteItem(1, 1, 0, 1);		// cancel vote
			const cancelVotedUser = await peeranhaContent.getVotedUsers(1, 1, 0);
			await expect(cancelVotedUser).to.eql(["0x0000000000000000000000000000000000000000"]);

			await peeranhaContent.voteItem(1, 1, 0, 0);
			const votedAgainUser = await peeranhaContent.getVotedUsers(1, 1, 0);
			await expect(votedAgainUser).to.eql(["0x0000000000000000000000000000000000000000", signers[0].address]);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(userRating).to.equal(StartRating + DownvotedExpertReply);

			await peeranhaContent.connect(signers[1]).deletePost(1);
			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(newUserRating).to.equal(StartRating + DeleteOwnPost + DownvotedExpertReply);
		});

		it("Test cancel vote reply -> downvote reply and delate post (common)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 1, 0, 1);
			await peeranhaContent.voteItem(1, 1, 0, 1);		// cancel vote
			await peeranhaContent.voteItem(1, 1, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(userRating).to.equal(StartRating + DownvotedCommonReply);

			await peeranhaContent.connect(signers[1]).deletePost(1);
			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(newUserRating).to.equal(StartRating + DeleteOwnPost + DownvotedCommonReply);
		});

		it("Test cancel vote reply -> upvote reply and delate reply (expert)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);

			await peeranhaContent.voteItem(1, 1, 0, 1);
			const votedUser = await peeranhaContent.getVotedUsers(1, 1, 0);
			await expect(votedUser).to.eql([signers[0].address]);

			await peeranhaContent.voteItem(1, 1, 0, 1);		// cancel vote
			const cancelVotedUser = await peeranhaContent.getVotedUsers(1, 1, 0);
			await expect(cancelVotedUser).to.eql(["0x0000000000000000000000000000000000000000"]);

			await peeranhaContent.voteItem(1, 1, 0, 1);
			const votedAgainUser = await peeranhaContent.getVotedUsers(1, 1, 0);
			await expect(votedAgainUser).to.eql(["0x0000000000000000000000000000000000000000", signers[0].address]);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(userRating).to.equal(StartRating + UpvotedExpertReply);

			await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(newUserRating).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test cancel vote reply -> upvote reply and delate reply (common)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 1, 0, 1);
			await peeranhaContent.voteItem(1, 1, 0, 1);		// cancel vote
			await peeranhaContent.voteItem(1, 1, 0, 1);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(userRating).to.equal(StartRating + UpvotedCommonReply);

			await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(newUserRating).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test cancel vote reply -> downvote reply and delate reply (expert)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 1, 0, 1);
			const votedUser = await peeranhaContent.getVotedUsers(1, 1, 0);
			await expect(votedUser).to.eql([signers[0].address]);

			await peeranhaContent.voteItem(1, 1, 0, 1);		// cancel vote
			const cancelVotedUser = await peeranhaContent.getVotedUsers(1, 1, 0);
			await expect(cancelVotedUser).to.eql(["0x0000000000000000000000000000000000000000"]);

			await peeranhaContent.voteItem(1, 1, 0, 0);
			const votedAgainUser = await peeranhaContent.getVotedUsers(1, 1, 0);
			await expect(votedAgainUser).to.eql(["0x0000000000000000000000000000000000000000", signers[0].address]);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(userRating).to.equal(StartRating + DownvotedExpertReply);

			await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(newUserRating).to.equal(StartRating + DeleteOwnReply + DownvotedExpertReply);
		});

		it("Test cancel vote reply -> downvote reply and delate reply (common)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.voteItem(1, 1, 0, 1);
			await peeranhaContent.voteItem(1, 1, 0, 1);		// cancel vote
			await peeranhaContent.voteItem(1, 1, 0, 0);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(userRating).to.equal(StartRating + DownvotedCommonReply);

			await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(newUserRating).to.equal(StartRating + DeleteOwnReply + DownvotedCommonReply);
		});

		it("Test another user upvotes before cancel vote post -> upvote post and delate post (expert)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.addUserRating(signers[2].address, 50, 1);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
			await peeranhaContent.voteItem(1, 0, 0, 1);
			const votedUser = await peeranhaContent.getVotedUsers(1, 0, 0);
			await expect(votedUser).to.eql([signers[2].address, signers[0].address]);

			await peeranhaContent.voteItem(1, 0, 0, 1);		// cancel vote
			const cancelVotedUser = await peeranhaContent.getVotedUsers(1, 0, 0);
			await expect(cancelVotedUser).to.eql([signers[2].address, "0x0000000000000000000000000000000000000000"]);

			await peeranhaContent.voteItem(1, 0, 0, 1);
			const votedAgainUser = await peeranhaContent.getVotedUsers(1, 0, 0);
			await expect(votedAgainUser).to.eql([signers[2].address, "0x0000000000000000000000000000000000000000", signers[0].address]);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(userRating).to.equal(StartRating + UpvotedExpertPost * 2);

			await peeranhaContent.connect(signers[1]).deletePost(1);
			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(newUserRating).to.equal(StartRating + DeleteOwnPost);
		});

		it("Test another user upvotes after cancel vote post -> upvote post and delate post (expert)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.addUserRating(signers[2].address, 50, 1);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.voteItem(1, 0, 0, 1);
			await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
			const votedUser = await peeranhaContent.getVotedUsers(1, 0, 0);
			await expect(votedUser).to.eql([signers[0].address, signers[2].address]);

			await peeranhaContent.voteItem(1, 0, 0, 1);		// cancel vote
			const cancelVotedUser = await peeranhaContent.getVotedUsers(1, 0, 0);
			await expect(cancelVotedUser).to.eql(["0x0000000000000000000000000000000000000000", signers[2].address]);

			await peeranhaContent.voteItem(1, 0, 0, 1);
			const votedAgainUser = await peeranhaContent.getVotedUsers(1, 0, 0);
			await expect(votedAgainUser).to.eql(["0x0000000000000000000000000000000000000000", signers[2].address, signers[0].address]);


			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(userRating).to.equal(StartRating + UpvotedExpertPost * 2);

			await peeranhaContent.connect(signers[1]).deletePost(1);
			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1)
			await expect(newUserRating).to.equal(StartRating + DeleteOwnPost);
		});
	});
});
