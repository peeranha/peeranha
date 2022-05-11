pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

import "./base/NativeMetaTransaction.sol";
import "./interfaces/IPeeranhaMainnetNFT.sol";

contract PeeranhaMainnetNFT is
    ERC721Upgradeable,
    AccessControlUpgradeable,
    NativeMetaTransaction,
    IPeeranhaMainnetNFT
{
    bytes32 public constant PREDICATE_ROLE = keccak256("PREDICATE_ROLE");
    
    function initialize(string memory name_, string memory symbol_, address predicateProxyAddress) public onlyInitializing {
        __ERC721_init(name_, symbol_);
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(PREDICATE_ROLE, predicateProxyAddress);
        _initializeEIP712(name_);
    }

    function _msgSender()
      internal
      override(ContextUpgradeable, NativeMetaTransaction)
      view
      returns (address sender)
    {
      return NativeMetaTransaction._msgSender();
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Upgradeable, AccessControlUpgradeable, IERC165Upgradeable) returns (bool) {
        return
            interfaceId == type(IPeeranhaMainnetNFT).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {IPeeranhaMainnetNFT-mint}.
     */
    function mint(address user, uint256 tokenId) external override onlyRole(PREDICATE_ROLE) {
        _mint(user, tokenId);
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

        // TODO: why now _setTokenURI in new version
        // _setTokenURI(tokenId, uri);
    }

    /**
     * @dev See {IPeeranhaMainnetNFT-mint}.
     * 
     * If you're attempting to bring metadata associated with token
     * from L2 to L1, you must implement this method
     */
    function mint(address user, uint256 tokenId, bytes calldata metaData) external override onlyRole(PREDICATE_ROLE) {
        _mint(user, tokenId);

        setTokenMetadata(tokenId, metaData);
    }


    /**
     * @dev See {IPeeranhaMainnetNFT-exists}.
     */
    function exists(uint256 tokenId) external view override returns (bool) {
        return _exists(tokenId);
    }
}
