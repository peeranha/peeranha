const { expect } = require("chai");
const { 
	wait, createPeerenhaAndTokenContract, registerTwoUsers, createUserWithAnotherRating, getHashContainer, getHashesContainer, createTags, getIdsContainer,
	PostTypeEnum, StartRating, StartRatingWithoutAction, deleteTime, DeleteOwnReply, QuickReplyTime,
    DownvoteExpertPost, UpvotedExpertPost, DownvotedExpertPost, DownvoteCommonPost, UpvotedCommonPost, DownvotedCommonPost,
    ModeratorDeletePost, DownvoteExpertReply, UpvotedExpertReply, DownvotedExpertReply, AcceptExpertReply, AcceptedExpertReply, 
    FirstExpertReply, QuickExpertReply, DownvoteCommonReply, UpvotedCommonReply, DownvotedCommonReply, AcceptCommonReply,
    AcceptedCommonReply, FirstCommonReply, QuickCommonReply, ModeratorDeleteReply, ModeratorDeleteComment,
	DownvoteTutorial, UpvotedTutorial, DownvotedTutorial, DeleteOwnPost, DefaultCommunityId, LanguagesEnum, DISPATCHER_ROLE, BOT_ROLE
} = require('./utils');


describe("Test local", function () {
	
	xit("Delete translation with dispatcher", async function() {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();
		const ipfsHashes = getHashesContainer(3);
		await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
		
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);

		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.Spanish);
		await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[1]]);

		await expect(peeranhaContent.connect(signers[3]).deleteTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English]))
		.to.be.revertedWith('not_allowed_not_dispatcher');
		await expect(peeranhaContent.connect(signers[1]).deleteTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English]))
		.not.to.be.revertedWith('not_allowed_not_dispatcher');

		const translation = await peeranhaContent.getTranslation(1, 0, 0, LanguagesEnum.English)
		expect(translation.isDeleted).to.equal(true);
	});
});
