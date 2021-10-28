const { expect } = require("chai");
const crypto = require("crypto");
const { ethers } = require("hardhat");

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

        // Give Moderator permission for unreal user or community
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
        .to.be.revertedWith("Peeranha: must have admin or community moderator role");

        // User makes actions with Moderator permission
        await peeranha.giveCommunityModeratorPermission(userAddress, communitiesIds[0]);
        await peeranha.connect(user).updateCommunity(communitiesIds[0], getHash());
        await expect(peeranha.connect(user).updateCommunity(communitiesIds[1], getHash()))
        .to.be.revertedWith("Peeranha: must have admin or community moderator role");
        await expect(peeranha.connect(user).freezeCommunity(communitiesIds[0]))
        .to.be.revertedWith("Peeranha: must have admin or community admin role");
        await expect(peeranha.connect(user).unfreezeCommunity(communitiesIds[0]))
        .to.be.revertedWith("Peeranha: must have admin or community admin role");

        //User with Moderator permission gives Moderator permission
        await expect(peeranha.connect(user).giveCommunityModeratorPermission(signers[2].address, communitiesIds[0]))
        .to.be.revertedWith('Peeranha: must have community admin role');
        await peeranha.giveCommunityModeratorPermission(signers[2].address, communitiesIds[0]);
        await expect(peeranha.connect(user).revokeCommunityModeratorPermission(userAddress, communitiesIds[0]))
        .to.be.revertedWith('Peeranha: must have community admin role');

        //Revoke Moderator permission
        await peeranha.revokeCommunityModeratorPermission(userAddress, communitiesIds[0]);
        await expect(peeranha.connect(user).updateCommunity(communitiesIds[0], getHash()))
        .to.be.revertedWith("Peeranha: must have admin or community moderator role");
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

        // Give Admin permission for unreal user or community
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
        .to.be.revertedWith("Peeranha: must have community admin role");
        await expect(peeranha.connect(user).updateCommunity(communitiesIds[0], getHash()))
        .to.be.revertedWith("Peeranha: must have admin or community moderator role");

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
        .to.be.revertedWith("Peeranha: must have admin or community moderator role");
        await expect(peeranha.connect(user).freezeCommunity(communitiesIds[1]))
        .to.be.revertedWith("Peeranha: must have admin or community admin role");
        await expect(peeranha.connect(user).unfreezeCommunity(communitiesIds[1]))
        .to.be.revertedWith("Peeranha: must have admin or community admin role");

        //User with Admin permission gives Moderator permission
        await peeranha.connect(user).giveCommunityModeratorPermission(signers[2].address, communitiesIds[0]);
        await peeranha.connect(signers[2]).updateCommunity(communitiesIds[0], getHash())
        await expect(peeranha.connect(signers[2]).freezeCommunity(communitiesIds[0]))
        .to.be.revertedWith("Peeranha: must have admin or community admin role");
        await expect(peeranha.connect(signers[2]).unfreezeCommunity(communitiesIds[0]))
        .to.be.revertedWith("Peeranha: must have admin or community admin role");

        await peeranha.connect(user).revokeCommunityModeratorPermission(signers[2].address, communitiesIds[0]);
        await expect(peeranha.connect(signers[2]).updateCommunity(communitiesIds[0], getHash()))
        .to.be.revertedWith("Peeranha: must have admin or community moderator role");

        //User with Admin permission gives Admin permission for other user
        await peeranha.connect(user).giveCommunityAdminPermission(signers[2].address, communitiesIds[0]);
        await peeranha.connect(signers[2]).freezeCommunity(communitiesIds[0]);
        await peeranha.connect(signers[2]).unfreezeCommunity(communitiesIds[0]);

        //User with Admin permission gives Admin permission for other community
        await expect(peeranha.connect(user).giveCommunityAdminPermission(userAddress, communitiesIds[1]))
        .to.be.revertedWith("Peeranha: must have admin or community admin role");
        await expect(peeranha.connect(user).giveCommunityAdminPermission(signers[2].address, communitiesIds[1]))
        .to.be.revertedWith("Peeranha: must have admin or community admin role");

        //Revoke Admin permission
        await peeranha.revokeCommunityModeratorPermission(userAddress, communitiesIds[0]);
        await peeranha.revokeCommunityModeratorPermission(signers[2].address, communitiesIds[0]);
        await peeranha.revokeCommunityAdminPermission(userAddress, communitiesIds[0]);
        await peeranha.revokeCommunityAdminPermission(signers[2].address, communitiesIds[0]);
        await expect(peeranha.connect(user).updateCommunity(communitiesIds[0], getHash()))
        .to.be.revertedWith("Peeranha: must have admin or community moderator role");
        await expect(peeranha.connect(signers[2]).updateCommunity(communitiesIds[0], getHash()))
        .to.be.revertedWith("Peeranha: must have admin or community moderator role");
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
        .to.revertedWith('Peeranha: must have admin or community moderator role');
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
        // // .to.be.revertedWith("Peeranha: must have community admin role");

        // peeranha.revokeCommunityModeratorPermission(userAddress, communitiesIds[0]);
        // peeranha.revokeCommunityAdminPermission(userAddress, communitiesIds[0]);

        // await expect(peeranha.connect(user).updateCommunity(communitiesIds[0], getHash()))
        // .to.be.revertedWith("Peeranha: must have community admin role");
    });

    const createContract = async function() {
        const PostLib = await ethers.getContractFactory("PostLib")
        const postLib = await PostLib.deploy();
        const Peeranha = await ethers.getContractFactory("Peeranha", {
        libraries: {
            PostLib: postLib.address,
        }
        });
       
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
        getHashesContainer(countOfTags).map((hash) => {
            const hash2 = '0x0000000000000000000000000000000000000000000000000000000000000000';
            return {"ipfsDoc": {hash, hash2}}
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
    
    const getHashContainer = () => {
        return [
            "0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1",
            "0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82",
            "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
        ];
    };
});