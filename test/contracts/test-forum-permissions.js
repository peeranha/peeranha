const { expect } = require("chai");
const { 
    createPeerenhaAndTokenContract, getHashContainer, getHashesContainer, createTags, PostTypeEnum, StartRating,
    DownvoteExpertPost, UpvotedExpertPost, DownvotedExpertPost, DownvoteCommonPost, UpvotedCommonPost, DownvotedCommonPost,
    ModeratorDeletePost, DownvoteExpertReply, UpvotedExpertReply, DownvotedExpertReply, AcceptExpertReply, AcceptedExpertReply, 
    FirstExpertReply, QuickExpertReply, DownvoteCommonReply, UpvotedCommonReply, DownvotedCommonReply, AcceptCommonReply,
    AcceptedCommonReply, FirstCommonReply, QuickCommonReply, ModeratorDeleteReply, ModeratorDeleteComment, DefaultCommunityId, PROTOCOL_ADMIN_ROLE, BOT_ROLE, LanguagesEnum
} = require('./utils');

///
// to do
// Test delete expert reply as best (delete best reply)
// AcceptReply, 
// Tutorial posts
///

describe("Test permissions", function () {
    describe("Test set role admin", function () {
        it("Test grant role with set role admin", async function() {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const ipfsHashes = getHashesContainer(2);
			const hashContainer = getHashContainer();

			const signers = await ethers.getSigners();
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

            await peeranhaUser.setRoleAdmin(BOT_ROLE, PROTOCOL_ADMIN_ROLE);
			
			await expect(peeranhaUser.connect(signers[1]).grantRole(BOT_ROLE, signers[2].address))
            .to.be.revertedWith("AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0xd0c934f24ef5a377dc3832429ce607cbe940a3ca3c6cd7e532bd35b4b212d196");

            await expect(peeranhaUser.grantRole(BOT_ROLE, signers[1].address))
            .not.to.be.revertedWith("AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0xd0c934f24ef5a377dc3832429ce607cbe940a3ca3c6cd7e532bd35b4b212d196");
        });
    });

    describe("Test admin role", function () {
		it("Test give admin permission", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
            const ipfsHashes = getHashesContainer(2);
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[2]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[2]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

            await expect(peeranhaUser.connect(signers[1]).grantRole(PROTOCOL_ADMIN_ROLE, signers[2].address))
            .to.be.revertedWith("AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000");
            
            await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[1].address, 1);
            await expect(peeranhaUser.connect(signers[1]).grantRole(PROTOCOL_ADMIN_ROLE, signers[2].address))
            .to.be.revertedWith("AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000");
            
            await peeranhaUser.giveCommunityAdminPermission(signers[0].address, signers[1].address, 1);
            await expect(peeranhaUser.connect(signers[1]).grantRole(PROTOCOL_ADMIN_ROLE, signers[2].address))
            .to.be.revertedWith("AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000");

            await peeranhaUser.grantRole(PROTOCOL_ADMIN_ROLE, signers[1].address);
            await expect(peeranhaUser.connect(signers[1]).grantRole(PROTOCOL_ADMIN_ROLE, signers[2].address))
            .to.be.revertedWith("AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"); 
        });

        it("Test revoke admin permission", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
            const ipfsHashes = getHashesContainer(2);
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[2]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[2]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

            await expect(peeranhaUser.connect(signers[1]).revokeRole(PROTOCOL_ADMIN_ROLE, signers[2].address))
            .to.be.revertedWith("AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000");
            
            await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[1].address, 1);
            await expect(peeranhaUser.connect(signers[1]).revokeRole(PROTOCOL_ADMIN_ROLE, signers[2].address))
            .to.be.revertedWith("AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000");
            
            await peeranhaUser.giveCommunityAdminPermission(signers[0].address, signers[1].address, 1);
            await expect(peeranhaUser.connect(signers[1]).revokeRole(PROTOCOL_ADMIN_ROLE, signers[2].address))
            .to.be.revertedWith("AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000");

            await peeranhaUser.grantRole(PROTOCOL_ADMIN_ROLE, signers[1].address);
            await expect(peeranhaUser.connect(signers[1]).revokeRole(PROTOCOL_ADMIN_ROLE, signers[2].address))
            .to.be.revertedWith("AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"); 
            
            await peeranhaUser.revokeRole(PROTOCOL_ADMIN_ROLE, signers[1].address);
        });
    });

    describe("Test call action control", function () {
        it("Test call updateUserRating", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaContentAddress, accountDeployed} = await createPeerenhaAndTokenContract();
            const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);

            await expect(peeranhaUser.updateUserRating(peeranhaUser.deployTransaction.from, 5, 1))
            .to.be.revertedWith("internal_call_unauthorized");
            await expect(peeranhaUser.connect(signers[1]).updateUserRating(peeranhaUser.deployTransaction.from, 5, 1))
            .to.be.revertedWith("internal_call_unauthorized");
        });

        it("Test call updateUsersRating", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaContentAddress, accountDeployed } = await createPeerenhaAndTokenContract();
            const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);

            const usersRating = [{
                user: signers[1].address,
                rating: 5
            }]
            
            await expect(peeranhaUser.updateUsersRating(usersRating, 1))
            .to.be.revertedWith("internal_call_unauthorized");
            await expect(peeranhaUser.connect(signers[1]).updateUsersRating(usersRating, 1))
            .to.be.revertedWith("internal_call_unauthorized");
        });

        it("Test call checkActionRole", async function () {
            const { peeranhaContent, peeranhaCommunity, peeranhaUser, peeranhaContentAddress, accountDeployed } = await createPeerenhaAndTokenContract();
            const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
            const ipfsHashes = getHashesContainer(2);
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

            await expect(peeranhaUser.checkActionRole(signers[1].address, signers[1].address, 1, 1, 1, false))
            .to.be.revertedWith("internal_call_unauthorized");
            await expect(peeranhaUser.connect(signers[1]).checkActionRole(signers[1].address, signers[1].address, 1, 1, 1, false))
            .to.be.revertedWith("internal_call_unauthorized");
        });
    });

    describe("Common user", function () {
		it("Test post comment by common user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[2]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

			await expect(peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[0], LanguagesEnum.English))
                .to.be.revertedWith('low_rating_comment');
            await expect(peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[0], LanguagesEnum.English))
                .to.be.revertedWith('low_rating_comment');

            await peeranhaUser.addUserRating(signers[1].address, 24, 1);
            await expect(peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[0], LanguagesEnum.English))
                .to.be.revertedWith('low_rating_comment');
            await expect(peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[0], LanguagesEnum.English))
                .to.be.revertedWith('low_rating_comment');

            await peeranhaUser.addUserRating(signers[1].address, 1, 1);
            await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[0], LanguagesEnum.English);
            await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[0], LanguagesEnum.English);

            expect((await peeranhaContent.getPost(1)).commentCount).to.be.equal(1);
            expect((await peeranhaContent.getReply(1, 1)).commentCount).to.be.equal(1);
		});

        it("Test upvote post or reply by common user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[2]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

			await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1))
            .to.be.revertedWith('low_rating_upvote');
            await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1))
            .to.be.revertedWith('low_rating_upvote_reply');
            await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1))
            .to.be.revertedWith('low_rating_upvote_reply');

            await peeranhaUser.addUserRating(signers[1].address, 24, 1);
            await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1))
            .to.be.revertedWith('low_rating_upvote');
            await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1))
            .to.be.revertedWith('low_rating_upvote_reply');
            await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1))
            .to.be.revertedWith('low_rating_upvote_reply');

            await peeranhaUser.addUserRating(signers[1].address, 1, 1);
            await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1);
            await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1);

            expect((await peeranhaContent.getPost(1)).rating).to.be.equal(1);
            expect((await peeranhaContent.getReply(1, 1)).rating).to.be.equal(1);
		});

        it("Test downvote post or reply by common user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[2]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
			await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

			await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 0))
            .to.be.revertedWith('low_rating_downvote_post');
            await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 0))
            .to.be.revertedWith('low_rating_downvote_reply');

            await peeranhaUser.addUserRating(signers[1].address, 89, 1);
            await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 0))
            .to.be.revertedWith('low_rating_downvote_post');
            await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 0))
            .to.be.revertedWith('low_rating_downvote_reply');

            await peeranhaUser.addUserRating(signers[1].address, 1, 1);
            await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 0);
            await peeranhaUser.addUserRating(signers[1].address, 1, 1);
            await peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 0);

            expect((await peeranhaContent.getPost(1)).rating).to.be.equal(-1);
            expect((await peeranhaContent.getReply(1, 1)).rating).to.be.equal(-1);
		});

        it("Test create post or reply by user with negative rating", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[2]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaUser.addUserRating(signers[1].address, -11, 1);
            await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English)

			await expect(peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English))
            .to.be.revertedWith('low_rating_post');
			await expect(peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English))
            .to.be.revertedWith('low_rating_reply');
		});

        it("Test vote item by not registered user", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
            await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

			await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 0, 0, 1))
            .to.be.revertedWith('user_not_found');
			await expect(peeranhaContent.connect(signers[1]).voteItem(signers[1].address, 1, 1, 0, 1))
            .to.be.revertedWith('user_not_found');
		});

        xit("Test choose the best reply by not registered user", async function () {  // checkint exist user after checking permistions
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
            await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

			await expect(peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1))
            .to.be.revertedWith('user_not_found');
		});

        it("Test choose own reply as the best reply for not own post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

			await expect(peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1)).to.be.revertedWith('Only owner by post can change statust best reply');
		});

        it("Test choose the best reply for not own post", async function () {
			const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
            
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
            await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

			await expect(peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1)).to.be.revertedWith('Only owner by post can change statust best reply');
		});

        it("Test change post type by not registered user", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);

			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

            await expect(peeranhaContent.connect(signers[2]).editPost(signers[2].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)).
                to.be.revertedWith("user_not_found");
        })

        it("Test change post type by not author the post", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);

			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

            await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)).
                to.be.revertedWith("not_allowed_admin_or_comm_moderator");
        })

        it("Test change post type by common user (not author of the post)", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[1]);

			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

            await expect(peeranhaContent.connect(signers[2]).editPost(signers[2].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English)).
                to.be.revertedWith("not_allowed_admin_or_comm_moderator");   
        })

        it("Test change post type by common user (author of the post)", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 1, PostTypeEnum.CommonPost, LanguagesEnum.English);

            const post = await peeranhaContent.getPost(1);
            expect(post.postType).to.equal(PostTypeEnum.CommonPost);
        })

        it("Test change community Id by not registered user", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);

			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

            await expect(peeranhaContent.connect(signers[2]).editPost(signers[2].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English)).
                to.be.revertedWith("Error_change_communityId"); // user_not_found?
        })

        it("Test change community Id by not author the post", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);

			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

            await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English)).
                to.be.revertedWith("Error_change_communityId");
        })

        it("Test change community Id by common user", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);

			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], 2, PostTypeEnum.ExpertPost, LanguagesEnum.English);

            const post = await peeranhaContent.getPost(1);
            expect(post.communityId).to.equal(2);
        })

        it("Test change community Id to default community by not author the post", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);
			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);

			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

            await expect(peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost, LanguagesEnum.English)).
                to.be.revertedWith("not_allowed_admin_or_comm_moderator");
        })

        it("Test change community Id to default community by common user", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const signers = await ethers.getSigners();
			const hashContainer = getHashContainer();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[1]);

			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
			await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);

            await peeranhaContent.connect(signers[1]).editPost(signers[1].address, 1, hashContainer[0], [], DefaultCommunityId, PostTypeEnum.ExpertPost, LanguagesEnum.English);

            const post = await peeranhaContent.getPost(1);
            expect(post.communityId).to.equal(DefaultCommunityId);
        })
    });

    describe("General admin", function () {

        it("Test delete post", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[2]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

            await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English)

            const userOldRating = await peeranhaUser.getUserRating(signers[1].address, 1) + StartRating;
            const adminOldRating = await peeranhaUser.getUserRating(signers[0].address, 1) + StartRating;

            await peeranhaContent.deletePost(signers[0].address, 1);

            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const adminRating = await peeranhaUser.getUserRating(signers[0].address, 1) + StartRating;

			expect((await peeranhaContent.getPost(1)).isDeleted).to.be.true;
			expect(userRating).to.be.equal(userOldRating + ModeratorDeletePost);
			expect(adminRating).to.be.equal(adminOldRating);
        })

        it("Test delete reply", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[2]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));

            await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English)
            await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

            const userOldRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const adminOldRating = await peeranhaUser.getUserRating(signers[0].address, 1);

            await peeranhaContent.deleteReply(signers[0].address, 1, 1);

            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const adminRating = await peeranhaUser.getUserRating(signers[0].address, 1);

			expect((await peeranhaContent.getReply(1, 1)).isDeleted).to.be.true;
			expect(userRating).to.be.equal(userOldRating + ModeratorDeleteReply - FirstExpertReply - QuickExpertReply);
			expect(adminRating).to.be.equal(adminOldRating);
        })

        it("Test delete upvoted expert post", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
    
            await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
            await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
    
            const user = await peeranhaUser.getUserRating(signers[1].address, 1);
            const userAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1) + StartRating;		
            await expect(user).to.equal(StartRating + UpvotedExpertPost);
            await expect(userAction).to.equal(StartRating);
    
            await peeranhaContent.deletePost(signers[0].address, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1) + StartRating;
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newUserActionRating).to.equal(StartRating);
        });
    
        it("Test delete upvoted common post", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
    
            await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
            await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
    
            const user = await peeranhaUser.getUserRating(signers[1].address, 1);
            const userAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1) + StartRating;		
            await expect(user).to.equal(StartRating + UpvotedCommonPost);
            await expect(userAction).to.equal(StartRating);
    
            await peeranhaContent.deletePost(signers[0].address, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1) + StartRating;
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newUserActionRating).to.equal(StartRating);
        });
    
        it("Test delete downvoted expert post", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
    
            await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
            await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 0);
    
            const user = await peeranhaUser.getUserRating(signers[1].address, 1);
            const userAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);		
            await expect(user).to.equal(StartRating + DownvotedExpertPost);
            await expect(userAction).to.equal(StartRating + DownvoteExpertPost);
    
            await peeranhaContent.deletePost(signers[0].address, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
            await expect(newUserRating).to.equal(StartRating + DownvotedExpertPost + ModeratorDeletePost);
            await expect(newUserActionRating).to.equal(StartRating + DownvoteExpertPost);
        });
    
        it("Test delete downvoted common post", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
    
            await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
            await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 0);
    
            const user = await peeranhaUser.getUserRating(signers[1].address, 1);
            const userAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);		
            await expect(user).to.equal(StartRating + DownvotedCommonPost);
            await expect(userAction).to.equal(StartRating + DownvoteCommonPost);
    
            await peeranhaContent.deletePost(signers[0].address, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
            await expect(newUserRating).to.equal(StartRating + DownvotedCommonPost + ModeratorDeletePost);
            await expect(newUserActionRating).to.equal(StartRating + DownvoteCommonPost);
        });
    
        it("Test delete post after upvote expert reply", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
    
            await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const replierRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
    
            await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
    
            const user = await peeranhaUser.getUserRating(signers[1].address, 1);
            const replier = await peeranhaUser.getUserRating(signers[2].address, 1);
            const userAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);		
            await expect(user).to.equal(userRating);
            await expect(replier).to.equal(replierRating + UpvotedExpertReply);
            await expect(userAction).to.equal(userActionRating);
    
            await peeranhaContent.deletePost(signers[0].address, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1) + StartRating;
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating);
            await expect(newUserActionRating).to.equal(StartRating);
        });
    
        it("Test delete post after upvote common reply", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
    
            await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const replierRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
    
            await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
    
            const user = await peeranhaUser.getUserRating(signers[1].address, 1);
            const replier = await peeranhaUser.getUserRating(signers[2].address, 1);
            const userAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);		
            await expect(user).to.equal(userRating);
            await expect(replier).to.equal(replierRating + UpvotedCommonReply);
            await expect(userAction).to.equal(userActionRating);
    
            await peeranhaContent.deletePost(signers[0].address, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1) + StartRating;
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating);
            await expect(newUserActionRating).to.equal(StartRating);
        });
    
        it("Test delete post after downvote expert reply", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
    
            await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const replierRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1) + StartRating;
    
            await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
    
            const user = await peeranhaUser.getUserRating(signers[1].address, 1);
            const replier = await peeranhaUser.getUserRating(signers[2].address, 1);
            const userAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);		
            await expect(user).to.equal(userRating);
            await expect(replier).to.equal(replierRating + DownvotedExpertReply - FirstExpertReply - QuickExpertReply);
            await expect(userAction).to.equal(userActionRating + DownvoteExpertReply);
    
            await peeranhaContent.deletePost(signers[0].address, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating + DownvotedExpertReply);
            await expect(newUserActionRating).to.equal(StartRating + DownvoteExpertReply);	
        });
    
        it("Test delete post after downvote common reply", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
    
            await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const replierRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            const userActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1) + StartRating;
    
            await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
    
            const user = await peeranhaUser.getUserRating(signers[1].address, 1);
            const replier = await peeranhaUser.getUserRating(signers[2].address, 1);
            const userAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);		
            await expect(user).to.equal(userRating);
            await expect(replier).to.equal(replierRating + DownvotedCommonReply - FirstCommonReply - QuickCommonReply);
            await expect(userAction).to.equal(userActionRating + DownvoteCommonReply);
    
            await peeranhaContent.deletePost(signers[0].address, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating + DownvotedCommonReply);
            await expect(newUserActionRating).to.equal(StartRating + DownvoteCommonReply);
        });

        it("Test delete expert post after choosing reply as best", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
    
            await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
            
            await peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);

            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const replierRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + AcceptedExpertReply);
            await expect(replierRating).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);

            await peeranhaContent.deletePost(signers[0].address, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating);
        });
    
        it("Test delete common post after choosing reply as best", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
    
            await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
            
            await peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);

            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const replierRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + AcceptedCommonReply);
            await expect(replierRating).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);

            await peeranhaContent.deletePost(signers[0].address, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating);
        });
    
        it("Test delete 2 upVoted expert reply, one first and two quick ", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
    
            await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
            await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false, LanguagesEnum.English);
    
            await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
            await peeranhaContent.voteItem(signers[0].address, 1, 2, 0, 1);
    
            await peeranhaContent.deleteReply(signers[0].address, 1, 1);
            await peeranhaContent.deleteReply(signers[0].address, 1, 2);
            
            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + ModeratorDeleteReply);
            await expect(userRating2).to.equal(StartRating + ModeratorDeleteReply);
        });
    
        it("Test delete 2 upVoted common reply, one first and two quick ", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
    
            await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
            await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false, LanguagesEnum.English);
    
            await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
            await peeranhaContent.voteItem(signers[0].address, 1, 2, 0, 1);
    
            await peeranhaContent.deleteReply(signers[0].address, 1, 1);
            await peeranhaContent.deleteReply(signers[0].address, 1, 2);
            
            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + ModeratorDeleteReply);
            await expect(userRating2).to.equal(StartRating + ModeratorDeleteReply);
        });
    
        it("Test delete 2 downVoted expert reply, one first and two quick ", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
    
            await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
            await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false, LanguagesEnum.English);
    
            await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
            await peeranhaContent.voteItem(signers[0].address, 1, 2, 0, 0);
    
            await peeranhaContent.deleteReply(signers[0].address, 1, 1);
            await peeranhaContent.deleteReply(signers[0].address, 1, 2);
            
            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + DownvotedExpertReply + ModeratorDeleteReply);
            await expect(userRating2).to.equal(StartRating + DownvotedExpertReply + ModeratorDeleteReply);
        });
    
        it("Test delete 2 downVoted common reply, one first and two quick ", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
    
            await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
            await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false, LanguagesEnum.English);
    
            await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
            await peeranhaContent.voteItem(signers[0].address, 1, 2, 0, 0);
    
            await peeranhaContent.deleteReply(signers[0].address, 1, 1);
            await peeranhaContent.deleteReply(signers[0].address, 1, 2);
            
            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + DownvotedCommonReply + ModeratorDeleteReply);
            await expect(userRating2).to.equal(StartRating + DownvotedCommonReply + ModeratorDeleteReply);
        });

        xit("Test delete expert reply as best", async function () { // delete best reply?
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
    
            await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
            
            await peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);

            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const replierRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + AcceptedExpertReply);
            await expect(replierRating).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);

            await peeranhaContent.deleteReply(signers[0].address, 1, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            await expect(newUserRating).to.equal(StartRating);
            await expect(newReplierRating).to.equal(StartRating + ModeratorDeleteReply);
        });
    
        xit("Test delete common reply as best", async function () { // delete best reply?
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
    
            await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
            
            await peeranhaContent.connect(signers[1]).changeStatusBestReply(signers[1].address, 1, 1);

            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const replierRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + AcceptedCommonReply);
            await expect(replierRating).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);

            await peeranhaContent.deleteReply(signers[0].address, 1, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            await expect(newUserRating).to.equal(StartRating);
            await expect(newReplierRating).to.equal(StartRating + ModeratorDeleteReply);
        });
        
        it("Test delete comments", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[2]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaUser.addUserRating(signers[1].address, 25, 1);

            await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English)
            await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

            await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 0, hashContainer[0], LanguagesEnum.English);
            await peeranhaContent.connect(signers[1]).createComment(signers[1].address, 1, 1, hashContainer[0], LanguagesEnum.English);

            const userOldRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const adminOldRating = await peeranhaUser.getUserRating(signers[0].address, 1);

            await peeranhaContent.deleteComment(signers[0].address, 1, 0, 1);
            await peeranhaContent.deleteComment(signers[0].address, 1, 1, 1);

            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const adminRating = await peeranhaUser.getUserRating(signers[0].address, 1);

			expect((await peeranhaContent.getComment(1, 0, 1)).isDeleted).to.be.true;
			expect((await peeranhaContent.getComment(1, 1, 1)).isDeleted).to.be.true;
			expect(userRating).to.be.equal(userOldRating + ModeratorDeleteComment + ModeratorDeleteComment);
			expect(adminRating).to.be.equal(adminOldRating);
        })
    })

    describe("Community admin", function () {

        it("Test delete post", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[2]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[1].address, 1);

            await peeranhaContent.connect(signers[2]).createPost(signers[2].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English)

            const userOldRating = await peeranhaUser.getUserRating(signers[2].address, 1) + StartRating;
            const adminOldRating = await peeranhaUser.getUserRating(signers[1].address, 1);

            await peeranhaContent.connect(signers[1]).deletePost(signers[1].address, 1);

            const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            const adminRating = await peeranhaUser.getUserRating(signers[1].address, 1);

			expect((await peeranhaContent.getPost(1)).isDeleted).to.be.true;
			expect(userRating).to.be.equal(userOldRating + ModeratorDeletePost);
			expect(adminRating).to.be.equal(adminOldRating);
        })

        it("Test delete reply", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[2]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[1].address, 1);

            await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English)
            await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

            const userOldRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            const adminOldRating = await peeranhaUser.getUserRating(signers[1].address, 1);

            await peeranhaContent.connect(signers[1]).deleteReply(signers[1].address, 1, 1);

            const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            const adminRating = await peeranhaUser.getUserRating(signers[1].address, 1);

			expect((await peeranhaContent.getReply(1, 1)).isDeleted).to.be.true;
			expect(userRating).to.be.equal(userOldRating + ModeratorDeleteReply - FirstExpertReply - QuickExpertReply);
			expect(adminRating).to.be.equal(adminOldRating);
        })

        it("Test delete upvoted expert post", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[2].address, 1);

            await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
            await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
    
            const user = await peeranhaUser.getUserRating(signers[1].address, 1);
            const admin = await peeranhaUser.getUserRating(signers[2].address, 1) + StartRating;
            const userAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1) + StartRating;		
            await expect(user).to.equal(StartRating + UpvotedExpertPost);
            await expect(admin).to.equal(StartRating);
            await expect(userAction).to.equal(StartRating);
    
            await peeranhaContent.connect(signers[2]).deletePost(signers[2].address, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const newAdminRating = await peeranhaUser.getUserRating(signers[2].address, 1) + StartRating;
            const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1) + StartRating;
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newAdminRating).to.equal(StartRating);
            await expect(newUserActionRating).to.equal(StartRating);
        });
    
        it("Test delete upvoted common post", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[2].address, 1);

    
            await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
            await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 1);
    
            const user = await peeranhaUser.getUserRating(signers[1].address, 1);
            const admin = await peeranhaUser.getUserRating(signers[2].address, 1) + StartRating;
            const userAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1) + StartRating;		
            await expect(user).to.equal(StartRating + UpvotedCommonPost);
            await expect(admin).to.equal(StartRating);
            await expect(userAction).to.equal(StartRating);
    
            await peeranhaContent.connect(signers[2]).deletePost(signers[2].address, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const newAdminRating = await peeranhaUser.getUserRating(signers[2].address, 1) + StartRating;
            const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1) + StartRating;
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newAdminRating).to.equal(StartRating);
            await expect(newUserActionRating).to.equal(StartRating);
        });

        it("Test delete downvoted expert post", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[2].address, 1);
    
            await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
            await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 0);
    
            const user = await peeranhaUser.getUserRating(signers[1].address, 1);
            const admin = await peeranhaUser.getUserRating(signers[2].address, 1) + StartRating;
            const userAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);		
            await expect(user).to.equal(StartRating + DownvotedExpertPost);
            await expect(admin).to.equal(StartRating);
            await expect(userAction).to.equal(StartRating + DownvoteExpertPost);
    
            await peeranhaContent.connect(signers[2]).deletePost(signers[2].address, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const newAdminRating = await peeranhaUser.getUserRating(signers[2].address, 1) + StartRating;
            const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
            await expect(newUserRating).to.equal(StartRating + DownvotedExpertPost + ModeratorDeletePost);
            await expect(newAdminRating).to.equal(StartRating);
            await expect(newUserActionRating).to.equal(StartRating + DownvoteExpertPost);
        });
    
        it("Test delete downvoted common post", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[2].address, 1);
    
            await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
            await peeranhaContent.voteItem(signers[0].address, 1, 0, 0, 0);
    
            const user = await peeranhaUser.getUserRating(signers[1].address, 1);
            const admin = await peeranhaUser.getUserRating(signers[2].address, 1) + StartRating;
            const userAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);		
            await expect(user).to.equal(StartRating + DownvotedCommonPost);
            await expect(admin).to.equal(StartRating);
            await expect(userAction).to.equal(StartRating + DownvoteCommonPost);
    
            await peeranhaContent.connect(signers[2]).deletePost(signers[2].address, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const newAdminRating = await peeranhaUser.getUserRating(signers[2].address, 1) + StartRating;
            const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
            await expect(newUserRating).to.equal(StartRating + DownvotedCommonPost + ModeratorDeletePost);
            await expect(newAdminRating).to.equal(StartRating);
            await expect(newUserActionRating).to.equal(StartRating + DownvoteCommonPost);
        });
    
        it("Test delete post after upvote expert reply", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaUser.connect(signers[3]).createUser(signers[3].address, hashContainer[0]);
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[3].address, 1);
    
            await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
    
            await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
    
            const user = await peeranhaUser.getUserRating(signers[1].address, 1) + StartRating;
            const replier = await peeranhaUser.getUserRating(signers[2].address, 1);
            const admin = await peeranhaUser.getUserRating(signers[3].address, 1) + StartRating;
            const userAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1) + StartRating;		
            await expect(user).to.equal(StartRating);
            await expect(admin).to.equal(StartRating);
            await expect(replier).to.equal(StartRating + UpvotedExpertReply + FirstExpertReply + QuickExpertReply);
            await expect(userAction).to.equal(StartRating);
    
            await peeranhaContent.deletePost(signers[0].address, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            const newAdminRating = await peeranhaUser.getUserRating(signers[3].address, 1) + StartRating;
            const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1) + StartRating;
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating);
            await expect(newAdminRating).to.equal(StartRating);
            await expect(newUserActionRating).to.equal(StartRating);
        });
    
        it("Test delete post after upvote common reply", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaUser.connect(signers[3]).createUser(signers[3].address, hashContainer[0]);
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[3].address, 1);
    
            await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
    
            await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
    
            const user = await peeranhaUser.getUserRating(signers[1].address, 1) + StartRating;
            const replier = await peeranhaUser.getUserRating(signers[2].address, 1);
            const admin = await peeranhaUser.getUserRating(signers[3].address, 1) + StartRating;
            const userAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1) + StartRating;		
            await expect(user).to.equal(StartRating);
            await expect(admin).to.equal(StartRating);
            await expect(replier).to.equal(StartRating + UpvotedCommonReply + FirstCommonReply + QuickCommonReply);
            await expect(userAction).to.equal(StartRating);
    
            await peeranhaContent.deletePost(signers[0].address, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            const newAdminRating = await peeranhaUser.getUserRating(signers[3].address, 1) + StartRating;
            const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1) + StartRating;
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating);
            await expect(newAdminRating).to.equal(StartRating) + StartRating;
            await expect(newUserActionRating).to.equal(StartRating) + StartRating;
        });
    
        it("Test delete post after downvote expert reply", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaUser.connect(signers[3]).createUser(signers[3].address, hashContainer[0]);
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[3].address, 1);
    
            await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
    
            await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
    
            const user = await peeranhaUser.getUserRating(signers[1].address, 1) + StartRating;
            const replier = await peeranhaUser.getUserRating(signers[2].address, 1);
            const admin = await peeranhaUser.getUserRating(signers[3].address, 1) + StartRating;
            const userAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);		
            await expect(user).to.equal(StartRating);
            await expect(replier).to.equal(StartRating + DownvotedExpertReply);
            await expect(admin).to.equal(StartRating);
            await expect(userAction).to.equal(StartRating + DownvoteExpertReply);
    
            await peeranhaContent.deletePost(signers[0].address, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            const newAdminRating = await peeranhaUser.getUserRating(signers[3].address, 1) + StartRating;
            const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating + DownvotedExpertReply);
            await expect(newAdminRating).to.equal(StartRating);
            await expect(newUserActionRating).to.equal(StartRating + DownvoteExpertReply);	
        });
    
        it("Test delete post after downvote common reply", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaUser.connect(signers[3]).createUser(signers[3].address, hashContainer[0]);
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[3].address, 1);
    
            await peeranhaContent.connect(signers[1]).createPost(signers[1].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
    
            await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
    
            const user = await peeranhaUser.getUserRating(signers[1].address, 1) + StartRating;
            const replier = await peeranhaUser.getUserRating(signers[2].address, 1);
            const admin = await peeranhaUser.getUserRating(signers[3].address, 1) + StartRating;
            const userAction = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);		
            await expect(user).to.equal(StartRating);
            await expect(replier).to.equal(StartRating + DownvotedCommonReply);
            await expect(admin).to.equal(StartRating);
            await expect(userAction).to.equal(StartRating + DownvoteCommonReply);
    
            await peeranhaContent.deletePost(signers[0].address, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const newReplierRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            const newAdminRating = await peeranhaUser.getUserRating(signers[3].address, 1) + StartRating;
            const newUserActionRating = await peeranhaUser.getUserRating(peeranhaUser.deployTransaction.from, 1);
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating + DownvotedCommonReply);
            await expect(newAdminRating).to.equal(StartRating);
            await expect(newUserActionRating).to.equal(StartRating + DownvoteCommonReply);
        });

        it("Test delete expert post after choosing reply as best", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[2].address, 1);
    
            await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
            
            await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);

            const userRating = await peeranhaUser.getUserRating(signers[0].address, 1);
            const replierRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            await expect(userRating).to.equal(StartRating + AcceptedExpertReply);
            await expect(replierRating).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);

            await peeranhaContent.connect(signers[2]).deletePost(signers[2].address, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[0].address, 1);
            const newReplierRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating);
        });
    
        it("Test delete common post after choosing reply as best", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[2].address, 1);
    
            await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
            
            await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);

            const userRating = await peeranhaUser.getUserRating(signers[0].address, 1);
            const replierRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            await expect(userRating).to.equal(StartRating + AcceptedCommonReply);
            await expect(replierRating).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);

            await peeranhaContent.connect(signers[2]).deletePost(signers[2].address, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[0].address, 1);
            const newReplierRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            await expect(newUserRating).to.equal(StartRating + ModeratorDeletePost);
            await expect(newReplierRating).to.equal(StartRating);
        });
    
        it("Test delete 2 upVoted expert reply, one first and two quick ", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaUser.connect(signers[3]).createUser(signers[3].address, hashContainer[0]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[3].address, 1);
    
            await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
            await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false, LanguagesEnum.English);
    
            await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
            await peeranhaContent.voteItem(signers[0].address, 1, 2, 0, 1);
    
            await peeranhaContent.connect(signers[3]).deleteReply(signers[3].address, 1, 1);
            await peeranhaContent.connect(signers[3]).deleteReply(signers[3].address, 1, 2);
            
            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + ModeratorDeleteReply);
            await expect(userRating2).to.equal(StartRating + ModeratorDeleteReply);
        });
    
        it("Test delete 2 upVoted common reply, one first and two quick ", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaUser.connect(signers[3]).createUser(signers[3].address, hashContainer[0]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[3].address, 1);
    
            await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
            await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false, LanguagesEnum.English);
    
            await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 1);
            await peeranhaContent.voteItem(signers[0].address, 1, 2, 0, 1);
    
            await peeranhaContent.connect(signers[3]).deleteReply(signers[3].address, 1, 1);
            await peeranhaContent.connect(signers[3]).deleteReply(signers[3].address, 1, 2);
            
            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + ModeratorDeleteReply);
            await expect(userRating2).to.equal(StartRating + ModeratorDeleteReply);
        });
    
        it("Test delete 2 downVoted expert reply, one first and two quick ", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaUser.connect(signers[3]).createUser(signers[3].address, hashContainer[0]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[3].address, 1);
    
            await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
            await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false, LanguagesEnum.English);
    
            await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
            await peeranhaContent.voteItem(signers[0].address, 1, 2, 0, 0);
    
            await peeranhaContent.connect(signers[3]).deleteReply(signers[3].address, 1, 1);
            await peeranhaContent.connect(signers[3]).deleteReply(signers[3].address, 1, 2);
            
            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + DownvotedExpertReply + ModeratorDeleteReply);
            await expect(userRating2).to.equal(StartRating + DownvotedExpertReply + ModeratorDeleteReply);
        });
    
        it("Test delete 2 downVoted common reply, one first and two quick ", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaUser.connect(signers[3]).createUser(signers[3].address, hashContainer[0]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[3].address, 1);
    
            await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
            await peeranhaContent.connect(signers[2]).createReply(signers[2].address, 1, 0, hashContainer[2], false, LanguagesEnum.English);
    
            await peeranhaContent.voteItem(signers[0].address, 1, 1, 0, 0);
            await peeranhaContent.voteItem(signers[0].address, 1, 2, 0, 0);
    
            await peeranhaContent.connect(signers[3]).deleteReply(signers[3].address, 1, 1);
            await peeranhaContent.connect(signers[3]).deleteReply(signers[3].address, 1, 2);
            
            const userRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            const userRating2 = await peeranhaUser.getUserRating(signers[2].address, 1);
            await expect(userRating).to.equal(StartRating + DownvotedCommonReply + ModeratorDeleteReply);
            await expect(userRating2).to.equal(StartRating + DownvotedCommonReply + ModeratorDeleteReply);
        });

        xit("Test delete expert reply as best", async function () {  // delete best reply
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[2].address, 1);
    
            await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
            
            await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);

            const userRating = await peeranhaUser.getUserRating(signers[0].address, 1);
            const replierRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            await expect(userRating).to.equal(StartRating + AcceptedExpertReply);
            await expect(replierRating).to.equal(StartRating + AcceptExpertReply + FirstExpertReply + QuickExpertReply);

            await peeranhaContent.connect(signers[2]).deleteReply(signers[2].address, 1, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[0].address, 1);
            const newReplierRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            await expect(newUserRating).to.equal(StartRating);
            await expect(newReplierRating).to.equal(StartRating + ModeratorDeleteReply);
        });
    
        xit("Test delete common reply as best", async function () {      // delete best reply?
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
            const signers = await ethers.getSigners();
            const hashContainer = getHashContainer();
            const ipfsHashes = getHashesContainer(2);
    
            await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
            await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[0]);
            await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
            await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[2].address, 1);
    
            await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.CommonPost, [1], LanguagesEnum.English);
            await peeranhaContent.connect(signers[1]).createReply(signers[1].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);
            
            await peeranhaContent.changeStatusBestReply(signers[0].address, 1, 1);

            const userRating = await peeranhaUser.getUserRating(signers[0].address, 1);
            const replierRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            await expect(userRating).to.equal(StartRating + AcceptedCommonReply);
            await expect(replierRating).to.equal(StartRating + AcceptCommonReply + FirstCommonReply + QuickCommonReply);

            await peeranhaContent.connect(signers[2]).deleteReply(signers[2].address, 1, 1);
    
            const newUserRating = await peeranhaUser.getUserRating(signers[0].address, 1);
            const newReplierRating = await peeranhaUser.getUserRating(signers[1].address, 1);
            await expect(newUserRating).to.equal(StartRating);
            await expect(newReplierRating).to.equal(StartRating + ModeratorDeleteReply);
        });
        
        it("Test delete comments", async function () {
            const { peeranhaContent, peeranhaUser, peeranhaCommunity, token, peeranhaNFT, accountDeployed } = await createPeerenhaAndTokenContract();
			const hashContainer = getHashContainer();
            const signers = await ethers.getSigners();
			const ipfsHashes = getHashesContainer(2);

			await peeranhaUser.createUser(signers[0].address, hashContainer[1]);
			await peeranhaUser.connect(signers[1]).createUser(signers[1].address, hashContainer[2]);
			await peeranhaUser.connect(signers[2]).createUser(signers[2].address, hashContainer[0]);
			await peeranhaCommunity.createCommunity(signers[0].address, ipfsHashes[0], createTags(5));
            await peeranhaUser.giveCommunityModeratorPermission(signers[0].address, signers[1].address, 1);
            await peeranhaUser.addUserRating(signers[2].address, 25, 1);

            await peeranhaContent.createPost(signers[0].address, 1, hashContainer[0], PostTypeEnum.ExpertPost, [1], LanguagesEnum.English)
            await peeranhaContent.createReply(signers[0].address, 1, 0, hashContainer[1], false, LanguagesEnum.English);

            await peeranhaContent.connect(signers[2]).createComment(signers[2].address, 1, 0, hashContainer[0], LanguagesEnum.English);
            await peeranhaContent.connect(signers[2]).createComment(signers[2].address, 1, 1, hashContainer[0], LanguagesEnum.English);

            const userOldRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            const adminOldRating = await peeranhaUser.getUserRating(signers[1].address, 1);

            await peeranhaContent.connect(signers[1]).deleteComment(signers[1].address, 1, 0, 1);
            await peeranhaContent.connect(signers[1]).deleteComment(signers[1].address, 1, 1, 1);

            const userRating = await peeranhaUser.getUserRating(signers[2].address, 1);
            const adminRating = await peeranhaUser.getUserRating(signers[1].address, 1);

			expect((await peeranhaContent.getComment(1, 0, 1)).isDeleted).to.be.true;
			expect((await peeranhaContent.getComment(1, 1, 1)).isDeleted).to.be.true;
			expect(userRating).to.be.equal(userOldRating + ModeratorDeleteComment + ModeratorDeleteComment);
			expect(adminRating).to.be.equal(adminOldRating);
        });
    });
});
