require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
// require("@nomicfoundation/hardhat-toolbox");
// require("@nomicfoundation/hardhat-verify");
require('@openzeppelin/hardhat-upgrades');
require('@openzeppelin/hardhat-defender');
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require('hardhat-contract-sizer');

const { INFURA_API_KEY, ADMIN_PRIVATE_KEY, POLYGON_API_KEY, GOERLI_API_KEY, DEFENDER_TEAM_API_KEY, DEFENDER_TEAM_API_SECRET_KEY } = require('./secrets.json');


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
      url: `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [ADMIN_PRIVATE_KEY],
      gas: 2100000,
      gasPrice: 250000000000
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [ADMIN_PRIVATE_KEY],
      gas: 2100000,
      gasPrice: 20000000000
    },
    amoy: {
      url: `https://rpc-amoy.polygon.technology/`,
      accounts: [ADMIN_PRIVATE_KEY],
      gas: 4100000,
      gasPrice: 30000000000
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [ADMIN_PRIVATE_KEY],
      gas: 2100000,
      gasPrice: 10000000000
    },
    beresheet: {
      url: `https://beresheet-evm.jelliedowl.net`,
      accounts: [ADMIN_PRIVATE_KEY],
      chainId: 2022,
      gas: 2100000,
      gasPrice: 10000000000
    },
    edgeware: {
      url: `https://edgeware-evm.jelliedowl.net/`,
      accounts: [ADMIN_PRIVATE_KEY],
      chainId: 2021,
      gas: 2100000,
      gasPrice: 10000000000
    },
    base_sepolia: {
      url: `https://sepolia.base.org`,
      accounts: [ADMIN_PRIVATE_KEY],
      chainId: 84532,
      gas: 7000000,
      gasPrice: 6398562,
      // url: 'https://base-sepolia.blockpi.network/v1/rpc/public',
    },
    base: {
      url: `https://mainnet.base.org/`,
      accounts: [ADMIN_PRIVATE_KEY],
      chainId: 8453,
      gas: 2100000,
      gasPrice: 10000000,
    },
    supra: {
      url: `https://rpc-evm-devnet.supra.com/rpc/v1/eth`,
      accounts: [ADMIN_PRIVATE_KEY],
      chainId: 996447617256,
      gas: 210000000,
      gasPrice: 30000000000
    },
    local: {
      url: `http://localhost:8545`,
      accounts: [ADMIN_PRIVATE_KEY],
      gas: 2100000,
      gasPrice: 200000000000
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: POLYGON_API_KEY,
      polygon: POLYGON_API_KEY,
      goerli: GOERLI_API_KEY,
      base_sepolia: "base_sepolia"
    },
    /*customChains: [
      {
        network: "base_sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api.routescan.io/v2/network/testnet/evm/84532/etherscan",
          browserURL: "https://base.testnet.thesuperscan.io"
        }
      }
    ]*/
  },
  
};