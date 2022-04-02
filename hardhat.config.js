require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');
require("hardhat-gas-reporter");
require('hardhat-contract-sizer');

const { infuraApiKey, adminPrivateKey } = require('./env.json');


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.7.5",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
  },
  networks: {
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${infuraApiKey}`,
      accounts: [adminPrivateKey],
      gas: 2100000,
      gasPrice: 10000000000
    }
  }
};