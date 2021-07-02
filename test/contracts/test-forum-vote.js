const { expect } = require("chai");

describe("Test vote", function () {
    it("Test upVote post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(author, 1, hashContainer[0]);
        await peeranha.voteItem(author, 0, [], 0, 0, 1);

		const post = await peeranha.getPostByIndex(0);
		await expect(post.rating).to.equal(1);
	});

	it("Test double upVote post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(author, 1, hashContainer[0]);

        await peeranha.voteItem(author, 0, [], 0, 0, 1);
		var post = await peeranha.getPostByIndex(0);
		await expect(post.rating).to.equal(1);

		await peeranha.voteItem(author, 0, [], 0, 0, 1);
		post = await peeranha.getPostByIndex(0);
		await expect(post.rating).to.equal(0);
	});

	it("Test downVote post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(author, 1, hashContainer[0]);

     await peeranha.voteItem(author, 0, [], 0, 0, 0);
		const post = await peeranha.getPostByIndex(0);
		await expect(post.rating).to.equal(-1);
	});

	it("Test double downVote post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(author, 1, hashContainer[0]);
		
        await peeranha.voteItem(author, 0, [], 0, 0, 0);
		var post = await peeranha.getPostByIndex(0);
		await expect(post.rating).to.equal(-1);

		await peeranha.voteItem(author, 0, [], 0, 0, 0);
		post = await peeranha.getPostByIndex(0);
		await expect(post.rating).to.equal(0);
	});

	it("Test downVote after upvote", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(author, 1, hashContainer[0]);
		
        await peeranha.voteItem(author, 0, [], 0, 0, 1);
		var post = await peeranha.getPostByIndex(0);
		await expect(post.rating).to.equal(1);

		await peeranha.voteItem(author, 0, [], 0, 0, 0);
		post = await peeranha.getPostByIndex(0);
		await expect(post.rating).to.equal(-1);
	});

	it("Test upvote after downvote", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(author, 1, hashContainer[0]);
		
        await peeranha.voteItem(author, 0, [], 0, 0, 0);
		var post = await peeranha.getPostByIndex(0);
		await expect(post.rating).to.equal(-1);

		await peeranha.voteItem(author, 0, [], 0, 0, 1);
		post = await peeranha.getPostByIndex(0);
		await expect(post.rating).to.equal(1);
	});

	// it("Test upvote reply", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();

	// 	await peeranha.createPost(author, 1, hashContainer[0]);
	// 	await peeranha.createReply(author, 0, false, [], hashContainer[1]);

	// 	// const reply = await peeranha.getReplyByPath(0, [], 0);
		
    //     await peeranha.voteItem(author, 0, [], 0, 0, 0);
	// 	var post = await peeranha.getPostByIndex(0);
	// 	await expect(post.rating).to.equal(-1);

	// 	await peeranha.voteItem(author, 0, [], 0, 0, 1);
	// 	post = await peeranha.getPostByIndex(0);
	// 	await expect(post.rating).to.equal(1);
	// });

	const createContract = async function () {
		const Peeranha = await ethers.getContractFactory("Peeranha");
		const peeranha = await Peeranha.deploy();
		await peeranha.deployed();
		return peeranha;
	};

	const author = "0x001d3F1ef827552Ae1114027BD3ECF1f086bA0F9";

	const getHashContainer = () => {
		return [
			"0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1",
			"0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82",
			"0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
		];
	};
});
