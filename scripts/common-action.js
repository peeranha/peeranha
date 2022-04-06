const env = require("hardhat");
const path = require('path');

const PATH = `file://${path.resolve('./image')}/`;

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

const AchievementsType = { "Rating": 0 }

const achievements = (env) => {
  return [
    {
      maxCount: env === "prod" ? 700 : 10,  
      lowerBound: env === "prod" ? 100 : 10, 
      type: AchievementsType.Rating, 
      path: new URL(`${PATH}Newbie.svg`),
      name: "Newbie",
      description: "A beginning of a great journey",
      attributes: "TestInfo",
    },
    {
      maxCount: env === "prod" ? 500 : 5, 
      lowerBound: env === "prod" ? 500 : 50, 
      type: AchievementsType.Rating, 
      path: new URL(`${PATH}Junior.svg`),
      name: "Junior",
      description: "Don't call me Junior!",
      attributes: "TestInfo",
    },
    {
      maxCount: env === "prod" ? 300 : 4, 
      lowerBound: env === "prod" ? 1000 : 100, 
      type: AchievementsType.Rating, 
      path: new URL(`${PATH}Resident.svg`),
      name: "Resident",
      description: "Peeranha is my home",
      attributes: "TestInfo",
    },
    {
      maxCount: env === "prod" ? 150 : 3, 
      lowerBound: env === "prod" ? 2500 : 250, 
      type: AchievementsType.Rating, 
      path: new URL(`${PATH}Senior.svg`),
      name: "Senior",
      description: "I can teach you anything",
      attributes: "TestInfo",
    },
    {
      maxCount: env === "prod" ? 50 : 2, 
      lowerBound: env === "prod" ? 5000 : 500, 
      type: AchievementsType.Rating, 
      path: new URL(`${PATH}Hero.svg`),
      name: "Hero",
      description: "This website needs a hero",
      attributes: "TestInfo",
    },
    {
      maxCount: env === "prod" ? 10 : 1, 
      lowerBound: env === "prod" ? 10000 : 1000, 
      type: AchievementsType.Rating, 
      path: new URL(`${PATH}suphero.svg`),
      name: "Superhero",
      description: "A living Legend",
      attributes: "TestInfo",
    },
  ]
}

module.exports = { achievements, NFT, testAccount, PATH };