const { expect } = require("chai");
const crypto = require("crypto");
const { ethers } = require("hardhat");
const { PostTypeEnum, LanguagesEnum, DefaultCommunityId, PROTOCOL_ADMIN_ROLE,
    createPeerenhaAndTokenContract, getIdsContainer, getHashesContainer, createTags, getHashContainer, getHash } = require('./utils');

describe("Test community permissions", function() {
    it("Test community moderator", async function() {
        const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
        const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();
        const countOfCommunities = 3;
        // const countOfUsers = 3;
        const communitiesIds = getIdsContainer(countOfCommunities);

        await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
        await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

        await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);
        await peeranhaContent.updateDocumentationTree(signers[0].address, 1, hashContainer[0])

        // Give Moderator permission for non-existing user or community
        await expect(peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[1].address, 4))
        .to.be.revertedWith("Community does not exist");
        await expect(peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[4].address, communitiesIds[0]))
        .to.be.revertedWith("user_not_found");
        await expect(peeranhaUser.revokeCommunityModeratorPermission(signers[0].address, signers[1].address, 4))
        .to.be.revertedWith("Community does not exist");
        // await expect(peeranhaUser.revokeCommunityModeratorPermission(signers[0].address, signers[4].address, communitiesIds[0]))
        // .to.be.revertedWith("user_not_found");

        // User makes actions without Moderator permission
        await expect(peeranhaCommunity.connect(signers[1]).createCommunity(signers[1].address, hashContainer[0], createTags(5)))
            .to.be.revertedWith("not_allowed_not_admin");
        await expect(peeranhaCommunity.connect(signers[1]).updateCommunity(signers[1].address, communitiesIds[0], getHash()))
            .to.be.revertedWith("not_allowed_admin_or_comm_admin");
        await expect(peeranhaContent.connect(signers[1]).updateDocumentationTree(signers[1].address, 1, hashContainer[1]))
			.to.be.revertedWith('not_allowed_not_comm_admin');

        // User makes actions with Moderator permission
        await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[1].address, communitiesIds[0]);
        await expect(peeranhaCommunity.connect(signers[1]).createCommunity(signers[1].address, hashContainer[0], createTags(5)))
            .to.be.revertedWith("not_allowed_not_admin");
        await expect(peeranhaCommunity.connect(signers[1]).updateCommunity(signers[1].address, communitiesIds[0], getHash()))
        .to.be.revertedWith("not_allowed_admin_or_comm_admin");
        await expect(peeranhaCommunity.connect(signers[1]).freezeCommunity(signers[1].address, communitiesIds[0]))
        .to.be.revertedWith("not_allowed_admin_or_comm_admin");
        await expect(peeranhaCommunity.connect(signers[1]).unfreezeCommunity(signers[1].address, communitiesIds[0]))
        .to.be.revertedWith("not_allowed_admin_or_comm_admin");

        //post actions
        await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
        await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)    // edit Post Type exprt -> common
        await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[1], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)).    // com moder change ipfs
            to.be.revertedWith("Not_allowed_edit_not_author");
        await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 2, PostTypeEnum.CommonPost, LanguagesEnum.English)).
            to.be.revertedWith("Error_change_communityId");
        await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.CommonPost, LanguagesEnum.English);
        await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)).
            to.be.revertedWith("Error_change_communityId");
        await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)
        await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], true, LanguagesEnum.English);    // official Reply
        await peeranhaContent.connect(signers[1]).editReply(signers[1].address, 1, 1, hashContainer[1], true, LanguagesEnum.English)       // official Reply
        //change status best reply
        await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
        await expect(peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1))
            .to.be.revertedWith('Only owner by post can change statust best reply');

        // User with Moderator permission gives permission
        await expect(peeranhaUser.connect(signers[1]).giveCommunityAdminPermission(signers[1].address, signers[2].address, communitiesIds[0]))
            .to.be.revertedWith('not_allowed_admin_or_comm_admin');
        await expect(peeranhaUser.connect(signers[1]).revokeCommunityAdminPermission(signers[1].address, signers[2].address, communitiesIds[0]))
            .to.be.revertedWith('not_allowed_admin_or_comm_admin');
        await expect(peeranhaUser.connect(signers[1]).giveCommunityModeratorPermission(signers[1].address, signers[2].address, communitiesIds[0]))
            .to.be.revertedWith('not_allowed_admin_or_comm_admin');
        await expect(peeranhaUser.connect(signers[1]).revokeCommunityModeratorPermission(signers[1].address, signers[2].address, communitiesIds[0]))
            .to.be.revertedWith('not_allowed_admin_or_comm_admin');
        await expect(peeranhaUser.connect(signers[1]).grantRole(PROTOCOL_ADMIN_ROLE, signers[2].address))
            .to.be.revertedWith("AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000");
        await expect(peeranhaUser.connect(signers[1]).revokeRole(PROTOCOL_ADMIN_ROLE, signers[2].address))
            .to.be.revertedWith("AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000");

        // Revoke Moderator permission
        await peeranhaUser.revokeCommunityModeratorPermission(signers[0].address, signers[1].address, communitiesIds[0]);
        await expect(peeranhaCommunity.connect(signers[1]).createCommunity(signers[1].address, hashContainer[0], createTags(5)))
            .to.be.revertedWith("not_allowed_not_admin");
        await expect(peeranhaCommunity.connect(signers[1]).updateCommunity(signers[1].address, communitiesIds[0], getHash()))
            .to.be.revertedWith("not_allowed_admin_or_comm_admin");
        await expect(peeranhaContent.connect(signers[1]).updateDocumentationTree(signers[1].address, 1, hashContainer[1]))
			.to.be.revertedWith('not_allowed_not_comm_admin');
        await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
        await expect(peeranhaContent.connect(signers[1]).createReply(signers[1].address, 2, 0, hashContainer[1], true, LanguagesEnum.English)) // official reply
                .to.be.revertedWith("not_allowed_not_comm_admin");
        await expect(peeranhaContent.connect(signers[1]).editReply(signers[1].address, 1, 1, hashContainer[1], true, LanguagesEnum.English))   // old official Reply and stay official 
            .to.be.revertedWith("not_allowed_not_comm_admin");
        await peeranhaContent.connect(signers[1]).editReply(signers[1].address, 1, 1, hashContainer[1], false, LanguagesEnum.English)           // common Reply

        // User makes actions with community admin permission
        await peeranhaUser.giveCommunityAdminPermission(signers[0].address, signers[1].address, communitiesIds[0]);
        await expect(peeranhaCommunity.connect(signers[1]).updateCommunity(signers[1].address, communitiesIds[0], getHash()));
        await expect(peeranhaCommunity.connect(signers[1]).freezeCommunity(signers[1].address, communitiesIds[0]));
        await expect(peeranhaCommunity.connect(signers[1]).unfreezeCommunity(signers[1].address, communitiesIds[0]));
    });

    it("Test community administrator", async function() {
        const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
        const signers = await ethers.getSigners();
        const countOfCommunities = 3;
        // const countOfUsers = 3;
        const communitiesIds = getIdsContainer(countOfCommunities);
		const hashContainer = getHashContainer();

		await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
		await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
		await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
        await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

        // Give Admin permission for non-existing user or community
        await expect(peeranhaUser.giveCommunityAdminPermission(signers[0].address, signers[1].address, 4))
            .to.be.revertedWith("Community does not exist");
        await expect(peeranhaUser.giveCommunityAdminPermission(signers[0].address, signers[4].address, communitiesIds[0]))
            .to.be.revertedWith("user_not_found");
        // await expect(peeranhaUser.revokeCommunityAdminPermission(signers[0].address, (signers[1].address), 4))
        //     .to.be.revertedWith("Community does not exist");
        // await expect(peeranhaUser.revokeCommunityAdminPermission(signers[0].address, signers[4].address, communitiesIds[0]))
        //     .to.be.revertedWith("user_not_found");

        // User makes actions without Admin permission
        await expect(peeranhaUser.connect(signers[1]).giveCommunityModeratorPermission(signers[1].address, signers[2].address, communitiesIds[0]))
            .to.be.revertedWith("not_allowed_admin_or_comm_admin");
        await expect(peeranhaCommunity.connect(signers[1]).updateCommunity(signers[1].address, communitiesIds[0], getHash()))
            .to.be.revertedWith("not_allowed_admin_or_comm_admin");

        await peeranhaUser.giveCommunityAdminPermission(signers[0].address, signers[1].address, communitiesIds[0]);
        await peeranhaUser.revokeCommunityModeratorPermission(signers[0].address, signers[1].address, communitiesIds[0]);
        
        // User makes actions with Admin permission
        await peeranhaCommunity.connect(signers[1]).updateCommunity(signers[1].address, communitiesIds[0], getHash());
        await peeranhaCommunity.connect(signers[1]).freezeCommunity(signers[1].address, communitiesIds[0]);
        await expect(peeranhaCommunity.connect(signers[1]).updateCommunity(signers[1].address, communitiesIds[0], getHash()))
            .to.be.revertedWith("Community is frozen");
        await peeranhaCommunity.connect(signers[1]).unfreezeCommunity(signers[1].address, communitiesIds[0]);
        await peeranhaCommunity.connect(signers[1]).updateCommunity(signers[1].address, communitiesIds[0], getHash());
        await peeranhaContent.connect(signers[1]).updateDocumentationTree(signers[1].address, 1, hashContainer[1]);
        
        // Post actions
        await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
        await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
        await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
        await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)).    // edit Post Type exprt -> common
            to.be.revertedWith("not_allowed_admin_or_comm_moderator");
        await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[1], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)).    // com moder change ipfs
            to.be.revertedWith("Not_allowed_edit_not_author");
        await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English)).
            to.be.revertedWith("Error_change_communityId");
        await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost, LanguagesEnum.English)).
            to.be.revertedWith("not_allowed_admin_or_comm_moderator");
        await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], true, LanguagesEnum.English);    // official Reply
        await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 2, 0, hashContainer[1], false, LanguagesEnum.English);           // common reply
        await peeranhaContent.connect(signers[1]).editReply(signers[1].address, 2, 1, hashContainer[1], true, LanguagesEnum.English);      // official Reply

        // change status Best Reply
        await expect(peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1))
            .to.be.revertedWith('Only owner by post can change statust best reply');

        // User with Admin permission makes actions for other community
        await expect(peeranhaCommunity.connect(signers[1]).updateCommunity(signers[1].address, communitiesIds[1], getHash()))
        .to.be.revertedWith("not_allowed_admin_or_comm_admin");
        await expect(peeranhaCommunity.connect(signers[1]).freezeCommunity(signers[1].address, communitiesIds[1]))
        .to.be.revertedWith("not_allowed_admin_or_comm_admin");
        await expect(peeranhaCommunity.connect(signers[1]).unfreezeCommunity(signers[1].address, communitiesIds[1]))
        .to.be.revertedWith("not_allowed_admin_or_comm_admin");
        await expect(peeranhaContent.connect(signers[1]).updateDocumentationTree(signers[1].address, communitiesIds[1], hashContainer[1]))
            .to.be.revertedWith("not_allowed_not_comm_admin");

        //User with Admin permission gives Moderator permission
        await peeranhaUser.connect(signers[1]).giveCommunityModeratorPermission(signers[1].address, signers[2].address, communitiesIds[0]);
        await expect(peeranhaCommunity.connect(signers[2]).updateCommunity(signers[2].address, communitiesIds[0], getHash()))
            .to.be.revertedWith("not_allowed_admin_or_comm_admin");
        await expect(peeranhaCommunity.connect(signers[2]).freezeCommunity(signers[2].address, communitiesIds[0]))
            .to.be.revertedWith("not_allowed_admin_or_comm_admin");
        await expect(peeranhaCommunity.connect(signers[2]).unfreezeCommunity(signers[2].address, communitiesIds[0]))
            .to.be.revertedWith("not_allowed_admin_or_comm_admin");

        await peeranhaUser.connect(signers[1]).revokeCommunityModeratorPermission(signers[1].address, signers[2].address, communitiesIds[0]);
        await expect(peeranhaCommunity.connect(signers[2]).updateCommunity(signers[2].address, communitiesIds[0], getHash()))
            .to.be.revertedWith("not_allowed_admin_or_comm_admin");

        // User with Community Admin permission gives/revoke Admin permission for other user
        await peeranhaUser.connect(signers[1]).giveCommunityAdminPermission(signers[1].address, signers[2].address, communitiesIds[0]);
        await peeranhaUser.connect(signers[1]).revokeCommunityAdminPermission(signers[1].address, signers[2].address, communitiesIds[0]);
        // User with Community Admin permission gives/revoke Admin permission for himself
        await expect(peeranhaUser.connect(signers[1]).revokeCommunityAdminPermission(signers[1].address, signers[1].address, communitiesIds[0]))
            .to.be.revertedWith("self_revoke");

        //User with Community Admin permission gives Admin permission for other community
        await expect(peeranhaUser.connect(signers[1]).giveCommunityAdminPermission(signers[1].address, signers[1].address, communitiesIds[1]))
            .to.be.revertedWith("not_allowed_admin_or_comm_admin");
        await expect(peeranhaUser.connect(signers[1]).giveCommunityAdminPermission(signers[1].address, signers[2].address, communitiesIds[1]))
            .to.be.revertedWith("not_allowed_admin_or_comm_admin");

        //Revoke Community Admin permission
        await peeranhaUser.revokeCommunityModeratorPermission(signers[0].address, signers[1].address, communitiesIds[0]);
        await peeranhaUser.revokeCommunityModeratorPermission(signers[0].address, signers[2].address, communitiesIds[0]);
        await peeranhaUser.revokeCommunityAdminPermission(signers[0].address, signers[1].address, communitiesIds[0]);
        await peeranhaUser.revokeCommunityAdminPermission(signers[0].address, signers[2].address, communitiesIds[0]);
        await expect(peeranhaCommunity.connect(signers[1]).updateCommunity(signers[1].address, communitiesIds[0], getHash()))
            .to.be.revertedWith("not_allowed_admin_or_comm_admin");
        await expect(peeranhaCommunity.connect(signers[2]).updateCommunity(signers[2].address, communitiesIds[0], getHash()))
            .to.be.revertedWith("not_allowed_admin_or_comm_admin");
        await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
        await expect(peeranhaContent.connect(signers[1]).createReply(signers[1].address, 3, 0, hashContainer[1], true, LanguagesEnum.English))           // official reply
            .to.be.revertedWith("not_allowed_not_comm_admin");
        await expect(peeranhaContent.connect(signers[1]).editReply(signers[1].address, 1, 1, hashContainer[1], true, LanguagesEnum.English))   //old official Reply and stay official
            .to.be.revertedWith("not_allowed_not_comm_admin");
    });

    // Send admin invite functionality must be created before
    xit("Test grant before creating community", async function() {
        const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
        const signers = await ethers.getSigners();
        const hashContainer = getHashContainer();
        const countOfCommunities = 3;
        // const countOfUsers = 3;
        const communitiesIds = getIdsContainer(countOfCommunities);
        // await ceateUsers(peeranha, signers, countOfUsers);
        await peeranhaUser.createUser(signers[0].address, hashContainer[0]);

		await peeranha.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
        

        await expect (peeranha.connect(signers[1]).createCommunity(getHash(), createTags(5)))
        .to.revertedWith('Peeranha: must have admin role');

        peeranhaCommunity.createCommunity(signers[0].address, getHash(), createTags(5));
        await expect (peeranha.connect(signers[1]).updateCommunity(signers[1].address, communitiesIds[0], getHash()))
        .to.revertedWith('not_allowed_admin_or_comm_moderator');
        await expect (peeranha.connect(signers[1]).freezeCommunity(signers[1].address, communitiesIds[0]))
        .to.revertedWith('Peeranha: must have admin role');
        await expect (peeranha.connect(signers[1]).unfreezeCommunity(signers[1].address, communitiesIds[0]))
        .to.revertedWith('Peeranha: must have admin role');

        await peeranhaUser.giveCommunityAdminPermission(signers[0].address, signers[1].address, communitiesIds[0]);

        const communityCount = await peeranha.getCommunitiesCount();
        await peeranha.connect(signers[1]).createCommunity(getHash(), createTags(5));
        await expect(peeranha.getCommunitiesCount()).to.be.greaterThan(communityCount);

        await peeranha.connect(signers[1]).updateCommunity(signers[1].address, communitiesIds[1], getHash());

        // await peeranha.connect(signers[1]).giveCommunityModeratorPermission(signers[1].address, signers[2].address, communitiesIds[0]);
        // // console.log(await peeranha.getUserPermissions(signers[2].address))
        // // await peeranha.connect(signers[2]).updateCommunity(signers[2].address, communitiesIds[0], getHash());
        // await peeranha.connect(signers[1]).revokeCommunityModeratorPermission(signers[1].address, signers[2].address, communitiesIds[0]);
        // // await expect(peeranha.connect(signers[2]).updateCommunity(signers[2].address, communitiesIds[0], getHash()))
        // // .to.be.revertedWith("not_allowed_not_comm_admin");

        // peeranha.revokeCommunityModeratorPermission(signers[0].address, (signers[1].address), communitiesIds[0]);
        // peeranha.revokeCommunityAdminPermission(signers[0].address, (signers[1].address), communitiesIds[0]);

        // await expect(peeranha.connect(signers[1]).updateCommunity(signers[1].address, communitiesIds[0], getHash()))
        // .to.be.revertedWith("not_allowed_not_comm_admin");
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

    // const ceateUsers = async (peeranha, signers, countOfUsers) => {
    //     const hashContainer = getHashesContainer(countOfUsers);
    //     await Promise.all(hashContainer.map(
    //         async (hash, index) => {
    //           return await  peeranha.connect(signers[index]).createUser(signers[index].address, hash)
    //         }
    //       ))
    //     }
});