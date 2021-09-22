const { expect } = require("chai");
const crypto = require("crypto");


describe("Test communities", function() {
    it("Test community creating", async function() {
        const peeranha = await createContract();
        const countOfCommunities = 3;
        const communitiesIds = getIdsContainer(countOfCommunities);
        const ipfsHashes = getHashesContainer(countOfCommunities);
        const hashContainer = getHashContainer();
		await peeranha.createUser(hashContainer[1]);

        await Promise.all(communitiesIds.map(async(id) => {
            return await peeranha.createCommunity(ipfsHashes[id - 1], createTags(5));
        }));

        expect(await peeranha.getCommunitiesCount()).to.equal(countOfCommunities)

        await Promise.all(communitiesIds.map(async(id) => {
            const community = await peeranha.getCommunity(id);
            return await expect(community.ipfsDoc.hash).to.equal(ipfsHashes[id - 1]);
        }));
    });

    it("Test community editing", async function() {
        const peeranha = await createContract();
        const ipfsHashes = getHashesContainer(2);
        const hashContainer = getHashContainer();
		await peeranha.createUser(hashContainer[1]);

        await peeranha.createCommunity(ipfsHashes[0], createTags(5));
        const community = await peeranha.getCommunity(1);
        await expect(community.ipfsDoc.hash).to.equal(ipfsHashes[0]);

        await peeranha.updateCommunity(1, ipfsHashes[1]);
        const changedCommunity = await peeranha.getCommunity(1);
        await expect(changedCommunity.ipfsDoc.hash).to.equal(ipfsHashes[1]);
        expect(await peeranha.getCommunitiesCount()).to.equal(1);
    })

    it("Test tags", async function() {
        const peeranha = await createContract();
        const ipfsHashes = getHashesContainer(2);
        const countOfTags = 5;
        const hashContainer = getHashContainer();
		await peeranha.createUser(hashContainer[1]);
        const tags = createTags(countOfTags);

        await peeranha.createCommunity(ipfsHashes[0], tags);
        const tagList = await peeranha.getTags(1);

        expect(tagList.length).to.equal(countOfTags);
        tagList.map((tag, index) => {
            expect(tag.ipfsDoc.hash).to.equal(tags[index].ipfsDoc.hash);
        })

        await peeranha.createTag(1, ipfsHashes[1]);
        const newTagList = await peeranha.getTags(1);
        expect(await peeranha.getTagsCount(1)).to.equal(countOfTags + 1);
        expect(newTagList[5].ipfsDoc.hash).to.equal(ipfsHashes[1]);
    })

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

    const createTags = (countOfTags) =>
        getHashesContainer(countOfTags).map((hash) => {
            const hash2 = '0x0000000000000000000000000000000000000000000000000000000000000000';
            return {"ipfsDoc": {hash, hash2}}
        });
    
    const getHashContainer = () => {
        return [
            "0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1",
            "0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82",
            "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
        ];
    };
});