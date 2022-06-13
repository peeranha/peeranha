const { expect } = require('chai');
const { getHashContainer, getHashesContainer, createTags } = require('./utils');

let PeeranhaUser;
let peeranhaUser;
let PeeranhaCommunity;
let peeranhaCommunity;
let PeeranhaContent;
let peeranhaContent;
let PeeranhaNFT;
let peeranhaNFT;
let PeeranhaToken;
let peeranhaToken;


describe('Peeranha (proxy)', function () {
  beforeEach(async function () {
    const PostLib = await ethers.getContractFactory("PostLib");
    const postLib = await PostLib.deploy();

    PeeranhaUser = await ethers.getContractFactory("PeeranhaUser");
    peeranhaUser = await upgrades.deployProxy(PeeranhaUser, [], {timeout: 0});

    PeeranhaCommunity = await ethers.getContractFactory("PeeranhaCommunity");
    peeranhaCommunity = await upgrades.deployProxy(PeeranhaCommunity, [peeranhaUser.address], {timeout: 0});

    PeeranhaContent = await ethers.getContractFactory("PeeranhaContent", {
      libraries: {
        PostLib: postLib.address
      }
    });
    peeranhaContent = await upgrades.deployProxy(PeeranhaContent, [peeranhaCommunity.address, peeranhaUser.address], {unsafeAllowLinkedLibraries: true, timeout: 0});
    
    PeeranhaNFT = await ethers.getContractFactory("PeeranhaNFT");
    peeranhaNFT = await upgrades.deployProxy(PeeranhaNFT, ["PEERNFT", "PEERNFT", peeranhaUser.address, "0xb5505a6d998549090530911180f38aC5130101c6"], {timeout: 0});

    PeeranhaToken = await ethers.getContractFactory("PeeranhaToken");
    peeranhaToken = await upgrades.deployProxy(PeeranhaToken, ["PEER", "PEER", peeranhaUser.address, "0xb5505a6d998549090530911180f38aC5130101c6"], {timeout: 0});

    await peeranhaUser.setContractAddresses(peeranhaCommunity.address, peeranhaContent.address, peeranhaNFT.address, peeranhaToken.address);
  });
 
  it('check upgraded contract address', async function () {
    const newPeeranhaUser = await upgrades.upgradeProxy(peeranhaUser.address, PeeranhaUser, {unsafeAllowLinkedLibraries: true});
    const newPeeranhaCommunity = await upgrades.upgradeProxy(peeranhaCommunity.address, PeeranhaCommunity, {unsafeAllowLinkedLibraries: true});
    const newPeeranhaContent = await upgrades.upgradeProxy(peeranhaContent.address, PeeranhaContent, {unsafeAllowLinkedLibraries: true});
    const newPeeranhaNFT = await upgrades.upgradeProxy(peeranhaNFT.address, PeeranhaNFT, {unsafeAllowLinkedLibraries: true});
    const newPeeranhaToken = await upgrades.upgradeProxy(peeranhaToken.address, PeeranhaToken, {unsafeAllowLinkedLibraries: true});

    expect(await newPeeranhaUser.address).to.be.equal(peeranhaUser.address);
    expect(await newPeeranhaCommunity.address).to.be.equal(peeranhaCommunity.address);
    expect(await newPeeranhaContent.address).to.be.equal(peeranhaContent.address);
    expect(await newPeeranhaNFT.address).to.be.equal(peeranhaNFT.address);
    expect(await newPeeranhaToken.address).to.be.equal(peeranhaToken.address);
  });

  it('check retrieve returns a value previously initialized', async function () {
    const ipfsHashes = getHashesContainer(2);
    const hashContainer = getHashContainer();
		await peeranhaUser.createUser(hashContainer[1]);
    await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

    const newPeeranhaUser = await upgrades.upgradeProxy(peeranhaUser.address, PeeranhaUser, {unsafeAllowLinkedLibraries: true});
    const newPeeranhaCommunity = await upgrades.upgradeProxy(peeranhaCommunity.address, PeeranhaCommunity, {unsafeAllowLinkedLibraries: true});

    expect(await newPeeranhaUser.getUsersCount()).to.be.equal(1);
    expect(await newPeeranhaUser.isUserExists(peeranhaUser.deployTransaction.from)).to.be.true;
    expect(await newPeeranhaCommunity.getCommunitiesCount()).to.be.equal(1);
    expect((await newPeeranhaCommunity.getCommunity(1)).ipfsDoc.hash).to.be.equal(ipfsHashes[0]);
  });
});