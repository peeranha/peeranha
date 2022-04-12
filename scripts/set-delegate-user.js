const { ethers } = require("hardhat");
const { PEERANHA_ADDRESS, POSTLIB_ADDRESS, COMMUNITYLIB_ADDRESS } = require('../env.json');

async function main() {
  const Peeranha = await ethers.getContractFactory("Peeranha", {
    libraries: {
      PostLib: POSTLIB_ADDRESS,
      CommunityLib: COMMUNITYLIB_ADDRESS
    }
  });

  const peeranha = await Peeranha.attach(PEERANHA_ADDRESS);

  const txObj = await peeranha.setDelegateUser(
    "0x8A9685D3827A740eC9b1eFdD0A05fF62039868ad"
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