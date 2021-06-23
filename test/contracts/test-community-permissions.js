const { expect } = require("chai");
const crypto = require("crypto");

describe("Test community permissions", function() {
    it("Test community creating", async function() {
        const peeranha = await createContract();
        const signers = await ethers.getSigners();
        const countOfCommunities = 3;
        const countOfUsers = 3;
        const communitiesIds = getIdsContainer(countOfCommunities);
        await createCommunities(peeranha, countOfCommunities, communitiesIds);
        await ceateUsers(peeranha, signers, countOfUsers);

        let user = signers[1];
        const userAddress = user.address;
        console.log(userAddress)

        await expect(peeranha.connect(user).updateCommunity(communitiesIds[0], getHash()))
        .to.be.revertedWith("Peeranha: must have community moderator role");

        peeranha.giveCommunityAdminPermission(userAddress, communitiesIds[0]);
        await peeranha.connect(user).updateCommunity(communitiesIds[0], getHash());

        peeranha.revokeCommunityAdminPermission(userAddress, communitiesIds[0]);
        peeranha.revokeCommunityModeratorPermission(userAddress, communitiesIds[0]);

        await expect(peeranha.connect(user).updateCommunity(communitiesIds[0], getHash()))
        .to.be.revertedWith("Peeranha: must have community moderator role");
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