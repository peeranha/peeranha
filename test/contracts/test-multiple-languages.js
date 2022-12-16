const { disableExperimentalFragmentVariables } = require("@apollo/client");
const { expect } = require("chai");
const { 
	wait, createPeerenhaAndTokenContract, registerTwoUsers, createUserWithAnotherRating, getHashContainer, getHashTranslation, getTranslationValues, getHashesContainer, createTags,
	PostTypeEnum, LanguagesEnum, StartRating, StartRatingWithoutAction, deleteTime, DeleteOwnReply, QuickReplyTime,
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
// Error_its_original_language
// Error_array + Invalid_ipfsHash create/edit
// delete edit only one lenguage/ create + create for one post  (Test array translations for post)?
// permistions (validateTranslationParams) UserLib.ActionRole.CommunityAdmin

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

	describe("Test translation for post", function () {

		describe('Test create/edit/delete translation for post', function () {

			it("Test create translation for post", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);

				await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[1]])
				
				const translation = await peeranhaContent.getTranslation(1, 0, 0, LanguagesEnum.English)
				expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[1]);
				expect(translation.isDeleted).to.equal(false);
			});

			it("Test edit translation for post", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);

				await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[1]])
				await peeranhaContent.editTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[2]])

				const translation = await peeranhaContent.getTranslation(1, 0, 0, LanguagesEnum.English)
				expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[2]);
			});

			it("Test delete translation for post", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);

				await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[1]])

				await peeranhaContent.deleteTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English])

				const translation = await peeranhaContent.getTranslation(1, 0, 0, LanguagesEnum.English)
				expect(translation.isDeleted).to.equal(true);
			});

			it("Test create translation for post without post", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[1]]))
				 	.to.be.revertedWith('Post_not_exist.');
			});

			it("Test create translation for post, post was deleted", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.deletePost(signers[0].address, 1);

				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[1]]))
					.to.be.revertedWith('Post_deleted.');
			});

			it("Test create translation for post, community was frozen", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaCommunity.freezeCommunity(signers[0].address, 1)

				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[1]]))
					.to.be.revertedWith('Community is frozen');
			});
		});

		describe('Test create/edit/delete translation for reply', function () {

			it("Test create translation for reply", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);

				await peeranhaContent.createTranslations(signers[0].address, 1, 1, 0, [LanguagesEnum.English], [ipfsHashes[1]])
				
				const translation = await peeranhaContent.getTranslation(1, 1, 0, LanguagesEnum.English)
				expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[1]);
				expect(translation.isDeleted).to.equal(false);
			});

			it("Test edit translation for reply", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);

				await peeranhaContent.createTranslations(signers[0].address, 1, 1, 0, [LanguagesEnum.English], [ipfsHashes[1]])
				await peeranhaContent.editTranslations(signers[0].address, 1, 1, 0, [LanguagesEnum.English], [ipfsHashes[2]])

				const translation = await peeranhaContent.getTranslation(1, 1, 0, LanguagesEnum.English)
				expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[2]);
			});

			it("Test delete translation for reply", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);

				await peeranhaContent.createTranslations(signers[0].address, 1, 1, 0, [LanguagesEnum.English], [ipfsHashes[1]])
				await peeranhaContent.deleteTranslations(signers[0].address, 1, 1, 0, [LanguagesEnum.English])

				const translation = await peeranhaContent.getTranslation(1, 1, 0, LanguagesEnum.English)
				expect(translation.isDeleted).to.equal(true);
			});

			it("Test create translation for reply without post", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 1, 0, [LanguagesEnum.English], [ipfsHashes[1]]))
					.to.be.revertedWith('Post_not_exist.');
			});

			it("Test create translation for reply without reply", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);

				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 1, 0, [LanguagesEnum.English], [ipfsHashes[1]]))
				 	.to.be.revertedWith('Reply_not_exist.');
			});

			it("Test create translation for reply, post was deleted", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
				await peeranhaContent.deletePost(signers[0].address, 1);

				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 1, 0, [LanguagesEnum.English], [ipfsHashes[1]]))
					.to.be.revertedWith('Post_deleted.');
			});

			it("Test create translation for reply, reply was deleted", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
				await peeranhaContent.deleteReply(signers[0].address, 1, 1);

				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 1, 0, [LanguagesEnum.English], [ipfsHashes[1]]))
					.to.be.revertedWith('Reply_deleted.');
			});

			it("Test create translation for reply, community was frozen", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
				await peeranhaCommunity.freezeCommunity(signers[0].address, 1)

				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[1]]))
					.to.be.revertedWith('Community is frozen');
			});
		});

		describe('Test create/edit/delete translation for comment', function () {

			it("Test create translation for comment to post", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.Spanish);

				await peeranhaContent.createTranslations(signers[0].address, 1, 0, 1, [LanguagesEnum.English], [ipfsHashes[1]])

				const translation = await peeranhaContent.getTranslation(1, 0, 1, LanguagesEnum.English)
				expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[1]);
				expect(translation.isDeleted).to.equal(false);
			});

			it("Test create translation for comment to reply", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
				await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.Spanish);

				await peeranhaContent.createTranslations(signers[0].address, 1, 1, 1, [LanguagesEnum.English], [ipfsHashes[1]])

				const translation = await peeranhaContent.getTranslation(1, 1, 1, LanguagesEnum.English)
				expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[1]);
				expect(translation.isDeleted).to.equal(false);
			});

			it("Test edit translation for comment to post", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.Spanish);

				await peeranhaContent.createTranslations(signers[0].address, 1, 0, 1, [LanguagesEnum.English], [ipfsHashes[1]])
				await peeranhaContent.editTranslations(signers[0].address, 1, 0, 1, [LanguagesEnum.English], [ipfsHashes[2]])

				const translation = await peeranhaContent.getTranslation(1, 0, 1, LanguagesEnum.English)
				expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[2]);
			});

			it("Test edit translation for comment to reply", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
				await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.Spanish);

				await peeranhaContent.createTranslations(signers[0].address, 1, 1, 1, [LanguagesEnum.English], [ipfsHashes[1]])
				await peeranhaContent.editTranslations(signers[0].address, 1, 1, 1, [LanguagesEnum.English], [ipfsHashes[2]])

				const translation = await peeranhaContent.getTranslation(1, 1, 1, LanguagesEnum.English)
				expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[2]);
			});

			it("Test delete translation for comment to post", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.Spanish);

				await peeranhaContent.createTranslations(signers[0].address, 1, 0, 1, [LanguagesEnum.English], [ipfsHashes[1]])
				await peeranhaContent.deleteTranslations(signers[0].address, 1, 0, 1, [LanguagesEnum.English])

				const translation = await peeranhaContent.getTranslation(1, 0, 1, LanguagesEnum.English)
				expect(translation.isDeleted).to.equal(true);
			});

			it("Test delete translation for comment to reply", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
				await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.Spanish);

				await peeranhaContent.createTranslations(signers[0].address, 1, 1, 1, [LanguagesEnum.English], [ipfsHashes[1]])
				await peeranhaContent.deleteTranslations(signers[0].address, 1, 1, 1, [LanguagesEnum.English])

				const translation = await peeranhaContent.getTranslation(1, 1, 1, LanguagesEnum.English)
				expect(translation.isDeleted).to.equal(true);
			});

			it("Test create translation for comment to post without post", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 0, 1, [LanguagesEnum.English], [ipfsHashes[1]]))
				.to.be.revertedWith('Post_not_exist.');
			});

			it("Test create translation for comment to reply without reply", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);

				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 1, 1, [LanguagesEnum.English], [ipfsHashes[1]]))
					.to.be.revertedWith('Reply_not_exist.');
			});

			it("Test create translation for comment to post without comment", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);

				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 0, 1, [LanguagesEnum.English], [ipfsHashes[1]]))
					.to.be.revertedWith('Comment_not_exist.');
			});

			it("Test create translation for comment to reply without comment", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);

				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 1, 1, [LanguagesEnum.English], [ipfsHashes[1]]))
					.to.be.revertedWith('Comment_not_exist.');
			});

			it("Test create translation for comment to post, post was deleted", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.Spanish);
				await peeranhaContent.deletePost(signers[0].address, 1);

				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 0, 1, [LanguagesEnum.English], [ipfsHashes[1]]))
					.to.be.revertedWith('Post_deleted.');
			});

			it("Test create translation for comment to reply, post was deleted", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
				await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.Spanish);
				await peeranhaContent.deletePost(signers[0].address, 1);

				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 1, 1, [LanguagesEnum.English], [ipfsHashes[1]]))
					.to.be.revertedWith('Post_deleted.');
			});

			it("Test create translation for comment to post, comment was deleted", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.Spanish);
				await peeranhaContent.deleteComment(signers[0].address, 1, 0, 1);

				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 0, 1, [LanguagesEnum.English], [ipfsHashes[1]]))
					.to.be.revertedWith('Comment_deleted.');
			});

			it("Test create translation for comment to post, comment was deleted", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
				await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.Spanish);
				await peeranhaContent.deleteComment(signers[0].address, 1, 1, 1);

				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 1, 1, [LanguagesEnum.English], [ipfsHashes[1]]))
					.to.be.revertedWith('Comment_deleted.');
			});

			it("Test create translation for comment to post, community was frozen", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.Spanish);
				await peeranhaCommunity.freezeCommunity(signers[0].address, 1)

				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 0, 1, [LanguagesEnum.English], [ipfsHashes[1]]))
					.to.be.revertedWith('Community is frozen');
			});

			it("Test create translation for comment to reply, community was frozen", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
				await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.Spanish);
				await peeranhaCommunity.freezeCommunity(signers[0].address, 1)

				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 1, 1, [LanguagesEnum.English], [ipfsHashes[1]]))
					.to.be.revertedWith('Community is frozen');
			});
		});
	});

	describe("Test array translations for post", function () {

		it("Test create 1 translation post", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);

			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[1]])
			
			const translation = await peeranhaContent.getTranslation(1, 0, 0, LanguagesEnum.English)
			expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[1]);
			expect(translation.isDeleted).to.equal(false);
		});

		it("Test create 2 translations for post", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);

			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English, LanguagesEnum.Chinese], [ipfsHashes[1], ipfsHashes[2]])
			
			const translationList = await peeranhaContent.getTranslations(1, 0, 0)
			expect(translationList[0].ipfsDoc.hash).to.equal(ipfsHashes[1]);
			expect(translationList[0].isDeleted).to.equal(false);

			expect(translationList[1].ipfsDoc.hash).to.equal(ipfsHashes[2]);
			expect(translationList[1].isDeleted).to.equal(false);

			expect(translationList[2].ipfsDoc.hash).to.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
			expect(translationList[2].isDeleted).to.equal(false);
		});

		xit("Test create all translations for post", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
			const hashTranslation = getHashTranslation();
			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, getTranslationValues(), hashTranslation); // Error_its_original_language
			
			const translationList = await peeranhaContent.getTranslations(1, 0, 0);
			translationList.map((translation, index) => {
				expect(translation.ipfsDoc.hash).to.equal(hashTranslation[index]);
				expect(translation.isDeleted).to.equal(false);
			})
		});

		it("Test edit 2 translations for post", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);

			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English, LanguagesEnum.Chinese], [ipfsHashes[1], ipfsHashes[2]])
			await peeranhaContent.editTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English, LanguagesEnum.Chinese], [ipfsHashes[3], ipfsHashes[4]])
			
			const translationList = await peeranhaContent.getTranslations(1, 0, 0)
			
			expect(translationList[0].ipfsDoc.hash).to.equal(ipfsHashes[3]);
			expect(translationList[0].isDeleted).to.equal(false);

			expect(translationList[1].ipfsDoc.hash).to.equal(ipfsHashes[4]);
			expect(translationList[1].isDeleted).to.equal(false);

			expect(translationList[2].ipfsDoc.hash).to.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
			expect(translationList[2].isDeleted).to.equal(false);
		});

		it("Test delete 2 translations for post", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);

			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English, LanguagesEnum.Chinese], [ipfsHashes[1], ipfsHashes[2]])
			await peeranhaContent.deleteTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English, LanguagesEnum.Chinese])
			
			const translationList = await peeranhaContent.getTranslations(1, 0, 0)

			expect(translationList[0].isDeleted).to.equal(true);
			expect(translationList[1].isDeleted).to.equal(true);
			expect(translationList[2].isDeleted).to.equal(false);
		});
	});
});
