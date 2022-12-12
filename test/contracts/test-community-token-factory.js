const { expect } = require("chai");
const { parseEther }  = require("ethers/lib/utils");
const { 
	wait, createPeerenhaAndTokenContract, registerTwoUsers, createUserWithAnotherRating, getHashContainer, getHashesContainer, createTags, getIdsContainer,
	PostTypeEnum, StartRating, StartRatingWithoutAction, deleteTime, DeleteOwnReply, QuickReplyTime,
    DownvoteExpertPost, UpvotedExpertPost, DownvotedExpertPost, DownvoteCommonPost, UpvotedCommonPost, DownvotedCommonPost,
    ModeratorDeletePost, DownvoteExpertReply, UpvotedExpertReply, DownvotedExpertReply, AcceptExpertReply, AcceptedExpertReply, 
    FirstExpertReply, QuickExpertReply, DownvoteCommonReply, UpvotedCommonReply, DownvotedCommonReply, AcceptCommonReply,
    AcceptedCommonReply, FirstCommonReply, QuickCommonReply, ModeratorDeleteReply, ModeratorDeleteComment,
	DownvoteTutorial, UpvotedTutorial, DownvotedTutorial, DeleteOwnPost, DefaultCommunityId
} = require('./utils');

describe("Test community token factory", function () {

	describe("Community token", function () {

		it("Test create community token", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, peeranhaTokenFactory, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(accountDeployed, hashContainer[1]);
			await peeranhaCommunity.createCommunity(accountDeployed, ipfsHashes[0], createTags(5));

			await peeranhaTokenFactory.createNewCommunityToken(1, token.address, 100, 20);
			const communityContract = await peeranhaTokenFactory.getCommunityToken(1, await peeranhaTokenFactory.getAddressLastCreatedContract(1));

			expect(communityContract).to.have.ownPropertyDescriptor('name');
			expect(communityContract).to.have.ownPropertyDescriptor('symbol');
			expect(communityContract).to.have.ownPropertyDescriptor('contractAddress');
			expect(communityContract).to.have.ownPropertyDescriptor('maxRewardPerPeriod');
			expect(communityContract).to.have.ownPropertyDescriptor('activeUsersInPeriod');
			expect(communityContract).to.have.ownPropertyDescriptor('maxRewardPerUser');
			expect(communityContract).to.have.ownPropertyDescriptor('sumSpentTokens');
			expect(communityContract).to.have.ownPropertyDescriptor('createTime');
			expect(communityContract).to.have.ownPropertyDescriptor('peeranhaCommunityTokenFactoryAddress');

			expect(communityContract.name).to.equal(await token.name());
			expect(communityContract.symbol).to.equal(await token.symbol());
			expect(communityContract.contractAddress).to.equal(token.address);
			expect(communityContract.maxRewardPerPeriod).to.equal(100);
			expect(communityContract.activeUsersInPeriod).to.equal(20);
			expect(communityContract.maxRewardPerUser).to.equal(5);
			expect(communityContract.sumSpentTokens).to.equal(0);
			// expect(communityContract.createTime).to.equal();
			expect(communityContract.peeranhaCommunityTokenFactoryAddress).to.equal(peeranhaTokenFactory.address);
		});

		it("Test create community token (community does not exist)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, peeranhaTokenFactory, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(accountDeployed, hashContainer[1]);
			await expect(peeranhaTokenFactory.createNewCommunityToken(1, token.address, 100, 20)).to.be.revertedWith('Community does not exist');
		});

		it("Test create community token", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, peeranhaTokenFactory, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(accountDeployed, hashContainer[1]);
			await peeranhaCommunity.createCommunity(accountDeployed, ipfsHashes[0], createTags(5));
			await peeranhaCommunity.freezeCommunity(accountDeployed, 1);

			await expect(peeranhaTokenFactory.createNewCommunityToken(1, token.address, 100, 20)).to.be.revertedWith('Community is frozen');
		});

		it("Test edit community token", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, peeranhaTokenFactory, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(accountDeployed, hashContainer[1]);
			await peeranhaCommunity.createCommunity(accountDeployed, ipfsHashes[0], createTags(5));

			await peeranhaTokenFactory.createNewCommunityToken(1, token.address, 100, 20);
			await peeranhaTokenFactory.updateCommunityRewardSettings(1, await peeranhaTokenFactory.getAddressLastCreatedContract(1), 20, 2);
			const communityContract = await peeranhaTokenFactory.getCommunityToken(1, await peeranhaTokenFactory.getAddressLastCreatedContract(1));

			expect(communityContract.name).to.equal(await token.name());
			expect(communityContract.symbol).to.equal(await token.symbol());
			expect(communityContract.contractAddress).to.equal(token.address);
			expect(communityContract.maxRewardPerPeriod).to.equal(20);
			expect(communityContract.activeUsersInPeriod).to.equal(2);
			expect(communityContract.maxRewardPerUser).to.equal(10);
			expect(communityContract.sumSpentTokens).to.equal(0);
			// expect(communityContract.createTime).to.equal();
			expect(communityContract.peeranhaCommunityTokenFactoryAddress).to.equal(peeranhaTokenFactory.address);
		});

		it("Test edit not exist community token", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, peeranhaTokenFactory, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(accountDeployed, hashContainer[1]);
			await peeranhaCommunity.createCommunity(accountDeployed, ipfsHashes[0], createTags(5));

			await peeranhaTokenFactory.createNewCommunityToken(1, token.address, 100, 20);
			await expect(peeranhaTokenFactory.updateCommunityRewardSettings(1, peeranhaCommunity.address, 20, 2)).to.be.revertedWith('Community_token_contract_not_exist');
		});

		it("Test edit community token (community dont has any community tokens)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, peeranhaTokenFactory, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(accountDeployed, hashContainer[1]);
			await peeranhaCommunity.createCommunity(accountDeployed, ipfsHashes[0], createTags(5));

			await expect(peeranhaTokenFactory.updateCommunityRewardSettings(1, peeranhaCommunity.address, 20, 2)).to.be.revertedWith('Token_communityId_not_exist');
		});
	})
});
