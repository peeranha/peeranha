const { upgrades } = require("hardhat");
const { OWNER_MULTISIG } = require('../env.json');

async function main() {
  console.log('Transferring ownership of ProxyAdmin...');
  await upgrades.admin.transferProxyAdminOwnership(OWNER_MULTISIG);
  console.log('Transferred ownership of ProxyAdmin to:', OWNER_MULTISIG);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });