const { disableExperimentalFragmentVariables } = require("@apollo/client");
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

describe("Test bot", function () {

	describe('Bot role', function () {

		it("Test give bot role permission", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();

			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.giveAdminPermission(signers[0].address)
			await peeranhaUser.giveBotPermission(signers[1].address)

			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
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
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.giveAdminPermission(signers[0].address)
			await peeranhaUser.giveBotPermission(signers[1].address)

			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.connect(signers[1]).createReplyByBot(1, hashContainer[1], 1, 'handle'))
			.not.to.be.revertedWith('not_allowed_not_bot');

			await peeranhaUser.revokeBotPermission(signers[1].address)

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
			await peeranhaUser.createUser(hashContainer[1]);

			await peeranhaUser.giveBotPermission(signers[1].address);

			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

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
			await peeranhaUser.createUser(hashContainer[1]);

			await peeranhaUser.giveBotPermission(signers[1].address);

			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			await peeranhaContent.connect(signers[1]).createReplyByBot(1, hashContainer[1], 1, 'handle');

			const post = await peeranhaContent.getPost(1);
			const reply = await peeranhaContent.getReply(1, 1);

			const property = await peeranhaContent.getReplyProperty(1, 1, 0);
			expect(property).to.equal('0x68616e646c650000000000000000000000000000000000000000000000000001');
		});
	});
});
