const { ethers } = require("hardhat");
const { USER_ADDRESS, USERLIB_ADDRESS } = require('../env.json');

async function main() {
  const PeeranhaUser = await ethers.getContractFactory("PeeranhaUser", {
    libraries: {
      UserLib: USERLIB_ADDRESS
    }
  });
  const peeranhaUser = await PeeranhaUser.attach(USER_ADDRESS);

  const signers = await ethers.getSigners();

  //const txObj = await peeranhaUser.giveCommunityModeratorPermission(
  const txObj = await peeranhaUser.giveCommunityAdminPermission(
    signers[0].address, // sender address
    "", // user address
    0   // community admin
  );
  console.log(`Submitted transaction - ${JSON.stringify(txObj)}`);
  
  console.log(`Waiting for transaction confirmation`);
  await txObj.wait();
  console.log('Transaction confirmed');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });