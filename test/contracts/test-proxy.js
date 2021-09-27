const { expect } = require('chai');
 
let Peeranha;
let peeranha;
 
// Start test block
describe('Peeranha (proxy)', function () {
  beforeEach(async function () {
    const PostLib = await ethers.getContractFactory("PostLib")
    const postLib = await PostLib.deploy();
    const Peeranha = await ethers.getContractFactory("Peeranha", {
    libraries: {
        PostLib: postLib.address,
    }
    });
    peeranha = await upgrades.deployProxy(Peeranha, []);
  });
 
  // Test case
  it('retrieve returns a value previously initialized', async function () {
    // Test if the returned value is the same one
    // Note that we need to use strings to compare the 256 bit integers
    // TODO: add check here
    // expect((await peeranha.retrieve()).toString()).to.equal('42');
  });
});