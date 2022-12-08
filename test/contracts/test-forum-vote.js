const { expect } = require("chai");
const { 
	wait, createPeerenhaAndTokenContract, registerTwoUsers, createUserWithAnotherRating, getHashContainer, getHashesContainer, createTags, getIdsContainer,
	PostTypeEnum, StartRating, StartRatingWithoutAction, deleteTime, DeleteOwnReply, QuickReplyTime,
    DownvoteExpertPost, UpvotedExpertPost, DownvotedExpertPost, DownvoteCommonPost, UpvotedCommonPost, DownvotedCommonPost,
    ModeratorDeletePost, DownvoteExpertReply, UpvotedExpertReply, DownvotedExpertReply, AcceptExpertReply, AcceptedExpertReply, 
    FirstExpertReply, QuickExpertReply, DownvoteCommonReply, UpvotedCommonReply, DownvotedCommonReply, AcceptCommonReply,
    AcceptedCommonReply, FirstCommonReply, QuickCommonReply, ModeratorDeleteReply, ModeratorDeleteComment,
	DownvoteTutorial, UpvotedTutorial, DownvotedTutorial, DeleteOwnPost, DefaultCommunityId
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

			it("Test change post type, post does not exist", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await expect(peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)).
					to.be.revertedWith('Post_not_exist.');
			});

			it("Test change post type, post has been deleted", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.deletePost(1);

				await expect(peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)).
					to.be.revertedWith('Post_deleted.');
			});

			it("Test change post type expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);

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
				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.Tutorial);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.Tutorial);
			});

			it("Test change post type expert -> tutorial (the post has reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createReply(1, 0, hashContainer[1], false);

				await expect(peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.Tutorial)).
					to.be.revertedWith('Error_postType');
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
				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);

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
				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.Tutorial);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.Tutorial);
			});

			it("Test change post type expert -> tutorial (the post has reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await peeranhaContent.createReply(1, 0, hashContainer[1], false);

				await expect(peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.Tutorial)).
					to.be.revertedWith('Error_postType');
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
				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.CommonPost);
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
				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.ExpertPost);
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

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedCommonPost);
			});

			it("Test upVote post expert -> tytorial", async function () {
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

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.Tutorial);
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

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertPost);
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

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.Tutorial);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedTutorial);
			});

			it("Test upVote post tutorial -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertPost);
			});

			it("Test upVote post tutorial -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedCommonPost);
			});
		});

		describe('Change post type after post downVote', function () {

			it("Test downVote post expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedExpertPost);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DownvotedCommonPost);
			});

			it("Test downVote post expert -> tytorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedExpertPost);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.Tutorial);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DownvotedTutorial);
			});

			it("Test downVote post common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedCommonPost);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DownvotedExpertPost);
			});

			it("Test downVote post common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedCommonPost);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.Tutorial);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DownvotedTutorial);
			});

			it("Test downVote post tutorial -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedTutorial);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DownvotedExpertPost);
			});

			it("Test downVote post tutorial -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedTutorial);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DownvotedCommonPost);
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

				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);
			});

			it("Test 2 upVote 2 downVote post expert -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);

				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.Tutorial);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedTutorial * 2 + DownvotedTutorial * 2);
			});

			it("Test 2 upVote 2 downVote post common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);
			});

			it("Test 2 upVote 2 downVote post common -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.Tutorial);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedTutorial * 2 + DownvotedTutorial * 2);
			});

			it("Test 2 upVote 2 downVote post tutorial -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial * 2 + DownvotedTutorial * 2);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);
			});

			it("Test 2 upVote 2 downVote post tutorial -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);

				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial * 2 + DownvotedTutorial * 2);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);
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
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

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

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating);
			});

			it("Test 4 cancel votes post expert -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

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

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.Tutorial);
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
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

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

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating);
			});

			it("Test cancel votes post common -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

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

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.Tutorial);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating);
			});

			it("Test cancel votes post tutorial -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
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

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating);
			});

			it("Test 4 cancel votes post tutorial -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
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

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
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

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
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

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertReply + FirstExpertReply + QuickExpertReply);
			});

			it("Test upVote reply expert -> common (delete reply)", async function () {
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

				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DeleteOwnReply);
			});

			it("Test upVote reply common -> expert (delete reply)", async function () {
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

				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DeleteOwnReply);
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

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
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

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DownvotedExpertReply);
			});

			it("Test downVote reply expert -> common (delete reply)", async function () {
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

				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply + DownvotedExpertReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DeleteOwnReply + DownvotedExpertReply);
			});

			it("Test downVote reply common -> expert (delete reply)", async function () {
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

				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply + DownvotedCommonReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DeleteOwnReply + DownvotedCommonReply);
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
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
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

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
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
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
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

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertReply * 2 + DownvotedExpertReply * 2 + FirstExpertReply + QuickExpertReply);
			});

			it("Test 2 upVote 2 downVote reply expert -> common (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
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

				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);
				
				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DeleteOwnReply);
			});

			it("Test 2 upVote 2 downVote reply common -> expert (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
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

				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);
				
				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DeleteOwnReply);
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
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

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

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
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
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

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

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
			});

			it("Test 4 cancel vote reply expert -> common (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

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

				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DeleteOwnReply);
			});

			it("Test 4 cancel vote reply common -> expert (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

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

				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DeleteOwnReply);
			});
		});

		describe('Change post type first/quick reply 0 vote', function () {	

			it("Test first/quick reply expert -> common 0 vote", async function () {
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

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
				const newRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(newRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			});

			it("Test first/quick reply common -> expert 0 vote", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await peeranhaContent.createReply(1, 0, hashContainer[1], false);
				
				const userRating =  await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
				const newRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(newRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
			});

			it("Test first/quick reply expert -> common 0 vote (delete reply)", async function () {
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

				await peeranhaContent.deleteReply(1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
				const newRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(newRating).to.equal(StartRating + DeleteOwnReply);
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

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
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

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
				const newRatingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const newRatingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingReply).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);
				await expect(newRatingPost).to.equal(StartRating + AcceptedExpertReply);
			});

			it("Test best reply expert -> common (delete reply)", async function () {
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

				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				const ratingReplyAfterDeleteReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				const ratingPostAfterDeleteReply = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(ratingReplyAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);
				await expect(ratingPostAfterDeleteReply).to.equal(StartRating + AcceptedExpertReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
				const newRatingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const newRatingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingReply).to.equal(StartRating + DeleteOwnReply);
				await expect(newRatingPost).to.equal(StartRating + AcceptedExpertReply);
			});

			it("Test best reply common -> expert (delete reply)", async function () {
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

				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				const ratingReplyAfterDeleteReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				const ratingPostAfterDeleteReply = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(ratingReplyAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);
				await expect(ratingPostAfterDeleteReply).to.equal(StartRating + AcceptedCommonReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
				const newRatingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const newRatingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingReply).to.equal(StartRating + DeleteOwnReply);
				await expect(newRatingPost).to.equal(StartRating + AcceptedCommonReply);
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
					
					await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
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
					
					await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
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
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

					await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					
					await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
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
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);


					await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					
					await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
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
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

					await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					
					await peeranhaContent.voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

					await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
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
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

					await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					
					await peeranhaContent.voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

					await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
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
					
					await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
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
					
					await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
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
					
					await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
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
					
					await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
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
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

					await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					
					await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
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
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

					await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					
					await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
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
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

					await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					
					await peeranhaContent.voteItem(1, 1, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 1, 0, 0);

					await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
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
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

					await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					
					await peeranhaContent.voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 1, 0, 0);

					await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
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
					await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
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
					await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
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
					await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
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
					await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
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
					await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
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
					await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
					await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
					
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + DeleteOwnReply);
				});
			});
		});
	});

	describe('Change post community id', function () {       

		describe('Change post community id', function () {

			it("Test change post communy id by editPost, new community does not exist", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
	
				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
	
				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await expect(peeranhaContent.connect(signers[1]).editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost))
					.to.be.revertedWith('Community does not exist');
				await expect(peeranhaContent.connect(signers[1]).editPost(1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost))
					.to.be.revertedWith('Community does not exist');
			});
	
			it("Test change post communy id by editPost, new community is frozen", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);
	
				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);
	
				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaCommunity.freezeCommunity(2);
				
				await expect(peeranhaContent.connect(signers[1]).editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost))
					.to.be.revertedWith('Community is frozen');
			});
	
			it("Test change post community Id by editPost", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);
	
				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);
	
				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				const post = await peeranhaContent.getPost(1);
				expect(post.communityId).to.equal(1);
	
				await peeranhaContent.connect(signers[1]).editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
	
				const postNew = await peeranhaContent.getPost(1);
				expect(postNew.communityId).to.equal(2);
			});

			it("Test change post community Id to by editPost", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const countOfCommunities = DefaultCommunityId;
				const communitiesIds = getIdsContainer(countOfCommunities);
	
				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);
	
				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				const post = await peeranhaContent.getPost(1);
				expect(post.communityId).to.equal(1);
	
				await peeranhaContent.connect(signers[1]).editPost(1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost);
	
				const postNew = await peeranhaContent.getPost(1);
				expect(postNew.communityId).to.equal(DefaultCommunityId);
			});
		});

		describe('Change post community id after post upvote', function () {

			it("Test upVote expert post community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + UpvotedExpertPost);
			});

			it("Test upVote common post community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await peeranhaContent.voteItem(1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + UpvotedCommonPost);
			});

			it("Test upVote tutorial community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.Tutorial);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + UpvotedTutorial);
			});

			it("Test upVote expert post community-1 -> default-community", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const countOfCommunities = DefaultCommunityId;
				const communitiesIds = getIdsContainer(countOfCommunities);
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost);

				await peeranhaContent.editPost(1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(newRatingCommunity2).to.equal(StartRating + UpvotedExpertPost);
			});

			it("Test upVote common post community-1 -> default-community", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = DefaultCommunityId;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost);

				await peeranhaContent.editPost(1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.CommonPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(newRatingCommunity2).to.equal(StartRating + UpvotedCommonPost);
			});

			it("Test upVote tutorial community-1 -> default-community", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = DefaultCommunityId;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial);

				await peeranhaContent.editPost(1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.Tutorial);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(newRatingCommunity2).to.equal(StartRating + UpvotedTutorial);
			});
		});

		describe('Change post community id after post downVote', function () {

			it("Test downVote expert post community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedExpertPost);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + DownvotedExpertPost);

				const newRatingVoteCommunity1 = await peeranhaUser.getUserRating(accountDeployed, 1);
				await expect(newRatingVoteCommunity1).to.equal(StartRating + DownvoteExpertPost);
				const newRatingVoteCommunity2 = await peeranhaUser.getUserRating(accountDeployed, 2);
				await expect(newRatingVoteCommunity2).to.equal(0);
			});

			it("Test downVote common post community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await peeranhaContent.voteItem(1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedCommonPost);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + DownvotedCommonPost);

				const newRatingVoteCommunity1 = await peeranhaUser.getUserRating(accountDeployed, 1);
				await expect(newRatingVoteCommunity1).to.equal(StartRating + DownvoteCommonPost);
				const newRatingVoteCommunity2 = await peeranhaUser.getUserRating(accountDeployed, 2);
				await expect(newRatingVoteCommunity2).to.equal(0);
			});

			it("Test downvoted tutorial community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedTutorial);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.Tutorial);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + DownvotedTutorial);

				const newRatingVoteCommunity1 = await peeranhaUser.getUserRating(accountDeployed, 1);
				await expect(newRatingVoteCommunity1).to.equal(StartRating + DownvoteTutorial);
				const newRatingVoteCommunity2 = await peeranhaUser.getUserRating(accountDeployed, 2);
				await expect(newRatingVoteCommunity2).to.equal(0);
			});

			it("Test downvoted expert post community-1 -> default-community", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const countOfCommunities = DefaultCommunityId;
				const communitiesIds = getIdsContainer(countOfCommunities);
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedExpertPost);

				await peeranhaContent.editPost(1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(newRatingCommunity2).to.equal(StartRating + DownvotedExpertPost);

				const newRatingVoteCommunity1 = await peeranhaUser.getUserRating(accountDeployed, 1);
				await expect(newRatingVoteCommunity1).to.equal(StartRating + DownvoteExpertPost);
				const newRatingVoteCommunity2 = await peeranhaUser.getUserRating(accountDeployed, 2);
				await expect(newRatingVoteCommunity2).to.equal(0);
			});

			it("Test downVoted common post community-1 -> default-community", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = DefaultCommunityId;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedCommonPost);

				await peeranhaContent.editPost(1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.CommonPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(newRatingCommunity2).to.equal(StartRating + DownvotedCommonPost);

				const newRatingVoteCommunity1 = await peeranhaUser.getUserRating(accountDeployed, 1);
				await expect(newRatingVoteCommunity1).to.equal(StartRating + DownvoteCommonPost);
				const newRatingVoteCommunity2 = await peeranhaUser.getUserRating(accountDeployed, 2);
				await expect(newRatingVoteCommunity2).to.equal(0);
			});

			it("Test downVoted tutorial community-1 -> default-community", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = DefaultCommunityId;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedTutorial);

				await peeranhaContent.editPost(1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.Tutorial);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(newRatingCommunity2).to.equal(StartRating + DownvotedTutorial);

				const newRatingVoteCommunity1 = await peeranhaUser.getUserRating(accountDeployed, 1);
				await expect(newRatingVoteCommunity1).to.equal(StartRating + DownvoteTutorial);
				const newRatingVoteCommunity2 = await peeranhaUser.getUserRating(accountDeployed, 2);
				await expect(newRatingVoteCommunity2).to.equal(0);
			});
		});

		describe('Change post community id after 2 post upvotes', function () {

			it("Test 2 upVote 2 downVote expert post community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);
				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);

				const newRatingVote3Community1 = await peeranhaUser.getUserRating(signers[3].address, 1);
				await expect(newRatingVote3Community1).to.equal(StartRating + DownvoteExpertPost + 100);	// 100 - createUserWithAnotherRating
				const newRatingVote3Community2 = await peeranhaUser.getUserRating(signers[3].address, 2);
				await expect(newRatingVote3Community2).to.equal(0);

				const newRatingVote4Community1 = await peeranhaUser.getUserRating(signers[4].address, 1);
				await expect(newRatingVote4Community1).to.equal(StartRating + DownvoteExpertPost + 100);	// 100 - createUserWithAnotherRating
				const newRatingVote4Community2 = await peeranhaUser.getUserRating(signers[4].address, 2);
				await expect(newRatingVote4Community2).to.equal(0);
			});

			it("Test 2 upVote 2 downVote common post community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(0);	// StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2   = 10
			});

			it("Test 2 upVote 2 downVote tutorial community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial * 2 + DownvotedTutorial * 2);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.Tutorial);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + UpvotedTutorial * 2 + DownvotedTutorial * 2);
			});

			it("Test 2 upVote 2 downVote expert post community-1 -> DefaultCommunity", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = DefaultCommunityId;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);
				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);

				await peeranhaContent.editPost(1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(newRatingCommunity2).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);
			});

			it("Test 2 upVote 2 downVote common post community-1 -> DefaultCommunity", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = DefaultCommunityId;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);

				await peeranhaContent.editPost(1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.CommonPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(newRatingCommunity2).to.equal(0);	// StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2   = 10
			});

			it("Test 2 upVote 2 downVote tutorial community-1 -> DefaultCommunity", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = DefaultCommunityId;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial * 2 + DownvotedTutorial * 2);

				await peeranhaContent.editPost(1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.Tutorial);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(newRatingCommunity2).to.equal(StartRating + UpvotedTutorial * 2 + DownvotedTutorial * 2);
			});

			it("Test 2 upVote 2 downVote expert post DefaultCommunity -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 3;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, DefaultCommunityId);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, DefaultCommunityId);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, DefaultCommunityId);

				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);
				await peeranhaContent.connect(signers[1]).createPost(DefaultCommunityId, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);
			});

			it("Test 2 upVote 2 downVote common post DefaultCommunity -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 3;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, DefaultCommunityId);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, DefaultCommunityId);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, DefaultCommunityId);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(DefaultCommunityId, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(0);
			});

			it("Test 2 upVote 2 downVote tutorial DefaultCommunity -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 3;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, DefaultCommunityId);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, DefaultCommunityId);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, DefaultCommunityId);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(DefaultCommunityId, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial * 2 + DownvotedTutorial * 2);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.Tutorial);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + UpvotedTutorial * 2 + DownvotedTutorial * 2);
			});
		});

		describe('Change post community id after 4 cancel post upvote', function () {

			it("Test 4 cancel votes expert post community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

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

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(0);

				const newRatingVote3Community1 = await peeranhaUser.getUserRating(signers[3].address, 1);
				await expect(newRatingVote3Community1).to.equal(StartRating + 100);	// 100 - createUserWithAnotherRating
				const newRatingVote3Community2 = await peeranhaUser.getUserRating(signers[3].address, 2);
				await expect(newRatingVote3Community2).to.equal(0);

				const newRatingVote4Community1 = await peeranhaUser.getUserRating(signers[4].address, 1);
				await expect(newRatingVote4Community1).to.equal(StartRating + 100);	// 100 - createUserWithAnotherRating
				const newRatingVote4Community2 = await peeranhaUser.getUserRating(signers[4].address, 2);
				await expect(newRatingVote4Community2).to.equal(0);
			});

			it("Test cancel votes common post community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

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

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(0);
			});

			it("Test cancel votes tutorial community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
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

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.Tutorial);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(0);
			});
		});

		describe('Change post community id after upvote reply', function () {		

			it("Test upVote expert reply community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertReply + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + UpvotedExpertReply + FirstExpertReply + QuickExpertReply);
			});

			it("Test upVote common reply community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonReply + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + UpvotedCommonReply + FirstCommonReply + QuickCommonReply);
			});

			it("Test upVote expert reply community-1 -> community-2 (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertReply + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + DeleteOwnReply);
			});

			it("Test upVote common reply community-1 -> community-2 (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonReply + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + DeleteOwnReply);
			});
		});

		describe('Change post community id after downVote reply', function () {		

			it("Test downVote expert reply community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.voteItem(1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedExpertReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + DownvotedExpertReply);

				const newRatingVoteCommunity1 = await peeranhaUser.getUserRating(accountDeployed, 1);
				await expect(newRatingVoteCommunity1).to.equal(StartRating + DownvoteExpertReply);
				const newRatingVoteCommunity2 = await peeranhaUser.getUserRating(accountDeployed, 2);
				await expect(newRatingVoteCommunity2).to.equal(0);
			});

			it("Test downVote common reply community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedCommonReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + DownvotedCommonReply);

				const newRatingVoteCommunity1 = await peeranhaUser.getUserRating(accountDeployed, 1);
				await expect(newRatingVoteCommunity1).to.equal(StartRating + DownvoteCommonReply);
				const newRatingVoteCommunity2 = await peeranhaUser.getUserRating(accountDeployed, 2);
				await expect(newRatingVoteCommunity2).to.equal(0);
			});

			it("Test downVote expert reply community-1 -> community-2 (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.voteItem(1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedExpertReply);

				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply + DownvotedExpertReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating + DownvotedExpertReply);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + DeleteOwnReply);

				const newRatingVoteCommunity1 = await peeranhaUser.getUserRating(accountDeployed, 1);
				await expect(newRatingVoteCommunity1).to.equal(StartRating + DownvoteExpertReply);
				const newRatingVoteCommunity2 = await peeranhaUser.getUserRating(accountDeployed, 2);
				await expect(newRatingVoteCommunity2).to.equal(0);
			});

			it("Test downVote common reply community-1 -> community-2 (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedCommonReply);

				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply + DownvotedCommonReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating + DownvotedCommonReply);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + DeleteOwnReply);

				const newRatingVoteCommunity1 = await peeranhaUser.getUserRating(accountDeployed, 1);
				await expect(newRatingVoteCommunity1).to.equal(StartRating + DownvoteCommonReply);
				const newRatingVoteCommunity2 = await peeranhaUser.getUserRating(accountDeployed, 2);
				await expect(newRatingVoteCommunity2).to.equal(0);
			});
		});

		describe('Change post community id after 2 upVote 2 downVote reply', function () {	

			it("Test 2 upVote 2 downVote expert reply community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

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

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + UpvotedExpertReply * 2 + DownvotedExpertReply * 2 + FirstExpertReply + QuickExpertReply);
			
				const newRatingVote3Community1 = await peeranhaUser.getUserRating(signers[3].address, 1);
				await expect(newRatingVote3Community1).to.equal(StartRating + DownvoteExpertReply + 100);	// 100 - createUserWithAnotherRating
				const newRatingVote3Community2 = await peeranhaUser.getUserRating(signers[3].address, 2);
				await expect(newRatingVote3Community2).to.equal(0);

				const newRatingVote4Community1 = await peeranhaUser.getUserRating(signers[4].address, 1);
				await expect(newRatingVote4Community1).to.equal(StartRating + DownvoteExpertReply + 100);	// 100 - createUserWithAnotherRating
				const newRatingVote4Community2 = await peeranhaUser.getUserRating(signers[4].address, 2);
				await expect(newRatingVote4Community2).to.equal(0);
			});

			it("Test 2 upVote 2 downVote common reply community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

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

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + UpvotedCommonReply * 2 + DownvotedCommonReply * 2 + FirstCommonReply + QuickCommonReply);
			});

			it("Test 2 upVote 2 downVote expert reply community-1 -> community-2 (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

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

				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);
				
				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + DeleteOwnReply);
			});

			it("Test 2 upVote 2 downVote common reply community-1 -> community-2 (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

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

				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);
				
				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + DeleteOwnReply);

				const newRatingVote3Community1 = await peeranhaUser.getUserRating(signers[3].address, 1);
				await expect(newRatingVote3Community1).to.equal(StartRating + DownvoteCommonReply + 100);	// 100 - createUserWithAnotherRating
				const newRatingVote3Community2 = await peeranhaUser.getUserRating(signers[3].address, 2);
				await expect(newRatingVote3Community2).to.equal(0);

				const newRatingVote4Community1 = await peeranhaUser.getUserRating(signers[4].address, 1);
				await expect(newRatingVote4Community1).to.equal(StartRating + DownvoteCommonReply + 100);	// 100 - createUserWithAnotherRating
				const newRatingVote4Community2 = await peeranhaUser.getUserRating(signers[4].address, 2);
				await expect(newRatingVote4Community2).to.equal(0);
			});
		});

		describe('Change post community id after 4 cancel vote reply', function () {	

			it("Test 4 cancel vote expert reply community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

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

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				const newRatingVote3Community1 = await peeranhaUser.getUserRating(signers[3].address, 1);
				await expect(newRatingVote3Community1).to.equal(StartRating + 100);	// 100 - createUserWithAnotherRating
				const newRatingVote3Community2 = await peeranhaUser.getUserRating(signers[3].address, 2);
				await expect(newRatingVote3Community2).to.equal(0);

				const newRatingVote4Community1 = await peeranhaUser.getUserRating(signers[4].address, 1);
				await expect(newRatingVote4Community1).to.equal(StartRating + 100);	// 100 - createUserWithAnotherRating
				const newRatingVote4Community2 = await peeranhaUser.getUserRating(signers[4].address, 2);
				await expect(newRatingVote4Community2).to.equal(0);
			});

			it("Test 4 cancel vote common reply community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

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

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			});

			it("Test 4 cancel vote expert reply community-1 -> community-2 (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

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

				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + DeleteOwnReply);
			});

			it("Test 4 cancel vote common reply community-1 -> community-2 (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

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

				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + DeleteOwnReply);

				const newRatingVote3Community1 = await peeranhaUser.getUserRating(signers[3].address, 1);
				await expect(newRatingVote3Community1).to.equal(StartRating + 100); // 100 - createUserWithAnotherRating
				const newRatingVote3Community2 = await peeranhaUser.getUserRating(signers[3].address, 2);
				await expect(newRatingVote3Community2).to.equal(0);

				const newRatingVote4Community1 = await peeranhaUser.getUserRating(signers[4].address, 1);
				await expect(newRatingVote4Community1).to.equal(StartRating + 100);	// 100 - createUserWithAnotherRating
				const newRatingVote4Community2 = await peeranhaUser.getUserRating(signers[4].address, 2);
				await expect(newRatingVote4Community2).to.equal(0);
			});
		});

		describe('Change post community id first/quick reply 0 vote', function () {	

			it("Test first/quick expert reply community-1 -> community-2 0 vote", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createReply(1, 0, hashContainer[1], false);
				
				const userRating =  await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
			});

			it("Test first/quick common reply community-1 -> community-2 0 vote", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await peeranhaContent.createReply(1, 0, hashContainer[1], false);
				
				const userRating =  await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			});

			it("Test first/quick expert reply community-1 -> community-2 0 vote (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createReply(1, 0, hashContainer[1], false);
				
				const userRating =  await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.deleteReply(1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + DeleteOwnReply);
			});
		});

		describe('Change post community id first/quick/best reply', function () {	

			it("Test best expert reply community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				await peeranhaContent.changeStatusBestReply(1, 1);
				
				const ratingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const ratingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(ratingPost).to.equal(StartRating + AcceptedExpertReply);
				await expect(ratingReply).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
				const newRatingPostCommunity1 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const newRatingReplyCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingPostCommunity1).to.equal(StartRating);
				await expect(newRatingReplyCommunity1).to.equal(StartRating);
				const newRatingPostCommunity2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 2);
				const newRatingReplyCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingPostCommunity2).to.equal(StartRating + AcceptedExpertReply);
				await expect(newRatingReplyCommunity2).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);
			});

			it("Test best common reply community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				await peeranhaContent.changeStatusBestReply(1, 1);
				
				const ratingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const ratingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(ratingPost).to.equal(StartRating + AcceptedCommonReply);
				await expect(ratingReply).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
				const newRatingPostCommunity1 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const newRatingReplyCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingPostCommunity1).to.equal(StartRating);
				await expect(newRatingReplyCommunity1).to.equal(StartRating);
				const newRatingPostCommunity2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 2);
				const newRatingReplyCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingPostCommunity2).to.equal(StartRating + AcceptedCommonReply);
				await expect(newRatingReplyCommunity2).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);
			});

			it("Test best expert reply community-1 -> community-2 (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				await peeranhaContent.changeStatusBestReply(1, 1);
				
				const ratingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const ratingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(ratingPost).to.equal(StartRating + AcceptedExpertReply);
				await expect(ratingReply).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				const ratingReplyAfterDeleteReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				const ratingPostAfterDeleteReply = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(ratingPostAfterDeleteReply).to.equal(StartRating + AcceptedExpertReply);
				await expect(ratingReplyAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
				const newRatingPostCommunity1 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const newRatingReplyCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingPostCommunity1).to.equal(StartRating + AcceptedExpertReply);
				await expect(newRatingReplyCommunity1).to.equal(StartRating);
				const newRatingPostCommunity2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 2);
				const newRatingReplyCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingPostCommunity2).to.equal(0);
				await expect(newRatingReplyCommunity2).to.equal(StartRating + DeleteOwnReply);
			});

			it("Test best common reply community-1 -> community-2 (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				await peeranhaContent.changeStatusBestReply(1, 1);
				
				const ratingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const ratingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(ratingPost).to.equal(StartRating + AcceptedCommonReply);
				await expect(ratingReply).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				const ratingReplyAfterDeleteReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				const ratingPostAfterDeleteReply = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(ratingPostAfterDeleteReply).to.equal(StartRating + AcceptedCommonReply);
				await expect(ratingReplyAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
				const newRatingPostCommunity1 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const newRatingReplyCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingPostCommunity1).to.equal(StartRating + AcceptedCommonReply);
				await expect(newRatingReplyCommunity1).to.equal(StartRating);
				const newRatingPostCommunity2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 2);
				const newRatingReplyCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingPostCommunity2).to.equal(0);
				await expect(newRatingReplyCommunity2).to.equal(StartRating + DeleteOwnReply);
			});
		});

		describe('Actions after change community id', function () {
		
			describe('upvote after change community id', function () {
			
				it("Test upVote expert post after community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 2;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					
					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
					await peeranhaContent.voteItem(1, 0, 0, 1);
			
					const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRatingCommunity1).to.equal(0);
					const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
					await expect(newRatingCommunity2).to.equal(StartRating + UpvotedExpertPost);
				});

				it("Test upVote common post after community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 2;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					
					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
					await peeranhaContent.voteItem(1, 0, 0, 1);

					const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRatingCommunity1).to.equal(0);
					const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
					await expect(newRatingCommunity2).to.equal(StartRating + UpvotedCommonPost);
				});
			});

			describe('2 upVote 2 downVote post after change community id', function () {

				it("Test 2 upVote 2 downVote expert post after community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 2;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 2);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 2);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 2);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					
					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
					await peeranhaContent.voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

					const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRatingCommunity1).to.equal(0);
					const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
					await expect(newRatingCommunity2).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);

					const newRatingVote3Community1 = await peeranhaUser.getUserRating(signers[3].address, 1);
					await expect(newRatingVote3Community1).to.equal(0);
					const newRatingVote3Community2 = await peeranhaUser.getUserRating(signers[3].address, 2);
					await expect(newRatingVote3Community2).to.equal(StartRating + DownvoteExpertPost + 100); 	// 100 - createUserWithAnotherRating

					const newRatingVote4Community1 = await peeranhaUser.getUserRating(signers[4].address, 1);
					await expect(newRatingVote4Community1).to.equal(0);
					const newRatingVote4Community2 = await peeranhaUser.getUserRating(signers[4].address, 2);
					await expect(newRatingVote4Community2).to.equal(StartRating + DownvoteExpertPost + 100);	// 100 - createUserWithAnotherRating
				});

				it("Test 2 upVote 2 downVote common post after community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 2;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 2);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 2);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 2);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					
					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
					await peeranhaContent.voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

					const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRatingCommunity1).to.equal(0);
					const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
					await expect(newRatingCommunity2).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);
				});
			});

			describe('4 cancel vote after change community id', function () {

				it("Test cancel vote post after community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 2;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					
					await peeranhaContent.voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
					await peeranhaContent.voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

					const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRatingCommunity1).to.equal(StartRating);
					const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
					await expect(newRatingCommunity2).to.equal(StartRating);
				});

				it("Test cancel vote common post after community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 2;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					
					await peeranhaContent.voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
					await peeranhaContent.voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 0, 0, 0);

					const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRatingCommunity1).to.equal(StartRating);
					const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
					await expect(newRatingCommunity2).to.equal(StartRating);
				});
			});

			describe('upVote reply after change community id', function () {

				it("Test upVote expert reply after community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 2;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					
					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
					await peeranhaContent.voteItem(1, 1, 0, 1);

					const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRatingCommunity1).to.equal(0);
					const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
					await expect(newRatingCommunity2).to.equal(StartRating + UpvotedExpertReply);
				});

				it("Test upVote common reply after community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 2;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					
					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
					await peeranhaContent.voteItem(1, 1, 0, 1);

					const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRatingCommunity1).to.equal(0);
					const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
					await expect(newRatingCommunity2).to.equal(StartRating + UpvotedCommonReply);
				});
			});

			describe('downVote reply after change community id', function () {

				it("Test downVote expert reply after community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 2;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					
					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
					await peeranhaContent.voteItem(1, 1, 0, 0);


					const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRatingCommunity1).to.equal(0);
					const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
					await expect(newRatingCommunity2).to.equal(StartRating + DownvotedExpertReply);

					const newRatingVoteCommunity1 = await peeranhaUser.getUserRating(accountDeployed, 1);
					await expect(newRatingVoteCommunity1).to.equal(0);
					const newRatingVoteCommunity2 = await peeranhaUser.getUserRating(accountDeployed, 2);
					await expect(newRatingVoteCommunity2).to.equal(StartRating + DownvoteExpertReply);
				});

				it("Test downVote common reply after community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 2;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					
					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
					await peeranhaContent.voteItem(1, 1, 0, 0);

					const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRatingCommunity1).to.equal(0);
					const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
					await expect(newRatingCommunity2).to.equal(StartRating + DownvotedCommonReply);

					const newRatingVoteCommunity1 = await peeranhaUser.getUserRating(accountDeployed, 1);
					await expect(newRatingVoteCommunity1).to.equal(0);
					const newRatingVoteCommunity2 = await peeranhaUser.getUserRating(accountDeployed, 2);
					await expect(newRatingVoteCommunity2).to.equal(StartRating + DownvoteCommonReply);
				});
			});

			describe('2 cancel vote for reply after change community id', function () {

				it("Test 2 upVote 2 downVote expert reply after community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 2;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 2);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 2);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 2);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					
					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
					await peeranhaContent.voteItem(1, 1, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 1, 0, 0);

					const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRatingCommunity1).to.equal(0);
					const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
					await expect(newRatingCommunity2).to.equal(StartRating + UpvotedExpertReply * 2 + DownvotedExpertReply * 2);

					const newRatingVote3Community1 = await peeranhaUser.getUserRating(signers[3].address, 1);
					await expect(newRatingVote3Community1).to.equal(0);
					const newRatingVote3Community2 = await peeranhaUser.getUserRating(signers[3].address, 2);
					await expect(newRatingVote3Community2).to.equal(StartRating + DownvoteExpertReply + 100);	// 100 - createUserWithAnotherRating

					const newRatingVote4Community1 = await peeranhaUser.getUserRating(signers[4].address, 1);
					await expect(newRatingVote4Community1).to.equal(0);
					const newRatingVote4Community2 = await peeranhaUser.getUserRating(signers[4].address, 2);
					await expect(newRatingVote4Community2).to.equal(StartRating + DownvoteExpertReply + 100);	// 100 - createUserWithAnotherRating
				});

				it("Test 2 upVote 2 downVote comon reply after community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 2;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 2);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 2);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 2);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					
					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
					await peeranhaContent.voteItem(1, 1, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 1, 0, 0);

					const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRatingCommunity1).to.equal(0);
					const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
					await expect(newRatingCommunity2).to.equal(StartRating + UpvotedCommonReply * 2 + DownvotedCommonReply * 2);
				});
			});

			describe('Cancel vote for reply after change community id', function () {

				it("Test cancel vote expert reply after community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 2;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					
					await peeranhaContent.voteItem(1, 1, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 1, 0, 0);

					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
					await peeranhaContent.voteItem(1, 1, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 1, 0, 0);

					const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRatingCommunity1).to.equal(StartRating);
					const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
					await expect(newRatingCommunity2).to.equal(StartRating);
				});

				it("Test cancel vote expert reply after community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 2;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					
					await peeranhaContent.voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 1, 0, 0);

					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
					await peeranhaContent.voteItem(1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(1, 1, 0, 0);

					const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRatingCommunity1).to.equal(StartRating);
					const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
					await expect(newRatingCommunity2).to.equal(StartRating);
				});
			});

			describe('publish first/quick reply after change community id', function () {

				it("Test first/quick expert reply after community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 2;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
					await peeranhaContent.createReply(1, 0, hashContainer[1], false);

					const newRatingCommunity1 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
					await expect(newRatingCommunity1).to.equal(0);
					const newRatingCommunity2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 2);
					await expect(newRatingCommunity2).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				});

				it("Test first/quick common reply after community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 2;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
					await peeranhaContent.createReply(1, 0, hashContainer[1], false);

					const newRatingCommunity1 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
					await expect(newRatingCommunity1).to.equal(0);
					const newRatingCommunity2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 2);
					await expect(newRatingCommunity2).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				});
			});

			describe('mark as best reply after change community id', function () {

				it("Test best expert reply community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 2;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await peeranhaContent.createReply(1, 0, hashContainer[1], false);
					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
					await peeranhaContent.connect(signers[1]).changeStatusBestReply(1, 1);

					const newRatingPostCommunity1 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
					const newRatingReplyCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRatingPostCommunity1).to.equal(StartRating);
					await expect(newRatingReplyCommunity1).to.equal(0);
					const newRatingPostCommunity2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 2);
					const newRatingReplyCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
					await expect(newRatingPostCommunity2).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply );
					await expect(newRatingReplyCommunity2).to.equal(StartRating + AcceptedExpertReply);
				});

				it("Test best common reply community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 2;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					await peeranhaContent.createReply(1, 0, hashContainer[1], false);
					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
					await peeranhaContent.connect(signers[1]).changeStatusBestReply(1, 1);

					const newRatingPostCommunity1 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
					const newRatingReplyCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRatingPostCommunity1).to.equal(StartRating);
					await expect(newRatingReplyCommunity1).to.equal(0);
					const newRatingPostCommunity2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 2);
					const newRatingReplyCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
					await expect(newRatingPostCommunity2).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);
					await expect(newRatingReplyCommunity2).to.equal(StartRating + AcceptedCommonReply);
				});
			});

			describe('delete post after change community id', function () {

				it("Test delete post after change expert post type community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 2;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
					await peeranhaContent.connect(signers[1]).deletePost(1);
					
					const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRatingCommunity1).to.equal(0);
					const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
					await expect(newRatingCommunity2).to.equal(StartRating + DeleteOwnPost);
				});
				
				it("Test delete reply after change common post type community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 2;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
					await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
					
					const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRatingCommunity1).to.equal(StartRating);
					const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
					await expect(newRatingCommunity2).to.equal(StartRating + DeleteOwnReply);
				});
			});
		});
	});

	describe('Change post type and community Id', function () {

		describe('Change post type and community Id', function () {

			it("Test change post type expert -> common and community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.CommonPost);
				await expect(post.communityId).to.equal(2);
				
			});

			it("Test change post type expert -> tutorial and community-1 -> default community", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 3;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.editPost(1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.Tutorial);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.Tutorial);
				await expect(post.communityId).to.equal(DefaultCommunityId);
			});
		});

		describe('Change post type and community id after post upvote', function () {

			it("Test upVote post expert -> common and community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);

				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + UpvotedCommonPost);
			});

			it("Test upVote post tutorial -> common and community-1 -> default community", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 3;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial);

				await peeranhaContent.editPost(1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.CommonPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);

				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(newRatingCommunity2).to.equal(StartRating + UpvotedCommonPost);
			});
		});

		describe('Change post type after post downVote', function () {

			it("Test downVote post expert -> common and community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 3;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedExpertPost);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingVoteCommunity1 = await peeranhaUser.getUserRating(accountDeployed, 1);
				await expect(newRatingVoteCommunity1).to.equal(StartRating + DownvoteCommonPost);

				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + DownvotedCommonPost);
				const newRatingVoteCommunity2 = await peeranhaUser.getUserRating(accountDeployed, 2);
				await expect(newRatingVoteCommunity2).to.equal(0);
			});

			it("Test downVote post common -> expert and community-1 -> default community", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 3;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				
				await peeranhaContent.voteItem(1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedCommonPost);

				await peeranhaContent.editPost(1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingVoteCommunity1 = await peeranhaUser.getUserRating(accountDeployed, 1);
				await expect(newRatingVoteCommunity1).to.equal(StartRating + DownvoteExpertPost);

				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(newRatingCommunity2).to.equal(StartRating + DownvotedExpertPost);
				const newRatingVoteCommunity2 = await peeranhaUser.getUserRating(accountDeployed, DefaultCommunityId);
				await expect(newRatingVoteCommunity2).to.equal(0);
			});
		});
	
		describe('Change post type and community Id after upvote reply', function () {		

			it("Test upVote reply expert -> common and community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertReply + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);

				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + UpvotedCommonReply + FirstCommonReply + QuickCommonReply);
			});

			it("Test upVote reply common -> expert and community-1 -> default community", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 3;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonReply + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);

				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(newRatingCommunity2).to.equal(StartRating + UpvotedExpertReply + FirstExpertReply + QuickExpertReply);
			});

			it("Test upVote reply expert -> common and community-1 -> community-2 (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 3;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertReply + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);

				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + DeleteOwnReply);
			});
		});

		describe('Change post type and community id after downVote reply', function () {		

			it("Test downVote reply expert -> common and community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 3;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.voteItem(1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedExpertReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);
				const newRatingVoteCommunity1 = await peeranhaUser.getUserRating(accountDeployed, 1);
				await expect(newRatingVoteCommunity1).to.equal(StartRating + DownvoteCommonReply);

				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + DownvotedCommonReply);
				const newRatingVoteCommunity2 = await peeranhaUser.getUserRating(accountDeployed, 2);
				await expect(newRatingVoteCommunity2).to.equal(0);
			});

			it("Test downVote reply common -> expert and community-1 -> default community (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 3;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedCommonReply);

				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply + DownvotedCommonReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating + DownvotedCommonReply);
				const newRatingVoteCommunity1 = await peeranhaUser.getUserRating(accountDeployed, 1);
				await expect(newRatingVoteCommunity1).to.equal(StartRating + DownvotedCommonReply);

				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(newRatingCommunity2).to.equal(StartRating + DeleteOwnReply);
				const newRatingVoteCommunity2 = await peeranhaUser.getUserRating(accountDeployed, DefaultCommunityId);
				await expect(newRatingVoteCommunity2).to.equal(0);
			});
		});

		describe('Change post type and community id first/quick/best reply', function () {	

			it("Test best reply expert -> common and community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 3;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				await peeranhaContent.changeStatusBestReply(1, 1);
				
				const ratingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const ratingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(ratingPost).to.equal(StartRating + AcceptedExpertReply);
				await expect(ratingReply).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
				const newRatingPostCommunity1 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const newRatingReplyCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingPostCommunity1).to.equal(StartRating);
				await expect(newRatingReplyCommunity1).to.equal(StartRating);

				const newRatingPostCommunity2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 2);
				const newRatingReplyCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingPostCommunity2).to.equal(StartRating + AcceptedCommonReply);
				await expect(newRatingReplyCommunity2).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);
			});

			it("Test best reply common -> expert and community-1 -> default community (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 3;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				await peeranhaContent.changeStatusBestReply(1, 1);
				
				const ratingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const ratingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(ratingPost).to.equal(StartRating + AcceptedCommonReply);
				await expect(ratingReply).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				const ratingReplyAfterDeleteReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				const ratingPostAfterDeleteReply = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(ratingPostAfterDeleteReply).to.equal(StartRating + AcceptedCommonReply);
				await expect(ratingReplyAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost);
				const newRatingPostCommunity1 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const newRatingReplyCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingPostCommunity1).to.equal(StartRating + AcceptedCommonReply);
				await expect(newRatingReplyCommunity1).to.equal(StartRating);

				const newRatingPostCommunity2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, DefaultCommunityId);
				const newRatingReplyCommunity2 = await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(newRatingPostCommunity2).to.equal(0);
				await expect(newRatingReplyCommunity2).to.equal(StartRating + DeleteOwnReply);
			});
		});

		describe('Actions after change post type and community id', function () {
		
			describe('upvote after change post type and community id', function () {
			
				it("Test upVote post after expert -> common and community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 3;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					
					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
					await peeranhaContent.voteItem(1, 0, 0, 1);
			
					const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRatingCommunity1).to.equal(0);
					const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
					await expect(newRatingCommunity2).to.equal(StartRating + UpvotedCommonPost);
				});
			});

			describe('upVote reply after change post type and community id', function () {

				it("Test upVote reply after expert -> common and community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 3;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					
					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
					await peeranhaContent.voteItem(1, 1, 0, 1);
					const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRatingCommunity1).to.equal(0);
					const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
					await expect(newRatingCommunity2).to.equal(StartRating + UpvotedCommonReply);
				});

				it("Test upVote reply after common -> expert and community-1 -> default community", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 3;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					
					await peeranhaContent.editPost(1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost);
					await peeranhaContent.voteItem(1, 1, 0, 1);
					const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRatingCommunity1).to.equal(0);
					const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
					await expect(newRatingCommunity2).to.equal(StartRating + UpvotedExpertReply);
				});
			});

			describe('downVote reply after change post type and community id', function () {

				it("Test downVote reply after expert -> common and community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 3;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
					
					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
					await peeranhaContent.voteItem(1, 1, 0, 0);
					const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRatingCommunity1).to.equal(0);
					const newRatingVoteCommunity1 = await peeranhaUser.getUserRating(accountDeployed, 1);
					await expect(newRatingVoteCommunity1).to.equal(0);

					const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
					await expect(newRatingCommunity2).to.equal(StartRating + DownvotedCommonReply);
					const newRatingVoteCommunity2 = await peeranhaUser.getUserRating(accountDeployed, 2);
					await expect(newRatingVoteCommunity2).to.equal(StartRating + DownvoteCommonReply);
				});
			});

			describe('mark as best reply after change post type and community id', function () {

				it("Test best reply expert -> common and community-1 -> community-2", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 3;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
					await peeranhaUser.createUser(hashContainer[1]);
					await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await peeranhaContent.createReply(1, 0, hashContainer[1], false);
					await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
					await peeranhaContent.connect(signers[1]).changeStatusBestReply(1, 1);
					
					const userPostCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
					const userReplyCommunity1 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
					await expect(userPostCommunity1).to.equal(0);
					await expect(userReplyCommunity1).to.equal(StartRating);

					const userPostCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
					const userReplyCommunity2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 2);
					await expect(userPostCommunity2).to.equal(StartRating + AcceptedCommonReply);
					await expect(userReplyCommunity2).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);
				});
			});
		});

		describe('delete post after change post type and community id', function () {

			it("Test delete post after change post type expert -> common and community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 3;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.CommonPost);
				await peeranhaContent.connect(signers[1]).deletePost(1);
				
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(0);

				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + DeleteOwnPost);
			});
			
			it("Test delete reply after change post type common -> expert and community-1 -> community-2", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 3;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
				await peeranhaUser.createUser(hashContainer[1]);
				await createCommunities(peeranhaCommunity, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
				await peeranhaContent.editPost(1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
				await peeranhaContent.connect(signers[1]).deleteReply(1, 1);
				
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);

				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + DeleteOwnReply);
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

	describe("Test cancel vote without rating", function () {
		it("Test upVote post -> change rating and cancel vote ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.addUserRating(signers[1].address, 100, 1);
			
			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 1);

			const post = await peeranhaContent.getPost(1);
			await expect(post.rating).to.equal(1);

			await peeranhaUser.addUserRating(signers[1].address, -90, 1);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 1);
			const updatedPost = await peeranhaContent.getPost(1);
			await expect(updatedPost.rating).to.equal(0);
		});

		it("Test downVote post -> change rating and cancel vote ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.addUserRating(signers[1].address, 100, 1);
			
			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 0);

			const post = await peeranhaContent.getPost(1);
			await expect(post.rating).to.equal(-1);

			await peeranhaUser.addUserRating(signers[1].address, -90, 1);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 0);
			const updatedPost = await peeranhaContent.getPost(1);
			await expect(updatedPost.rating).to.equal(0);
		});

		it("Test upVote reply -> change rating and cancel vote ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.addUserRating(signers[1].address, 100, 1);
			
			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 1);

			const reply = await peeranhaContent.getReply(1, 1);
			await expect(reply.rating).to.equal(1);

			await peeranhaUser.addUserRating(signers[1].address, -90, 1);
			await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 1);
			const updatedReply = await peeranhaContent.getReply(1, 1);
			await expect(updatedReply.rating).to.equal(0);
		});

		it("Test downVote reply -> change rating and cancel vote ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.addUserRating(signers[1].address, 100, 1);
			
			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 0);

			const reply = await peeranhaContent.getReply(1, 1);
			await expect(reply.rating).to.equal(-1);

			await peeranhaUser.addUserRating(signers[1].address, -90, 1);
			await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 0);
			const updatedReply = await peeranhaContent.getReply(1, 1);
			await expect(updatedReply.rating).to.equal(0);
		});
	});

	describe("Test change vote without rating", function () {
		it("Test upVote post -> change rating and change vote ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.addUserRating(signers[1].address, 100, 1);
			
			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 1);

			const post = await peeranhaContent.getPost(1);
			await expect(post.rating).to.equal(1);

			await peeranhaUser.addUserRating(signers[1].address, -100, 1);
			await expect(peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 0))
				.to.be.revertedWith('low_rating_downvote_post');
		});

		it("Test downVote post -> change rating and change vote ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.addUserRating(signers[1].address, 100, 1);
			
			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 0);

			const post = await peeranhaContent.getPost(1);
			await expect(post.rating).to.equal(-1);

			await peeranhaUser.addUserRating(signers[1].address, -100, 1);
			await expect(peeranhaContent.connect(signers[1]).voteItem(1, 0, 0, 1))
				.to.be.revertedWith('low_rating_upvote_post');
		});

		it("Test upVote reply -> change rating and change vote", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.addUserRating(signers[1].address, 100, 1);
			
			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 1);

			const reply = await peeranhaContent.getReply(1, 1);
			await expect(reply.rating).to.equal(1);

			await peeranhaUser.addUserRating(signers[1].address, -100, 1);
			await expect(peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 0))
				.to.be.revertedWith('low_rating_downvote_reply');
		});

		it("Test downVote reply -> change rating and change vote ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.addUserRating(signers[1].address, 100, 1);
			
			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 0);

			const reply = await peeranhaContent.getReply(1, 1);
			await expect(reply.rating).to.equal(-1);

			await peeranhaUser.addUserRating(signers[1].address, -100, 1);
			await expect(peeranhaContent.connect(signers[1]).voteItem(1, 1, 0, 1))
				.to.be.revertedWith('low_rating_upvote_reply');
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

	// in utils error "ReferenceError: expect is not defined"
	const createCommunities = async (peeranhaCommunity, countOfCommunities, communitiesIds) => {
		const ipfsHashes = getHashesContainer(countOfCommunities);
		await Promise.all(communitiesIds.map(async(id) => {
			return await peeranhaCommunity.createCommunity(ipfsHashes[id - 1], createTags(5));
		}));

		expect(await peeranhaCommunity.getCommunitiesCount()).to.equal(countOfCommunities)

		await Promise.all(communitiesIds.map(async(id) => {
			const community = await peeranhaCommunity.getCommunity(id);
			return await expect(community.ipfsDoc.hash).to.equal(ipfsHashes[id - 1]);
		}));
	}
});
