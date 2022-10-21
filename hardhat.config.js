require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');
require('@openzeppelin/hardhat-defender');
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require('hardhat-contract-sizer');

const { INFURA_API_KEY, ADMIN_PRIVATE_KEY, MUMBAI_API_KEY, GOERLI_API_KEY, DEFENDER_TEAM_API_KEY, DEFENDER_TEAM_API_SECRET_KEY } = require('./secrets.json');


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
  defender: {
    apiKey: DEFENDER_TEAM_API_KEY,
    apiSecret: DEFENDER_TEAM_API_SECRET_KEY,
  },
  networks: {
    polygon: {
      url: `https://rpc.ankr.com/polygon`,
      accounts: [ADMIN_PRIVATE_KEY],
      gas: 2100000,
      gasPrice: 36000000000
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [ADMIN_PRIVATE_KEY],
      gas: 2100000,
      gasPrice: 10000000000
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [ADMIN_PRIVATE_KEY],
      gas: 2100000,
      gasPrice: 10000000000
    }
  },
  etherscan: {
    apiKey: {
      polygonMumbai: MUMBAI_API_KEY,
      goerli: GOERLI_API_KEY
    }
  }
};