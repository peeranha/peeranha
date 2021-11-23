const { create } = require('ipfs-http-client');
const { NFT } = require('../../scripts/common-action');
const IPFS_API_URL = "https://api.thegraph.com/ipfs/api/v0"
const bs58 = require('bs58');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function wait(ms) {
    console.log("delay:" + ms)
    await delay(ms);
}

async function getBalance(contract, user) {
    const balance = await contract.balanceOf(user);
	return await getInt(balance);
}

async function getInt(value) {
	return await parseInt(value._hex, 16);
}

async function getURI(path) {
    const buffer = Buffer.from(path);

    const saveResult = await getIpfsApi().add(buffer);
    const ipfsImage = await getBytes32FromData(saveResult);
    let nft = NFT;
    nft.image = ipfsImage;

	return await getBytes32FromData(nft);
}

function getIpfsApi() {
    return create(IPFS_API_URL);
}

async function getBytes32FromData(data) {
    const ipfsHash = await saveText(JSON.stringify(data));
    return getBytes32FromIpfsHash(ipfsHash)
}

async function saveText(text) {
    const buf = Buffer.from(text, 'utf8');
    const saveResult = await getIpfsApi().add(buf);
    return saveResult.cid.toString();
}

function getBytes32FromIpfsHash(ipfsListing) {
    return "0x"+bs58.decode(ipfsListing).slice(2).toString('hex')
}


module.exports = { wait, getBalance, getInt, getURI };
