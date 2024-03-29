//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";

import "./base/NativeMetaTransaction.sol";
import "./interfaces/IPeeranhaEtherNFT.sol";

contract PeeranhaEtherNFT is
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    ERC721URIStorageUpgradeable,
    AccessControlUpgradeable,
    NativeMetaTransaction,
    IPeeranhaEtherNFT
{
    bytes32 public constant PREDICATE_ROLE = keccak256("PREDICATE_ROLE");
    
    function initialize(string memory name_, string memory symbol_, address predicateProxyAddress) public initializer {
        __ERC721_init(name_, symbol_);
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(PREDICATE_ROLE, predicateProxyAddress);
        __NativeMetaTransaction_init(name_);
    }

    function _msgSender()
      internal
      override(ContextUpgradeable, NativeMetaTransaction)
      view
      returns (address sender)
    {
      return NativeMetaTransaction._msgSender();
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Upgradeable, AccessControlUpgradeable, IERC165Upgradeable, ERC721EnumerableUpgradeable) returns (bool) {
        return
            interfaceId == type(IPeeranhaEtherNFT).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {IPeeranhaEtherNFT-mint}.
     */
    function mint(address user, uint256 tokenId) external override onlyRole(PREDICATE_ROLE) {
        _mint(user, tokenId);
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

    /**
     * If you're attempting to bring metadata associated with token
     * from L2 to L1, you must implement this method, to be invoked
     * when minting token back on L1, during exit
     */
    function setTokenMetadata(uint256 tokenId, bytes memory data) internal virtual {
        // This function should decode metadata obtained from L2
        // and attempt to set it for this `tokenId`
        //
        // Following is just a default implementation, feel
        // free to define your own encoding/ decoding scheme
        // for L2 -> L1 token metadata transfer
        string memory uri = abi.decode(data, (string));
        _setTokenURI(tokenId, uri);
    }

    /**
     * @dev See {IPeeranhaEtherNFT-mint}.
     * 
     * If you're attempting to bring metadata associated with token
     * from L2 to L1, you must implement this method
     */
    function mint(address user, uint256 tokenId, bytes calldata metaData) external override onlyRole(PREDICATE_ROLE) {
        _mint(user, tokenId);

        setTokenMetadata(tokenId, metaData);
    }


    /**
     * @dev See {IPeeranhaEtherNFT-exists}.
     */
    function exists(uint256 tokenId) external view override returns (bool) {
        return _exists(tokenId);
    }
}
