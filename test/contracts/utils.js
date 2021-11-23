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


module.exports = { wait, getBalance, getInt };
