const { expect } = require("chai");
const { parseEther }  = require("ethers/lib/utils");
const { 
	wait, createPeerenhaAndTokenContract, registerTwoUsers, createUserWithAnotherRating, getHashContainer, getHashesContainer, createTags, getIdsContainer, getBalance, getContract,
	PostTypeEnum, StartRating, StartRatingWithoutAction, deleteTime, DeleteOwnReply, QuickReplyTime,
    DownvoteExpertPost, UpvotedExpertPost, DownvotedExpertPost, DownvoteCommonPost, UpvotedCommonPost, DownvotedCommonPost,
    ModeratorDeletePost, DownvoteExpertReply, UpvotedExpertReply, DownvotedExpertReply, AcceptExpertReply, AcceptedExpertReply, 
    FirstExpertReply, QuickExpertReply, DownvoteCommonReply, UpvotedCommonReply, DownvotedCommonReply, AcceptCommonReply,
    AcceptedCommonReply, FirstCommonReply, QuickCommonReply, ModeratorDeleteReply, ModeratorDeleteComment,
	DownvoteTutorial, UpvotedTutorial, DownvotedTutorial, DeleteOwnPost, DefaultCommunityId, PeriodTime, fraction
} = require('./utils');

///
// get reward несколько сообществ
// add tests to describe("Get community reward", function () {
///
describe("Test community token factory", function () {

	describe("Community token", function () {

		it("Test create community token", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, peeranhaTokenFactory, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(accountDeployed, hashContainer[1]);
			await peeranhaCommunity.createCommunity(accountDeployed, ipfsHashes[0], createTags(5));

			await peeranhaTokenFactory.createNewCommunityToken(accountDeployed, 1, token.address, 100, 20);
			const addressLastCreatedContract = await peeranhaTokenFactory.getAddressLastCreatedContract(1)
			const communityTokenContract = await getContract(addressLastCreatedContract, "PeeranhaCommunityToken");
			const communityTokenData = await communityTokenContract.getCommunityTokenData();

			expect(communityTokenData).to.have.ownPropertyDescriptor('name');
			expect(communityTokenData).to.have.ownPropertyDescriptor('symbol');
			expect(communityTokenData).to.have.ownPropertyDescriptor('tokenAddress');
			expect(communityTokenData).to.have.ownPropertyDescriptor('maxRewardPerPeriod');
			expect(communityTokenData).to.have.ownPropertyDescriptor('activeUsersInPeriod');
			expect(communityTokenData).to.have.ownPropertyDescriptor('maxRewardPerUser');
			expect(communityTokenData).to.have.ownPropertyDescriptor('frezeTokens');
			expect(communityTokenData).to.have.ownPropertyDescriptor('createTime');
			expect(communityTokenData).to.have.ownPropertyDescriptor('peeranhaCommunityTokenFactoryAddress');

			expect(communityTokenData.name).to.equal(await token.name());
			expect(communityTokenData.symbol).to.equal(await token.symbol());
			expect(communityTokenData.tokenAddress).to.equal(token.address);
			expect(communityTokenData.maxRewardPerPeriod).to.equal(100);
			expect(communityTokenData.activeUsersInPeriod).to.equal(20);
			expect(communityTokenData.maxRewardPerUser).to.equal(5);
			expect(communityTokenData.frezeTokens).to.equal(0);
			// expect(communityTokenData.createTime).to.equal();
			expect(communityTokenData.peeranhaCommunityTokenFactoryAddress).to.equal(peeranhaTokenFactory.address);
		});

		it("Test create community token (community does not exist)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, peeranhaTokenFactory, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(accountDeployed, hashContainer[1]);
			await expect(peeranhaTokenFactory.createNewCommunityToken(accountDeployed, 1, token.address, 100, 20)).to.be.revertedWith('Community does not exist');
		});

		it("Test create community token", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, peeranhaTokenFactory, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(accountDeployed, hashContainer[1]);
			await peeranhaCommunity.createCommunity(accountDeployed, ipfsHashes[0], createTags(5));
			await peeranhaCommunity.freezeCommunity(accountDeployed, 1);

			await expect(peeranhaTokenFactory.createNewCommunityToken(accountDeployed, 1, token.address, 100, 20)).to.be.revertedWith('Community is frozen');
		});

		it("Test edit community token", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, peeranhaTokenFactory, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(accountDeployed, hashContainer[1]);
			await peeranhaCommunity.createCommunity(accountDeployed, ipfsHashes[0], createTags(5));

			await peeranhaTokenFactory.createNewCommunityToken(accountDeployed, 1, token.address, 100, 20);
			const addressLastCreatedContract = await peeranhaTokenFactory.getAddressLastCreatedContract(1)
			await peeranhaTokenFactory.updateCommunityRewardSettings(accountDeployed, 1, addressLastCreatedContract, 20, 2);
			const communityTokenContract = await getContract(addressLastCreatedContract, "PeeranhaCommunityToken");
			const communityTokenData = await communityTokenContract.getCommunityTokenData();
			
			expect(communityTokenData.name).to.equal(await token.name());
			expect(communityTokenData.symbol).to.equal(await token.symbol());
			expect(communityTokenData.tokenAddress).to.equal(token.address);
			expect(communityTokenData.maxRewardPerPeriod).to.equal(20);
			expect(communityTokenData.activeUsersInPeriod).to.equal(2);
			expect(communityTokenData.maxRewardPerUser).to.equal(10);
			expect(communityTokenData.frezeTokens).to.equal(0);
			// expect(communityContract.createTime).to.equal();
			expect(communityTokenData.peeranhaCommunityTokenFactoryAddress).to.equal(peeranhaTokenFactory.address);
		});

		it("Test edit not exist community token", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, peeranhaTokenFactory, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(accountDeployed, hashContainer[1]);
			await peeranhaCommunity.createCommunity(accountDeployed, ipfsHashes[0], createTags(5));

			await peeranhaTokenFactory.createNewCommunityToken(accountDeployed, 1, token.address, 100, 20);
			await expect(peeranhaTokenFactory.updateCommunityRewardSettings(accountDeployed, 1, peeranhaCommunity.address, 20, 2)).to.be.revertedWith('Community_token_contract_not_exist');
		});

		it("Test edit community token (community dont has any community tokens)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, peeranhaTokenFactory, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(accountDeployed, hashContainer[1]);
			await peeranhaCommunity.createCommunity(accountDeployed, ipfsHashes[0], createTags(5));

			await expect(peeranhaTokenFactory.updateCommunityRewardSettings(accountDeployed, 1, peeranhaCommunity.address, 20, 2)).to.be.revertedWith('Token_communityId_not_exist');
		});
	});

	describe("Get community reward", function () {

		it("Test get community reward", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, peeranhaTokenFactory, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(accountDeployed, ipfsHashes[0], createTags(5));
			await peeranhaTokenFactory.createNewCommunityToken(accountDeployed, 1, token.address, 100, 20);
			
			const ownerMintTokens = parseEther("10");
			await token.mint(ownerMintTokens);
			const addressLastCreatedContract = await peeranhaTokenFactory.getAddressLastCreatedContract(1)
			await token.transfer(addressLastCreatedContract, parseEther("10"));
	
			await peeranhaUser.addUserRating(signers[1].address, 5, 1);
			await wait(PeriodTime);
			await peeranhaUser.addUserRating(signers[1].address, 1, 1);
			await wait(PeriodTime);
	
			const rewardPeriods = await peeranhaUser.getActiveUserPeriods(signers[1].address);
			const ratingToReward = await peeranhaUser.getRatingToReward(signers[1].address, rewardPeriods[0], 1);
			expect(ratingToReward).to.equal(5);
	
			await peeranhaTokenFactory.setTotalPeriodRewards(rewardPeriods[0]);
			await peeranhaTokenFactory.connect(signers[1]).payCommunityRewards(signers[1].address, rewardPeriods[0]);
	
			const balance = await getBalance(token, signers[1].address);
			expect(balance).to.equal(5 * fraction);
		});

		it("Test get community reward (empty pool)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, peeranhaTokenFactory, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(accountDeployed, ipfsHashes[0], createTags(5));
			await peeranhaTokenFactory.createNewCommunityToken(accountDeployed, 1, token.address, 100, 20);

			await peeranhaUser.addUserRating(signers[1].address, 5, 1);
			await wait(PeriodTime);
			await peeranhaUser.addUserRating(signers[1].address, 1, 1);
			await wait(PeriodTime);
	
			const rewardPeriods = await peeranhaUser.getActiveUserPeriods(signers[1].address);
			const ratingToReward = await peeranhaUser.getRatingToReward(signers[1].address, rewardPeriods[0], 1);
			expect(ratingToReward).to.equal(5);
	
			await peeranhaTokenFactory.setTotalPeriodRewards(rewardPeriods[0]);
			await peeranhaTokenFactory.connect(signers[1]).payCommunityRewards(signers[1].address, rewardPeriods[0]);
	
			const balance = await getBalance(token, signers[1].address);
			expect(balance).to.equal(0);
		});

		it("Test double get community reward", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, peeranhaTokenFactory, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(accountDeployed, ipfsHashes[0], createTags(5));
			await peeranhaTokenFactory.createNewCommunityToken(accountDeployed, 1, token.address, 100, 20);

			const ownerMintTokens = parseEther("10");
			await token.mint(ownerMintTokens);
			const addressLastCreatedContract = await peeranhaTokenFactory.getAddressLastCreatedContract(1)
			await token.transfer(addressLastCreatedContract, parseEther("10"));

			await peeranhaUser.addUserRating(signers[1].address, 5, 1);
			await wait(PeriodTime);
			await peeranhaUser.addUserRating(signers[1].address, 1, 1);
			await wait(PeriodTime);

			const rewardPeriods = await peeranhaUser.getActiveUserPeriods(signers[1].address);
			const ratingToReward = await peeranhaUser.getRatingToReward(signers[1].address, rewardPeriods[0], 1);
			expect(ratingToReward).to.equal(5);

			await peeranhaTokenFactory.setTotalPeriodRewards(rewardPeriods[0]);
			await peeranhaTokenFactory.connect(signers[1]).payCommunityRewards(signers[1].address, rewardPeriods[0]);
			await expect(peeranhaTokenFactory.connect(signers[1]).payCommunityRewards(signers[1].address, rewardPeriods[0])).
				to.be.revertedWith('reward_already_picked_up.');
		});

		it("Test get community reward (not full poll)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, peeranhaTokenFactory, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(accountDeployed, ipfsHashes[0], createTags(5));
			await peeranhaTokenFactory.createNewCommunityToken(accountDeployed, 1, token.address, 100, 20);
			
			const ownerMintTokens = parseEther("10");
			await token.mint(ownerMintTokens);
			const addressLastCreatedContract = await peeranhaTokenFactory.getAddressLastCreatedContract(1)
			await token.transfer(addressLastCreatedContract, parseEther("1.2"));
	
			await peeranhaUser.addUserRating(signers[1].address, 5, 1);
			await wait(PeriodTime);
			await peeranhaUser.addUserRating(signers[1].address, 1, 1);
			await wait(PeriodTime);
	
			const rewardPeriods = await peeranhaUser.getActiveUserPeriods(signers[1].address);
			const ratingToReward = await peeranhaUser.getRatingToReward(signers[1].address, rewardPeriods[0], 1);
			expect(ratingToReward).to.equal(5);
	
			await peeranhaTokenFactory.setTotalPeriodRewards(rewardPeriods[0]);
			await peeranhaTokenFactory.connect(signers[1]).payCommunityRewards(signers[1].address, rewardPeriods[0]);
	
			const balance = await getBalance(token, signers[1].address);
			// console.log(fraction * 1.1) why 1100000000000000100 ??? 
			expect(balance).to.equal(fraction * 1.2);
		});

		it("Test get community reward (no active user)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, peeranhaTokenFactory, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(accountDeployed, ipfsHashes[0], createTags(5));
			await peeranhaTokenFactory.createNewCommunityToken(accountDeployed, 1, token.address, 100, 20);
			
			const ownerMintTokens = parseEther("10");
			await token.mint(ownerMintTokens);
			const addressLastCreatedContract = await peeranhaTokenFactory.getAddressLastCreatedContract(1)
			await token.transfer(addressLastCreatedContract, parseEther("10"));
	
			await peeranhaUser.addUserRating(signers[0].address, 5, 1);
			await wait(PeriodTime);
			await peeranhaUser.addUserRating(signers[0].address, 1, 1);
			await wait(PeriodTime);
	
			const rewardPeriods = await peeranhaUser.getActiveUserPeriods(signers[0].address);
			await peeranhaTokenFactory.setTotalPeriodRewards(rewardPeriods[0]);
			await peeranhaTokenFactory.connect(signers[1]).payCommunityRewards(signers[1].address, rewardPeriods[0]);
	
			const balance = await getBalance(token, signers[1].address);
			expect(balance).to.equal(0);
		});

		it("Test get community reward (active in another community)", async function () {
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
			expect(balance).to.equal(0);
		});
	});
});
