// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IssuerRegistry
 * @notice Authorizes accredited academic institutions and anchors their NIST FIPS 204
 *         ML-DSA-65 post-quantum public key fingerprints on-chain.
 */
contract IssuerRegistry is Ownable {
    struct IssuerProfile {
        string did;                     // e.g. "did:qtrust:university:uem_jaipur"
        string name;                    // e.g. "University of Engineering & Management Jaipur"
        bytes32 pqcKeyFingerprint;      // SHA-256 fingerprint of ML-DSA-65 public key
        bool isAuthorized;              // Accreditation status
        uint256 registeredAt;           // Registration timestamp
        uint256 statusUpdatedAt;        // Last status update timestamp
    }

    // Mapping from issuer wallet address to Profile
    mapping(address => IssuerProfile) private _issuers;

    // Mapping from DID string hash to issuer address for reverse resolution
    mapping(bytes32 => address) private _didToAddress;

    // Events
    event IssuerRegistered(
        address indexed issuerAddress, 
        string did, 
        string name, 
        bytes32 pqcKeyFingerprint, 
        uint256 timestamp
    );
    event IssuerStatusUpdated(address indexed issuerAddress, bool isAuthorized, uint256 timestamp);
    event IssuerPqcKeyRotated(address indexed issuerAddress, bytes32 oldKey, bytes32 newKey, uint256 timestamp);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @notice Registers an accredited university (Admin/Governance only).
     */
    function registerIssuer(
        address issuerAddress,
        string calldata did,
        string calldata name,
        bytes32 pqcKeyFingerprint
    ) external onlyOwner {
        require(issuerAddress != address(0), "Invalid issuer address");
        require(bytes(did).length > 0, "DID cannot be empty");
        require(pqcKeyFingerprint != bytes32(0), "Invalid PQC fingerprint");
        require(!_issuers[issuerAddress].isAuthorized, "Issuer already registered and active");

        bytes32 didHash = keccak256(bytes(did));
        require(_didToAddress[didHash] == address(0) || _didToAddress[didHash] == issuerAddress, "DID already claimed");

        _issuers[issuerAddress] = IssuerProfile({
            did: did,
            name: name,
            pqcKeyFingerprint: pqcKeyFingerprint,
            isAuthorized: true,
            registeredAt: block.timestamp,
            statusUpdatedAt: block.timestamp
        });

        _didToAddress[didHash] = issuerAddress;

        emit IssuerRegistered(issuerAddress, did, name, pqcKeyFingerprint, block.timestamp);
    }

    /**
     * @notice Updates the authorization status of an issuer (e.g. suspend or reinstate).
     */
    function setIssuerStatus(address issuerAddress, bool isAuthorized) external onlyOwner {
        require(_issuers[issuerAddress].registeredAt > 0, "Issuer not registered");
        _issuers[issuerAddress].isAuthorized = isAuthorized;
        _issuers[issuerAddress].statusUpdatedAt = block.timestamp;

        emit IssuerStatusUpdated(issuerAddress, isAuthorized, block.timestamp);
    }

    /**
     * @notice Allows an authorized university to rotate their ML-DSA-65 post-quantum signing key.
     */
    function rotatePqcKeyFingerprint(bytes32 newPqcKeyFingerprint) external {
        require(_issuers[msg.sender].isAuthorized, "Sender is not an authorized issuer");
        require(newPqcKeyFingerprint != bytes32(0), "Invalid key fingerprint");

        bytes32 oldKey = _issuers[msg.sender].pqcKeyFingerprint;
        _issuers[msg.sender].pqcKeyFingerprint = newPqcKeyFingerprint;
        _issuers[msg.sender].statusUpdatedAt = block.timestamp;

        emit IssuerPqcKeyRotated(msg.sender, oldKey, newPqcKeyFingerprint, block.timestamp);
    }

    /**
     * @notice Checks if an address is currently an authorized university issuer.
     */
    function isIssuerAuthorized(address issuerAddress) external view returns (bool) {
        return _issuers[issuerAddress].isAuthorized;
    }

    /**
     * @notice Retrieves the full profile of an issuer.
     */
    function getIssuerProfile(address issuerAddress) external view returns (IssuerProfile memory) {
        require(_issuers[issuerAddress].registeredAt > 0, "Issuer not registered");
        return _issuers[issuerAddress];
    }

    /**
     * @notice Resolves an issuer address by their W3C DID string.
     */
    function resolveIssuerByDid(string calldata did) external view returns (address) {
        address issuerAddr = _didToAddress[keccak256(bytes(did))];
        require(issuerAddr != address(0), "DID not found");
        return issuerAddr;
    }
}
