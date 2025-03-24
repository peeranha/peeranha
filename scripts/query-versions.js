const { ethers } = require("hardhat");
const { CONTENT_ADDRESS, USER_ADDRESS, POSTLIB_ADDRESS, USERLIB_ADDRESS } = require('../env.json');

async function main() {
  const PeeranhaUser = await ethers.getContractFactory("PeeranhaUser", {
    libraries: {
      UserLib: USERLIB_ADDRESS,
    }
  });
  const peeranhaUser = await PeeranhaUser.attach(USER_ADDRESS);
  console.log("Query version user...")
  
  const userVersion = await peeranhaUser.getVersion();
  console.log("\nVersion user:");
  console.log(userVersion);
  
  const PeeranhaContent = await ethers.getContractFactory("PeeranhaContent", {
    libraries: {
      PostLib: POSTLIB_ADDRESS,
    }
  });
  const peeranhaContent = await PeeranhaContent.attach(CONTENT_ADDRESS);
  console.log("Query version content...")
  
  const contentVersion = await peeranhaContent.getVersion();
  console.log("\nVersion content:");
  console.log(contentVersion);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });