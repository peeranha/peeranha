const { ethers } = require("hardhat");
const { create } = require('ipfs-http-client');
const { Web3Storage, File, getFilesFromPath } = require("web3.storage");
const fetch = require('node-fetch');
const bs58 = require('bs58');
const { IPFS_API_URL, NFT_ADDRESS, USERLIB_ADDRESS, USER_ADDRESS, IPFS_API_URL_THE_GRAPH, IPFS_API_URL_WEB3 } = require('../env.json');
const { manuallyAchievements, mint_user_nft, COMPAING_PATH } = require('./common-action');
var fs = require('fs');
const CID = require('cids')
const {
  SAVE_FILE_SERVICE,
  WALLET_API_ENDPOINT
} = require("../env.json");

function getIpfsApi() {
  return create(IPFS_API_URL);
}

function getIpfsApiTheGraph() {
  return create(IPFS_API_URL_THE_GRAPH);
}

function getIpfsApiWEB3() {
  const token = IPFS_API_URL_WEB3;

  if (!token) {
    throw new Error(
      'WEB3_STORAGE_API_TOKEN environment variable is not defined',
    );
  }

  return new Web3Storage({ token });
}

async function saveDataWeb3Storage(data) {
  return getIpfsApiWEB3().put([new File([data], 'data')]);
}

async function saveNftData(text, encoding) {
  const buf = Buffer.from(text, 'utf8');

  const dataIpfsS3 = {
    "file": {
      "content": buf,
      "encoding": encoding
    }
  }

  const graphSaveResult = await getIpfsApiTheGraph().add(buf);
  // const ipfsSaveResult = await getIpfsApi().add(buf);
  const S3SaveResult = await saveDataIpfsS3(dataIpfsS3)
  const web3SaveResult = await saveDataWeb3Storage(buf);

  console.log(`Saved nft data to the graph IPFS - ${graphSaveResult.cid.toString()}`);
  console.log(`Saved nft data to S3 - ${JSON.stringify(S3SaveResult)}`)

  // console.log(`Saved nft data to IPFS: ${ipfsSaveResult.cid.toString()}`);
  console.log(`Saved nft data to the Web3 IPFS: ${web3SaveResult}`);

  return graphSaveResult.cid.toString();
}

async function saveImage(file, encoding) {
  const buf = Buffer.from(file);
  const dataIpfsS3 = {
    "file": {
      "content": buf,
      "encoding": encoding
    }
  }

  const graphSaveResult = await getIpfsApiTheGraph().add(buf);
  const S3SaveResult = await saveDataIpfsS3(dataIpfsS3)
  const web3SaveResult = await saveDataWeb3Storage(buf);

  console.log(`Saved nft image to the graph IPFS - ${graphSaveResult.cid.toString()}`)
  console.log(`Saved nft image to S3 - ${JSON.stringify(S3SaveResult)}`)
  console.log(`Saved nft image to the Web3 IPFS: ${web3SaveResult}`);

  // , {wrapWithDirectory: true}
  // {
	// 	path: 'tmp2',
	// 	content: 'DEF'
	
	// }
  
  return graphSaveResult.cid.toString();
}

async function saveDataIpfsS3(file) {
  return await callService(SAVE_FILE_SERVICE, file);
}

async function callService(service, props, isGet = false) {
  const url = new URL(WALLET_API_ENDPOINT + service);

  if (isGet) {
    url.search = new URLSearchParams(props).toString();
  }

  const rawResponse = await fetch(url, {
    method: isGet ? 'GET' : 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': isGet ? '' : 'application/json',
    },
    ...(!isGet ? { body: JSON.stringify(props) } : {}),
  });
  const response = await rawResponse.json();

  if (rawResponse.status < 200 || rawResponse.status > 208) {
    return {
      errorMessage: response.message,
      errorCode: response.code,
    };
  }

  return {
    OK: true,
    body: response,
  };
}

async function main() {
  console.log("Begin initializing NFTs");
  console.log(`Images path: ${COMPAING_PATH}`);
  
  const PeeranhaUser = await ethers.getContractFactory("PeeranhaUser", {
		libraries: {
			UserLib: USERLIB_ADDRESS,
		}
	});
  const peeranhaUser = await PeeranhaUser.attach(USER_ADDRESS);

  console.log(`user contract: ${USER_ADDRESS}, userLib: USERLIB_ADDRESS`);
  await initManuallyAchievement(peeranhaUser);
  // await mint_nft(peeranhaNFT);

  console.log('DONE!');
}

async function initManuallyAchievement(peeranhaUser) {
  for (const { maxCount, lowerBound, type, path, id, name, description, external_url, background_color, attributes } of manuallyAchievements("prod")) {
    console.log('\x1b[43m', `Start init nft id: ${id}.`, '\x1b[0m')
    const buffer = fs.readFileSync(path)
    // const a = await getIpfsApiWEB3().put(await getFilesFromPath(path));
    const imgIpfs = await saveImage(buffer, 'utf8');
    const imgWeb3Ipfs = "ipfs://" + new CID(imgIpfs).toV1().toString('base32');
  // // const a = new CID('QmeXnqJzFRMs9BEdArvVSFHdwxHgsM3bDzeXPa1EvB3ygv').toV1().toString('base32');
    console.log(`New web3 ipfs hash for image ${imgWeb3Ipfs}`);
    let nftData = {
      name: name,
      description: description,
      external_url: external_url,
      background_color: background_color,
      image: imgWeb3Ipfs,
      attributes: attributes,
    };
    const nftDataIPFS = await saveNftData(JSON.stringify(nftData), 'utf8');
    const nftDataWeb3IPFS = "ipfs://" + new CID(nftDataIPFS).toV1().toString('base32');
    console.log(`New nft web3 ipfs hash ${nftDataWeb3IPFS}`);

    const tx = await peeranhaUser.configureNewAchievement(maxCount, lowerBound, nftDataWeb3IPFS, type);
    console.log(`Sent transaction ${tx.hash} to init NFT ${name}`);

    console.log(`Waiting for confirmation`)
    await tx.wait();
    console.log('\x1b[42m', `Confirmed.`, '\x1b[0m');
  }
}

async function mint_nft(peeranhaUser) {
  for(let id = 31; id <= 31; id++) {
    console.log(`mint nft: ${id}`);

    const tx = await peeranhaUser.mintNFT("0x30Cc2CA9115E8869F4D69B683Af49b3F7d96925b", id);
    console.log(`Sent transaction ${tx.hash} to mint nft.`);

    console.log(`Waiting for confirmation`)
    await tx.wait();
    console.log(`Confirmed.`);
  }

  // console.log(`mint nft: ${33}`);

  //   const tx = await peeranhaNFT.mint_("0x30Cc2CA9115E8869F4D69B683Af49b3F7d96925b", 43);
  //   console.log(`Sent transaction ${tx.hash} to mint nft.`);

  //   console.log(`Waiting for confirmation`)
  //   await tx.wait();
  //   console.log(`Confirmed.`);

  // for (const { id, adresses } of mint_user_nft()) {
    // console.log(`mint nft: ${id} for ${adresses.length} users`);

    // adresses.forEach(function (user) {
      // console.log(`Mint nft: ${id} for ${user}`);
      // const tx = await peeranhaNFT.mint_("0x30Cc2CA9115E8869F4D69B683Af49b3F7d96925b", id);
      // console.log(`Sent transaction ${tx.hash} to mint nft.`);

      // console.log(`Waiting for confirmation`)
      // await tx.wait();
      // console.log(`Confirmed.`);
    // })
    // for (const user of adresses()) {
    //   console.log(`Mint nft: ${id} for ${user}`);
    //   const tx = await peeranhaNFT.mint(user, id);
    //   console.log(`Sent transaction ${tx.hash} to mint nft.`);

    //   console.log(`Waiting for confirmation`)
    //   await tx.wait();
    //   console.log(`Confirmed.`);
    // }
  // }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });