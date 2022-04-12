const { expect } = require("chai");
const { createContract, getHashContainer, getHashesContainer, createTags, } = require('./utils');

///
// deligate
///

describe("Test users", function() {

  it("Test user creating", async function() {
    const peeranha = await createContract();
    const signers = await ethers.getSigners();
    const hashContainer = getHashContainer();

    await Promise.all(hashContainer.map(
      async (hash, index) => {
        return await  peeranha.connect(signers[index]).createUser(hash)
      }
    ))

    expect(await peeranha.getUsersCount()).to.equal(hashContainer.length);

    await Promise.all(hashContainer.map(async (hash, index) => {
      const user = await peeranha.getUserByIndex(index);
      // expect(user.rating).to.equal(StartUserRating);
      // expect(user.payOutRating).to.equal(StartUserRating);
      return expect(user.ipfsDoc.hash).to.equal(hash);
    }))
  });

  it("Test user creating double profile", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();

    await peeranha.createUser(hashContainer[0]);

    expect(await peeranha.getUsersCount()).to.equal(1);

    await expect(peeranha.createUser(hashContainer[1]))
    .to.be.revertedWith('user_exists');
  });

  it("Test user editing", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    
    await peeranha.createUser(hashContainer[0]);
    const user = await peeranha.getUserByIndex(0);
    expect(user.ipfsDoc.hash).to.equal(hashContainer[0]);
    await peeranha.updateUser(peeranha.deployTransaction.from, hashContainer[1]);
    const changedUser = await peeranha.getUserByIndex(0);
    expect(changedUser.ipfsDoc.hash).to.equal(hashContainer[1]);

    expect(await peeranha.getUsersCount()).to.equal(1);
  })

  it("Test user editing/ non-existent user", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
      
    await expect(peeranha.updateUser(peeranha.deployTransaction.from, hashContainer[0]))
    .to.be.revertedWith('user_not_found');
    expect(await peeranha.getUsersCount()).to.equal(0);

    await peeranha.createUser(hashContainer[0]);
    const user = await peeranha.getUserByIndex(0);
    expect(user.ipfsDoc.hash).to.equal(hashContainer[0]);
    expect(await peeranha.getUsersCount()).to.equal(1);
  })

  xit("Test user editing, negative rating", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
		const signers = await ethers.getSigners();
    
    await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.connect(signers[1]).addUserRating(signers[1].address, -11, 1);
    const user = await peeranha.getUserByIndex(0);
    await expect(user.ipfsDoc.hash).to.equal(hashContainer[0]);
    await expect(peeranha.connect(signers[1]).updateUser(signers[1].address, hashContainer[1])).to.be.revertedWith('low_rating_edit_profile');
  })

  it("Test user getter", async function() {
    const peeranha = await createContract();
    const signers = await ethers.getSigners();
    const hashContainer = getHashContainer();
    
    await Promise.all(hashContainer.map(
      async (hash, index) => {
        return await peeranha.connect(signers[index]).createUser(hash);
      }
    ))
    
    const user1 = await peeranha.getUserByIndex(0);
    expect(user1).to.have.to.have.ownPropertyDescriptor('ipfsDoc');
    expect(user1.ipfsDoc.hash).to.equal(hashContainer[0]);
    expect(user1).to.have.ownPropertyDescriptor('creationTime');
    expect(user1).to.have.ownPropertyDescriptor('energy');
    expect(user1).to.have.ownPropertyDescriptor('lastUpdatePeriod');
    expect(user1).to.have.ownPropertyDescriptor('followedCommunities');
    expect(user1).to.have.ownPropertyDescriptor('roles');

    const user2 = await peeranha.getUserByAddress(signers[1].address);
    expect(user2).to.have.ownPropertyDescriptor('ipfsDoc');
    expect(user2.ipfsDoc.hash).to.equal(hashContainer[1]);
    expect(user2).to.have.ownPropertyDescriptor('creationTime');
    expect(user2).to.have.ownPropertyDescriptor('energy');
    expect(user2).to.have.ownPropertyDescriptor('lastUpdatePeriod');
    expect(user2).to.have.ownPropertyDescriptor('followedCommunities');
    expect(user2).to.have.ownPropertyDescriptor('roles');
  })

  it("Follow community", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));

    await peeranha.followCommunity(peeranha.deployTransaction.from, 1);
    
    const user = await peeranha.getUserByIndex(0);
    expect(user.followedCommunities[0]).to.equal(1);   //  expect(user.followCommunity).to.equal([1]); ?
  })

  it("Follow community not exist user", async function() {
    const peeranha = await createContract();
		const signers = await ethers.getSigners();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));

    await expect(peeranha.connect(signers[1]).followCommunity(signers[1].address, 1)).to.be.revertedWith('user_not_found');
  })

  it("Double follow community", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));

    await peeranha.followCommunity(peeranha.deployTransaction.from, 1);
    await expect(peeranha.followCommunity(peeranha.deployTransaction.from, 1)).to.be.revertedWith('already_followed');
  })

  it("Follow on not exist community", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    await peeranha.createUser(hashContainer[0]);

    await expect(peeranha.followCommunity(peeranha.deployTransaction.from, 1)).to.be.revertedWith('Community does not exist');

  })

  it("Follow on freaze community", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    await peeranha.freezeCommunity(1);
    
    await expect(peeranha.followCommunity(peeranha.deployTransaction.from, 1)).to.be.revertedWith('Community is frozen');
  })

  it("Follow on deferent communities", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    
    await peeranha.followCommunity(peeranha.deployTransaction.from, 1);
    await peeranha.followCommunity(peeranha.deployTransaction.from, 2);

    const user = await peeranha.getUserByIndex(0);
    expect(user.followedCommunities[0]).to.equal(1);
    expect(user.followedCommunities[1]).to.equal(2);
  })

  it("Follow on deferent communities -> unfollow from first -> follow on second community", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    
    await peeranha.followCommunity(peeranha.deployTransaction.from, 1);
    await peeranha.followCommunity(peeranha.deployTransaction.from, 2);
    await peeranha.unfollowCommunity(peeranha.deployTransaction.from, 1);
    await expect(peeranha.followCommunity(peeranha.deployTransaction.from, 2)).to.be.revertedWith('already_followed');
  })

  it("Follow on two communities -> unfollow from first -> follow on third community", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    
    await peeranha.followCommunity(peeranha.deployTransaction.from, 1);
    await peeranha.followCommunity(peeranha.deployTransaction.from, 2);
    await peeranha.unfollowCommunity(peeranha.deployTransaction.from, 1);
    let user = await peeranha.getUserByIndex(0);
    expect(user.followedCommunities[0]).to.equal(0);
    expect(user.followedCommunities[1]).to.equal(2);

    await peeranha.followCommunity(peeranha.deployTransaction.from, 3);
    user = await peeranha.getUserByIndex(0);
    expect(user.followedCommunities[0]).to.equal(3);
    expect(user.followedCommunities[1]).to.equal(2);
  })

  it("Follow community by non-existed user", async function() {
    const peeranha = await createContract();
    const signers = await ethers.getSigners();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));

    await peeranha.followCommunity(peeranha.deployTransaction.from, 1);
    
    await expect(peeranha.connect(signers[1]).followCommunity(signers[1].address, 1))
    .to.be.revertedWith('user_not_found');
  })

  it("UnFollow community", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));


    await peeranha.followCommunity(peeranha.deployTransaction.from, 1);
    await peeranha.unfollowCommunity(peeranha.deployTransaction.from, 1);

    const user = await peeranha.getUserByIndex(0);
    expect(user.followedCommunities[0]).to.equal(0);
  })

  it("UnFollow community by non-existed user", async function() {
    const peeranha = await createContract();
		const signers = await ethers.getSigners();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));


    await expect(peeranha.connect(signers[1]).followCommunity(signers[1].address, 1)).to.be.revertedWith('user_not_found');
    await expect(peeranha.connect(signers[1]).unfollowCommunity(signers[1].address, 1)).to.be.revertedWith('user_not_found');
  })

  it("UnFollow diferent community", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));


    await peeranha.followCommunity(peeranha.deployTransaction.from, 1);
    await peeranha.followCommunity(peeranha.deployTransaction.from, 2);
    await peeranha.unfollowCommunity(peeranha.deployTransaction.from, 1);
    await peeranha.unfollowCommunity(peeranha.deployTransaction.from, 2);

    const user = await peeranha.getUserByIndex(0);
    expect(user.followedCommunities[0]).to.equal(0);
    expect(user.followedCommunities[1]).to.equal(0);
  })

  it("Double unFollow community", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));


    await peeranha.followCommunity(peeranha.deployTransaction.from, 1);
    await peeranha.unfollowCommunity(peeranha.deployTransaction.from, 1);
    await expect(peeranha.unfollowCommunity(peeranha.deployTransaction.from, 1)).to.be.revertedWith('comm_not_followed');
  })

  it("Unfollow on not exist community", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    await peeranha.createUser(hashContainer[0]);

    await expect(peeranha.unfollowCommunity(peeranha.deployTransaction.from, 1)).to.be.revertedWith('comm_not_followed');

  })

  it("Unfollow on freaze community", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    await peeranha.followCommunity(peeranha.deployTransaction.from, 1);
    await peeranha.freezeCommunity(1);
    
    await peeranha.unfollowCommunity(peeranha.deployTransaction.from, 1)
  })

  it("UnFollow community by non-existed user", async function() {
    const peeranha = await createContract();
    const signers = await ethers.getSigners();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));

    await peeranha.followCommunity(peeranha.deployTransaction.from, 1);
    
    await expect(peeranha.connect(signers[1]).unfollowCommunity(signers[1].address, 1))
    .to.be.revertedWith('user_not_found');

    await peeranha.unfollowCommunity(peeranha.deployTransaction.from, 1);
  })
});