const { expect } = require("chai");
const { wait } = require('./utils');
const crypto = require("crypto");


describe("Test vote", function () {
	const PostTypeEnum = {"ExpertPost":0, "CommonPost":1, "Tutorial":2}

	describe("Test upVote post", function () {

		it("Test upVote expert post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.voteItem(1, 0, 0, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const post = await peeranha.getPost(1);
			await expect(user.rating).to.equal(StartRating + UpvotedExpertPost);
			await expect(post.rating).to.equal(1);
			
			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('0x01');
		});

		it("Test upVote common post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.voteItem(1, 0, 0, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const post = await peeranha.getPost(1);
			await expect(user.rating).to.equal(StartRating + UpvotedCommonPost);
			await expect(post.rating).to.equal(1);

			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('0x01');
		});

		/* - */ xit("Test upVote tutorial post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.voteItem(1, 0, 0, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const post = await peeranha.getPost(1);
			await expect(user.rating).to.equal(StartRating + UpvotedTutorial);
			await expect(post.rating).to.equal(1);
			
			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('0x01');
		});
	});

	describe("Test double upVote post", function () {

		it("Test double upVote expert post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.voteItem(1, 0, 0, 1);
			await peeranha.voteItem(1, 0, 0, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const post = await peeranha.getPost(1);
			await expect(user.rating).to.equal(StartRating);
			await expect(post.rating).to.equal(0);

			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});

		it("Test double upVote common post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.voteItem(1, 0, 0, 1);
			await peeranha.voteItem(1, 0, 0, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const post = await peeranha.getPost(1);
			await expect(user.rating).to.equal(StartRating);
			await expect(post.rating).to.equal(0);

			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});

		/* - */ xit("Test double upVote tutorial post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.voteItem(1, 0, 0, 1);
			await peeranha.voteItem(1, 0, 0, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const post = await peeranha.getPost(1);
			await expect(user.rating).to.equal(StartRating);
			await expect(post.rating).to.equal(0);
		});
	});

	describe("Test upVote own post", function () {

		it("Test upVote own expert post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranha.voteItem(1, 0, 0, 1)).to.be.revertedWith('You can not vote for own post');

			const user = await peeranha.getUserByAddress(signers[0].address);
			const post = await peeranha.getPost(1);
			await expect(user.rating).to.equal(StartRating);
			await expect(post.rating).to.equal(0);
		});

		it("Test upVote own common post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await expect(peeranha.voteItem(1, 0, 0, 1)).to.be.revertedWith('You can not vote for own post');

			const user = await peeranha.getUserByAddress(signers[0].address);
			const post = await peeranha.getPost(1);
			await expect(user.rating).to.equal(StartRating);
			await expect(post.rating).to.equal(0);
		});

		/* - */ xit("Test upVote own tutorial post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await expect(peeranha.voteItem(1, 0, 0, 1)).to.be.revertedWith('You can not vote for own post');

			const user = await peeranha.getUserByAddress(signers[0].address);
			const post = await peeranha.getPost(1);
			await expect(user.rating).to.equal(StartRating);
			await expect(post.rating).to.equal(0);
		});
	});

	describe("Test downVote post", function () {

		it("Test downVote expert post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.voteItem(1, 0, 0, 0);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const user2 = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			const post = await peeranha.getPost(1);
			await expect(user.rating).to.equal(StartRating + DownvotedExpertPost);
			await expect(user2.rating).to.equal(StartRating + DownvoteExpertPost);
			await expect(post.rating).to.equal(-1);

			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('-0x01');
		});

		it("Test downVote common post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.voteItem(1, 0, 0, 0);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const user2 = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			const post = await peeranha.getPost(1);
			await expect(user.rating).to.equal(StartRating + DownvotedCommonPost);
			await expect(user2.rating).to.equal(StartRating + DownvoteCommonPost);
			await expect(post.rating).to.equal(-1);

			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('-0x01');
		});

		/* - */ xit("Test downVote tutorial post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.voteItem(1, 0, 0, 0);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const user2 = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			const post = await peeranha.getPost(1);
			await expect(user.rating).to.equal(StartRating + DownvotedTutorial);
			await expect(user2.rating).to.equal(StartRating + DownvoteTutorial);
			await expect(post.rating).to.equal(-1);
		});
	});

	describe("Test double downVote post", function () {

		it("Test double downVote expert post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.voteItem(1, 0, 0, 0);
			await peeranha.voteItem(1, 0, 0, 0);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			const post = await peeranha.getPost(1);
			await expect(user.rating).to.equal(StartRating);
			await expect(userAction.rating).to.equal(StartRating);
			await expect(post.rating).to.equal(0);

			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});

		it("Test double downVote common post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.voteItem(1, 0, 0, 0);
			await peeranha.voteItem(1, 0, 0, 0);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			const post = await peeranha.getPost(1);
			await expect(user.rating).to.equal(StartRating);
			await expect(userAction.rating).to.equal(StartRating);
			await expect(post.rating).to.equal(0);

			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});

		/* - */ xit("Test double downVote tutorial post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.voteItem(1, 0, 0, 0);
			await peeranha.voteItem(1, 0, 0, 0);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			const post = await peeranha.getPost(1);
			await expect(user.rating).to.equal(StartRating);
			await expect(userAction.rating).to.equal(StartRating);
			await expect(post.rating).to.equal(0);
		});
	});

	describe("Test downVote own post", function () {

		it("Test downVote own expert post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await expect(peeranha.voteItem(1, 0, 0, 0)).to.be.revertedWith('You can not vote for own post');

			const user = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			const post = await peeranha.getPost(1);
			await expect(user.rating).to.equal(StartRating);
			await expect(post.rating).to.equal(0);
		});

		it("Test downVote own common post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await expect(peeranha.voteItem(1, 0, 0, 0)).to.be.revertedWith('You can not vote for own post');

			const user = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			const post = await peeranha.getPost(1);
			await expect(user.rating).to.equal(StartRating);
			await expect(post.rating).to.equal(0);
		});

		/* - */ xit("Test downVote own tutorial post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await expect(peeranha.voteItem(1, 0, 0, 0)).to.be.revertedWith('You can not vote for own post');

			const user = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			const post = await peeranha.getPost(1);
			await expect(user.rating).to.equal(StartRating);
			await expect(post.rating).to.equal(0);
		});
	});

	describe("Test change vote for post", function () {

		it("Test downVote after upvote expert post", async function () {					// will add test common tutorial
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.voteItem(1, 0, 0, 1);
			await peeranha.voteItem(1, 0, 0, 0);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			const post = await peeranha.getPost(1);
			await expect(user.rating).to.equal(StartRating + DownvotedExpertPost);
			await expect(userAction.rating).to.equal(StartRating + DownvoteExpertPost);
			await expect(post.rating).to.equal(-1);

			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('-0x01');
		});

		it("Test upvote after downvote expert post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await registerTwoUsers(peeranha, signers, hashContainer);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.voteItem(1, 0, 0, 0);
			await peeranha.voteItem(1, 0, 0, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			const post = await peeranha.getPost(1);
			await expect(user.rating).to.equal(StartRating + UpvotedExpertPost);
			await expect(userAction.rating).to.equal(StartRating);
			await expect(post.rating).to.equal(1);

			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('0x01');
		});

		it("Test downvote after upvote common post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await registerTwoUsers(peeranha, signers, hashContainer);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.voteItem(1, 0, 0, 1);
			await peeranha.voteItem(1, 0, 0, 0);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			const post = await peeranha.getPost(1);
			await expect(user.rating).to.equal(StartRating + DownvotedCommonPost);
			await expect(userAction.rating).to.equal(StartRating + DownvoteCommonPost);
			await expect(post.rating).to.equal(-1);

			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('-0x01');
		});
		
		it("Test upvote after downvote common post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await registerTwoUsers(peeranha, signers, hashContainer);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.voteItem(1, 0, 0, 0);
			await peeranha.voteItem(1, 0, 0, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			const post = await peeranha.getPost(1);
			await expect(user.rating).to.equal(StartRating + UpvotedCommonPost);
			await expect(userAction.rating).to.equal(StartRating);
			await expect(post.rating).to.equal(1);

			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 0, 0);
			await expect(statusHistory._hex).to.equal('0x01');
		});

		/* - */ xit("Test upvote after downvote tutorial post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await registerTwoUsers(peeranha, signers, hashContainer);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.voteItem(1, 0, 0, 0);
			await peeranha.voteItem(1, 0, 0, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			const post = await peeranha.getPost(1);
			await expect(user.rating).to.equal(StartRating + UpvotedTutorial);
			await expect(userAction.rating).to.equal(StartRating);
			await expect(post.rating).to.equal(1);
		});
	});

	describe("Test delete post after vote for post", function () {

		it("Test delete post after upvote expert post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.voteItem(1, 0, 0, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(StartRating + UpvotedExpertPost);
			await expect(userAction.rating).to.equal(StartRating);

			await peeranha.connect(signers[1]).deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(newUserRating.rating).to.equal(StartRating + DeleteOwnPost);
			await expect(newUserActionRating.rating).to.equal(StartRating);
		});

		it("Test delete post after upvote common post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.voteItem(1, 0, 0, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(StartRating + UpvotedCommonPost);
			await expect(userAction.rating).to.equal(StartRating);

			await peeranha.connect(signers[1]).deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(newUserRating.rating).to.equal(StartRating + DeleteOwnPost);
			await expect(newUserActionRating.rating).to.equal(StartRating);
		});

		/* - */ xit("Test delete post after upvote tutorial ", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.voteItem(1, 0, 0, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(StartRating + UpvotedTutorial);
			await expect(userAction.rating).to.equal(StartRating);

			await peeranha.connect(signers[1]).deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(newUserRating.rating).to.equal(StartRating + DeleteOwnPost);
			await expect(newUserActionRating.rating).to.equal(StartRating);
		});

		it("Test delete post after downvote expert post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.voteItem(1, 0, 0, 0);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(StartRating + DownvotedExpertPost);
			await expect(userAction.rating).to.equal(StartRating + DownvoteExpertPost);

			await peeranha.connect(signers[1]).deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(newUserRating.rating).to.equal(StartRating + DownvotedExpertPost + DeleteOwnPost);
			await expect(newUserActionRating.rating).to.equal(StartRating + DownvoteExpertPost);
		});

		it("Test delete post after downvote common post", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.voteItem(1, 0, 0, 0);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(StartRating + DownvotedCommonPost);
			await expect(userAction.rating).to.equal(StartRating + DownvoteCommonPost);

			await peeranha.connect(signers[1]).deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(newUserRating.rating).to.equal(StartRating + DownvotedCommonPost + DeleteOwnPost);
			await expect(newUserActionRating.rating).to.equal(StartRating + DownvoteCommonPost);
		});

		/* - */ xit("Test delete post after downvote tutorial", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.voteItem(1, 0, 0, 0);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(StartRating + DownvotedTutorial);
			await expect(userAction.rating).to.equal(StartRating + DownvoteTutorial);

			await peeranha.connect(signers[1]).deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(newUserRating.rating).to.equal(StartRating + DownvotedCommonPost + DeleteOwnPost);
			await expect(newUserActionRating.rating).to.equal(StartRating + DownvoteCommonPost);
		});
	});

	describe("Test delete post after vote for reply", function () {

		it("Test delete post after upvote expert reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);

			await peeranha.voteItem(1, 1, 0, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(userRating.rating + UpvotedExpertReply);
			await expect(userAction.rating).to.equal(userActionRating.rating);

			await peeranha.deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(newUserRating.rating).to.equal(StartRating);
			await expect(newUserActionRating.rating).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test delete post after upvote common reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);

			await peeranha.voteItem(1, 1, 0, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(userRating.rating + UpvotedCommonReply);
			await expect(userAction.rating).to.equal(userActionRating.rating);

			await peeranha.deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(newUserRating.rating).to.equal(StartRating);
			await expect(newUserActionRating.rating).to.equal(StartRating + DeleteOwnReply);
		});

		/* - */ xit("Test delete post after upvote tutorial reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);

			await peeranha.voteItem(1, 1, 0, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(userRating.rating);
			await expect(userAction.rating).to.equal(userActionRating.rating);

			await peeranha.deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(newUserRating.rating).to.equal(StartRating);
			await expect(newUserActionRating.rating).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test delete post after downvote expert reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.voteItem(1, 1, 0, 0);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(StartRating + DownvotedExpertReply);
			await expect(userAction.rating).to.equal(StartRating + DownvoteExpertReply);

			await peeranha.deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);

			await expect(newUserRating.rating).to.equal(StartRating + DownvotedExpertReply);
			await expect(newUserActionRating.rating).to.equal(StartRating + DownvoteExpertReply + DeleteOwnReply);	
		});

		it("Test delete post after downvote common reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.voteItem(1, 1, 0, 0);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(StartRating + DownvotedCommonReply);
			await expect(userAction.rating).to.equal(StartRating + DownvoteCommonReply);

			await peeranha.deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(newUserRating.rating).to.equal(StartRating + DownvotedCommonReply);
			await expect(newUserActionRating.rating).to.equal(StartRating + DownvoteCommonReply + DeleteOwnReply);
		});

		/* - */ xit("Test delete post after downvote tutorial reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.voteItem(1, 1, 0, 0);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(StartRating);
			await expect(userAction.rating).to.equal(StartRating);

			await peeranha.deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(newUserRating.rating).to.equal(StartRating);
			await expect(newUserActionRating.rating).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test delete post after choosing best expert reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);

			await peeranha.changeStatusBestReply(1, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(userRating.rating + AcceptExpertReply);
			await expect(userAction.rating).to.equal(userActionRating.rating + AcceptExpertPost);

			await peeranha.deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(newUserRating.rating).to.equal(StartRating);
			await expect(newUserActionRating.rating).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test delete post after choosing best common reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);

			await peeranha.changeStatusBestReply(1, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(userRating.rating + AcceptCommonReply);
			await expect(userAction.rating).to.equal(userActionRating.rating + AcceptCommonPost);

			await peeranha.deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(newUserRating.rating).to.equal(StartRating);
			await expect(newUserActionRating.rating).to.equal(StartRating + DeleteOwnReply);
		});

		/* - */ xit("Test delete post after choosing best tutorial reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);

			await peeranha.changeStatusBestReply(1, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(userRating.rating);
			await expect(userAction.rating).to.equal(userActionRating.rating);

			await peeranha.deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(newUserRating.rating).to.equal(StartRating);
			await expect(newUserActionRating.rating).to.equal(StartRating + DeleteOwnReply);
		});
	});
	
	describe("Test delete post one period after vote for reply", function () {

		it("Test delete post one period after create expert reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);

			await wait(deleteTime);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(userRating.rating);
			await expect(userAction.rating).to.equal(userActionRating.rating);

			await peeranha.deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(newUserRating.rating).to.equal(userRating.rating);
			await expect(newUserActionRating.rating).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test delete post one period after create common reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);

			await wait(deleteTime);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(userRating.rating);
			await expect(userAction.rating).to.equal(userActionRating.rating);

			await peeranha.deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(newUserRating.rating).to.equal(userRating.rating);
			await expect(newUserActionRating.rating).to.equal(StartRating + DeleteOwnReply);
		});

		/* - */ xit("Test delete post one period after create tutorial reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);

			await wait(deleteTime);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(userRating.rating);
			await expect(userAction.rating).to.equal(userActionRating.rating);

			await peeranha.deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(newUserRating.rating).to.equal(StartRating);
			await expect(newUserActionRating.rating).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test delete post one period after upvote expert reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);

			await peeranha.voteItem(1, 1, 0, 1);
			await wait(deleteTime);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(userRating.rating + UpvotedExpertReply);
			await expect(userAction.rating).to.equal(userActionRating.rating);

			await peeranha.deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(newUserRating.rating).to.equal(userRating.rating + UpvotedExpertReply);
			await expect(newUserActionRating.rating).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test delete post one period after upvote common reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);

			await peeranha.voteItem(1, 1, 0, 1);
			await wait(deleteTime);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(userRating.rating + UpvotedCommonReply);
			await expect(userAction.rating).to.equal(userActionRating.rating);

			await peeranha.deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(newUserRating.rating).to.equal(userRating.rating + UpvotedCommonReply);
			await expect(newUserActionRating.rating).to.equal(StartRating + DeleteOwnReply);
		});

		/* - */ xit("Test delete post one period after upvote tutorial reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);

			await peeranha.voteItem(1, 1, 0, 1);
			await wait(deleteTime);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(userRating.rating);
			await expect(userAction.rating).to.equal(userActionRating.rating);

			await peeranha.deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(newUserRating.rating).to.equal(StartRating);
			await expect(newUserActionRating.rating).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test delete post one period after choosing best expert reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);

			await peeranha.changeStatusBestReply(1, 1);
			await wait(deleteTime);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(userRating.rating + AcceptExpertReply);
			await expect(userAction.rating).to.equal(userActionRating.rating + AcceptExpertPost);

			await peeranha.deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(newUserRating.rating).to.equal(userRating.rating + AcceptExpertReply);
			await expect(newUserActionRating.rating).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test delete post one period after choosing best common reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);

			await peeranha.changeStatusBestReply(1, 1);
			await wait(deleteTime);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(userRating.rating + AcceptCommonReply);
			await expect(userAction.rating).to.equal(userActionRating.rating + AcceptCommonReply);

			await peeranha.deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(newUserRating.rating).to.equal(userRating.rating + AcceptCommonReply);
			await expect(newUserActionRating.rating).to.equal(StartRating + DeleteOwnReply);
		});

		/* - */ xit("Test delete post one period after choosing best tutorial reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);

			await peeranha.changeStatusBestReply(1, 1);
			await wait(deleteTime);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
			await expect(user.rating).to.equal(userRating.rating);
			await expect(userAction.rating).to.equal(userActionRating.rating);

			await peeranha.deletePost(1);

			const newUserRating = await peeranha.getUserByAddress(signers[1].address);
			const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(newUserRating.rating).to.equal(StartRating);
			await expect(newUserActionRating.rating).to.equal(StartRating + DeleteOwnReply);
		});
	});

	describe("Test delete own post/reply", function () {

		it("Test delete own post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);	
			await peeranha.deletePost(1);

			const userRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(userRating.rating).to.equal(StartRating + DeleteOwnPost);
		});

		it("Test delete own reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(1, 0, hashContainer[1], false);

			await peeranha.deleteReply(1, 1);
			const userRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(userRating.rating).to.equal(StartRating + DeleteOwnReply);
		});
	});

	describe("Test create first reply", function () {

		// to perform this test, change the QUICK_REPLY_TIME to 3 seconds at the CommonLib.sol
		xit("Test create first expert reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await wait(QuickReplyTime);
			await peeranha.createReply(1, 0, hashContainer[1], false);

			const userRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(userRating.rating).to.equal(StartRating + FirstExpertReply);

			const reply = await peeranha.getReply(1, 1);
			await expect(reply.isFirstReply).to.equal(true);
			await expect(reply.isQuickReply).to.equal(false);
		});

		// to perform this test, change the QUICK_REPLY_TIME to 3 seconds at the CommonLib.sol
		xit("Test create first common reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await wait(QuickReplyTime);
			await peeranha.createReply(1, 0, hashContainer[1], false);

			const userRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(userRating.rating).to.equal(StartRating + FirstCommonReply);

			const reply = await peeranha.getReply(1, 1);
			await expect(reply.isFirstReply).to.equal(true);
			await expect(reply.isQuickReply).to.equal(false);
		});

		/* - */ xit("Test create first tutorial reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await wait(QuickReplyTime);
			await peeranha.createReply(1, 0, hashContainer[1], false);

			const userRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(userRating.rating).to.equal(StartRating);

			const reply = await peeranha.getReply(1, 1);
			await expect(reply.isFirstReply).to.equal(false);
			await expect(reply.isQuickReply).to.equal(false);
		});
	});

	describe("Test create first and quick reply", function () {

		it("Test create first and quick expert reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(1, 0, hashContainer[1], false);

			const userRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(userRating.rating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);

			const reply = await peeranha.getReply(1, 1);
			await expect(reply.isFirstReply).to.equal(true);
			await expect(reply.isQuickReply).to.equal(true);
		});

		it("Test create first and quick common reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.createReply(1, 0, hashContainer[1], false);

			const userRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(userRating.rating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);

			const reply = await peeranha.getReply(1, 1);
			await expect(reply.isFirstReply).to.equal(true);
			await expect(reply.isQuickReply).to.equal(true);
		});

		/* - */ xit("Test create first and quick tutorial reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.createReply(1, 0, hashContainer[1], false);

			const userRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(userRating.rating).to.equal(StartRating);

			const reply = await peeranha.getReply(1, 1);
			await expect(reply.isFirstReply).to.equal(false);
			await expect(reply.isQuickReply).to.equal(false);
		});
	});

	describe("Test create first and quick reply for own post", function () {

		it("Test create first and quick expert reply for own post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(1, 0, hashContainer[1], false);

			const userRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(userRating.rating).to.equal(StartRating);

			const reply = await peeranha.getReply(1, 1);
			await expect(reply.isFirstReply).to.equal(false);
			await expect(reply.isQuickReply).to.equal(false);
		});

		it("Test create first and quick common reply for own post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.createReply(1, 0, hashContainer[1], false);

			const userRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(userRating.rating).to.equal(StartRating);

			const reply = await peeranha.getReply(1, 1);
			await expect(reply.isFirstReply).to.equal(false);
			await expect(reply.isQuickReply).to.equal(false);
		});

		/* - */ xit("Test create first and quick tutorial reply for own post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.createReply(1, 0, hashContainer[1], false);

			const userRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
			await expect(userRating.rating).to.equal(StartRating);

			const reply = await peeranha.getReply(1, 1);
			await expect(reply.isFirstReply).to.equal(false);
			await expect(reply.isQuickReply).to.equal(false);
		});
	});

	describe("Test upVote reply", function () {

		it("Test upVote expert reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false)
			await peeranha.voteItem(1, 1, 0, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const reply = await peeranha.getReply(1, 1);
			await expect(user.rating).to.equal(StartRating + FirstExpertReply + QuickExpertReply + UpvotedExpertReply);
			await expect(reply.rating).to.equal(1);
			
			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('0x01');
		});

		it("Test upVote common reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false)
			await peeranha.voteItem(1, 1, 0, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const reply = await peeranha.getReply(1, 1);
			await expect(user.rating).to.equal(StartRating + FirstCommonReply + QuickCommonReply + UpvotedCommonReply);
			await expect(reply.rating).to.equal(1);
			
			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('0x01');
		});

		/* - */ xit("Test upVote tutorial reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false)
			await peeranha.voteItem(1, 1, 0, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const reply = await peeranha.getReply(1, 1);
			await expect(user.rating).to.equal(StartRating + FirstCommonReply + QuickCommonReply + UpvotedCommonReply);
			await expect(reply.rating).to.equal(1);
			
			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('0x01');
		});
	});

	describe("Test downVote reply", function () {

		it("Test downVote expert reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false)
			await peeranha.voteItem(1, 1, 0, 0);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const reply = await peeranha.getReply(1, 1);
			await expect(user.rating).to.equal(StartRating + DownvotedExpertReply);
			await expect(reply.rating).to.equal(-1);
			
			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('-0x01');
		});

		it("Test downVote common reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false)
			await peeranha.voteItem(1, 1, 0, 0);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const reply = await peeranha.getReply(1, 1);
			await expect(user.rating).to.equal(StartRating + DownvotedCommonReply);
			await expect(reply.rating).to.equal(-1);
			
			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('-0x01');
		});

		/* - */ xit("Test downVote tutorial reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false)
			await peeranha.voteItem(1, 1, 0, 0);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const reply = await peeranha.getReply(1, 1);
			await expect(user.rating).to.equal(StartRating + DownvotedCommonReply);
			await expect(reply.rating).to.equal(-1);
			
			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('-0x01');
		});
	});

	describe("Test double upVote reply", function () {

		it("Test double upVote expert reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false)
			await peeranha.voteItem(1, 1, 0, 1);
			await peeranha.voteItem(1, 1, 0, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const reply = await peeranha.getReply(1, 1);
			await expect(user.rating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
			await expect(reply.rating).to.equal(0);
			
			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});

		it("Test double upVote common reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false)
			await peeranha.voteItem(1, 1, 0, 1);
			await peeranha.voteItem(1, 1, 0, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const reply = await peeranha.getReply(1, 1);
			await expect(user.rating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			await expect(reply.rating).to.equal(0);
			
			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});

		/* - */ xit("Test double upVote tutorial reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false)
			await peeranha.voteItem(1, 1, 0, 1);
			await peeranha.voteItem(1, 1, 0, 1);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const reply = await peeranha.getReply(1, 1);
			await expect(user.rating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			await expect(reply.rating).to.equal(0);
			
			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});
	});

	describe("Test double downVote reply", function () {

		it("Test double downVote expert reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false)
			await peeranha.voteItem(1, 1, 0, 0);
			await peeranha.voteItem(1, 1, 0, 0);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const reply = await peeranha.getReply(1, 1);
			await expect(user.rating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
			await expect(reply.rating).to.equal(0);
			
			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});

		it("Test double downVote common reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false)
			await peeranha.voteItem(1, 1, 0, 0);
			await peeranha.voteItem(1, 1, 0, 0);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const reply = await peeranha.getReply(1, 1);
			await expect(user.rating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			await expect(reply.rating).to.equal(0);
			
			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});

		/* - */ xit("Test double downVote tutorial reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false)
			await peeranha.voteItem(1, 1, 0, 0);
			await peeranha.voteItem(1, 1, 0, 0);

			const user = await peeranha.getUserByAddress(signers[1].address);
			const reply = await peeranha.getReply(1, 1);
			await expect(user.rating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			await expect(reply.rating).to.equal(0);
			
			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});
	});

	describe("Test upVote own reply", function () {

		it("Test upVote own expert reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(1, 0, hashContainer[1], false)
			await expect(peeranha.voteItem(1, 1, 0, 1)).to.be.revertedWith('You can not vote for own reply');

			const user = await peeranha.getUserByAddress(signers[0].address);
			const reply = await peeranha.getReply(1, 1);
			await expect(user.rating).to.equal(StartRating);
			await expect(reply.rating).to.equal(0);
		});

		it("Test upVote own common reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.createReply(1, 0, hashContainer[1], false)
			await expect(peeranha.voteItem(1, 1, 0, 1)).to.be.revertedWith('You can not vote for own reply');

			const user = await peeranha.getUserByAddress(signers[0].address);
			const reply = await peeranha.getReply(1, 1);
			await expect(user.rating).to.equal(StartRating);
			await expect(reply.rating).to.equal(0);
		});

		/* - */ xit("Test upVote own tutorial reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.createReply(1, 0, hashContainer[1], false)
			await expect(peeranha.voteItem(1, 1, 0, 1)).to.be.revertedWith('You can not vote for own reply');

			const user = await peeranha.getUserByAddress(signers[1].address);
			const reply = await peeranha.getReply(1, 1);
			await expect(user.rating).to.equal(StartRating);
			await expect(reply.rating).to.equal(0);
		});
	});

	describe("Test downVote own reply", function () {

		it("Test downVote own expert reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(1, 0, hashContainer[1], false)
			await expect(peeranha.voteItem(1, 1, 0, 0)).to.be.revertedWith('You can not vote for own reply');

			const user = await peeranha.getUserByAddress(signers[0].address);
			const reply = await peeranha.getReply(1, 1);
			await expect(user.rating).to.equal(StartRating);
			await expect(reply.rating).to.equal(0);
		});

		it("Test downVote own common reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.createReply(1, 0, hashContainer[1], false)
			await expect(peeranha.voteItem(1, 1, 0, 0)).to.be.revertedWith('You can not vote for own reply');

			const user = await peeranha.getUserByAddress(signers[0].address);
			const reply = await peeranha.getReply(1, 1);
			await expect(user.rating).to.equal(StartRating);
			await expect(reply.rating).to.equal(0);
			
			const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory._hex).to.equal('0x00');
		});

		/* - */ xit("Test downVote own tutorial reply", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.createReply(1, 0, hashContainer[1], false)
			await expect(peeranha.voteItem(1, 1, 0, 0)).to.be.revertedWith('You can not vote for own reply');

			const user = await peeranha.getUserByAddress(signers[0].address);
			const reply = await peeranha.getReply(1, 1);
			await expect(user.rating).to.equal(StartRating);
			await expect(reply.rating).to.equal(0);
		});
	});

	describe("Test create 2 reply, one first and two quick", function () {

		it("Test create 2 expert reply, one first and two quick ", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
			
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userRating2 = await peeranha.getUserByAddress(signers[2].address);
			await expect(userRating.rating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
			await expect(userRating2.rating).to.equal(StartRating + QuickExpertReply);

			const firstReply = await peeranha.getReply(1, 1);
			const secondReply = await peeranha.getReply(1, 2);
			await expect(firstReply.isFirstReply).to.equal(true);
			await expect(firstReply.isQuickReply).to.equal(true);
			await expect(secondReply.isFirstReply).to.equal(false);
			await expect(secondReply.isQuickReply).to.equal(true);
		});

		it("Test create 2 common reply, one first and two quick ", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
			
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userRating2 = await peeranha.getUserByAddress(signers[2].address);
			await expect(userRating.rating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			await expect(userRating2.rating).to.equal(StartRating + QuickCommonReply);

			const firstReply = await peeranha.getReply(1, 1);
			const secondReply = await peeranha.getReply(1, 2);
			await expect(firstReply.isFirstReply).to.equal(true);
			await expect(firstReply.isQuickReply).to.equal(true);
			await expect(secondReply.isFirstReply).to.equal(false);
			await expect(secondReply.isQuickReply).to.equal(true);
		});

		/* - */ xit("Test create 2 tutorial reply, one first and two quick ", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
			
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userRating2 = await peeranha.getUserByAddress(signers[2].address);
			await expect(userRating.rating).to.equal(StartRating);
			await expect(userRating2.rating).to.equal(StartRating);

			const firstReply = await peeranha.getReply(1, 1);
			const secondReply = await peeranha.getReply(1, 2);
			await expect(firstReply.isFirstReply).to.equal(false);
			await expect(firstReply.isQuickReply).to.equal(false);
			await expect(secondReply.isFirstReply).to.equal(false);
			await expect(secondReply.isQuickReply).to.equal(false);
		});
	});

	describe("Test change vote for 2 reply, one first and two quick", function () {

		it("Test downVote after upVote 2 expert reply, one first and two quick ", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
			
			await peeranha.voteItem(1, 1, 0, 1);
			await peeranha.voteItem(1, 2, 0, 1);

			await peeranha.voteItem(1, 1, 0, 0);
			await peeranha.voteItem(1, 2, 0, 0);

			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userRating2 = await peeranha.getUserByAddress(signers[2].address);
			await expect(userRating.rating).to.equal(StartRating + DownvotedExpertReply);
			await expect(userRating2.rating).to.equal(StartRating + DownvotedExpertReply);

			const statusHistory1 = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory1._hex).to.equal('-0x01');
			const statusHistory2 = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 2, 0);
			await expect(statusHistory2._hex).to.equal('-0x01');
		});

		it("Test downVote after upVote 2 common reply, one first and two quick ", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
			
			await peeranha.voteItem(1, 1, 0, 1);
			await peeranha.voteItem(1, 2, 0, 1);

			await peeranha.voteItem(1, 1, 0, 0);
			await peeranha.voteItem(1, 2, 0, 0);

			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userRating2 = await peeranha.getUserByAddress(signers[2].address);
			await expect(userRating.rating).to.equal(StartRating + DownvotedCommonReply);
			await expect(userRating2.rating).to.equal(StartRating + DownvotedCommonReply);

			const statusHistory1 = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory1._hex).to.equal('-0x01');
			const statusHistory2 = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 2, 0);
			await expect(statusHistory2._hex).to.equal('-0x01');
		});

		/* - */ xit("Test downVote after upVote 2 tutorial reply, one first and two quick ", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
			
			await peeranha.voteItem(1, 1, 0, 1);
			await peeranha.voteItem(1, 2, 0, 1);

			await peeranha.voteItem(1, 1, 0, 0);
			await peeranha.voteItem(1, 2, 0, 0);

			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userRating2 = await peeranha.getUserByAddress(signers[2].address);
			await expect(userRating.rating).to.equal(StartRating + DownvotedCommonReply);
			await expect(userRating2.rating).to.equal(StartRating + DownvotedCommonReply);

			const statusHistory1 = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory1._hex).to.equal('-0x01');
			const statusHistory2 = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 2, 0);
			await expect(statusHistory2._hex).to.equal('-0x01');
		});

		it("Test upVote after downVote 2 expert reply, one first and two quick ", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
			
			await peeranha.voteItem(1, 1, 0, 0);
			await peeranha.voteItem(1, 2, 0, 0);

			await peeranha.voteItem(1, 1, 0, 1);
			await peeranha.voteItem(1, 2, 0, 1);

			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userRating2 = await peeranha.getUserByAddress(signers[2].address);
			await expect(userRating.rating)
			.to.equal(StartRating + FirstExpertReply + QuickExpertReply + UpvotedExpertReply);
			await expect(userRating2.rating)
			.to.equal(StartRating + QuickExpertReply + UpvotedExpertReply);

			const statusHistory1 = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory1._hex).to.equal('0x01');
			const statusHistory2 = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 2, 0);
			await expect(statusHistory2._hex).to.equal('0x01');
		});

		it("Test upVote after downVote 2 common reply, one first and two quick ", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
			
			await peeranha.voteItem(1, 1, 0, 0);
			await peeranha.voteItem(1, 2, 0, 0);

			await peeranha.voteItem(1, 1, 0, 1);
			await peeranha.voteItem(1, 2, 0, 1);

			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userRating2 = await peeranha.getUserByAddress(signers[2].address);
			await expect(userRating.rating)
			.to.equal(StartRating + FirstCommonReply + QuickCommonReply + UpvotedCommonReply);
			await expect(userRating2.rating)
			.to.equal(StartRating + QuickCommonReply + UpvotedCommonReply);

			const statusHistory1 = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory1._hex).to.equal('0x01');
			const statusHistory2 = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 2, 0);
			await expect(statusHistory2._hex).to.equal('0x01');
		});

		/* - */ xit("Test upVote after downVote 2 tutorial reply, one first and two quick ", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
			
			await peeranha.voteItem(1, 1, 0, 0);
			await peeranha.voteItem(1, 2, 0, 0);

			await peeranha.voteItem(1, 1, 0, 1);
			await peeranha.voteItem(1, 2, 0, 1);

			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userRating2 = await peeranha.getUserByAddress(signers[2].address);
			await expect(userRating.rating)
			.to.equal(StartRating + FirstCommonReply + QuickCommonReply + UpvotedCommonReply);
			await expect(userRating2.rating)
			.to.equal(StartRating + QuickCommonReply + UpvotedCommonReply);

			const statusHistory1 = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 1, 0);
			await expect(statusHistory1._hex).to.equal('0x01');
			const statusHistory2 = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 2, 0);
			await expect(statusHistory2._hex).to.equal('0x01');
		});
	});

	describe("Test delete 2 reply, one first and two quick", function () {

		it("Test delete 2 expert reply, one first and two quick ", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);

			await peeranha.connect(signers[1]).deleteReply(1, 1);
			await peeranha.connect(signers[2]).deleteReply(1, 2);
			
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userRating2 = await peeranha.getUserByAddress(signers[2].address);
			await expect(userRating.rating).to.equal(StartRating + DeleteOwnReply);
			await expect(userRating2.rating).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test delete 2 common reply, one first and two quick ", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);

			await peeranha.connect(signers[1]).deleteReply(1, 1);
			await peeranha.connect(signers[2]).deleteReply(1, 2);
			
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userRating2 = await peeranha.getUserByAddress(signers[2].address);
			await expect(userRating.rating).to.equal(StartRating + DeleteOwnReply);
			await expect(userRating2.rating).to.equal(StartRating + DeleteOwnReply);
		});

		/* - */ xit("Test delete 2 tutorial reply, one first and two quick ", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);

			await peeranha.connect(signers[1]).deleteReply(1, 1);
			await peeranha.connect(signers[2]).deleteReply(1, 2);
			
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userRating2 = await peeranha.getUserByAddress(signers[2].address);
			await expect(userRating.rating).to.equal(StartRating + DeleteOwnReply);
			await expect(userRating2.rating).to.equal(StartRating + DeleteOwnReply);
		});
	});

	describe("Test delete 2 upVoted reply, one first and two quick", function () {

		it("Test delete 2 upVoted expert reply, one first and two quick ", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);

			await peeranha.voteItem(1, 1, 0, 1);
			await peeranha.voteItem(1, 2, 0, 1);

			await peeranha.connect(signers[1]).deleteReply(1, 1);
			await peeranha.connect(signers[2]).deleteReply(1, 2);
			
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userRating2 = await peeranha.getUserByAddress(signers[2].address);
			await expect(userRating.rating).to.equal(StartRating + DeleteOwnReply);
			await expect(userRating2.rating).to.equal(StartRating + DeleteOwnReply);
		});

		it("Test delete 2 upVoted common reply, one first and two quick ", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);

			await peeranha.voteItem(1, 1, 0, 1);
			await peeranha.voteItem(1, 2, 0, 1);

			await peeranha.connect(signers[1]).deleteReply(1, 1);
			await peeranha.connect(signers[2]).deleteReply(1, 2);
			
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userRating2 = await peeranha.getUserByAddress(signers[2].address);
			await expect(userRating.rating).to.equal(StartRating + DeleteOwnReply);
			await expect(userRating2.rating).to.equal(StartRating + DeleteOwnReply);
		});

		/* - */ xit("Test delete 2 upVoted tutorial reply, one first and two quick ", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);

			await peeranha.voteItem(1, 1, 0, 1);
			await peeranha.voteItem(1, 2, 0, 1);

			await peeranha.connect(signers[1]).deleteReply(1, 1);
			await peeranha.connect(signers[2]).deleteReply(1, 2);
			
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userRating2 = await peeranha.getUserByAddress(signers[2].address);
			await expect(userRating.rating).to.equal(StartRating + DeleteOwnReply);
			await expect(userRating2.rating).to.equal(StartRating + DeleteOwnReply);
		});
	});

	describe("Test delete 2 downVoted reply, one first and two quick", function () {

		it("Test delete 2 downVoted expert reply, one first and two quick ", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);

			await peeranha.voteItem(1, 1, 0, 0);
			await peeranha.voteItem(1, 2, 0, 0);

			await peeranha.connect(signers[1]).deleteReply(1, 1);
			await peeranha.connect(signers[2]).deleteReply(1, 2);
			
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userRating2 = await peeranha.getUserByAddress(signers[2].address);
			await expect(userRating.rating).to.equal(StartRating + DownvotedExpertReply + DeleteOwnReply);
			await expect(userRating2.rating).to.equal(StartRating + DownvotedExpertReply + DeleteOwnReply);
		});

		it("Test delete 2 downVoted common reply, one first and two quick ", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);

			await peeranha.voteItem(1, 1, 0, 0);
			await peeranha.voteItem(1, 2, 0, 0);

			await peeranha.connect(signers[1]).deleteReply(1, 1);
			await peeranha.connect(signers[2]).deleteReply(1, 2);
			
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userRating2 = await peeranha.getUserByAddress(signers[2].address);
			await expect(userRating.rating).to.equal(StartRating + DownvotedCommonReply + DeleteOwnReply);
			await expect(userRating2.rating).to.equal(StartRating + DownvotedCommonReply + DeleteOwnReply);
		});

		/* - */ xit("Test delete 2 downVoted tutorial reply, one first and two quick ", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);

			await peeranha.voteItem(1, 1, 0, 0);
			await peeranha.voteItem(1, 2, 0, 0);

			await peeranha.connect(signers[1]).deleteReply(1, 1);
			await peeranha.connect(signers[2]).deleteReply(1, 2);
			
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			const userRating2 = await peeranha.getUserByAddress(signers[2].address);
			await expect(userRating.rating).to.equal(StartRating + DownvotedCommonReply + DeleteOwnReply);
			await expect(userRating2.rating).to.equal(StartRating + DownvotedCommonReply + DeleteOwnReply);
		});
	});

	describe("Test delete first reply and post one more", function () {

		it("Test delete first expert reply and post one more by another user", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			await expect(userRating.rating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
			
			const firstReply = await peeranha.getReply(1, 1);
			await expect(firstReply.isFirstReply).to.equal(true);
			await peeranha.connect(signers[1]).deleteReply(1, 1);
			await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);

			const secondReply = await peeranha.getReply(1, 2);
			await expect(secondReply.isFirstReply).to.equal(true);

			const userRating2 = await peeranha.getUserByAddress(signers[2].address);
			await expect(userRating2.rating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
		});

		it("Test delete first common reply and post one more by another user", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			await expect(userRating.rating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			
			const firstReply = await peeranha.getReply(1, 1);
			await expect(firstReply.isFirstReply).to.equal(true);

			await peeranha.connect(signers[1]).deleteReply(1, 1);
			await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);

			const secondReply = await peeranha.getReply(1, 2);
			await expect(secondReply.isFirstReply).to.equal(true);

			const userRating2 = await peeranha.getUserByAddress(signers[2].address);
			await expect(userRating2.rating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
		});

		xit("Test delete first expert reply and post one more by same user", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			await expect(userRating.rating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
			
			const firstReply = await peeranha.getReply(1, 1);
			await expect(firstReply.isFirstReply).to.equal(true);
			await peeranha.connect(signers[1]).deleteReply(1, 1);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[2], false);

			const secondReply = await peeranha.getReply(1, 2);
			await expect(secondReply.isFirstReply).to.equal(true);

			const userRating2 = await peeranha.getUserByAddress(signers[2].address);
			await expect(userRating2.rating).to.equal(StartRating + FirstExpertReply + QuickExpertReply);
		});

		xit("Test delete first common reply and post one more by same user", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			await expect(userRating.rating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
			
			const firstReply = await peeranha.getReply(1, 1);
			await expect(firstReply.isFirstReply).to.equal(true);

			await peeranha.connect(signers[1]).deleteReply(1, 1);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[2], false);

			const secondReply = await peeranha.getReply(1, 2);
			await expect(secondReply.isFirstReply).to.equal(true);

			const userRating2 = await peeranha.getUserByAddress(signers[2].address);
			await expect(userRating2.rating).to.equal(StartRating + FirstCommonReply + QuickCommonReply);
		});
	});

	describe("Test mark reply as best", function () {

		it("Test mark expert reply as best", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(1, 0, hashContainer[1], false);
			
			const oldUser1Rating = await peeranha.getUserByAddress(signers[1].address);
			const oldUser2Rating = await peeranha.getUserByAddress(signers[0].address);
			await peeranha.connect(signers[1]).changeStatusBestReply(1, 1);
			const user1Rating = await peeranha.getUserByAddress(signers[1].address);
			const user2Rating = await peeranha.getUserByAddress(signers[0].address);
			await expect(user2Rating.rating).to.equal(oldUser2Rating.rating + AcceptExpertReply);
			await expect(user1Rating.rating).to.equal(oldUser1Rating.rating + AcceptExpertPost);
		});

		it("Test mark common reply as best", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.createReply(1, 0, hashContainer[1], false);
			
			const oldUser1Rating = await peeranha.getUserByAddress(signers[1].address);
			const oldUser2Rating = await peeranha.getUserByAddress(signers[0].address);
			await peeranha.connect(signers[1]).changeStatusBestReply(1, 1);
			const user1Rating = await peeranha.getUserByAddress(signers[1].address);
			const user2Rating = await peeranha.getUserByAddress(signers[0].address);
			await expect(user2Rating.rating).to.equal(oldUser2Rating.rating + AcceptCommonReply);
			await expect(user1Rating.rating).to.equal(oldUser1Rating.rating + AcceptCommonPost);
		});

		/* - */ xit("Test mark tutorial reply as best", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			
			const oldUser1Rating = await peeranha.getUserByAddress(signers[0].address);
			const oldUser2Rating = await peeranha.getUserByAddress(signers[1].address);
			await peeranha.changeStatusBestReply(1, 1);
			const user1Rating = await peeranha.getUserByAddress(signers[0].address);
			const user2Rating = await peeranha.getUserByAddress(signers[1].address);
			await expect(user2Rating.rating).to.equal(oldUser2Rating.rating + AcceptCommonReply);
			await expect(user1Rating.rating).to.equal(oldUser1Rating.rating + AcceptCommonPost);
		});
	});

	describe("Test mark own reply as best", function () {

		it("Test mark own expert reply as best", async function () { // Need to be fixed
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(1, 0, hashContainer[1], false);
			
			const oldUserRating = await peeranha.getUserByAddress(signers[0].address);
			await peeranha.changeStatusBestReply(1, 1);
			const userRating = await peeranha.getUserByAddress(signers[0].address);
			await expect(userRating.rating).to.equal(oldUserRating.rating);
		});

		it("Test mark own common reply as best", async function () { // Need to be fixed
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.createReply(1, 0, hashContainer[1], false);
			
			const oldUserRating = await peeranha.getUserByAddress(signers[0].address);
			await peeranha.changeStatusBestReply(1, 1);
			const userRating = await peeranha.getUserByAddress(signers[0].address);
			await expect(userRating.rating).to.equal(oldUserRating.rating);
		});

		/* - */ xit("Test mark own tutorial reply as best", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.createReply(1, 0, hashContainer[1], false);
			
			const oldUserRating = await peeranha.getUserByAddress(signers[0].address);
			await peeranha.changeStatusBestReply(1, 1);
			const userRating = await peeranha.getUserByAddress(signers[0].address);
			await expect(userRating.rating).to.equal(oldUserRating.rating);
		});
	});

	describe("Test unmark reply as best", function () {

		it("Test unmark expert reply as best", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			
			const oldUserRating = await peeranha.getUserByAddress(signers[1].address);
			await peeranha.changeStatusBestReply(1, 1);
			await peeranha.changeStatusBestReply(1, 1);
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			await expect(userRating.rating).to.equal(oldUserRating.rating);
		});

		it("Test unmark common reply as best", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			
			const oldUserRating = await peeranha.getUserByAddress(signers[1].address);
			await peeranha.changeStatusBestReply(1, 1);
			await peeranha.changeStatusBestReply(1, 1);
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			await expect(userRating.rating).to.equal(oldUserRating.rating);
		});

		/* - */ xit("Test unmark tutorial reply as best", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			
			const oldUserRating = await peeranha.getUserByAddress(signers[1].address);
			await peeranha.changeStatusBestReply(1, 1);
			await peeranha.changeStatusBestReply(1, 1);
			const userRating = await peeranha.getUserByAddress(signers[1].address);
			await expect(userRating.rating).to.equal(oldUserRating.rating);
		});
	});

	describe("Test choose another reply as best", function () {

		it("Test choose another expert reply as best", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
			
			const oldUser1Rating = await peeranha.getUserByAddress(signers[0].address);
			const oldUser2Rating = await peeranha.getUserByAddress(signers[1].address);
			const oldUser3Rating = await peeranha.getUserByAddress(signers[2].address);

			await peeranha.changeStatusBestReply(1, 1);
			const user1Rating = await peeranha.getUserByAddress(signers[0].address);
			const user2Rating = await peeranha.getUserByAddress(signers[1].address);
			const user3Rating = await peeranha.getUserByAddress(signers[2].address);
			await expect(user2Rating.rating).to.equal(oldUser2Rating.rating + AcceptExpertReply);
			await expect(user1Rating.rating).to.equal(oldUser1Rating.rating + AcceptExpertPost);
			await expect(user3Rating.rating).to.equal(oldUser3Rating.rating);

			await peeranha.changeStatusBestReply(1, 1);
			await peeranha.changeStatusBestReply(1, 2);
			const user1EndRating = await peeranha.getUserByAddress(signers[0].address);
			const user2EndRating = await peeranha.getUserByAddress(signers[1].address);
			const user3EndRating = await peeranha.getUserByAddress(signers[2].address);
			await expect(user2EndRating.rating).to.equal(oldUser2Rating.rating);
			await expect(user1EndRating.rating).to.equal(oldUser1Rating.rating + AcceptExpertPost);
			await expect(user3EndRating.rating).to.equal(oldUser3Rating.rating + AcceptExpertReply);
		});

		it("Test choose another common reply as best", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
			
			const oldUser1Rating = await peeranha.getUserByAddress(signers[0].address);
			const oldUser2Rating = await peeranha.getUserByAddress(signers[1].address);
			const oldUser3Rating = await peeranha.getUserByAddress(signers[2].address);

			await peeranha.changeStatusBestReply(1, 1);
			const user1Rating = await peeranha.getUserByAddress(signers[0].address);
			const user2Rating = await peeranha.getUserByAddress(signers[1].address);
			const user3Rating = await peeranha.getUserByAddress(signers[2].address);
			await expect(user2Rating.rating).to.equal(oldUser2Rating.rating + AcceptCommonReply);
			await expect(user1Rating.rating).to.equal(oldUser1Rating.rating + AcceptCommonPost);
			await expect(user3Rating.rating).to.equal(oldUser3Rating.rating);

			await peeranha.changeStatusBestReply(1, 1);
			await peeranha.changeStatusBestReply(1, 2);
			const user1EndRating = await peeranha.getUserByAddress(signers[0].address);
			const user2EndRating = await peeranha.getUserByAddress(signers[1].address);
			const user3EndRating = await peeranha.getUserByAddress(signers[2].address);
			await expect(user2EndRating.rating).to.equal(oldUser2Rating.rating);
			await expect(user1EndRating.rating).to.equal(oldUser1Rating.rating + AcceptCommonPost);
			await expect(user3EndRating.rating).to.equal(oldUser3Rating.rating + AcceptCommonReply);
		});

		/* - */ xit("Test choose another tutorial reply as best", async function () {
			const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[0]);
			await peeranha.connect(signers[2]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
			
			const oldUser1Rating = await peeranha.getUserByAddress(signers[0].address);
			const oldUser2Rating = await peeranha.getUserByAddress(signers[1].address);
			const oldUser3Rating = await peeranha.getUserByAddress(signers[2].address);

			await peeranha.changeStatusBestReply(1, 1);
			const user1Rating = await peeranha.getUserByAddress(signers[0].address);
			const user2Rating = await peeranha.getUserByAddress(signers[1].address);
			const user3Rating = await peeranha.getUserByAddress(signers[2].address);
			await expect(user2Rating.rating).to.equal(oldUser2Rating.rating + AcceptCommonReply);
			await expect(user1Rating.rating).to.equal(oldUser1Rating.rating + AcceptCommonPost);
			await expect(user3Rating.rating).to.equal(oldUser3Rating.rating);

			await peeranha.changeStatusBestReply(1, 2);
			const user1EndRating = await peeranha.getUserByAddress(signers[0].address);
			const user2EndRating = await peeranha.getUserByAddress(signers[1].address);
			const user3EndRating = await peeranha.getUserByAddress(signers[2].address);
			await expect(user2EndRating.rating).to.equal(oldUser2Rating.rating);
			await expect(user1EndRating.rating).to.equal(oldUser1Rating.rating + AcceptCommonPost);
			await expect(user3EndRating.rating).to.equal(oldUser3Rating.rating + AcceptCommonPost);
		});
	});

	describe("Test vote after delete post", function () {

		it("Test upvote post after delete post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).deletePost(1);
			await expect(peeranha.voteItem(1, 0, 0, 1)).to.be.revertedWith('Post has been deleted.');
		});

		it("Test downvote post after delete post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).deletePost(1);
			await expect(peeranha.voteItem(1, 0, 0, 0)).to.be.revertedWith('Post has been deleted.');
		});

		it("Test upvote reply after delete post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.deletePost(1);
			await expect(peeranha.voteItem(1, 1, 0, 1)).to.be.revertedWith('Post has been deleted.');
		});

		it("Test downvote reply after delete post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.deletePost(1);
			await expect(peeranha.voteItem(1, 1, 0, 0)).to.be.revertedWith('Post has been deleted.');
		});

		it("Test choose reply as the best after delete post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.deletePost(1);
			await expect(peeranha.changeStatusBestReply(1, 1)).to.be.revertedWith('Post has been deleted.');
		});
	});

	describe("Test vote after delete reply", function () {

		it("Test upvote reply after delete reply", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.deleteReply(1, 1);
			await expect(peeranha.voteItem(1, 1, 0, 1)).to.be.revertedWith('Reply has been deleted.');
		});

		it("Test downvote reply after delete reply", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.deleteReply(1, 1);
			await expect(peeranha.voteItem(1, 1, 0, 0)).to.be.revertedWith('Reply has been deleted.');
		});

		it("Test choose reply as the best after delete reply", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
			await peeranha.deleteReply(1, 1);
			await expect(peeranha.changeStatusBestReply(1, 1)).to.be.revertedWith('Reply has been deleted.');
		});
	});

	// it("Test upVote own comment", async function () {
	// 	const peeranha = await createContract();
	// 	const signers = await ethers.getSigners();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);

	// 	await peeranha.connect(signers[1]).createUser(hashContainer[0]);
	// 	await peeranha.createUser(hashContainer[1]);
    //     await peeranha.createCommunity(ipfsHashes[0], createTags(5));

	// 	await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createComment(1, 0, hashContainer[1]);
	// 	await expect(peeranha.voteItem(1, 0, 1, 1)).to.be.revertedWith('You can not vote for own comment.');
	// });


	// it("Test upVote expert comment", async function () {
	// 	const peeranha = await createContract();
	// 	const signers = await ethers.getSigners();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);

	// 	await peeranha.connect(signers[1]).createUser(hashContainer[0]);
	// 	await peeranha.createUser(hashContainer[1]);
    //     await peeranha.createCommunity(ipfsHashes[0], createTags(5));

	// 	await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.createComment(1, 0, hashContainer[1])
    //     await peeranha.voteItem(1, 0, 1, 1);

	// 	const user = await peeranha.getUserByAddress(signers[1].address);
	// 	const post = await peeranha.getPost(1);
	// 	await expect(user.rating).to.equal(StartRating + UpvotedExpertPost);
	// 	await expect(post.rating).to.equal(1);
		
	// 	const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 0, 1);
	// 	await expect(statusHistory._hex).to.equal('0x01');
	// });

	// it("Test downVote expert comment", async function () {
	// 	const peeranha = await createContract();
	// 	const signers = await ethers.getSigners();
	// 	const hashContainer = getHashContainer();
    //     const ipfsHashes = getHashesContainer(2);

	// 	await peeranha.connect(signers[1]).createUser(hashContainer[0]);
	// 	await peeranha.createUser(hashContainer[1]);
    //     await peeranha.createCommunity(ipfsHashes[0], createTags(5));

	// 	await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	// 	await peeranha.connect(signers[1]).createComment(1, 0, hashContainer[1])
    //     await peeranha.voteItem(1, 1, 0, 0);

	// 	const user = await peeranha.getUserByAddress(signers[1].address);
	// 	const post = await peeranha.getPost(1);
	// 	// await expect(user.rating).to.equal(StartRating + UpvotedExpertPost);
	// 	// await expect(post.rating).to.equal(1);
		
	// 	const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 0, 1);
	// 	await expect(statusHistory._hex).to.equal('-0x01');
	// });
	





	///
	//				to do
	// upvote/ downvote comment -> delete
	///



	const registerTwoUsers = async function (peeranha, signers, hashContainer) {
		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);
	}

	const createContract = async function () {
		const UserLibPublic = await ethers.getContractFactory("UserLibPublic");
        const CommunityLibPublic = await ethers.getContractFactory("CommunityLibPublic");
        const SecurityLibPublic = await ethers.getContractFactory("SecurityLibPublic");
        const PostLibPublic = await ethers.getContractFactory("PostLibPublic");
        const userLibPublic = await UserLibPublic.deploy();
        const communityLibPublic = await CommunityLibPublic.deploy();
        const securityLibPublic = await SecurityLibPublic.deploy();
        const postLibPublic = await PostLibPublic.deploy();
        const Peeranha = await ethers.getContractFactory("Peeranha", {
        libraries: {
            UserLibPublic: userLibPublic.address,
            CommunityLibPublic: communityLibPublic.address,
            SecurityLibPublic: securityLibPublic.address,
            PostLibPublic: postLibPublic.address,
        }
        });
        const peeranha = await Peeranha.deploy();
        await peeranha.deployed();
        await peeranha.__Peeranha_init();
        return peeranha;
	};

	const StartRating = 10;
	const QuickReplyTime = 7000; // in milliseconds, defines at CommonLib
	const deleteTime = 7000;

	const DownvoteExpertPost = -1;
    const UpvotedExpertPost = 5;
    const DownvotedExpertPost = -2;
    const AcceptExpertPost = 2;         //Accept answer as correct for Expert Question

    //common post 
    const DownvoteCommonPost = -1;
    const UpvotedCommonPost = 1;
    const DownvotedCommonPost = -1;
    const AcceptCommonPost = 1;

    //tutorial 
    const DownvoteTutorial = -1;    //autorAction
    const UpvotedTutorial = 1;
    const DownvotedTutorial = -1;

    const DeleteOwnPost = -1;

/////////////////////////////////////////////////////////////////////////////

    //expert reply
    const DownvoteExpertReply = -1;
    const UpvotedExpertReply = 10;
    const DownvotedExpertReply = -2;
    const AcceptExpertReply = 15;
    const FirstExpertReply = 5;
    const QuickExpertReply = 5;

    //common reply 
    const DownvoteCommonReply = -1;
    const UpvotedCommonReply = 2;
    const DownvotedCommonReply = -1;
    const AcceptCommonReply = 3;
    const FirstCommonReply = 1;
    const QuickCommonReply = 1;
    
    const DeleteOwnReply = -1;

/////////////////////////////////////////////////////////////////////////////////

	// const author = "0x001d3F1ef827552Ae1114027BD3ECF1f086bA0F9";
	// const author2 = "0x111122223333444455556666777788889999aAaa";

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
