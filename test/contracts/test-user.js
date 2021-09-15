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
      return await expect(user.ipfsDoc.hash).to.equal(hash);
    }))
  });

  it("Test user editing", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    
    await peeranha.createUser(hashContainer[0]);
    const user = await peeranha.getUserByIndex(0);
    await expect(user.ipfsDoc.hash).to.equal(hashContainer[0]);
    await peeranha.updateUser(hashContainer[1]);
    const changedUser = await peeranha.getUserByIndex(0);
    await expect(changedUser.ipfsDoc.hash).to.equal(hashContainer[1]);

    expect(await peeranha.getUsersCount()).to.equal(1);
  })

  it("Test user getter", async function() {
    const peeranha = await createContract();
    const signers = await ethers.getSigners();
    const hashContainer = getHashContainer();
    
    await Promise.all(hashContainer.map(
      async (hash, index) => {
        return await peeranha.connect(signers[index]).createUser(hash)
      }
    ))
    
    const usersByIndex = await Promise.all(hashContainer.map(async (hash, index) => {
      const user = await peeranha.getUserByIndex(index);
      const userToCompare = user.map((entry, index) => {
        return index !== 3 && index != 7 ? entry : 0;
      })
      return userToCompare;
    }));

  

    const usersByAddress = await Promise.all(signers.slice(0, 3).map(async (addr) => {
      const user = await peeranha.getUserByAddress(addr.address)
      const userToCompare = user.map((entry, index) => {
        return index !== 3 && index != 7 ? entry : 0;
      })
      return userToCompare;
    }))

    expect(JSON.stringify(usersByAddress)).to.equal(JSON.stringify(getUsers(hashContainer)))
    expect(JSON.stringify(usersByIndex)).to.equal(JSON.stringify(getUsers(hashContainer)))
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

    await expect(peeranha.followCommunity(1)).to.be.revertedWith('community does not exist');

  })

  it("Follow on freaze community", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    const ipfsHashes = getHashesContainer(2);
    await peeranha.createUser(hashContainer[0]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    await peeranha.freezeCommunity(1);
    
    await expect(peeranha.followCommunity(1)).to.be.revertedWith('Peeranha: community is frozen');
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
    expect(user.followCommunity[0]).to.equal(0);
    expect(user.followCommunity[1]).to.equal(2);

    await peeranha.followCommunity(3);
    user = await peeranha.getUserByIndex(0);
    expect(user.followCommunity[0]).to.equal(3);
    expect(user.followCommunity[1]).to.equal(2);
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
    expect(user.followCommunity[0]).to.equal(0);
    expect(user.followCommunity[1]).to.equal(0);
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

  const createContract = async function(){
    const Peeranha = await ethers.getContractFactory("Peeranha");
    const peeranha = await Peeranha.deploy();
    await peeranha.deployed();
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
});