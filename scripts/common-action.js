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

/* en, zh, es, vi */

const testCommunity = {
  name: "test Community6.new",
  description: "test Community.new",
  language: "zh",
  website: "www.new",
  translations: [
    {
      name: "auto translate 1",
      description: "test Community Language2",
      enableAutotranslation: true,
      language: "es",
    },
    {
      name: "",
      description: "",
      enableAutotranslation: false,
      language: "vi",
    }
  ]
};

const testTag = {
  name: "test TagNew",
  description: "test NewTag1",
  language: 1,
  translations: [
    {
      name: "test TagLanguage2",
      description: "test Language2 Tag1",
      language: 2,
    },
    {
      name: "test TagLanguage3",
      description: "test Language3 Tag1",
      language: 3,
    }
  ]
};

const testPost = {
  title: "Test post",
  content: "Test post description"
};

const postTranslation = {
  title: "Test post translation vietnamese edited",
  content: "Test post description translation vietnamese edited"
};

const testReply = {
  content: "Second reply postID 1"
};

const replyTranslation = {
  content: "Test reply translation"
};

const testComment = {
  content: "Comment to reply"
};

const commentTranslation = {
  content: "Test comment translation to reply"
};

const AchievementsType = { "Rating": 0, "Manual": 1 }
const Language = { "English": 0, "Chinese": 1, "Spanish": 2, "Vietnamese": 3 }

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

module.exports = { achievements, Language, NFT, testAccount, PATH, testCommunity, testTag, testPost, testReply, testComment, postTranslation, replyTranslation, commentTranslation };