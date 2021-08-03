const { ethers, upgrades } = require("hardhat");

async function main() {
  const Peeranha = await ethers.getContractFactory("Peeranha");
  const peeranha = await Peeranha.attach("0xd635C2e0F2953032B92C451D433c8ab70Fab5CDc");
  console.log("Query data")
  const userCount = await peeranha.getUsersCount();
  console.log("Users count:");
  console.log(userCount);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });