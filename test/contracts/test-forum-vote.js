const { expect } = require("chai");

describe("Test vote", function () {

	const DaysEnum = {"ExpertPost":0, "CommonPost":1, "Tutorial":2}

    it("Test upVote expert post", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], DaysEnum.ExpertPost, [1]);
        await peeranha.voteItem(1, [], 0, 0, 1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		const post = await peeranha.getPost(1);
		await expect(user.rating).to.equal(UpvotedExpertPost);
		await expect(post.rating).to.equal(1);
	});

	it("Test upVote common post", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], DaysEnum.CommonPost, [1]);
        await peeranha.voteItem(1, [], 0, 0, 1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		const post = await peeranha.getPost(1);
		await expect(user.rating).to.equal(UpvotedCommonPost);
		await expect(post.rating).to.equal(1);
	});

	it("Test upVote tutorial post", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], DaysEnum.Tutorial, [1]);
        await peeranha.voteItem(1, [], 0, 0, 1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		const post = await peeranha.getPost(1);
		await expect(user.rating).to.equal(UpvotedTutorial);
		await expect(post.rating).to.equal(1);
	});

	it("Test double upVote expert post", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], DaysEnum.ExpertPost, [1]);
        await peeranha.voteItem(1, [], 0, 0, 1);
		await peeranha.voteItem(1, [], 0, 0, 1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		const post = await peeranha.getPost(1);
		await expect(user.rating).to.equal(0);
		await expect(post.rating).to.equal(0);
	});

	it("Test double upVote common post", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], DaysEnum.CommonPost, [1]);
        await peeranha.voteItem(1, [], 0, 0, 1);
		await peeranha.voteItem(1, [], 0, 0, 1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		const post = await peeranha.getPost(1);
		await expect(user.rating).to.equal(0);
		await expect(post.rating).to.equal(0);
	});

	it("Test double upVote tytorial post", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], DaysEnum.Tutorial, [1]);
        await peeranha.voteItem(1, [], 0, 0, 1);
		await peeranha.voteItem(1, [], 0, 0, 1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		const post = await peeranha.getPost(1);
		await expect(user.rating).to.equal(0);
		await expect(post.rating).to.equal(0);
	});

	it("Test downVote expert post", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], DaysEnum.ExpertPost, [1]);
        await peeranha.voteItem(1, [], 0, 0, 0);

		const user = await peeranha.getUserByAddress(signers[1].address);
		const user2 = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		const post = await peeranha.getPost(1);

		await expect(user.rating).to.equal(DownvotedExpertPost);
		await expect(user2.rating).to.equal(DownvoteExpertPost);
		await expect(post.rating).to.equal(-1);
	});

	it("Test downVote common post", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], DaysEnum.CommonPost, [1]);
        await peeranha.voteItem(1, [], 0, 0, 0);

		const user = await peeranha.getUserByAddress(signers[1].address);
		const user2 = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		const post = await peeranha.getPost(1);

		await expect(user.rating).to.equal(DownvotedCommonPost);
		await expect(user2.rating).to.equal(DownvoteCommonPost);
		await expect(post.rating).to.equal(-1);
	});

	it("Test downVote tutorial post", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], DaysEnum.Tutorial, [1]);
     await peeranha.voteItem(1, [], 0, 0, 0);

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

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], DaysEnum.ExpertPost, [1]);
        await peeranha.voteItem(1, [], 0, 0, 0);
		await peeranha.voteItem(1, [], 0, 0, 0);

		const user = await peeranha.getUserByAddress(signers[1].address);
		const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		const post = await peeranha.getPost(1);
		await expect(user.rating).to.equal(0);
		await expect(userAction.rating).to.equal(0);
		await expect(post.rating).to.equal(0);
	});

	it("Test double downVote common post", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], DaysEnum.CommonPost, [1]);
        await peeranha.voteItem(1, [], 0, 0, 0);
		await peeranha.voteItem(1, [], 0, 0, 0);

		const user = await peeranha.getUserByAddress(signers[1].address);
		const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		const post = await peeranha.getPost(1);
		await expect(user.rating).to.equal(0);
		await expect(userAction.rating).to.equal(0);
		await expect(post.rating).to.equal(0);
	});

	it("Test double downVote tytorial post", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], DaysEnum.Tutorial, [1]);
        await peeranha.voteItem(1, [], 0, 0, 0);
		await peeranha.voteItem(1, [], 0, 0, 0);

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

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], DaysEnum.ExpertPost, [1]);
        await peeranha.voteItem(1, [], 0, 0, 1);
		await peeranha.voteItem(1, [], 0, 0, 0);

		const user = await peeranha.getUserByAddress(signers[1].address);
		const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		const post = await peeranha.getPost(1);
		
		await expect(user.rating).to.equal(DownvotedExpertPost);
		await expect(userAction.rating).to.equal(DownvoteExpertPost);
		await expect(post.rating).to.equal(-1);
	});

	it("Test upvote after downvote expert post", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await registerTwoUsers(peeranha, signers, hashContainer);

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], DaysEnum.ExpertPost, [1]);
        await peeranha.voteItem(1, [], 0, 0, 0);
		await peeranha.voteItem(1, [], 0, 0, 1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		const post = await peeranha.getPost(1);
		
		await expect(user.rating).to.equal(UpvotedExpertPost);
		await expect(userAction.rating).to.equal(0);
		await expect(post.rating).to.equal(1);
	});

	it("Test upvote after downvote common post", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await registerTwoUsers(peeranha, signers, hashContainer);

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], DaysEnum.CommonPost, [1]);
        await peeranha.voteItem(1, [], 0, 0, 0);
		await peeranha.voteItem(1, [], 0, 0, 1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		const post = await peeranha.getPost(1);
		
		await expect(user.rating).to.equal(UpvotedCommonPost);
		await expect(userAction.rating).to.equal(0);
		await expect(post.rating).to.equal(1);
	});

	it("Test upvote after downvote tutorial post", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await registerTwoUsers(peeranha, signers, hashContainer);

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], DaysEnum.Tutorial, [1]);
        await peeranha.voteItem(1, [], 0, 0, 0);
		await peeranha.voteItem(1, [], 0, 0, 1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		const post = await peeranha.getPost(1);
		
		await expect(user.rating).to.equal(UpvotedTutorial);
		await expect(userAction.rating).to.equal(0);
		await expect(post.rating).to.equal(1);
	});

	it("Test delete post after upvote expert post", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], DaysEnum.ExpertPost, [1]);
        await peeranha.voteItem(1, [], 0, 0, 1);

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

	it("Test delete post after upvote common post", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], DaysEnum.CommonPost, [1]);
        await peeranha.voteItem(1, [], 0, 0, 1);

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

	it("Test delete post after upvote tutorial ", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], DaysEnum.Tutorial, [1]);
        await peeranha.voteItem(1, [], 0, 0, 1);

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

	it("Test delete post after downvote expert post", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], DaysEnum.ExpertPost, [1]);
        await peeranha.voteItem(1, [], 0, 0, 0);

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

	it("Test delete post after downvote common post", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], DaysEnum.CommonPost, [1]);
        await peeranha.voteItem(1, [], 0, 0, 0);

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

	it("Test delete post after downvote tutorial", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], DaysEnum.Tutorial, [1]);
        await peeranha.voteItem(1, [], 0, 0, 0);

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

	it("Test delete post after upvote expert reply", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.connect(signers[2]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.createPost(1, hashContainer[0], DaysEnum.ExpertPost, [1]);
		await peeranha.connect(signers[1]).createReply(1, [], hashContainer[1], false);
		const userRating = await peeranha.getUserByAddress(signers[1].address);
		const userActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);

        await peeranha.voteItem(1, [], 1, 0, 1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
		await expect(user.rating).to.equal(userRating.rating + UpvotedExpertReply);
		await expect(userAction.rating).to.equal(userActionRating.rating);

		await peeranha.connect(signers[2]).deletePost(1);

		const newUserRating = await peeranha.getUserByAddress(signers[1].address);
		const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		await expect(newUserRating.rating).to.equal(0);
		await expect(newUserActionRating.rating).to.equal(0);
	});

	it("Test delete post after upvote common reply", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.connect(signers[2]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.createPost(1, hashContainer[0], DaysEnum.CommonPost, [1]);
		await peeranha.connect(signers[1]).createReply(1, [], hashContainer[1], false);
		const userRating = await peeranha.getUserByAddress(signers[1].address);
		const userActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);

        await peeranha.voteItem(1, [], 1, 0, 1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
		await expect(user.rating).to.equal(userRating.rating + UpvotedCommonReply);
		await expect(userAction.rating).to.equal(userActionRating.rating);

		await peeranha.connect(signers[2]).deletePost(1);

		const newUserRating = await peeranha.getUserByAddress(signers[1].address);
		const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		await expect(newUserRating.rating).to.equal(0);
		await expect(newUserActionRating.rating).to.equal(0);
	});

	it("Test delete post after upvote tutorial reply", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.connect(signers[2]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.createPost(1, hashContainer[0], DaysEnum.Tutorial, [1]);
		await peeranha.connect(signers[1]).createReply(1, [], hashContainer[1], false);
		const userRating = await peeranha.getUserByAddress(signers[1].address);
		const userActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);

        await peeranha.voteItem(1, [], 1, 0, 1);

		const user = await peeranha.getUserByAddress(signers[1].address);
		const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
		await expect(user.rating).to.equal(userRating.rating);
		await expect(userAction.rating).to.equal(userActionRating.rating);

		await peeranha.connect(signers[2]).deletePost(1);

		const newUserRating = await peeranha.getUserByAddress(signers[1].address);
		const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		await expect(newUserRating.rating).to.equal(0);
		await expect(newUserActionRating.rating).to.equal(0);
	});

	it("Test delete post after downvote expert reply", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.connect(signers[2]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.createPost(1, hashContainer[0], DaysEnum.ExpertPost, [1]);
		await peeranha.connect(signers[1]).createReply(1, [], hashContainer[1], false);
        await peeranha.voteItem(1, [], 1, 0, 0);

		const user = await peeranha.getUserByAddress(signers[1].address);
		const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
		await expect(user.rating).to.equal(DownvotedExpertReply);
		await expect(userAction.rating).to.equal(DownvoteExpertReply);

		await peeranha.connect(signers[2]).deletePost(1);

		const newUserRating = await peeranha.getUserByAddress(signers[1].address);
		const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);

		await expect(newUserRating.rating).to.equal(DownvotedExpertReply);
		await expect(newUserActionRating.rating).to.equal(DownvoteExpertReply);	
	});

	it("Test delete post after downvote common reply", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.connect(signers[2]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);
		await peeranha.createPost(1, hashContainer[0], DaysEnum.CommonPost, [1]);
		await peeranha.connect(signers[1]).createReply(1, [], hashContainer[1], false);
        await peeranha.voteItem(1, [], 1, 0, 0);

		const user = await peeranha.getUserByAddress(signers[1].address);
		const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
		await expect(user.rating).to.equal(DownvotedCommonReply);
		await expect(userAction.rating).to.equal(DownvoteCommonReply);

		await peeranha.connect(signers[2]).deletePost(1);

		const newUserRating = await peeranha.getUserByAddress(signers[1].address);
		const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		await expect(newUserRating.rating).to.equal(DownvotedCommonReply);
		await expect(newUserActionRating.rating).to.equal(DownvoteCommonReply);
	});

	it("Test delete post after downvote tutorial reply", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();

		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);

		await peeranha.createPost(1, hashContainer[0], DaysEnum.Tutorial, [1]);
		await peeranha.connect(signers[1]).createReply(1, [], hashContainer[1], false);
        await peeranha.voteItem(1, [], 1, 0, 0);

		const user = await peeranha.getUserByAddress(signers[1].address);
		const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
		await expect(user.rating).to.equal(0);
		await expect(userAction.rating).to.equal(0);

		await peeranha.connect(signers[2]).deletePost(1);

		const newUserRating = await peeranha.getUserByAddress(signers[1].address);
		const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		await expect(newUserRating.rating).to.equal(0);
		await expect(newUserActionRating.rating).to.equal(0);
	});

	it("Test delete own post", async function () {
		const peeranha = await createContract();
		const hashContainer = getHashContainer();
		await peeranha.createUser(hashContainer[1]);

		await peeranha.createPost(1, hashContainer[0], DaysEnum.ExpertPost, [1]);	
		await peeranha.deletePost(1);

		const userRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		await expect(userRating.rating).to.equal(DeleteOwnPost);
	});

	it("Test delete own reply", async function () {
		const peeranha = await createContract();
		const signers = await ethers.getSigners();
		const hashContainer = getHashContainer();
		await peeranha.createUser(hashContainer[1]);
		await peeranha.connect(signers[1]).createUser(hashContainer[0]);

		await peeranha.connect(signers[1]).createPost(1, hashContainer[0], DaysEnum.ExpertPost, [1]);
		await peeranha.createReply(1, [], hashContainer[1], false);

		await peeranha.deleteReply(1, [], 1);
		const userRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
		await expect(userRating.rating).to.equal(DeleteOwnReply);
	});



	///
	//				to do

	// delete own reply/post
	// first answer/ quicke answer -> delete
	// best reply -> delete
	///



	// it("Test upvote reply", async function () {
	// 	const peeranha = await createContract();
	// 	const signers = await ethers.getSigners();
	// 	const hashContainer = getHashContainer();

	// 	await peeranha.createPost(1, hashContainer[0], [1]);
	// 	await peeranha.createReply(1, [], hashContainer[1], false);
		
    //     await peeranha.connect(signers[1]).voteItem(1, [], 1, 0, 1);
	// 	var reply = await peeranha.getReply(1, [], 1);
	// 	await expect(reply.rating).to.equal(1);
	// });

	// it("Test downvote reply", async function () {
	// 	const peeranha = await createContract();
	// 	const signers = await ethers.getSigners();
	// 	const hashContainer = getHashContainer();

	// 	await peeranha.createPost(1, hashContainer[0], [1]);
	// 	await peeranha.createReply(1, [], hashContainer[1], false);
		
    //     await peeranha.connect(signers[1]).voteItem(1, [], 1, 0, 0);
	// 	var reply = await peeranha.getReply(1, [], 1);
	// 	await expect(reply.rating).to.equal(-1);
	// });

	// it("Test upvote comment", async function () {
	// 	const peeranha = await createContract();
	// // 	const signers = await ethers.getSigners();
	// // 	const hashContainer = getHashContainer();

	// // 	await peeranha.createPost(1, hashContainer[0], [1]);
	// // 	await peeranha.createComment(1, [], hashContainer[1]);
		
    // //     await peeranha.connect(signers[1]).voteItem(1, [], 0, 1, 1);
	// // 	var reply = await peeranha.getComment(1, [], 1);
	// // 	await expect(reply.rating).to.equal(1);
	// // });

	// // it("Test downvote comment", async function () {
	// // 	const peeranha = await createContract();
	// // 	const signers = await ethers.getSigners();
	// // 	const hashContainer = getHashContainer();

	// // 	await peeranha.createPost(1, hashContainer[0], [1]);
	// // 	await peeranha.createComment(1, [], hashContainer[1]);
		
	// // 	await peeranha.connect(signers[1]).voteItem(1, [], 0, 1, 0)
	// // 	var reply = await peeranha.getComment(1, [], 1);
	// // 	await expect(reply.rating).to.equal(-1);  
	// // });

	// ///
	// //
	// ///



	const registerTwoUsers = async function (peeranha, signers, hashContainer) {
		await peeranha.connect(signers[1]).createUser(hashContainer[0]);
		await peeranha.createUser(hashContainer[1]);
	}

	const createContract = async function () {
		const Peeranha = await ethers.getContractFactory("Peeranha");
		const peeranha = await Peeranha.deploy();
		await peeranha.deployed();
		return peeranha;
	};

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

    const FirstExpertReplyNegetiveRating = -5;
    const QuickExpertReplyNegetiveRating = -5;
    const DeleteFirstExpertReply = -5;
    const DeleteQuickExpertReply = -5;

    //common reply 
    const DownvoteCommonReply = -1;
    const UpvotedCommonReply = 2;
    const DownvotedCommonReply = -1;
    const AcceptCommonReply = 3;
    const FirstCommonReply = 1;
    const QuickReplyCommon = 1;

    const FirstCommonReplyNegetiveRating = -1;
    const QuickReplyCommonNegetiveRating = -1;
    const DeleteFirstCommonReply = -1;
    const DeleteQuickReplyCommon = -1;
    
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
});
