const { expect } = require("chai");
const crypto = require("crypto");
const { ethers } = require("hardhat");
const { PostTypeEnum, createPeerenhaAndTokenContract, getIdsContainer, getHashesContainer, createTags, getHashContainer, getHash, DefaultCommunityId, PROTOCOL_ADMIN_ROLE } = require('./utils');

describe("Test community token", function() {
    it("Test create new community token", async function() {
        const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed, peeranhaTokenFactory } = await createPeerenhaAndTokenContract();
        const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();
        const countOfCommunities = 3;
        // const countOfUsers = 3;
        const communitiesIds = getIdsContainer(countOfCommunities);
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
        await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
        await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
        await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

        await expect(peeranhaTokenFactory.connect(signers[1]).createNewCommunityToken(signers[1].address, 1, token.address, 100, 20)).to.be.revertedWith('Community is frozen');

        // await peeranhaUser.grantRole(PROTOCOL_ADMIN_ROLE, signers[1].address);        
    });
});