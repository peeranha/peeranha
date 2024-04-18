const { ethers } = require("hardhat");

async function main() {
  await getUserNonce();
}

async function getUserNonce() {
  const signers = await ethers.getSigners();
  const provider = ethers.providers.getDefaultProvider(
    'https://rpc-mumbai.maticvigil.com'
  );

  // console.log(await provider.getTransaction("0xf37c794e802581f6d8747a3b58b2bcd333301ba1739e67d31decb121d45ddb3c"));
  
  const latestNoncePromise = provider.getTransactionCount(
    signers[0].address,
    'latest'
  );
  const pendingNoncePromise = await provider.getTransactionCount(
    signers[0].address,
    'pending'
  );

  const accountNonces = await Promise.all([
    latestNoncePromise,
    pendingNoncePromise,
  ]);
  console.log(accountNonces)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
