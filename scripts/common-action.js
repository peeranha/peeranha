const env = require("hardhat");
const path = require('path');
const PATH = '../image/';
const execSync = require('child_process').execSync;

const ChainId = { Polygon: 137, PolygomTest: 80001, EdgeEVM: 2021 };

const testAccount = {
  displayName: "testAccount",
  company: "Peeranha",
  position: "TestInfo",
  location: "TestInfo",
  about: "TestInfo",
  avatar: "f"
};

const NFT = {
  name: "testAccount",
  description: "Peeranha",
  image: "",
  attributes: "TestInfo",
};

const testCommunity = {
  name: "testCommunity6.new",
  description: "testCommunity.new",
  website: "www.new",
  language: "ua.new",
};

const testTag = {
  title: "testTagNew",
  description: "testNewTag1",
};

const AchievementsType = { "Rating": 0, "Manual": 1, "SoulRating": 2 }

async function getChainName(chainId) {
  let chainName = ``;
  if (chainId == ChainId.PolygomTest) {
    chainName = `mumbai`;
  } else if (chainId = ChainId.Polygon) {
    chainName = `polygon`;
  }
  return chainName;
}

async function verifyContract(contractAddress, chainName) {
  if (contractAddress && chainName) {
    console.log(`Verify contract: ${contractAddress}`)
    let output = execSync(`npx hardhat verify ${contractAddress} --network ${chainName}`, { encoding: 'utf-8' });
    console.log('Verify log:\n', output);
  }
}

const achievements = (env) => {
  return [
    {
      maxCount: env === "prod" ? 10000 : 14,  
      lowerBound: env === "prod" ? 10 : 10, 
      type: AchievementsType.Rating, 
      path: path.resolve(__dirname, `${PATH}Stranger.svg`),
      name: "I'm just having a look",
      description: "Limited edition NFT for achieving Stranger status on Peeranha protocol among the first.",
      attributes: "",
    },
    {
      maxCount: env === "prod" ? 8000 : 12,  
      lowerBound: env === "prod" ? 35 : 35, 
      type: AchievementsType.Rating, 
      path: path.resolve(__dirname, `${PATH}FoundingMember.svg`),
      name: "Working my way up",
      description: "Limited edition NFT for achieving 35 reputation on Peeranha protocol among the first.",
      attributes: "",
    },
    {
      maxCount: env === "prod" ? 5000 : 10,  
      lowerBound: env === "prod" ? 100 : 10, 
      type: AchievementsType.Rating, 
      path: path.resolve(__dirname, `${PATH}Newbie.svg`),
      name: "A beginning of a great journey",
      description: "Limited edition NFT for achieving Newbie status on Peeranha protocol among the first.",
      attributes: "",
    },
    {
      maxCount: env === "prod" ? 3000 : 5, 
      lowerBound: env === "prod" ? 500 : 50, 
      type: AchievementsType.Rating, 
      path: path.resolve(__dirname, `${PATH}Junior.svg`),
      name: "Don't call me Junior!",
      description: "Limited edition NFT for achieving Junior status on Peeranha protocol among the first.",
      attributes: "",
    },
    {
      maxCount: env === "prod" ? 2000 : 4, 
      lowerBound: env === "prod" ? 1000 : 100, 
      type: AchievementsType.Rating, 
      path: path.resolve(__dirname, `${PATH}Resident.svg`),
      name: "Peeranha is my home",
      description: "Limited edition NFT for achieving Resident status on Peeranha protocol among the first.",
      attributes: "",
    },
    {
      maxCount: env === "prod" ? 1000 : 3, 
      lowerBound: env === "prod" ? 2500 : 250, 
      type: AchievementsType.Rating, 
      path: path.resolve(__dirname, `${PATH}Senior.svg`),
      name: "I can teach you anything",
      description: "Limited edition NFT for achieving Senior status on Peeranha protocol among the first.",
      attributes: "",
    },
    {
      maxCount: env === "prod" ? 500 : 2, 
      lowerBound: env === "prod" ? 5000 : 500, 
      type: AchievementsType.Rating, 
      path: path.resolve(__dirname, `${PATH}Hero.svg`),
      name: "This website needs a hero",
      description: "Limited edition NFT for achieving Hero status on Peeranha protocol among the first.",
      attributes: "",
    },
    {
      maxCount: env === "prod" ? 100 : 1, 
      lowerBound: env === "prod" ? 10000 : 1000, 
      type: AchievementsType.Rating, 
      path: path.resolve(__dirname, `${PATH}suphero.svg`),
      name: "A living Legend",
      description: "Limited edition NFT for achieving Superhero status on Peeranha protocol among the first.",
      attributes: "",
    },
  ]
}

module.exports = { achievements, getChainName, verifyContract, NFT, testAccount, PATH, testCommunity, testTag };