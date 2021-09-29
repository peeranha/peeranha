const delay = ms => new Promise(res => setTimeout(res, ms));

async function wait(ms) {
    console.log("delay:" + ms)
    await delay(ms);
}

module.exports = { wait };
