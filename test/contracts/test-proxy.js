const { expect } = require('chai');
const crypto = require("crypto");
 
let Peeranha;
let peeranha;
 
describe('Peeranha (proxy)', function () {
  beforeEach(async function () {
    const PostLib = await ethers.getContractFactory("PostLib")
    const postLib = await PostLib.deploy();
    Peeranha = await ethers.getContractFactory("Peeranha", {
    libraries: {
        PostLib: postLib.address,
    }
    });
    peeranha = await upgrades.deployProxy(Peeranha, [], {unsafeAllowLinkedLibraries: true});
  });
 
  it('check upgraded contract address', async function () {
    const newPeeranha = await upgrades.upgradeProxy(peeranha.address, Peeranha, {unsafeAllowLinkedLibraries: true});

    expect(await newPeeranha.address).to.be.equal(peeranha.address);
  });

  it('check retrieve returns a value previously initialized', async function () {
    const ipfsHashes = getHashesContainer(2);
    const hashContainer = getHashContainer();
		await peeranha.createUser(hashContainer[1]);
    await peeranha.createCommunity(ipfsHashes[0], createTags(5));

    const newPeeranha = await upgrades.upgradeProxy(peeranha.address, Peeranha, {unsafeAllowLinkedLibraries: true});

    expect(await newPeeranha.getUsersCount()).to.be.equal(1);
    expect(await newPeeranha.isUserExists(peeranha.deployTransaction.from)).to.be.true;
    expect(await newPeeranha.getCommunitiesCount()).to.be.equal(1);
    expect((await newPeeranha.getCommunity(1)).ipfsDoc.hash).to.be.equal(ipfsHashes[0]);
  });

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