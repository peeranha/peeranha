const { disableExperimentalFragmentVariables } = require("@apollo/client");
const { expect } = require("chai");
const { 
	wait, createPeerenhaAndTokenContract, registerTwoUsers, createUserWithAnotherRating, getHashContainer, getHashesContainer, createTags,
	PostTypeEnum, StartRating, StartRatingWithoutAction, deleteTime, DeleteOwnReply, QuickReplyTime,
    DownvoteExpertPost, UpvotedExpertPost, DownvotedExpertPost, DownvoteCommonPost, UpvotedCommonPost, DownvotedCommonPost,
    ModeratorDeletePost, DownvoteExpertReply, UpvotedExpertReply, DownvotedExpertReply, AcceptExpertReply, AcceptedExpertReply, 
    FirstExpertReply, QuickExpertReply, DownvoteCommonReply, UpvotedCommonReply, DownvotedCommonReply, AcceptCommonReply,
    AcceptedCommonReply, FirstCommonReply, QuickCommonReply, ModeratorDeleteReply, ModeratorDeleteComment,
	DownvoteTutorial, UpvotedTutorial, DownvotedTutorial, DeleteOwnPost,
} = require('./utils');

////
//	TO DO AcceptReply, Tutorial posts
///
// to do
// create post/reply/comment/update profile (not exist user)
///

describe("Test post", function () {

	describe('Create post', function () {

		it("Test create expert post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await Promise.all(
				hashContainer.map(async (hash, index) => {
					return await peeranhaContent
						.createPost(1, hash, PostTypeEnum.ExpertPost, [1]);
				})
			);

			await Promise.all(
				hashContainer.map(async (hash, index) => {
					const post = await peeranhaContent.getPost(index + 1);
					//await expect(post.author).to.equal(peeranhaContent.deployTransaction.from);		// ???
					expect(post.isDeleted).to.equal(false);
					expect(post.postType).to.equal(PostTypeEnum.ExpertPost);
					return expect(post.ipfsDoc.hash).to.equal(hash);
				})
			);
		});

		it("Test create common post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await Promise.all(
				hashContainer.map(async (hash, index) => {
					return await peeranhaContent
						.createPost(1, hash, PostTypeEnum.CommonPost, [1]);
				})
			);

			await Promise.all(
				hashContainer.map(async (hash, index) => {
					const post = await peeranhaContent.getPost(index + 1);
					//await expect(post.author).to.equal(peeranhaContent.deployTransaction.from);		// ???
					expect(post.isDeleted).to.equal(false);
					expect(post.postType).to.equal(PostTypeEnum.CommonPost);
					return expect(post.ipfsDoc.hash).to.equal(hash);
				})
			);
		});

		it("Test create Tutorial post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await Promise.all(
				hashContainer.map(async (hash, index) => {
					return await peeranhaContent
						.createPost(1, hash, PostTypeEnum.Tutorial, [1]);
				})
			);

			await Promise.all(
				hashContainer.map(async (hash, index) => {
					const post = await peeranhaContent.getPost(index + 1);
					//await expect(post.author).to.equal(peeranhaContent.deployTransaction.from);		// ???
					expect(post.isDeleted).to.equal(false);
					expect(post.postType).to.equal(PostTypeEnum.Tutorial);
					return expect(post.ipfsDoc.hash).to.equal(hash);
				})
			);
		});

		it("Test create Documentation post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();

			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);

			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await Promise.all(
				hashContainer.map(async (hash, index) => {
					return await peeranhaContent.connect(signers[0])
						.createPost(1, hash, PostTypeEnum.Documentation, []);	
				})
			);			
			
			await Promise.all(
				hashContainer.map(async (hash, index) => {
					const post = await peeranhaContent.getPost(index + 1);
					expect(post.isDeleted).to.equal(false);
					expect(post.postType).to.equal(PostTypeEnum.Documentation);
					expect(post.tags.length).to.equal(0);
					return expect(post.ipfsDoc.hash).to.equal(hash);
				})
			);


			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);

			await expect(peeranhaContent.connect(signers[1]).createPost(1, hashContainer[1], PostTypeEnum.Documentation, []))
				.to.be.revertedWith('not_allowed_not_comm_admin');

			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[1], PostTypeEnum.Documentation, []);
			const post = await peeranhaContent.getPost(4);

			expect(post.isDeleted).to.equal(false);
			expect(post.postType).to.equal(PostTypeEnum.Documentation);
			expect(post.tags.length).to.equal(0);
			expect(post.ipfsDoc.hash).to.equal(hashContainer[1]);
		});

		it("Test common user create Documentation post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();

			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);
			await expect(peeranhaContent.connect(signers[1]).createPost(1, hashContainer[1], PostTypeEnum.Documentation, []))
				.to.be.revertedWith('not_allowed_not_comm_admin');
		});

		it("Test create post without tag", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
	
			await expect(peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [])).to.be.revertedWith('At least one tag is required.');
		});

		it("Test create post with non-existing tag", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await expect(peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [6])).to.be.revertedWith('Wrong tag id.');
			await expect(peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [2, 1, 6])).to.be.revertedWith('Wrong tag id.');
			await expect(peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [6, 2])).to.be.revertedWith('Wrong tag id.');
			await expect(peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [0])).to.be.revertedWith('The community does not have tag with 0 id.');
			await expect(peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [])).to.be.revertedWith('At least one tag is required.');
		});

		it("Test create post without ipfs hash", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await expect(peeranhaContent.createPost(1, '0x0000000000000000000000000000000000000000000000000000000000000000', PostTypeEnum.ExpertPost, [1]))
			.to.be.revertedWith('Invalid_ipfsHash');
		});

		xit("Test create post by not registered user", async function () { // create user createIfDoesNotExist
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await expect(peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1])).to.be.revertedWith('user_not_found');
		});

		it("Test create post for non-existing community", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(hashContainer[1]);

			await expect(peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1])).to.be.revertedWith('Community does not exist');
		});

		it("Test create post for frozen community", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaCommunity.freezeCommunity(1);

			await expect(peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1])).to.be.revertedWith('Community is frozen');
			await peeranhaCommunity.unfreezeCommunity(1);

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		});
			
	});

	describe('Create reply', function () {

		it("Test create reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);

			const reply = await peeranhaContent.getReply(1, 1);
			expect(reply.author).to.equal(peeranhaUser.deployTransaction.from);
			expect(reply.isDeleted).to.equal(false);
			expect(reply.ipfsDoc.hash).to.equal(hashContainer[1]);
		});

		it("Test create reply in tutorial", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await expect(peeranhaContent.createReply(1, 0, hashContainer[1], false)).to.be.revertedWith('You can not publish replies in tutorial or Documentation.');
		});

		it("Test create reply in Documentation", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.Documentation, []);
			await expect(peeranhaContent.createReply(1, 0, hashContainer[1], false)).to.be.revertedWith('You can not publish replies in tutorial or Documentation.');
		});

		it("Test create 4 replies (test gas)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[3]).createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[4]).createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[5]).createUser(hashContainer[1]);


			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			// await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await wait(5000)
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[3]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[4]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[5]).createReply(1, 0, hashContainer[1], false);
		});

		it("Test create official reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[2], false);

			const post = await peeranhaContent.getPost(1);
			expect(post.officialReply).to.equal(0);

			await peeranhaContent.createReply(1, 0, hashContainer[1], true);

			const updatedPost = await peeranhaContent.getPost(1);
			expect(updatedPost.officialReply).to.equal(2);
		});

		it("Test double replies in expert post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
	
			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await expect(peeranhaContent.createReply(1, 0, hashContainer[1], false)).to.be.revertedWith('Users can not publish 2 replies for expert and common posts.');
		});
	
		it("Test double replies in common post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
	
			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await expect(peeranhaContent.createReply(1, 0, hashContainer[1], false)).to.be.revertedWith('Users can not publish 2 replies for expert and common posts.');
		});

		it("Test create reply on reply in expert post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
	
			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await expect(peeranhaContent.createReply(1, 1, hashContainer[1], false)).to.be.revertedWith('User is forbidden to reply on reply for Expert and Common type of posts');
		});
	
		it("Test create reply on reply in common post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
	
			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await expect(peeranhaContent.createReply(1, 1, hashContainer[1], false)).to.be.revertedWith('User is forbidden to reply on reply for Expert and Common type of posts');
		});

		it("Test create two official replies for the same post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[2], true);

			const post = await peeranhaContent.getPost(1);
			expect(post.officialReply).to.equal(1);

			await peeranhaContent.createReply(1, 0, hashContainer[1], true);

			const updatedPost = await peeranhaContent.getPost(1);
			expect(updatedPost.officialReply).to.equal(2);
		});

		it("Test create reply, post has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.deletePost(1);

			await expect(peeranhaContent.createReply(1, 0, hashContainer[1], false)).to.be.revertedWith('Post has been deleted.');
		});

		it("Test create reply without post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await expect(peeranhaContent.createReply(1, 0, hashContainer[1], false)).to.be.revertedWith('Post does not exist.');
		});

		it("Test create reply without ipfs hash", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			await expect(peeranhaContent.createReply(1, 0, '0x0000000000000000000000000000000000000000000000000000000000000000', false))
			.to.be.revertedWith('Invalid_ipfsHash');
		});

		xit("Test create reply by not registered user", async function () { // create user createIfDoesNotExist
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await expect(peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[0], false))
			.to.be.revertedWith('user_not_found');
		});

		it("Test create official reply by common user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await expect(peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[0], true))
			.to.be.revertedWith('not_allowed_not_comm_moderator');
		});
	});

	describe('Create comment', function () {

		it("Test create comment to post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createComment(1, 0, hashContainer[1]);

			const comment = await peeranhaContent.getComment(1, 0, 1);
			expect(comment.author).to.equal(peeranhaContent.deployTransaction.from);
			expect(comment.isDeleted).to.equal(false);
			expect(comment.ipfsDoc.hash).to.equal(hashContainer[1]);
		});

		it("Test create comment to Documentation", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.Documentation, []);
			await expect(peeranhaContent.createComment(1, 0, hashContainer[1])).to.be.revertedWith('You can not publish comments in Documentation.');
		});

		it("Test create comment to reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.createComment(1, 1, hashContainer[1]);

			const comment = await peeranhaContent.getComment(1, 1, 1);
			expect(comment.author).to.equal(peeranhaContent.deployTransaction.from);
			expect(comment.isDeleted).to.equal(false);
			expect(comment.ipfsDoc.hash).to.equal(hashContainer[1]);
		});

		it("Test create comment, post has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.deletePost(1);

			await expect(peeranhaContent.createComment(1, 0, hashContainer[1])).to.be.revertedWith('Post has been deleted.');
			await expect(peeranhaContent.createComment(1, 1, hashContainer[1])).to.be.revertedWith('Post has been deleted.');
		});

		it("Test create comment, reply has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.deleteReply(1, 1);
			
			await expect(peeranhaContent.createComment(1, 1, hashContainer[1])).to.be.revertedWith('Reply has been deleted.');
		});

		it("Test create comment without post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(hashContainer[1]);

			await expect(peeranhaContent.createComment(1, 0, hashContainer[1])).to.be.revertedWith('Post does not exist.');
		});

		it("Test create comment without reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.createComment(1, 1, hashContainer[1])).to.be.revertedWith('Reply does not exist.');
		});

		xit("Test create comment by not registered user", async function () {  // create user createIfDoesNotExist
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			
			await expect(peeranhaContent.connect(signers[1]).createComment(1, 0, hashContainer[2]))
			.to.be.revertedWith('user_not_found');
			await expect(peeranhaContent.connect(signers[1]).createComment(1, 1, hashContainer[2]))
			.to.be.revertedWith('user_not_found');
		});

		it("Test create comment without ipfs hash", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			
			await expect(peeranhaContent.createComment(1, 1, '0x0000000000000000000000000000000000000000000000000000000000000000'))
			.to.be.revertedWith('Invalid_ipfsHash');
		});

		it("Test create comment to post by not admin (not own post)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.connect(signers[1]).createComment(1, 0, hashContainer[1]))
			.to.be.revertedWith('low_rating_comment');
		});

		it("Test create comment to own post by not admin", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createComment(1, 0, hashContainer[1])
			
			const comment = await peeranhaContent.getComment(1, 0, 1);
			expect(comment.author).to.equal(signers[1].address);
			expect(comment.isDeleted).to.equal(false);
			expect(comment.ipfsDoc.hash).to.equal(hashContainer[1]);
		});

		it("Test create comment to reply by not admin (not own post and reply)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await expect(peeranhaContent.connect(signers[1]).createComment(1, 0, hashContainer[1]))
			.to.be.revertedWith('low_rating_comment');
		});

		it("Test create comment to reply by not admin (own post but not own reply)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[1]).createComment(1, 1, hashContainer[1]);

			const comment = await peeranhaContent.getComment(1, 1, 1);
			expect(comment.author).to.equal(signers[1].address);
			expect(comment.isDeleted).to.equal(false);
			expect(comment.ipfsDoc.hash).to.equal(hashContainer[1]);
		});

		it("Test create comment to own reply by not admin", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[1]).createComment(1, 1, hashContainer[1]);

			const comment = await peeranhaContent.getComment(1, 1, 1);
			expect(comment.author).to.equal(signers[1].address);
			expect(comment.isDeleted).to.equal(false);
			expect(comment.ipfsDoc.hash).to.equal(hashContainer[1]);
		});
	});

	describe('Edit post', function () {

		it("Test edit post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createPost(1, hashContainer[1], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.editPost(1, hashContainer[2], []);
			await peeranhaContent.editPost(2, hashContainer[0], [2]);

			const post = await peeranhaContent.getPost(1);
			const post2 = await peeranhaContent.getPost(2);
			expect(post.author).to.equal(peeranhaContent.deployTransaction.from);
			expect(post.isDeleted).to.equal(false);
			expect(post.ipfsDoc.hash).to.equal(hashContainer[2]);
			expect(post2.ipfsDoc.hash).to.equal(hashContainer[0]);
			expect(post.tags[0]).to.equal(1);
			expect(post2.tags[0]).to.equal(2);
		});

		it("Test edit documentation", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			const post = await peeranhaContent.getPost(1);
			expect(post.ipfsDoc.hash).to.equal(hashContainer[0]);

			await peeranhaContent.editPost(1, hashContainer[2], []);
			const editedPost = await peeranhaContent.getPost(1);
			expect(editedPost.ipfsDoc.hash).to.equal(hashContainer[2]);
		});

		it("Test edit post (wrong tag)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
	
			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await expect(peeranhaContent.editPost(1, hashContainer[2], [6])).to.be.revertedWith('Wrong tag id.');
			await expect(peeranhaContent.editPost(1, hashContainer[2], [2, 1, 6])).to.be.revertedWith('Wrong tag id.');
			await expect(peeranhaContent.editPost(1, hashContainer[2], [6, 2])).to.be.revertedWith('Wrong tag id.');
			await expect(peeranhaContent.editPost(1, hashContainer[2], [0])).to.be.revertedWith('The community does not have tag with 0 id.');
		});

		it("Test edit post by not registered user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.connect(signers[1]).editPost(1, hashContainer[2], []))
			.to.be.revertedWith('user_not_found');
		});

		it("Test edit not own post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.connect(signers[1]).editPost(1, hashContainer[2], []))
			.to.be.revertedWith('not_allowed_edit');
		});

		it("Test edit post with invalid ipfs hash", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.editPost(1, '0x0000000000000000000000000000000000000000000000000000000000000000', []))
			.to.be.revertedWith('Invalid_ipfsHash');
		});

		it("Test edit post, without post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await expect(peeranhaContent.editPost(1, hashContainer[2], [])).to.be.revertedWith('Post does not exist.');
		});

		it("Test edit post, post hes been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.deletePost(1);

			await expect(peeranhaContent.editPost(1, hashContainer[2], [])).to.be.revertedWith('Post has been deleted.');
		});
	});

	describe('Edit reply', function () {

		it("Test edit reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.editReply(1, 1, hashContainer[2], disableExperimentalFragmentVariables);

			const reply = await peeranhaContent.getReply(1, 1);
			expect(reply.author).to.equal(peeranhaContent.deployTransaction.from);
			expect(reply.isDeleted).to.equal(false);
			expect(reply.ipfsDoc.hash).to.equal(hashContainer[2]);
		});

		it("Test edit official reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[2], false);

			const post = await peeranhaContent.getPost(1);
			expect(post.officialReply).to.equal(0);

			await peeranhaContent.createReply(1, 0, hashContainer[1], true);

			let updatedPost = await peeranhaContent.getPost(1);
			expect(updatedPost.officialReply).to.equal(2);

			await peeranhaContent.editReply(1, 2, hashContainer[1], false);
			updatedPost = await peeranhaContent.getPost(1);
			expect(updatedPost.officialReply).to.equal(0);

			await peeranhaContent.editReply(1, 2, hashContainer[1], true);
			updatedPost = await peeranhaContent.getPost(1);
			expect(updatedPost.officialReply).to.equal(2);
		}); 

		it("Test edit reply with invalid ipfs hash", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);

			await expect(peeranhaContent.editReply(1, 1, '0x0000000000000000000000000000000000000000000000000000000000000000', false))
			.to.be.revertedWith('Invalid_ipfsHash');
		});
		
		it("Test edit reply by not registered user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			
			await expect(peeranhaContent.connect(signers[1]).editReply(1, 1, hashContainer[2], false))
			.to.be.revertedWith('user_not_found');
		});

		it("Test edit not own reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			
			await expect(peeranhaContent.connect(signers[1]).editReply(1, 1, hashContainer[2], false))
			.to.be.revertedWith('not_allowed_edit');
		});

		it("Test edit reply, without post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await expect(peeranhaContent.editReply(1, 1, hashContainer[2], false)).to.be.revertedWith('Post does not exist.');
		});

		it("Test edit reply, without reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.editReply(1, 1, hashContainer[2], false)).to.be.revertedWith('Reply does not exist.');
		});

		it("Test edit reply, post has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.deletePost(1);

			await expect(peeranhaContent.editReply(1, 1, hashContainer[2], false)).to.be.revertedWith('Post has been deleted.');
		});

		it("Test edit reply, reply has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.deleteReply(1, 1);

			await expect(peeranhaContent.editReply(1, 1, hashContainer[2], false)).to.be.revertedWith('Reply has been deleted.');
		});
	});

	describe('Edit comment', function () {

		it("Test edit comment", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createComment(1, 0, hashContainer[1]);
			await peeranhaContent.editComment(1, 0, 1, hashContainer[2]);

			const reply = await peeranhaContent.getComment(1, 0, 1);
			expect(reply.author).to.equal(peeranhaContent.deployTransaction.from);
			expect(reply.isDeleted).to.equal(false);
			expect(reply.ipfsDoc.hash).to.equal(hashContainer[2]);
		});

		it("Test edit comment with invalid ipfs hash", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createComment(1, 0, hashContainer[1]);

			await expect(peeranhaContent.editComment(1, 0, 1, '0x0000000000000000000000000000000000000000000000000000000000000000'))
			.to.be.revertedWith('Invalid_ipfsHash');
		});

		it("Test edit comment by not registered user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createComment(1, 0, hashContainer[1]);

			await expect(peeranhaContent.connect(signers[1]).editComment(1, 0, 1, hashContainer[2]))
			.to.be.revertedWith('user_not_found');
		});

		it("Test edit not own comment", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createComment(1, 0, hashContainer[1]);

			await expect(peeranhaContent.connect(signers[1]).editComment(1, 0, 1, hashContainer[2]))
			.to.be.revertedWith('not_allowed_edit');
		});

		it("Test edit comment, without post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(hashContainer[1]);

			await expect(peeranhaContent.editComment(1, 1, 1, hashContainer[2])).to.be.revertedWith('Post does not exist.');
		});

		it("Test edit comment, without reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.editComment(1, 1, 1, hashContainer[2])).to.be.revertedWith('Reply does not exist.');
		});

		it("Test edit comment, without comment", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await expect(peeranhaContent.editComment(1, 1, 1, hashContainer[2])).to.be.revertedWith('Comment does not exist.');
		});

		it("Test edit comment, post has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[0], false);
			await peeranhaContent.createComment(1, 0, hashContainer[1]);
			await peeranhaContent.createComment(1, 1, hashContainer[1]);
			await peeranhaContent.deletePost(1);

			await expect(peeranhaContent.editComment(1, 0, 1, hashContainer[2])).to.be.revertedWith('Post has been deleted.');
			await expect(peeranhaContent.editComment(1, 1, 1, hashContainer[2])).to.be.revertedWith('Post has been deleted.');
		});

		it("Test edit comment, reply has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[0], false);
			await peeranhaContent.createComment(1, 1, hashContainer[1]);
			await peeranhaContent.deleteReply(1, 1);

			await expect(peeranhaContent.editComment(1, 1, 1, hashContainer[2])).to.be.revertedWith('Reply has been deleted.');		
		});

		it("Test edit comment, comment has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[0], false);
			await peeranhaContent.createComment(1, 0, hashContainer[1]);
			await peeranhaContent.createComment(1, 1, hashContainer[1]);
			await peeranhaContent.deleteComment(1, 0, 1);
			await peeranhaContent.deleteComment(1, 1, 1);

			await expect(peeranhaContent.editComment(1, 0, 1, hashContainer[2])).to.be.revertedWith('Comment has been deleted.');
			await expect(peeranhaContent.editComment(1, 1, 1, hashContainer[2])).to.be.revertedWith('Comment has been deleted.');
		});
	});

	describe('Delete post', function () {

		it("Test delete post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.deletePost(1);

			const post = await peeranhaContent.getPost(1);
			expect(post.isDeleted).to.equal(true);
		});

		it("Test delete own documentation", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.Documentation, [1]);
			await peeranhaContent.deletePost(1);

			const post = await peeranhaContent.getPost(1);
			expect(post.isDeleted).to.equal(true);

			const userRating = await peeranhaUser.getUserRating(accountDeployed, 1);
			await expect(userRating).to.equal(StartRatingWithoutAction);
		});

		it("Test delete documentation by moderator", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
			await peeranhaUser.giveCommunityModeratorPermission(signers[1].address, 1);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.Documentation, [1]);
			await peeranhaContent.connect(signers[1]).deletePost(1);

			const post = await peeranhaContent.getPost(1);
			expect(post.isDeleted).to.equal(true);

			const userRating = await peeranhaUser.getUserRating(accountDeployed, 1);
			await expect(userRating).to.equal(StartRatingWithoutAction);
		});

		it("Test delete post by not registered user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await expect(peeranhaContent.connect(signers[1]).deletePost(1))
			.to.be.revertedWith('user_not_found');
		});

		it("Test delete not own post by common user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await expect(peeranhaContent.connect(signers[1]).deletePost(1))
			.to.be.revertedWith('not_allowed_delete');
		});

		it("Test delete post with reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.deletePost(1);

			expect((await peeranhaContent.getPost(1)).isDeleted).to.be.true;
		});

		it("Test delete post, without post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(hashContainer[1]);
			await expect(peeranhaContent.deletePost(1)).to.be.revertedWith('Post does not exist.');
		});

		it("Test delete post, post has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.deletePost(1);

			await expect(peeranhaContent.deletePost(1)).to.be.revertedWith('Post has been deleted.');
		});
	});

	describe('Delete reply', function () {

		it("Test delete reply ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.deleteReply(1, 1);

			const reply = await peeranhaContent.getReply(1, 1);
			expect(reply.isDeleted).to.equal(true);
		});

		it("Test delete reply by not registered user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);

			await expect(peeranhaContent.connect(signers[1]).deleteReply(1, 1))
			.to.be.revertedWith('user_not_found');
		});

		it("Test delete not own reply by common user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);

			await expect(peeranhaContent.connect(signers[1]).deleteReply(1, 1))
			.to.be.revertedWith('not_allowed_delete');
		});

		it("Test delete accepted reply by moderator", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.changeStatusBestReply(1, 1);
			await peeranhaContent.deleteReply(1, 1);

			const reply = await peeranhaContent.getReply(1, 1);
			expect(reply.isDeleted).to.equal(true);
		});

		it("Test delete own accepted reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.changeStatusBestReply(1, 1);
			await expect(peeranhaContent.connect(signers[1]).deleteReply(1, 1)).to.be.revertedWith('You can not delete the best reply.');
		});

		it("Test delete official reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[2]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[2], false);

			const post = await peeranhaContent.getPost(1);
			expect(post.officialReply).to.equal(0);

			await peeranhaContent.createReply(1, 0, hashContainer[1], true);
			let updatedPost = await peeranhaContent.getPost(1);
			expect(updatedPost.officialReply).to.equal(2);

			await peeranhaContent.deleteReply(1, 2);
			updatedPost = await peeranhaContent.getPost(1);
			expect(updatedPost.officialReply).to.equal(0);
		});

		it("Test delete own accepted reply by moderator (bug need fix)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[1]).changeStatusBestReply(1, 1);
			await peeranhaContent.deleteReply(1, 1);

			const reply = await peeranhaContent.getReply(1, 1);
			expect(reply.isDeleted).to.equal(true);
		});

		it("Test delete accepted reply by moderator", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityAdminPermission(signers[2].address, 1);

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[1]).changeStatusBestReply(1, 1);
			await peeranhaContent.connect(signers[2]).deleteReply(1, 1);

			const reply = await peeranhaContent.getReply(1, 1);
			expect(reply.isDeleted).to.equal(true);
		});

		it("Test delete reply, without post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(hashContainer[1]);
			await expect(peeranhaContent.deleteReply(1, 1)).to.be.revertedWith('Post does not exist.');
		});

		it("Test delete reply, without reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.deleteReply(1, 1)).to.be.revertedWith('Reply does not exist.');
		});

		it("Test delete reply, post has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.deletePost(1);

			await expect(peeranhaContent.deleteReply(1, 1)).to.be.revertedWith('Post has been deleted.');
		});

		it("Test delete reply, reply has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.deleteReply(1, 1);

			await expect(peeranhaContent.deleteReply(1, 1)).to.be.revertedWith('Reply has been deleted.');
		});
	});

	describe('Delete comment', function () {

		it("Test delete own comment by moderator", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createComment(1, 0, hashContainer[1]);
			await peeranhaContent.deleteComment(1, 0, 1);

			const comment = await peeranhaContent.getComment(1, 0, 1);
			expect(comment.isDeleted).to.equal(true);

			const userRating = await peeranhaUser.getUserRating(peeranhaContent.deployTransaction.from, 1);
			await expect(userRating).to.equal(0);
		});

		it("Test delete own comment", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createComment(1, 0, hashContainer[1]);
			await peeranhaContent.connect(signers[1]).deleteComment(1, 0, 1);

			const comment = await peeranhaContent.getComment(1, 0, 1);
			expect(comment.isDeleted).to.equal(true);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(0);
		});

		it("Test delete comment by moderator", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createComment(1, 0, hashContainer[1]);
			await peeranhaContent.deleteComment(1, 0, 1);

			const comment = await peeranhaContent.getComment(1, 0, 1);
			expect(comment.isDeleted).to.equal(true);

			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(userRating).to.equal(StartRating + ModeratorDeleteComment);
		});

		it("Test delete comment by not registered user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.createComment(1, 0, hashContainer[1]);
			await peeranhaContent.createComment(1, 1, hashContainer[1]);

			await expect(peeranhaContent.connect(signers[1]).deleteComment(1, 0, 1))
			.to.be.revertedWith('user_not_found');
			await expect(peeranhaContent.connect(signers[1]).deleteComment(1, 1, 1))
			.to.be.revertedWith('user_not_found');
		});

		it("Test delete not own comment by common user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.createComment(1, 0, hashContainer[1]);
			await peeranhaContent.createComment(1, 1, hashContainer[1]);
			
			await expect(peeranhaContent.connect(signers[1]).deleteComment(1, 0, 1))
			.to.be.revertedWith('not_allowed_delete');
			await expect(peeranhaContent.connect(signers[1]).deleteComment(1, 1, 1))
			.to.be.revertedWith('not_allowed_delete');
		});

		it("Test delete comment, without post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			await peeranhaUser.createUser(hashContainer[1]);
			await expect(peeranhaContent.deleteComment(1, 0, 1)).to.be.revertedWith('Post does not exist.');
		});

		it("Test delete comment, without reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.deleteComment(1, [1], 1)).to.be.revertedWith('Reply does not exist.');
		});

		it("Test delete comment, without comment", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.deleteComment(1, 0, 1)).to.be.revertedWith('Comment does not exist.');

			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await expect(peeranhaContent.deleteComment(1, 1, 1)).to.be.revertedWith('Comment does not exist.');
		});

		it("Test delete comment, post has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.createComment(1, 0, hashContainer[1]);
			await peeranhaContent.createComment(1, 1, hashContainer[1]);
			await peeranhaContent.deletePost(1);

			await expect(peeranhaContent.deleteComment(1, 0, 1)).to.be.revertedWith('Post has been deleted.');
			await expect(peeranhaContent.deleteComment(1, 1, 1)).to.be.revertedWith('Post has been deleted.');
		});

		it("Test delete comment, reply has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.createComment(1, 1, hashContainer[1]);
			await peeranhaContent.deleteReply(1, 1);

			await expect(peeranhaContent.deleteComment(1, 1, 1)).to.be.revertedWith('Reply has been deleted.');
		});

		it("Test delete comment, comment has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.createComment(1, 0, hashContainer[1]);
			await peeranhaContent.createComment(1, 1, hashContainer[1]);
			await peeranhaContent.deleteComment(1, 0, 1);
			await peeranhaContent.deleteComment(1, 1, 1);

			await expect(peeranhaContent.deleteComment(1, 0, 1)).to.be.revertedWith('Comment has been deleted.');
			await expect(peeranhaContent.deleteComment(1, 1, 1)).to.be.revertedWith('Comment has been deleted.');
		});
	});

	describe('Best reply', function () {		// TODO перенести тесты с лучшим ответом
		it("Test delete expert best reply by moderator", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);

			await peeranhaContent.changeStatusBestReply(1, 1);
			
			const userRating2 = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating2).to.equal(userRating + AcceptExpertReply);
			await expect(userActionRating2).to.equal(StartRating + AcceptedExpertReply);

			await peeranhaContent.deleteReply(1, 1);

			const post = await peeranhaContent.getPost(1);
			expect(post.bestReply).to.equal(0);

			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newUserActionRating).to.equal(StartRating + AcceptedExpertReply);
			await expect(newUserRating).to.equal(StartRating + ModeratorDeleteReply);
		});

		it("Test delete post after choosing best common reply", async function () { // TODO: post or reply
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);

			await peeranhaContent.changeStatusBestReply(1, 1);

			const userRating2 = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);	
			await expect(userRating2).to.equal(userRating + AcceptCommonReply);
			await expect(userActionRating2 ).to.equal(StartRating + AcceptedCommonReply);

			await peeranhaContent.deleteReply(1, 1);

			const post = await peeranhaContent.getPost(1);
			expect(post.bestReply).to.equal(0);

			const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newUserActionRating).to.equal(StartRating + AcceptedCommonReply);
			await expect(newUserRating).to.equal(StartRating + ModeratorDeleteReply);
		});

		it("Test choose best reply after delete expert best reply by moderator", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2Reply = await peeranhaUser.getUserRating(signers[2].address, 1);

			await peeranhaContent.changeStatusBestReply(1, 1);
			
			const userRating2 = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating2).to.equal(userRating + AcceptExpertReply);
			await expect(userActionRating2).to.equal(StartRating + AcceptedExpertReply);

			await peeranhaContent.deleteReply(1, 1);

			let post = await peeranhaContent.getPost(1);
			expect(post.bestReply).to.equal(0);

			const newAuthorPostRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			const newOldBestReplyRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newAuthorPostRating).to.equal(StartRating + AcceptedExpertReply);
			await expect(newOldBestReplyRating).to.equal(StartRating + ModeratorDeleteReply);

			await peeranhaContent.changeStatusBestReply(1, 2);
			post = await peeranhaContent.getPost(1);
			expect(post.bestReply).to.equal(2);

			const newAuthorPostRating2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			const newAuthorOldBestReplyRating2 = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newAuthorNewBestReplyRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(newAuthorPostRating2).to.equal(newAuthorPostRating + AcceptedExpertReply);
			await expect(newAuthorOldBestReplyRating2).to.equal(newAuthorOldBestReplyRating2);
			await expect(newAuthorNewBestReplyRating).to.equal(userRating2Reply + AcceptExpertReply);
		});

		it("Test choose best reply after delete post after choosing best common reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(hashContainer[0]);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2Reply = await peeranhaUser.getUserRating(signers[2].address, 1);

			await peeranhaContent.changeStatusBestReply(1, 1);

			const userRating2 = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);	
			await expect(userRating2).to.equal(userRating + AcceptCommonReply);
			await expect(userActionRating2 ).to.equal(StartRating + AcceptedCommonReply);

			await peeranhaContent.deleteReply(1, 1);

			let post = await peeranhaContent.getPost(1);
			expect(post.bestReply).to.equal(0);

			const newAuthorPostRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			const newOldBestReplyRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newAuthorPostRating).to.equal(StartRating + AcceptedCommonReply);
			await expect(newOldBestReplyRating).to.equal(StartRating + ModeratorDeleteReply);

			await peeranhaContent.changeStatusBestReply(1, 2);
			post = await peeranhaContent.getPost(1);
			expect(post.bestReply).to.equal(2);

			const newAuthorPostRating2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			const newAuthorOldBestReplyRating2 = await peeranhaUser.getUserRating(signers[1].address, 1);
			const newAuthorNewBestReplyRating = await peeranhaUser.getUserRating(signers[2].address, 1);
			await expect(newAuthorPostRating2).to.equal(newAuthorPostRating + AcceptedCommonReply);
			await expect(newAuthorOldBestReplyRating2).to.equal(newAuthorOldBestReplyRating2);
			await expect(newAuthorNewBestReplyRating).to.equal(userRating2Reply + AcceptCommonReply);
		});
	});

	describe('Test documentation tree', function () {
		
		it("Test set documentation position", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.updateDocumentationTree(1, hashContainer[0])

			const documentationTree = await peeranhaContent.getDocumentationTree(1);
			expect(documentationTree.hash).to.equal(hashContainer[0]);
		});

		it("Test set documentation position for non-existing community", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			
			await expect(peeranhaContent.updateDocumentationTree(1, hashContainer[0])).to.be.revertedWith('Community does not exist');
		});

		it("Test set documentation position for frozen community ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaCommunity.freezeCommunity(1);

			await expect(peeranhaContent.updateDocumentationTree(1, hashContainer[0])).to.be.revertedWith('Community is frozen');
		});

		it("Test edit documentation position", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.updateDocumentationTree(1, hashContainer[0])
			await peeranhaContent.updateDocumentationTree(1, hashContainer[1])

			const documentationTree = await peeranhaContent.getDocumentationTree(1);
			expect(documentationTree.hash).to.equal(hashContainer[1]);
		});

		it("Test edit documentation position for frozen community ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.updateDocumentationTree(1, hashContainer[0])

			await peeranhaCommunity.freezeCommunity(1);
			await expect(peeranhaContent.updateDocumentationTree(1, hashContainer[0])).to.be.revertedWith('Community is frozen');
		});

		it("Test create documentation post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createDocumentationPost(1, hashContainer[0], hashContainer[1], PostTypeEnum.Documentation, [1]);

			let post = await peeranhaContent.getPost(1);

			expect(post.isDeleted).to.equal(false);
			expect(post.ipfsDoc.hash).to.equal(hashContainer[0]);
			expect(post.postType).to.equal(PostTypeEnum.Documentation);

			const documentationTree = await peeranhaContent.getDocumentationTree(1);
			expect(documentationTree.hash).to.equal(hashContainer[1]);
		});

		it("Test edit documentation post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createDocumentationPost(1, hashContainer[0], hashContainer[1], PostTypeEnum.Documentation, [1]);

			await peeranhaContent.editDocumentationPost(1, hashContainer[1], hashContainer[0], [1]);

			let post = await peeranhaContent.getPost(1);

			expect(post.isDeleted).to.equal(false);
			expect(post.ipfsDoc.hash).to.equal(hashContainer[1]);
			expect(post.postType).to.equal(PostTypeEnum.Documentation);

			const documentationTree = await peeranhaContent.getDocumentationTree(1);
			expect(documentationTree.hash).to.equal(hashContainer[0]);
		});

		it("Test delete documentation post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));

			await peeranhaContent.createDocumentationPost(1, hashContainer[0], hashContainer[1], PostTypeEnum.Documentation, [1]);

			await peeranhaContent.deleteDocumentationPost(1, hashContainer[0]);

			let post = await peeranhaContent.getPost(1);

			expect(post.isDeleted).to.equal(true);

			const documentationTree = await peeranhaContent.getDocumentationTree(1);
			expect(documentationTree.hash).to.equal(hashContainer[0]);
		});
	});
});
