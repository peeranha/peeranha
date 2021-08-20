const { expect } = require("chai");
const crypto = require("crypto");
const { ethers } = require("hardhat");

describe("Test community permissions", function() {
    it("Test community moderator", async function() {
        const peeranha = await createContract();
        const signers = await ethers.getSigners();
        const countOfCommunities = 3;
        const countOfUsers = 3;
        const communitiesIds = getIdsContainer(countOfCommunities);
        await createCommunities(peeranha, countOfCommunities, communitiesIds);
        await ceateUsers(peeranha, signers, countOfUsers);

        let user = signers[1];
        const userAddress = user.address;

        // await expect(peeranha.connect(user).updateCommunity(communitiesIds[0], getHash()))
        // .to.be.revertedWith("Peeranha: must have community moderator role");

        await peeranha.giveCommunityModeratorPermission(userAddress, communitiesIds[0]);

        expect(peeranha.giveCommunityModeratorPermission(userAddress, 4))
        .to.be.revertedWith("Peeranha: must be an existing community");
        expect(peeranha.giveCommunityModeratorPermission(signers[4].address, communitiesIds[0]))
        .to.be.revertedWith("Peeranha: must be an existing user");

        // await peeranha.connect(user).updateCommunity(communitiesIds[0], getHash());

        expect(peeranha.revokeCommunityModeratorPermission(userAddress, 4))
        .to.be.revertedWith("Peeranha: must be an existing community");
        expect(peeranha.revokeCommunityModeratorPermission(signers[4].address, communitiesIds[0]))
        .to.be.revertedWith("Peeranha: must be an existing user");

        await peeranha.revokeCommunityModeratorPermission(userAddress, communitiesIds[0]);

        // await expect(peeranha.connect(user).updateCommunity(communitiesIds[0], getHash()))
        // .to.be.revertedWith("Peeranha: must have community moderator role");

        await peeranha.giveCommunityModeratorPermission(signers[2].address, communitiesIds[1]);
        // await peeranha.connect(signers[2]).updateCommunity(communitiesIds[1], getHash());
    });

    it("Test community administrator", async function() {
        const peeranha = await createContract();
        const signers = await ethers.getSigners();
        const countOfCommunities = 3;
        const countOfUsers = 3;
        const communitiesIds = getIdsContainer(countOfCommunities);
        await createCommunities(peeranha, countOfCommunities, communitiesIds);
        await ceateUsers(peeranha, signers, countOfUsers);

        let user = signers[1];
        const userAddress = user.address;

        await expect(peeranha.connect(user).giveCommunityModeratorPermission(signers[2].address, communitiesIds[1]))
        .to.be.revertedWith("Peeranha: must have community admin role");
        await expect(peeranha.connect(signers[2]).updateCommunity(communitiesIds[0], getHash()))
        .to.be.revertedWith("Peeranha: must have community admin role");

        peeranha.giveCommunityAdminPermission(userAddress, communitiesIds[0]);

        expect(peeranha.giveCommunityAdminPermission(userAddress, 4))
        .to.be.revertedWith("Peeranha: must be an existing community");
        expect(peeranha.giveCommunityAdminPermission(signers[4].address, communitiesIds[0]))
        .to.be.revertedWith("Peeranha: must be an existing user");

        await peeranha.connect(user).updateCommunity(communitiesIds[0], getHash());

        await peeranha.connect(user).freezeCommunity(communitiesIds[0]);
        await expect(peeranha.connect(user).updateCommunity(communitiesIds[0], getHash()))
        .to.be.revertedWith("Community is frozen");
        await peeranha.connect(user).unfreezeCommunity(communitiesIds[0]);
        await peeranha.connect(user).updateCommunity(communitiesIds[0], getHash());

        await peeranha.connect(user).giveCommunityModeratorPermission(signers[2].address, communitiesIds[0]);
        // await peeranha.connect(signers[2]).updateCommunity(communitiesIds[0], getHash());
        // await peeranha.connect(signers[2]).freezeCommunity(communitiesIds[0]);
        // await peeranha.connect(signers[2]).unfreezeCommunity(communitiesIds[0]);

        expect(peeranha.giveCommunityAdminPermission(userAddress, 4))
        .to.be.revertedWith("Peeranha: must be an existing community");
        expect(peeranha.giveCommunityAdminPermission(signers[4].address, communitiesIds[0]))
        .to.be.revertedWith("Peeranha: must be an existing user");

        await peeranha.connect(user).revokeCommunityModeratorPermission(signers[2].address, communitiesIds[0]);
        await expect(peeranha.connect(signers[2]).updateCommunity(communitiesIds[0], getHash()))
        .to.be.revertedWith("Peeranha: must have community admin role");

        peeranha.revokeCommunityModeratorPermission(userAddress, communitiesIds[0]);
        peeranha.revokeCommunityAdminPermission(userAddress, communitiesIds[0]);

        await expect(peeranha.connect(user).updateCommunity(communitiesIds[0], getHash()))
        .to.be.revertedWith("Peeranha: must have community admin role");
    });

    it("Test grant while creating", async function() {
        const peeranha = await createContract();
        const signers = await ethers.getSigners();
        const countOfCommunities = 3;
        const countOfUsers = 3;
        const communitiesIds = getIdsContainer(countOfCommunities);
        await ceateUsers(peeranha, signers, countOfUsers);

        let user = signers[1];
        const userAddress = user.address;

        await peeranha.connect(user).createCommunity(communitiesIds[0], getHash(), createTags(5))
        await peeranha.connect(user).updateCommunity(communitiesIds[0], getHash());
        await peeranha.connect(user).freezeCommunity(communitiesIds[0]);
        await peeranha.connect(user).unfreezeCommunity(communitiesIds[0]);

        await peeranha.connect(user).giveCommunityModeratorPermission(signers[2].address, communitiesIds[0]);
        // console.log(await peeranha.getUserPermissions(signers[2].address))
        // await peeranha.connect(signers[2]).updateCommunity(communitiesIds[0], getHash());
        await peeranha.connect(user).revokeCommunityModeratorPermission(signers[2].address, communitiesIds[0]);
        // await expect(peeranha.connect(signers[2]).updateCommunity(communitiesIds[0], getHash()))
        // .to.be.revertedWith("Peeranha: must have community admin role");

        peeranha.revokeCommunityModeratorPermission(userAddress, communitiesIds[0]);
        peeranha.revokeCommunityAdminPermission(userAddress, communitiesIds[0]);

        // await expect(peeranha.connect(user).updateCommunity(communitiesIds[0], getHash()))
        // .to.be.revertedWith("Peeranha: must have community admin role");
    });

    const createContract = async function() {
        const Peeranha = await ethers.getContractFactory("Peeranha");
       
        const peeranha = await Peeranha.deploy();
        await peeranha.deployed();
        await peeranha.__Peeranha_init();
        return peeranha;
    }

    const getIdsContainer = (countOfCommunities) =>
        Array.apply(null, { length: countOfCommunities }).map((undefined, index) => ++index);

    const getHashesContainer = (size) =>
        Array.apply(null, { length: size }).map(() => "0x" + crypto.randomBytes(32).toString("hex"));

    const getHash = () => "0x" + crypto.randomBytes(32).toString("hex");

    const createTags = (countOfTags) =>
        getHashesContainer(countOfTags).map((ipfsHash) => {
            const ipfsHash2 = '0x0000000000000000000000000000000000000000000000000000000000000000';
            return { ipfsHash, ipfsHash2 }
        });

    const createCommunities = async (peeranha, countOfCommunities, communitiesIds) => {
        const ipfsHashes = getHashesContainer(countOfCommunities);
        await Promise.all(communitiesIds.map(async(id) => {
            return await peeranha.createCommunity(id, ipfsHashes[id - 1], createTags(5));
        }));

        expect(await peeranha.getCommunitiesCount()).to.equal(countOfCommunities)

        await Promise.all(communitiesIds.map(async(id) => {
            const community = await peeranha.getCommunity(id);
            return await expect(community.ipfsHash).to.equal(ipfsHashes[id - 1]);
        }));
    }

    const ceateUsers = async (peeranha, signers, countOfUsers) => {
        const hashContainer = getHashesContainer(countOfUsers);
        await Promise.all(hashContainer.map(
            async (hash, index) => {
              return await  peeranha.connect(signers[index]).createUser(hash)
            }
          ))
        }    
});