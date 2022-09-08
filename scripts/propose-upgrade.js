const { ethers, upgrades, defender } = require("hardhat");
const { COMMUNITY_ADDRESS, CONTENT_ADDRESS, NFT_ADDRESS, TOKEN_ADDRESS, USER_ADDRESS } = require('../env.json');

async function main() {
  const PostLib = await ethers.getContractFactory("PostLib");
  console.log("Deploying PostLib...");
  const postLib = await PostLib.deploy();
  console.log("PostLib deployed to:", postLib.address);

  // const PeeranhaUser = await ethers.getContractFactory("PeeranhaUser");
  // console.log("Proposing upgrade for PeeranhaUser...");
  // const peeranhaUser = await defender.proposeUpgrade(USER_ADDRESS, PeeranhaUser, {timeout: 0});
  // console.log("Peeranha User proposal at:", peeranhaUser.url);

  // const PeeranhaCommunity = await ethers.getContractFactory("PeeranhaCommunity");
  // console.log("Proposing upgrade for PeeranhaCommunity...");
  // const peeranhaCommunity = await defender.proposeUpgrade(COMMUNITY_ADDRESS, PeeranhaCommunity, {timeout: 0});
  // console.log("Peeranha Community proposal at:", peeranhaCommunity.url);

  const PeeranhaContent = await ethers.getContractFactory("PeeranhaContent", {
    libraries: {
      PostLib: postLib.address
    }
  });

  console.log("Proposing upgrade for PeeranhaContent...");
  const peeranhaContent = await defender.proposeUpgrade(CONTENT_ADDRESS, PeeranhaContent, {unsafeAllow: ["external-library-linking", "unsafeSkipStorageCheck"], timeout: 0});
  console.log("PeeranhaContent proposal at:", peeranhaContent.url);
  
  // const PeeranhaNFT = await ethers.getContractFactory("PeeranhaNFT");
  // console.log("Proposing upgrade for PeeranhaNFT...");
  // const peeranhaNFT = await defender.proposeUpgrade(NFT_ADDRESS, PeeranhaNFT, {timeout: 0});
  // console.log("Peeranha NFT proposal at:", peeranhaNFT.url);

  // const PeeranhaToken = await ethers.getContractFactory("PeeranhaToken");
  // console.log("Proposing upgrade for PeeranhaToken...");
  // const peeranhaToken = await defender.proposeUpgrade(TOKEN_ADDRESS, PeeranhaToken, {timeout: 0});
  // console.log("Peeranha token proposal at:", peeranhaToken.url);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });