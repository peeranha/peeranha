//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";

import "./IChildToken.sol";
import "./NativeMetaTransaction.sol";

///
// check ERC721Upgradeable already in ERC721URIStorageUpgradeable
///
contract ChildMintableERC721Upgradeable is
    IChildToken,
    NativeMetaTransaction,
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    ERC721URIStorageUpgradeable,
    AccessControlUpgradeable
{
    bytes32 public constant DEPOSITOR_ROLE = keccak256("DEPOSITOR_ROLE");
    mapping (uint256 => bool) public withdrawnTokens;

    // limit batching of tokens due to gas limit restrictions
    uint256 public constant BATCH_LIMIT = 20;

    event WithdrawnBatch(address indexed user, uint256[] tokenIds);
    event TransferWithMetadata(address indexed from, address indexed to, uint256 indexed tokenId, bytes metaData);

    function __ChildMintableERC721Upgradeable_init(
        string memory name_,
        string memory symbol_,
        address childChainManager
    ) internal onlyInitializing {
        __ERC721_init(name_, symbol_);
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(DEPOSITOR_ROLE, childChainManager);
        _initializeEIP712(name_);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override (ERC721EnumerableUpgradeable, ERC721Upgradeable) {
        super._beforeTokenTransfer(from, to, amount);
    }

    function tokenURI(uint256 tokenId) public view virtual override (ERC721URIStorageUpgradeable, ERC721Upgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _burn(uint256 tokenId) internal virtual override (ERC721URIStorageUpgradeable, ERC721Upgradeable) {
        super._burn(tokenId);
    }

    // This is to support Native meta transactions
    // never use msg.sender directly, use _msgSender() instead
    function _msgSender()
        internal
        override(ContextUpgradeable, NativeMetaTransaction)
        virtual
        view
        returns (address sender)
    {
        return NativeMetaTransaction._msgSender();
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Upgradeable, ERC721EnumerableUpgradeable, AccessControlUpgradeable) returns (bool) {
        return
            interfaceId == type(IChildToken).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @notice called when token is deposited on root chain
     * @dev Should be callable only by ChildChainManager
     * Should handle deposit by minting the required tokenId(s) for user
     * Should set `withdrawnTokens` mapping to `false` for the tokenId being deposited
     * Minting can also be done by other functions
     * @param user user address for whom deposit is being done
     * @param depositData abi encoded tokenIds. Batch deposit also supported.
     */
    function deposit(address user, bytes calldata depositData)
        external
        override
        onlyRole(DEPOSITOR_ROLE)
    {

        // deposit single
        if (depositData.length == 32) {
            uint256 tokenId = abi.decode(depositData, (uint256));
            withdrawnTokens[tokenId] = false;
            _mint(user, tokenId);

        // deposit batch
        } else {
            uint256[] memory tokenIds = abi.decode(depositData, (uint256[]));
            uint256 length = tokenIds.length;
            for (uint256 i; i < length; i++) {
                withdrawnTokens[tokenIds[i]] = false;
                _mint(user, tokenIds[i]);
            }
        }

    }

    /**
     * @notice called when user wants to withdraw token back to root chain
     * @dev Should handle withraw by burning user's token.
     * Should set `withdrawnTokens` mapping to `true` for the tokenId being withdrawn
     * This transaction will be verified when exiting on root chain
     * @param tokenId tokenId to withdraw
     */
    function withdraw(uint256 tokenId) external {
        require(_msgSender() == ownerOf(tokenId), "ChildMintableERC721Upgradeable: INVALID_TOKEN_OWNER");
        withdrawnTokens[tokenId] = true;
        _burn(tokenId);
    }

    /**
     * @notice called when user wants to withdraw multiple tokens back to root chain
     * @dev Should burn user's tokens. This transaction will be verified when exiting on root chain
     * @param tokenIds tokenId list to withdraw
     */
    function withdrawBatch(uint256[] calldata tokenIds) external {

        uint256 length = tokenIds.length;
        require(length <= BATCH_LIMIT, "ChildMintableERC721Upgradeable: EXCEEDS_BATCH_LIMIT");

        // Iteratively burn ERC721 tokens, for performing
        // batch withdraw
        for (uint256 i; i < length; i++) {

            uint256 tokenId = tokenIds[i];

            require(_msgSender() == ownerOf(tokenId), string(abi.encodePacked("ChildMintableERC721Upgradeable: INVALID_TOKEN_OWNER ", tokenId)));
            withdrawnTokens[tokenId] = true;
            _burn(tokenId);

        }

        // At last emit this event, which will be used
        // in MintableERC721 predicate contract on L1
        // while verifying burn proof
        emit WithdrawnBatch(_msgSender(), tokenIds);

    }

    /**
     * @notice called when user wants to withdraw token back to root chain with token URI
     * @dev Should handle withraw by burning user's token.
     * Should set `withdrawnTokens` mapping to `true` for the tokenId being withdrawn
     * This transaction will be verified when exiting on root chain
     *
     * @param tokenId tokenId to withdraw
     */
    function withdrawWithMetadata(uint256 tokenId) external {

        require(_msgSender() == ownerOf(tokenId), "ChildMintableERC721Upgradeable: INVALID_TOKEN_OWNER");
        withdrawnTokens[tokenId] = true;

        // Encoding metadata associated with tokenId & emitting event
        emit TransferWithMetadata(ownerOf(tokenId), address(0), tokenId, this.encodeTokenMetadata(tokenId));

        _burn(tokenId);

    }

    /**
     * @notice This method is supposed to be called by client when withdrawing token with metadata
     * and pass return value of this function as second paramter of `withdrawWithMetadata` method
     *
     * It can be overridden by clients to encode data in a different form, which needs to
     * be decoded back by them correctly during exiting
     *
     * @param tokenId Token for which URI to be fetched
     */
    function encodeTokenMetadata(uint256 tokenId) external view virtual returns (bytes memory) {

        // You're always free to change this default implementation
        // and pack more data in byte array which can be decoded back
        // in L1
        return abi.encode(tokenURI(tokenId));

    }

    /**
     * @notice Example function to handle minting tokens on matic chain
     * @dev Minting can be done as per requirement,
     * This implementation allows only admin to mint tokens but it can be changed as per requirement
     * Should verify if token is withdrawn by checking `withdrawnTokens` mapping
     * @param user user for whom tokens are being minted
     * @param tokenId tokenId to mint
     */
    function mint(address user, uint256 tokenId) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!withdrawnTokens[tokenId], "ChildMintableERC721Upgradeable: TOKEN_EXISTS_ON_ROOT_CHAIN");
        _mint(user, tokenId);
    }
}
