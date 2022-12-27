const { expect } = require("chai");
const { 
	wait, getBalance, availableBalanceOf, getOwnerMinted, getTotalSupply, getInt, getAddressContract, createContract, createContractToken, getUsers, getUserReward, parseEther, getContract,
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

	xit("Test get community reward (active in another community)", async function () {
		const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, peeranhaTokenFactory, accountDeployed } = await createPeerenhaAndTokenContract();
		const ipfsHashes = getHashesContainer(2);
		const hashContainer = getHashContainer();
		const signers = await ethers.getSigners();
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
		await peeranhaCommunity.createCommunity(accountDeployed, ipfsHashes[0], createTags(5));
		await peeranhaCommunity.createCommunity(accountDeployed, ipfsHashes[0], createTags(5));
		await peeranhaTokenFactory.createNewCommunityToken(accountDeployed, 1, token.address, 100, 20);
		
		const ownerMintTokens = parseEther("10");
		await token.mint(ownerMintTokens);
		const addressLastCreatedContract = await peeranhaTokenFactory.getAddressLastCreatedContract(1)
		await token.transfer(addressLastCreatedContract, parseEther("10"));

		await peeranhaUser.addUserRating(signers[0].address, 5, 2);
		await wait(PeriodTime);
		await peeranhaUser.addUserRating(signers[0].address, 1, 2);
		await wait(PeriodTime);

		const rewardPeriods = await peeranhaUser.getActiveUserPeriods(signers[0].address);
		await peeranhaTokenFactory.setTotalPeriodRewards(rewardPeriods[0]);
		await peeranhaTokenFactory.connect(signers[1]).payCommunityRewards(signers[1].address, rewardPeriods[0]);

		const balance = await getBalance(token, signers[1].address);
		// console.log(fraction * 1.1) why 1100000000000000100 ??? 
		expect(balance).to.equal(0);
	});
});