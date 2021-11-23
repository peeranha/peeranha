const { ethers, upgrades } = require("hardhat");

async function main() {
  const PostLib = await ethers.getContractFactory("PostLib");
  console.log("Deploying PostLib...");
  const postLib = await PostLib.deploy();
  console.log("PostLib deployed to:", postLib.address);
  const Peeranha = await ethers.getContractFactory("Peeranha", {
    libraries: {
      PostLib: postLib.address,
    }
  });
  console.log("Deploying Peeranha...");
  const peeranha = await upgrades.deployProxy(Peeranha, [], {unsafeAllowLinkedLibraries: true});
  console.log("Peeranha deployed to:", peeranha.address);
  const PeeranhaToken = await ethers.getContractFactory("PeeranhaToken");
  const peeranhaToken = await upgrades.deployProxy(PeeranhaToken, ["PEER", "PEER", peeranha.address]);
  console.log("Peeranha token deployed to:", peeranhaToken.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });