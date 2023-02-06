const { disableExperimentalFragmentVariables } = require("@apollo/client");
const { expect } = require("chai");
const { 
	wait, createPeerenhaAndTokenContract, registerTwoUsers, createUserWithAnotherRating, getHashContainer, getHashesContainer, createTags,
	PostTypeEnum, StartRating, StartRatingWithoutAction, deleteTime, DeleteOwnReply, QuickReplyTime,
    DownvoteExpertPost, UpvotedExpertPost, DownvotedExpertPost, DownvoteCommonPost, UpvotedCommonPost, DownvotedCommonPost,
    ModeratorDeletePost, DownvoteExpertReply, UpvotedExpertReply, DownvotedExpertReply, AcceptExpertReply, AcceptedExpertReply, 
    FirstExpertReply, QuickExpertReply, DownvoteCommonReply, UpvotedCommonReply, DownvotedCommonReply, AcceptCommonReply,
    AcceptedCommonReply, FirstCommonReply, QuickCommonReply, ModeratorDeleteReply, ModeratorDeleteComment,
	DownvoteTutorial, UpvotedTutorial, DownvotedTutorial, DeleteOwnPost, PROTOCOL_ADMIN_ROLE, BOT_ROLE,
} = require('./utils');

describe("Test bot", function () {

	describe('Bot role', function () {

		it("Test give bot role permission", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();

			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			
			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address);

			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			await expect(peeranhaContent.connect(signers[1]).createReplyByBot(1, hashContainer[1], 1, 'handle'))
			.not.to.be.revertedWith('not_allowed_not_bot');

			await expect(peeranhaContent.connect(signers[2]).createReplyByBot(1, hashContainer[1], 1, 'handle'))
			.to.be.revertedWith('not_allowed_not_bot');
		});

		it("Test revoke bot role permission", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();

			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address);

			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.connect(signers[1]).createReplyByBot(1, hashContainer[1], 1, 'handle'))
			.not.to.be.revertedWith('not_allowed_not_bot');

			await peeranhaUser.revokeRole(BOT_ROLE, signers[1].address);

			await expect(peeranhaContent.connect(signers[1]).createReplyByBot(1, hashContainer[1], 1, 'handle'))
			.to.be.revertedWith('not_allowed_not_bot');
		});
	});

	describe('Bot actions', function () {
		it("Test create reply by bot", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();

			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address)

			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			await peeranhaContent.connect(signers[1]).createReplyByBot(1, hashContainer[1], 1, 'handle');

			const post = await peeranhaContent.getPost(1);
			const reply = await peeranhaContent.getReply(1, 1);
			
			expect(post.replyCount).to.equal(1);
			expect(reply.author).to.equal('0x0000000000000000000000000000000000000001');
			expect(reply.ipfsDoc.hash).to.equal(hashContainer[1]);
		});

		it("Test get messenger and sender data from reply property", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();

			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address)

			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			await peeranhaContent.connect(signers[1]).createReplyByBot(1, hashContainer[1], 1, 'handle');

			const property = await peeranhaContent.getItemProperty(0, 1, 1, 0);
			expect(property).to.equal('0x68616e646c650000000000000000000000000000000000000000000000000001');
		});

		it("Test create 2 replies by bot", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();

			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address)

			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			await peeranhaContent.connect(signers[1]).createReplyByBot(1, hashContainer[1], 1, 'handle');
			
			await peeranhaContent.connect(signers[1]).createReplyByBot(1, hashContainer[1], 2, 'username');

			const post = await peeranhaContent.getPost(1);
			const firstReply = await peeranhaContent.getReply(1, 1);
			const secondReply = await peeranhaContent.getReply(1, 2);

			expect(post.replyCount).to.equal(2);

			expect(firstReply.author).to.equal('0x0000000000000000000000000000000000000001');
			expect(firstReply.ipfsDoc.hash).to.equal(hashContainer[1]);

			expect(secondReply.author).to.equal('0x0000000000000000000000000000000000000001');
			expect(secondReply.ipfsDoc.hash).to.equal(hashContainer[1]);
		});
	});
	
	describe("Test linking account", function () {
		it("Test link account", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
	
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);
	
			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address);
	
			await peeranhaUser.connect(signers[1]).linkAccount(signers[2].address, 1, 'handle');
	
			await peeranhaUser.connect(signers[2]).approveLinkedAccount(signers[2].address, 1, 'handle', true);
	
			expect( await peeranhaUser.getLinkedAccount(1, 'handle') ).to.equal(signers[2].address);
		});
	
		it("Test link account by not bot", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
	
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);
	
			await expect(peeranhaUser.connect(signers[1]).linkAccount(signers[2].address, 1, 'handle'))
			.to.be.revertedWith('not_allowed_not_bot');
		});
	
		it("Test link account for non-existing user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
	
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
	
			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address);
	
			await expect(peeranhaUser.connect(signers[1]).linkAccount(signers[2].address, 1, 'handle'))
			.to.be.revertedWith('user_not_found');
		});
	
		it("Test link account for not linked wallet", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
	
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);
	
			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address);
	
			await expect(peeranhaUser.connect(signers[2]).approveLinkedAccount(signers[2].address, 1, 'handle', true))
			.to.be.revertedWith('user_not_linked');
		});
	
		it("Test unlink account", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
	
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);
	
			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address);
	
			await peeranhaUser.connect(signers[1]).linkAccount(signers[2].address, 1, 'handle');
	
			await peeranhaUser.connect(signers[2]).approveLinkedAccount(signers[2].address, 1, 'handle', true);
	
			expect( await peeranhaUser.getLinkedAccount(1, 'handle') ).to.equal(signers[2].address);
	
			await peeranhaUser.connect(signers[2]).approveLinkedAccount(signers[2].address, 1, 'handle', false);
	
			expect( await peeranhaUser.getLinkedAccount(1, 'handle') ).to.equal('0x0000000000000000000000000000000000000000');
		});
	
		it("Test link account for unlinked wallet", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
	
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);
	
			await peeranhaUser.grantRole(BOT_ROLE, signers[1].address);
	
			await peeranhaUser.connect(signers[1]).linkAccount(signers[2].address, 1, 'handle');
	
			await peeranhaUser.connect(signers[2]).approveLinkedAccount(signers[2].address, 1, 'handle', true);
	
			await peeranhaUser.connect(signers[2]).approveLinkedAccount(signers[2].address, 1, 'handle', false);
	
			await expect(peeranhaUser.connect(signers[2]).approveLinkedAccount(signers[2].address, 1, 'handle', true))
			.to.be.revertedWith('user_not_linked');
		});
	});
});
