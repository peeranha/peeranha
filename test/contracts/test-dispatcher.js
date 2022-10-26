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


describe("Test dispatcher", function () {
	
	describe("Test get dispatch approval", function () {
		it("Test get dispatch with non-existent user", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			
			await expect(peeranhaUser.connect(signers[1]).isDispatchApproval(signers[1].address))
			.to.be.revertedWith('user_not_found');
		});
		it("Test get dispatch when dispatch was not set", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
	
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
	
			expect(peeranhaUser.connect(signers[1]).isDispatchApproval(signers[1].address))
			.not.to.be.revertedWith('user_not_found').but.false;
		});
	});
	
	describe("Test approve dispatch", function() {
		it("Test approve dispatch with non-existent user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();

			await expect(peeranhaUser.connect(signers[1]).approveDispatch(signers[1].address))
			.to.be.revertedWith('user_not_found');
		});

		it("Test approve dispatch with existing user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
	
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);

			expect(await peeranhaUser.connect(signers[1]).isDispatchApproval(signers[1].address))
			.to.be.false;

			await expect(peeranhaUser.connect(signers[1]).approveDispatch(signers[1].address))
			.not.to.be.revertedWith('user_not_found');

			expect(await peeranhaUser.connect(signers[1]).isDispatchApproval(signers[1].address))
			.to.be.true;
		});
	});

	describe("Test disapprove dispatch", function() {
		it("Test disapprove dispatch with non-existent user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();

			await expect(peeranhaUser.connect(signers[1]).disapproveDispatch(signers[1].address))
			.to.be.revertedWith('user_not_found');
		});

		it("Test disapprove dispatch with existing user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
	
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);

			await expect(peeranhaUser.connect(signers[1]).approveDispatch(signers[1].address))
			.not.to.be.revertedWith('user_not_found');

			expect(await peeranhaUser.connect(signers[1]).isDispatchApproval(signers[1].address))
			.to.be.true;

			await expect(peeranhaUser.connect(signers[1]).disapproveDispatch(signers[1].address))
			.not.to.be.revertedWith('user_not_found');

			expect(await peeranhaUser.connect(signers[1]).isDispatchApproval(signers[1].address))
			.to.be.false;
		});
	});
});
