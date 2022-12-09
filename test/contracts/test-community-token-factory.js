const { expect } = require("chai");
const { parseEther }  = require("ethers/lib/utils");
const {
	wait, getBalance, availableBalanceOf, getInt, createPeerenhaAndTokenContract, getHashContainer, periodRewardCoefficient , PeriodTime, fraction, ratingChanges,
} = require('./utils');


describe("Test community token factory", function () {

	describe("Community token", function () {

		it("Test create community token", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed, peeranhaTokenFactory } = await createPeerenhaAndTokenContract();
			
			await peeranhaTokenFactory.createNewCommunityToken(5, token.address, 100, 100);
			console.log(await peeranhaTokenFactory.getAddressLastCreatedContract(5));
			console.log(await peeranhaTokenFactory.getCommunityToken(5, await peeranhaTokenFactory.getAddressLastCreatedContract(5)));
			// console.log(await peeranhaTokenFactory.getCommunityTokenn());
		})
	})
});
