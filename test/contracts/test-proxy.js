const { expect } = require('chai');
 
let Peeranha;
let peeranha;
 
// Start test block
describe('Peeranha (proxy)', function () {
  beforeEach(async function () {
    Peeranha = await ethers.getContractFactory("Peeranha");
    peeranha = await upgrades.deployProxy(Peeranha, ["Peeranha", "PEER", 100000000 * (10 ** 18)]);
  });
 
  // Test case
  it('retrieve returns a value previously initialized', async function () {
    // Test if the returned value is the same one
    // Note that we need to use strings to compare the 256 bit integers
    // TODO: add check here
    // expect((await peeranha.retrieve()).toString()).to.equal('42');
  });
});