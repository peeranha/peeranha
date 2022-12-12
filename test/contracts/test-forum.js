const { disableExperimentalFragmentVariables } = require("@apollo/client");
const { expect } = require("chai");
const { 
	wait, createPeerenhaAndTokenContract, registerTwoUsers, createUserWithAnotherRating, getHashContainer, getHashesContainer, createTags, getIdsContainer,
	PostTypeEnum, StartRating, StartRatingWithoutAction, deleteTime, DeleteOwnReply, QuickReplyTime,
    DownvoteExpertPost, UpvotedExpertPost, DownvotedExpertPost, DownvoteCommonPost, UpvotedCommonPost, DownvotedCommonPost,
    ModeratorDeletePost, DownvoteExpertReply, UpvotedExpertReply, DownvotedExpertReply, AcceptExpertReply, AcceptedExpertReply, 
    FirstExpertReply, QuickExpertReply, DownvoteCommonReply, UpvotedCommonReply, DownvotedCommonReply, AcceptCommonReply,
    AcceptedCommonReply, FirstCommonReply, QuickCommonReply, ModeratorDeleteReply, ModeratorDeleteComment,
	DownvoteTutorial, UpvotedTutorial, DownvotedTutorial, DeleteOwnPost, DefaultCommunityId
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
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await Promise.all(
				hashContainer.map(async (hash, index) => {
					return await peeranhaContent
						.createPost(signers[0].address, 1, hash, PostTypeEnum.ExpertPost, [1]);
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
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await Promise.all(
				hashContainer.map(async (hash, index) => {
					return await peeranhaContent
						.createPost(signers[0].address, 1, hash, PostTypeEnum.CommonPost, [1]);
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
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await Promise.all(
				hashContainer.map(async (hash, index) => {
					return await peeranhaContent
						.createPost(signers[0].address, 1, hash, PostTypeEnum.Tutorial, [1]);
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

		it("Test create post without tag", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
	
			await expect(peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [])).to.be.revertedWith('At least one tag is required.');
		});

		it("Test create post with non-existing tag", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await expect(peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [6])).to.be.revertedWith('Wrong tag id.');
			await expect(peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [2, 1, 6])).to.be.revertedWith('Wrong tag id.');
			await expect(peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [6, 2])).to.be.revertedWith('Wrong tag id.');
			await expect(peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [0])).to.be.revertedWith('The community does not have tag with 0 id.');
			await expect(peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [])).to.be.revertedWith('At least one tag is required.');
		});

		it("Test create post without ipfs hash", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await expect(peeranhaContent.createPost(signers[0].address, 1, '0x0000000000000000000000000000000000000000000000000000000000000000', PostTypeEnum.ExpertPost, [1]))
			.to.be.revertedWith('Invalid_ipfsHash');
		});

		xit("Test create post by not registered user", async function () { // create user createIfDoesNotExist
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await expect(peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1])).to.be.revertedWith('user_not_found');
		});

		it("Test create post for non-existing community", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

			await expect(peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1])).to.be.revertedWith('Community does not exist');
		});

		it("Test create post for frozen community", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaCommunity.freezeCommunity(signers[0].address, 1);

			await expect(peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1])).to.be.revertedWith('Community is frozen');
			await peeranhaCommunity.unfreezeCommunity(signers[0].address, 1);

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		});
			
	});

	describe('Create reply', function () {

		it("Test create reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);

			const reply = await peeranhaContent.getReply(1, 1);
			expect(reply.author).to.equal(peeranhaUser.deployTransaction.from);
			expect(reply.isDeleted).to.equal(false);
			expect(reply.ipfsDoc.hash).to.equal(hashContainer[1]);
		});

		it("Test create reply in tutorial", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await expect( peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false)).to.be.revertedWith('You can not publish replies in tutorial.');
		});

		it("Test create 4 replies (test gas)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);
			await peeranhaUser.connect(signers[3]).createUser(signers[3].address, hashContainer[1]);
			await peeranhaUser.connect(signers[4]).createUser(signers[4].address, hashContainer[1]);
			await peeranhaUser.connect(signers[5]).createUser(signers[5].address, hashContainer[1]);


			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			// await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await wait(5000)
			await  peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false);
			await  peeranhaContent.connect(signers[3]).createReply(signers[3].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[4]).createReply(signers[4].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[5]).createReply(signers[5].address, 1, 0, hashContainer[1], false);
		});

		it("Test create official reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[2]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[2], false);

			const post = await peeranhaContent.getPost(1);
			expect(post.officialReply).to.equal(0);

			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], true);

			const updatedPost = await peeranhaContent.getPost(1);
			expect(updatedPost.officialReply).to.equal(2);
		});

		it("Test double replies in expert post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
	
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await expect( peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false)).to.be.revertedWith('Users can not publish 2 replies for expert and common posts.');
		});
	
		it("Test double replies in common post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
	
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await expect( peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false)).to.be.revertedWith('Users can not publish 2 replies for expert and common posts.');
		});

		it("Test create reply on reply in expert post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
	
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await expect( peeranhaContent.createReply(signers[0].address, 1, 1, hashContainer[1], false)).to.be.revertedWith('User is forbidden to reply on reply for Expert and Common type of posts');
		});
	
		it("Test create reply on reply in common post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
	
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await expect( peeranhaContent.createReply(signers[0].address, 1, 1, hashContainer[1], false)).to.be.revertedWith('User is forbidden to reply on reply for Expert and Common type of posts');
		});

		it("Test create two official replies for the same post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[2]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[1].address, 1);

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[2], true);

			const post = await peeranhaContent.getPost(1);
			expect(post.officialReply).to.equal(1);

			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], true);

			const updatedPost = await peeranhaContent.getPost(1);
			expect(updatedPost.officialReply).to.equal(2);
		});

		it("Test create reply, post has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.deletePost(signers[0].address, 1);

			await expect( peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false)).to.be.revertedWith('Post_deleted.');
		});

		it("Test create reply without post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await expect(peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false)).to.be.revertedWith('Post_not_exist.');
		});

		it("Test create reply without ipfs hash", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			await expect( peeranhaContent.createReply(signers[0].address, 1, 0, '0x0000000000000000000000000000000000000000000000000000000000000000', false))
			.to.be.revertedWith('Invalid_ipfsHash');
		});

		xit("Test create reply by not registered user", async function () { // create user createIfDoesNotExist
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await expect( peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[0], false))
			.to.be.revertedWith('user_not_found');
		});

		it("Test create official reply by common user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[0]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await expect( peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[0], true))
			.to.be.revertedWith('not_allowed_not_comm_admin');
		});
	});

	describe('Create comment', function () {

		it("Test create comment to post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1]);

			const comment = await peeranhaContent.getComment(1, 0, 1);
			expect(comment.author).to.equal(peeranhaContent.deployTransaction.from);
			expect(comment.isDeleted).to.equal(false);
			expect(comment.ipfsDoc.hash).to.equal(hashContainer[1]);
		});

		it("Test create comment to reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1]);

			const comment = await peeranhaContent.getComment(1, 1, 1);
			expect(comment.author).to.equal(peeranhaContent.deployTransaction.from);
			expect(comment.isDeleted).to.equal(false);
			expect(comment.ipfsDoc.hash).to.equal(hashContainer[1]);
		});

		it("Test create comment, post has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.deletePost(signers[0].address, 1);

			await expect(peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1])).to.be.revertedWith('Post_deleted.');
			await expect(peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1])).to.be.revertedWith('Post_deleted.');
		});

		it("Test create comment, reply has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.deleteReply(signers[0].address, 1, 1);
			
			await expect(peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1])).to.be.revertedWith('Reply_deleted.');
		});

		it("Test create comment without post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

			await expect(peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1])).to.be.revertedWith('Post_not_exist.');
		});

		it("Test create comment without reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1])).to.be.revertedWith('Reply_not_exist.');
		});

		xit("Test create comment by not registered user", async function () {  // create user createIfDoesNotExist
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			
			await expect(peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[2]))
			.to.be.revertedWith('user_not_found');
			await expect(peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[2]))
			.to.be.revertedWith('user_not_found');
		});

		it("Test create comment without ipfs hash", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			
			await expect(peeranhaContent.createComment(signers[0].address, 1, 1, '0x0000000000000000000000000000000000000000000000000000000000000000'))
			.to.be.revertedWith('Invalid_ipfsHash');
		});

		it("Test create comment to post by not admin (not own post)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1]))
			.to.be.revertedWith('low_rating_comment');
		});

		it("Test create comment to own post by not admin", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1])
			
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
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await expect(peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1]))
			.to.be.revertedWith('low_rating_comment');
		});

		it("Test create comment to reply by not admin (own post but not own reply)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[1]);

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
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[1]);

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
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[1], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.editPost(signers[0].address, 1, hashContainer[2], [], 1, PostTypeEnum.ExpertPost);
			await peeranhaContent.editPost(signers[0].address, 2, hashContainer[0], [2], 1, PostTypeEnum.CommonPost);

			const post = await peeranhaContent.getPost(1);
			const post2 = await peeranhaContent.getPost(2);
			expect(post.author).to.equal(peeranhaContent.deployTransaction.from);
			expect(post.isDeleted).to.equal(false);
			expect(post.ipfsDoc.hash).to.equal(hashContainer[2]);
			expect(post2.ipfsDoc.hash).to.equal(hashContainer[0]);
			expect(post.tags[0]).to.equal(1);
			expect(post2.tags[0]).to.equal(2);
		});

		it("Test edit post (ipfs, tags, communityId, postType) by author (admin) the post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.editPost(signers[0].address, 1, hashContainer[1], [2], 2, PostTypeEnum.CommonPost);

			const post = await peeranhaContent.getPost(1);
			expect(post.author).to.equal(peeranhaContent.deployTransaction.from);
			expect(post.isDeleted).to.equal(false);
			expect(post.ipfsDoc.hash).to.equal(hashContainer[1]);
			expect(post.tags[0]).to.equal(2);
			expect(post.communityId).to.equal(2);
			expect(post.postType).to.equal(PostTypeEnum.CommonPost);
		});

		it("Test edit post (ipfs, tags, communityId, postType) by author (common user) the post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[1], [2], 2, PostTypeEnum.CommonPost);

			const post = await peeranhaContent.getPost(1);
			expect(post.author).to.equal(signers[1].address);
			expect(post.isDeleted).to.equal(false);
			expect(post.ipfsDoc.hash).to.equal(hashContainer[1]);
			expect(post.tags[0]).to.equal(2);
			expect(post.communityId).to.equal(2);
			expect(post.postType).to.equal(PostTypeEnum.CommonPost);
		});

		it("Test edit post (tags, communityId, postType) by not author (common user) the post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [2], 2, PostTypeEnum.CommonPost)).
				to.be.revertedWith('Error_change_communityId');
		});

		it("Test edit post (ipfs, tags, communityId, postType) by not author (common user) the post add change ipfs", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.connect(signers[1]).editPost(1, hashContainer[1], [2], 2, PostTypeEnum.CommonPost)).
				to.be.revertedWith('Not_allowed_edit_not_author');
		});

		it("Test edit post (tags, communityId, postType) by not author (admin) the post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [2], 2, PostTypeEnum.CommonPost);

			const post = await peeranhaContent.getPost(1);
			expect(post.author).to.equal(signers[1].address);
			expect(post.isDeleted).to.equal(false);
			expect(post.ipfsDoc.hash).to.equal(hashContainer[0]);
			expect(post.tags[0]).to.equal(2);
			expect(post.communityId).to.equal(2);
			expect(post.postType).to.equal(PostTypeEnum.CommonPost);
		});

		it("Test edit post (ipfs, tags, communityId, postType) by not author (admin) the post add change ipfs", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(hashContainer[1]);
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaCommunity.createCommunity(ipfsHashes[0], createTags(5));
			await peeranhaContent.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.editPost(1, hashContainer[1], [2], 2, PostTypeEnum.CommonPost)).
				to.be.revertedWith('Not_allowed_edit_not_author');
		});

		it("Test edit documentation", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			const post = await peeranhaContent.getPost(1);
			expect(post.ipfsDoc.hash).to.equal(hashContainer[0]);

			await peeranhaContent.editPost(signers[0].address, 1, hashContainer[2], [], 1, PostTypeEnum.ExpertPost);
			const editedPost = await peeranhaContent.getPost(1);
			expect(editedPost.ipfsDoc.hash).to.equal(hashContainer[2]);
		});

		it("Test edit post (wrong tag)", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
	
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[2], [6], 1, PostTypeEnum.ExpertPost)).to.be.revertedWith('Wrong tag id.');
			await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[2], [2, 1, 6], 1, PostTypeEnum.ExpertPost)).to.be.revertedWith('Wrong tag id.');
			await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[2], [6, 2], 1, PostTypeEnum.ExpertPost)).to.be.revertedWith('Wrong tag id.');
			await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[2], [0], 1, PostTypeEnum.ExpertPost)).to.be.revertedWith('The community does not have tag with 0 id.');
		});

		it("Test edit post by not registered user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[2], [], 1, PostTypeEnum.ExpertPost))
				.to.be.revertedWith('Not_allowed_edit_not_author'); // user_not_found
		});

		it("Test edit not own post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[2]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[2], [], 1, PostTypeEnum.ExpertPost))
				.to.be.revertedWith('Not_allowed_edit_not_author');	// not_allowed_edit + not_allowed_admin_or_comm_moderator
		});

		it("Test edit post with invalid ipfs hash", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.editPost(signers[0].address, 1, '0x0000000000000000000000000000000000000000000000000000000000000000', [], 1, PostTypeEnum.ExpertPost))
			.to.be.revertedWith('Invalid_ipfsHash');
		});

		it("Test edit post, without post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[2], [], 1, PostTypeEnum.ExpertPost)).to.be.revertedWith('Post_not_exist.');
		});

		it("Test edit post, post hes been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.deletePost(signers[0].address, 1);

			await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[2], [], 1, PostTypeEnum.ExpertPost)).to.be.revertedWith('Post_deleted.');
		});
	});

	describe('Edit reply', function () {

		it("Test edit reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.editReply(signers[0].address, 1, 1, hashContainer[2], disableExperimentalFragmentVariables);

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
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[2]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[2], false);

			const post = await peeranhaContent.getPost(1);
			expect(post.officialReply).to.equal(0);

			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], true);

			let updatedPost = await peeranhaContent.getPost(1);
			expect(updatedPost.officialReply).to.equal(2);

			await peeranhaContent.editReply(signers[0].address, 1, 2, hashContainer[1], false);
			updatedPost = await peeranhaContent.getPost(1);
			expect(updatedPost.officialReply).to.equal(0);

			await peeranhaContent.editReply(signers[0].address, 1, 2, hashContainer[1], true);
			updatedPost = await peeranhaContent.getPost(1);
			expect(updatedPost.officialReply).to.equal(2);
		}); 

		it("Test edit reply with invalid ipfs hash", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);

			await expect(peeranhaContent.editReply(signers[0].address, 1, 1, '0x0000000000000000000000000000000000000000000000000000000000000000', false))
			.to.be.revertedWith('Invalid_ipfsHash');
		});
		
		it("Test edit reply by not registered user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			
			await expect(peeranhaContent.connect(signers[1]).editReply(signers[1].address, 1, 1, hashContainer[2], false))
			.to.be.revertedWith('user_not_found');
		});

		it("Test edit not own reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[2]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			
			await expect(peeranhaContent.connect(signers[1]).editReply(signers[1].address, 1, 1, hashContainer[2], false))
			.to.be.revertedWith('not_allowed_edit');
		});

		it("Test edit reply, without post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await expect(peeranhaContent.editReply(signers[0].address, 1, 1, hashContainer[2], false)).to.be.revertedWith('Post_not_exist.');
		});

		it("Test edit reply, without reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.editReply(signers[0].address, 1, 1, hashContainer[2], false)).to.be.revertedWith('Reply_not_exist.');
		});

		it("Test edit reply, post has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.deletePost(signers[0].address, 1);

			await expect(peeranhaContent.editReply(signers[0].address, 1, 1, hashContainer[2], false)).to.be.revertedWith('Post_deleted.');
		});

		it("Test edit reply, reply has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.deleteReply(signers[0].address, 1, 1);

			await expect(peeranhaContent.editReply(signers[0].address, 1, 1, hashContainer[2], false)).to.be.revertedWith('Reply_deleted.');
		});
	});

	describe('Edit comment', function () {

		it("Test edit comment", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1]);
			await peeranhaContent.editComment(signers[0].address, 1, 0, 1, hashContainer[2]);

			const reply = await peeranhaContent.getComment(1, 0, 1);
			expect(reply.author).to.equal(peeranhaContent.deployTransaction.from);
			expect(reply.isDeleted).to.equal(false);
			expect(reply.ipfsDoc.hash).to.equal(hashContainer[2]);
		});

		it("Test edit comment with invalid ipfs hash", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1]);

			await expect(peeranhaContent.editComment(signers[0].address, 1, 0, 1, '0x0000000000000000000000000000000000000000000000000000000000000000'))
			.to.be.revertedWith('Invalid_ipfsHash');
		});

		it("Test edit comment by not registered user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1]);

			await expect(peeranhaContent.connect(signers[1]).editComment(signers[1].address, 1, 0, 1, hashContainer[2]))
			.to.be.revertedWith('user_not_found');
		});

		it("Test edit not own comment", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[2]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1]);

			await expect(peeranhaContent.connect(signers[1]).editComment(signers[1].address, 1, 0, 1, hashContainer[2]))
			.to.be.revertedWith('not_allowed_edit');
		});

		it("Test edit comment, without post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

			await expect(peeranhaContent.editComment(signers[0].address, 1, 1, 1, hashContainer[2])).to.be.revertedWith('Post_not_exist.');
		});

		it("Test edit comment, without reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.editComment(signers[0].address, 1, 1, 1, hashContainer[2])).to.be.revertedWith('Reply_not_exist.');
		});

		it("Test edit comment, without comment", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await expect(peeranhaContent.editComment(signers[0].address, 1, 1, 1, hashContainer[2])).to.be.revertedWith('Comment_not_exist.');
		});

		it("Test edit comment, post has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[0], false);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1]);
			await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1]);
			await peeranhaContent.deletePost(signers[0].address, 1);

			await expect(peeranhaContent.editComment(signers[0].address, 1, 0, 1, hashContainer[2])).to.be.revertedWith('Post_deleted.');
			await expect(peeranhaContent.editComment(signers[0].address, 1, 1, 1, hashContainer[2])).to.be.revertedWith('Post_deleted.');
		});

		it("Test edit comment, reply has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[0], false);
			await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1]);
			await peeranhaContent.deleteReply(signers[0].address, 1, 1);

			await expect(peeranhaContent.editComment(signers[0].address, 1, 1, 1, hashContainer[2])).to.be.revertedWith('Reply_deleted.');		
		});

		it("Test edit comment, comment has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[0], false);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1]);
			await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1]);
			await peeranhaContent.deleteComment(signers[0].address, 1, 0, 1);
			await peeranhaContent.deleteComment(signers[0].address, 1, 1, 1);

			await expect(peeranhaContent.editComment(signers[0].address, 1, 0, 1, hashContainer[2])).to.be.revertedWith('Comment_deleted.');
			await expect(peeranhaContent.editComment(signers[0].address, 1, 1, 1, hashContainer[2])).to.be.revertedWith('Comment_deleted.');
		});
	});

	describe('Delete post', function () {

		it("Test delete post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.deletePost(signers[0].address, 1);

			const post = await peeranhaContent.getPost(1);
			expect(post.isDeleted).to.equal(true);
		});

		it("Test delete post by not registered user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await expect(peeranhaContent.connect(signers[1]).deletePost(signers[1].address, 1))
			.to.be.revertedWith('user_not_found');
		});

		it("Test delete not own post by common user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[0]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await expect(peeranhaContent.connect(signers[1]).deletePost(signers[1].address, 1))
			.to.be.revertedWith('not_allowed_delete');
		});

		it("Test delete post with reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[2]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.deletePost(signers[0].address, 1);

			expect((await peeranhaContent.getPost(1)).isDeleted).to.be.true;
		});

		it("Test delete post, without post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await expect(peeranhaContent.deletePost(signers[0].address, 1)).to.be.revertedWith('Post_not_exist.');
		});

		it("Test delete post, post has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.deletePost(signers[0].address, 1);

			await expect(peeranhaContent.deletePost(signers[0].address, 1)).to.be.revertedWith('Post_deleted.');
		});
	});

	describe('Delete reply', function () {

		it("Test delete reply ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.deleteReply(signers[0].address, 1, 1);

			const reply = await peeranhaContent.getReply(1, 1);
			expect(reply.isDeleted).to.equal(true);
		});

		it("Test delete reply by not registered user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);

			await expect(peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1))
			.to.be.revertedWith('user_not_found');
		});

		it("Test delete not own reply by common user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[0]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);

			await expect(peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1))
			.to.be.revertedWith('not_allowed_delete');
		});

		it("Test delete accepted reply by moderator", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);
			await peeranhaContent.deleteReply(signers[0].address, 1, 1);

			const reply = await peeranhaContent.getReply(1, 1);
			expect(reply.isDeleted).to.equal(true);
		});

		it("Test delete own accepted reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);
			await expect(peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1));
		});

		it("Test delete official reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[2]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[2], false);

			const post = await peeranhaContent.getPost(1);
			expect(post.officialReply).to.equal(0);

			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], true);
			let updatedPost = await peeranhaContent.getPost(1);
			expect(updatedPost.officialReply).to.equal(2);

			await peeranhaContent.deleteReply(signers[0].address, 1, 2);
			updatedPost = await peeranhaContent.getPost(1);
			expect(updatedPost.officialReply).to.equal(0);
		});

		it("Test delete own accepted reply by moderator", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);
			await peeranhaContent.deleteReply(signers[0].address, 1, 1);

			const reply = await peeranhaContent.getReply(1, 1);
			expect(reply.isDeleted).to.equal(true);
		});

		it("Test delete accepted reply by moderator", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaUser.giveCommunityAdminPermission(signers[0].address, signers[2].address, 1);

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);
			await peeranhaContent.connect(signers[2]).deleteReply(signers[2].address, 1, 1);

			const reply = await peeranhaContent.getReply(1, 1);
			expect(reply.isDeleted).to.equal(true);
		});

		it("Test delete reply, without post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await expect(peeranhaContent.deleteReply(signers[0].address, 1, 1)).to.be.revertedWith('Post_not_exist.');
		});

		it("Test delete reply, without reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.deleteReply(signers[0].address, 1, 1)).to.be.revertedWith('Reply_not_exist.');
		});

		it("Test delete reply, post has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.deletePost(signers[0].address, 1);

			await expect(peeranhaContent.deleteReply(signers[0].address, 1, 1)).to.be.revertedWith('Post_deleted.');
		});

		it("Test delete reply, reply has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.deleteReply(signers[0].address, 1, 1);

			await expect(peeranhaContent.deleteReply(signers[0].address, 1, 1)).to.be.revertedWith('Reply_deleted.');
		});
	});

	describe('Delete comment', function () {

		it("Test delete own comment by moderator", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1]);
			await peeranhaContent.deleteComment(signers[0].address, 1, 0, 1);

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
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1]);
			await peeranhaContent.connect(signers[1]).deleteComment(signers[1].address, 1, 0, 1);

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
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1]);
			await peeranhaContent.deleteComment(signers[0].address, 1, 0, 1);

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
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1]);
			await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1]);

			await expect(peeranhaContent.connect(signers[1]).deleteComment(signers[1].address, 1, 0, 1))
			.to.be.revertedWith('user_not_found');
			await expect(peeranhaContent.connect(signers[1]).deleteComment(signers[1].address, 1, 1, 1))
			.to.be.revertedWith('user_not_found');
		});

		it("Test delete not own comment by common user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[0]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1]);
			await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1]);
			
			await expect(peeranhaContent.connect(signers[1]).deleteComment(signers[1].address, 1, 0, 1))
			.to.be.revertedWith('not_allowed_delete');
			await expect(peeranhaContent.connect(signers[1]).deleteComment(signers[1].address, 1, 1, 1))
			.to.be.revertedWith('not_allowed_delete');
		});

		it("Test delete comment, without post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await expect(peeranhaContent.deleteComment(signers[0].address, 1, 0, 1)).to.be.revertedWith('Post_not_exist.');
		});

		it("Test delete comment, without reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.deleteComment(signers[0].address, 1, [1], 1)).to.be.revertedWith('Reply_not_exist.');
		});

		it("Test delete comment, without comment", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranhaContent.deleteComment(signers[0].address, 1, 0, 1)).to.be.revertedWith('Comment_not_exist.');

			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await expect(peeranhaContent.deleteComment(signers[0].address, 1, 1, 1)).to.be.revertedWith('Comment_not_exist.');
		});

		it("Test delete comment, post has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1]);
			await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1]);
			await peeranhaContent.deletePost(signers[0].address, 1);

			await expect(peeranhaContent.deleteComment(signers[0].address, 1, 0, 1)).to.be.revertedWith('Post_deleted.');
			await expect(peeranhaContent.deleteComment(signers[0].address, 1, 1, 1)).to.be.revertedWith('Post_deleted.');
		});

		it("Test delete comment, reply has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1]);
			await peeranhaContent.deleteReply(signers[0].address, 1, 1);

			await expect(peeranhaContent.deleteComment(signers[0].address, 1, 1, 1)).to.be.revertedWith('Reply_deleted.');
		});

		it("Test delete comment, comment has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1]);
			await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1]);
			await peeranhaContent.deleteComment(signers[0].address, 1, 0, 1);
			await peeranhaContent.deleteComment(signers[0].address, 1, 1, 1);

			await expect(peeranhaContent.deleteComment(signers[0].address, 1, 0, 1)).to.be.revertedWith('Comment_deleted.');
			await expect(peeranhaContent.deleteComment(signers[0].address, 1, 1, 1)).to.be.revertedWith('Comment_deleted.');
		});
	});

	describe('Best reply', function () {		// TODO перенести тесты с лучшим ответом
		it("Test delete expert best reply by moderator", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);

			await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);
			
			const userRating2 = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating2).to.equal(userRating + AcceptExpertReply);
			await expect(userActionRating2).to.equal(StartRating + AcceptedExpertReply);

			await peeranhaContent.deleteReply(signers[0].address, 1, 1);

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

			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);

			await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);

			const userRating2 = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);	
			await expect(userRating2).to.equal(userRating + AcceptCommonReply);
			await expect(userActionRating2 ).to.equal(StartRating + AcceptedCommonReply);

			await peeranhaContent.deleteReply(signers[0].address, 1, 1);

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

			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await  peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2Reply = await peeranhaUser.getUserRating(signers[2].address, 1);

			await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);
			
			const userRating2 = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			await expect(userRating2).to.equal(userRating + AcceptExpertReply);
			await expect(userActionRating2).to.equal(StartRating + AcceptedExpertReply);

			await peeranhaContent.deleteReply(signers[0].address, 1, 1);

			let post = await peeranhaContent.getPost(1);
			expect(post.bestReply).to.equal(0);

			const newAuthorPostRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			const newOldBestReplyRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newAuthorPostRating).to.equal(StartRating + AcceptedExpertReply);
			await expect(newOldBestReplyRating).to.equal(StartRating + ModeratorDeleteReply);

			await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 2);
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

			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
			await  peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false);
			const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userRating2Reply = await peeranhaUser.getUserRating(signers[2].address, 1);

			await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);

			const userRating2 = await peeranhaUser.getUserRating(signers[1].address, 1);
			const userActionRating2 = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);	
			await expect(userRating2).to.equal(userRating + AcceptCommonReply);
			await expect(userActionRating2 ).to.equal(StartRating + AcceptedCommonReply);

			await peeranhaContent.deleteReply(signers[0].address, 1, 1);

			let post = await peeranhaContent.getPost(1);
			expect(post.bestReply).to.equal(0);

			const newAuthorPostRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
			const newOldBestReplyRating = await peeranhaUser.getUserRating(signers[1].address, 1);
			await expect(newAuthorPostRating).to.equal(StartRating + AcceptedCommonReply);
			await expect(newOldBestReplyRating).to.equal(StartRating + ModeratorDeleteReply);

			await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 2);
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
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.updateDocumentationTree(signers[0].address, 1, hashContainer[0])

			const documentationTree = await peeranhaContent.getDocumentationTree(1);
			expect(documentationTree.hash).to.equal(hashContainer[0]);
		});

		it("Test set documentation position for non-existing community", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			
			await expect(peeranhaContent.updateDocumentationTree(signers[0].address, 1, hashContainer[0])).to.be.revertedWith('Community does not exist');
		});

		it("Test set documentation position for frozen community ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaCommunity.freezeCommunity(signers[0].address, 1);

			await expect(peeranhaContent.updateDocumentationTree(signers[0].address, 1, hashContainer[0])).to.be.revertedWith('Community is frozen');
		});

		it("Test edit documentation position", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.updateDocumentationTree(signers[0].address, 1, hashContainer[0])
			await peeranhaContent.updateDocumentationTree(signers[0].address, 1, hashContainer[1])

			const documentationTree = await peeranhaContent.getDocumentationTree(1);
			expect(documentationTree.hash).to.equal(hashContainer[1]);
		});

		it("Test edit documentation position for frozen community ", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.updateDocumentationTree(signers[0].address, 1, hashContainer[0])

			await peeranhaCommunity.freezeCommunity(signers[0].address, 1);
			await expect(peeranhaContent.updateDocumentationTree(signers[0].address, 1, hashContainer[0])).to.be.revertedWith('Community is frozen');
		});

	});

	describe('Test change post community id', function () {

		it("Test change post community id, post does not exist", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const countOfCommunities = 2;
			const communitiesIds = getIdsContainer(countOfCommunities);

			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

			await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost)).
                to.be.revertedWith('Post_not_exist.');
		});

		it("Test change post communy id by editPost, post has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const countOfCommunities = 2;
			const communitiesIds = getIdsContainer(countOfCommunities);

			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaContent.deletePost(signers[0].address, 1);
			
			await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost)).
                to.be.revertedWith('Post_deleted.');
		});

		it("Test change post communy id by editPost, new community does not exist", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost)).
                to.be.revertedWith('Community does not exist');
			await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost)).
                to.be.revertedWith('Community does not exist');
		});

		it("Test change post communy id by editPost, new community is frozen", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const countOfCommunities = 2;
			const communitiesIds = getIdsContainer(countOfCommunities);

			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaCommunity.freezeCommunity(signers[0].address, 2);

			await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost)).
                to.be.revertedWith('Community is frozen');
		});

		it("Test change community Id", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const countOfCommunities = 3;
			const communitiesIds = getIdsContainer(countOfCommunities);

			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			const post = await peeranhaContent.getPost(1);
			expect(post.communityId).to.equal(1);

			await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
			const postNew = await peeranhaContent.getPost(1);
			expect(postNew.communityId).to.equal(2);

			await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost);
			const postNew2 = await peeranhaContent.getPost(1);
			expect(postNew2.communityId).to.equal(DefaultCommunityId);

			await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);
			const postNew3 = await peeranhaContent.getPost(1);
			expect(postNew3.communityId).to.equal(2);
		});
	});

	describe('Change community id by edit post', function () {
		it("Test change post communy id by editPost, new community does not exist", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			
			await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost))
				.to.be.revertedWith('Community does not exist');
			await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost))
				.to.be.revertedWith('Community does not exist');
		});

		it("Test change post communy id by editPost, new community is frozen", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const countOfCommunities = 2;
			const communitiesIds = getIdsContainer(countOfCommunities);

			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranhaCommunity.freezeCommunity(signers[0].address, 2);
			
			await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost))
				.to.be.revertedWith('Community is frozen');
		});

		it("Test change post community Id by editPost", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const countOfCommunities = 2;
			const communitiesIds = getIdsContainer(countOfCommunities);

			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await createCommunities(peeranhaCommunity, signers[0].address, countOfCommunities, communitiesIds);

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			const post = await peeranhaContent.getPost(1);
			expect(post.communityId).to.equal(1);

			await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost);

			const postNew = await peeranhaContent.getPost(1);
			expect(postNew.communityId).to.equal(2);
		});
	});

	describe('Change post type by edit post', function () {

		describe('Change post type by edit post', function () {

			it("Test change post type by editPost expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);
				
				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.CommonPost);
			});

			it("Test change post type by editPost Expert -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.Tutorial);
			});

			it("Test change post type by editPost Expert -> tutorial (the post has reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);

				await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial))
					.to.be.revertedWith('Error_postType');
			});

			it("Test change post type by editPost common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.ExpertPost);
			});

			it("Test change post type by editPost common -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.Tutorial);
			});

			it("Test change post type by editPost common -> tutorial (the post has reply)", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);

				await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial))
					.to.be.revertedWith('Error_postType');
			});

			it("Test change post type by editPost tutoral -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.CommonPost);
			});

			it("Test change post type by editPost tutoral -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost);

				const post = await peeranhaContent.getPost(1);
				await expect(post.postType).to.equal(PostTypeEnum.ExpertPost);
			});
		});

		describe('Change post type by edit post after post upvote', function () {

			it("Test upVote post expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedCommonPost);
			});

			it("Test upVote post expert -> tytorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedTutorial);
			});

			it("Test upVote post common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertPost);
			});

			it("Test upVote post common -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedTutorial);
			});

			it("Test upVote post tutorial -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedTutorial);
			});

			it("Test upVote post tutorial -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedCommonPost);
			});
		});

		describe('Change post type by edit post after 2 post upvotes', function () {

			it("Test 2 upVote 2 downVote post expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);
			});

			it("Test 2 upVote 2 downVote post expert -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedTutorial * 2 + DownvotedTutorial * 2);
			});

			it("Test 2 upVote 2 downVote post common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);
			});

			it("Test 2 upVote 2 downVote post common -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedTutorial * 2 + DownvotedTutorial * 2);
			});

			it("Test 2 upVote 2 downVote post tutorial -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial * 2 + DownvotedTutorial * 2);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);
			});

			it("Test 2 upVote 2 downVote post tutorial -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedTutorial* 2 + DownvotedTutorial * 2);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);
			});

		});

		describe('Change post type by edit post after 4 cancel post upvote', function () {

			it("Test 4 cancel votes post expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating);
			});

			it("Test 4 cancel votes post expert -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating);
			});

			it("Test cancel votes post common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating);
			});

			it("Test cancel votes post common -> tutorial", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.Tutorial)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating);
			});

			it("Test cancel votes post tutorial -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating);
			});

			it("Test 4 cancel votes post tutorial -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating);
			});
		});

		describe('Change post type by edit post after upvote reply', function () {		

			it("Test upVote reply expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[2]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[2]).createPost(signers[2].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertReply + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.connect(signers[2]).editPost(signers[2].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedCommonReply + FirstCommonReply + QuickCommonReply);
			});

			it("Test upVote reply common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[2]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[2]).createPost(signers[2].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonReply + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.connect(signers[2]).editPost(signers[2].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertReply + FirstExpertReply + QuickExpertReply);
			});
		});

		describe('Change post type by edit post after downVote reply', function () {		

			it("Test downVote reply expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[2]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[2]).createPost(signers[2].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedExpertReply);

				await peeranhaContent.connect(signers[2]).editPost(signers[2].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DownvotedCommonReply);
			});

			it("Test downVote reply common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[2]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[2]).createPost(signers[2].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + DownvotedCommonReply);

				await peeranhaContent.connect(signers[2]).editPost(signers[2].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + DownvotedExpertReply);
			});
		});

		describe('Change post type by edit post after 2 upVote 2 downVote reply', function () {	

			it("Test 2 upVote 2 downVote reply expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[2]).createPost(signers[2].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedExpertReply * 2 + DownvotedExpertReply * 2 + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.connect(signers[2]).editPost(signers[2].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedCommonReply * 2 + DownvotedCommonReply * 2 + FirstCommonReply + QuickCommonReply);
			});

			it("Test 2 upVote 2 downVote reply common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);
				
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[2]).createPost(signers[2].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + UpvotedCommonReply * 2 + DownvotedCommonReply * 2 + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.connect(signers[2]).editPost(signers[2].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + UpvotedExpertReply * 2 + DownvotedExpertReply * 2 + FirstExpertReply + QuickExpertReply);
			});
		});

		describe('Change post type by edit post after 4 cancel vote reply', function () {	

			it("Test 4 cancel vote reply expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[2]).createPost(signers[2].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.connect(signers[2]).editPost(signers[2].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			});

			it("Test 4 cancel vote reply common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
				await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[2]).createPost(signers[2].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
				const oldRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(oldRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);
				await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

				const userRating =  await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(userRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);

				await peeranhaContent.connect(signers[2]).editPost(signers[2].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost)
				const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
			});
		});

		describe('Change post type by edit post first/quick reply 0 rating', function () {	

			it("Test first/quick reply expert -> common 0 rating", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
				
				const userRating =  await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
				const newRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(newRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			});

			it("Test first/quick reply common -> expert 0 rating", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
				
				const userRating =  await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(userRating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

				await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
				const newRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				await expect(newRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			});
		});

		describe('Change post type by edit post first/quick/best reply', function () {	

			it("Test best reply expert -> common", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
				await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);
				
				const ratingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const ratingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(ratingReply).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);
				await expect(ratingPost).to.equal(StartRating + AcceptedExpertReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
				const newRatingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const newRatingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingReply).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);
				await expect(newRatingPost).to.equal(StartRating + AcceptedCommonReply);
			});

			it("Test best reply common -> expert", async function () {
				const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
				const signers = await ethers.getSigners();
				const hashContainer = getHashContainer();
				const ipfsHashes = getHashesContainer(2);

				await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
				await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
				await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

				await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
				await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
				await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);
				
				const ratingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const ratingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(ratingReply).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);
				await expect(ratingPost).to.equal(StartRating + AcceptedCommonReply);

				await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost)
				const newRatingPost = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
				const newRatingReply = await peeranhaUser.getUserRating(signers[1].address, 1);
				await expect(newRatingReply).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);
				await expect(newRatingPost).to.equal(StartRating + AcceptedExpertReply);
			});
		});

		describe('Actions after change post type by edit post by edit post', function () {
		
			describe('upvote after change post type by edit post by edit post', function () {
			
				it("Test upVote post after expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
			
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + UpvotedCommonPost);
				});

				it("Test upVote post after common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost)
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + UpvotedExpertPost);
				});
			});

			describe('2 upVote 2 downVote after change post type by edit post', function () {

				it("Test 2 upVote 2 downVote post after expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + UpvotedCommonPost * 2 + DownvotedCommonPost * 2);
				});

				it("Test 2 upVote 2 downVote post after common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);


					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost)
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + UpvotedExpertPost * 2 + DownvotedExpertPost * 2);
				});
			});

			describe('4 cancel vote after change post type by edit post', function () {

				it("Test cancel vote post after expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating);
				});

				it("Test cancel vote post after common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost)
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 0, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 0, 0, 0);

					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating);
				});
			});

			describe('upVote reply after change post type by edit post', function () {

				it("Test upVote reply after expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
					
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + UpvotedCommonReply);
				});

				it("Test upVote reply after common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
					
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost)
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + UpvotedExpertReply);
				});
			});

			describe('downVote reply after change post type by edit post', function () {

				it("Test downVote reply after expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
					
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + DownvotedCommonReply);
				});

				it("Test downVote reply after common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
					
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost)
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + DownvotedExpertReply);
				});
			});

			describe('2 cancel vote for reply after change post type by edit post', function () {

				it("Test 2 upVote 2 downVote reply after expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
					
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + UpvotedCommonReply * 2 + DownvotedCommonReply * 2);
				});

				it("Test 2 upVote 2 downVote reply after common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
					
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost)
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + UpvotedExpertReply * 2 + DownvotedExpertReply * 2);
				});
			});

			describe('Cancel vote for reply after change post type by edit post', function () {

				it("Test cancel vote reply after expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
					
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
					await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating);
				});

				it("Test cancel vote reply after common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await createUserWithAnotherRating(signers[2], 100, peeranhaUser, hashContainer);
					await createUserWithAnotherRating(signers[3], 100, peeranhaUser, hashContainer);
					await createUserWithAnotherRating(signers[4], 100, peeranhaUser, hashContainer);

					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
					
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost)
					await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
					await peeranhaContent.connect(signers[2]).voteItem(signers[2].address, 1, 1, 0, 1);
					await peeranhaContent.connect(signers[3]).voteItem(signers[3].address, 1, 1, 0, 0);
					await peeranhaContent.connect(signers[4]).voteItem(signers[4].address, 1, 1, 0, 0);

					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating);
				});
			});

			describe('publish first/quick reply after change post type by edit post', function () {

				it("Test first/quick reply after expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
					await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
					
					const newRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
					await expect(newRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				});

				it("Test first/quick reply after common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
					await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
					
					const newRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
					await expect(newRating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
				});
			});

			describe('mark as best reply after change post type by edit post', function () {

				it("Test best reply expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
					await peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);
					
					const userPost = await peeranhaUser.getUserRating(signers[1].address, 1);
					const userReply = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
					await expect(userReply).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);
					await expect(userPost).to.equal(StartRating + AcceptedCommonReply);
				});

				it("Test best reply common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost)
					await peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);
					
					const userPost = await peeranhaUser.getUserRating(signers[1].address, 1);
					const userReply = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
					await expect(userReply).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);
					await expect(userPost).to.equal(StartRating + AcceptedExpertReply);
				});
			});

			describe('delete post after change post type by edit post', function () {

				it("Test delete post after change post type by edit post expert -> common", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
					await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost)
					await peeranhaContent.connect(signers[1]).deletePost(signers[1].address, 1);
					
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + DeleteOwnPost);
				});
				
				it("Test delete reply after change post type by edit post common -> expert", async function () {
					const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
					const signers = await ethers.getSigners();
					const hashContainer = getHashContainer();
					const ipfsHashes = getHashesContainer(2);

					await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
					await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
					await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

					await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
					await  peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
					await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.ExpertPost)
					await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);
					
					const newRating = await peeranhaUser.getUserRating(signers[1].address, 1);
					await expect(newRating).to.equal(StartRating + DeleteOwnReply);
				});
			});
		});
	});

	// in utils error "ReferenceError: expect is not defined"
	const createCommunities = async (peeranhaCommunity, wallet, countOfCommunities, communitiesIds) => {
		const ipfsHashes = getHashesContainer(countOfCommunities);
		await Promise.all(communitiesIds.map(async(id) => {
			return await peeranhaCommunity.createCommunity(wallet, ipfsHashes[id - 1], createTags(5));
		}));

		expect(await peeranhaCommunity.getCommunitiesCount()).to.equal(countOfCommunities)

		await Promise.all(communitiesIds.map(async(id) => {
			const community = await peeranhaCommunity.getCommunity(id);
			return await expect(community.ipfsDoc.hash).to.equal(ipfsHashes[id - 1]);
		}));
	}

});
