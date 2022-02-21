const fs = require("fs");
const path = require('path');

const Stage = {"prod":0, "test":1, "unitTest":2}

const prod = [
	{ field: 'constant QUICK_REPLY_TIME_SECONDS', value: 900, path: `../contracts/libraries/CommonLib.sol`, isFunction: false },
	{ field: 'constant DELETE_TIME', value: 604800, path: `../contracts/libraries/PostLib.sol`, isFunction: false },
	{ field: 'constant PERIOD_LENGTH', value: 604800, path: `../contracts/libraries/RewardLib.sol`, isFunction: false },
	{ field: 'function addUserRating', value: `/*`, path: `../contracts/Peeranha.sol`, isFunction: true },
	{ field: 'function setEnergy', value: `/*`, path: `../contracts/Peeranha.sol`, isFunction: true },
];

const test = [
	{ field: 'constant QUICK_REPLY_TIME_SECONDS', value: 900, path: `../contracts/libraries/CommonLib.sol`, isFunction: false },
	{ field: 'constant DELETE_TIME', value: 7200, path: `../contracts/libraries/PostLib.sol`, isFunction: false },     // 2 hour
	{ field: 'constant PERIOD_LENGTH', value: 7200, path: `../contracts/libraries/RewardLib.sol`, isFunction: false },  // 2 hour
	{ field: 'function addUserRating', value: ``, path: `../contracts/Peeranha.sol`, isFunction: true },
	{ field: 'function setEnergy', value: ``, path: `../contracts/Peeranha.sol`, isFunction: true },
];

const unitTest = [
	{ field: 'constant QUICK_REPLY_TIME_SECONDS', value: 3, path: `../contracts/libraries/CommonLib.sol`, isFunction: false },
	{ field: 'constant DELETE_TIME', value: 3, path: `../contracts/libraries/PostLib.sol`, isFunction: false },
	{ field: 'constant PERIOD_LENGTH', value: 3, path: `../contracts/libraries/RewardLib.sol`, isFunction: false },
	{ field: 'function addUserRating', value: ``, path: `../contracts/Peeranha.sol`, isFunction: true },
	{ field: 'function setEnergy', value: ``, path: `../contracts/Peeranha.sol`, isFunction: true },
];

async function changeFieldValue() {
    var stage = process.argv[2];

    let statusField;
    if (stage == Stage.prod) {
        statusField = prod;
        console.log("Prod");
    } else if (stage == Stage.test) {
        statusField = test;
        console.log("Test");
    } else {
        statusField = unitTest;
        console.log("Unit Test");
    }

    for (let i = 0; i < statusField.length; i++) {
        let fileContent = await fs.readFileSync(path.resolve(__dirname, statusField[i].path), "utf8");

        let pos = fileContent.indexOf(statusField[i].field);
        if (pos == -1) {
            console.log(`Field ${statusField[i].field} did not found!`)
            continue;
        } else {
            console.log(`Field ${statusField[i].field} founded.`)
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
