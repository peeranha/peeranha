const { expect } = require("chai");

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
      return await expect(user.ipfsHash).to.equal(hash);
    }))
  });

  it("Test user editing", async function() {
    const peeranha = await createContract();
    const hashContainer = getHashContainer();
    
    await peeranha.createUser(hashContainer[0]);
    const user = await peeranha.getUserByIndex(0);
    await expect(user.ipfsHash).to.equal(hashContainer[0]);
    await peeranha.updateUser(hashContainer[1]);
    const changedUser = await peeranha.getUserByIndex(0);
    await expect(changedUser.ipfsHash).to.equal(hashContainer[1]);

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
      return await peeranha.getUserByIndex(index);
    }));

    const usersByAddress = await Promise.all(signers.slice(0, 3).map(async (addr) => {
      return await peeranha.getUserByAddress(addr.address);
    }))

    expect(JSON.stringify(usersByAddress)).to.equal(JSON.stringify(getUsers(hashContainer)))
    expect(JSON.stringify(usersByIndex)).to.equal(JSON.stringify(getUsers(hashContainer)))
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
    return hashes.map((hash) => {
      return [hash, ipfsHash2];
    })
  }
});