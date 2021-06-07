const { expect } = require("chai");
const crypto = require("crypto");

describe("Test communities", function() {
    it("Test community creating", async function() {
        const peeranha = await createContract();
        const numberOfCommunities = 10;
        const communitiesIds = getIdsContainer(numberOfCommunities);
        const ipfsHashes = getHashesContainer(numberOfCommunities);

        await Promise.all(communitiesIds.map(async(id) => {
            return await peeranha.createCommunity(id, ipfsHashes[id]);
        }));

        expect(await peeranha.getCommunitiesCount()).to.equal(numberOfCommunities)

        await Promise.all(communitiesIds.map(async(id) => {
            const community = await peeranha.getCommunityById(id)
            return await expect(community.ipfsHash).to.equal(ipfsHashes[id]);
        }));
    });

    it("Test community editing", async function() {
        const peeranha = await createContract();
        const communitiesIds = getIdsContainer(1);
        const ipfsHashes = getHashesContainer(2);

        await peeranha.createCommunity(0, ipfsHashes[0]);
        const community = await peeranha.getCommunityById(0);
        await expect(community.ipfsHash).to.equal(ipfsHashes[0]);

        await peeranha.updateCommunity(0, ipfsHashes[1]);
        const changedCommunity = await peeranha.getCommunityById(0);
        await expect(changedCommunity.ipfsHash).to.equal(ipfsHashes[1]);
        expect(await peeranha.getCommunitiesCount()).to.equal(1)
    })

    const createContract = async function() {
        const Peeranha = await ethers.getContractFactory("Peeranha");
        const peeranha = await Peeranha.deploy();
        await peeranha.deployed();
        return peeranha;
    }

    const getIdsContainer = (numberOfCommunities) =>
        Array.apply(null, { length: numberOfCommunities }).map(Number.call, Number);

    const getHashesContainer = (numberOfCommunities) =>
        Array.apply(null, { length: numberOfCommunities }).map(() => "0x" + crypto.randomBytes(32).toString("hex"));
});