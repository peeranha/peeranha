const { expect } = require("chai");
const {
	wait, createContract, getHashContainer, getHashesContainer, createTags, PostTypeEnum,
} = require('./utils');

////
//	TO DO AcceptReply, Tutorial posts
///

describe("Test post", function () {

	describe('Create post', function () {

		it("Test create expert post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await Promise.all(
				hashContainer.map(async (hash, index) => {
					return await peeranha
						.createPost(peeranha.deployTransaction.from, 1, hash, PostTypeEnum.ExpertPost, [1]);
				})
			);

			await Promise.all(
				hashContainer.map(async (hash, index) => {
					const post = await peeranha.getPost(index + 1);
					//await expect(post.author).to.equal(peeranha.deployTransaction.from);		// ???
					expect(post.isDeleted).to.equal(false);
					expect(post.postType).to.equal(PostTypeEnum.ExpertPost);
					return expect(post.ipfsDoc.hash).to.equal(hash);
				})
			);
		});

		it("Test create common post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await Promise.all(
				hashContainer.map(async (hash, index) => {
					return await peeranha
						.createPost(peeranha.deployTransaction.from, 1, hash, PostTypeEnum.CommonPost, [1]);
				})
			);

			await Promise.all(
				hashContainer.map(async (hash, index) => {
					const post = await peeranha.getPost(index + 1);
					//await expect(post.author).to.equal(peeranha.deployTransaction.from);		// ???
					expect(post.isDeleted).to.equal(false);
					expect(post.postType).to.equal(PostTypeEnum.CommonPost);
					return expect(post.ipfsDoc.hash).to.equal(hash);
				})
			);
		});

		it("Test create Tutorial post", async function () {
			const peeranha = await createContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await Promise.all(
				hashContainer.map(async (hash, index) => {
					return await peeranha
						.createPost(peeranha.deployTransaction.from, 1, hash, PostTypeEnum.Tutorial, [1]);
				})
			);

			await Promise.all(
				hashContainer.map(async (hash, index) => {
					const post = await peeranha.getPost(index + 1);
					//await expect(post.author).to.equal(peeranha.deployTransaction.from);		// ???
					expect(post.isDeleted).to.equal(false);
					expect(post.postType).to.equal(PostTypeEnum.Tutorial);
					return expect(post.ipfsDoc.hash).to.equal(hash);
				})
			);
		});

		it("Test create post without tag", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	
			await expect(peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [])).to.be.revertedWith('At least one tag is required.');
		});

		it("Test create post with non-existing tag", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await expect(peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [6])).to.be.revertedWith('Wrong tag id.');
			await expect(peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [2, 1, 6])).to.be.revertedWith('Wrong tag id.');
			await expect(peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [6, 2])).to.be.revertedWith('Wrong tag id.');
			await expect(peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [0])).to.be.revertedWith('The community does not have tag with 0 id.');
			await expect(peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [])).to.be.revertedWith('At least one tag is required.');
		});

		it("Test create post without ipfs hash", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await expect(peeranha.createPost(peeranha.deployTransaction.from, 1, '0x0000000000000000000000000000000000000000000000000000000000000000', PostTypeEnum.ExpertPost, [1]))
			.to.be.revertedWith('Invalid ipfsHash.');
		});

		it("Test create post by not registered user", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await expect(peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1])).to.be.revertedWith('Peeranha: must be an existing user');
		});

		it("Test create post for non-existing community", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			await peeranha.createUser(hashContainer[1]);

			await expect(peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1])).to.be.revertedWith('Community does not exist');
		});

		it("Test create post for frozen community", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
			await peeranha.freezeCommunity(1);

			await expect(peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1])).to.be.revertedWith('Community is frozen');
			await peeranha.unfreezeCommunity(1);

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		});
			
	// });

	// describe('Create reply', function () {

		it("Test create reply", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

			const reply = await peeranha.getReply(1, 1);
			expect(reply.author).to.equal(peeranha.deployTransaction.from);
			expect(reply.isDeleted).to.equal(false);
			expect(reply.ipfsDoc.hash).to.equal(hashContainer[1]);
		});

		it("Test create reply in tutorial", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await expect(peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false)).to.be.revertedWith('You can not publish replies in tutorial.');
		});

		it("Test create 4 replies (test gas)", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[1]);
			await peeranha.connect(signers[2]).createUser(hashContainer[1]);
			await peeranha.connect(signers[3]).createUser(hashContainer[1]);
			await peeranha.connect(signers[4]).createUser(hashContainer[1]);
			await peeranha.connect(signers[5]).createUser(hashContainer[1]);


			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			// await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await wait(5000)
			await peeranha.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false);
			await peeranha.connect(signers[3]).createReply(signers[3].address, 1, 0, hashContainer[1], false);
			await peeranha.connect(signers[4]).createReply(signers[4].address, 1, 0, hashContainer[1], false);
			await peeranha.connect(signers[5]).createReply(signers[5].address, 1, 0, hashContainer[1], false);
		});

		it("Test create official reply", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[2], false);

			const post = await peeranha.getPost(1);
			expect(post.officialReply).to.equal(0);

			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], true);

			const updatedPost = await peeranha.getPost(1);
			expect(updatedPost.officialReply).to.equal(2);
		});

		it("Test double replies in expert post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	
			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			await expect(peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false)).to.be.revertedWith('Users can not publish 2 replies for expert and common posts.');
		});
	
		it("Test double replies in common post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	
			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			await expect(peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false)).to.be.revertedWith('Users can not publish 2 replies for expert and common posts.');
		});
	
		xit("Test double replies in tutorial post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	
			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
		});

		it("Test create reply on reply in expert post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	
			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			await expect(peeranha.createReply(peeranha.deployTransaction.from, 1, 1, hashContainer[1], false)).to.be.revertedWith('User is forbidden to reply on reply for Expert and Common type of posts');
		});
	
		it("Test create reply on reply in common post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	
			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			await expect(peeranha.createReply(peeranha.deployTransaction.from, 1, 1, hashContainer[1], false)).to.be.revertedWith('User is forbidden to reply on reply for Expert and Common type of posts');
		});
	
		xit("Test create reply on reply in tutorial post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	
			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 1, hashContainer[1], false);
		});

		it("Test create two official replies for the same post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.setDelegateUser(peeranha.deployTransaction.from)
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createUserByDelegate(signers[1].address, hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
			await peeranha.giveCommunityModeratorPermission(signers[1].address, 1);

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[2], true);

			const post = await peeranha.getPost(1);
			expect(post.officialReply).to.equal(1);

			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], true);

			const updatedPost = await peeranha.getPost(1);
			expect(updatedPost.officialReply).to.equal(2);
		});

		it("Test create reply, post has been deleted", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.deletePost(peeranha.deployTransaction.from, 1);

			await expect(peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false)).to.be.revertedWith('Post has been deleted.');
		});

		it("Test create reply without post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await expect(peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false)).to.be.revertedWith('Post does not exist.');
		});

		it("Test create reply without ipfs hash", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			await expect(peeranha.createReply(peeranha.deployTransaction.from, 1, 0, '0x0000000000000000000000000000000000000000000000000000000000000000', false))
			.to.be.revertedWith('Invalid ipfsHash.');
		});

		it("Test create reply by not registered user", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await expect(peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[0], false))
			.to.be.revertedWith('Peeranha: must be an existing user');
		});

		it("Test create official reply by common user", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[0]);
			await peeranha.connect(signers[1]).createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await expect(peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[0], true))
			.to.be.revertedWith('Must have community moderator role');
		});
	});

	describe('Create comment', function () {

		it("Test create comment to post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createComment(peeranha.deployTransaction.from, 1, 0, hashContainer[1]);

			const comment = await peeranha.getComment(1, 0, 1);
			expect(comment.author).to.equal(peeranha.deployTransaction.from);
			expect(comment.isDeleted).to.equal(false);
			expect(comment.ipfsDoc.hash).to.equal(hashContainer[1]);
		});

		it("Test create comment to reply", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			await peeranha.createComment(peeranha.deployTransaction.from, 1, 1, hashContainer[1]);

			const comment = await peeranha.getComment(1, 1, 1);
			expect(comment.author).to.equal(peeranha.deployTransaction.from);
			expect(comment.isDeleted).to.equal(false);
			expect(comment.ipfsDoc.hash).to.equal(hashContainer[1]);
		});

		it("Test create comment, post has been deleted", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			await peeranha.deletePost(peeranha.deployTransaction.from, 1);

			await expect(peeranha.createComment(peeranha.deployTransaction.from, 1, 0, hashContainer[1])).to.be.revertedWith('Post has been deleted.');
			await expect(peeranha.createComment(peeranha.deployTransaction.from, 1, 1, hashContainer[1])).to.be.revertedWith('Post has been deleted.');
		});

		it("Test create comment, reply has been deleted", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			await peeranha.deleteReply(peeranha.deployTransaction.from, 1, 1);
			
			await expect(peeranha.createComment(peeranha.deployTransaction.from, 1, 1, hashContainer[1])).to.be.revertedWith('Reply has been deleted.');
		});

		it("Test create comment without post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			await peeranha.createUser(hashContainer[1]);

			await expect(peeranha.createComment(peeranha.deployTransaction.from, 1, 0, hashContainer[1])).to.be.revertedWith('Post does not exist.');
		});

		it("Test create comment without reply", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranha.createComment(peeranha.deployTransaction.from, 1, 1, hashContainer[1])).to.be.revertedWith('Reply does not exist.');
		});

		it("Test create comment by not registered user", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			
			await expect(peeranha.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[2]))
			.to.be.revertedWith('Peeranha: must be an existing user');
			await expect(peeranha.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[2]))
			.to.be.revertedWith('Peeranha: must be an existing user');
		});

		it("Test create comment without ipfs hash", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			
			await expect(peeranha.createComment(peeranha.deployTransaction.from, 1, 1, '0x0000000000000000000000000000000000000000000000000000000000000000'))
			.to.be.revertedWith('Invalid ipfsHash.');
		});
	});

	describe('Edit post', function () {

		it("Test edit post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[1], PostTypeEnum.CommonPost, [1]);
			await peeranha.editPost(peeranha.deployTransaction.from, 1, hashContainer[2], []);
			await peeranha.editPost(peeranha.deployTransaction.from, 2, hashContainer[0], [2]);

			const post = await peeranha.getPost(1);
			const post2 = await peeranha.getPost(2);
			expect(post.author).to.equal(peeranha.deployTransaction.from);
			expect(post.isDeleted).to.equal(false);
			expect(post.ipfsDoc.hash).to.equal(hashContainer[2]);
			expect(post2.ipfsDoc.hash).to.equal(hashContainer[0]);
			expect(post.tags[0]).to.equal(1);
			expect(post2.tags[0]).to.equal(2);
		});

		it("Test edit post (wrong tag)", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
	
			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await expect(peeranha.editPost(peeranha.deployTransaction.from, 1, hashContainer[2], [6])).to.be.revertedWith('Wrong tag id.');
			await expect(peeranha.editPost(peeranha.deployTransaction.from, 1, hashContainer[2], [2, 1, 6])).to.be.revertedWith('Wrong tag id.');
			await expect(peeranha.editPost(peeranha.deployTransaction.from, 1, hashContainer[2], [6, 2])).to.be.revertedWith('Wrong tag id.');
			await expect(peeranha.editPost(peeranha.deployTransaction.from, 1, hashContainer[2], [0])).to.be.revertedWith('The community does not have tag with 0 id.');
		});

		it("Test edit post by not registered user", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranha.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[2], []))
			.to.be.revertedWith('Peeranha: must be an existing user');
		});

		it("Test edit not own post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranha.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[2], []))
			.to.be.revertedWith('You can not edit this post. It is not your.');
		});

		it("Test edit post with invalid ipfs hash", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranha.editPost(peeranha.deployTransaction.from, 1, '0x0000000000000000000000000000000000000000000000000000000000000000', []))
			.to.be.revertedWith('Invalid ipfsHash.');
		});

		it("Test edit post, without post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await expect(peeranha.editPost(peeranha.deployTransaction.from, 1, hashContainer[2], [])).to.be.revertedWith('Post does not exist.');
		});

		it("Test edit post, post hes been deleted", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.deletePost(peeranha.deployTransaction.from, 1);

			await expect(peeranha.editPost(peeranha.deployTransaction.from, 1, hashContainer[2], [])).to.be.revertedWith('Post has been deleted.');
		});
	});

	describe('Edit reply', function () {

		it("Test edit reply", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			await peeranha.editReply(peeranha.deployTransaction.from, 1, 1, hashContainer[2]);

			const reply = await peeranha.getReply(1, 1);
			expect(reply.author).to.equal(peeranha.deployTransaction.from);
			expect(reply.isDeleted).to.equal(false);
			expect(reply.ipfsDoc.hash).to.equal(hashContainer[2]);
		});

		it("Test edit reply with invalid ipfs hash", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

			await expect(peeranha.editReply(peeranha.deployTransaction.from, 1, 1, '0x0000000000000000000000000000000000000000000000000000000000000000'))
			.to.be.revertedWith('Invalid ipfsHash.');
		});
		
		it("Test edit reply by not registered user", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			
			await expect(peeranha.connect(signers[1]).editReply(signers[1].address, 1, 1, hashContainer[2]))
			.to.be.revertedWith('Peeranha: must be an existing user');
		});

		it("Test edit not own reply", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			
			await expect(peeranha.connect(signers[1]).editReply(signers[1].address, 1, 1, hashContainer[2]))
			.to.be.revertedWith('You can not edit this Reply. It is not your.');
		});

		it("Test edit reply, without post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await expect(peeranha.editReply(peeranha.deployTransaction.from, 1, 1, hashContainer[2])).to.be.revertedWith('Post does not exist.');
		});

		it("Test edit reply, without reply", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranha.editReply(peeranha.deployTransaction.from, 1, 1, hashContainer[2])).to.be.revertedWith('Reply does not exist.');
		});

		it("Test edit reply, post has been deleted", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			await peeranha.deletePost(peeranha.deployTransaction.from, 1);

			await expect(peeranha.editReply(peeranha.deployTransaction.from, 1, 1, hashContainer[2])).to.be.revertedWith('Post has been deleted.');
		});

		it("Test edit reply, reply has been deleted", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			await peeranha.deleteReply(peeranha.deployTransaction.from, 1, 1);

			await expect(peeranha.editReply(peeranha.deployTransaction.from, 1, 1, hashContainer[2])).to.be.revertedWith('Reply has been deleted.');
		});
	});

	describe('Edit comment', function () {

		it("Test edit comment", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createComment(peeranha.deployTransaction.from, 1, 0, hashContainer[1]);
			await peeranha.editComment(peeranha.deployTransaction.from, 1, 0, 1, hashContainer[2]);

			const reply = await peeranha.getComment(1, 0, 1);
			expect(reply.author).to.equal(peeranha.deployTransaction.from);
			expect(reply.isDeleted).to.equal(false);
			expect(reply.ipfsDoc.hash).to.equal(hashContainer[2]);
		});

		it("Test edit comment with invalid ipfs hash", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createComment(peeranha.deployTransaction.from, 1, 0, hashContainer[1]);

			await expect(peeranha.editComment(peeranha.deployTransaction.from, 1, 0, 1, '0x0000000000000000000000000000000000000000000000000000000000000000'))
			.to.be.revertedWith('Invalid ipfsHash.');
		});

		it("Test edit comment by not registered user", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createComment(peeranha.deployTransaction.from, 1, 0, hashContainer[1]);

			await expect(peeranha.connect(signers[1]).editComment(signers[1].address, 1, 0, 1, hashContainer[2]))
			.to.be.revertedWith('Peeranha: must be an existing user');
		});

		it("Test edit not own comment", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createComment(peeranha.deployTransaction.from, 1, 0, hashContainer[1]);

			await expect(peeranha.connect(signers[1]).editComment(signers[1].address, 1, 0, 1, hashContainer[2]))
			.to.be.revertedWith('You can not edit this comment. It is not your.');
		});

		it("Test edit comment, without post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			await peeranha.createUser(hashContainer[1]);

			await expect(peeranha.editComment(peeranha.deployTransaction.from, 1, 1, 1, hashContainer[2])).to.be.revertedWith('Post does not exist.');
		});

		it("Test edit comment, without reply", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranha.editComment(peeranha.deployTransaction.from, 1, 1, 1, hashContainer[2])).to.be.revertedWith('Reply does not exist.');
		});

		it("Test edit comment, without comment", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			await expect(peeranha.editComment(peeranha.deployTransaction.from, 1, 1, 1, hashContainer[2])).to.be.revertedWith('Comment does not exist.');
		});

		it("Test edit comment, post has been deleted", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[0], false);
			await peeranha.createComment(peeranha.deployTransaction.from, 1, 0, hashContainer[1]);
			await peeranha.createComment(peeranha.deployTransaction.from, 1, 1, hashContainer[1]);
			await peeranha.deletePost(peeranha.deployTransaction.from, 1);

			await expect(peeranha.editComment(peeranha.deployTransaction.from, 1, 0, 1, hashContainer[2])).to.be.revertedWith('Post has been deleted.');
			await expect(peeranha.editComment(peeranha.deployTransaction.from, 1, 1, 1, hashContainer[2])).to.be.revertedWith('Post has been deleted.');
		});

		it("Test edit comment, reply has been deleted", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[0], false);
			await peeranha.createComment(peeranha.deployTransaction.from, 1, 1, hashContainer[1]);
			await peeranha.deleteReply(peeranha.deployTransaction.from, 1, 1);

			await expect(peeranha.editComment(peeranha.deployTransaction.from, 1, 1, 1, hashContainer[2])).to.be.revertedWith('Reply has been deleted.');		
		});

		it("Test edit comment, comment has been deleted", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[0], false);
			await peeranha.createComment(peeranha.deployTransaction.from, 1, 0, hashContainer[1]);
			await peeranha.createComment(peeranha.deployTransaction.from, 1, 1, hashContainer[1]);
			await peeranha.deleteComment(peeranha.deployTransaction.from, 1, 0, 1);
			await peeranha.deleteComment(peeranha.deployTransaction.from, 1, 1, 1);

			await expect(peeranha.editComment(peeranha.deployTransaction.from, 1, 0, 1, hashContainer[2])).to.be.revertedWith('Comment has been deleted.');
			await expect(peeranha.editComment(peeranha.deployTransaction.from, 1, 1, 1, hashContainer[2])).to.be.revertedWith('Comment has been deleted.');
		});
	});

	describe('Delete post', function () {

		it("Test delete post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.deletePost(peeranha.deployTransaction.from, 1);

			const post = await peeranha.getPost(1);
			expect(post.isDeleted).to.equal(true);
		});

		it("Test delete post by not registered user", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await expect(peeranha.connect(signers[1]).deletePost(signers[1].address, 1))
			.to.be.revertedWith('Peeranha: must be an existing user');
		});

		it("Test delete not own post by common user", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[0]);
			await peeranha.connect(signers[1]).createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await expect(peeranha.connect(signers[1]).deletePost(signers[1].address, 1))
			.to.be.revertedWith('not_allowed_delete');
		});

		it("Test delete post with reply", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranha.deletePost(peeranha.deployTransaction.from, 1);

			expect((await peeranha.getPost(1)).isDeleted).to.be.true;
		});

		it("Test delete post, without post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			await peeranha.createUser(hashContainer[1]);
			await expect(peeranha.deletePost(peeranha.deployTransaction.from, 1)).to.be.revertedWith('Post does not exist.');
		});

		it("Test delete post, post has been deleted", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.deletePost(peeranha.deployTransaction.from, 1);

			await expect(peeranha.deletePost(peeranha.deployTransaction.from, 1)).to.be.revertedWith('Post has been deleted.');
		});
	});

	describe('Delete reply', function () {

		it("Test delete reply ", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			await peeranha.deleteReply(peeranha.deployTransaction.from, 1, 1);

			const reply = await peeranha.getReply(1, 1);
			expect(reply.isDeleted).to.equal(true);
		});

		it("Test delete reply by not registered user", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

			await expect(peeranha.connect(signers[1]).deleteReply(signers[1].address, 1, 1))
			.to.be.revertedWith('Peeranha: must be an existing user');
		});

		it("Test delete not own reply by common user", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[0]);
			await peeranha.connect(signers[1]).createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

			await expect(peeranha.connect(signers[1]).deleteReply(signers[1].address, 1, 1))
			.to.be.revertedWith('not_allowed_delete');
		});

		it("Test delete accepted reply", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranha.changeStatusBestReply(peeranha.deployTransaction.from, 1, 1);
			await expect(peeranha.deleteReply(peeranha.deployTransaction.from, 1, 1)).to.be.revertedWith('You can not delete the best reply.');
		});

		it("Test delete reply, without post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			await peeranha.createUser(hashContainer[1]);
			await expect(peeranha.deleteReply(peeranha.deployTransaction.from, 1, 1)).to.be.revertedWith('Post does not exist.');
		});

		it("Test delete reply, without reply", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranha.deleteReply(peeranha.deployTransaction.from, 1, 1)).to.be.revertedWith('Reply does not exist.');
		});

		it("Test delete reply, post has been deleted", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			await peeranha.deletePost(peeranha.deployTransaction.from, 1);

			await expect(peeranha.deleteReply(peeranha.deployTransaction.from, 1, 1)).to.be.revertedWith('Post has been deleted.');
		});

		it("Test delete reply, reply has been deleted", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			await peeranha.deleteReply(peeranha.deployTransaction.from, 1, 1);

			await expect(peeranha.deleteReply(peeranha.deployTransaction.from, 1, 1)).to.be.revertedWith('Reply has been deleted.');
		});
	});

	describe('Delete comment', function () {

		it("Test delete comment ", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createComment(peeranha.deployTransaction.from, 1, 0, hashContainer[1]);
			await peeranha.deleteComment(peeranha.deployTransaction.from, 1, 0, 1);

			const comment = await peeranha.getComment(1, 0, 1);
			expect(comment.isDeleted).to.equal(true);
		});

		it("Test delete comment by not registered user", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			await peeranha.createComment(peeranha.deployTransaction.from, 1, 0, hashContainer[1]);
			await peeranha.createComment(peeranha.deployTransaction.from, 1, 1, hashContainer[1]);

			await expect(peeranha.connect(signers[1]).deleteComment(signers[1].address, 1, 0, 1))
			.to.be.revertedWith('Peeranha: must be an existing user');
			await expect(peeranha.connect(signers[1]).deleteComment(signers[1].address, 1, 1, 1))
			.to.be.revertedWith('Peeranha: must be an existing user');
		});

		it("Test delete not own comment by common user", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[0]);
			await peeranha.connect(signers[1]).createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			await peeranha.createComment(peeranha.deployTransaction.from, 1, 0, hashContainer[1]);
			await peeranha.createComment(peeranha.deployTransaction.from, 1, 1, hashContainer[1]);
			
			await expect(peeranha.connect(signers[1]).deleteComment(signers[1].address, 1, 0, 1))
			.to.be.revertedWith('not_allowed_delete');
			await expect(peeranha.connect(signers[1]).deleteComment(signers[1].address, 1, 1, 1))
			.to.be.revertedWith('not_allowed_delete');
		});

		it("Test delete comment, without post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			await peeranha.createUser(hashContainer[1]);
			await expect(peeranha.deleteComment(peeranha.deployTransaction.from, 1, 0, 1)).to.be.revertedWith('Post does not exist.');
		});

		it("Test delete comment, without reply", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranha.deleteComment(peeranha.deployTransaction.from, 1, [1], 1)).to.be.revertedWith('Reply does not exist.');
		});

		it("Test delete comment, without comment", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranha.deleteComment(peeranha.deployTransaction.from, 1, 0, 1)).to.be.revertedWith('Comment does not exist.');

			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			await expect(peeranha.deleteComment(peeranha.deployTransaction.from, 1, 1, 1)).to.be.revertedWith('Comment does not exist.');
		});

		it("Test delete comment, post has been deleted", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			await peeranha.createComment(peeranha.deployTransaction.from, 1, 0, hashContainer[1]);
			await peeranha.createComment(peeranha.deployTransaction.from, 1, 1, hashContainer[1]);
			await peeranha.deletePost(peeranha.deployTransaction.from, 1);

			await expect(peeranha.deleteComment(peeranha.deployTransaction.from, 1, 0, 1)).to.be.revertedWith('Post has been deleted.');
			await expect(peeranha.deleteComment(peeranha.deployTransaction.from, 1, 1, 1)).to.be.revertedWith('Post has been deleted.');
		});

		it("Test delete comment, reply has been deleted", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			await peeranha.createComment(peeranha.deployTransaction.from, 1, 1, hashContainer[1]);
			await peeranha.deleteReply(peeranha.deployTransaction.from, 1, 1);

			await expect(peeranha.deleteComment(peeranha.deployTransaction.from, 1, 1, 1)).to.be.revertedWith('Reply has been deleted.');
		});

		it("Test delete comment, comment has been deleted", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);
			await peeranha.createComment(peeranha.deployTransaction.from, 1, 0, hashContainer[1]);
			await peeranha.createComment(peeranha.deployTransaction.from, 1, 1, hashContainer[1]);
			await peeranha.deleteComment(peeranha.deployTransaction.from, 1, 0, 1);
			await peeranha.deleteComment(peeranha.deployTransaction.from, 1, 1, 1);

			await expect(peeranha.deleteComment(peeranha.deployTransaction.from, 1, 0, 1)).to.be.revertedWith('Comment has been deleted.');
			await expect(peeranha.deleteComment(peeranha.deployTransaction.from, 1, 1, 1)).to.be.revertedWith('Comment has been deleted.');
		});
	});
});
