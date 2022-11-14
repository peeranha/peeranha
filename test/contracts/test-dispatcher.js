const { expect } = require("chai");
const { 
	wait, createPeerenhaAndTokenContract, registerTwoUsers, createUserWithAnotherRating, getHashContainer, getHashesContainer, createTags,
	PostTypeEnum, StartRating, StartRatingWithoutAction, deleteTime, DeleteOwnReply, QuickReplyTime,
    DownvoteExpertPost, UpvotedExpertPost, DownvotedExpertPost, DownvoteCommonPost, UpvotedCommonPost, DownvotedCommonPost,
    ModeratorDeletePost, DownvoteExpertReply, UpvotedExpertReply, DownvotedExpertReply, AcceptExpertReply, AcceptedExpertReply, 
    FirstExpertReply, QuickExpertReply, DownvoteCommonReply, UpvotedCommonReply, DownvotedCommonReply, AcceptCommonReply,
    AcceptedCommonReply, FirstCommonReply, QuickCommonReply, ModeratorDeleteReply, ModeratorDeleteComment,
	DownvoteTutorial, UpvotedTutorial, DownvotedTutorial, DeleteOwnPost, DISPATCHER_ROLE,
} = require('./utils');


describe("Test dispatcher", function () {
	
	describe("Test dispatcher role", function () {
		it("Test transaction with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();

			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[2].address);

			console.log(signers[2].address);
			console.log(DISPATCHER_ROLE);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await expect(peeranhaContent.connect(signers[2]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaContent.connect(signers[2]).createReply(signers[1].address, 1, 0, hashContainer[1], false))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaContent.connect(signers[2]).createComment(signers[1].address, 1, 1, hashContainer[1]))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');

			const post = await peeranhaContent.getPost(1);
			const reply = await peeranhaContent.getReply(1, 1);
			
			expect(post.author).to.equal(signers[1].address);
			expect(post.replyCount).to.equal(1);
			expect(reply.author).to.equal(signers[1].address);
			expect(reply.ipfsDoc.hash).to.equal(hashContainer[1]);
		});
	});
});
