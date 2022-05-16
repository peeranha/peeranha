const { expect } = require("chai");
const { createPeerenhaAndTokenContract, getHashContainer, getHashesContainer, createTags, } = require('./utils');

///
// to do
//  fix "Test user editing/ non-existent user" (fix createIfDoesNotExist) and another (new file)
///

describe("Test users", function() {

  it("Test user creating", async function() {
    const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
    const signers = await ethers.getSigners();
    const hashContainer = getHashContainer();

    await Promise.all(hashContainer.map(
      async (hash, index) => {
        return await  peeranhaUser.connect(signers[index]).createUser(hash)
      }
    ))

    expect(await peeranhaUser.getUsersCount()).to.equal(hashContainer.length);

    await Promise.all(hashContainer.map(async (hash, index) => {
      const user = await peeranhaUser.getUserByIndex(index);
      // expect(user.rating).to.equal(StartUserRating);
      // expect(user.payOutRating).to.equal(StartUserRating);
      return expect(user.ipfsDoc.hash).to.equal(hash);
    }))
  });

  it("Test user creating double profile", async function() {
    const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
    const hashContainer = getHashContainer();

    await peeranhaUser.createUser(hashContainer[0]);

    expect(await peeranhaUser.getUsersCount()).to.equal(1);

    await expect(peeranhaUser.createUser(hashContainer[1]))
    .to.be.revertedWith('user_exists');
  });

  it("Test user editing", async function() {
    const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
    const hashContainer = getHashContainer();
    
    await peeranhaUser.createUser(hashContainer[0]);
    const user = await peeranhaUser.getUserByIndex(0);
    expect(user.ipfsDoc.hash).to.equal(hashContainer[0]);
    await peeranhaUser.updateUser(hashContainer[1]);
    const changedUser = await peeranhaUser.getUserByIndex(0);
    expect(changedUser.ipfsDoc.hash).to.equal(hashContainer[1]);

    expect(await peeranhaUser.getUsersCount()).to.equal(1);
  })

  xit("Test user editing/ non-existent user", async function() { // to do
    const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
    const hashContainer = getHashContainer();
      
    await expect(peeranhaUser.updateUser(hashContainer[0]))
    .to.be.revertedWith('user_not_found');
    expect(await peeranhaUser.getUsersCount()).to.equal(0);

    await peeranhaUser.createUser(hashContainer[0]);
    const user = await peeranhaUser.getUserByIndex(0);
    expect(user.ipfsDoc.hash).to.equal(hashContainer[0]);
    expect(await peeranhaUser.getUsersCount()).to.equal(1);
  })

  xit("Test user editing, negative rating", async function() {
    const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
    const hashContainer = getHashContainer();
		const signers = await ethers.getSigners();
    
    await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
		await peeranhaUser.connect(signers[1]).addUserRating(signers[1].address, -11, 1);
    const user = await peeranhaUser.getUserByIndex(0);
    await expect(user.ipfsDoc.hash).to.equal(hashContainer[0]);
    await expect(peeranhaUser.connect(signers[1]).updateUser(hashContainer[1])).to.be.revertedWith('low_rating_edit_profile');
  })

  it("Test user getter", async function() {
    const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
    const signers = await ethers.getSigners();
    const hashContainer = getHashContainer();
    
    await Promise.all(hashContainer.map(
      async (hash, index) => {
        return await peeranhaUser.connect(signers[index]).createUser(hash);
      }
    ))
    
    const user1 = await peeranhaUser.getUserByIndex(0);
    expect(user1).to.have.to.have.ownPropertyDescriptor('ipfsDoc');
    expect(user1.ipfsDoc.hash).to.equal(hashContainer[0]);
    expect(user1).to.have.ownPropertyDescriptor('energy');
    expect(user1).to.have.ownPropertyDescriptor('lastUpdatePeriod');
    expect(user1).to.have.ownPropertyDescriptor('followedCommunities');
    expect(user1).to.have.ownPropertyDescriptor('roles');

    const user2 = await peeranhaUser.getUserByAddress(signers[1].address);
    expect(user2).to.have.ownPropertyDescriptor('ipfsDoc');
    expect(user2.ipfsDoc.hash).to.equal(hashContainer[1]);
    expect(user2).to.have.ownPropertyDescriptor('energy');
    expect(user2).to.have.ownPropertyDescriptor('lastUpdatePeriod');
    expect(user2).to.have.ownPropertyDescriptor('followedCommunities');
    expect(user2).to.have.ownPropertyDescriptor('roles');
  })

  it("Follow community", async function() {
    const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranhaUser.createUser(hashContainer[0]);
    await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

    await peeranhaUser.followCommunity(1);
    
    const user = await peeranhaUser.getUserByIndex(0);
    expect(user.followedCommunities[0]).to.equal(1);   //  expect(user.followCommunity).to.equal([1]); ?
  })

  it("Follow community not exist user", async function() {
    const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
		const signers = await ethers.getSigners();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranhaUser.createUser(hashContainer[0]);
    await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

    await expect(peeranhaUser.connect(signers[1]).followCommunity(1)).to.be.revertedWith('user_not_found');
  })

  it("Double follow community", async function() {
    const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranhaUser.createUser(hashContainer[0]);
    await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

    await peeranhaUser.followCommunity(1);
    await expect(peeranhaUser.followCommunity(1)).to.be.revertedWith('already_followed');
  })

  it("Follow on not exist community", async function() {
    const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
    const hashContainer = getHashContainer();
    await peeranhaUser.createUser(hashContainer[0]);

    await expect(peeranhaUser.followCommunity(1)).to.be.revertedWith('Community does not exist');

  })

  it("Follow on freaze community", async function() {
    const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranhaUser.createUser(hashContainer[0]);
    await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
    await peeranhaCommunity.freezeCommunity(1);
    
    await expect(peeranhaUser.followCommunity(1)).to.be.revertedWith('Community is frozen');
  })

  it("Follow on deferent communities", async function() {
    const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranhaUser.createUser(hashContainer[0]);
    await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
    await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
    
    await peeranhaUser.followCommunity(1);
    await peeranhaUser.followCommunity(2);

    const user = await peeranhaUser.getUserByIndex(0);
    expect(user.followedCommunities[0]).to.equal(1);
    expect(user.followedCommunities[1]).to.equal(2);
  })

  it("Follow on deferent communities -> unfollow from first -> follow on second community", async function() {
    const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranhaUser.createUser(hashContainer[0]);
    await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
    await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
    
    await peeranhaUser.followCommunity(1);
    await peeranhaUser.followCommunity(2);
    await peeranhaUser.unfollowCommunity(1);
    await expect(peeranhaUser.followCommunity(2)).to.be.revertedWith('already_followed');
  })

  it("Follow on two communities -> unfollow from first -> follow on third community", async function() {
    const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranhaUser.createUser(hashContainer[0]);
    await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
    await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
    await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
    
    await peeranhaUser.followCommunity(1);
    await peeranhaUser.followCommunity(2);
    await peeranhaUser.unfollowCommunity(1);
    let user = await peeranhaUser.getUserByIndex(0);
    expect(user.followedCommunities[0]).to.equal(0);
    expect(user.followedCommunities[1]).to.equal(2);

    await peeranhaUser.followCommunity(3);
    user = await peeranhaUser.getUserByIndex(0);
    expect(user.followedCommunities[0]).to.equal(3);
    expect(user.followedCommunities[1]).to.equal(2);
  })

  it("Follow community by non-existed user", async function() {
    const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
    const signers = await ethers.getSigners();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranhaUser.createUser(hashContainer[0]);
    await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

    await peeranhaUser.followCommunity(1);
    
    await expect(peeranhaUser.connect(signers[1]).followCommunity(1))
    .to.be.revertedWith('user_not_found');
  })

  it("UnFollow community", async function() {
    const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranhaUser.createUser(hashContainer[0]);
    await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
    await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));


    await peeranhaUser.followCommunity(1);
    await peeranhaUser.unfollowCommunity(1);

    const user = await peeranhaUser.getUserByIndex(0);
    expect(user.followedCommunities[0]).to.equal(0);
  })

  it("UnFollow community by non-existed user", async function() {
    const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
		const signers = await ethers.getSigners();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranhaUser.createUser(hashContainer[0]);
    await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));


    await expect(peeranhaUser.connect(signers[1]).followCommunity(1)).to.be.revertedWith('user_not_found');
    await expect(peeranhaUser.connect(signers[1]).unfollowCommunity(1)).to.be.revertedWith('user_not_found');
  })

  it("UnFollow diferent community", async function() {
    const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranhaUser.createUser(hashContainer[0]);
    await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
    await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));


    await peeranhaUser.followCommunity(1);
    await peeranhaUser.followCommunity(2);
    await peeranhaUser.unfollowCommunity(1);
    await peeranhaUser.unfollowCommunity(2);

    const user = await peeranhaUser.getUserByIndex(0);
    expect(user.followedCommunities[0]).to.equal(0);
    expect(user.followedCommunities[1]).to.equal(0);
  })

  it("Double unFollow community", async function() {
    const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranhaUser.createUser(hashContainer[0]);
    await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));


    await peeranhaUser.followCommunity(1);
    await peeranhaUser.unfollowCommunity(1);
    await expect(peeranhaUser.unfollowCommunity(1)).to.be.revertedWith('comm_not_followed');
  })

  it("Unfollow on not exist community", async function() {
    const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
    const hashContainer = getHashContainer();
    await peeranhaUser.createUser(hashContainer[0]);

    await expect(peeranhaUser.unfollowCommunity(1)).to.be.revertedWith('comm_not_followed');

  })

  it("Unfollow on freaze community", async function() {
    const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranhaUser.createUser(hashContainer[0]);
    await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
    await peeranhaUser.followCommunity(1);
    await peeranhaCommunity.freezeCommunity(1);
    
    await peeranhaUser.unfollowCommunity(1)
  })

  it("UnFollow community by non-existed user", async function() {
    const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
    const signers = await ethers.getSigners();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranhaUser.createUser(hashContainer[0]);
    await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

    await peeranhaUser.followCommunity(1);
    
    await expect(peeranhaUser.connect(signers[1]).unfollowCommunity(1))
    .to.be.revertedWith('user_not_found');

    await peeranhaUser.unfollowCommunity(1);
  })
});