const { expect } = require("chai");
const crypto = require("crypto");
const { ethers } = require("hardhat");
const { createContract, getIdsContainer, getHashesContainer, createTags, getHashContainer, getHash } = require('./utils');

describe("Test community permissions", function() {
    it("Test community moderator", async function() {
        const peeranha = await createContract();
        const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();
        const countOfCommunities = 3;
        // const countOfUsers = 3;
        const communitiesIds = getIdsContainer(countOfCommunities);
        // await ceateUsers(peeranha, signers, countOfUsers);

        let user = signers[1];
        const userAddress = user.address;
        await peeranha.connect(signers[2]).createUser(hashContainer[0]);
        await peeranha.connect(user).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

        await createCommunities(peeranha, countOfCommunities, communitiesIds);

        // Give Moderator permission for non-existing user or community
        await expect(peeranha.giveCommunityModeratorPermission(userAddress, 4))
        .to.be.revertedWith("Community does not exist");
        await expect(peeranha.giveCommunityModeratorPermission(signers[4].address, communitiesIds[0]))
        .to.be.revertedWith("Peeranha: must be an existing user");
        await expect(peeranha.revokeCommunityModeratorPermission(userAddress, 4))
        .to.be.revertedWith("Community does not exist");
        await expect(peeranha.revokeCommunityModeratorPermission(signers[4].address, communitiesIds[0]))
        .to.be.revertedWith("Peeranha: must be an existing user");

        // User makes actions without Moderator permission
        await expect(peeranha.connect(user).updateCommunity(communitiesIds[0], getHash()))
        .to.be.revertedWith("not_allowed_admin_or_comm_admin");

        // // User makes actions with Moderator permission
        await peeranha.giveCommunityModeratorPermission(userAddress, communitiesIds[0]);
        await peeranha.connect(user).updateCommunity(communitiesIds[0], getHash());
        await expect(peeranha.connect(user).updateCommunity(communitiesIds[1], getHash()))
        .to.be.revertedWith("not_allowed_admin_or_comm_admin");
        await expect(peeranha.connect(user).freezeCommunity(communitiesIds[0]))
        .to.be.revertedWith("not_allowed_admin_or_comm_admin");
        await expect(peeranha.connect(user).unfreezeCommunity(communitiesIds[0]))
        .to.be.revertedWith("not_allowed_admin_or_comm_admin");

        // //User with Moderator permission gives Moderator permission
        await expect(peeranha.connect(user).giveCommunityModeratorPermission(signers[2].address, communitiesIds[0]))
        .to.be.revertedWith('not_allowed_not_comm_admin');
        await peeranha.giveCommunityModeratorPermission(signers[2].address, communitiesIds[0]);
        await expect(peeranha.connect(user).revokeCommunityModeratorPermission(userAddress, communitiesIds[0]))
        .to.be.revertedWith('not_allowed_not_comm_admin');

        // //Revoke Moderator permission
        await peeranha.revokeCommunityModeratorPermission(userAddress, communitiesIds[0]);
        await expect(peeranha.connect(user).updateCommunity(communitiesIds[0], getHash()))
        .to.be.revertedWith("not_allowed_admin_or_comm_admin");
    });

    it("Test community administrator", async function() {
        const peeranha = await createContract();
        const signers = await ethers.getSigners();
        const countOfCommunities = 3;
        // const countOfUsers = 3;
        const communitiesIds = getIdsContainer(countOfCommunities);
		const hashContainer = getHashContainer();
        // await ceateUsers(peeranha, signers, countOfUsers);

        let user = signers[1];
        const userAddress = user.address;
		await peeranha.connect(user).createUser(hashContainer[0]);
		await peeranha.connect(signers[2]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);
        await createCommunities(peeranha, countOfCommunities, communitiesIds);

        // Give Admin permission for non-existing user or community
        await expect(peeranha.giveCommunityAdminPermission(userAddress, 4))
        .to.be.revertedWith("Community does not exist");
        await expect(peeranha.giveCommunityAdminPermission(signers[4].address, communitiesIds[0]))
        .to.be.revertedWith("Peeranha: must be an existing user");
        await expect(peeranha.revokeCommunityAdminPermission(userAddress, 4))
        .to.be.revertedWith("Community does not exist");
        await expect(peeranha.revokeCommunityAdminPermission(signers[4].address, communitiesIds[0]))
        .to.be.revertedWith("Peeranha: must be an existing user");

        // User makes actions without Admin permission
        await expect(peeranha.connect(user).giveCommunityModeratorPermission(signers[2].address, communitiesIds[0]))
        .to.be.revertedWith("not_allowed_not_comm_admin");
        await expect(peeranha.connect(user).updateCommunity(communitiesIds[0], getHash()))
        .to.be.revertedWith("not_allowed_admin_or_comm_admin");

        await peeranha.giveCommunityAdminPermission(userAddress, communitiesIds[0]);
        
        // User makes actions with Admin permission
        await peeranha.connect(user).updateCommunity(communitiesIds[0], getHash());
        await peeranha.connect(user).freezeCommunity(communitiesIds[0]);
        await expect(peeranha.connect(user).updateCommunity(communitiesIds[0], getHash()))
        .to.be.revertedWith("Community is frozen");
        await peeranha.connect(user).unfreezeCommunity(communitiesIds[0]);
        await peeranha.connect(user).updateCommunity(communitiesIds[0], getHash());

        //// User with Admin permission makes actions for other community
        await expect(peeranha.connect(user).updateCommunity(communitiesIds[1], getHash()))
        .to.be.revertedWith("not_allowed_admin_or_comm_admin");
        await expect(peeranha.connect(user).freezeCommunity(communitiesIds[1]))
        .to.be.revertedWith("not_allowed_admin_or_comm_admin");
        await expect(peeranha.connect(user).unfreezeCommunity(communitiesIds[1]))
        .to.be.revertedWith("not_allowed_admin_or_comm_admin");

        //User with Admin permission gives Moderator permission
        await peeranha.connect(user).giveCommunityModeratorPermission(signers[2].address, communitiesIds[0]);
        await peeranha.connect(signers[2]).updateCommunity(communitiesIds[0], getHash())
        await expect(peeranha.connect(signers[2]).freezeCommunity(communitiesIds[0]))
        .to.be.revertedWith("not_allowed_admin_or_comm_admin");
        await expect(peeranha.connect(signers[2]).unfreezeCommunity(communitiesIds[0]))
        .to.be.revertedWith("not_allowed_admin_or_comm_admin");

        await peeranha.connect(user).revokeCommunityModeratorPermission(signers[2].address, communitiesIds[0]);
        await expect(peeranha.connect(signers[2]).updateCommunity(communitiesIds[0], getHash()))
        .to.be.revertedWith("not_allowed_admin_or_comm_admin");

        //User with Admin permission gives Admin permission for other user
        await peeranha.connect(user).giveCommunityAdminPermission(signers[2].address, communitiesIds[0]);
        await peeranha.connect(signers[2]).freezeCommunity(communitiesIds[0]);
        await peeranha.connect(signers[2]).unfreezeCommunity(communitiesIds[0]);

        //User with Admin permission gives Admin permission for other community
        await expect(peeranha.connect(user).giveCommunityAdminPermission(userAddress, communitiesIds[1]))
        .to.be.revertedWith("not_allowed_admin_or_comm_admin");
        await expect(peeranha.connect(user).giveCommunityAdminPermission(signers[2].address, communitiesIds[1]))
        .to.be.revertedWith("not_allowed_admin_or_comm_admin");

        //Revoke Admin permission
        await peeranha.revokeCommunityModeratorPermission(userAddress, communitiesIds[0]);
        await peeranha.revokeCommunityModeratorPermission(signers[2].address, communitiesIds[0]);
        await peeranha.revokeCommunityAdminPermission(userAddress, communitiesIds[0]);
        await peeranha.revokeCommunityAdminPermission(signers[2].address, communitiesIds[0]);
        await expect(peeranha.connect(user).updateCommunity(communitiesIds[0], getHash()))
        .to.be.revertedWith("not_allowed_admin_or_comm_admin");
        await expect(peeranha.connect(signers[2]).updateCommunity(communitiesIds[0], getHash()))
        .to.be.revertedWith("not_allowed_admin_or_comm_admin");
    });

    // Send admin invite functionality must be created before
    xit("Test grant before creating community", async function() {
        const peeranha = await createContract();
        const signers = await ethers.getSigners();
        const hashContainer = getHashContainer();
        const countOfCommunities = 3;
        // const countOfUsers = 3;
        const communitiesIds = getIdsContainer(countOfCommunities);
        // await ceateUsers(peeranha, signers, countOfUsers);
        await peeranha.createUser(hashContainer[0]);

        let user = signers[1];
        const userAddress = user.address;
		await peeranha.connect(user).createUser(hashContainer[1]);
        

        await expect (peeranha.connect(user).createCommunity(getHash(), createTags(5)))
        .to.revertedWith('Peeranha: must have admin role');

        peeranha.createCommunity(getHash(), createTags(5));
        await expect (peeranha.connect(user).updateCommunity(communitiesIds[0], getHash()))
        .to.revertedWith('not_allowed_admin_or_comm_admin');
        await expect (peeranha.connect(user).freezeCommunity(communitiesIds[0]))
        .to.revertedWith('Peeranha: must have admin role');
        await expect (peeranha.connect(user).unfreezeCommunity(communitiesIds[0]))
        .to.revertedWith('Peeranha: must have admin role');

        await peeranha.giveCommunityAdminPermission(userAddress, communitiesIds[0]);

        const communityCount = await peeranha.getCommunitiesCount();
        await peeranha.connect(user).createCommunity(getHash(), createTags(5));
        await expect(peeranha.getCommunitiesCount()).to.be.greaterThan(communityCount);

        await peeranha.connect(user).updateCommunity(communitiesIds[1], getHash());

        // await peeranha.connect(user).giveCommunityModeratorPermission(signers[2].address, communitiesIds[0]);
        // // console.log(await peeranha.getUserPermissions(signers[2].address))
        // // await peeranha.connect(signers[2]).updateCommunity(communitiesIds[0], getHash());
        // await peeranha.connect(user).revokeCommunityModeratorPermission(signers[2].address, communitiesIds[0]);
        // // await expect(peeranha.connect(signers[2]).updateCommunity(communitiesIds[0], getHash()))
        // // .to.be.revertedWith("not_allowed_not_comm_admin");

        // peeranha.revokeCommunityModeratorPermission(userAddress, communitiesIds[0]);
        // peeranha.revokeCommunityAdminPermission(userAddress, communitiesIds[0]);

        // await expect(peeranha.connect(user).updateCommunity(communitiesIds[0], getHash()))
        // .to.be.revertedWith("not_allowed_not_comm_admin");
    });

    const createCommunities = async (peeranha, countOfCommunities, communitiesIds) => {
        const ipfsHashes = getHashesContainer(countOfCommunities);
        await Promise.all(communitiesIds.map(async(id) => {
            return await peeranha.createCommunity(ipfsHashes[id - 1], createTags(5));
        }));

        expect(await peeranha.getCommunitiesCount()).to.equal(countOfCommunities)

        await Promise.all(communitiesIds.map(async(id) => {
            const community = await peeranha.getCommunity(id);
            return await expect(community.ipfsDoc.hash).to.equal(ipfsHashes[id - 1]);
        }));
    }

    // const ceateUsers = async (peeranha, signers, countOfUsers) => {
    //     const hashContainer = getHashesContainer(countOfUsers);
    //     await Promise.all(hashContainer.map(
    //         async (hash, index) => {
    //           return await  peeranha.connect(signers[index]).createUser(hash)
    //         }
    //       ))
    //     }
});