pragma solidity >=0.5.0;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20CappedUpgradeable.sol";

import "./interfaces/IPeeranha.sol";
import "./AccessControlUpgradable.sol";

contract Sequrity is AccessControlUpgradeable {  
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    uint256 public constant COMMUNITY_ADMIN_ROLE = uint256(keccak256("COMMUNITY_ADMIN_ROLE"));
    uint256 public constant COMMUNITY_MODERATOR_ROLE = uint256(keccak256("COMMUNITY_MODERATOR_ROLE"));

    modifier onlyCommunityAdmin(uint256 communityId) {
        require((hasRole(getCommunityRole(COMMUNITY_ADMIN_ROLE, communityId), msg.sender) || 
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender)), 
            "Peeranha: must have community admin role");
        _;
    }

    modifier onlyCommunityModerator(uint256 communityId) {
        require((hasRole(getCommunityRole(COMMUNITY_MODERATOR_ROLE, communityId), msg.sender) || 
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender)), 
            "Peeranha: must have community moderator role");
        _;
    }

    function getCommunityRole(uint256 role, uint256 communityId) internal pure returns (bytes32) {
        return bytes32(role + communityId);
    }

}