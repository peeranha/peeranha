const { expect } = require("chai");
const { 
	wait, getBalance, createPeerenhaAndTokenContract, registerTwoUsers, createUserWithAnotherRating, getHashContainer, getHashesContainer,
	createTags, parseEther, availableBalanceOf, getInt,
	LanguagesEnum, fraction, periodUserReward, PeriodTime, PostTypeEnum, StartRating, StartRatingWithoutAction, deleteTime, DeleteOwnReply,
	QuickReplyTime, DownvoteExpertPost, UpvotedExpertPost, DownvotedExpertPost, DownvoteCommonPost, UpvotedCommonPost, DownvotedCommonPost,
  ModeratorDeletePost, DownvoteExpertReply, UpvotedExpertReply, DownvotedExpertReply, AcceptExpertReply, AcceptedExpertReply, 
  FirstExpertReply, QuickExpertReply, DownvoteCommonReply, UpvotedCommonReply, DownvotedCommonReply, AcceptCommonReply,
  AcceptedCommonReply, FirstCommonReply, QuickCommonReply, ModeratorDeleteReply, ModeratorDeleteComment,
	DownvoteTutorial, UpvotedTutorial, DownvotedTutorial, DeleteOwnPost, DISPATCHER_ROLE,
} = require('./utils');


describe("Test dispatcher", function () {
	
	describe("User actions", function() {
		it("Create user with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
	
			const signers = await ethers.getSigners();
			
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
	
			await expect(peeranhaUser.connect(signers[1]).createUser(signers[2].address, hashContainer[1]))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
	
			await expect(peeranhaUser.connect(signers[3]).createUser(signers[4].address, hashContainer[1]))
			.to.be.revertedWith('not_allowed_not_dispatcher');
		});
	
		it("Test user editing with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
			
			await peeranhaUser.createUser(signers[0].address, hashContainer[0]);
			const user = await peeranhaUser.getUserByIndex(0);
			expect(user.ipfsDoc.hash).to.equal(hashContainer[0]);
	
			await expect(peeranhaUser.connect(signers[2]).updateUser(signers[0].address, hashContainer[1]))
			.to.be.revertedWith('not_allowed_not_dispatcher');
	
			await expect(peeranhaUser.connect(signers[1]).updateUser(signers[0].address, hashContainer[1]))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
	
			const changedUser = await peeranhaUser.getUserByIndex(0);
			expect(changedUser.ipfsDoc.hash).to.equal(hashContainer[1]);
	
			expect(await peeranhaUser.getUsersCount()).to.equal(1);
		})
	
		it("Follow community with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
	
	
			await peeranhaUser.createUser(signers[0].address, hashContainer[0]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
	
			await expect(peeranhaUser.connect(signers[2]).followCommunity(signers[0].address, 1))
			.to.be.revertedWith('not_allowed_not_dispatcher');
	
			await expect(peeranhaUser.connect(signers[1]).followCommunity(signers[0].address, 1))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
			
			const user = await peeranhaUser.getUserByIndex(0);
			expect(user.followedCommunities[0]).to.equal(1);
		})
	
		it("Unfollow community with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			const signers = await ethers.getSigners();
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
	
			await peeranhaUser.createUser(signers[0].address, hashContainer[0]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
	
	
			await peeranhaUser.followCommunity(signers[0].address, 1);
	
			await expect(peeranhaUser.connect(signers[2]).unfollowCommunity(signers[0].address, 1))
			.to.be.revertedWith('not_allowed_not_dispatcher');
	
			await expect(peeranhaUser.connect(signers[1]).unfollowCommunity(signers[0].address, 1))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
	
			const user = await peeranhaUser.getUserByIndex(0);
			expect(user.followedCommunities[0]).to.equal(0);
		})
	
		it("Test give community admin with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
	
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
			await peeranhaUser.connect(signers[3]).createUser(signers[3].address, hashContainer[0]);
	
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	
			await expect(peeranhaUser.connect(signers[2]).giveCommunityModeratorPermission(signers[2].address, signers[3].address, 1))
			.to.be.revertedWith('not_allowed_admin_or_comm_admin');
	
			await expect(peeranhaUser.connect(signers[3]).giveCommunityAdminPermission(signers[0].address, signers[2].address, 1))
			.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaUser.connect(signers[1]).giveCommunityAdminPermission(signers[0].address, signers[2].address, 1))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
	
			await expect(peeranhaUser.connect(signers[2]).giveCommunityModeratorPermission(signers[2].address, signers[3].address, 1))
			.not.to.be.revertedWith('not_allowed_admin_or_comm_admin');
	
			await expect(peeranhaContent.connect(signers[3]).editPost(signers[3].address, 1, hashContainer[2], [], 1, PostTypeEnum.ExpertPost))
			.not.to.be.revertedWith('not_allowed_admin_or_comm_moderator');
		});
	
		it("Test give community moderator with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
			await peeranhaUser.connect(signers[3]).createUser(signers[3].address, hashContainer[0]);

			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			await expect(peeranhaUser.connect(signers[2]).giveCommunityModeratorPermission(signers[2].address, signers[3].address, 1))
			.to.be.revertedWith('not_allowed_admin_or_comm_admin');

			await expect(peeranhaUser.connect(signers[3]).giveCommunityAdminPermission(signers[0].address, signers[2].address, 1))
			.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaUser.connect(signers[1]).giveCommunityAdminPermission(signers[0].address, signers[2].address, 1))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');

			await expect(peeranhaUser.connect(signers[2]).giveCommunityModeratorPermission(signers[2].address, signers[3].address, 1))
			.not.to.be.revertedWith('not_allowed_admin_or_comm_admin');

			await expect(peeranhaContent.connect(signers[3]).editPost(signers[3].address, 1, hashContainer[2], [], 1, PostTypeEnum.ExpertPost))
			.not.to.be.revertedWith('not_allowed_admin_or_comm_moderator');
		});
	
		it("Test revoke community admin with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
	
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
			await peeranhaUser.connect(signers[3]).createUser(signers[3].address, hashContainer[0]);
			await peeranhaUser.connect(signers[4]).createUser(signers[4].address, hashContainer[0]);
	
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
	
			await peeranhaUser.connect(signers[1]).giveCommunityAdminPermission(signers[0].address, signers[2].address, 1);
	
			await expect(peeranhaUser.connect(signers[2]).giveCommunityModeratorPermission(signers[2].address, signers[3].address, 1))
			.not.to.be.revertedWith('not_allowed_admin_or_comm_admin');	
	
			await expect(peeranhaUser.connect(signers[3]).revokeCommunityAdminPermission(signers[0].address, signers[2].address, 1))
			.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaUser.connect(signers[1]).revokeCommunityAdminPermission(signers[0].address, signers[2].address, 1))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
	
			await expect(peeranhaUser.connect(signers[2]).giveCommunityModeratorPermission(signers[2].address, signers[4].address, 1))
			.to.be.revertedWith('not_allowed_admin_or_comm_admin');
		});
	
		it("Test revoke community moderator with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
	
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
			await peeranhaUser.connect(signers[3]).createUser(signers[3].address, hashContainer[0]);
	
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
	
			await expect(peeranhaContent.connect(signers[2]).editPost(signers[2].address, 1, hashContainer[2], [], 1, PostTypeEnum.ExpertPost))
			.to.be.revertedWith('Not_allowed_edit_not_author');
	
			await expect(peeranhaUser.connect(signers[3]).revokeCommunityModeratorPermission(signers[0].address, signers[2].address, 1))
			.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaUser.connect(signers[1]).revokeCommunityModeratorPermission(signers[0].address, signers[2].address, 1))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
	
			await expect(peeranhaContent.connect(signers[2]).editPost(signers[2].address, 1, hashContainer[2], [], 1, PostTypeEnum.ExpertPost))
			.to.be.revertedWith('Not_allowed_edit_not_author');
		});
	})

	describe("Token actions", function() {
		it("Test get reward with dispatcher", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
			
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
	
			await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 5, 1);
			await wait(PeriodTime);
	
			await peeranhaUser.addUserRating(peeranhaUser.deployTransaction.from, 1, 1);
			await wait(PeriodTime);
	
			const rewardPeriods = await peeranhaUser.getActiveUserPeriods(peeranhaUser.deployTransaction.from)
			
			const ratingToReward = await peeranhaUser.getRatingToReward(peeranhaUser.deployTransaction.from, rewardPeriods[0], 1);
			expect(ratingToReward).to.equal(5);
	
			await expect(token.connect(signers[3]).claimReward(signers[0].address, rewardPeriods[0]))
			.to.be.revertedWith('not_allowed_not_dispatcher');
	
			await expect(token.connect(signers[1]).claimReward(signers[0].address, rewardPeriods[0]))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
			
			const balance = await getBalance(token, peeranhaUser.deployTransaction.from);
	
			expect(balance).to.equal(periodUserReward * fraction);
		});
	
		it("Test set stake with dispatcher", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
	
			await token.mint(parseEther("2"))
	
			await expect(token.connect(signers[3]).setStake(accountDeployed, parseEther("1")))
			.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(token.connect(signers[1]).setStake(accountDeployed, parseEther("1")))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
	
	
			const availableBalanceFrom = await availableBalanceOf(token, accountDeployed);
	
			expect(availableBalanceFrom).to.equal(await getInt(parseEther("1")));
		});
	})

	describe("Content actions", function() {
		it("Create post with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
	
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
	
			await expect(peeranhaContent.connect(signers[2]).createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]))
			.to.be.revertedWith('not_allowed_not_dispatcher');

			await expect(peeranhaContent.connect(signers[1]).createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');

			const post = await peeranhaContent.getPost(1);
			
			expect(post.author).to.equal(signers[0].address);
		});

		it("Edit post with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
	
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			await expect(peeranhaContent.connect(signers[3]).editPost(signers[0].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost))
			.to.be.revertedWith('not_allowed_not_dispatcher');

			await expect(peeranhaContent.connect(signers[1]).editPost(signers[0].address, 1, hashContainer[1], [], 1, PostTypeEnum.CommonPost))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');

			const post = await peeranhaContent.getPost(1);
			
			expect(post.ipfsDoc.hash).to.equal(hashContainer[1]);
		});

		it("Delete post with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
	
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			await expect(peeranhaContent.connect(signers[3]).deletePost(signers[0].address, 1))
			.to.be.revertedWith('not_allowed_not_dispatcher');

			await expect(peeranhaContent.connect(signers[1]).deletePost(signers[0].address, 1))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');

			await expect(peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false)).to.be.revertedWith('Post_deleted.');
		});

		it("Create reply with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
	
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			await expect(peeranhaContent.connect(signers[3]).createReply(signers[0].address, 1, 0, hashContainer[1], false))
			.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaContent.connect(signers[1]).createReply(signers[0].address, 1, 0, hashContainer[1], false))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');

			const reply = await peeranhaContent.getReply(1, 1);
			expect(reply.author).to.equal(peeranhaUser.deployTransaction.from);
		});

		it("Edit reply with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
	
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);

			await expect(peeranhaContent.connect(signers[3]).editReply(signers[0].address, 1, 1, hashContainer[2], false))
			.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaContent.connect(signers[1]).editReply(signers[0].address, 1, 1, hashContainer[2], false))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');

			const reply = await peeranhaContent.getReply(1, 1);
			expect(reply.author).to.equal(peeranhaUser.deployTransaction.from);
			expect(reply.isDeleted).to.equal(false);
			expect(reply.ipfsDoc.hash).to.equal(hashContainer[2]);
		});

		it("Delete reply with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
	
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false);

			await expect(peeranhaContent.connect(signers[3]).deleteReply(signers[0].address, 1, 1))
			.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaContent.connect(signers[1]).deleteReply(signers[0].address, 1, 1))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
			
			await expect(peeranhaContent.createComment(signers[0].address, 1, 1, hashContainer[1])).to.be.revertedWith('Reply_deleted.');
		});

		it("Create comment with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
	
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			await expect(peeranhaContent.connect(signers[3]).createComment(signers[0].address, 1, 0, hashContainer[1]))
			.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaContent.connect(signers[1]).createComment(signers[0].address, 1, 0, hashContainer[1]))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');

			const comment = await peeranhaContent.getComment(1, 0, 1);
			expect(comment.author).to.equal(peeranhaContent.deployTransaction.from);
		});

		it("Edit comment with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
	
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1]);

			await expect(peeranhaContent.connect(signers[3]).editComment(signers[0].address, 1, 0, 1, hashContainer[2]))
			.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaContent.connect(signers[1]).editComment(signers[0].address, 1, 0, 1, hashContainer[2]))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');

			const comment = await peeranhaContent.getComment(1, 0, 1);
			expect(comment.author).to.equal(peeranhaUser.deployTransaction.from);
			expect(comment.isDeleted).to.equal(false);
			expect(comment.ipfsDoc.hash).to.equal(hashContainer[2]);
		});

		it("Delete comment with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
	
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			await peeranhaContent.createComment(signers[0].address, 1, 0, hashContainer[1]);

			await expect(peeranhaContent.connect(signers[3]).deleteComment(signers[0].address, 1, 0, 1))
			.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaContent.connect(signers[1]).deleteComment(signers[0].address, 1, 0, 1))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
			
			await expect(peeranhaContent.editComment(signers[0].address, 1, 0, 1, hashContainer[2])).to.be.revertedWith('Comment_deleted.');
		});

		it("Change status best reply with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);
	
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false);

			await expect(peeranhaContent.connect(signers[3]).changeStatusBestReply(signers[0].address, 1, 1))
			.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[0].address, 1, 1))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');

			const post = await peeranhaContent.getPost(1);
			expect(post.bestReply).to.equal(1);
		});

		it("Vote item with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
			
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);
	
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.connect(signers[2]).createPost(signers[2].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
	
			await expect(peeranhaContent.connect(signers[4]).voteItem(signers[0].address, 1, 0, 0, 1))
			.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaContent.connect(signers[1]).voteItem(signers[0].address, 1, 0, 0, 1))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
	
			const userRating = await peeranhaUser.getUserRating(signers[2].address, 1)
			const post = await peeranhaContent.getPost(1);
			expect(userRating).to.equal(StartRating + UpvotedCommonPost);
			expect(post.rating).to.equal(1);
		});

		it("Create translation with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
			
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
	
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
	
			await expect(peeranhaContent.connect(signers[3]).createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[1]]))
			.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaContent.connect(signers[1]).createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[1]]))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
	
			
			const translation = await peeranhaContent.getTranslation(1, 0, 0, LanguagesEnum.English)
			expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[1]);
			expect(translation.isDeleted).to.equal(false);
		});

		it("Edit translation with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(3);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
			
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);
	
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[1]])
	
			await expect(peeranhaContent.connect(signers[3]).editTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[2]]))
			.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaContent.connect(signers[1]).editTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[2]]))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
	
			const translation = await peeranhaContent.getTranslation(1, 0, 0, LanguagesEnum.English)
			expect(translation.ipfsDoc.hash).to.equal(ipfsHashes[2]);
		});

		it("Edit translation with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(3);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
			
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);
	
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[1]])
	
			await peeranhaContent.createTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English], [ipfsHashes[1]])
	
			await peeranhaContent.deleteTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English])
			
			await expect(peeranhaContent.connect(signers[3]).deleteTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English]))
			.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaContent.connect(signers[1]).deleteTranslations(signers[0].address, 1, 0, 0, [LanguagesEnum.English]))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
	
			const translation = await peeranhaContent.getTranslation(1, 0, 0, LanguagesEnum.English)
			expect(translation.isDeleted).to.equal(true);
		});

		it("Update documentation tree with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(3);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
			
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);
	
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			
			await expect(peeranhaContent.connect(signers[3]).updateDocumentationTree(signers[0].address, 1, hashContainer[0]))
			.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaContent.connect(signers[1]).updateDocumentationTree(signers[0].address, 1, hashContainer[0]))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
	
			const documentationTree = await peeranhaContent.getDocumentationTree(1);
			expect(documentationTree.hash).to.equal(hashContainer[0]);
		});
	})

	describe("Community actions", function() {
		it("Create community with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(3);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
			
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
	
			await expect(peeranhaCommunity.connect(signers[3]).createCommunity(signers[0].address, ipfsHashes[0], createTags(5)))
			.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaCommunity.connect(signers[1]).createCommunity(signers[0].address, ipfsHashes[0], createTags(5)))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
	
			await expect(peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]))
			.not.to.be.revertedWith('Community does not exist');
		});

		it("Update community with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(3);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
			
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
	
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			const community = await peeranhaCommunity.getCommunity(1);
			expect(community.ipfsDoc.hash).to.equal(ipfsHashes[0]);
	
			await expect(peeranhaCommunity.connect(signers[3]).updateCommunity(signers[0].address, 1, ipfsHashes[1]))
			.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaCommunity.connect(signers[1]).updateCommunity(signers[0].address, 1, ipfsHashes[1]))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
			const changedCommunity = await peeranhaCommunity.getCommunity(1);
			
			expect(changedCommunity.ipfsDoc.hash).to.equal(ipfsHashes[1]);
			expect(await peeranhaCommunity.getCommunitiesCount()).to.equal(1);
		});

		it("Freeze community with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(3);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
			
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
	
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			const community = await peeranhaCommunity.getCommunity(1);
			expect(community.isFrozen).to.equal(false);
	
			await expect(peeranhaCommunity.connect(signers[3]).freezeCommunity(signers[0].address, 1))
			.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaCommunity.connect(signers[1]).freezeCommunity(signers[0].address, 1))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
			
			const changedCommunity = await peeranhaCommunity.getCommunity(1);
			
			expect(changedCommunity.isFrozen).to.equal(true);
		});

		it("Unfreeze community with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(3);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
			
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
	
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaCommunity.freezeCommunity(signers[0].address, 1);
	
			const community = await peeranhaCommunity.getCommunity(1);
			expect(community.isFrozen).to.equal(true);
	
			await expect(peeranhaCommunity.connect(signers[3]).unfreezeCommunity(signers[0].address, 1))
			.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaCommunity.connect(signers[1]).unfreezeCommunity(signers[0].address, 1))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
	
			const changedCommunity = await peeranhaCommunity.getCommunity(1);
			
			expect(changedCommunity.isFrozen).to.equal(false);
		});

		it("Create tag with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const countOfTags = 5;
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(3);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
			
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
	
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(countOfTags));
	
			await expect(peeranhaCommunity.connect(signers[3]).createTag(signers[0].address, 1, ipfsHashes[1]))
			.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaCommunity.connect(signers[1]).createTag(signers[0].address, 1, ipfsHashes[1]))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
			
			const newTagList = await peeranhaCommunity.getTags(1);
			expect(await peeranhaCommunity.getTagsCount(1)).to.equal(countOfTags + 1);
			expect(newTagList[5].ipfsDoc.hash).to.equal(ipfsHashes[1]);
		});

		it("Update tag with dispatcher", async function() {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const countOfTags = 5;
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(3);
			await peeranhaUser.grantRole(DISPATCHER_ROLE, signers[1].address);
			
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
	
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(countOfTags));
			
			expect(await peeranhaCommunity.getTagsCount(1)).to.equal(5);
	
			await expect(peeranhaCommunity.connect(signers[3]).updateTag(signers[0].address, 1, 1, hashContainer[1]))
			.to.be.revertedWith('not_allowed_not_dispatcher');
			await expect(peeranhaCommunity.connect(signers[1]).updateTag(signers[0].address, 1, 1, hashContainer[1]))
			.not.to.be.revertedWith('not_allowed_not_dispatcher');
			
			const changedTag = await peeranhaCommunity.getTag(1, 1);
			expect(changedTag.ipfsDoc.hash).to.equal(hashContainer[1]);
			expect(await peeranhaCommunity.getTagsCount(1)).to.equal(5);
		});
	})
});
