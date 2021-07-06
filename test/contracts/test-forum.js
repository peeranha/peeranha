const { expect } = require("chai");

describe("Test post", function () {
	it("Test post post", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await Promise.all(
			hashContainer.map(async (hash, index) => {
				return await peeranha
					.connect(signers[index])
					.createPost(author, 1, hash);
			})
		);

		await Promise.all(
			hashContainer.map(async (hash, index) => {
				const post = await peeranha.getPostByIndex(index + 1);
				await expect(post.author).to.equal(author);
				await expect(post.isDeleted).to.equal(false);
				return await expect(post.ipfsDoc.hash).to.equal(hash);
			})
		);
	});

	it("Test post reply", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(author, 1, hashContainer[0]);
		await peeranha.createReply(author, 1, false, [], hashContainer[1]);

		const reply = await peeranha.getReplyByPath(1, [], 1);
		await expect(reply.author).to.equal(author);
		await expect(reply.isDeleted).to.equal(false);
		await expect(reply.ipfsDoc.hash).to.equal(hashContainer[1]);
	});

	it("Test post comment", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(author, 1, hashContainer[0]);
		await peeranha.createComment(author, 1, [], hashContainer[1]);

		const comment = await peeranha.getCommentByPath(1, [], 1);
		await expect(comment.author).to.equal(author);
		await expect(comment.isDeleted).to.equal(false);
		await expect(comment.ipfsDoc.hash).to.equal(hashContainer[1]);
	});

	it("Test edit post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(author, 1, hashContainer[0]);
		await peeranha.editPost(author, 1, 1, hashContainer[2]);

		const post = await peeranha.getPostByIndex(1);
		await expect(post.author).to.equal(author);
		await expect(post.isDeleted).to.equal(false);
		await expect(post.ipfsDoc.hash).to.equal(hashContainer[2]);
	});

	it("Test edit reply", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(author, 1, hashContainer[0]);
		await peeranha.createReply(author, 1, false, [], hashContainer[1]);
		await peeranha.editReply(author, 1, [], 1, true, hashContainer[2]);

		const reply = await peeranha.getReplyByPath(1, [], 1);
		await expect(reply.author).to.equal(author);
		await expect(reply.isDeleted).to.equal(false);
		await expect(reply.ipfsDoc.hash).to.equal(hashContainer[2]);
	});

	it("Test edit comment ", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(author, 1, hashContainer[0]);
		await peeranha.createComment(author, 1, [], hashContainer[1]);
		await peeranha.editComment(author, 1, [], 1, hashContainer[2]);

		const reply = await peeranha.getCommentByPath(1, [], 1);
		await expect(reply.author).to.equal(author);
		await expect(reply.isDeleted).to.equal(false);
		await expect(reply.ipfsDoc.hash).to.equal(hashContainer[2]);
	});

	it("Test delete post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(author, 1, hashContainer[0]);
		await peeranha.deletePost(author, 1);

		const post = await peeranha.getPostByIndex(1);
		await expect(post.isDeleted).to.equal(true);
		await expect(post.ipfsDoc.hash).to.equal(hashContainer[0]);
	});

	it("Test delete reply ", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(author, 1, hashContainer[0]);
		await peeranha.createReply(author, 1, false, [], hashContainer[1]);
		await peeranha.deleteReply(author, 1, [], 1);

		const reply = await peeranha.getReplyByPath(1, [], 1);
		await expect(reply.isDeleted).to.equal(true);
		await expect(reply.ipfsDoc.hash).to.equal(hashContainer[1]);
	});

	it("Test delete comment ", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(author, 1, hashContainer[0]);
		await peeranha.createComment(author, 1, [], hashContainer[1]);
		await peeranha.deleteComment(author, 1, [], 1);

		const reply = await peeranha.getCommentByPath(1, [], 1);
		await expect(reply.isDeleted).to.equal(true);
		await expect(reply.ipfsDoc.hash).to.equal(hashContainer[1]);
	});

	it("Test delete reply ", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(author, 1, hashContainer[0]);
		await peeranha.createReply(author, 1, false, [], hashContainer[1]);
		await peeranha.deleteReply(author, 1, [], 1);

		const reply = await peeranha.getReplyByPath(1, [], 1);
		await expect(reply.isDeleted).to.equal(true);
		await expect(reply.ipfsDoc.hash).to.equal(hashContainer[1]);
	});

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
