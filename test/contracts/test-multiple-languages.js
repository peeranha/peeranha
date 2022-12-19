const { disableExperimentalFragmentVariables } = require("@apollo/client");
const { expect } = require("chai");
const { 
	wait, createPeerenhaAndTokenContract, registerTwoUsers, createUserWithAnotherRating, getHashContainer, getHashTranslation, getTranslationValues, getHashesContainer, createTags, getInt,
	PostTypeEnum, LanguagesEnum, StartRating, StartRatingWithoutAction, deleteTime, DeleteOwnReply, QuickReplyTime, EmptyIpfs,
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

// permistions
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

	describe("Test item language ", function () {

		describe("Test post language", function () {

			it("Test create post", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				
				const itemLanguage = await peeranhaContent.getItemLanguage(1, 0, 0);
				expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.Spanish);
			});

			it("Test edit post language", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
				
				const itemLanguage = await peeranhaContent.getItemLanguage(1, 0, 0);
				expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.English);
			});

			it("Test double edit post language", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.connect(signers[0]).editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
				
				const itemLanguage = await peeranhaContent.getItemLanguage(1, 0, 0);
				expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.English);
			});
		});

		describe("Test reply language", function () {

			it("Test create reply", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);

				const itemLanguage = await peeranhaContent.getItemLanguage(1, 1, 0);
				expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.Spanish);
			});

			it("Test edit reply language", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
				await peeranhaContent.editReply(signers[0].address, 1, 1, hashContainer[1], false, LanguagesEnum.English);

				const itemLanguage = await peeranhaContent.getItemLanguage(1, 1, 0);
				expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.English);
			});

			it("Test double edit reply language", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
				await peeranhaContent.editReply(signers[0].address, 1, 1, hashContainer[1], false, LanguagesEnum.English);
				await peeranhaContent.editReply(signers[0].address, 1, 1, hashContainer[1], false, LanguagesEnum.English);

				const itemLanguage = await peeranhaContent.getItemLanguage(1, 1, 0);
				expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.English);
			});
		});

		describe("Test comment language", function () {

			it("Test create comment to post", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.Spanish);

				const itemLanguage = await peeranhaContent.getItemLanguage(1, 0, 1);
				expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.Spanish);
			});

			it("Test create comment to reply", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
				await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.Spanish);

				const itemLanguage = await peeranhaContent.getItemLanguage(1, 1, 1);
				expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.Spanish);
			});

			it("Test edit language comment to post", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.Spanish);
				await peeranhaContent.editComment(signers[0].address, 1, 0, 1, hashContainer[2], LanguagesEnum.English);

				const itemLanguage = await peeranhaContent.getItemLanguage(1, 0, 1);
				expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.English);
			});

			it("Test eidt language comment to reply", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
				await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.Spanish);
				await peeranhaContent.editComment(signers[0].address, 1, 1, 1, hashContainer[2], LanguagesEnum.English);
				await peeranhaContent.editComment(signers[0].address, 1, 1, 1, hashContainer[2], LanguagesEnum.English);

				const itemLanguage = await peeranhaContent.getItemLanguage(1, 1, 1);
				expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.English);
			});
		});
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
				
				const itemLanguage = await peeranhaContent.getItemLanguage(1, 0, 0);
				expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.Spanish);
			});

			it("Test create double translation for post", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);

				await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[1]])
				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[2]]))
					.to.be.revertedWith('Translation_already_exist.');
			});

			it("Test create double translation for post (in one transaction)", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);

				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English, LanguagesEnum.English], [ipfsHashes[1], ipfsHashes[2]]))
					.to.be.revertedWith('Translation_already_exist.');
			});

			it("Test edit translation for post", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);

				await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[1]])
				await peeranhaContent.editTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[2]])

				const translation = await peeranhaContent.getTranslation(1, 0, 0, LanguagesEnum.English)
				expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[2]);

				const itemLanguage = await peeranhaContent.getItemLanguage(1, 0, 0);
				expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.Spanish);
			});

			it("Test delete translation for post", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);

				await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[1]])
				await peeranhaContent.deleteTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English])

				const translation = await peeranhaContent.getTranslation(1, 0, 0, LanguagesEnum.English)
				expect(translation.isDeleted).to.equal(true);

				const itemLanguage = await peeranhaContent.getItemLanguage(1, 0, 0);
				expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.Spanish);
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

				const itemLanguage = await peeranhaContent.getItemLanguage(1, 1, 0);
				expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.Spanish);
			});

			it("Test create double translation for reply", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);

				await peeranhaContent.createTranslations(signers[0].address, 1, 1, 0, [LanguagesEnum.English], [ipfsHashes[1]])
				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 1, 0, [LanguagesEnum.English], [ipfsHashes[2]]))
					.to.be.revertedWith('Translation_already_exist.');
			});

			it("Test create double translation for reply", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);

				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 1, 0, [LanguagesEnum.English, LanguagesEnum.English], [ipfsHashes[2], ipfsHashes[1]]))
					.to.be.revertedWith('Translation_already_exist.');
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

				const itemLanguage = await peeranhaContent.getItemLanguage(1, 1, 0);
				expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.Spanish);
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

				const itemLanguage = await peeranhaContent.getItemLanguage(1, 1, 0);
				expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.Spanish);
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

				const itemLanguage = await peeranhaContent.getItemLanguage(1, 0, 1);
				expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.Spanish);
			});

			it("Test create double translation for comment to post", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.Spanish);

				await peeranhaContent.createTranslations(signers[0].address, 1, 0, 1, [LanguagesEnum.English], [ipfsHashes[1]])
				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 0, 1, [LanguagesEnum.English], [ipfsHashes[2]]))
					.to.be.revertedWith('Translation_already_exist.');
			});

			it("Test create double translation for comment to post", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.Spanish);

				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 0, 1, [LanguagesEnum.English, LanguagesEnum.English], [ipfsHashes[2], ipfsHashes[1]]))
					.to.be.revertedWith('Translation_already_exist.');
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

				const itemLanguage = await peeranhaContent.getItemLanguage(1, 1, 1);
				expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.Spanish);
			});

			it("Test create double translation for comment to reply", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
				await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.Spanish);

				await peeranhaContent.createTranslations(signers[0].address, 1, 1, 1, [LanguagesEnum.English], [ipfsHashes[1]])
				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 1, 1, [LanguagesEnum.English], [ipfsHashes[1]]))
					.to.be.revertedWith('Translation_already_exist.');
			});

			it("Test create double translation for comment to reply", async function () {
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
				await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
				await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.Spanish);

				await expect(peeranhaContent.createTranslations(signers[0].address, 1, 1, 1, [LanguagesEnum.English, LanguagesEnum.English], [ipfsHashes[1], ipfsHashes[2]]))
					.to.be.revertedWith('Translation_already_exist.');
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

				const itemLanguage = await peeranhaContent.getItemLanguage(1, 0, 1);
				expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.Spanish);
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

				const itemLanguage = await peeranhaContent.getItemLanguage(1, 1, 1);
				expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.Spanish);
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

				const itemLanguage = await peeranhaContent.getItemLanguage(1, 0, 1);
				expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.Spanish);
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

				const itemLanguage = await peeranhaContent.getItemLanguage(1, 1, 1);
				expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.Spanish);
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

			expect(translationList[2].ipfsDoc.hash).to.equal(EmptyIpfs);
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

			expect(translationList[2].ipfsDoc.hash).to.equal(EmptyIpfs);
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

	describe("Test require Error_its_original_language", function () {

		it("Test create translation for post the same language", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await expect(peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[1]]))
				.to.be.revertedWith('Error_its_original_language');
		});

		it("Test create translation for post the same language (couple language)", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await expect(peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish, LanguagesEnum.English], [ipfsHashes[1], ipfsHashes[2]]))
				.to.be.revertedWith('Error_its_original_language');
		});

		it("Test create translation for reply the same language", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Vietnamese);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
			await expect(peeranhaContent.createTranslations(signers[0].address, 1, 1, 0, [LanguagesEnum.Spanish], [ipfsHashes[1]]))
				.to.be.revertedWith('Error_its_original_language');
		});

		it("Test create translation for reply the same language (couple language)", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Vietnamese);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
			await expect(peeranhaContent.createTranslations(signers[0].address, 1, 1, 0, [LanguagesEnum.Spanish, LanguagesEnum.English], [ipfsHashes[1], ipfsHashes[2]]))
				.to.be.revertedWith('Error_its_original_language');
		});

		it("Test create translation for comment to post the same language", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.Vietnamese);
			await expect(peeranhaContent.createTranslations(signers[0].address, 1, 0, 1, [LanguagesEnum.Vietnamese], [ipfsHashes[1]]))
				.to.be.revertedWith('Error_its_original_language');
		});

		it("Test create translation for comment to post the same language (couple language)", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.Vietnamese);
			await expect(peeranhaContent.createTranslations(signers[0].address, 1, 0, 1, [LanguagesEnum.English, LanguagesEnum.Vietnamese], [ipfsHashes[1], ipfsHashes[2]]))
				.to.be.revertedWith('Error_its_original_language');
		});

		it("Test create translation for comment to reply the same language", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
			await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.Spanish);
			await expect(peeranhaContent.createTranslations(signers[0].address, 1, 1, 1, [LanguagesEnum.Spanish], [ipfsHashes[1]]))
				.to.be.revertedWith('Error_its_original_language');
		});

		it("Test create translation for comment to reply the same language (couple language)", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
			await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.Spanish);
			await expect(peeranhaContent.createTranslations(signers[0].address, 1, 1, 1, [LanguagesEnum.Spanish, LanguagesEnum.English], [ipfsHashes[1], ipfsHashes[2]]))
				.to.be.revertedWith('Error_its_original_language');
		});
	});

	describe("Test require Error_array", function () {

		it("Test create empty translations", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await expect(peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [], []))
				.to.be.revertedWith('Error_array');
		});

		it("Test create translations different value for ipfs and count of language", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await expect(peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish], [ipfsHashes[1], ipfsHashes[2]]))
				.to.be.revertedWith('Error_array');
		});

		it("Test edit empty translations", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish, LanguagesEnum.Vietnamese], [ipfsHashes[1], ipfsHashes[2]]);
			await expect(peeranhaContent.editTranslations(signers[0].address, 1, 0, 0, [], []))
				.to.be.revertedWith('Error_array');
		});

		it("Test edit translations different value for ipfs and count of language", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish, LanguagesEnum.Vietnamese], [ipfsHashes[1], ipfsHashes[2]]);
			await expect(peeranhaContent.editTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish, LanguagesEnum.Vietnamese], [ipfsHashes[1]]))
				.to.be.revertedWith('Error_array');
		});

		it("Test delete empty translations", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish, LanguagesEnum.Vietnamese], [ipfsHashes[1], ipfsHashes[2]]);
			await expect(peeranhaContent.deleteTranslations(signers[0].address, 1, 0, 0, []))
				.to.be.revertedWith('Error_array');
		});
	});

	describe("Test require Invalid_ipfsHash", function () {

		it("Test create translations with empty ipfs", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await expect(peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish], [EmptyIpfs]))
				.to.be.revertedWith('Invalid_ipfsHash');
		});

		it("Test edit translations with empty ipfs", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish, LanguagesEnum.Vietnamese], [ipfsHashes[1], ipfsHashes[2]]);
			await expect(peeranhaContent.editTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish], [EmptyIpfs]))
				.to.be.revertedWith('Invalid_ipfsHash');
		});
	});

	describe("Test require Translation_not_exist", function () {

		it("Test edit translation (translation not exist)", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await expect(peeranhaContent.editTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish], [ipfsHashes[1]]))
				.to.be.revertedWith('Translation_not_exist.');
		});

		it("Test edit 2 translations one of them not exist", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish], [ipfsHashes[1]]);
			await expect(peeranhaContent.editTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish, LanguagesEnum.Vietnamese], [ipfsHashes[1], ipfsHashes[2]]))
				.to.be.revertedWith('Translation_not_exist.');
		});

		it("Test delete translation (translation not exist)", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await expect(peeranhaContent.deleteTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish]))
				.to.be.revertedWith('Translation_not_exist.');
		});

		it("Test edit 2 translations one of them not exist", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish], [ipfsHashes[1]]);
			await expect(peeranhaContent.deleteTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish, LanguagesEnum.Vietnamese]))
				.to.be.revertedWith('Translation_not_exist.');
		});
	});

	describe("Test require Translation_deleted.", function () {

		it("Test edit translation (translation has been deleted)", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish], [ipfsHashes[1]]);
			await peeranhaContent.deleteTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish]);

			await expect(peeranhaContent.editTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish], [ipfsHashes[2]]))
				.to.be.revertedWith('Translation_deleted.');
		});

		it("Test edit 2 translations one of them has been deleted", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish, LanguagesEnum.Chinese], [ipfsHashes[1], ipfsHashes[2]]);
			await peeranhaContent.deleteTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish]);

			await expect(peeranhaContent.editTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish, LanguagesEnum.Chinese], [ipfsHashes[1], ipfsHashes[2]]))
				.to.be.revertedWith('Translation_deleted.');
		});

		it("Test delete translation (translation has been deleted)", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish], [ipfsHashes[1]]);
			await peeranhaContent.deleteTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish]);

			await expect(peeranhaContent.deleteTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish]))
				.to.be.revertedWith('Translation_deleted.');
		});

		it("Test edit 2 translations one of them has been deleted", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish, LanguagesEnum.Chinese], [ipfsHashes[1], ipfsHashes[2]]);
			await peeranhaContent.deleteTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish]);

			await expect(peeranhaContent.deleteTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish, LanguagesEnum.Chinese]))
				.to.be.revertedWith('Translation_deleted.');
		});
	});

	describe("Test edit item language to exist translation", function () {

		it("Test edit post language to exist translation", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);

			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[2]]);
			await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
	
			const itemLanguage = await peeranhaContent.getItemLanguage(1, 0, 0);
			expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.English);
		});

		it("Test edit reply language to exist translation", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
			
			await peeranhaContent.createTranslations(signers[0].address, 1, 1, 0, [LanguagesEnum.English], [ipfsHashes[2]]);
			await peeranhaContent.editReply(signers[0].address, 1, 1, hashContainer[1], false, LanguagesEnum.English);

			const itemLanguage = await peeranhaContent.getItemLanguage(1, 1, 0);
			expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.English);
		});

		it("Test edit comment to post language to exist translation", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.Spanish);
			
			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 1, [LanguagesEnum.English], [ipfsHashes[2]]);
			await peeranhaContent.editComment(signers[0].address, 1, 0, 1, hashContainer[2], LanguagesEnum.English);

			const itemLanguage = await peeranhaContent.getItemLanguage(1, 0, 1);
			expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.English);
		});

		it("Test edit comment to reply language to exist translation", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
			await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.Spanish);
			
			await peeranhaContent.createTranslations(signers[0].address, 1, 1, 1, [LanguagesEnum.English], [ipfsHashes[2]]);
			await peeranhaContent.editComment(signers[0].address, 1, 1, 1, hashContainer[2], LanguagesEnum.English);

			const itemLanguage = await peeranhaContent.getItemLanguage(1, 1, 1);
			expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.English);
		});
	});

	describe("Test edit item language to exist translation -> edit translation", function () {

		it("Test edit post language to exist translation", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);

			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[2]]);
			await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
			await peeranhaContent.editTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[1]]);

			const translation = await peeranhaContent.getTranslation(1, 0, 0, LanguagesEnum.English)
			expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[1]);
			expect(translation.isDeleted).to.equal(false);
		});

		it("Test edit reply language to exist translation", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
			
			await peeranhaContent.createTranslations(signers[0].address, 1, 1, 0, [LanguagesEnum.English], [ipfsHashes[2]]);
			await peeranhaContent.editReply(signers[0].address, 1, 1, hashContainer[1], false, LanguagesEnum.English);
			await peeranhaContent.editTranslations(signers[0].address, 1, 1, 0, [LanguagesEnum.English], [ipfsHashes[1]]);

			const translation = await peeranhaContent.getTranslation(1, 1, 0, LanguagesEnum.English)
			expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[1]);
			expect(translation.isDeleted).to.equal(false);
		});

		it("Test edit comment to post language to exist translation", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.Spanish);
			
			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 1, [LanguagesEnum.English], [ipfsHashes[2]]);
			await peeranhaContent.editComment(signers[0].address, 1, 0, 1, hashContainer[2], LanguagesEnum.English);
			await peeranhaContent.editTranslations(signers[0].address, 1, 0, 1, [LanguagesEnum.English], [ipfsHashes[1]]);

			const translation = await peeranhaContent.getTranslation(1, 0, 1, LanguagesEnum.English)
			expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[1]);
			expect(translation.isDeleted).to.equal(false);
		});

		it("Test edit comment to reply language to exist translation", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
			await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.Spanish);
			
			await peeranhaContent.createTranslations(signers[0].address, 1, 1, 1, [LanguagesEnum.English], [ipfsHashes[2]]);
			await peeranhaContent.editComment(signers[0].address, 1, 1, 1, hashContainer[2], LanguagesEnum.English);
			await peeranhaContent.editTranslations(signers[0].address, 1, 1, 1, [LanguagesEnum.English], [ipfsHashes[1]]);

			const translation = await peeranhaContent.getTranslation(1, 1, 1, LanguagesEnum.English)
			expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[1]);
			expect(translation.isDeleted).to.equal(false);
		});
	});

	describe("Test edit item language -> create translation to 1 language", function () {

		it("Test edit post language -> create translation to 1 language", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);

			await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English);
			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.Spanish], [ipfsHashes[2]]);

			const translation = await peeranhaContent.getTranslation(1, 0, 0, LanguagesEnum.Spanish)
			expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[2]);
			expect(translation.isDeleted).to.equal(false);
		});

		it("Test edit reply language -> create translation to 1 language", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
			
			await peeranhaContent.editReply(signers[0].address, 1, 1, hashContainer[1], false, LanguagesEnum.English);
			await peeranhaContent.createTranslations(signers[0].address, 1, 1, 0, [LanguagesEnum.Spanish], [ipfsHashes[2]]);

			const translation = await peeranhaContent.getTranslation(1, 1, 0, LanguagesEnum.Spanish)
			expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[2]);
			expect(translation.isDeleted).to.equal(false);
		});

		it("Test edit comment to post language -> create translation to 1 language", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.Spanish);
			
			await peeranhaContent.editComment(signers[0].address, 1, 0, 1, hashContainer[2], LanguagesEnum.English);
			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 1, [LanguagesEnum.Spanish], [ipfsHashes[2]]);

			const translation = await peeranhaContent.getTranslation(1, 0, 1, LanguagesEnum.Spanish)
			expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[2]);
			expect(translation.isDeleted).to.equal(false);
		});

		it("Test edit comment to reply language -> create translation to 1 language", async function () {
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.Spanish);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.Spanish);
			await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.Spanish);
			
			await peeranhaContent.editComment(signers[0].address, 1, 1, 1, hashContainer[2], LanguagesEnum.English);
			await peeranhaContent.createTranslations(signers[0].address, 1, 1, 1, [LanguagesEnum.Spanish], [ipfsHashes[2]]);

			const translation = await peeranhaContent.getTranslation(1, 1, 1, LanguagesEnum.Spanish)
			expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[2]);
			expect(translation.isDeleted).to.equal(false);
		});
	});
});
