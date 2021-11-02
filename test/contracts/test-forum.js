const { expect } = require("chai");
const crypto = require("crypto");
const PostTypeEnum = {"ExpertPost":0, "CommonPost":1, "Tutorial":2}

describe("Test post", function () {
	it("Test create post", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
        const ipfsHashes = getHashesContainer(2);
		const hashContainer = getHashContainer();
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await Promise.all(
			hashContainer.map(async (hash, index) => {
				return await peeranha
					.createPost(1, hash, PostTypeEnum.ExpertPost, [1]);
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

	it("Test create post without tag", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await expect(peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [])).to.be.revertedWith('At least one tag is required.');
	});

	it("Test create reply", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);

		const reply = await peeranha.getReply(1, 1);
		await expect(reply.author).to.equal(peeranha.deployTransaction.from);
		await expect(reply.isDeleted).to.equal(false);
		await expect(reply.ipfsDoc.hash).to.equal(hashContainer[1]);
	});

	it("Test create reply, post has been deleted", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.deletePost(1);

		await expect(peeranha.createReply(1, 0, hashContainer[1], false)).to.be.revertedWith('Post has been deleted.');
	});

	it("Test create reply without post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await expect(peeranha.createReply(1, 0, hashContainer[1], false)).to.be.revertedWith('Post does not exist.');
	});

	it("Test create comment", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createComment(1, 0, hashContainer[1]);

		const comment = await peeranha.getComment(1, 0, 1);
		await expect(comment.author).to.equal(peeranha.deployTransaction.from);
		await expect(comment.isDeleted).to.equal(false);
		await expect(comment.ipfsDoc.hash).to.equal(hashContainer[1]);
	});

	it("Test create comment, post has been deleted", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.deletePost(1);

		await expect(peeranha.createComment(1, 0, hashContainer[1])).to.be.revertedWith('Post has been deleted.');
	});

	it("Test create comment, reply has been deleted", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);
		await peeranha.deleteReply(1, 1);
		
		await expect(peeranha.createComment(1, 1, hashContainer[1])).to.be.revertedWith('Reply has been deleted.');
	});

	it("Test create comment without post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
		await peeranha.createUser(hashContainer[1]);

		await expect(peeranha.createComment(1, 0, hashContainer[1])).to.be.revertedWith('Post does not exist.');
	});

	it("Test create comment without reply", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await expect(peeranha.createComment(1, [1], hashContainer[1])).to.be.revertedWith('Reply does not exist.');
	});

	it("Test edit post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.editPost(1, 1, hashContainer[2], []);

		const post = await peeranha.getPost(1);
		await expect(post.author).to.equal(peeranha.deployTransaction.from);
		await expect(post.isDeleted).to.equal(false);
		await expect(post.ipfsDoc.hash).to.equal(hashContainer[2]);
	});

	it("Test edit post, without post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await expect(peeranha.editPost(1, 1, hashContainer[2], [])).to.be.revertedWith('Post does not exist.');
	});

	it("Test edit reply", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);
		await peeranha.editReply(1, 1, hashContainer[2]);

		const reply = await peeranha.getReply(1, 1);
		await expect(reply.author).to.equal(peeranha.deployTransaction.from);
		await expect(reply.isDeleted).to.equal(false);
		await expect(reply.ipfsDoc.hash).to.equal(hashContainer[2]);
	});

	it("Test edit reply, without post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await expect(peeranha.editReply(1, 1, hashContainer[2])).to.be.revertedWith('Post does not exist.');
	});

	it("Test edit reply, without reply", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await expect(peeranha.editReply(1, 1, hashContainer[2])).to.be.revertedWith('Reply does not exist.');
	});

	it("Test edit comment ", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createComment(1, 0, hashContainer[1]);
		await peeranha.editComment(1, 0, 1, hashContainer[2]);

		const reply = await peeranha.getComment(1, 0, 1);
		await expect(reply.author).to.equal(peeranha.deployTransaction.from);
		await expect(reply.isDeleted).to.equal(false);
		await expect(reply.ipfsDoc.hash).to.equal(hashContainer[2]);
	});

	it("Test edit comment, without post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
		await peeranha.createUser(hashContainer[1]);

		await expect(peeranha.editComment(1, 1, 1, hashContainer[2])).to.be.revertedWith('Post does not exist.');
	});

	it("Test edit comment, without reply", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await expect(peeranha.editComment(1, 1, 1, hashContainer[2])).to.be.revertedWith('Reply does not exist.');
	});

	it("Test edit comment, without comment", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);
		await expect(peeranha.editComment(1, 1, 1, hashContainer[2])).to.be.revertedWith('Comment does not exist.');
	});

	it("Test delete post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.deletePost(1);

		const post = await peeranha.getPost(1);
		await expect(post.isDeleted).to.equal(true);
	});

	it("Test delete post, without post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
		await peeranha.createUser(hashContainer[1]);
		await expect(peeranha.deletePost(1)).to.be.revertedWith('Post does not exist.');
	});

	it("Test delete reply ", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createReply(1, 0, hashContainer[1], false);
		await peeranha.deleteReply(1, 1);

		const reply = await peeranha.getReply(1, 1);
		await expect(reply.isDeleted).to.equal(true);
	});

	it("Test delete reply, without post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
		await peeranha.createUser(hashContainer[1]);
		await expect(peeranha.deleteReply(1, 1)).to.be.revertedWith('Post does not exist.');
	});

	it("Test delete reply, without reply", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await expect(peeranha.deleteReply(1, 1)).to.be.revertedWith('Reply does not exist.');
	});

	it("Test delete comment ", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createComment(1, 0, hashContainer[1]);
		await peeranha.deleteComment(1, 0, 1);

		const comment = await peeranha.getComment(1, 0, 1);
		await expect(comment.isDeleted).to.equal(true);
	});

	it("Test delete comment, without post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
		await peeranha.createUser(hashContainer[1]);
		await expect(peeranha.deleteComment(1, 0, 1)).to.be.revertedWith('Post does not exist.');
	});

	it("Test delete comment, without reply", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await expect(peeranha.deleteComment(1, [1], 1)).to.be.revertedWith('Reply does not exist.');
	});

	it("Test delete comment, without comment", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await expect(peeranha.deleteComment(1, 0, 1)).to.be.revertedWith('Comment does not exist.');

		await peeranha.createReply(1, 0, hashContainer[1], false);
		await expect(peeranha.deleteComment(1, 1, 1)).to.be.revertedWith('Comment does not exist.');
	});

	const createContract = async function () {
		const PostLib = await ethers.getContractFactory("PostLib")
		const postLib = await PostLib.deploy();
		const Peeranha = await ethers.getContractFactory("Peeranha", {
		libraries: {
				PostLib: postLib.address,
		}
		});
		const peeranha = await Peeranha.deploy();
		await peeranha.deployed();
        await peeranha.__Peeranha_init();
		return peeranha;
	};

	////
	//	TO DO AcceptReply
	///

	const author = "0x001d3F1ef827552Ae1114027BD3ECF1f086bA0F9";

	const getHashContainer = () => {
		return [
			"0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1",
			"0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82",
			"0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
		];
	};

	const getHashesContainer = (size) =>
        Array.apply(null, { length: size }).map(() => "0x" + crypto.randomBytes(32).toString("hex"));

    const createTags = (countOfTags) =>
        getHashesContainer(countOfTags).map((hash) => {
            const hash2 = '0x0000000000000000000000000000000000000000000000000000000000000000';
            return {"ipfsDoc": {hash, hash2}}
        });
});
