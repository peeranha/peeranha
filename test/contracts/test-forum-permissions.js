const { expect } = require("chai");
const crypto = require("crypto");
const PostTypeEnum = {"ExpertPost":0, "CommonPost":1, "Tutorial":2}

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

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(1, 0, hashContainer[1], false);

			await expect(peeranha.connect(signers[1]).createComment(1, 0, hashContainer[0]))
            .to.be.revertedWith('Your rating is too small for publication comment. You need 35 ratings');
            await expect(peeranha.connect(signers[1]).createComment(1, 1, hashContainer[0]))
            .to.be.revertedWith('Your rating is too small for publication comment. You need 35 ratings');

            await peeranha.addUserRating(signers[1].address, 24);
            await expect(peeranha.connect(signers[1]).createComment(1, 0, hashContainer[0]))
            .to.be.revertedWith('Your rating is too small for publication comment. You need 35 ratings');
            await expect(peeranha.connect(signers[1]).createComment(1, 1, hashContainer[0]))
            .to.be.revertedWith('Your rating is too small for publication comment. You need 35 ratings');

            await peeranha.addUserRating(signers[1].address, 1);
            await peeranha.connect(signers[1]).createComment(1, 0, hashContainer[0]);
            await peeranha.connect(signers[1]).createComment(1, 1, hashContainer[0]);

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

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(1, 0, hashContainer[1], false);

			await expect(peeranha.connect(signers[1]).voteItem(1, 0, 0, 1))
            .to.be.revertedWith('Your rating is too small for upvote post. You need 35 ratings');
            await expect(peeranha.connect(signers[1]).voteItem(1, 1, 0, 1))
            .to.be.revertedWith('Your rating is too small for upvote reply. You need 35 ratings');

            await peeranha.addUserRating(signers[1].address, 24);
            await expect(peeranha.connect(signers[1]).voteItem(1, 0, 0, 1))
            .to.be.revertedWith('Your rating is too small for upvote post. You need 35 ratings');
            await expect(peeranha.connect(signers[1]).voteItem(1, 1, 0, 1))
            .to.be.revertedWith('Your rating is too small for upvote reply. You need 35 ratings');

            await peeranha.addUserRating(signers[1].address, 1);
            await peeranha.connect(signers[1]).voteItem(1, 0, 0, 1);
            await peeranha.connect(signers[1]).voteItem(1, 1, 0, 1);

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

			await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
			await peeranha.createReply(1, 0, hashContainer[1], false);

			await expect(peeranha.connect(signers[1]).voteItem(1, 0, 0, 0))
            .to.be.revertedWith('Your rating is too small for downvote post. You need 100 ratings');
            await expect(peeranha.connect(signers[1]).voteItem(1, 1, 0, 0))
            .to.be.revertedWith('Your rating is too small for downvote reply. You need 100 ratings');

            await peeranha.addUserRating(signers[1].address, 89);
            await expect(peeranha.connect(signers[1]).voteItem(1, 0, 0, 0))
            .to.be.revertedWith('Your rating is too small for downvote post. You need 100 ratings');
            await expect(peeranha.connect(signers[1]).voteItem(1, 1, 0, 0))
            .to.be.revertedWith('Your rating is too small for downvote reply. You need 100 ratings');

            await peeranha.addUserRating(signers[1].address, 1);
            await peeranha.connect(signers[1]).voteItem(1, 0, 0, 0);
            await peeranha.addUserRating(signers[1].address, 1);
            await peeranha.connect(signers[1]).voteItem(1, 1, 0, 0);

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
            await peeranha.addUserRating(signers[1].address, -11);
            await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1])

			await expect(peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]))
            .to.be.revertedWith('Your rating is too small for publication post. You need 0 ratings');
			await expect(peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false))
            .to.be.revertedWith('Your rating is too small for publication reply. You need 0 ratings');
		});

        it("Test vote item by not registered user", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.createReply(1, 0, hashContainer[1], false);

			await expect(peeranha.connect(signers[1]).voteItem(1, 0, 0, 1))
            .to.be.revertedWith('Peeranha: must be an existing user');
			await expect(peeranha.connect(signers[1]).voteItem(1, 1, 0, 1))
            .to.be.revertedWith('Peeranha: must be an existing user');
		});

        it("Test choose the best reply by not registered user", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.createReply(1, 0, hashContainer[1], false);

			await expect(peeranha.connect(signers[1]).changeStatusBestReply(1, 1))
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
            await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);

			await expect(peeranha.connect(signers[1]).changeStatusBestReply(1, 1)).to.be.revertedWith('You can mark the reply as the best, it is not your');
		});

        it("Test choose the best reply for not own post", async function () {
			const peeranha = await createContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[1]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.createReply(1, 0, hashContainer[1], false);

			await expect(peeranha.connect(signers[1]).changeStatusBestReply(1, 1)).to.be.revertedWith('You can mark the reply as the best, it is not your');
		});
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

            await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1])

            const userOldRating = (await peeranha.getUserByAddress(signers[1].address)).rating;
            const adminOldRating = (await peeranha.getUserByAddress(signers[0].address)).rating;

            await peeranha.deletePost(1);

            const userRating = (await peeranha.getUserByAddress(signers[1].address)).rating;
            const adminRating = (await peeranha.getUserByAddress(signers[0].address)).rating;

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

            await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1])
            await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);

            const userOldRating = (await peeranha.getUserByAddress(signers[1].address)).rating;
            const adminOldRating = (await peeranha.getUserByAddress(signers[0].address)).rating;

            await peeranha.deleteReply(1, 1);

            const userRating = (await peeranha.getUserByAddress(signers[1].address)).rating;
            const adminRating = (await peeranha.getUserByAddress(signers[0].address)).rating;

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
    
            await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.voteItem(1, 0, 0, 1);
    
            const user = await peeranha.getUserByAddress(signers[1].address);
            const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
            await expect(user.rating).to.equal(StartRating + UpvotedExpertPost);
            await expect(userAction.rating).to.equal(StartRating);
    
            await peeranha.deletePost(1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[1].address);
            const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
            await expect(newUserRating.rating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newUserActionRating.rating).to.equal(StartRating);
        });
    
        it("Test delete upvoted common post", async function () {
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
    
            await peeranha.deletePost(1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[1].address);
            const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
            await expect(newUserRating.rating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newUserActionRating.rating).to.equal(StartRating);
        });
    
        it("Test delete downvoted expert post", async function () {
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
    
            await peeranha.deletePost(1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[1].address);
            const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
            await expect(newUserRating.rating).to.equal(StartRating + DownvotedExpertPost + ModeratorDeletePost);
            await expect(newUserActionRating.rating).to.equal(StartRating + DownvoteExpertPost);
        });
    
        it("Test delete downvoted common post", async function () {
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
    
            await peeranha.deletePost(1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[1].address);
            const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
            await expect(newUserRating.rating).to.equal(StartRating + DownvotedCommonPost + ModeratorDeletePost);
            await expect(newUserActionRating.rating).to.equal(StartRating + DownvoteCommonPost);
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
    
            await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
            const userRating = await peeranha.getUserByAddress(signers[1].address);
            const replierRating = await peeranha.getUserByAddress(signers[2].address);
            const userActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
    
            await peeranha.voteItem(1, 1, 0, 1);
    
            const user = await peeranha.getUserByAddress(signers[1].address);
            const replier = await peeranha.getUserByAddress(signers[2].address);
            const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
            await expect(user.rating).to.equal(userRating.rating);
            await expect(replier.rating).to.equal(replierRating.rating + UpvotedExpertReply);
            await expect(userAction.rating).to.equal(userActionRating.rating);
    
            await peeranha.deletePost(1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[1].address);
            const newReplierRating = await peeranha.getUserByAddress(signers[2].address);
            const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
            await expect(newUserRating.rating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating.rating).to.equal(StartRating);
            await expect(newUserActionRating.rating).to.equal(StartRating);
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
    
            await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
            const userRating = await peeranha.getUserByAddress(signers[1].address);
            const replierRating = await peeranha.getUserByAddress(signers[2].address);
            const userActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
    
            await peeranha.voteItem(1, 1, 0, 1);
    
            const user = await peeranha.getUserByAddress(signers[1].address);
            const replier = await peeranha.getUserByAddress(signers[2].address);
            const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
            await expect(user.rating).to.equal(userRating.rating);
            await expect(replier.rating).to.equal(replierRating.rating + UpvotedCommonReply);
            await expect(userAction.rating).to.equal(userActionRating.rating);
    
            await peeranha.deletePost(1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[1].address);
            const newReplierRating = await peeranha.getUserByAddress(signers[2].address);
            const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
            await expect(newUserRating.rating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating.rating).to.equal(StartRating);
            await expect(newUserActionRating.rating).to.equal(StartRating);
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
    
            await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
            const userRating = await peeranha.getUserByAddress(signers[1].address);
            const replierRating = await peeranha.getUserByAddress(signers[2].address);
            const userActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
    
            await peeranha.voteItem(1, 1, 0, 0);
    
            const user = await peeranha.getUserByAddress(signers[1].address);
            const replier = await peeranha.getUserByAddress(signers[2].address);
            const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
            await expect(user.rating).to.equal(userRating.rating);
            await expect(replier.rating).to.equal(replierRating.rating + DownvotedExpertReply - FirstExpertReply - QuickExpertReply);
            await expect(userAction.rating).to.equal(userActionRating.rating + DownvoteExpertReply);
    
            await peeranha.deletePost(1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[1].address);
            const newReplierRating = await peeranha.getUserByAddress(signers[2].address);
            const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
            await expect(newUserRating.rating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating.rating).to.equal(StartRating + DownvotedExpertReply);
            await expect(newUserActionRating.rating).to.equal(StartRating + DownvoteExpertReply);	
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
    
            await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
            const userRating = await peeranha.getUserByAddress(signers[1].address);
            const replierRating = await peeranha.getUserByAddress(signers[2].address);
            const userActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
    
            await peeranha.voteItem(1, 1, 0, 0);
    
            const user = await peeranha.getUserByAddress(signers[1].address);
            const replier = await peeranha.getUserByAddress(signers[2].address);
            const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
            await expect(user.rating).to.equal(userRating.rating);
            await expect(replier.rating).to.equal(replierRating.rating + DownvotedCommonReply - FirstCommonReply - QuickCommonReply);
            await expect(userAction.rating).to.equal(userActionRating.rating + DownvoteCommonReply);
    
            await peeranha.deletePost(1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[1].address);
            const newReplierRating = await peeranha.getUserByAddress(signers[2].address);
            const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
            await expect(newUserRating.rating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating.rating).to.equal(StartRating + DownvotedCommonReply);
            await expect(newUserActionRating.rating).to.equal(StartRating + DownvoteCommonReply);
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
    
            await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
            
            await peeranha.connect(signers[1]).changeStatusBestReply(1, 1);

            const userRating = await peeranha.getUserByAddress(signers[1].address);
            const replierRating = await peeranha.getUserByAddress(signers[2].address);
            await expect(userRating.rating).to.equal(StartRating + AcceptExpertPost);
            await expect(replierRating.rating).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);

            await peeranha.deletePost(1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[1].address);
            const newReplierRating = await peeranha.getUserByAddress(signers[2].address);
            await expect(newUserRating.rating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating.rating).to.equal(StartRating);
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
    
            await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
            
            await peeranha.connect(signers[1]).changeStatusBestReply(1, 1);

            const userRating = await peeranha.getUserByAddress(signers[1].address);
            const replierRating = await peeranha.getUserByAddress(signers[2].address);
            await expect(userRating.rating).to.equal(StartRating + AcceptCommonPost);
            await expect(replierRating.rating).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);

            await peeranha.deletePost(1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[1].address);
            const newReplierRating = await peeranha.getUserByAddress(signers[2].address);
            await expect(newUserRating.rating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating.rating).to.equal(StartRating);
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
    
            await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
            await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
    
            await peeranha.voteItem(1, 1, 0, 1);
            await peeranha.voteItem(1, 2, 0, 1);
    
            await peeranha.deleteReply(1, 1);
            await peeranha.deleteReply(1, 2);
            
            const userRating = await peeranha.getUserByAddress(signers[1].address);
            const userRating2 = await peeranha.getUserByAddress(signers[2].address);
            await expect(userRating.rating).to.equal(StartRating + ModeratorDeleteReply);
            await expect(userRating2.rating).to.equal(StartRating + ModeratorDeleteReply);
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
    
            await peeranha.deleteReply(1, 1);
            await peeranha.deleteReply(1, 2);
            
            const userRating = await peeranha.getUserByAddress(signers[1].address);
            const userRating2 = await peeranha.getUserByAddress(signers[2].address);
            await expect(userRating.rating).to.equal(StartRating + ModeratorDeleteReply);
            await expect(userRating2.rating).to.equal(StartRating + ModeratorDeleteReply);
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
    
            await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
            await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
    
            await peeranha.voteItem(1, 1, 0, 0);
            await peeranha.voteItem(1, 2, 0, 0);
    
            await peeranha.deleteReply(1, 1);
            await peeranha.deleteReply(1, 2);
            
            const userRating = await peeranha.getUserByAddress(signers[1].address);
            const userRating2 = await peeranha.getUserByAddress(signers[2].address);
            await expect(userRating.rating).to.equal(StartRating + DownvotedExpertReply + ModeratorDeleteReply);
            await expect(userRating2.rating).to.equal(StartRating + DownvotedExpertReply + ModeratorDeleteReply);
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
    
            await peeranha.deleteReply(1, 1);
            await peeranha.deleteReply(1, 2);
            
            const userRating = await peeranha.getUserByAddress(signers[1].address);
            const userRating2 = await peeranha.getUserByAddress(signers[2].address);
            await expect(userRating.rating).to.equal(StartRating + DownvotedCommonReply + ModeratorDeleteReply);
            await expect(userRating2.rating).to.equal(StartRating + DownvotedCommonReply + ModeratorDeleteReply);
        });

        it("Test delete expert reply as best", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.createUser(hashContainer[1]);
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    
            await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
            
            await peeranha.connect(signers[1]).changeStatusBestReply(1, 1);

            const userRating = await peeranha.getUserByAddress(signers[1].address);
            const replierRating = await peeranha.getUserByAddress(signers[2].address);
            await expect(userRating.rating).to.equal(StartRating + AcceptExpertPost);
            await expect(replierRating.rating).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);

            await peeranha.deleteReply(1, 1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[1].address);
            const newReplierRating = await peeranha.getUserByAddress(signers[2].address);
            await expect(newUserRating.rating).to.equal(StartRating);
            await expect(newReplierRating.rating).to.equal(StartRating + ModeratorDeleteReply);
        });
    
        it("Test delete common reply as best", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.createUser(hashContainer[1]);
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
    
            await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
            
            await peeranha.connect(signers[1]).changeStatusBestReply(1, 1);

            const userRating = await peeranha.getUserByAddress(signers[1].address);
            const replierRating = await peeranha.getUserByAddress(signers[2].address);
            await expect(userRating.rating).to.equal(StartRating + AcceptCommonPost);
            await expect(replierRating.rating).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);

            await peeranha.deleteReply(1, 1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[1].address);
            const newReplierRating = await peeranha.getUserByAddress(signers[2].address);
            await expect(newUserRating.rating).to.equal(StartRating);
            await expect(newReplierRating.rating).to.equal(StartRating + ModeratorDeleteReply);
        });
        
        it("Test delete comments", async function () {
            const peeranha = await createContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranha.createUser(hashContainer[1]);
			await peeranha.connect(signers[1]).createUser(hashContainer[2]);
			await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.addUserRating(signers[1].address, 25);

            await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1])
            await peeranha.createReply(1, 0, hashContainer[1], false);

            await peeranha.connect(signers[1]).createComment(1, 0, hashContainer[0]);
            await peeranha.connect(signers[1]).createComment(1, 1, hashContainer[0]);

            const userOldRating = (await peeranha.getUserByAddress(signers[1].address)).rating;
            const adminOldRating = (await peeranha.getUserByAddress(signers[0].address)).rating;

            await peeranha.deleteComment(1, 0, 1);
            await peeranha.deleteComment(1, 1, 1);

            const userRating = (await peeranha.getUserByAddress(signers[1].address)).rating;
            const adminRating = (await peeranha.getUserByAddress(signers[0].address)).rating;

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

            await peeranha.connect(signers[2]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1])

            const userOldRating = (await peeranha.getUserByAddress(signers[2].address)).rating;
            const adminOldRating = (await peeranha.getUserByAddress(signers[1].address)).rating;

            await peeranha.connect(signers[1]).deletePost(1);

            const userRating = (await peeranha.getUserByAddress(signers[2].address)).rating;
            const adminRating = (await peeranha.getUserByAddress(signers[1].address)).rating;

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

            await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1])
            await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[1], false);

            const userOldRating = (await peeranha.getUserByAddress(signers[2].address)).rating;
            const adminOldRating = (await peeranha.getUserByAddress(signers[1].address)).rating;

            await peeranha.connect(signers[1]).deleteReply(1, 1);

            const userRating = (await peeranha.getUserByAddress(signers[2].address)).rating;
            const adminRating = (await peeranha.getUserByAddress(signers[1].address)).rating;

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

    
            await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.voteItem(1, 0, 0, 1);
    
            const user = await peeranha.getUserByAddress(signers[1].address);
            const admin = await peeranha.getUserByAddress(signers[2].address);
            const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
            await expect(user.rating).to.equal(StartRating + UpvotedExpertPost);
            await expect(admin.rating).to.equal(StartRating);
            await expect(userAction.rating).to.equal(StartRating);
    
            await peeranha.connect(signers[2]).deletePost(1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[1].address);
            const newAdminRating = await peeranha.getUserByAddress(signers[2].address);
            const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
            await expect(newUserRating.rating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newAdminRating.rating).to.equal(StartRating);
            await expect(newUserActionRating.rating).to.equal(StartRating);
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

    
            await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.voteItem(1, 0, 0, 1);
    
            const user = await peeranha.getUserByAddress(signers[1].address);
            const admin = await peeranha.getUserByAddress(signers[2].address);
            const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
            await expect(user.rating).to.equal(StartRating + UpvotedCommonPost);
            await expect(admin.rating).to.equal(StartRating);
            await expect(userAction.rating).to.equal(StartRating);
    
            await peeranha.connect(signers[2]).deletePost(1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[1].address);
            const newAdminRating = await peeranha.getUserByAddress(signers[2].address);
            const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
            await expect(newUserRating.rating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newAdminRating.rating).to.equal(StartRating);
            await expect(newUserActionRating.rating).to.equal(StartRating);
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
    
            await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.voteItem(1, 0, 0, 0);
    
            const user = await peeranha.getUserByAddress(signers[1].address);
            const admin = await peeranha.getUserByAddress(signers[2].address);
            const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
            await expect(user.rating).to.equal(StartRating + DownvotedExpertPost);
            await expect(admin.rating).to.equal(StartRating);
            await expect(userAction.rating).to.equal(StartRating + DownvoteExpertPost);
    
            await peeranha.connect(signers[2]).deletePost(1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[1].address);
            const newAdminRating = await peeranha.getUserByAddress(signers[2].address);
            const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
            await expect(newUserRating.rating).to.equal(StartRating + DownvotedExpertPost + ModeratorDeletePost);
            await expect(newAdminRating.rating).to.equal(StartRating);
            await expect(newUserActionRating.rating).to.equal(StartRating + DownvoteExpertPost);
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
    
            await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.voteItem(1, 0, 0, 0);
    
            const user = await peeranha.getUserByAddress(signers[1].address);
            const admin = await peeranha.getUserByAddress(signers[2].address);
            const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
            await expect(user.rating).to.equal(StartRating + DownvotedCommonPost);
            await expect(admin.rating).to.equal(StartRating);
            await expect(userAction.rating).to.equal(StartRating + DownvoteCommonPost);
    
            await peeranha.connect(signers[2]).deletePost(1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[1].address);
            const newAdminRating = await peeranha.getUserByAddress(signers[2].address);
            const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
            await expect(newUserRating.rating).to.equal(StartRating + DownvotedCommonPost + ModeratorDeletePost);
            await expect(newAdminRating.rating).to.equal(StartRating);
            await expect(newUserActionRating.rating).to.equal(StartRating + DownvoteCommonPost);
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
    
            await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
    
            await peeranha.voteItem(1, 1, 0, 1);
    
            const user = await peeranha.getUserByAddress(signers[1].address);
            const replier = await peeranha.getUserByAddress(signers[2].address);
            const admin = await peeranha.getUserByAddress(signers[3].address);
            const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
            await expect(user.rating).to.equal(StartRating);
            await expect(admin.rating).to.equal(StartRating);
            await expect(replier.rating).to.equal(StartRating + UpvotedExpertReply + FirstExpertReply + QuickExpertReply);
            await expect(userAction.rating).to.equal(StartRating);
    
            await peeranha.deletePost(1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[1].address);
            const newReplierRating = await peeranha.getUserByAddress(signers[2].address);
            const newAdminRating = await peeranha.getUserByAddress(signers[3].address);
            const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
            await expect(newUserRating.rating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating.rating).to.equal(StartRating);
            await expect(newAdminRating.rating).to.equal(StartRating);
            await expect(newUserActionRating.rating).to.equal(StartRating);
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
    
            await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
    
            await peeranha.voteItem(1, 1, 0, 1);
    
            const user = await peeranha.getUserByAddress(signers[1].address);
            const replier = await peeranha.getUserByAddress(signers[2].address);
            const admin = await peeranha.getUserByAddress(signers[3].address);
            const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
            await expect(user.rating).to.equal(StartRating);
            await expect(admin.rating).to.equal(StartRating);
            await expect(replier.rating).to.equal(StartRating + UpvotedCommonReply + FirstCommonReply + QuickCommonReply);
            await expect(userAction.rating).to.equal(StartRating);
    
            await peeranha.deletePost(1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[1].address);
            const newReplierRating = await peeranha.getUserByAddress(signers[2].address);
            const newAdminRating = await peeranha.getUserByAddress(signers[3].address);
            const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
            await expect(newUserRating.rating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating.rating).to.equal(StartRating);
            await expect(newAdminRating.rating).to.equal(StartRating);
            await expect(newUserActionRating.rating).to.equal(StartRating);
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
    
            await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
    
            await peeranha.voteItem(1, 1, 0, 0);
    
            const user = await peeranha.getUserByAddress(signers[1].address);
            const replier = await peeranha.getUserByAddress(signers[2].address);
            const admin = await peeranha.getUserByAddress(signers[3].address);
            const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
            await expect(user.rating).to.equal(StartRating);
            await expect(replier.rating).to.equal(StartRating + DownvotedExpertReply);
            await expect(admin.rating).to.equal(StartRating);
            await expect(userAction.rating).to.equal(StartRating + DownvoteExpertReply);
    
            await peeranha.deletePost(1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[1].address);
            const newReplierRating = await peeranha.getUserByAddress(signers[2].address);
            const newAdminRating = await peeranha.getUserByAddress(signers[3].address);
            const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
            await expect(newUserRating.rating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating.rating).to.equal(StartRating + DownvotedExpertReply);
            await expect(newAdminRating.rating).to.equal(StartRating);
            await expect(newUserActionRating.rating).to.equal(StartRating + DownvoteExpertReply);	
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
    
            await peeranha.connect(signers[1]).createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[1], false);
    
            await peeranha.voteItem(1, 1, 0, 0);
    
            const user = await peeranha.getUserByAddress(signers[1].address);
            const replier = await peeranha.getUserByAddress(signers[2].address);
            const admin = await peeranha.getUserByAddress(signers[3].address);
            const userAction = await peeranha.getUserByAddress(peeranha.deployTransaction.from);		
            await expect(user.rating).to.equal(StartRating);
            await expect(replier.rating).to.equal(StartRating + DownvotedCommonReply);
            await expect(admin.rating).to.equal(StartRating);
            await expect(userAction.rating).to.equal(StartRating + DownvoteCommonReply);
    
            await peeranha.deletePost(1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[1].address);
            const newReplierRating = await peeranha.getUserByAddress(signers[2].address);
            const newAdminRating = await peeranha.getUserByAddress(signers[3].address);
            const newUserActionRating = await peeranha.getUserByAddress(peeranha.deployTransaction.from);
            await expect(newUserRating.rating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating.rating).to.equal(StartRating + DownvotedCommonReply);
            await expect(newAdminRating.rating).to.equal(StartRating);
            await expect(newUserActionRating.rating).to.equal(StartRating + DownvoteCommonReply);
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
    
            await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
            
            await peeranha.changeStatusBestReply(1, 1);

            const userRating = await peeranha.getUserByAddress(signers[0].address);
            const replierRating = await peeranha.getUserByAddress(signers[1].address);
            await expect(userRating.rating).to.equal(StartRating + AcceptExpertPost);
            await expect(replierRating.rating).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);

            await peeranha.connect(signers[2]).deletePost(1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[0].address);
            const newReplierRating = await peeranha.getUserByAddress(signers[1].address);
            await expect(newUserRating.rating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating.rating).to.equal(StartRating);
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
    
            await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
            
            await peeranha.changeStatusBestReply(1, 1);

            const userRating = await peeranha.getUserByAddress(signers[0].address);
            const replierRating = await peeranha.getUserByAddress(signers[1].address);
            await expect(userRating.rating).to.equal(StartRating + AcceptCommonPost);
            await expect(replierRating.rating).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);

            await peeranha.connect(signers[2]).deletePost(1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[0].address);
            const newReplierRating = await peeranha.getUserByAddress(signers[1].address);
            await expect(newUserRating.rating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating.rating).to.equal(StartRating);
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
    
            await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
            await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
    
            await peeranha.voteItem(1, 1, 0, 1);
            await peeranha.voteItem(1, 2, 0, 1);
    
            await peeranha.connect(signers[3]).deleteReply(1, 1);
            await peeranha.connect(signers[3]).deleteReply(1, 2);
            
            const userRating = await peeranha.getUserByAddress(signers[1].address);
            const userRating2 = await peeranha.getUserByAddress(signers[2].address);
            await expect(userRating.rating).to.equal(StartRating + ModeratorDeleteReply);
            await expect(userRating2.rating).to.equal(StartRating + ModeratorDeleteReply);
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
    
            await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
            await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
    
            await peeranha.voteItem(1, 1, 0, 1);
            await peeranha.voteItem(1, 2, 0, 1);
    
            await peeranha.connect(signers[3]).deleteReply(1, 1);
            await peeranha.connect(signers[3]).deleteReply(1, 2);
            
            const userRating = await peeranha.getUserByAddress(signers[1].address);
            const userRating2 = await peeranha.getUserByAddress(signers[2].address);
            await expect(userRating.rating).to.equal(StartRating + ModeratorDeleteReply);
            await expect(userRating2.rating).to.equal(StartRating + ModeratorDeleteReply);
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
    
            await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
            await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
    
            await peeranha.voteItem(1, 1, 0, 0);
            await peeranha.voteItem(1, 2, 0, 0);
    
            await peeranha.connect(signers[3]).deleteReply(1, 1);
            await peeranha.connect(signers[3]).deleteReply(1, 2);
            
            const userRating = await peeranha.getUserByAddress(signers[1].address);
            const userRating2 = await peeranha.getUserByAddress(signers[2].address);
            await expect(userRating.rating).to.equal(StartRating + DownvotedExpertReply + ModeratorDeleteReply);
            await expect(userRating2.rating).to.equal(StartRating + DownvotedExpertReply + ModeratorDeleteReply);
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
    
            await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
            await peeranha.connect(signers[2]).createReply(1, 0, hashContainer[2], false);
    
            await peeranha.voteItem(1, 1, 0, 0);
            await peeranha.voteItem(1, 2, 0, 0);
    
            await peeranha.connect(signers[3]).deleteReply(1, 1);
            await peeranha.connect(signers[3]).deleteReply(1, 2);
            
            const userRating = await peeranha.getUserByAddress(signers[1].address);
            const userRating2 = await peeranha.getUserByAddress(signers[2].address);
            await expect(userRating.rating).to.equal(StartRating + DownvotedCommonReply + ModeratorDeleteReply);
            await expect(userRating2.rating).to.equal(StartRating + DownvotedCommonReply + ModeratorDeleteReply);
        });

        it("Test delete expert reply as best", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.createUser(hashContainer[1]);
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.giveCommunityAdminPermission(signers[2].address, 1);
    
            await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1]);
            await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
            
            await peeranha.changeStatusBestReply(1, 1);

            const userRating = await peeranha.getUserByAddress(signers[0].address);
            const replierRating = await peeranha.getUserByAddress(signers[1].address);
            await expect(userRating.rating).to.equal(StartRating + AcceptExpertPost);
            await expect(replierRating.rating).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);

            await peeranha.connect(signers[2]).deleteReply(1, 1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[0].address);
            const newReplierRating = await peeranha.getUserByAddress(signers[1].address);
            await expect(newUserRating.rating).to.equal(StartRating);
            await expect(newReplierRating.rating).to.equal(StartRating + ModeratorDeleteReply);
        });
    
        it("Test delete common reply as best", async function () {
            const peeranha = await createContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranha.createUser(hashContainer[1]);
            await peeranha.connect(signers[1]).createUser(hashContainer[0]);
            await peeranha.connect(signers[2]).createUser(hashContainer[0]);
            await peeranha.createCommunity(ipfsHashes[0], createTags(5));
            await peeranha.giveCommunityAdminPermission(signers[2].address, 1);
    
            await peeranha.createPost(1, hashContainer[0], PostTypeEnum.CommonPost, [1]);
            await peeranha.connect(signers[1]).createReply(1, 0, hashContainer[1], false);
            
            await peeranha.changeStatusBestReply(1, 1);

            const userRating = await peeranha.getUserByAddress(signers[0].address);
            const replierRating = await peeranha.getUserByAddress(signers[1].address);
            await expect(userRating.rating).to.equal(StartRating + AcceptCommonPost);
            await expect(replierRating.rating).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);

            await peeranha.connect(signers[2]).deleteReply(1, 1);
    
            const newUserRating = await peeranha.getUserByAddress(signers[0].address);
            const newReplierRating = await peeranha.getUserByAddress(signers[1].address);
            await expect(newUserRating.rating).to.equal(StartRating);
            await expect(newReplierRating.rating).to.equal(StartRating + ModeratorDeleteReply);
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
            await peeranha.addUserRating(signers[2].address, 25);

            await peeranha.createPost(1, hashContainer[0], PostTypeEnum.ExpertPost, [1])
            await peeranha.createReply(1, 0, hashContainer[1], false);

            await peeranha.connect(signers[2]).createComment(1, 0, hashContainer[0]);
            await peeranha.connect(signers[2]).createComment(1, 1, hashContainer[0]);

            const userOldRating = (await peeranha.getUserByAddress(signers[2].address)).rating;
            const adminOldRating = (await peeranha.getUserByAddress(signers[1].address)).rating;

            await peeranha.connect(signers[1]).deleteComment(1, 0, 1);
            await peeranha.connect(signers[1]).deleteComment(1, 1, 1);

            const userRating = (await peeranha.getUserByAddress(signers[2].address)).rating;
            const adminRating = (await peeranha.getUserByAddress(signers[1].address)).rating;

			expect((await peeranha.getComment(1, 0, 1)).isDeleted).to.be.true;
			expect((await peeranha.getComment(1, 1, 1)).isDeleted).to.be.true;
			expect(userRating).to.be.equal(userOldRating + ModeratorDeleteComment + ModeratorDeleteComment);
			expect(adminRating).to.be.equal(adminOldRating);
        })
    })

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
	//	TO DO AcceptReply, Tutorial posts
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

    
        const QuickReplyTime = 3000 // in milliseconds, defines at CommonLib
        const StartRating = 10

        const DownvoteExpertPost = -1;
        const UpvotedExpertPost = 5;
        const DownvotedExpertPost = -2;
        const AcceptExpertPost = 2;         //Accept answer as correct for Expert Question
    
        //common post 
        const DownvoteCommonPost = -1;
        const UpvotedCommonPost = 1;
        const DownvotedCommonPost = -1;
        const AcceptCommonPost = 1;

    
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
        
        const ModeratorDeleteReply = -2;
    
    /////////////////////////////////////////////////////////////////////////////////
    
        const ModeratorDeleteComment = -1;
});
