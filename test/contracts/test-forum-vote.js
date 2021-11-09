const { expect } = require("chai");
const crypto = require("crypto");


describe("Test vote", function () {
	const PostTypeEnum = {"ExpertPost":0, "CommonPost":1, "Tutorial":2}

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

	it("Test upVote own post", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await expect(peeranha.voteItem(1, 0, 0, 1)).to.be.revertedWith('You can not vote for own post.');
	});

	it("Test upVote own reply", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
		await expect(peeranha.connect(signers[1]).voteItem(1, 1, 0, 1)).to.be.revertedWith('You can not vote for own reply.');
	});

	it("Test upVote own comment", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.createComment(1, 0, hashContainer[1]);
		await expect(peeranha.voteItem(1, 0, 1, 1)).to.be.revertedWith('You can not vote for own comment.');
	});

	/* - */ it("Test upVote common post", async function () {
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
		await expect(user.rating).to.equal(UpvotedCommonPost);
		await expect(post.rating).to.equal(1);
	});

	/* - */ it("Test upVote tutorial post", async function () {
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
		await expect(user.rating).to.equal(UpvotedTutorial);
		await expect(post.rating).to.equal(1);
	});

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
		await expect(user.rating).to.equal(StartRating + 0);
		await expect(post.rating).to.equal(0);

		const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 0, 0);
		await expect(statusHistory._hex).to.equal('0x00');
	});

	/* - */ it("Test double upVote common post", async function () {
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
		await expect(user.rating).to.equal(0);
		await expect(post.rating).to.equal(0);
	});

	/* - */ it("Test double upVote tytorial post", async function () {
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
		await expect(user.rating).to.equal(0);
		await expect(post.rating).to.equal(0);
	});

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

	/* - */ it("Test downVote common post", async function () {
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
		await expect(user.rating).to.equal(DownvotedCommonPost);
		await expect(user2.rating).to.equal(DownvoteCommonPost);
		await expect(post.rating).to.equal(-1);
	});

	/* - */ it("Test downVote tutorial post", async function () {
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
		await expect(user.rating).to.equal(DownvotedTutorial);
		await expect(user2.rating).to.equal(DownvoteTutorial);
		await expect(post.rating).to.equal(-1);
	});

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
		await expect(user.rating).to.equal(StartRating + 0);
		await expect(userAction.rating).to.equal(StartRating + 0);
		await expect(post.rating).to.equal(0);

		const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 0, 0);
		await expect(statusHistory._hex).to.equal('0x00');
	});

	/* - */ it("Test double downVote common post", async function () {
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
		await expect(user.rating).to.equal(0);
		await expect(userAction.rating).to.equal(0);
		await expect(post.rating).to.equal(0);
	});

	/* - */ it("Test double downVote tytorial post", async function () {
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
		await expect(user.rating).to.equal(0);
		await expect(userAction.rating).to.equal(0);
		await expect(post.rating).to.equal(0);
	});

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
		await expect(userAction.rating).to.equal(StartRating + 0);
		await expect(post.rating).to.equal(1);

		const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 0, 0);
		await expect(statusHistory._hex).to.equal('0x01');
	});

	/* - */ it("Test upvote after downvote common post", async function () {
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
		await expect(user.rating).to.equal(UpvotedCommonPost);
		await expect(userAction.rating).to.equal(0);
		await expect(post.rating).to.equal(1);
	});

	/* - */ it("Test upvote after downvote tutorial post", async function () {
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
		await expect(user.rating).to.equal(UpvotedTutorial);
		await expect(userAction.rating).to.equal(0);
		await expect(post.rating).to.equal(1);
	});

	/* - */ it("Test delete post after upvote expert post", async function () {
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
		await expect(user.rating).to.equal(UpvotedExpertPost);
		await expect(userAction.rating).to.equal(0);

		await peeranha.deletePost(1);

		const newUserRating = await peeranha.getUserByAddress(signers[1].address);
		const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		await expect(newUserRating.rating).to.equal(0);
		await expect(newUserActionRating.rating).to.equal(0);
	});

	/* - */ it("Test delete post after upvote common post", async function () {
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
		await expect(user.rating).to.equal(UpvotedCommonPost);
		await expect(userAction.rating).to.equal(0);

		await peeranha.deletePost(1);

		const newUserRating = await peeranha.getUserByAddress(signers[1].address);
		const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		await expect(newUserRating.rating).to.equal(0);
		await expect(newUserActionRating.rating).to.equal(0);
	});

	/* - */ it("Test delete post after upvote tutorial ", async function () {
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
		await expect(user.rating).to.equal(UpvotedTutorial);
		await expect(userAction.rating).to.equal(0);

		await peeranha.deletePost(1);

		const newUserRating = await peeranha.getUserByAddress(signers[1].address);
		const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		await expect(newUserRating.rating).to.equal(0);
		await expect(newUserActionRating.rating).to.equal(0);
	});

	/* - */ it("Test delete post after downvote expert post", async function () {
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
		await expect(user.rating).to.equal(DownvotedExpertPost);
		await expect(userAction.rating).to.equal(DownvoteExpertPost);

		await peeranha.deletePost(1);

		const newUserRating = await peeranha.getUserByAddress(signers[1].address);
		const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		await expect(newUserRating.rating).to.equal(DownvotedExpertPost);
		await expect(newUserActionRating.rating).to.equal(DownvoteExpertPost);
	});

	/* - */ it("Test delete post after downvote common post", async function () {
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
		await expect(user.rating).to.equal(DownvotedCommonPost);
		await expect(userAction.rating).to.equal(DownvoteCommonPost);

		await peeranha.deletePost(1);

		const newUserRating = await peeranha.getUserByAddress(signers[1].address);
		const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		await expect(newUserRating.rating).to.equal(DownvotedCommonPost);
		await expect(newUserActionRating.rating).to.equal(DownvoteCommonPost);
	});

	/* - */ it("Test delete post after downvote tutorial", async function () {
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
		await expect(user.rating).to.equal(DownvotedTutorial);
		await expect(userAction.rating).to.equal(DownvoteTutorial);

		await peeranha.deletePost(1);

		const newUserRating = await peeranha.getUserByAddress(signers[1].address);
		const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		await expect(newUserRating.rating).to.equal(DownvotedCommonPost);
		await expect(newUserActionRating.rating).to.equal(DownvoteCommonPost);
	});

	/* - */ it("Test delete post after upvote expert reply", async function () {
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
		await expect(newUserRating.rating).to.equal(0);
		await expect(newUserActionRating.rating).to.equal(DeleteOwnReply);
	});

	/* - */ it("Test delete post after upvote common reply", async function () {
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
		await expect(newUserRating.rating).to.equal(0);
		await expect(newUserActionRating.rating).to.equal(DeleteOwnReply);
	});

	/* - */ it("Test delete post after upvote tutorial reply", async function () {
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
		await expect(newUserRating.rating).to.equal(0);
		await expect(newUserActionRating.rating).to.equal(DeleteOwnReply);
	});

	/* - */ it("Test delete post after downvote expert reply", async function () {
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
		await expect(user.rating).to.equal(DownvotedExpertReply);
		await expect(userAction.rating).to.equal(DownvoteExpertReply);

		await peeranha.deletePost(1);

		const newUserRating = await peeranha.getUserByAddress(signers[1].address);
		const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);

		await expect(newUserRating.rating).to.equal(DownvotedExpertReply);
		await expect(newUserActionRating.rating).to.equal(DownvoteExpertReply + DeleteOwnReply);	
	});

	/* - */ it("Test delete post after downvote common reply", async function () {
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
		await expect(user.rating).to.equal(DownvotedCommonReply);
		await expect(userAction.rating).to.equal(DownvoteCommonReply);

		await peeranha.deletePost(1);

		const newUserRating = await peeranha.getUserByAddress(signers[1].address);
		const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		await expect(newUserRating.rating).to.equal(DownvotedCommonReply);
		await expect(newUserActionRating.rating).to.equal(DownvoteCommonReply + DeleteOwnReply);
	});

	/* - */ it("Test delete post after downvote tutorial reply", async function () {
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
		await expect(user.rating).to.equal(0);
		await expect(userAction.rating).to.equal(0);

		await peeranha.deletePost(1);

		const newUserRating = await peeranha.getUserByAddress(signers[1].address);
		const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		await expect(newUserRating.rating).to.equal(0);
		await expect(newUserActionRating.rating).to.equal(DeleteOwnReply);
	});

	/* - */ it("Test delete own post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);

		await peeranha.createUser(hashContainer[1]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);	
		await peeranha.deletePost(1);

		const userRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		await expect(userRating.rating).to.equal(DeleteOwnPost);
	});

	/* - */ it("Test delete own reply", async function () {
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
		await expect(userRating.rating).to.equal(DeleteOwnReply);
	});

	/* - */ it("Test create first and quick expert reply", async function () {
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
		await expect(userRating.rating).to.equal(FirstExpertReply + QuickExpertReply);

		const reply = await peeranha.getReply(1, 1);
		await expect(reply.isFirstReply).to.equal(true);
		await expect(reply.isQuickReply).to.equal(true);
	});

	/* - */ it("Test create first and quick common reply", async function () {
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
		await expect(userRating.rating).to.equal(FirstCommonReply + QuickCommonReply);

		const reply = await peeranha.getReply(1, 1);
		await expect(reply.isFirstReply).to.equal(true);
		await expect(reply.isQuickReply).to.equal(true);
	});

	/* - */ it("Test create first and quick tutorial reply", async function () {
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
		await expect(userRating.rating).to.equal(0);

		const reply = await peeranha.getReply(1, 1);
		await expect(reply.isFirstReply).to.equal(false);
		await expect(reply.isQuickReply).to.equal(false);
	});

	/* - */ it("Test create 2 expert reply, one first and two quick ", async function () {
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
		await expect(userRating.rating).to.equal(FirstExpertReply + QuickExpertReply);
		await expect(userRating2.rating).to.equal(QuickExpertReply);

		const firstReply = await peeranha.getReply(1, 1);
		const secondReply = await peeranha.getReply(1, 2);
		await expect(firstReply.isFirstReply).to.equal(true);
		await expect(firstReply.isQuickReply).to.equal(true);
		await expect(secondReply.isFirstReply).to.equal(false);
		await expect(secondReply.isQuickReply).to.equal(true);
	});

	/* - */ it("Test create 2 common reply, one first and two quick ", async function () {
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
		await expect(userRating.rating).to.equal(FirstCommonReply + QuickCommonReply);
		await expect(userRating2.rating).to.equal(QuickCommonReply);

		const firstReply = await peeranha.getReply(1, 1);
		const secondReply = await peeranha.getReply(1, 2);
		await expect(firstReply.isFirstReply).to.equal(true);
		await expect(firstReply.isQuickReply).to.equal(true);
		await expect(secondReply.isFirstReply).to.equal(false);
		await expect(secondReply.isQuickReply).to.equal(true);
	});

	/* - */ it("Test create 2 tutorial reply, one first and two quick ", async function () {
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
		await expect(userRating.rating).to.equal(0);
		await expect(userRating2.rating).to.equal(0);

		const firstReply = await peeranha.getReply(1, 1);
		const secondReply = await peeranha.getReply(1, 2);
		await expect(firstReply.isFirstReply).to.equal(false);
		await expect(firstReply.isQuickReply).to.equal(false);
		await expect(secondReply.isFirstReply).to.equal(false);
		await expect(secondReply.isQuickReply).to.equal(false);
	});

	/* - */ it("Test delete 2 expert reply, one first and two quick ", async function () {
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
		await expect(userRating.rating).to.equal(DeleteOwnReply);
		await expect(userRating2.rating).to.equal(DeleteOwnReply);
	});

	/* - */ it("Test delete 2 common reply, one first and two quick ", async function () {
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
		await expect(userRating.rating).to.equal(DeleteOwnReply);
		await expect(userRating2.rating).to.equal(DeleteOwnReply);
	});

	/* - */ it("Test delete 2 tutorial reply, one first and two quick ", async function () {
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
		await expect(userRating.rating).to.equal(DeleteOwnReply);
		await expect(userRating2.rating).to.equal(DeleteOwnReply);
	});

	/* - */ it("Test mark expert reply as best", async function () {
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
		const userRating = await peeranha.getUserByAddress(signers[1].address);
		await expect(userRating.rating).to.equal(oldUserRating.rating + AcceptExpertReply);
	});

	/* - */ it("Test mark common reply as best", async function () {
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
		const userRating = await peeranha.getUserByAddress(signers[1].address);
		await expect(userRating.rating).to.equal(oldUserRating.rating + AcceptCommonReply);
	});

	/* - */ it("Test mark tutorial reply as best", async function () {
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
		const userRating = await peeranha.getUserByAddress(signers[1].address);
		await expect(userRating.rating).to.equal(oldUserRating.rating);
	});

	/* - */ it("Test unmark expert reply as best", async function () {
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

	/* - */ it("Test unmark common reply as best", async function () {
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

	/* - */ it("Test unmark tutorial reply as best", async function () {
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
	
	/* - */ it("Test delete expert reply as best", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);

		await peeranha.createUser(hashContainer[1]);
		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
		await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
		
		await peeranha.changeStatusBestReply(1, 1);
		await peeranha.deleteReply(1, 1);

		const userRating = await peeranha.getUserByAddress(signers[1].address);
		await expect(userRating.rating).to.equal(0);
	});

	/* - */ it("Test delete common reply as best", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);

		await peeranha.createUser(hashContainer[1]);
		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
		await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
		
		await peeranha.changeStatusBestReply(1, 1);
		await peeranha.deleteReply(1, 1);

		const userRating = await peeranha.getUserByAddress(signers[1].address);
		await expect(userRating.rating).to.equal(0);
	});

	/* - */ it("Test delete tutorial reply as best", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();
        const ipfsHashes = getHashesContainer(2);

		await peeranha.createUser(hashContainer[1]);
		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
        await peeranha.createCommunity(ipfsHashes[0], createTags(5));

		await peeranha.createPost(1, hashContainer[0], PostTypeEnum.Tutorial, [1]);
		await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
		
		await peeranha.changeStatusBestReply(1, 1);
		await peeranha.deleteReply(1, 1);

		const userRating = await peeranha.getUserByAddress(signers[1].address);
		await expect(userRating.rating).to.equal(0);
	});


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
		const post = await peeranha.getPost(1);
		// await expect(user.rating).to.equal(StartRating + UpvotedExpertPost);
		// await expect(post.rating).to.equal(1);
		
		const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 1, 0);
		await expect(statusHistory._hex).to.equal('0x01');
	});

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
        await peeranha.voteItem(1, 0, 1, 0);

		const user = await peeranha.getUserByAddress(signers[1].address);
		const post = await peeranha.getPost(1);
		// await expect(user.rating).to.equal(StartRating + UpvotedExpertPost);
		// await expect(post.rating).to.equal(1);
		
		const statusHistory = await peeranha.getStatusHistory(peeranha.deployTransaction.from, 1, 1, 0);
		await expect(statusHistory._hex).to.equal('-0x01');
	});





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

	// upvote/ downvote reply -> delete
	// upvote/ downvote comment -> delete
	///



	const registerTwoUsers = async function (peeranha, signers, hashContainer) {
		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);
	}

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

	const StartRating = 10;

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
    const ModeratorDeletePost = -2;

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
    const ModeratorDeleteReply = -2;

/////////////////////////////////////////////////////////////////////////////////

    const ModeratorDeleteComment = -1;

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
