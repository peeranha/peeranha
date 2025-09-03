const { expect } = require("chai");
const { 
	wait, createPeerenhaAndTokenContract, registerTwoUsers, createUserWithAnotherRating, getHashContainer, getHashesContainer, createTags, getIdsContainer,
	PostTypeEnum, StartRating, StartRatingWithoutAction, deleteTime, DeleteOwnReply, QuickReplyTime,
    DownvoteExpertPost, UpvotedExpertPost, DownvotedExpertPost, DownvoteCommonPost, UpvotedCommonPost, DownvotedCommonPost,
    ModeratorDeletePost, DownvoteExpertReply, UpvotedExpertReply, DownvotedExpertReply, AcceptExpertReply, AcceptedExpertReply, 
    FirstExpertReply, QuickExpertReply, DownvoteCommonReply, UpvotedCommonReply, DownvotedCommonReply, AcceptCommonReply,
    AcceptedCommonReply, FirstCommonReply, QuickCommonReply, ModeratorDeleteReply, ModeratorDeleteComment,
	DownvoteTutorial, UpvotedTutorial, DownvotedTutorial, DeleteOwnPost, DefaultCommunityId, LanguagesEnum, DISPATCHER_ROLE, PeriodTime
} = require('./utils');
const { parseEther }  = require("ethers/lib/utils");


describe("Test local", function () {
	
	it("Test get community reward", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, communityTokenRewardFactory, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(accountDeployed, ipfsHashes[0], createTags(5));
			await communityTokenRewardFactory.createNewCommunityTokenReward(accountDeployed, 1, token.address, 100, 20);
			
			const ownerMintTokens = parseEther("10");
			await token.mint(ownerMintTokens);
			const addressLastCreatedContract = await communityTokenRewardFactory.getAddressLastCreatedContract(1)
			await token.transfer(addressLastCreatedContract, parseEther("10"));
	
			await communityTokenRewardFactory.startPeriod();
			await peeranhaUser.addUserRating(signers[0].address, 5, 1);
			await peeranhaUser.addUserRating(signers[2].address, 5, 1);
			await peeranhaUser.addUserRating(signers[1].address, -1, 1);
			
			await wait(PeriodTime);
			await communityTokenRewardFactory.startPeriod();
			await wait(PeriodTime);
			await communityTokenRewardFactory.startPeriod();
			await wait(PeriodTime);
			await communityTokenRewardFactory.startPeriod();

			const CommunityTokenReward = await ethers.getContractFactory("CommunityTokenReward");
			const communityTokenReward = await CommunityTokenReward.attach(addressLastCreatedContract);
	
			
  			const periodUser1 = await peeranhaUser.getCountCommunityActiveUsersInPeriodWithPositiveRating(1, 1);
  			const periodUser2 = await peeranhaUser.getCountCommunityActiveUsersInPeriodWithPositiveRating(2, 1);
  			const periodUser3 = await peeranhaUser.getCountCommunityActiveUsersInPeriodWithPositiveRating(3, 1);
  			const periodUser4 = await peeranhaUser.getCountCommunityActiveUsersInPeriodWithPositiveRating(4, 1);

			console.log(`periodUser1 ${periodUser1}`) 
			console.log(`periodUser2 ${periodUser2}`) 
			console.log(`periodUser3 ${periodUser3}`) 
			console.log(`periodUser4 ${periodUser4}`) 

			const rewardPeriods1 = await communityTokenReward.getPeriodRewardParams(1);
			const rewardPeriods2 = await communityTokenReward.getPeriodRewardParams(2);
			const rewardPeriods3 = await communityTokenReward.getPeriodRewardParams(3);
			const rewardPeriods4 = await communityTokenReward.getPeriodRewardParams(4);
			console.log(`rewardPeriods1 ${rewardPeriods1}`) 
			console.log(`rewardPeriods2 ${rewardPeriods2}`) 
			console.log(`rewardPeriods3 ${rewardPeriods3}`) 
			console.log(`rewardPeriods4 ${rewardPeriods4}`) 


			
	
			// await communityTokenRewardFactory.startPeriod();
		// 	await communityTokenRewardFactory.connect(signers[1]).claimRewards(signers[1].address, rewardPeriods[0]);
	
		// 	const balance = await getBalance(token, signers[1].address);
		// 	expect(balance).to.equal(5 * fraction);
		});
});
