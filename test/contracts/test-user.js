const { expect } = require("chai");
const crypto = require("crypto");

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
      expect(user.rating).to.equal(StartUserRating);
      expect(user.payOutRating).to.equal(StartUserRating);
      return expect(user.ipfsDoc.hash).to.equal(hash);
    }))
  });

  it("Test user creating double profile", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();

    await peeranha.createUser(hashContainer[0]);

    expect(await peeranha.getUsersCount()).to.equal(1);

    await expect(peeranha.createUser(hashContainer[1]))
    .to.be.revertedWith('User exists');
  });

  it("Test user editing", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    
    await peeranha.createUser(hashContainer[0]);
    const user = await peeranha.getUserByIndex(0);
    expect(user.ipfsDoc.hash).to.equal(hashContainer[0]);
    await peeranha.updateUser(hashContainer[1]);
    const changedUser = await peeranha.getUserByIndex(0);
    expect(changedUser.ipfsDoc.hash).to.equal(hashContainer[1]);

    expect(await peeranha.getUsersCount()).to.equal(1);
  })

  it("Test user editing/ non-existent user", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
      
    await expect(peeranha.updateUser(hashContainer[0]))
    .to.be.revertedWith('User does not exist');
    expect(await peeranha.getUsersCount()).to.equal(0);

    await peeranha.createUser(hashContainer[0]);
    const user = await peeranha.getUserByIndex(0);
    expect(user.ipfsDoc.hash).to.equal(hashContainer[0]);
    expect(await peeranha.getUsersCount()).to.equal(1);
  })

  it("Test user editing, negative rating", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
		const signers = await ethers.getSigners();
    
    await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.connect(signers[1]).addUserRating(signers[1].address, -11);
    const user = await peeranha.getUserByIndex(0);
    await expect(user.ipfsDoc.hash).to.equal(hashContainer[0]);
    await expect(peeranha.connect(signers[1]).updateUser(hashContainer[1])).to.be.revertedWith('Your rating is too small for edit profile. You need 0 ratings');
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
    expect(user1).to.have.ownPropertyDescriptor('rating');
    expect(user1).to.have.ownPropertyDescriptor('payOutRating');
    expect(user1).to.have.ownPropertyDescriptor('creationTime');
    expect(user1).to.have.ownPropertyDescriptor('roles');
    expect(user1).to.have.ownPropertyDescriptor('followedCommunities');
    expect(user1).to.have.ownPropertyDescriptor('rewardPeriods');

    const user2 = await peeranha.getUserByAddress(signers[1].address);
    expect(user2).to.have.ownPropertyDescriptor('ipfsDoc');
    expect(user2.ipfsDoc.hash).to.equal(hashContainer[1]);
    expect(user2).to.have.ownPropertyDescriptor('rating');
    expect(user2).to.have.ownPropertyDescriptor('payOutRating');
    expect(user2).to.have.ownPropertyDescriptor('creationTime');
    expect(user2).to.have.ownPropertyDescriptor('roles');
    expect(user2).to.have.ownPropertyDescriptor('followedCommunities');
    expect(user2).to.have.ownPropertyDescriptor('rewardPeriods');
  })

  it("Follow community", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));

    await peeranha.followCommunity(1);
    
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

    await expect(peeranha.connect(signers[1]).followCommunity(1)).to.be.revertedWith('Peeranha: must be an existing user');
  })

  it("Double follow community", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));

    await peeranha.followCommunity(1);
    await expect(peeranha.followCommunity(1)).to.be.revertedWith('You already follow the community');
  })

  it("Follow on not exist community", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    await peeranha.createUser(hashContainer[0]);

    await expect(peeranha.followCommunity(1)).to.be.revertedWith('Community does not exist');

  })

  it("Follow on freaze community", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    await peeranha.freezeCommunity(1);
    
    await expect(peeranha.followCommunity(1)).to.be.revertedWith('Community is frozen');
  })

  it("Follow on deferent communities", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    
    await peeranha.followCommunity(1);
    await peeranha.followCommunity(2);

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
    
    await peeranha.followCommunity(1);
    await peeranha.followCommunity(2);
    await peeranha.unfollowCommunity(1);
    await expect(peeranha.followCommunity(2)).to.be.revertedWith('You already follow the community');
  })

  it("Follow on two communities -> unfollow from first -> follow on third community", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    
    await peeranha.followCommunity(1);
    await peeranha.followCommunity(2);
    await peeranha.unfollowCommunity(1);
    let user = await peeranha.getUserByIndex(0);
    expect(user.followedCommunities[0]).to.equal(0);
    expect(user.followedCommunities[1]).to.equal(2);

    await peeranha.followCommunity(3);
    user = await peeranha.getUserByIndex(0);
    expect(user.followedCommunities[0]).to.equal(3);
    expect(user.followedCommunities[1]).to.equal(2);
  })

  xit("Follow community by non-existed user", async function() { // must be fixed
    const peeranha = await createContract();
    const signers = await ethers.getSigners();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));

    await peeranha.followCommunity(1);
    
    await expect(peeranha.connect(signers[1]).followCommunity(1))
    .to.be.revertedWith('Peeranha: must be an existing user');
  })

  it("UnFollow community", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));


    await peeranha.followCommunity(1);
    await peeranha.unfollowCommunity(1);

    const user = await peeranha.getUserByIndex(0);
    expect(user.followedCommunities[0]).to.equal(0);
  })

  it("UnFollow community", async function() {
    const peeranha = await createContract();
		const signers = await ethers.getSigners();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));


    await expect(peeranha.connect(signers[1]).followCommunity(1)).to.be.revertedWith('Peeranha: must be an existing user');
    await expect(peeranha.connect(signers[1]).unfollowCommunity(1)).to.be.revertedWith('Peeranha: must be an existing user');
  })

  it("UnFollow diferent community", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));


    await peeranha.followCommunity(1);
    await peeranha.followCommunity(2);
    await peeranha.unfollowCommunity(1);
    await peeranha.unfollowCommunity(2);

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


    await peeranha.followCommunity(1);
    await peeranha.unfollowCommunity(1);
    await expect(peeranha.unfollowCommunity(1)).to.be.revertedWith('You are not following the community');
  })

  it("Unfollow on not exist community", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    await peeranha.createUser(hashContainer[0]);

    await expect(peeranha.unfollowCommunity(1)).to.be.revertedWith('You are not following the community');

  })

  it("Unfollow on freaze community", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    await peeranha.followCommunity(1);
    await peeranha.freezeCommunity(1);
    
    await peeranha.unfollowCommunity(1)
  })

  xit("UnFollow community by non-existed user", async function() { // must be fixed
    const peeranha = await createContract();
    const signers = await ethers.getSigners();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));

    await peeranha.followCommunity(1);
    
    await expect(peeranha.connect(signers[1]).unfollowCommunity(1))
    .to.be.revertedWith('Peeranha: must be an existing user');

    await peeranha.unfollowCommunity(1);
  })

  const createContract = async function(){
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

  const getHashContainer = () => {
    return [
      "0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1",
      "0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82",
      "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
    ];
  }

  const getUsers = (hashes) => {
    const ipfsHash2 = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const creationTime = 0;
    const rating = 0;
    return hashes.map((hash) => {
      return [hash, ipfsHash2, rating, creationTime, []];
    })
  }

  const getHashesContainer = (size) =>
        Array.apply(null, { length: size }).map(() => "0x" + crypto.randomBytes(32).toString("hex"));
  
  const createTags = (countOfTags) =>
  getHashesContainer(countOfTags).map((hash) => {
    const hash2 = '0x0000000000000000000000000000000000000000000000000000000000000000';
      return {"ipfsDoc": {hash, hash2}}
  });

  const StartUserRating = 10;
});