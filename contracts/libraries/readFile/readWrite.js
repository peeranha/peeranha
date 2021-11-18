const fs = require("fs");

const Stage = {"prod":0, "test":1, "unitTest":2}

const prod = [
	{ field: 'constant QUICK_REPLY_TIME_SECONDS', value: 900, path: `../CommonLib.sol` },
	{ field: 'constant DELETE_TIME', value: 604800, path: `../PostLib.sol` },
	{ field: 'constant PERIOD_LENGTH', value: 604800, path: `../RewardLib.sol` },
];

const test = [
	{ field: 'constant QUICK_REPLY_TIME_SECONDS', value: 900, path: `../CommonLib.sol` },
	{ field: 'constant DELETE_TIME', value: 259200, path: `../PostLib.sol` },     // 3 days
	{ field: 'constant PERIOD_LENGTH', value: 259200, path: `../RewardLib.sol` },  // 3 days
];

const unitTest = [
	{ field: 'constant QUICK_REPLY_TIME_SECONDS', value: 3, path: `../CommonLib.sol` },
	{ field: 'constant DELETE_TIME', value: 3, path: `../PostLib.sol` },
	{ field: 'constant PERIOD_LENGTH', value: 3, path: `../RewardLib.sol` },
];



async function changeFieldValue(stage) {
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
        let fileContent = await fs.readFileSync(statusField[i].path, "utf8");

        let pos = fileContent.indexOf(statusField[i].field);
        if (pos == -1) {
            console.log("Field did not found!")
        } else {
            console.log("Field founded.")
        }

        let endPos = fileContent.indexOf(";", pos + statusField[i].field.length);
        let newString = fileContent.slice(pos, endPos);
        fileContent = fileContent.replace(newString, statusField[i].field + ' = ' + statusField[i].value);

        await fs.writeFileSync(statusField[i].path, fileContent)
    }   
}
  
changeFieldValue(Stage.unitTest)
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
