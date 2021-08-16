const { ethers } = require("hardhat");

async function main() {
  const Peeranha = await ethers.getContractFactory("Peeranha");
  const peeranha = await Peeranha.attach("0xd635C2e0F2953032B92C451D433c8ab70Fab5CDc");
  console.log("Posting action")
  await peeranha.createUser("0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });