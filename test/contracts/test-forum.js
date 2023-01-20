const { disableExperimentalFragmentVariables } = require("@apollo/client");
const { expect } = require("chai");
const { 
	wait, createPeerenhaAndTokenContract, registerTwoUsers, createUserWithAnotherRating, getHashContainer, getHashesContainer, createTags, getIdsContainer,
	PostTypeEnum, StartRating, StartRatingWithoutAction, deleteTime, DeleteOwnReply, QuickReplyTime, EmptyIpfs,
    DownvoteExpertPost, UpvotedExpertPost, DownvotedExpertPost, DownvoteCommonPost, UpvotedCommonPost, DownvotedCommonPost,
    ModeratorDeletePost, DownvoteExpertReply, UpvotedExpertReply, DownvotedExpertReply, AcceptExpertReply, AcceptedExpertReply, 
    FirstExpertReply, QuickExpertReply, DownvoteCommonReply, UpvotedCommonReply, DownvotedCommonReply, AcceptCommonReply,
    AcceptedCommonReply, FirstCommonReply, QuickCommonReply, ModeratorDeleteReply, ModeratorDeleteComment,
	DownvoteTutorial, UpvotedTutorial, DownvotedTutorial, DeleteOwnPost, DefaultCommunityId, LanguagesEnum
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
						.createPost(signers[0].address, 1, hash, PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
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
						.createPost(signers[0].address, 1, hash, PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
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
						.createPost(signers[0].address, 1, hash, PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
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
	
			await expect(peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [], LanguagesEnum.English))
				.to.be.revertedWith('At least one tag is required.');
		});

		it("Test create post with non-existing tag", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await expect(peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [6], LanguagesEnum.English)).to.be.revertedWith('Wrong tag id.');
			await expect(peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [2, 1, 6], LanguagesEnum.English)).to.be.revertedWith('Wrong tag id.');
			await expect(peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [6, 2], LanguagesEnum.English)).to.be.revertedWith('Wrong tag id.');
			await expect(peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [0], LanguagesEnum.English)).to.be.revertedWith('The community does not have tag with 0 id.');
			await expect(peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [], LanguagesEnum.English)).to.be.revertedWith('At least one tag is required.');
		});

		it("Test create post without ipfs hash", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await expect(peeranhaContent.createPost(signers[0].address, 1, EmptyIpfs, PostTypeEnum.ExpertPost, [1], LanguagesEnum.English))
			.to.be.revertedWith('Invalid_ipfsHash');
		});

		xit("Test create post by not registered user", async function () { // create user createIfDoesNotExist
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await expect(peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English))
				.to.be.revertedWith('user_not_found');
		});

		it("Test create post for non-existing community", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

			await expect(peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English)).to.be.revertedWith('Community does not exist');
		});

		it("Test create post for frozen community", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaCommunity.freezeCommunity(signers[0].address, 1);

			await expect(peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English)).to.be.revertedWith('Community is frozen');
			await peeranhaCommunity.unfreezeCommunity(signers[0].address, 1);

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.Tutorial, [1], LanguagesEnum.English);
			await expect(peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English)).to.be.revertedWith('You can not publish replies in tutorial.');
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			// await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await wait(5000)
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await peeranhaContent.connect(signers[3]).createReply(signers[3].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await peeranhaContent.connect(signers[4]).createReply(signers[4].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await peeranhaContent.connect(signers[5]).createReply(signers[5].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
		});

		it("Test create official reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[2]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[2], false, LanguagesEnum.English);

			const post = await peeranhaContent.getPost(1);
			expect(post.officialReply).to.equal(0);

			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], true, LanguagesEnum.English);

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
	
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await expect(peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English)).to.be.revertedWith('Users can not publish 2 replies for expert and common posts.');
		});
	
		it("Test double replies in common post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
	
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await expect(peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English)).to.be.revertedWith('Users can not publish 2 replies for expert and common posts.');
		});

		it("Test create reply on reply in expert post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
	
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await expect(peeranhaContent.createReply(signers[0].address, 1, 1, hashContainer[1], false, LanguagesEnum.English)).to.be.revertedWith('User is forbidden to reply on reply for Expert and Common type of posts');
		});
	
		it("Test create reply on reply in common post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
	
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await expect(peeranhaContent.createReply(signers[0].address, 1, 1, hashContainer[1], false, LanguagesEnum.English)).to.be.revertedWith('User is forbidden to reply on reply for Expert and Common type of posts');
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[2], true, LanguagesEnum.English);

			const post = await peeranhaContent.getPost(1);
			expect(post.officialReply).to.equal(1);

			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], true, LanguagesEnum.English);

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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.deletePost(signers[0].address, 1);

			await expect(peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English)).to.be.revertedWith('Post_deleted.');
		});

		it("Test create reply without post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await expect(peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English)).to.be.revertedWith('Post_not_exist.');
		});

		it("Test create reply without ipfs hash", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

			await expect(peeranhaContent.createReply(signers[0].address, 1, 0, EmptyIpfs, false, LanguagesEnum.English))
			.to.be.revertedWith('Invalid_ipfsHash');
		});

		xit("Test create reply by not registered user", async function () { // create user createIfDoesNotExist
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			
			await expect(peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[0], false, LanguagesEnum.English))
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
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			
			await expect(peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[0], true, LanguagesEnum.English))
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.English);

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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.English);

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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await peeranhaContent.deletePost(signers[0].address, 1);

			await expect(peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.English)).to.be.revertedWith('Post_deleted.');
			await expect(peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.English)).to.be.revertedWith('Post_deleted.');
		});

		it("Test create comment, reply has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await peeranhaContent.deleteReply(signers[0].address, 1, 1);
			
			await expect(peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.English)).to.be.revertedWith('Reply_deleted.');
		});

		it("Test create comment without post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

			await expect(peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.English)).to.be.revertedWith('Post_not_exist.');
		});

		it("Test create comment without reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await expect(peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.English)).to.be.revertedWith('Reply_not_exist.');
		});

		xit("Test create comment by not registered user", async function () {  // create user createIfDoesNotExist
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			
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
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			
			await expect(peeranhaContent.createComment(signers[0].address, 1, 1, EmptyIpfs, LanguagesEnum.English))
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await expect(peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1], LanguagesEnum.English))
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

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1], LanguagesEnum.English)
			
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await expect(peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1], LanguagesEnum.English))
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

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[1], LanguagesEnum.English);

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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[1], LanguagesEnum.English);

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
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[1], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
			await peeranhaContent.editPost(signers[0].address, 1, hashContainer[2], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
			await peeranhaContent.editPost(signers[0].address, 2, hashContainer[0], [2], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);

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
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.editPost(signers[0].address, 1, hashContainer[1], [2], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);

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
			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[1], [2], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);

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
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [2], 2, PostTypeEnum.CommonPost, LanguagesEnum.English)).
				to.be.revertedWith('Error_change_communityId');
		});

		it("Test edit post (ipfs, tags, communityId, postType) by not author (common user) the post add change ipfs", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[1], [2], 2, PostTypeEnum.CommonPost, LanguagesEnum.English)).
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
			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.editPost(signers[0].address, 1, hashContainer[0], [2], 2, PostTypeEnum.CommonPost, LanguagesEnum.English);

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

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[1], [2], 2, PostTypeEnum.CommonPost, LanguagesEnum.English)).
				to.be.revertedWith('Not_allowed_edit_not_author');
		});

		it("Test edit documentation", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			const post = await peeranhaContent.getPost(1);
			expect(post.ipfsDoc.hash).to.equal(hashContainer[0]);

			await peeranhaContent.editPost(signers[0].address, 1, hashContainer[2], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)
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
	
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			
			await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[2], [6], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)).to.be.revertedWith('Wrong tag id.');
			await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[2], [2, 1, 6], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)).to.be.revertedWith('Wrong tag id.');
			await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[2], [6, 2], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)).to.be.revertedWith('Wrong tag id.');
			await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[2], [0], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)).to.be.revertedWith('The community does not have tag with 0 id.');
		});

		it("Test edit post by not registered user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[2], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English))
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[2], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English))
				.to.be.revertedWith('Not_allowed_edit_not_author');	// not_allowed_edit + not_allowed_admin_or_comm_moderator
		});

		it("Test edit post with invalid ipfs hash", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await expect(peeranhaContent.editPost(signers[0].address, 1, EmptyIpfs, [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English))
			.to.be.revertedWith('Invalid_ipfsHash');
		});

		it("Test edit post, without post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[2], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)).to.be.revertedWith('Post_not_exist.');
		});

		it("Test edit post, post hes been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.deletePost(signers[0].address, 1);

			await expect(peeranhaContent.editPost(signers[0].address, 1, hashContainer[2], [], 1, PostTypeEnum.ExpertPost, LanguagesEnum.English)).to.be.revertedWith('Post_deleted.');
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await peeranhaContent.editReply(signers[0].address, 1, 1, hashContainer[2], disableExperimentalFragmentVariables, LanguagesEnum.English);

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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[2], false, LanguagesEnum.English);

			const post = await peeranhaContent.getPost(1);
			expect(post.officialReply).to.equal(0);

			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], true, LanguagesEnum.English);

			let updatedPost = await peeranhaContent.getPost(1);
			expect(updatedPost.officialReply).to.equal(2);

			await peeranhaContent.editReply(signers[0].address, 1, 2, hashContainer[1], false, LanguagesEnum.English);
			updatedPost = await peeranhaContent.getPost(1);
			expect(updatedPost.officialReply).to.equal(0);

			await peeranhaContent.editReply(signers[0].address, 1, 2, hashContainer[1], true, LanguagesEnum.English);
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

			await expect(peeranhaContent.editReply(signers[0].address, 1, 1, EmptyIpfs, false, LanguagesEnum.English))
			.to.be.revertedWith('Invalid_ipfsHash');
		});
		
		it("Test edit reply by not registered user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			
			await expect(peeranhaContent.connect(signers[1]).editReply(signers[1].address, 1, 1, hashContainer[2], false, LanguagesEnum.English))
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			
			await expect(peeranhaContent.connect(signers[1]).editReply(signers[1].address, 1, 1, hashContainer[2], false, LanguagesEnum.English))
			.to.be.revertedWith('not_allowed_edit');
		});

		it("Test edit reply, without post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await expect(peeranhaContent.editReply(signers[0].address, 1, 1, hashContainer[2], false, LanguagesEnum.English)).to.be.revertedWith('Post_not_exist.');
		});

		it("Test edit reply, without reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await expect(peeranhaContent.editReply(signers[0].address, 1, 1, hashContainer[2], false, LanguagesEnum.English)).to.be.revertedWith('Reply_not_exist.');
		});

		it("Test edit reply, post has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await peeranhaContent.deletePost(signers[0].address, 1);

			await expect(peeranhaContent.editReply(signers[0].address, 1, 1, hashContainer[2], false, LanguagesEnum.English)).to.be.revertedWith('Post_deleted.');
		});

		it("Test edit reply, reply has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await peeranhaContent.deleteReply(signers[0].address, 1, 1);

			await expect(peeranhaContent.editReply(signers[0].address, 1, 1, hashContainer[2], false, LanguagesEnum.English)).to.be.revertedWith('Reply_deleted.');
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.English);
			await peeranhaContent.editComment(signers[0].address, 1, 0, 1, hashContainer[2], LanguagesEnum.English);

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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.English);

			await expect(peeranhaContent.editComment(signers[0].address, 1, 0, 1, EmptyIpfs, LanguagesEnum.English))
			.to.be.revertedWith('Invalid_ipfsHash');
		});

		it("Test edit comment by not registered user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.English);

			await expect(peeranhaContent.connect(signers[1]).editComment(signers[1].address, 1, 0, 1, hashContainer[2], LanguagesEnum.English))
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.English);

			await expect(peeranhaContent.connect(signers[1]).editComment(signers[1].address, 1, 0, 1, hashContainer[2], LanguagesEnum.English))
			.to.be.revertedWith('not_allowed_edit');
		});

		it("Test edit comment, without post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

			await expect(peeranhaContent.editComment(signers[0].address, 1, 1, 1, hashContainer[2], LanguagesEnum.English)).to.be.revertedWith('Post_not_exist.');
		});

		it("Test edit comment, without reply", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await expect(peeranhaContent.editComment(signers[0].address, 1, 1, 1, hashContainer[2], LanguagesEnum.English)).to.be.revertedWith('Reply_not_exist.');
		});

		it("Test edit comment, without comment", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await expect(peeranhaContent.editComment(signers[0].address, 1, 1, 1, hashContainer[2], LanguagesEnum.English)).to.be.revertedWith('Comment_not_exist.');
		});

		it("Test edit comment, post has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[0], false, LanguagesEnum.English);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.English);
			await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.English);
			await peeranhaContent.deletePost(signers[0].address, 1);

			await expect(peeranhaContent.editComment(signers[0].address, 1, 0, 1, hashContainer[2], LanguagesEnum.English)).to.be.revertedWith('Post_deleted.');
			await expect(peeranhaContent.editComment(signers[0].address, 1, 1, 1, hashContainer[2], LanguagesEnum.English)).to.be.revertedWith('Post_deleted.');
		});

		it("Test edit comment, reply has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[0], false, LanguagesEnum.English);
			await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.English);
			await peeranhaContent.deleteReply(signers[0].address, 1, 1);

			await expect(peeranhaContent.editComment(signers[0].address, 1, 1, 1, hashContainer[2], LanguagesEnum.English)).to.be.revertedWith('Reply_deleted.');		
		});

		it("Test edit comment, comment has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[0], false, LanguagesEnum.English);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.English);
			await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.English);
			await peeranhaContent.deleteComment(signers[0].address, 1, 0, 1);
			await peeranhaContent.deleteComment(signers[0].address, 1, 1, 1);

			await expect(peeranhaContent.editComment(signers[0].address, 1, 0, 1, hashContainer[2], LanguagesEnum.English)).to.be.revertedWith('Comment_deleted.');
			await expect(peeranhaContent.editComment(signers[0].address, 1, 1, 1, hashContainer[2], LanguagesEnum.English)).to.be.revertedWith('Comment_deleted.');
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
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
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await  peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			const postOld = await peeranhaContent.getPost(1);
			expect(postOld.deletedReplyCount).to.equal(0);
			await peeranhaContent.deleteReply(signers[0].address, 1, 1);

			const reply = await peeranhaContent.getReply(1, 1);
			expect(reply.isDeleted).to.equal(true);
			const post = await peeranhaContent.getPost(1);
			expect(post.deletedReplyCount).to.equal(1);
		});

		it("Test delete reply by not registered user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[2], false, LanguagesEnum.English);

			const post = await peeranhaContent.getPost(1);
			expect(post.officialReply).to.equal(0);

			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], true, LanguagesEnum.English);
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

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
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

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await expect(peeranhaContent.deleteReply(signers[0].address, 1, 1)).to.be.revertedWith('Reply_not_exist.');
		});

		it("Test delete reply, post has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.English);
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

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1], LanguagesEnum.English);
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

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[1], LanguagesEnum.English);
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.English);
			await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.English);

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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.English);
			await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.English);
			
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await expect(peeranhaContent.deleteComment(signers[0].address, 1, [1], 1)).to.be.revertedWith('Reply_not_exist.');
		});

		it("Test delete comment, without comment", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await expect(peeranhaContent.deleteComment(signers[0].address, 1, 0, 1)).to.be.revertedWith('Comment_not_exist.');

			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await expect(peeranhaContent.deleteComment(signers[0].address, 1, 1, 1)).to.be.revertedWith('Comment_not_exist.');
		});

		it("Test delete comment, post has been deleted", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.English);
			await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.English);
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.English);
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1], LanguagesEnum.English);
			await peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1], LanguagesEnum.English);
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
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

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
			await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
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
});
