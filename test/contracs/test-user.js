const { expect } = require("chai");

describe("Test question", function () {
	it("Test post question ", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await Promise.all(
			hashContainer.map(async (hash, index) => {
				return await peeranha
					.connect(signers[index])
					.postQuestion("0x001d3f1ef827552ae1114027bd3ecf1f086ba0f9", 5, hash);
			})
		);
		console.log("-----------------------------------------------");
		await Promise.all(
			hashContainer.map(async (hash, index) => {
				const question = await peeranha.getQuestionByIndex(index);
				console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++");
				console.log(question);
				// return await expect(user.ipfsHash).to.equal(hash);
			})
		);
	});

	const createContract = async function () {
		const Peeranha = await ethers.getContractFactory("Peeranha");
		const peeranha = await Peeranha.deploy();
		await peeranha.deployed();
		return peeranha;
	};

	const getHashContainer = () => {
		return [
			"0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1",
			"0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82",
			"0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
		];
	};
});
