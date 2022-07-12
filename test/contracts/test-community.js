const { expect } = require("chai");
const { createPeerenhaAndTokenContract, getIdsContainer, getHashesContainer, createTags, getHashContainer } = require('./utils');


describe("Test communities", function() {
    it("Test community creating", async function() {
        const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
        const countOfCommunities = 3;
        const communitiesIds = getIdsContainer(countOfCommunities);
        const ipfsHashes = getHashesContainer(countOfCommunities);
        const hashContainer = getHashContainer();
		await peeranhaUser.createUser(hashContainer[1]);

        await Promise.all(communitiesIds.map(async(id) => {
            return await peeranhaCommunity.createCommunity(ipfsHashes[id - 1], createTags(5));
        }));

        expect(await peeranhaCommunity.getCommunitiesCount()).to.equal(countOfCommunities)

        await Promise.all(communitiesIds.map(async(id) => {
            const community = await peeranhaCommunity.getCommunity(id);
            return await expect(community.ipfsDoc.hash).to.equal(ipfsHashes[id - 1]);
        }));
    });

    it("Test community creating / Not enough Tags", async function() {
        const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
        const countOfCommunities = 2;
        const ipfsHashes = getHashesContainer(countOfCommunities);
        const hashContainer = getHashContainer();
		await peeranhaUser.createUser(hashContainer[1]);

        await expect(peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(4))).to.be.revertedWith('Require at least 5 tags');
    });

    it("Test community editing", async function() {
        const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
        const ipfsHashes = getHashesContainer(2);
        const hashContainer = getHashContainer();
		await peeranhaUser.createUser(hashContainer[1]);

        await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
        const community = await peeranhaCommunity.getCommunity(1);
        await expect(community.ipfsDoc.hash).to.equal(ipfsHashes[0]);

        await peeranhaCommunity.updateCommunity(1, ipfsHashes[1]);
        const changedCommunity = await peeranhaCommunity.getCommunity(1);
        await expect(changedCommunity.ipfsDoc.hash).to.equal(ipfsHashes[1]);
        expect(await peeranhaCommunity.getCommunitiesCount()).to.equal(1);
    })

    it("Test tags creation", async function() {
        const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
        const ipfsHashes = getHashesContainer(2);
        const countOfTags = 5;
        const hashContainer = getHashContainer();
		await peeranhaUser.createUser(hashContainer[1]);
        const tags = createTags(countOfTags);

        await peeranhaCommunity.createCommunity(ipfsHashes[0], tags);
        const tagList = await peeranhaCommunity.getTags(1);

        expect(tagList.length).to.equal(countOfTags);
        tagList.map((tag, index) => {
            expect(tag.ipfsDoc.hash).to.equal(tags[index].ipfsDoc.hash);
        })

        await peeranhaCommunity.createTag(1, ipfsHashes[1]);
        const newTagList = await peeranhaCommunity.getTags(1);
        expect(await peeranhaCommunity.getTagsCount(1)).to.equal(countOfTags + 1);
        expect(newTagList[5].ipfsDoc.hash).to.equal(ipfsHashes[1]);
    })

    it("Test tag editing", async function() {
        const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
        const ipfsHashes = getHashesContainer(2);
        const hashContainer = getHashContainer();
		await peeranhaUser.createUser(hashContainer[1]);

        await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
        expect(await peeranhaCommunity.getTagsCount(1)).to.equal(5);

        await peeranhaCommunity.updateTag(1, 1, hashContainer[1]);
        const changedTag = await peeranhaCommunity.getTag(1, 1);
        await expect(changedTag.ipfsDoc.hash).to.equal(hashContainer[1]);
        expect(await peeranhaCommunity.getTagsCount(1)).to.equal(5);
    })

    xit("Test tags creation/ Add existing tag", async function() { // TODO: how it works?
        const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
        const ipfsHashes = getHashesContainer(2);
        const hashContainer = getHashContainer();
		await peeranhaUser.createUser(hashContainer[1]);

        await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
        let tagList = await peeranhaCommunity.getTags(1);
        await peeranhaCommunity.createTag(1, tagList[4].ipfsDoc.hash);
        tagList = await peeranhaCommunity.getTags(1);
        
        await Promise.all(tagList.map(async(tag, index) => {
                const tagHash = tag.ipfsDoc.hash;
                for (const tagID in tagList) {
                    if(index != tagID && tagList.hasOwnProperty(tagID)){
                        expect(tagHash, `Tags with indexes ${index} and ${tagID} are equal`)
                        .not.to.equal(tagList[tagID].ipfsDoc.hash);
                    }
                }
        }));
    })
});