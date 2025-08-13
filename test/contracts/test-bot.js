const { disableExperimentalFragmentVariables } = require("@apollo/client");
const { expect } = require("chai");
const { 
	wait, createPeerenhaAndTokenContract, registerTwoUsers, createUserWithAnotherRating, getHashContainer, getHashesContainer, createTags, getInt,
	PostTypeEnum, StartRating, StartRatingWithoutAction, deleteTime, DeleteOwnReply, QuickReplyTime,
    DownvoteExpertPost, UpvotedExpertPost, DownvotedExpertPost, DownvoteCommonPost, UpvotedCommonPost, DownvotedCommonPost,
    ModeratorDeletePost, DownvoteExpertReply, UpvotedExpertReply, DownvotedExpertReply, AcceptExpertReply, AcceptedExpertReply, 
    FirstExpertReply, QuickExpertReply, DownvoteCommonReply, UpvotedCommonReply, DownvotedCommonReply, AcceptCommonReply,
    AcceptedCommonReply, FirstCommonReply, QuickCommonReply, ModeratorDeleteReply, ModeratorDeleteComment,
	DownvoteTutorial, UpvotedTutorial, DownvotedTutorial, DeleteOwnPost, LanguagesEnum,
	PROTOCOL_ADMIN_ROLE, BOT_ROLE, VERIFIED_ROLE, VERIFIER_ROLE
} = require('./utils');

describe("Test bot", function () {
	let peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed;
	let ipfsHashes, hashContainer;
	let root, bot, firstUser, secondUser;

	beforeEach(async function () {
		({ peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract());
		ipfsHashes = getHashesContainer(2);
		hashContainer = getHashContainer();
		const signers = await ethers.getSigners();
		root = signers[0];
		bot = signers[1];
		firstUser = signers[2];
		secondUser = signers[3];
		await peeranhaUser.createUser(root.address, hashContainer[1]);

		await peeranhaUser.connect(bot).createUser(bot.address, hashContainer[2]);
		await peeranhaUser.grantRole(BOT_ROLE, bot.address);

		await peeranhaUser.connect(firstUser).createUser(firstUser.address, hashContainer[2]);
		await peeranhaUser.connect(secondUser).createUser(secondUser.address, hashContainer[2]);
		await peeranhaCommunity.createCommunity(root.address, ipfsHashes[0], createTags(5));

		await peeranhaUser.grantRole(VERIFIER_ROLE, root.address);
		await peeranhaUser.grantRole(VERIFIED_ROLE, bot.address);
		await peeranhaUser.grantRole(VERIFIED_ROLE, root.address);
		await peeranhaUser.grantRole(VERIFIED_ROLE, firstUser.address);
		await peeranhaUser.grantRole(VERIFIED_ROLE, secondUser.address);
	})

	describe('Bot role', function () {
		it("Test give bot role permission", async function () {
			await peeranhaContent.createPost(root.address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

			await expect(peeranhaContent.connect(bot).createPostByBot(1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English, 1, 'handle'))
			.not.to.be.revertedWith('not_allowed_not_bot');

			await expect(peeranhaContent.connect(firstUser).createPostByBot(1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English, 1, 'handle'))
			.to.be.revertedWith('not_allowed_not_bot');

			await expect(peeranhaContent.connect(bot).createReplyByBot(1, hashContainer[1], LanguagesEnum.English, 1, 'handle'))
			.not.to.be.revertedWith('not_allowed_not_bot');

			await expect(peeranhaContent.connect(firstUser).createReplyByBot(1, hashContainer[1], LanguagesEnum.English, 1, 'handle'))
			.to.be.revertedWith('not_allowed_not_bot');
		});

		it("Test revoke bot role permission", async function () {
			await peeranhaContent.createPost(root.address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

			await expect(peeranhaContent.connect(bot).createPostByBot(1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English, 1, 'handle'))
			.not.to.be.revertedWith('not_allowed_not_bot');
			await expect(peeranhaContent.connect(bot).createReplyByBot(1, hashContainer[1], LanguagesEnum.English, 1, 'handle'))
			.not.to.be.revertedWith('not_allowed_not_bot');

			await peeranhaUser.revokeRole(BOT_ROLE, bot.address);

			await expect(peeranhaContent.connect(bot).createPostByBot(1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English, 1, 'handle'))
			.to.be.revertedWith('not_allowed_not_bot');
			await expect(peeranhaContent.connect(bot).createReplyByBot(1, hashContainer[1], LanguagesEnum.English, 1, 'handle'))
			.to.be.revertedWith('not_allowed_not_bot');
		});
	});

	describe('Bot actions', function () {
		it("Test create expert post by bot", async function () {
			await peeranhaContent.connect(bot).createPostByBot(1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English, 1, 'handle');

			const post = await peeranhaContent.getPost(1);
			
			expect(post.author).to.equal('0x0000000000000000000000000000000000000001');
			expect(post.isDeleted).to.equal(false);
			expect(post.postType).to.equal(PostTypeEnum.ExpertPost);
			expect(post.ipfsDoc.hash).to.equal(hashContainer[0]);
		});

		it("Test create common post by bot", async function () {
			await peeranhaContent.connect(bot).createPostByBot(1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English, 1, 'handle');

			const post = await peeranhaContent.getPost(1);
			
			expect(post.author).to.equal('0x0000000000000000000000000000000000000001');
			expect(post.isDeleted).to.equal(false);
			expect(post.postType).to.equal(PostTypeEnum.CommonPost);
			expect(post.ipfsDoc.hash).to.equal(hashContainer[0]);
		});

		it("Test create tutorial post by bot", async function () {
			await peeranhaContent.connect(bot).createPostByBot(1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English, 1, 'handle');

			const post = await peeranhaContent.getPost(1);
			
			expect(post.author).to.equal('0x0000000000000000000000000000000000000001');
			expect(post.isDeleted).to.equal(false);
			expect(post.postType).to.equal(PostTypeEnum.Tutorial);
			expect(post.ipfsDoc.hash).to.equal(hashContainer[0]);
		});

		it("Test get messenger and sender data from post property", async function () {
			await peeranhaContent.connect(bot).createPostByBot(1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English, 1, 'handle');

			const property = await peeranhaContent.getItemProperty(0, 1, 0, 0);
			expect(property).to.equal('0x68616e646c650000000000000000000000000000000000000000000000000001');
		});

		it("Test create reply by bot", async function () {
			await peeranhaContent.createPost(root.address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

			await peeranhaContent.connect(bot).createReplyByBot(1, hashContainer[1], LanguagesEnum.English, 1, 'handle');

			const post = await peeranhaContent.getPost(1);
			const reply = await peeranhaContent.getReply(1, 1);
			
			expect(post.replyCount).to.equal(1);
			expect(reply.author).to.equal('0x0000000000000000000000000000000000000001');
			expect(reply.ipfsDoc.hash).to.equal(hashContainer[1]);
		});

		it("Test get messenger and sender data from reply property", async function () {
			await peeranhaContent.createPost(root.address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

			await peeranhaContent.connect(bot).createReplyByBot(1, hashContainer[1], LanguagesEnum.English, 1, 'handle');

			const property = await peeranhaContent.getItemProperty(0, 1, 1, 0);
			expect(property).to.equal('0x68616e646c650000000000000000000000000000000000000000000000000001');
		});

		it("Test create 2 different replies by bot", async function () {
			await peeranhaContent.createPost(root.address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

			await peeranhaContent.connect(bot).createReplyByBot(1, hashContainer[1], LanguagesEnum.English, 1, 'handle');
			
			await peeranhaContent.connect(bot).createReplyByBot(1, hashContainer[1], LanguagesEnum.English, 2, 'username');

			const post = await peeranhaContent.getPost(1);
			const firstReply = await peeranhaContent.getReply(1, 1);
			const secondReply = await peeranhaContent.getReply(1, 2);

			expect(post.replyCount).to.equal(2);

			expect(firstReply.author).to.equal('0x0000000000000000000000000000000000000001');
			expect(firstReply.ipfsDoc.hash).to.equal(hashContainer[1]);

			expect(secondReply.author).to.equal('0x0000000000000000000000000000000000000001');
			expect(secondReply.ipfsDoc.hash).to.equal(hashContainer[1]);
		});

		it("Test double replies by bot", async function () {
			await peeranhaContent.createPost(root.address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

			await peeranhaContent.connect(bot).createReplyByBot(1, hashContainer[1], LanguagesEnum.English, 1, 'handle');
			await expect(peeranhaContent.connect(bot).createReplyByBot(1, hashContainer[1], LanguagesEnum.English, 1, 'handle') ).to.be.revertedWith('Users can not publish 2 replies for expert and common posts.');

			const post = await peeranhaContent.getPost(1);
			const reply = await peeranhaContent.getReply(1, 1);

			expect(post.replyCount).to.equal(1);

			expect(reply.author).to.equal('0x0000000000000000000000000000000000000001');
			expect(reply.ipfsDoc.hash).to.equal(hashContainer[1]);
		});

		it("Test languages in create post by bot", async function () {
			await peeranhaContent.connect(bot).createPostByBot(1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.Spanish, 1, 'handle');
			await peeranhaContent.connect(bot).createPostByBot(1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.Chinese, 3, 'handle');

			const itemLanguage = await peeranhaContent.getItemLanguage(1, 0, 0);
			expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.Spanish);

			const secondItemLanguage = await peeranhaContent.getItemLanguage(2, 0, 0);
			expect(await getInt(secondItemLanguage)).to.equal(LanguagesEnum.Chinese);
		});

		it("Test languages in create reply by bot", async function () {
			await peeranhaContent.createPost(root.address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createPost(root.address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

			await peeranhaContent.connect(bot).createReplyByBot(1, hashContainer[1], LanguagesEnum.Spanish, 1, 'handle');
			await peeranhaContent.connect(bot).createReplyByBot(2, hashContainer[1], LanguagesEnum.Chinese, 1, 'handle');
			
			const itemLanguage = await peeranhaContent.getItemLanguage(1, 1, 0);
			expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.Spanish);

			const secondItemLanguage = await peeranhaContent.getItemLanguage(2, 1, 0);
			expect(await getInt(secondItemLanguage)).to.equal(LanguagesEnum.Chinese);
		});
	});
});
