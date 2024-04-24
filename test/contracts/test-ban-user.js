const { expect } = require("chai");
const crypto = require("crypto");
const { ethers } = require("hardhat");
const { PostTypeEnum, LanguagesEnum, DefaultCommunityId, PROTOCOL_ADMIN_ROLE,
    createPeerenhaAndTokenContract, getIdsContainer, getHashesContainer, createTags, getHashContainer, getHash } = require('./utils');

describe("Test ban users", function() {
    beforeEach(async function () {
		const contracts = await createPeerenhaAndTokenContract();
		peeranhaContent = contracts.peeranhaContent;
		peeranhaUser = contracts.peeranhaUser;
		peeranhaCommunity = contracts.peeranhaCommunity;
		token = contracts.token;
		peeranhaNFT = contracts.peeranhaNFT;
		accountDeployed = contracts.accountDeployed;
		signers = await ethers.getSigners();
		ipfsHashes = getHashesContainer(5);
		hashContainer = getHashContainer();
        countOfCommunities = 3;
        communitiesIds = getIdsContainer(countOfCommunities);

		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
        await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
		await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
	});

    describe("Test actions", function() {
    
        it("Test ban user", async function() {
            await peeranhaUser.banUser(signers[0].address, signers[1].address);
            expect(await peeranhaUser.isBanedUser(signers[1].address, 1)).to.equal(true);
        });

        it("Test unBan user", async function() {
            await peeranhaUser.banUser(signers[0].address, signers[1].address);
            await peeranhaUser.unBanUser(signers[0].address, signers[1].address);
            expect(await peeranhaUser.isBanedUser(signers[1].address, 1)).to.equal(false);
        });

        it("Test unBan not bunned user", async function() {
			await expect(peeranhaUser.unBanUser(signers[0].address, signers[1].address)).to.be.revertedWith('User_is_not_banned');
        });

        it("Test ban community user", async function() {
            await peeranhaUser.banCommunityUser(signers[0].address, signers[1].address, 1);
            expect(await peeranhaUser.isBanedUser(signers[1].address, 1)).to.equal(true);
        });

        it("Test unBan community user", async function() {
            await peeranhaUser.banCommunityUser(signers[0].address, signers[1].address, 1);
            await peeranhaUser.unBanCommunityUser(signers[0].address, signers[1].address, 1);
            expect(await peeranhaUser.isBanedUser(signers[1].address, 1)).to.equal(false);
        });

        it("Test unBan not bunned community user", async function() {
			await expect(peeranhaUser.unBanCommunityUser(signers[0].address, signers[1].address, 1)).to.be.revertedWith('User_is_not_banned');
        });

        it("Test ban and community ban user", async function() {
            await peeranhaUser.banCommunityUser(signers[0].address, signers[1].address, 1);
            await peeranhaUser.banUser(signers[0].address, signers[1].address);
            expect(await peeranhaUser.isBanedUser(signers[1].address, 1)).to.equal(true);
        });

        it("Test only unban user", async function() {
            await peeranhaUser.banCommunityUser(signers[0].address, signers[1].address, 1);
            await peeranhaUser.banUser(signers[0].address, signers[1].address);
            await peeranhaUser.unBanUser(signers[0].address, signers[1].address);
            expect(await peeranhaUser.isBanedUser(signers[1].address, 1)).to.equal(true);
        });

        it("Test only unban community user", async function() {
            await peeranhaUser.banCommunityUser(signers[0].address, signers[1].address, 1);
            await peeranhaUser.banUser(signers[0].address, signers[1].address);
            await peeranhaUser.unBanCommunityUser(signers[0].address, signers[1].address, 1);
            expect(await peeranhaUser.isBanedUser(signers[1].address, 1)).to.equal(true);
        });
    });

    describe("Test global ban", function() {
    
        it("Test ban for protocol admin", async function() {
            await peeranhaUser.grantRole(PROTOCOL_ADMIN_ROLE, signers[1].address);
			await expect(peeranhaUser.banUser(signers[0].address, signers[1].address)).to.be.revertedWith('You_can_not_ban_admin');
        });

        it("Test ban for community admin", async function() {
            await await peeranhaUser.giveCommunityAdminPermission(signers[0].address, signers[1].address, 1);
			await peeranhaUser.banUser(signers[0].address, signers[1].address);
            expect(await peeranhaUser.isBanedUser(signers[1].address, 1)).to.equal(true);
        });

        it("Test ban for community moderator", async function() {
            await await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[1].address, 1);
			await peeranhaUser.banUser(signers[0].address, signers[1].address);
            expect(await peeranhaUser.isBanedUser(signers[1].address, 1)).to.equal(true);
        });

        it("Test double ban user", async function() {
            await peeranhaUser.banUser(signers[0].address, signers[1].address);
            await expect(peeranhaUser.banUser(signers[0].address, signers[1].address)).to.be.revertedWith('Already_banned')
        });


        it("Test unban for community admin", async function() {
            await await peeranhaUser.giveCommunityAdminPermission(signers[0].address, signers[1].address, 1);
			await peeranhaUser.banUser(signers[0].address, signers[1].address);
            await peeranhaUser.unBanUser(signers[0].address, signers[1].address);
            expect(await peeranhaUser.isBanedUser(signers[1].address, 1)).to.equal(false);
        });

        it("Test unban for community moderator", async function() {
            await await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[1].address, 1);
			await peeranhaUser.banUser(signers[0].address, signers[1].address);
            await peeranhaUser.unBanUser(signers[0].address, signers[1].address);
            expect(await peeranhaUser.isBanedUser(signers[1].address, 1)).to.equal(false);
        });
    });

    describe("Test community ban", function() {
    
        it("Test community ban for protocol admin", async function() {
            await peeranhaUser.grantRole(PROTOCOL_ADMIN_ROLE, signers[1].address);
			await expect(peeranhaUser.banCommunityUser(signers[0].address, signers[1].address, 1)).to.be.revertedWith('You_can_not_ban_admin_communityAdmin_or_communityModerator');
        });

        it("Test community ban for community admin", async function() {
            await await peeranhaUser.giveCommunityAdminPermission(signers[0].address, signers[1].address, 1);
			await expect(peeranhaUser.banCommunityUser(signers[0].address, signers[1].address, 1)).to.be.revertedWith('You_can_not_ban_admin_communityAdmin_or_communityModerator');
        });

        it("Test community ban for community moderator", async function() {
            await await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[1].address, 1);
			await expect(peeranhaUser.banCommunityUser(signers[0].address, signers[1].address, 1)).to.be.revertedWith('You_can_not_ban_admin_communityAdmin_or_communityModerator');
        });

        it("Test double community ban user", async function() {
            await peeranhaUser.banCommunityUser(signers[0].address, signers[1].address, 1);
            await expect(peeranhaUser.banCommunityUser(signers[0].address, signers[1].address, 1)).to.be.revertedWith('Already_banned')
        });
    });
});