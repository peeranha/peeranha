const fs = require("fs");
const path = require('path');

const Stage = {"prod":0, "staging": 1, "test":2, "unitTest":3}

const prod = [
    { field: 'constant QUICK_REPLY_TIME_SECONDS', value: 900, path: `../contracts/libraries/CommonLib.sol`, isFunction: false },
	{ field: 'constant DELETE_TIME', value: 604800, path: `../contracts/libraries/PostLib.sol`, isFunction: false },     // 2 hour
	{ field: 'constant PERIOD_LENGTH', value: 604800, path: `../contracts/libraries/RewardLib.sol`, isFunction: false },  // 2 hour
    { field: 'constant START_PERIOD_TIME', value: 1648875600, path: `../contracts/libraries/RewardLib.sol`, isFunction: false },
	{ field: 'constant REWARD_WEEK', value: 1000000, path: `../contracts/PeeranhaToken.sol`, isFunction: false },
	{ field: 'constant ACTIVE_USERS_IN_PERIOD', value: 1000, path: `../contracts/PeeranhaToken.sol`, isFunction: false },
	{ field: 'function addUserRating', value: `/*`, path: `../contracts/Peeranha.sol`, isFunction: true },
	{ field: 'function setEnergy', value: `/*`, path: `../contracts/Peeranha.sol`, isFunction: true },
];

const staging = [
    { field: 'constant QUICK_REPLY_TIME_SECONDS', value: 900, path: `../contracts/libraries/CommonLib.sol`, isFunction: false },
	{ field: 'constant DELETE_TIME', value: 604800, path: `../contracts/libraries/PostLib.sol`, isFunction: false },     // 2 hour
	{ field: 'constant PERIOD_LENGTH', value: 604800, path: `../contracts/libraries/RewardLib.sol`, isFunction: false },  // 2 hour
    { field: 'constant START_PERIOD_TIME', value: 1648875600, path: `../contracts/libraries/RewardLib.sol`, isFunction: false },
	{ field: 'constant REWARD_WEEK', value: 1000000, path: `../contracts/PeeranhaToken.sol`, isFunction: false },
	{ field: 'constant ACTIVE_USERS_IN_PERIOD', value: 1000, path: `../contracts/PeeranhaToken.sol`, isFunction: false },
	{ field: 'function addUserRating', value: `/*`, path: `../contracts/Peeranha.sol`, isFunction: true },
	{ field: 'function setEnergy', value: `/*`, path: `../contracts/Peeranha.sol`, isFunction: true },
];

const test = [
	{ field: 'constant QUICK_REPLY_TIME_SECONDS', value: 900, path: `../contracts/libraries/CommonLib.sol`, isFunction: false },
	{ field: 'constant DELETE_TIME', value: 7200, path: `../contracts/libraries/PostLib.sol`, isFunction: false },     // 2 hour
	{ field: 'constant PERIOD_LENGTH', value: 7200, path: `../contracts/libraries/RewardLib.sol`, isFunction: false },  // 2 hour
	{ field: 'constant REWARD_WEEK', value: 1000000, path: `../contracts/PeeranhaToken.sol`, isFunction: false },
	{ field: 'constant ACTIVE_USERS_IN_PERIOD', value: 1000, path: `../contracts/PeeranhaToken.sol`, isFunction: false },
	{ field: 'function addUserRating', value: ``, path: `../contracts/Peeranha.sol`, isFunction: true },
	{ field: 'function setEnergy', value: ``, path: `../contracts/Peeranha.sol`, isFunction: true },
];

const unitTest = [
	{ field: 'constant QUICK_REPLY_TIME_SECONDS', value: 6, path: `../contracts/libraries/CommonLib.sol`, isFunction: false },
	{ field: 'constant DELETE_TIME', value: 10, path: `../contracts/libraries/PostLib.sol`, isFunction: false },
	{ field: 'constant PERIOD_LENGTH', value: 3, path: `../contracts/libraries/RewardLib.sol`, isFunction: false },
	{ field: 'constant START_PERIOD_TIME', value: Math.floor(Date.now() / 1000), path: `../contracts/libraries/RewardLib.sol`, isFunction: false },
	{ field: 'constant REWARD_WEEK', value: 1000, path: `../contracts/PeeranhaToken.sol`, isFunction: false },
	{ field: 'constant ACTIVE_USERS_IN_PERIOD', value: 1, path: `../contracts/PeeranhaToken.sol`, isFunction: false },
	{ field: 'function addUserRating', value: ``, path: `../contracts/Peeranha.sol`, isFunction: true },
	{ field: 'function setEnergy', value: ``, path: `../contracts/Peeranha.sol`, isFunction: true },
];

async function changeFieldValue() {
    var stage = process.argv[2];

    let statusField;
    if (stage == Stage.prod) {
        statusField = prod;
        console.log("Setting environment variables to Prod values");
    } else if (stage == Stage.staging) {
        statusField = staging;
        console.log("Setting environment variables to Staging values");
    } else if (stage == Stage.test) {
        statusField = test;
        console.log("Setting environment variables to Test values");
    } else {
        statusField = unitTest;
        console.log("Setting environment variables to Unit Testing values");
    }

    for (let i = 0; i < statusField.length; i++) {
        let fileContent = await fs.readFileSync(path.resolve(__dirname, statusField[i].path), "utf8");

        let pos = fileContent.indexOf(statusField[i].field);
        if (pos == -1) {
            console.log('\x1b[41m', `Field ${statusField[i].field} was not found!`, '\x1b[0m')
            continue;
        } else {
            console.log(`Updated value '${statusField[i].field}'.`)
        }

        if (statusField[i].isFunction) {
            if (statusField[i].value == "/*") {     // set
                if (fileContent[pos - 1] == "*") continue;
                let endPos = fileContent.indexOf("}", pos + statusField[i].field.length);
                fileContent = fileContent.substring(0, endPos + 1) + '*/' + fileContent.substring(endPos + 1, fileContent.length);

                fileContent = fileContent.replace(statusField[i].field, statusField[i].value + statusField[i].field);
            } else {                                //unset
                if (fileContent[pos - 1] != "*") continue
                let endPos = fileContent.indexOf("}", pos + statusField[i].field.length);
                fileContent = fileContent.substring(0, endPos + 1) + '' + fileContent.substring(endPos + 3, fileContent.length);

                fileContent = fileContent.substring(0, pos - 2) + '' + fileContent.substring(pos, fileContent.length);
            }
            
        } else {
            let endPos = fileContent.indexOf(";", pos + statusField[i].field.length);
            let newString = fileContent.slice(pos, endPos);
            fileContent = fileContent.replace(newString, statusField[i].field + ' = ' + statusField[i].value);
        }

        await fs.writeFileSync(path.resolve(__dirname, statusField[i].path), fileContent);
    }   
}


changeFieldValue()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
