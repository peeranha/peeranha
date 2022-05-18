const env = require("hardhat");
const path = require('path');
const PATH = '../image/';

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
  title: "testCommunity6.new",
  description: "testCommunity.new",
  website: "www.new",
  language: "ua.new",
};

const testTag = {
  title: "testTagNew",
  description: "testNewTag1",
};

const AchievementsType = { "Rating": 0 }

const achievements = (env) => {
  return [
    {
      maxCount: env === "prod" ? 700 : 10,  
      lowerBound: env === "prod" ? 100 : 10, 
      type: AchievementsType.Rating, 
      path: path.resolve(__dirname, `${PATH}Newbie.svg`),
      name: "A beginning of a great journey",
      description: "NFT for achieving Newbie status among the first",
      attributes: "",
    },
    {
      maxCount: env === "prod" ? 500 : 5, 
      lowerBound: env === "prod" ? 500 : 50, 
      type: AchievementsType.Rating, 
      path: path.resolve(__dirname, `${PATH}Junior.svg`),
      name: "Don't call me Junior!",
      description: "",
      attributes: "",
    },
    {
      maxCount: env === "prod" ? 300 : 4, 
      lowerBound: env === "prod" ? 1000 : 100, 
      type: AchievementsType.Rating, 
      path: path.resolve(__dirname, `${PATH}Resident.svg`),
      name: "Peeranha is my home",
      description: "NFT for achieving Resident status among the first",
      attributes: "",
    },
    {
      maxCount: env === "prod" ? 150 : 3, 
      lowerBound: env === "prod" ? 2500 : 250, 
      type: AchievementsType.Rating, 
      path: path.resolve(__dirname, `${PATH}Senior.svg`),
      name: "I can teach you anything",
      description: "NFT for achieving Senior status among the first",
      attributes: "",
    },
    {
      maxCount: env === "prod" ? 50 : 2, 
      lowerBound: env === "prod" ? 5000 : 500, 
      type: AchievementsType.Rating, 
      path: path.resolve(__dirname, `${PATH}Hero.svg`),
      name: "This website needs a hero",
      description: "NFT for achieving Hero status among the first",
      attributes: "",
    },
    {
      maxCount: env === "prod" ? 10 : 1, 
      lowerBound: env === "prod" ? 10000 : 1000, 
      type: AchievementsType.Rating, 
      path: path.resolve(__dirname, `${PATH}suphero.svg`),
      name: "A living Legend",
      description: "NFT for achieving Superhero status among the first",
      attributes: "",
    },
  ]
}

module.exports = { achievements, NFT, testAccount, PATH, testCommunity, testTag };