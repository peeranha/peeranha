require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');
require("hardhat-gas-reporter");
require('hardhat-contract-sizer');

const { INFURA_API_KEY, ADMIN_PRIVATE_KEY } = require('./secrets.json');


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.2",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
  },
  networks: {
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [ADMIN_PRIVATE_KEY],
      gas: 2100000,
      gasPrice: 10000000000
    }
  }
};