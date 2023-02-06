const { expect } = require("chai");
const { 
	wait, createPeerenhaAndTokenContract, registerTwoUsers, createUserWithAnotherRating, getHashContainer, getHashesContainer, createTags, getIdsContainer,
	PostTypeEnum, StartRating, StartRatingWithoutAction, deleteTime, DeleteOwnReply, QuickReplyTime,
    DownvoteExpertPost, UpvotedExpertPost, DownvotedExpertPost, DownvoteCommonPost, UpvotedCommonPost, DownvotedCommonPost,
    ModeratorDeletePost, DownvoteExpertReply, UpvotedExpertReply, DownvotedExpertReply, AcceptExpertReply, AcceptedExpertReply, 
    FirstExpertReply, QuickExpertReply, DownvoteCommonReply, UpvotedCommonReply, DownvotedCommonReply, AcceptCommonReply,
    AcceptedCommonReply, FirstCommonReply, QuickCommonReply, ModeratorDeleteReply, ModeratorDeleteComment,
	DownvoteTutorial, UpvotedTutorial, DownvotedTutorial, DeleteOwnPost, DefaultCommunityId,
} = require('./utils');


describe("Test local", function () {
	
	it("Test downVote expert reply community-1 -> community-2 (delete reply)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();
		const ipfsHashes = getHashesContainer(2);
		const countOfCommunities = 2;
		const communitiesIds = getIdsContainer(countOfCommunities);

		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

		await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
		const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
		// await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

		// await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
		// const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
		// await expect(userRating).to.equal(StartRating + DownvotedExpertReply);

		// await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
		// const userRatingAfterDeleteReply =  await peeranhaUser.getUserRating(signers[1].address, 1);
		// await expect(userRatingAfterDeleteReply).to.equal(StartRating + DeleteOwnReply + DownvotedExpertReply);

		// await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
		// const newRatingCommunity1 = await peeranhaUser.getUserRating(signers[1].address, 1);
		// await expect(newRatingCommunity1).to.equal(StartRating);
		// const newRatingCommunity2 = await peeranhaUser.getUserRating(signers[1].address, 2);
		// await expect(newRatingCommunity2).to.equal(StartRating + DeleteOwnReply + DownvotedExpertReply);

		console.log(accountDeployed)
		console.log(signers[0].address)
		console.log(peeranhaUser.deployTransaction.from)

	});
	
	// in utils error "ReferenceError: expect is not defined"
	const createCommunities = async (peeranhaCommunity, wallet, countOfCommunities, communitiesIds) => {
		const ipfsHashes = getHashesContainer(countOfCommunities);
		await Promise.all(communitiesIds.map(async(id) => {
			return await peeranhaCommunity.createCommunity(wallet, ipfsHashes[id - 1], createTags(5));
		}));

		expect(await peeranhaCommunity.getCommunitiesCount()).to.equal(countOfCommunities)

		await Promise.all(communitiesIds.map(async(id) => {
			const community = await peeranhaCommunity.getCommunity(id);
			return await expect(community.ipfsDoc.hash).to.equal(ipfsHashes[id - 1]);
		}));
	}
});
