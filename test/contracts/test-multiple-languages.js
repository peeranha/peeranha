const { disableExperimentalFragmentVariables } = require("@apollo/client");
const { expect } = require("chai");
const { 
	wait, createPeerenhaAndTokenContract, registerTwoUsers, createUserWithAnotherRating, getHashContainer, getHashesContainer, createTags,
	PostTypeEnum, LenguagesEnum, StartRating, StartRatingWithoutAction, deleteTime, DeleteOwnReply, QuickReplyTime,
    DownvoteExpertPost, UpvotedExpertPost, DownvotedExpertPost, DownvoteCommonPost, UpvotedCommonPost, DownvotedCommonPost,
    ModeratorDeletePost, DownvoteExpertReply, UpvotedExpertReply, DownvotedExpertReply, AcceptExpertReply, AcceptedExpertReply, 
    FirstExpertReply, QuickExpertReply, DownvoteCommonReply, UpvotedCommonReply, DownvotedCommonReply, AcceptCommonReply,
    AcceptedCommonReply, FirstCommonReply, QuickCommonReply, ModeratorDeleteReply, ModeratorDeleteComment,
	DownvoteTutorial, UpvotedTutorial, DownvotedTutorial, DeleteOwnPost,
} = require('./utils');

let peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed;
let signers;
let ipfsHashes;
let hashContainer;

// to do different lenguage
// permistions

describe("Test translations", function () {

	beforeEach(async function () {
		const contracts = await createPeerenhaAndTokenContract();
		peeranhaContent = contracts.peeranhaContent;
		peeranhaUser = contracts.peeranhaUser;
		peeranhaCommunity = contracts.peeranhaCommunity;
		token = contracts.token;
		peeranhaNFT = contracts.peeranhaNFT;
		accountDeployed = contracts.accountDeployed;
		signers = await ethers.getSigners();
		ipfsHashes = getHashesContainer(5);
		hashContainer = getHashContainer();
	});

	describe("Test translations for post", function () {

		describe('Test create/edit/delete translation for post', function () {

			it("Test create translation for post", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

				await peeranhaContent.createTranslation(1, 0, 0, LenguagesEnum.English, ipfsHashes[1])
				
				const translation = await peeranhaContent.getTranslation(1, 0, 0, LenguagesEnum.English)
				expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[1]);
				expect(translation.isDeleted).to.equal(false);
			});

			it("Test edit translation for post", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

				await peeranhaContent.createTranslation(1, 0, 0, LenguagesEnum.English, ipfsHashes[1])
				await peeranhaContent.editTranslation(1, 0, 0, LenguagesEnum.English, ipfsHashes[2])

				const translation = await peeranhaContent.getTranslation(1, 0, 0, LenguagesEnum.English)
				expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[2]);
			});

			it("Test delete translation for post", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

				await peeranhaContent.createTranslation(1, 0, 0, LenguagesEnum.English, ipfsHashes[1])
				await peeranhaContent.deleteTranslation(1, 0, 0, LenguagesEnum.English)

				const translation = await peeranhaContent.getTranslation(1, 0, 0, LenguagesEnum.English)
				expect(translation.isDeleted).to.equal(true);
			});

			it("Test create translation for post without post", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await expect(peeranhaContent.createTranslation(1, 0, 0, LenguagesEnum.English, ipfsHashes[1])).to.be.revertedWith('Post_not_exist.');
			});

			it("Test create translation for post, post was deleted", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.deletePost(1);

				await expect(peeranhaContent.createTranslation(1, 0, 0, LenguagesEnum.English, ipfsHashes[1])).to.be.revertedWith('Post_deleted.');
			});

			it("Test create translation for post, community was frozen", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaCommunity.freezeCommunity(1)

				await expect(peeranhaContent.createTranslation(1, 0, 0, LenguagesEnum.English, ipfsHashes[1])).to.be.revertedWith('Community is frozen');
			});
		});

		describe('Test create/edit/delete translation for reply', function () {

			it("Test create translation for reply", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createReply(1, 0, hashContainer[1], false);

				await peeranhaContent.createTranslation(1, 1, 0, LenguagesEnum.English, ipfsHashes[1])
				
				const translation = await peeranhaContent.getTranslation(1, 1, 0, LenguagesEnum.English)
				expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[1]);
				expect(translation.isDeleted).to.equal(false);
			});

			it("Test edit translation for reply", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createReply(1, 0, hashContainer[1], false);

				await peeranhaContent.createTranslation(1, 1, 0, LenguagesEnum.English, ipfsHashes[1])
				await peeranhaContent.editTranslation(1, 1, 0, LenguagesEnum.English, ipfsHashes[2])

				const translation = await peeranhaContent.getTranslation(1, 1, 0, LenguagesEnum.English)
				expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[2]);
			});

			it("Test delete translation for reply", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createReply(1, 0, hashContainer[1], false);

				await peeranhaContent.createTranslation(1, 1, 0, LenguagesEnum.English, ipfsHashes[1])
				await peeranhaContent.deleteTranslation(1, 1, 0, LenguagesEnum.English)

				const translation = await peeranhaContent.getTranslation(1, 1, 0, LenguagesEnum.English)
				expect(translation.isDeleted).to.equal(true);
			});

			it("Test create translation for reply without post", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await expect(peeranhaContent.createTranslation(1, 1, 0, LenguagesEnum.English, ipfsHashes[1])).to.be.revertedWith('Post_not_exist.');
			});

			it("Test create translation for reply without reply", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

				await expect(peeranhaContent.createTranslation(1, 1, 0, LenguagesEnum.English, ipfsHashes[1])).to.be.revertedWith('Reply_not_exist.');
			});

			it("Test create translation for reply, post was deleted", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createReply(1, 0, hashContainer[1], false);
				await peeranhaContent.deletePost(1);

				await expect(peeranhaContent.createTranslation(1, 1, 0, LenguagesEnum.English, ipfsHashes[1])).to.be.revertedWith('Post_deleted.');
			});

			it("Test create translation for reply, reply was deleted", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createReply(1, 0, hashContainer[1], false);
				await peeranhaContent.deleteReply(1, 1);

				await expect(peeranhaContent.createTranslation(1, 1, 0, LenguagesEnum.English, ipfsHashes[1])).to.be.revertedWith('Reply_deleted.');
			});

			it("Test create translation for reply, community was frozen", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createReply(1, 0, hashContainer[1], false);
				await peeranhaCommunity.freezeCommunity(1)

				await expect(peeranhaContent.createTranslation(1, 0, 0, LenguagesEnum.English, ipfsHashes[1])).to.be.revertedWith('Community is frozen');
			});
		});

		describe('Test create/edit/delete translation for comment', function () {

			it("Test create translation for comment to post", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createComment(1, 0, hashContainer[1]);

				await peeranhaContent.createTranslation(1, 0, 1, LenguagesEnum.English, ipfsHashes[1])
				
				const translation = await peeranhaContent.getTranslation(1, 0, 1, LenguagesEnum.English)
				expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[1]);
				expect(translation.isDeleted).to.equal(false);
			});

			it("Test create translation for comment to reply", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createReply(1, 0, hashContainer[1], false);
				await peeranhaContent.createComment(1, 1, hashContainer[1]);

				await peeranhaContent.createTranslation(1, 1, 1, LenguagesEnum.English, ipfsHashes[1])
				
				const translation = await peeranhaContent.getTranslation(1, 1, 1, LenguagesEnum.English)
				expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[1]);
				expect(translation.isDeleted).to.equal(false);
			});

			it("Test edit translation for comment to post", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createComment(1, 0, hashContainer[1]);

				await peeranhaContent.createTranslation(1, 0, 1, LenguagesEnum.English, ipfsHashes[1])
				await peeranhaContent.editTranslation(1, 0, 1, LenguagesEnum.English, ipfsHashes[2])

				const translation = await peeranhaContent.getTranslation(1, 0, 1, LenguagesEnum.English)
				expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[2]);
			});

			it("Test edit translation for comment to reply", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createReply(1, 0, hashContainer[1], false);
				await peeranhaContent.createComment(1, 1, hashContainer[1]);

				await peeranhaContent.createTranslation(1, 1, 1, LenguagesEnum.English, ipfsHashes[1])
				await peeranhaContent.editTranslation(1, 1, 1, LenguagesEnum.English, ipfsHashes[2])

				const translation = await peeranhaContent.getTranslation(1, 1, 1, LenguagesEnum.English)
				expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[2]);
			});

			it("Test delete translation for comment to post", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createComment(1, 0, hashContainer[1]);

				await peeranhaContent.createTranslation(1, 0, 1, LenguagesEnum.English, ipfsHashes[1])
				await peeranhaContent.deleteTranslation(1, 0, 1, LenguagesEnum.English)

				const translation = await peeranhaContent.getTranslation(1, 0, 1, LenguagesEnum.English)
				expect(translation.isDeleted).to.equal(true);
			});

			it("Test delete translation for comment to reply", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createReply(1, 0, hashContainer[1], false);
				await peeranhaContent.createComment(1, 1, hashContainer[1]);

				await peeranhaContent.createTranslation(1, 1, 1, LenguagesEnum.English, ipfsHashes[1])
				await peeranhaContent.deleteTranslation(1, 1, 1, LenguagesEnum.English)

				const translation = await peeranhaContent.getTranslation(1, 1, 1, LenguagesEnum.English)
				expect(translation.isDeleted).to.equal(true);
			});

			it("Test create translation for comment to post without post", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

				await expect(peeranhaContent.createTranslation(1, 0, 1, LenguagesEnum.English, ipfsHashes[1])).to.be.revertedWith('Post_not_exist.');
			});

			it("Test create translation for comment to reply without reply", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

				await expect(peeranhaContent.createTranslation(1, 1, 1, LenguagesEnum.English, ipfsHashes[1])).to.be.revertedWith('Reply_not_exist.');
			});

			it("Test create translation for comment to post without comment", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

				await expect(peeranhaContent.createTranslation(1, 0, 1, LenguagesEnum.English, ipfsHashes[1])).to.be.revertedWith('Comment_not_exist.');
			});

			it("Test create translation for comment to reply without comment", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createReply(1, 0, hashContainer[1], false);

				await expect(peeranhaContent.createTranslation(1, 1, 1, LenguagesEnum.English, ipfsHashes[1])).to.be.revertedWith('Comment_not_exist.');
			});

			it("Test create translation for comment to post, post was deleted", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createComment(1, 0, hashContainer[1]);
				await peeranhaContent.deletePost(1);

				await expect(peeranhaContent.createTranslation(1, 0, 1, LenguagesEnum.English, ipfsHashes[1])).to.be.revertedWith('Post_deleted.');
			});

			it("Test create translation for comment to reply, post was deleted", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createReply(1, 0, hashContainer[1], false);
				await peeranhaContent.createComment(1, 1, hashContainer[1]);
				await peeranhaContent.deletePost(1);

				await expect(peeranhaContent.createTranslation(1, 1, 1, LenguagesEnum.English, ipfsHashes[1])).to.be.revertedWith('Post_deleted.');
			});

			it("Test create translation for comment to post, comment was deleted", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createComment(1, 0, hashContainer[1]);
				await peeranhaContent.deleteComment(1, 0, 1);

				await expect(peeranhaContent.createTranslation(1, 0, 1, LenguagesEnum.English, ipfsHashes[1])).to.be.revertedWith('Comment_deleted.');
			});

			it("Test create translation for comment to post, comment was deleted", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createReply(1, 0, hashContainer[1], false);
				await peeranhaContent.createComment(1, 1, hashContainer[1]);
				await peeranhaContent.deleteComment(1, 1, 1);

				await expect(peeranhaContent.createTranslation(1, 1, 1, LenguagesEnum.English, ipfsHashes[1])).to.be.revertedWith('Comment_deleted.');
			});

			it("Test create translation for comment to post, community was frozen", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createComment(1, 0, hashContainer[1]);
				await peeranhaCommunity.freezeCommunity(1)

				await expect(peeranhaContent.createTranslation(1, 0, 1, LenguagesEnum.English, ipfsHashes[1])).to.be.revertedWith('Community is frozen');
			});

			it("Test create translation for comment to reply, community was frozen", async function () {
				await peeranhaUser.createUser(hashContainer[1]);
				await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.createReply(1, 0, hashContainer[1], false);
				await peeranhaContent.createComment(1, 1, hashContainer[1]);
				await peeranhaCommunity.freezeCommunity(1)

				await expect(peeranhaContent.createTranslation(1, 1, 1, LenguagesEnum.English, ipfsHashes[1])).to.be.revertedWith('Community is frozen');
			});
		});
	});
});
