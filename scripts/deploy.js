const { ethers, upgrades } = require("hardhat");

async function main() {
  const PostLib = await ethers.getContractFactory("PostLib");
  const postLib = await PostLib.deploy();
  const Peeranha = await ethers.getContractFactory("Peeranha", {
    libraries: {
      PostLib: postLib.address,
    }
  });
  console.log("Deploying Peeranha...");
  const peeranha = await upgrades.deployProxy(Peeranha, [], {unsafeAllowLinkedLibraries: true});
  console.log("Peeranha deployed to:", peeranha.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });