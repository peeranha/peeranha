const { expect } = require("chai");
const { parseEther }  = require("ethers/lib/utils");
const {
	wait, getBalance, availableBalanceOf, getInt, createPeerenhaAndTokenContract, getHashContainer, periodRewardCoefficient , PeriodTime, fraction, ratingChanges,
} = require('./utils');


describe("Test community token factory", function () {

	describe("...............", function () {

		it("..........", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed, peeranhaTokenFactoryAddress } = await createPeerenhaAndTokenContract();
			
		})
	})
});
