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

const achievements = [
  { maxCount: 20, lowerBound: 15, type: AchievementsType.Rating, path: "../image/image1.png"},
  { maxCount: 10, lowerBound: 40, type: AchievementsType.Rating, path: "../image/image2.png"},
  { maxCount: 5, lowerBound: 100, type: AchievementsType.Rating, path: "../image/image3.png"},
];

module.exports = { achievements, NFT, testAccount };