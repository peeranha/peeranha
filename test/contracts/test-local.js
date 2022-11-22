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


describe("Test local", function () {
	
	xit("Test local", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();
		const ipfsHashes = getHashesContainer(2);

		await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
		await peeranhaUser.createUser(hashContainer[1]);
		await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

		await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
		await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
		
		const userRating1 =  await peeranhaUser.getUserRating(signers[1].address, 1);
		console.log(userRating1)
		
		await peeranhaContent.voteItem(1, 1, 0, 0);
		const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
		await expect(userRating).to.equal(StartRating + DownvotedCommonReply);

		await peeranhaContent.editPost(1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);
		const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
		console.log(newRating)
		
		await expect(newRating).to.equal(StartRating + DownvotedExpertReply);
	});
	
});
