const { expect } = require("chai");

describe("Test post", function () {
	it("Test create post", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await Promise.all(
			hashContainer.map(async (hash, index) => {
				return await peeranha
					.connect(signers[index])
					.createPost(1, hash);
			})
		);

		await Promise.all(
			hashContainer.map(async (hash, index) => {
				const post = await peeranha.getPost(index + 1);
				//await expect(post.author).to.equal(peeranha.deployTransaction.from);		// ???
				await expect(post.isDeleted).to.equal(false);
				return await expect(post.ipfsDoc.hash).to.equal(hash);
			})
		);
	});

	it("Test create reply", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(1, hashContainer[0]);
		await peeranha.createReply(1, [], hashContainer[1], false);

		//await expect(peeranha.createReply(author, 1, false, [], hashContainer[1])).to.be.revertedWith('Post has been deleted.');

		const reply = await peeranha.getReply(1, [], 1);
		await expect(reply.author).to.equal(peeranha.deployTransaction.from);
		await expect(reply.isDeleted).to.equal(false);
		await expect(reply.ipfsDoc.hash).to.equal(hashContainer[1]);
	});

	it("Test create reply, post has been deleted", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(1, hashContainer[0]);
		await peeranha.deletePost(1);

		await expect(peeranha.createReply(1, [], hashContainer[1], false)).to.be.revertedWith('Post has been deleted.');
	});

	it("Test create reply without post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await expect(peeranha.createReply(1, [], hashContainer[1], false)).to.be.revertedWith('Post does not exist.');
	});

	it("Test create comment", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(1, hashContainer[0]);
		await peeranha.createComment(1, [], hashContainer[1]);

		const comment = await peeranha.getComment(1, [], 1);
		await expect(comment.author).to.equal(peeranha.deployTransaction.from);
		await expect(comment.isDeleted).to.equal(false);
		await expect(comment.ipfsDoc.hash).to.equal(hashContainer[1]);
	});

	it("Test edit post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(1, hashContainer[0]);
		await peeranha.editPost(1, 1, hashContainer[2]);

		const post = await peeranha.getPost(1);
		await expect(post.author).to.equal(peeranha.deployTransaction.from);
		await expect(post.isDeleted).to.equal(false);
		await expect(post.ipfsDoc.hash).to.equal(hashContainer[2]);
	});

	it("Test edit reply", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(1, hashContainer[0]);
		await peeranha.createReply(1, [], hashContainer[1], false);
		await peeranha.editReply(1, [], 1, hashContainer[2], true);

		const reply = await peeranha.getReply(1, [], 1);
		await expect(reply.author).to.equal(peeranha.deployTransaction.from);
		await expect(reply.isDeleted).to.equal(false);
		await expect(reply.ipfsDoc.hash).to.equal(hashContainer[2]);
	});

	it("Test edit comment ", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(1, hashContainer[0]);
		await peeranha.createComment(1, [], hashContainer[1]);
		await peeranha.editComment(1, [], 1, hashContainer[2]);

		const reply = await peeranha.getComment(1, [], 1);
		await expect(reply.author).to.equal(peeranha.deployTransaction.from);
		await expect(reply.isDeleted).to.equal(false);
		await expect(reply.ipfsDoc.hash).to.equal(hashContainer[2]);
	});

	it("Test delete post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(1, hashContainer[0]);
		await peeranha.deletePost(1);

		const post = await peeranha.getPost(1);
		await expect(post.isDeleted).to.equal(true);
		await expect(post.ipfsDoc.hash).to.equal(hashContainer[0]);
	});

	it("Test create reply, post has been deleted", async function () {
		const peeranha = await createContract();

		await expect(peeranha.deletePost(1)).to.be.revertedWith('Post has been deleted.');
	});

	it("Test delete reply ", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(1, hashContainer[0]);
		await peeranha.createReply(1, [], hashContainer[1], false);
		await peeranha.deleteReply(1, [], 1);

		const reply = await peeranha.getReply(1, [], 1);
		await expect(reply.isDeleted).to.equal(true);
		await expect(reply.ipfsDoc.hash).to.equal(hashContainer[1]);
	});

	it("Test delete comment ", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();

		await peeranha.createPost(1, hashContainer[0]);
		await peeranha.createComment(1, [], hashContainer[1]);
		await peeranha.deleteComment(1, [], 1);

		const reply = await peeranha.getComment(1, [], 1);
		await expect(reply.isDeleted).to.equal(true);
		await expect(reply.ipfsDoc.hash).to.equal(hashContainer[1]);
	});

	// it("Test delete reply ", async function () {
	// 	const peeranha = await createContract();
	// 	const hashContainer = getHashContainer();

	// 	await peeranha.createPost(1, hashContainer[0]);
	// 	await peeranha.createReply(1, [], hashContainer[1], false);
	// 	await peeranha.deleteReply(1, [], 1);

	// 	const reply = await peeranha.getReply(1, [], 1);
	// 	await expect(reply.isDeleted).to.equal(true);
	// 	await expect(reply.ipfsDoc.hash).to.equal(hashContainer[1]);
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
