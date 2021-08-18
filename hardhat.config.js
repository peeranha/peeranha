require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');
require("hardhat-gas-reporter");

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
    goerli: {
      url: `https://goerli.infura.io/v3/${infuraApiKey}`,
      accounts: [adminPrivateKey]
    }
  }
};