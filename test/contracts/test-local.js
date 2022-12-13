const { expect } = require("chai");
const { 
	wait, getBalance, availableBalanceOf, getOwnerMinted, getTotalSupply, getInt, getAddressContract, createContract, createContractToken, getUsers, getUserReward, parseEther,
    getIdsContainer, getHashesContainer, createTags, getHashContainer, getHashTranslation, getTranslationValues, hashContainer, getHash, registerTwoUsers, createUserWithAnotherRating, createPeerenhaAndTokenContract,
    periodRewardCoefficient, StartEnergy, PeriodTime, QuickReplyTime, deleteTime, coefficientToken, periodUserReward, StartRating, StartRatingWithoutAction, PostTypeEnum, LanguagesEnum, fraction, poolToken,
    setRetingOnePeriod, ratingChanges, ratingChangesSkipPeriod, twiceChengeRatingIn1Period, activeIn1st2nd3rdPeriod, twiceChengeRatingIn2NDPeriod, energyDownVotePost, energyDownVoteReply, energyVoteComment, energyUpvotePost, energyUpvoteReply,
	energyPublicationPost, energyPublicationReply, energyPublicationComment, energyUpdateProfile, energyEditItem, energyDeleteItem,
	energyBestReply, energyFollowCommunity, energyForumVoteCancel, energyCreateCommunity, energyCreateTag, energyArray,
    DownvoteExpertPost, UpvotedExpertPost, DownvotedExpertPost, DownvoteCommonPost, UpvotedCommonPost, DownvotedCommonPost,
    ModeratorDeletePost, DownvoteExpertReply, UpvotedExpertReply, DownvotedExpertReply, AcceptExpertReply, AcceptedExpertReply, 
    FirstExpertReply, QuickExpertReply, DownvoteCommonReply, UpvotedCommonReply, DownvotedCommonReply, AcceptCommonReply,
    AcceptedCommonReply, FirstCommonReply, QuickCommonReply, ModeratorDeleteReply, ModeratorDeleteComment,
    DownvoteTutorial, UpvotedTutorial, DownvotedTutorial, DeleteOwnPost, DeleteOwnReply, DefaultCommunityId,
    PROTOCOL_ADMIN_ROLE, BOT_ROLE, DISPATCHER_ROLE, TRANSACTION_DELAY
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