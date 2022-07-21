const { ethers } = require("hardhat");
const { CONTENT_ADDRESS, USER_ADDRESS, POSTLIB_ADDRESS } = require('../env.json');

async function main() {
  const PeeranhaUser = await ethers.getContractFactory("PeeranhaUser");
  const peeranhaUser = await PeeranhaUser.attach(USER_ADDRESS);
  const userVersion = await peeranhaUser.getVersion();
  console.log(`User contract version: ${userVersion}`);
  
  const PeeranhaContent = await ethers.getContractFactory("PeeranhaContent", {
    libraries: {
      PostLib: POSTLIB_ADDRESS,
    }
  });
  const peeranhaContent = await PeeranhaContent.attach(CONTENT_ADDRESS);
  const contentVersion = await peeranhaContent.getVersion();
  console.log(`Content contract version: ${contentVersion}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });