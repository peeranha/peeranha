const { disableExperimentalFragmentVariables } = require("@apollo/client");
const { expect } = require("chai");
const { 
	wait, createPeerenhaAndTokenContract, registerTwoUsers, createUserWithAnotherRating, getHashContainer, getHashesContainer, createTags, getInt,
	PostTypeEnum, StartRating, StartRatingWithoutAction, deleteTime, DeleteOwnReply, QuickReplyTime,
    DownvoteExpertPost, UpvotedExpertPost, DownvotedExpertPost, DownvoteCommonPost, UpvotedCommonPost, DownvotedCommonPost,
    ModeratorDeletePost, DownvoteExpertReply, UpvotedExpertReply, DownvotedExpertReply, AcceptExpertReply, AcceptedExpertReply, 
    FirstExpertReply, QuickExpertReply, DownvoteCommonReply, UpvotedCommonReply, DownvotedCommonReply, AcceptCommonReply,
    AcceptedCommonReply, FirstCommonReply, QuickCommonReply, ModeratorDeleteReply, ModeratorDeleteComment,
	DownvoteTutorial, UpvotedTutorial, DownvotedTutorial, DeleteOwnPost, PROTOCOL_ADMIN_ROLE, BOT_ROLE, LanguagesEnum
} = require('./utils');

describe("Test bot", function () {

	describe('Bot role', function () {

		it("Test give bot role permission", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);
			
			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

			await peeranhaContent.connect(signers[1]).createPostByBot(signers[2].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English, 1, 'handle');
			await peeranhaContent.connect(signers[1]).createReplyByBot(signers[2].address, 1, hashContainer[1], LanguagesEnum.English, 1, 'handle');

			await expect(peeranhaContent.connect(signers[2]).createPostByBot(signers[2].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English, 1, 'handle'))
				.to.be.revertedWith('not_allowed_not_bot');
			await expect(peeranhaContent.connect(signers[2]).createReplyByBot(signers[2].address, 1, hashContainer[1], LanguagesEnum.English, 1, 'handle'))
				.to.be.revertedWith('not_allowed_not_bot');
		});

		it("Test revoke bot role permission", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);

			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

			await peeranhaContent.connect(signers[1]).createPostByBot(signers[2].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English, 1, 'handle');
			await peeranhaContent.connect(signers[1]).createReplyByBot(signers[2].address, 1, hashContainer[1], LanguagesEnum.English, 1, 'handle');

			await peeranhaUser.revokeRole(BOT_ROLE, signers[1].address);

			await expect(peeranhaContent.connect(signers[1]).createPostByBot(signers[2].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English, 1, 'handle'))
				.to.be.revertedWith('not_allowed_not_bot');
			await expect(peeranhaContent.connect(signers[1]).createReplyByBot(signers[2].address, 1, hashContainer[1], LanguagesEnum.English, 1, 'handle'))
				.to.be.revertedWith('not_allowed_not_bot');
		});
	});

	describe('Bot actions', function () {
		it("Test create expert post by bot", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);

			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address)
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.connect(signers[1]).createPostByBot(signers[2].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English, 1, 'handle');

			const post = await peeranhaContent.getPost(1);
			expect(post.author).to.equal(signers[2].address);
			expect(post.isDeleted).to.equal(false);
			expect(post.postType).to.equal(PostTypeEnum.ExpertPost);
			expect(post.ipfsDoc.hash).to.equal(hashContainer[0]);
		});

		it("Test another user create bot post (sending bot address)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);

			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address)
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await expect(peeranhaContent.connect(signers[2]).createPostByBot(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English, 1, 'handle'))
				.to.be.revertedWith('not_allowed_not_bot');
		});

		it("Test create post by bot, author of post does not created", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address)
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await expect(peeranhaContent.connect(signers[1]).createPostByBot(signers[2].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English, 1, 'handle'))
				.to.be.revertedWith('user_not_found');
		});

		it("Test create common post by bot", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);

			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address)
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.connect(signers[1]).createPostByBot(signers[2].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English, 1, 'handle');

			const post = await peeranhaContent.getPost(1);
			expect(post.author).to.equal(signers[2].address);
			expect(post.isDeleted).to.equal(false);
			expect(post.postType).to.equal(PostTypeEnum.CommonPost);
			expect(post.ipfsDoc.hash).to.equal(hashContainer[0]);
		});

		it("Test create tutorial post by bot", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);

			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address)
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.connect(signers[1]).createPostByBot(signers[2].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English, 1, 'handle');

			const post = await peeranhaContent.getPost(1);
			expect(post.author).to.equal(signers[2].address);
			expect(post.isDeleted).to.equal(false);
			expect(post.postType).to.equal(PostTypeEnum.Tutorial);
			expect(post.ipfsDoc.hash).to.equal(hashContainer[0]);
		});

		it("Test get messenger and sender data from post property", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);

			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address)
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.connect(signers[1]).createPostByBot(signers[2].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English, 1, 'handle');

			const property = await peeranhaContent.getItemProperty(0, 1, 0, 0);
			expect(property).to.equal(`0x68616e646c650000000000000000000000000000000000000000000000000001`);
		});

		it("Test create reply by bot", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);

			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address)
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.connect(signers[1]).createReplyByBot(signers[2].address, 1, hashContainer[1], LanguagesEnum.English, 1, 'handle');

			const post = await peeranhaContent.getPost(1);
			const reply = await peeranhaContent.getReply(1, 1);
			expect(post.replyCount).to.equal(1);
			expect(reply.author).to.equal(signers[2].address);
			expect(reply.ipfsDoc.hash).to.equal(hashContainer[1]);
		});

		it("Test another user create bot reply (sending bot address)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);

			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address)
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await expect(peeranhaContent.connect(signers[2]).createReplyByBot(signers[1].address, 1, hashContainer[1], LanguagesEnum.English, 1, 'handle'))
				.to.be.revertedWith('not_allowed_not_bot');
		});

		it("Test get messenger and sender data from reply property", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);

			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address)
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.connect(signers[1]).createReplyByBot(signers[2].address, 1, hashContainer[1], LanguagesEnum.English, 1, 'handle');

			const property = await peeranhaContent.getItemProperty(0, 1, 1, 0);
			expect(property).to.equal(`0x68616e646c650000000000000000000000000000000000000000000000000001`);
		});

		it("Test create 2 different replies by bot", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);

			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address)
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

			await peeranhaContent.connect(signers[1]).createReplyByBot(signers[2].address, 1, hashContainer[1], LanguagesEnum.English, 1, 'handle');
			await peeranhaContent.connect(signers[1]).createReplyByBot(signers[2].address, 1, hashContainer[1], LanguagesEnum.English, 2, 'username');

			const post = await peeranhaContent.getPost(1);
			const firstReply = await peeranhaContent.getReply(1, 1);
			const secondReply = await peeranhaContent.getReply(1, 2);

			expect(post.replyCount).to.equal(2);

			expect(firstReply.author).to.equal(signers[2].address);
			expect(firstReply.ipfsDoc.hash).to.equal(hashContainer[1]);

			expect(secondReply.author).to.equal(signers[2].address);
			expect(secondReply.ipfsDoc.hash).to.equal(hashContainer[1]);
		});

		it("Test double replies by bot", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);

			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address)
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

			await peeranhaContent.connect(signers[1]).createReplyByBot(signers[2].address, 1, hashContainer[1], LanguagesEnum.English, 1, 'handle');
			await expect(peeranhaContent.connect(signers[1]).createReplyByBot(signers[2].address, 1, hashContainer[1], LanguagesEnum.English, 1, 'handle') )
				.to.be.revertedWith('Users can not publish 2 replies for expert and common posts.');

			const post = await peeranhaContent.getPost(1);
			const reply = await peeranhaContent.getReply(1, 1);

			expect(post.replyCount).to.equal(1);
			expect(reply.author).to.equal(signers[2].address);
			expect(reply.ipfsDoc.hash).to.equal(hashContainer[1]);
		});

		it("Test languages in create post by bot", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);

			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address)
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPostByBot(signers[2].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.Spanish, 1, 'handle');
			await peeranhaContent.connect(signers[1]).createPostByBot(signers[2].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.Chinese, 3, 'handle');

			const itemLanguage = await peeranhaContent.getItemLanguage(1, 0, 0);
			expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.Spanish);

			const secondItemLanguage = await peeranhaContent.getItemLanguage(2, 0, 0);
			expect(await getInt(secondItemLanguage)).to.equal(LanguagesEnum.Chinese);
		});

		it("Test languages in create reply by bot", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);

			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address)
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

			await peeranhaContent.connect(signers[1]).createReplyByBot(signers[2].address, 1, hashContainer[1], LanguagesEnum.Spanish, 1, 'handle');
			await peeranhaContent.connect(signers[1]).createReplyByBot(signers[2].address, 2, hashContainer[1], LanguagesEnum.Chinese, 1, 'handle');

			const itemLanguage = await peeranhaContent.getItemLanguage(1, 1, 0);
			expect(await getInt(itemLanguage)).to.equal(LanguagesEnum.Spanish);

			const secondItemLanguage = await peeranhaContent.getItemLanguage(2, 1, 0);
			expect(await getInt(secondItemLanguage)).to.equal(LanguagesEnum.Chinese);
		});
	});
});
