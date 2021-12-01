const delay = ms => new Promise(res => setTimeout(res, ms));

const Stage = {"prod":0, "test":1, "unitTest":2}

async function wait(ms) {
    console.log("delay:" + ms)
    await delay(ms);
}

async function getBalance(contract, user) {
    const balance = await contract.balanceOf(user);
	return await parseInt(balance._hex, 16);
}

module.exports = { Stage, wait, getBalance };
