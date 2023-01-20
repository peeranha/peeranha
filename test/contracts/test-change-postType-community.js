const { expect } = require("chai");
const { 
	wait, createPeerenhaAndTokenContract, registerTwoUsers, createUserWithAnotherRating, getHashContainer, getHashesContainer, createTags, getIdsContainer,
	PostTypeEnum, LanguagesEnum, StartRating, StartRatingWithoutAction, deleteTime, DeleteOwnReply, QuickReplyTime,
    DownvoteExpertPost, UpvotedExpertPost, DownvotedExpertPost, DownvoteCommonPost, UpvotedCommonPost, DownvotedCommonPost,
    ModeratorDeletePost, DownvoteExpertReply, UpvotedExpertReply, DownvotedExpertReply, AcceptExpertReply, AcceptedExpertReply, 
    FirstExpertReply, QuickExpertReply, DownvoteCommonReply, UpvotedCommonReply, DownvotedCommonReply, AcceptCommonReply,
    AcceptedCommonReply, FirstCommonReply, QuickCommonReply, ModeratorDeleteReply, ModeratorDeleteComment,
	DownvoteTutorial, UpvotedTutorial, DownvotedTutorial, DeleteOwnPost, DefaultCommunityId
} = require('./utils');

///
// change postType and communityId for post by moderator and author
///

describe("Test change postType and community id by moderator", function () {

	describe('Change post type', function () {

		describe('Change post type', function () {

			it("Test change post type, post does not exist", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)).
					to.be.revertedWith('Post_not_exist.');
			});

			it("Test change post type, post has been deleted", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.deletePost(signers[0].address, 1);

				await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)).
					to.be.revertedWith('Post_deleted.');
			});

			it("Test change post type expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.CommonPost);
			});

			it("Test change post type expert -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.Tutorial);
			});

			it("Test change post type expert -> tutorial (the post has reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

				await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English)).
					to.be.revertedWith('Error_postType');
			});

			it("Test change post type expert -> tutorial (the post had reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
		
				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		
				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
		
				await peeranhaContent.deleteReply(signers[0].address, 1, 1);
				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.Tutorial);
			});

			it("Test change post type common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.ExpertPost);
			});

			it("Test change post type common -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.Tutorial);
			});

			it("Test change post type common -> tutorial (the post has reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

				await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English)).
					to.be.revertedWith('Error_postType');
			});

			it("Test change post type common -> tutorial (the post had reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				await peeranhaContent.deleteReply(signers[0].address, 1, 1);
				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.Tutorial);
			});

			it("Test change post type tutoral -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.CommonPost);
			});

			it("Test change post type tutoral -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);

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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedCommonPost);
			});

			it("Test upVote post expert -> tytorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedTutorial);
			});

			it("Test upVote post common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertPost);
			});

			it("Test upVote post common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedTutorial);
			});

			it("Test upVote post tutorial -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertPost);
			});

			it("Test upVote post tutorial -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedExpertPost);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DownvotedCommonPost);
			});

			it("Test downVote post expert -> tytorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedExpertPost);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DownvotedTutorial);
			});

			it("Test downVote post common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedCommonPost);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DownvotedExpertPost);
			});

			it("Test downVote post common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedCommonPost);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DownvotedTutorial);
			});

			it("Test downVote post tutorial -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedTutorial);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DownvotedExpertPost);
			});

			it("Test downVote post tutorial -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedTutorial);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);
			});

			it("Test 2 upVote 2 downVote post expert -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedTutorial * 2 + DownvotedTutorial * 2);
			});

			it("Test 2 upVote 2 downVote post common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);
			});

			it("Test 2 upVote 2 downVote post common -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedTutorial * 2 + DownvotedTutorial * 2);
			});

			it("Test 2 upVote 2 downVote post tutorial -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial * 2 + DownvotedTutorial * 2);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);
			});

			it("Test 2 upVote 2 downVote post tutorial -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial * 2 + DownvotedTutorial * 2);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating);
			});

			it("Test 4 cancel votes post expert -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating);
			});

			it("Test cancel votes post common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating);
			});

			it("Test cancel votes post common -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating);
			});

			it("Test cancel votes post tutorial -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating);
			});

			it("Test 4 cancel votes post tutorial -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertReply + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedCommonReply + FirstCommonReply + QuickCommonReply);
			});

			it("Test upVote reply common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonReply + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertReply + FirstExpertReply + QuickExpertReply);
			});

			it("Test upVote reply expert -> common (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertReply + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DeleteOwnReply);
			});

			it("Test upVote reply common -> expert (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonReply + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedExpertReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DownvotedCommonReply);
			});

			it("Test downVote reply common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedCommonReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DownvotedExpertReply);
			});

			it("Test downVote reply expert -> common (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedExpertReply);

				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply + DownvotedExpertReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DeleteOwnReply + DownvotedExpertReply);
			});

			it("Test downVote reply common -> expert (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedCommonReply);

				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply + DownvotedCommonReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertReply * 2 + DownvotedExpertReply * 2 + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedCommonReply * 2 + DownvotedCommonReply * 2 + FirstCommonReply + QuickCommonReply);
			});

			it("Test 2 upVote 2 downVote reply common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonReply * 2 + DownvotedCommonReply * 2 + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertReply * 2 + DownvotedExpertReply * 2 + FirstExpertReply + QuickExpertReply);
			});

			it("Test 2 upVote 2 downVote reply expert -> common (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertReply * 2 + DownvotedExpertReply * 2 + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);
				
				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DeleteOwnReply);
			});

			it("Test 2 upVote 2 downVote reply common -> expert (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonReply * 2 + DownvotedCommonReply * 2 + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);
				
				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			});

			it("Test 4 cancel vote reply common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
			});

			it("Test 4 cancel vote reply expert -> common (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DeleteOwnReply);
			});

			it("Test 4 cancel vote reply common -> expert (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				
				const userRating =  await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(newRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			});

			it("Test first/quick reply common -> expert 0 vote", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				
				const userRating =  await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
				const newRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(newRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
			});

			it("Test first/quick reply expert -> common 0 vote (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				
				const userRating =  await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.deleteReply(signers[0].address, 1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);
				
				const ratingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const ratingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(ratingReply).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);
				await expect(ratingPost).to.equal(StartRating + AcceptedExpertReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);
				
				const ratingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const ratingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(ratingReply).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);
				await expect(ratingPost).to.equal(StartRating + AcceptedCommonReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);
				
				const ratingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const ratingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(ratingReply).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);
				await expect(ratingPost).to.equal(StartRating + AcceptedExpertReply);

				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				const ratingReplyAfterDeleteReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				const ratingPostAfterDeleteReply = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(ratingReplyAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);
				await expect(ratingPostAfterDeleteReply).to.equal(StartRating + AcceptedExpertReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);
				
				const ratingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const ratingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(ratingReply).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);
				await expect(ratingPost).to.equal(StartRating + AcceptedCommonReply);

				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				const ratingReplyAfterDeleteReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				const ratingPostAfterDeleteReply = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(ratingReplyAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);
				await expect(ratingPostAfterDeleteReply).to.equal(StartRating + AcceptedCommonReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
			
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + UpvotedCommonPost);
				});

				it("Test upVote post after common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);


					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + UpvotedCommonReply);
				});

				it("Test upVote reply after common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + DownvotedCommonReply);
				});

				it("Test downVote reply after common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					const newRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
					await expect(newRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				});

				it("Test first/quick reply after common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);
					
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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);
					
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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).deletePost(signers[1].address, 1);
					
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + DeleteOwnPost);
				});
				
				it("Test delete reply after change post type common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
					
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
	
				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
	
				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English))
					.to.be.revertedWith('Community does not exist');
				await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost, LanguagesEnum.English))
					.to.be.revertedWith('Community does not exist');
			});
	
			it("Test change post communy id by editPost, new community is frozen", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);
	
				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);
	
				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaCommunity.freezeCommunity(signers[0].address, 2);
				
				await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English))
					.to.be.revertedWith('Community is frozen');
			});
	
			it("Test change post community Id by editPost", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);
	
				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);
	
				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				const post = await peeranhaContent.getPost(1);
				expect(post.communityId).to.equal(1);
	
				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
	
				const postNew = await peeranhaContent.getPost(1);
				expect(postNew.communityId).to.equal(2);
			});

			it("Test change post community Id to by editPost", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const countOfCommunities = DefaultCommunityId;
				const communitiesIds = getIdsContainer(countOfCommunities);
	
				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);
	
				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				const post = await peeranhaContent.getPost(1);
				expect(post.communityId).to.equal(1);
	
				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost, LanguagesEnum.English);
	
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.Tutorial, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.Tutorial, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedExpertPost);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedCommonPost);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedTutorial);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.Tutorial, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedExpertPost);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedCommonPost);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedTutorial);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.Tutorial, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);
				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial * 2 + DownvotedTutorial * 2);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.Tutorial, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);
				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial * 2 + DownvotedTutorial * 2);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.Tutorial, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, DefaultCommunityId);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, DefaultCommunityId);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, DefaultCommunityId);

				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);
				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, DefaultCommunityId, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, DefaultCommunityId);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, DefaultCommunityId);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, DefaultCommunityId);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, DefaultCommunityId, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, DefaultCommunityId);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, DefaultCommunityId);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, DefaultCommunityId);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, DefaultCommunityId, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial * 2 + DownvotedTutorial * 2);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.Tutorial, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.Tutorial, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertReply + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonReply + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertReply + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating + DeleteOwnReply);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(0);
			});

			it("Test upVote common reply community-1 -> community-2 (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonReply + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating + DeleteOwnReply);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(0);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedExpertReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedCommonReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedExpertReply);

				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply + DownvotedExpertReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating + DownvotedExpertReply + DeleteOwnReply);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(0);

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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedCommonReply);

				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply + DownvotedCommonReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating + DeleteOwnReply + DownvotedCommonReply);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(0);

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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertReply * 2 + DownvotedExpertReply * 2 + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonReply * 2 + DownvotedCommonReply * 2 + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertReply * 2 + DownvotedExpertReply * 2 + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);
				
				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating + DeleteOwnReply);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(0);
			});

			it("Test 2 upVote 2 downVote common reply community-1 -> community-2 (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonReply * 2 + DownvotedCommonReply * 2 + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);
				
				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating + DeleteOwnReply);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(0);

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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating + DeleteOwnReply);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(0);
			});

			it("Test 4 cancel vote common reply community-1 -> community-2 (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating + DeleteOwnReply);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(0);

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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				
				const userRating =  await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				
				const userRating =  await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				
				const userRating =  await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.deleteReply(signers[0].address, 1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(newRatingCommunity1).to.equal(StartRating + DeleteOwnReply);
				const newRatingCommunity2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 2);
				await expect(newRatingCommunity2).to.equal(0);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);
				
				const ratingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const ratingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(ratingPost).to.equal(StartRating + AcceptedExpertReply);
				await expect(ratingReply).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);
				
				const ratingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const ratingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(ratingPost).to.equal(StartRating + AcceptedCommonReply);
				await expect(ratingReply).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);
				
				const ratingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const ratingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(ratingPost).to.equal(StartRating + AcceptedExpertReply);
				await expect(ratingReply).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				const ratingReplyAfterDeleteReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				const ratingPostAfterDeleteReply = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(ratingPostAfterDeleteReply).to.equal(StartRating + AcceptedExpertReply);
				await expect(ratingReplyAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
				const newRatingPostCommunity1 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const newRatingReplyCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingPostCommunity1).to.equal(StartRating + AcceptedExpertReply);
				await expect(newRatingReplyCommunity1).to.equal(StartRating + DeleteOwnReply);
				const newRatingPostCommunity2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 2);
				const newRatingReplyCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingPostCommunity2).to.equal(0);
				await expect(newRatingReplyCommunity2).to.equal(0);
			});

			it("Test best common reply community-1 -> community-2 (delete reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);
				const countOfCommunities = 2;
				const communitiesIds = getIdsContainer(countOfCommunities);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);
				
				const ratingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const ratingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(ratingPost).to.equal(StartRating + AcceptedCommonReply);
				await expect(ratingReply).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				const ratingReplyAfterDeleteReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				const ratingPostAfterDeleteReply = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(ratingPostAfterDeleteReply).to.equal(StartRating + AcceptedCommonReply);
				await expect(ratingReplyAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
				const newRatingPostCommunity1 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const newRatingReplyCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingPostCommunity1).to.equal(StartRating + AcceptedCommonReply);
				await expect(newRatingReplyCommunity1).to.equal(StartRating + DeleteOwnReply);
				const newRatingPostCommunity2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 2);
				const newRatingReplyCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingPostCommunity2).to.equal(0);
				await expect(newRatingReplyCommunity2).to.equal(0);
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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
			
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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);

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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 2);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 2);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 2);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 2);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 2);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 2);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);

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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);

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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);


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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);

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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 2);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 2);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 2);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 2);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 2);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 2);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
					await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);

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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);

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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).deletePost(signers[1].address, 1);
					
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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
					
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);

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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.Tutorial, LanguagesEnum.English);

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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedExpertPost);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedCommonPost);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertReply + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonReply + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertReply + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating + DeleteOwnReply);

				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(0);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedExpertReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedCommonReply);

				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply + DownvotedCommonReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost, LanguagesEnum.English);
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating + DeleteOwnReply + DownvotedCommonReply);
				const newRatingVoteCommunity1 = await peeranhaUser.getUserRating(accountDeployed, 1);
				await expect(newRatingVoteCommunity1).to.equal(StartRating + DownvotedCommonReply);

				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(newRatingCommunity2).to.equal(0);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);
				
				const ratingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const ratingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(ratingPost).to.equal(StartRating + AcceptedExpertReply);
				await expect(ratingReply).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);
				
				const ratingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const ratingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(ratingPost).to.equal(StartRating + AcceptedCommonReply);
				await expect(ratingReply).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				const ratingReplyAfterDeleteReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				const ratingPostAfterDeleteReply = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(ratingPostAfterDeleteReply).to.equal(StartRating + AcceptedCommonReply);
				await expect(ratingReplyAfterDeleteReply).to.equal(StartRating + DeleteOwnReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost, LanguagesEnum.English);
				const newRatingPostCommunity1 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const newRatingReplyCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingPostCommunity1).to.equal(StartRating + AcceptedCommonReply);
				await expect(newRatingReplyCommunity1).to.equal(StartRating + DeleteOwnReply);

				const newRatingPostCommunity2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, DefaultCommunityId);
				const newRatingReplyCommunity2 = await peeranhaUser.getUserRating(signers[1].address, DefaultCommunityId);
				await expect(newRatingPostCommunity2).to.equal(0);
				await expect(newRatingReplyCommunity2).to.equal(0);
			});
		});

		describe('Actions after change post type and community id', function () {
		
			describe('upvote after change post type and community id', function () {
			
				it("", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);
					const countOfCommunities = 3;
					const communitiesIds = getIdsContainer(countOfCommunities);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
			
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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);
					
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).deletePost(signers[1].address, 1);
				
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
				
				const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingCommunity1).to.equal(StartRating);

				const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
				await expect(newRatingCommunity2).to.equal(StartRating + DeleteOwnReply);
			});
		});
	});
});








//////////////////////////////////////////////////////////////////////////////






describe("Test change postType and community id by author", function () {
	
	describe('Test change post community id call editPost by admin + comModer', function () {

		it("Test change post community id, post does not exist", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const countOfCommunities = 2;
			const communitiesIds = getIdsContainer(countOfCommunities);

			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

			await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English)).
                to.be.revertedWith('Post_not_exist.');
		});

		it("Test change post communy id by editPost, post has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const countOfCommunities = 2;
			const communitiesIds = getIdsContainer(countOfCommunities);

			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.deletePost(signers[0].address, 1);
			
			await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English)).
                to.be.revertedWith('Post_deleted.');
		});

		it("Test change post communy id by editPost, new community does not exist", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

			await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English)).
                to.be.revertedWith('Community does not exist');
			await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost, LanguagesEnum.English)).
                to.be.revertedWith('Community does not exist');
		});

		it("Test change post communy id by editPost, new community is frozen", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const countOfCommunities = 2;
			const communitiesIds = getIdsContainer(countOfCommunities);

			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaCommunity.freezeCommunity(signers[0].address, 2);

			await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English)).
                to.be.revertedWith('Community is frozen');
		});

		it("Test change community Id", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const countOfCommunities = 3;
			const communitiesIds = getIdsContainer(countOfCommunities);

			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			const post = await peeranhaContent.getPost(1);
			expect(post.communityId).to.equal(1);

			await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
			const postNew = await peeranhaContent.getPost(1);
			expect(postNew.communityId).to.equal(2);

			await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost, LanguagesEnum.English);
			const postNew2 = await peeranhaContent.getPost(1);
			expect(postNew2.communityId).to.equal(DefaultCommunityId);

			await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);
			const postNew3 = await peeranhaContent.getPost(1);
			expect(postNew3.communityId).to.equal(2);
		});
	});

	describe('Change post community id call editPost by common author', function () {
		it("Test change post communy id by editPost, new community does not exist", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			
			await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English))
				.to.be.revertedWith('Community does not exist');
			await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost, LanguagesEnum.English))
				.to.be.revertedWith('Community does not exist');
		});

		it("Test change post communy id by editPost, new community is frozen", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const countOfCommunities = 2;
			const communitiesIds = getIdsContainer(countOfCommunities);

			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaCommunity.freezeCommunity(signers[0].address, 2);
			
			await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English))
				.to.be.revertedWith('Community is frozen');
		});

		it("Test change post community Id by editPost", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const countOfCommunities = 2;
			const communitiesIds = getIdsContainer(countOfCommunities);

			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			const post = await peeranhaContent.getPost(1);
			expect(post.communityId).to.equal(1);

			await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);

			const postNew = await peeranhaContent.getPost(1);
			expect(postNew.communityId).to.equal(2);
		});
	});

	describe('Change post type by edit post', function () {

		describe('Change post type by edit post', function () {

			it("Test change post type by editPost expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);
				
				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.CommonPost);
			});

			it("Test change post type by editPost Expert -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.Tutorial);
			});

			it("Test change post type by editPost Expert -> tutorial (the post has reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

				await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English))
					.to.be.revertedWith('Error_postType');
			});

			it("Test change post type by editPost common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.ExpertPost);
			});

			it("Test change post type by editPost common -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.Tutorial);
			});

			it("Test change post type by editPost common -> tutorial (the post has reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

				await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English))
					.to.be.revertedWith('Error_postType');
			});

			it("Test change post type by editPost tutoral -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.CommonPost);
			});

			it("Test change post type by editPost tutoral -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.ExpertPost);
			});
		});

		describe('Change post type by edit post after post upvote', function () {

			it("Test upVote post expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedCommonPost);
			});

			it("Test upVote post expert -> tytorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedTutorial);
			});

			it("Test upVote post common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertPost);
			});

			it("Test upVote post common -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedTutorial);
			});

			it("Test upVote post tutorial -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedTutorial);
			});

			it("Test upVote post tutorial -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedCommonPost);
			});
		});

		describe('Change post type by edit post after 2 post upvotes', function () {

			it("Test 2 upVote 2 downVote post expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);
			});

			it("Test 2 upVote 2 downVote post expert -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedTutorial * 2 + DownvotedTutorial * 2);
			});

			it("Test 2 upVote 2 downVote post common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);
			});

			it("Test 2 upVote 2 downVote post common -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedTutorial * 2 + DownvotedTutorial * 2);
			});

			it("Test 2 upVote 2 downVote post tutorial -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial * 2 + DownvotedTutorial * 2);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);
			});

			it("Test 2 upVote 2 downVote post tutorial -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial* 2 + DownvotedTutorial * 2);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);
			});

		});

		describe('Change post type by edit post after 4 cancel post upvote', function () {

			it("Test 4 cancel votes post expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating);
			});

			it("Test 4 cancel votes post expert -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating);
			});

			it("Test cancel votes post common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating);
			});

			it("Test cancel votes post common -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating);
			});

			it("Test cancel votes post tutorial -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating);
			});

			it("Test 4 cancel votes post tutorial -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating);
			});
		});

		describe('Change post type by edit post after upvote reply', function () {		

			it("Test upVote reply expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[2]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[2]).createPost(signers[2].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertReply + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.connect(signers[2]).editPost(signers[2].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedCommonReply + FirstCommonReply + QuickCommonReply);
			});

			it("Test upVote reply common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[2]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[2]).createPost(signers[2].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonReply + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.connect(signers[2]).editPost(signers[2].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertReply + FirstExpertReply + QuickExpertReply);
			});
		});

		describe('Change post type by edit post after downVote reply', function () {		

			it("Test downVote reply expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[2]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[2]).createPost(signers[2].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedExpertReply);

				await peeranhaContent.connect(signers[2]).editPost(signers[2].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DownvotedCommonReply);
			});

			it("Test downVote reply common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[2]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[2]).createPost(signers[2].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedCommonReply);

				await peeranhaContent.connect(signers[2]).editPost(signers[2].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DownvotedExpertReply);
			});
		});

		describe('Change post type by edit post after 2 upVote 2 downVote reply', function () {	

			it("Test 2 upVote 2 downVote reply expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[2]).createPost(signers[2].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertReply * 2 + DownvotedExpertReply * 2 + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.connect(signers[2]).editPost(signers[2].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedCommonReply * 2 + DownvotedCommonReply * 2 + FirstCommonReply + QuickCommonReply);
			});

			it("Test 2 upVote 2 downVote reply common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);
				
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[2]).createPost(signers[2].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonReply * 2 + DownvotedCommonReply * 2 + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.connect(signers[2]).editPost(signers[2].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertReply * 2 + DownvotedExpertReply * 2 + FirstExpertReply + QuickExpertReply);
			});
		});

		describe('Change post type by edit post after 4 cancel vote reply', function () {	

			it("Test 4 cancel vote reply expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[2]).createPost(signers[2].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.connect(signers[2]).editPost(signers[2].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			});

			it("Test 4 cancel vote reply common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[2]).createPost(signers[2].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.connect(signers[2]).editPost(signers[2].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
			});
		});

		describe('Change post type by edit post first/quick reply 0 rating', function () {	

			it("Test first/quick reply expert -> common 0 rating", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				
				const userRating =  await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(newRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			});

			it("Test first/quick reply common -> expert 0 rating", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				
				const userRating =  await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
				const newRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(newRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			});
		});

		describe('Change post type by edit post first/quick/best reply', function () {	

			it("Test best reply expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);
				
				const ratingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const ratingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(ratingReply).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);
				await expect(ratingPost).to.equal(StartRating + AcceptedExpertReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
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

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
				await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);
				
				const ratingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const ratingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(ratingReply).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);
				await expect(ratingPost).to.equal(StartRating + AcceptedCommonReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
				const newRatingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const newRatingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingReply).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);
				await expect(newRatingPost).to.equal(StartRating + AcceptedExpertReply);
			});
		});

		describe('Actions after change post type by edit post by edit post', function () {
		
			describe('upvote after change post type by edit post by edit post', function () {
			
				it("Test upVote post after expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
			
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + UpvotedCommonPost);
				});

				it("Test upVote post after common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + UpvotedExpertPost);
				});
			});

			describe('2 upVote 2 downVote after change post type by edit post', function () {

				it("Test 2 upVote 2 downVote post after expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);
				});
			});

			describe('4 cancel vote after change post type by edit post', function () {

				it("Test cancel vote post after expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating);
				});
			});

			describe('upVote reply after change post type by edit post', function () {

				it("Test upVote reply after expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + UpvotedCommonReply);
				});

				it("Test upVote reply after common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + UpvotedExpertReply);
				});
			});

			describe('downVote reply after change post type by edit post', function () {

				it("Test downVote reply after expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + DownvotedCommonReply);
				});

				it("Test downVote reply after common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + DownvotedExpertReply);
				});
			});

			describe('2 cancel vote for reply after change post type by edit post', function () {

				it("Test 2 upVote 2 downVote reply after expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + UpvotedExpertReply * 2 + DownvotedExpertReply * 2);
				});
			});

			describe('Cancel vote for reply after change post type by edit post', function () {

				it("Test cancel vote reply after expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer, 1);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer, 1);

					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating);
				});
			});

			describe('publish first/quick reply after change post type by edit post', function () {

				it("Test first/quick reply after expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
					await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					const newRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
					await expect(newRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				});

				it("Test first/quick reply after common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
					await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					
					const newRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
					await expect(newRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				});
			});

			describe('mark as best reply after change post type by edit post', function () {

				it("Test best reply expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
					await peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);
					
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

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
					await peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);
					
					const userPost = await peeranhaUser.getUserRating(signers[1].address, 1);
					const userReply = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
					await expect(userReply).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);
					await expect(userPost).to.equal(StartRating + AcceptedExpertReply);
				});
			});

			describe('delete post after change post type by edit post', function () {

				it("Test delete post after change post type by edit post expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
					await peeranhaContent.connect(signers[1]).deletePost(signers[1].address, 1);
					
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + DeleteOwnPost);
				});
				
				it("Test delete reply after change post type by edit post common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
					await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
					await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
					
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + DeleteOwnReply);
				});
			});
		});
	});
});

	// in utils error "ReferenceError: expect is not defined"
	const createCommunities = async (peeranhaCommunity, wallet, countOfCommunities, communitiesIds) => {
		const ipfsHashes = getHashesContainer(countOfCommunities);
		await Promise.all(communitiesIds.map(async(id) => {
			return await peeranhaCommunity.createCommunity(wallet, ipfsHashes[id - 1], createTags(5));
		}));

		expect(await peeranhaCommunity.getCommunitiesCount()).to.equal(countOfCommunities)

		await Promise.all(communitiesIds.map(async(id) => {
			const community = await peeranhaCommunity.getCommunity(id);
			return await expect(community.ipfsDoc.hash).to.equal(ipfsHashes[id - 1]);
		}));
	}

