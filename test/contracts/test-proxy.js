const { expect } = require('chai');
const { getHashContainer, getHashesContainer, createTags } = require('./utils');

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
		await peeranhaUser.createUser(hashContainer[1]);
    await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

    const newPeeranha = await upgrades.upgradeProxy(peeranha.address, Peeranha, {unsafeAllowLinkedLibraries: true});

    expect(await newPeeranha.getUsersCount()).to.be.equal(1);
    expect(await newPeeranha.isUserExists(peeranha.deployTransaction.from)).to.be.true;
    expect(await newPeeranha.getCommunitiesCount()).to.be.equal(1);
    expect((await newPeeranha.getCommunity(1)).ipfsDoc.hash).to.be.equal(ipfsHashes[0]);
  });
});