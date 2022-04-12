const { expect } = require("chai");
const { 
    createContract, getHashContainer, getHashesContainer, createTags, PostTypeEnum, StartRating,
    DownvoteExpertPost, UpvotedExpertPost, DownvotedExpertPost, DownvoteCommonPost, UpvotedCommonPost, DownvotedCommonPost,
    ModeratorDeletePost, DownvoteExpertReply, UpvotedExpertReply, DownvotedExpertReply, AcceptExpertReply, AcceptedExpertReply, 
    FirstExpertReply, QuickExpertReply, DownvoteCommonReply, UpvotedCommonReply, DownvotedCommonReply, AcceptCommonReply,
    AcceptedCommonReply, FirstCommonReply, QuickCommonReply, ModeratorDeleteReply, ModeratorDeleteComment,
} = require('./utils');

///
// to do
// Test delete expert reply as best (delete best reply)
// AcceptReply, 
// Tutorial posts
///

describe("Test permissions", function () {
    describe("Common user", function () {
		it("Test post comment by common user", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

			await expect(peeranha.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[0]))
            .to.be.revertedWith('low_rating_own_post_comment');
            await expect(peeranha.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[0]))
            .to.be.revertedWith('low_rating_own_post_comment');

            await peeranha.addUserRating(signers[1].address, 24, 1);
            await expect(peeranha.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[0]))
            .to.be.revertedWith('low_rating_own_post_comment');
            await expect(peeranha.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[0]))
            .to.be.revertedWith('low_rating_own_post_comment');

            await peeranha.addUserRating(signers[1].address, 1, 1);
            await peeranha.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[0]);
            await peeranha.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[0]);

            expect((await peeranha.getPost(1)).commentCount).to.be.equal(1);
            expect((await peeranha.getReply(1, 1)).commentCount).to.be.equal(1);
		});

        it("Test upvote post or reply by common user", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

			await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1))
            .to.be.revertedWith('low rating to upvote (35 min)');
            await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1))
            .to.be.revertedWith('low_rating_upvote_post');

            await peeranha.addUserRating(signers[1].address, 24, 1);
            await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1))
            .to.be.revertedWith('low rating to upvote (35 min)');
            await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1))
            .to.be.revertedWith('low_rating_upvote_post');

            await peeranha.addUserRating(signers[1].address, 1, 1);
            await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1);
            await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1);

            expect((await peeranha.getPost(1)).rating).to.be.equal(1);
            expect((await peeranha.getReply(1, 1)).rating).to.be.equal(1);
		});

        it("Test downvote post or reply by common user", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

			await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 0))
            .to.be.revertedWith('low_rating_downvote_post');
            await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 0))
            .to.be.revertedWith('low_rating_downvote_reply');

            await peeranha.addUserRating(signers[1].address, 89, 1);
            await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 0))
            .to.be.revertedWith('low_rating_downvote_post');
            await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 0))
            .to.be.revertedWith('low_rating_downvote_reply');

            await peeranha.addUserRating(signers[1].address, 1, 1);
            await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 0);
            await peeranha.addUserRating(signers[1].address, 1, 1);
            await peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 0);

            expect((await peeranha.getPost(1)).rating).to.be.equal(-1);
            expect((await peeranha.getReply(1, 1)).rating).to.be.equal(-1);
		});

        it("Test create post or reply by user with negative rating", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.addUserRating(signers[1].address, -11, 1);
            await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1])

			await expect(peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]))
            .to.be.revertedWith('low_rating_post');
			await expect(peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false))
            .to.be.revertedWith('low_rating_reply');
		});

        it("Test vote item by not registered user", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

			await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1))
            .to.be.revertedWith('Peeranha: must be an existing user');
			await expect(peeranha.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1))
            .to.be.revertedWith('Peeranha: must be an existing user');
		});

        it("Test choose the best reply by not registered user", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

			await expect(peeranha.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1))
            .to.be.revertedWith('Peeranha: must be an existing user');
		});

        it("Test choose own reply as the best reply for not own post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);

			await expect(peeranha.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1)).to.be.revertedWith('Only owner by post can change statust best reply');
		});

        it("Test choose the best reply for not own post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

			await expect(peeranha.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1)).to.be.revertedWith('Only owner by post can change statust best reply');
		});

        it("Test change post type by not registered user", async function () {
            const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);

			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			await expect(peeranha.connect(signers[1]).changePostType(signers[1].address, 1, PostTypeEnum.CommonPost))
            .to.be.revertedWith("Peeranha: must be an existing user");
        })

        it("Test change post type by common user", async function () {
            const peeranha = await createContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[1]);

			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

			await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);

			await expect(peeranha.connect(signers[1]).changePostType(signers[1].address, 1, PostTypeEnum.CommonPost))
            .to.be.revertedWith("not_allowed_change_type");
        })
    });

    describe("General admin", function () {

        it("Test delete post", async function () {
            const peeranha = await createContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

            await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1])

            const userOldRating = await peeranha.getUserRating(signers[1].address, 1) + StartRating;
            const adminOldRating = await peeranha.getUserRating(signers[0].address, 1) + StartRating;

            await peeranha.deletePost(peeranha.deployTransaction.from, 1);

            const userRating = await peeranha.getUserRating(signers[1].address, 1);
            const adminRating = await peeranha.getUserRating(signers[0].address, 1) + StartRating;

			expect((await peeranha.getPost(1)).isDeleted).to.be.true;
			expect(userRating).to.be.equal(userOldRating + ModeratorDeletePost);
			expect(adminRating).to.be.equal(adminOldRating);
        })

        it("Test delete reply", async function () {
            const peeranha = await createContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));

            await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1])
            await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);

            const userOldRating = await peeranha.getUserRating(signers[1].address, 1);
            const adminOldRating = await peeranha.getUserRating(signers[0].address, 1);

            await peeranha.deleteReply(peeranha.deployTransaction.from, 1, 1);

            const userRating = await peeranha.getUserRating(signers[1].address, 1);
            const adminRating = await peeranha.getUserRating(signers[0].address, 1);

			expect((await peeranha.getReply(1, 1)).isDeleted).to.be.true;
			expect(userRating).to.be.equal(userOldRating + ModeratorDeleteReply - FirstExpertReply - QuickExpertReply);
			expect(adminRating).to.be.equal(adminOldRating);
        })

        it("Test delete upvoted expert post", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.createUser(hashContainer[1]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    
            await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 0, 0, 1);
    
            const user = await peeranha.getUserRating(signers[1].address, 1);
            const userAction = await peeranha.getUserRating(peeranha.deployTransaction.from, 1) + StartRating;		
            await expect(user).to.equal(StartRating + UpvotedExpertPost);
            await expect(userAction).to.equal(StartRating);
    
            await peeranha.deletePost(peeranha.deployTransaction.from, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[1].address, 1);
            const newUserActionRating = await peeranha.getUserRating(peeranha.deployTransaction.from, 1) + StartRating;
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newUserActionRating).to.equal(StartRating);
        });
    
        it("Test delete upvoted common post", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.createUser(hashContainer[1]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    
            await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 0, 0, 1);
    
            const user = await peeranha.getUserRating(signers[1].address, 1);
            const userAction = await peeranha.getUserRating(peeranha.deployTransaction.from, 1) + StartRating;		
            await expect(user).to.equal(StartRating + UpvotedCommonPost);
            await expect(userAction).to.equal(StartRating);
    
            await peeranha.deletePost(peeranha.deployTransaction.from, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[1].address, 1);
            const newUserActionRating = await peeranha.getUserRating(peeranha.deployTransaction.from, 1) + StartRating;
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newUserActionRating).to.equal(StartRating);
        });
    
        it("Test delete downvoted expert post", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.createUser(hashContainer[1]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    
            await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 0, 0, 0);
    
            const user = await peeranha.getUserRating(signers[1].address, 1);
            const userAction = await peeranha.getUserRating(peeranha.deployTransaction.from, 1);		
            await expect(user).to.equal(StartRating + DownvotedExpertPost);
            await expect(userAction).to.equal(StartRating + DownvoteExpertPost);
    
            await peeranha.deletePost(peeranha.deployTransaction.from, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[1].address, 1);
            const newUserActionRating = await peeranha.getUserRating(peeranha.deployTransaction.from, 1);
            await expect(newUserRating).to.equal(StartRating + DownvotedExpertPost + ModeratorDeletePost);
            await expect(newUserActionRating).to.equal(StartRating + DownvoteExpertPost);
        });
    
        it("Test delete downvoted common post", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.createUser(hashContainer[1]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    
            await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 0, 0, 0);
    
            const user = await peeranha.getUserRating(signers[1].address, 1);
            const userAction = await peeranha.getUserRating(peeranha.deployTransaction.from, 1);		
            await expect(user).to.equal(StartRating + DownvotedCommonPost);
            await expect(userAction).to.equal(StartRating + DownvoteCommonPost);
    
            await peeranha.deletePost(peeranha.deployTransaction.from, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[1].address, 1);
            const newUserActionRating = await peeranha.getUserRating(peeranha.deployTransaction.from, 1);
            await expect(newUserRating).to.equal(StartRating + DownvotedCommonPost + ModeratorDeletePost);
            await expect(newUserActionRating).to.equal(StartRating + DownvoteCommonPost);
        });
    
        it("Test delete post after upvote expert reply", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.createUser(hashContainer[1]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    
            await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false);
            const userRating = await peeranha.getUserRating(signers[1].address, 1);
            const replierRating = await peeranha.getUserRating(signers[2].address, 1);
            const userActionRating = await peeranha.getUserRating(peeranha.deployTransaction.from, 1);
    
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 1, 0, 1);
    
            const user = await peeranha.getUserRating(signers[1].address, 1);
            const replier = await peeranha.getUserRating(signers[2].address, 1);
            const userAction = await peeranha.getUserRating(peeranha.deployTransaction.from, 1);		
            await expect(user).to.equal(userRating);
            await expect(replier).to.equal(replierRating + UpvotedExpertReply);
            await expect(userAction).to.equal(userActionRating);
    
            await peeranha.deletePost(peeranha.deployTransaction.from, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranha.getUserRating(signers[2].address, 1);
            const newUserActionRating = await peeranha.getUserRating(peeranha.deployTransaction.from, 1) + StartRating;
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating);
            await expect(newUserActionRating).to.equal(StartRating);
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
    
            await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false);
            const userRating = await peeranha.getUserRating(signers[1].address, 1);
            const replierRating = await peeranha.getUserRating(signers[2].address, 1);
            const userActionRating = await peeranha.getUserRating(peeranha.deployTransaction.from, 1);
    
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 1, 0, 1);
    
            const user = await peeranha.getUserRating(signers[1].address, 1);
            const replier = await peeranha.getUserRating(signers[2].address, 1);
            const userAction = await peeranha.getUserRating(peeranha.deployTransaction.from, 1);		
            await expect(user).to.equal(userRating);
            await expect(replier).to.equal(replierRating + UpvotedCommonReply);
            await expect(userAction).to.equal(userActionRating);
    
            await peeranha.deletePost(peeranha.deployTransaction.from, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranha.getUserRating(signers[2].address, 1);
            const newUserActionRating = await peeranha.getUserRating(peeranha.deployTransaction.from, 1) + StartRating;
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating);
            await expect(newUserActionRating).to.equal(StartRating);
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
    
            await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false);
            const userRating = await peeranha.getUserRating(signers[1].address, 1);
            const replierRating = await peeranha.getUserRating(signers[2].address, 1);
            const userActionRating = await peeranha.getUserRating(peeranha.deployTransaction.from, 1) + StartRating;
    
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 1, 0, 0);
    
            const user = await peeranha.getUserRating(signers[1].address, 1);
            const replier = await peeranha.getUserRating(signers[2].address, 1);
            const userAction = await peeranha.getUserRating(peeranha.deployTransaction.from, 1);		
            await expect(user).to.equal(userRating);
            await expect(replier).to.equal(replierRating + DownvotedExpertReply - FirstExpertReply - QuickExpertReply);
            await expect(userAction).to.equal(userActionRating + DownvoteExpertReply);
    
            await peeranha.deletePost(peeranha.deployTransaction.from, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranha.getUserRating(signers[2].address, 1);
            const newUserActionRating = await peeranha.getUserRating(peeranha.deployTransaction.from, 1);
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating + DownvotedExpertReply);
            await expect(newUserActionRating).to.equal(StartRating + DownvoteExpertReply);	
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
    
            await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false);
            const userRating = await peeranha.getUserRating(signers[1].address, 1);
            const replierRating = await peeranha.getUserRating(signers[2].address, 1);
            const userActionRating = await peeranha.getUserRating(peeranha.deployTransaction.from, 1) + StartRating;
    
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 1, 0, 0);
    
            const user = await peeranha.getUserRating(signers[1].address, 1);
            const replier = await peeranha.getUserRating(signers[2].address, 1);
            const userAction = await peeranha.getUserRating(peeranha.deployTransaction.from, 1);		
            await expect(user).to.equal(userRating);
            await expect(replier).to.equal(replierRating + DownvotedCommonReply - FirstCommonReply - QuickCommonReply);
            await expect(userAction).to.equal(userActionRating + DownvoteCommonReply);
    
            await peeranha.deletePost(peeranha.deployTransaction.from, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranha.getUserRating(signers[2].address, 1);
            const newUserActionRating = await peeranha.getUserRating(peeranha.deployTransaction.from, 1);
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating + DownvotedCommonReply);
            await expect(newUserActionRating).to.equal(StartRating + DownvoteCommonReply);
        });

        it("Test delete expert post after choosing reply as best", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.createUser(hashContainer[1]);
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    
            await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false);
            
            await peeranha.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);

            const userRating = await peeranha.getUserRating(signers[1].address, 1);
            const replierRating = await peeranha.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + AcceptedExpertReply);
            await expect(replierRating).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);

            await peeranha.deletePost(peeranha.deployTransaction.from, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranha.getUserRating(signers[2].address, 1);
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating);
        });
    
        it("Test delete common post after choosing reply as best", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.createUser(hashContainer[1]);
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    
            await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false);
            
            await peeranha.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);

            const userRating = await peeranha.getUserRating(signers[1].address, 1);
            const replierRating = await peeranha.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + AcceptedCommonReply);
            await expect(replierRating).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);

            await peeranha.deletePost(peeranha.deployTransaction.from, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranha.getUserRating(signers[2].address, 1);
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating);
        });
    
        it("Test delete 2 upVoted expert reply, one first and two quick ", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.createUser(hashContainer[1]);
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    
            await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
            await peeranha.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);
    
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 1, 0, 1);
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 2, 0, 1);
    
            await peeranha.deleteReply(peeranha.deployTransaction.from, 1, 1);
            await peeranha.deleteReply(peeranha.deployTransaction.from, 1, 2);
            
            const userRating = await peeranha.getUserRating(signers[1].address, 1);
            const userRating2 = await peeranha.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + ModeratorDeleteReply);
            await expect(userRating2).to.equal(StartRating + ModeratorDeleteReply);
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
    
            await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
            await peeranha.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);
    
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 1, 0, 1);
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 2, 0, 1);
    
            await peeranha.deleteReply(peeranha.deployTransaction.from, 1, 1);
            await peeranha.deleteReply(peeranha.deployTransaction.from, 1, 2);
            
            const userRating = await peeranha.getUserRating(signers[1].address, 1);
            const userRating2 = await peeranha.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + ModeratorDeleteReply);
            await expect(userRating2).to.equal(StartRating + ModeratorDeleteReply);
        });
    
        it("Test delete 2 downVoted expert reply, one first and two quick ", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.createUser(hashContainer[1]);
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    
            await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
            await peeranha.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);
    
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 1, 0, 0);
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 2, 0, 0);
    
            await peeranha.deleteReply(peeranha.deployTransaction.from, 1, 1);
            await peeranha.deleteReply(peeranha.deployTransaction.from, 1, 2);
            
            const userRating = await peeranha.getUserRating(signers[1].address, 1);
            const userRating2 = await peeranha.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + DownvotedExpertReply + ModeratorDeleteReply);
            await expect(userRating2).to.equal(StartRating + DownvotedExpertReply + ModeratorDeleteReply);
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
    
            await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
            await peeranha.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);
    
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 1, 0, 0);
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 2, 0, 0);
    
            await peeranha.deleteReply(peeranha.deployTransaction.from, 1, 1);
            await peeranha.deleteReply(peeranha.deployTransaction.from, 1, 2);
            
            const userRating = await peeranha.getUserRating(signers[1].address, 1);
            const userRating2 = await peeranha.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + DownvotedCommonReply + ModeratorDeleteReply);
            await expect(userRating2).to.equal(StartRating + DownvotedCommonReply + ModeratorDeleteReply);
        });

        it("Test delete expert reply as best", async function () { // delete best reply?
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.createUser(hashContainer[1]);
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    
            await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false);
            
            await peeranha.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);

            const userRating = await peeranha.getUserRating(signers[1].address, 1);
            const replierRating = await peeranha.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + AcceptedExpertReply);
            await expect(replierRating).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);

            await peeranha.deleteReply(peeranha.deployTransaction.from, 1, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranha.getUserRating(signers[2].address, 1);
            await expect(newUserRating).to.equal(StartRating);
            await expect(newReplierRating).to.equal(StartRating + ModeratorDeleteReply);
        });
    
        it("Test delete common reply as best", async function () { // delete best reply?
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.createUser(hashContainer[1]);
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    
            await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false);
            
            await peeranha.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);

            const userRating = await peeranha.getUserRating(signers[1].address, 1);
            const replierRating = await peeranha.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + AcceptedCommonReply);
            await expect(replierRating).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);

            await peeranha.deleteReply(peeranha.deployTransaction.from, 1, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranha.getUserRating(signers[2].address, 1);
            await expect(newUserRating).to.equal(StartRating);
            await expect(newReplierRating).to.equal(StartRating + ModeratorDeleteReply);
        });
        
        it("Test delete comments", async function () {
            const peeranha = await createContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.addUserRating(signers[1].address, 25, 1);

            await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1])
            await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

            await peeranha.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[0]);
            await peeranha.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[0]);

            const userOldRating = await peeranha.getUserRating(signers[1].address, 1);
            const adminOldRating = await peeranha.getUserRating(signers[0].address, 1);

            await peeranha.deleteComment(peeranha.deployTransaction.from, 1, 0, 1);
            await peeranha.deleteComment(peeranha.deployTransaction.from, 1, 1, 1);

            const userRating = await peeranha.getUserRating(signers[1].address, 1);
            const adminRating = await peeranha.getUserRating(signers[0].address, 1);

			expect((await peeranha.getComment(1, 0, 1)).isDeleted).to.be.true;
			expect((await peeranha.getComment(1, 1, 1)).isDeleted).to.be.true;
			expect(userRating).to.be.equal(userOldRating + ModeratorDeleteComment + ModeratorDeleteComment);
			expect(adminRating).to.be.equal(adminOldRating);
        })
    })

    describe("Community admin", function () {

        it("Test delete post", async function () {
            const peeranha = await createContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.giveCommunityAdminPermission(signers[1].address, 1);

            await peeranha.connect(signers[2]).createPost(signers[2].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1])

            const userOldRating = await peeranha.getUserRating(signers[2].address, 1) + StartRating;
            const adminOldRating = await peeranha.getUserRating(signers[1].address, 1);

            await peeranha.connect(signers[1]).deletePost(signers[1].address, 1);

            const userRating = await peeranha.getUserRating(signers[2].address, 1);
            const adminRating = await peeranha.getUserRating(signers[1].address, 1);

			expect((await peeranha.getPost(1)).isDeleted).to.be.true;
			expect(userRating).to.be.equal(userOldRating + ModeratorDeletePost);
			expect(adminRating).to.be.equal(adminOldRating);
        })

        it("Test delete reply", async function () {
            const peeranha = await createContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.giveCommunityAdminPermission(signers[1].address, 1);

            await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1])
            await peeranha.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false);

            const userOldRating = await peeranha.getUserRating(signers[2].address, 1);
            const adminOldRating = await peeranha.getUserRating(signers[1].address, 1);

            await peeranha.connect(signers[1]).deleteReply(signers[1].address, 1, 1);

            const userRating = await peeranha.getUserRating(signers[2].address, 1);
            const adminRating = await peeranha.getUserRating(signers[1].address, 1);

			expect((await peeranha.getReply(1, 1)).isDeleted).to.be.true;
			expect(userRating).to.be.equal(userOldRating + ModeratorDeleteReply - FirstExpertReply - QuickExpertReply);
			expect(adminRating).to.be.equal(adminOldRating);
        })

        it("Test delete upvoted expert post", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.createUser(hashContainer[1]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.giveCommunityAdminPermission(signers[2].address, 1);

            await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 0, 0, 1);
    
            const user = await peeranha.getUserRating(signers[1].address, 1);
            const admin = await peeranha.getUserRating(signers[2].address, 1) + StartRating;
            const userAction = await peeranha.getUserRating(peeranha.deployTransaction.from, 1) + StartRating;		
            await expect(user).to.equal(StartRating + UpvotedExpertPost);
            await expect(admin).to.equal(StartRating);
            await expect(userAction).to.equal(StartRating);
    
            await peeranha.connect(signers[2]).deletePost(signers[2].address, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[1].address, 1);
            const newAdminRating = await peeranha.getUserRating(signers[2].address, 1) + StartRating;
            const newUserActionRating = await peeranha.getUserRating(peeranha.deployTransaction.from, 1) + StartRating;
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newAdminRating).to.equal(StartRating);
            await expect(newUserActionRating).to.equal(StartRating);
        });
    
        it("Test delete upvoted common post", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.createUser(hashContainer[1]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.giveCommunityAdminPermission(signers[2].address, 1);

    
            await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 0, 0, 1);
    
            const user = await peeranha.getUserRating(signers[1].address, 1);
            const admin = await peeranha.getUserRating(signers[2].address, 1) + StartRating;
            const userAction = await peeranha.getUserRating(peeranha.deployTransaction.from, 1) + StartRating;		
            await expect(user).to.equal(StartRating + UpvotedCommonPost);
            await expect(admin).to.equal(StartRating);
            await expect(userAction).to.equal(StartRating);
    
            await peeranha.connect(signers[2]).deletePost(signers[2].address, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[1].address, 1);
            const newAdminRating = await peeranha.getUserRating(signers[2].address, 1) + StartRating;
            const newUserActionRating = await peeranha.getUserRating(peeranha.deployTransaction.from, 1) + StartRating;
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newAdminRating).to.equal(StartRating);
            await expect(newUserActionRating).to.equal(StartRating);
        });

        it("Test delete downvoted expert post", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.createUser(hashContainer[1]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.giveCommunityAdminPermission(signers[2].address, 1);
    
            await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 0, 0, 0);
    
            const user = await peeranha.getUserRating(signers[1].address, 1);
            const admin = await peeranha.getUserRating(signers[2].address, 1) + StartRating;
            const userAction = await peeranha.getUserRating(peeranha.deployTransaction.from, 1);		
            await expect(user).to.equal(StartRating + DownvotedExpertPost);
            await expect(admin).to.equal(StartRating);
            await expect(userAction).to.equal(StartRating + DownvoteExpertPost);
    
            await peeranha.connect(signers[2]).deletePost(signers[2].address, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[1].address, 1);
            const newAdminRating = await peeranha.getUserRating(signers[2].address, 1) + StartRating;
            const newUserActionRating = await peeranha.getUserRating(peeranha.deployTransaction.from, 1);
            await expect(newUserRating).to.equal(StartRating + DownvotedExpertPost + ModeratorDeletePost);
            await expect(newAdminRating).to.equal(StartRating);
            await expect(newUserActionRating).to.equal(StartRating + DownvoteExpertPost);
        });
    
        it("Test delete downvoted common post", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.createUser(hashContainer[1]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.giveCommunityAdminPermission(signers[2].address, 1);
    
            await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 0, 0, 0);
    
            const user = await peeranha.getUserRating(signers[1].address, 1);
            const admin = await peeranha.getUserRating(signers[2].address, 1) + StartRating;
            const userAction = await peeranha.getUserRating(peeranha.deployTransaction.from, 1);		
            await expect(user).to.equal(StartRating + DownvotedCommonPost);
            await expect(admin).to.equal(StartRating);
            await expect(userAction).to.equal(StartRating + DownvoteCommonPost);
    
            await peeranha.connect(signers[2]).deletePost(signers[2].address, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[1].address, 1);
            const newAdminRating = await peeranha.getUserRating(signers[2].address, 1) + StartRating;
            const newUserActionRating = await peeranha.getUserRating(peeranha.deployTransaction.from, 1);
            await expect(newUserRating).to.equal(StartRating + DownvotedCommonPost + ModeratorDeletePost);
            await expect(newAdminRating).to.equal(StartRating);
            await expect(newUserActionRating).to.equal(StartRating + DownvoteCommonPost);
        });
    
        it("Test delete post after upvote expert reply", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.connect(signers[3]).createUser(hashContainer[0]);
            await peeranha.createUser(hashContainer[1]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.giveCommunityAdminPermission(signers[3].address, 1);
    
            await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false);
    
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 1, 0, 1);
    
            const user = await peeranha.getUserRating(signers[1].address, 1) + StartRating;
            const replier = await peeranha.getUserRating(signers[2].address, 1);
            const admin = await peeranha.getUserRating(signers[3].address, 1) + StartRating;
            const userAction = await peeranha.getUserRating(peeranha.deployTransaction.from, 1) + StartRating;		
            await expect(user).to.equal(StartRating);
            await expect(admin).to.equal(StartRating);
            await expect(replier).to.equal(StartRating + UpvotedExpertReply + FirstExpertReply + QuickExpertReply);
            await expect(userAction).to.equal(StartRating);
    
            await peeranha.deletePost(peeranha.deployTransaction.from, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranha.getUserRating(signers[2].address, 1);
            const newAdminRating = await peeranha.getUserRating(signers[3].address, 1) + StartRating;
            const newUserActionRating = await peeranha.getUserRating(peeranha.deployTransaction.from, 1) + StartRating;
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating);
            await expect(newAdminRating).to.equal(StartRating);
            await expect(newUserActionRating).to.equal(StartRating);
        });
    
        it("Test delete post after upvote common reply", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.connect(signers[3]).createUser(hashContainer[0]);
            await peeranha.createUser(hashContainer[1]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.giveCommunityAdminPermission(signers[3].address, 1);
    
            await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false);
    
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 1, 0, 1);
    
            const user = await peeranha.getUserRating(signers[1].address, 1) + StartRating;
            const replier = await peeranha.getUserRating(signers[2].address, 1);
            const admin = await peeranha.getUserRating(signers[3].address, 1) + StartRating;
            const userAction = await peeranha.getUserRating(peeranha.deployTransaction.from, 1) + StartRating;		
            await expect(user).to.equal(StartRating);
            await expect(admin).to.equal(StartRating);
            await expect(replier).to.equal(StartRating + UpvotedCommonReply + FirstCommonReply + QuickCommonReply);
            await expect(userAction).to.equal(StartRating);
    
            await peeranha.deletePost(peeranha.deployTransaction.from, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranha.getUserRating(signers[2].address, 1);
            const newAdminRating = await peeranha.getUserRating(signers[3].address, 1) + StartRating;
            const newUserActionRating = await peeranha.getUserRating(peeranha.deployTransaction.from, 1) + StartRating;
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating);
            await expect(newAdminRating).to.equal(StartRating) + StartRating;
            await expect(newUserActionRating).to.equal(StartRating) + StartRating;
        });
    
        it("Test delete post after downvote expert reply", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.connect(signers[3]).createUser(hashContainer[0]);
            await peeranha.createUser(hashContainer[1]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.giveCommunityAdminPermission(signers[3].address, 1);
    
            await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false);
    
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 1, 0, 0);
    
            const user = await peeranha.getUserRating(signers[1].address, 1) + StartRating;
            const replier = await peeranha.getUserRating(signers[2].address, 1);
            const admin = await peeranha.getUserRating(signers[3].address, 1) + StartRating;
            const userAction = await peeranha.getUserRating(peeranha.deployTransaction.from, 1);		
            await expect(user).to.equal(StartRating);
            await expect(replier).to.equal(StartRating + DownvotedExpertReply);
            await expect(admin).to.equal(StartRating);
            await expect(userAction).to.equal(StartRating + DownvoteExpertReply);
    
            await peeranha.deletePost(peeranha.deployTransaction.from, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranha.getUserRating(signers[2].address, 1);
            const newAdminRating = await peeranha.getUserRating(signers[3].address, 1) + StartRating;
            const newUserActionRating = await peeranha.getUserRating(peeranha.deployTransaction.from, 1);
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating + DownvotedExpertReply);
            await expect(newAdminRating).to.equal(StartRating);
            await expect(newUserActionRating).to.equal(StartRating + DownvoteExpertReply);	
        });
    
        it("Test delete post after downvote common reply", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.connect(signers[3]).createUser(hashContainer[0]);
            await peeranha.createUser(hashContainer[1]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.giveCommunityAdminPermission(signers[3].address, 1);
    
            await peeranha.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false);
    
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 1, 0, 0);
    
            const user = await peeranha.getUserRating(signers[1].address, 1) + StartRating;
            const replier = await peeranha.getUserRating(signers[2].address, 1);
            const admin = await peeranha.getUserRating(signers[3].address, 1) + StartRating;
            const userAction = await peeranha.getUserRating(peeranha.deployTransaction.from, 1);		
            await expect(user).to.equal(StartRating);
            await expect(replier).to.equal(StartRating + DownvotedCommonReply);
            await expect(admin).to.equal(StartRating);
            await expect(userAction).to.equal(StartRating + DownvoteCommonReply);
    
            await peeranha.deletePost(peeranha.deployTransaction.from, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranha.getUserRating(signers[2].address, 1);
            const newAdminRating = await peeranha.getUserRating(signers[3].address, 1) + StartRating;
            const newUserActionRating = await peeranha.getUserRating(peeranha.deployTransaction.from, 1);
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating + DownvotedCommonReply);
            await expect(newAdminRating).to.equal(StartRating);
            await expect(newUserActionRating).to.equal(StartRating + DownvoteCommonReply);
        });

        it("Test delete expert post after choosing reply as best", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.createUser(hashContainer[1]);
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.giveCommunityAdminPermission(signers[2].address, 1);
    
            await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
            
            await peeranha.changeStatusBestReply(peeranha.deployTransaction.from, 1, 1);

            const userRating = await peeranha.getUserRating(signers[0].address, 1);
            const replierRating = await peeranha.getUserRating(signers[1].address, 1);
            await expect(userRating).to.equal(StartRating + AcceptedExpertReply);
            await expect(replierRating).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);

            await peeranha.connect(signers[2]).deletePost(signers[2].address, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[0].address, 1);
            const newReplierRating = await peeranha.getUserRating(signers[1].address, 1);
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating);
        });
    
        it("Test delete common post after choosing reply as best", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.createUser(hashContainer[1]);
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.giveCommunityAdminPermission(signers[2].address, 1);
    
            await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
            
            await peeranha.changeStatusBestReply(peeranha.deployTransaction.from, 1, 1);

            const userRating = await peeranha.getUserRating(signers[0].address, 1);
            const replierRating = await peeranha.getUserRating(signers[1].address, 1);
            await expect(userRating).to.equal(StartRating + AcceptedCommonReply);
            await expect(replierRating).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);

            await peeranha.connect(signers[2]).deletePost(signers[2].address, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[0].address, 1);
            const newReplierRating = await peeranha.getUserRating(signers[1].address, 1);
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating);
        });
    
        it("Test delete 2 upVoted expert reply, one first and two quick ", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.createUser(hashContainer[1]);
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.connect(signers[3]).createUser(hashContainer[0]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.giveCommunityAdminPermission(signers[3].address, 1);
    
            await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
            await peeranha.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);
    
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 1, 0, 1);
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 2, 0, 1);
    
            await peeranha.connect(signers[3]).deleteReply(signers[3].address, 1, 1);
            await peeranha.connect(signers[3]).deleteReply(signers[3].address, 1, 2);
            
            const userRating = await peeranha.getUserRating(signers[1].address, 1);
            const userRating2 = await peeranha.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + ModeratorDeleteReply);
            await expect(userRating2).to.equal(StartRating + ModeratorDeleteReply);
        });
    
        it("Test delete 2 upVoted common reply, one first and two quick ", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.createUser(hashContainer[1]);
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.connect(signers[3]).createUser(hashContainer[0]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.giveCommunityAdminPermission(signers[3].address, 1);
    
            await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
            await peeranha.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);
    
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 1, 0, 1);
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 2, 0, 1);
    
            await peeranha.connect(signers[3]).deleteReply(signers[3].address, 1, 1);
            await peeranha.connect(signers[3]).deleteReply(signers[3].address, 1, 2);
            
            const userRating = await peeranha.getUserRating(signers[1].address, 1);
            const userRating2 = await peeranha.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + ModeratorDeleteReply);
            await expect(userRating2).to.equal(StartRating + ModeratorDeleteReply);
        });
    
        it("Test delete 2 downVoted expert reply, one first and two quick ", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.createUser(hashContainer[1]);
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.connect(signers[3]).createUser(hashContainer[0]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.giveCommunityAdminPermission(signers[3].address, 1);
    
            await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
            await peeranha.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);
    
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 1, 0, 0);
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 2, 0, 0);
    
            await peeranha.connect(signers[3]).deleteReply(signers[3].address, 1, 1);
            await peeranha.connect(signers[3]).deleteReply(signers[3].address, 1, 2);
            
            const userRating = await peeranha.getUserRating(signers[1].address, 1);
            const userRating2 = await peeranha.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + DownvotedExpertReply + ModeratorDeleteReply);
            await expect(userRating2).to.equal(StartRating + DownvotedExpertReply + ModeratorDeleteReply);
        });
    
        it("Test delete 2 downVoted common reply, one first and two quick ", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.createUser(hashContainer[1]);
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.connect(signers[3]).createUser(hashContainer[0]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.giveCommunityAdminPermission(signers[3].address, 1);
    
            await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
            await peeranha.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false);
    
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 1, 0, 0);
            await peeranha.voteItem(peeranha.deployTransaction.from, 1, 2, 0, 0);
    
            await peeranha.connect(signers[3]).deleteReply(signers[3].address, 1, 1);
            await peeranha.connect(signers[3]).deleteReply(signers[3].address, 1, 2);
            
            const userRating = await peeranha.getUserRating(signers[1].address, 1);
            const userRating2 = await peeranha.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + DownvotedCommonReply + ModeratorDeleteReply);
            await expect(userRating2).to.equal(StartRating + DownvotedCommonReply + ModeratorDeleteReply);
        });

        it("Test delete expert reply as best", async function () {  // delete best reply
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.createUser(hashContainer[1]);
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.giveCommunityAdminPermission(signers[2].address, 1);
    
            await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
            
            await peeranha.changeStatusBestReply(peeranha.deployTransaction.from, 1, 1);

            const userRating = await peeranha.getUserRating(signers[0].address, 1);
            const replierRating = await peeranha.getUserRating(signers[1].address, 1);
            await expect(userRating).to.equal(StartRating + AcceptedExpertReply);
            await expect(replierRating).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);

            await peeranha.connect(signers[2]).deleteReply(signers[2].address, 1, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[0].address, 1);
            const newReplierRating = await peeranha.getUserRating(signers[1].address, 1);
            await expect(newUserRating).to.equal(StartRating);
            await expect(newReplierRating).to.equal(StartRating + ModeratorDeleteReply);
        });
    
        it("Test delete common reply as best", async function () {      // delete best reply?
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.createUser(hashContainer[1]);
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.giveCommunityAdminPermission(signers[2].address, 1);
    
            await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false);
            
            await peeranha.changeStatusBestReply(peeranha.deployTransaction.from, 1, 1);

            const userRating = await peeranha.getUserRating(signers[0].address, 1);
            const replierRating = await peeranha.getUserRating(signers[1].address, 1);
            await expect(userRating).to.equal(StartRating + AcceptedCommonReply);
            await expect(replierRating).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);

            await peeranha.connect(signers[2]).deleteReply(signers[2].address, 1, 1);
    
            const newUserRating = await peeranha.getUserRating(signers[0].address, 1);
            const newReplierRating = await peeranha.getUserRating(signers[1].address, 1);
            await expect(newUserRating).to.equal(StartRating);
            await expect(newReplierRating).to.equal(StartRating + ModeratorDeleteReply);
        });
        
        it("Test delete comments", async function () {
            const peeranha = await createContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.connect(signers[2]).createUser(hashContainer[0]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.giveCommunityAdminPermission(signers[1].address, 1);
            await peeranha.addUserRating(signers[2].address, 25, 1);

            await peeranha.createPost(peeranha.deployTransaction.from, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1])
            await peeranha.createReply(peeranha.deployTransaction.from, 1, 0, hashContainer[1], false);

            await peeranha.connect(signers[2]).createComment(signers[2].address, 1, 0, hashContainer[0]);
            await peeranha.connect(signers[2]).createComment(signers[2].address, 1, 1, hashContainer[0]);

            const userOldRating = await peeranha.getUserRating(signers[2].address, 1);
            const adminOldRating = await peeranha.getUserRating(signers[1].address, 1);

            await peeranha.connect(signers[1]).deleteComment(signers[1].address, 1, 0, 1);
            await peeranha.connect(signers[1]).deleteComment(signers[1].address, 1, 1, 1);

            const userRating = await peeranha.getUserRating(signers[2].address, 1);
            const adminRating = await peeranha.getUserRating(signers[1].address, 1);

			expect((await peeranha.getComment(1, 0, 1)).isDeleted).to.be.true;
			expect((await peeranha.getComment(1, 1, 1)).isDeleted).to.be.true;
			expect(userRating).to.be.equal(userOldRating + ModeratorDeleteComment + ModeratorDeleteComment);
			expect(adminRating).to.be.equal(adminOldRating);
        });
    });
});
