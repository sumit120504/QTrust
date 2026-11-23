// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./IssuerRegistry.sol";

/**
 * @title RevocationRegistry
 * @notice Anchors cryptographic Sparse Merkle Tree (SMT) non-revocation roots and status list hashes.
 *         Allows verifiers to verify off-chain non-revocation proofs against an immutable on-chain root.
 */
contract RevocationRegistry {
    IssuerRegistry public immutable issuerRegistry;

    struct RevocationState {
        bytes32 smtRoot;                // Sparse Merkle Tree non-revocation root
        bytes32 statusListHash;         // Hash of W3C StatusList2021 bitstring
        uint256 totalRevokedCount;      // Number of credentials revoked
        uint256 lastUpdatedAt;          // Timestamp
    }

    // Mapping from issuer address to their revocation state
    mapping(address => RevocationState) private _issuerRevocations;

    // Events
    event RevocationRootUpdated(
        address indexed issuer, 
        bytes32 oldSmtRoot, 
        bytes32 newSmtRoot, 
        bytes32 statusListHash,
        uint256 totalRevokedCount,
        uint256 timestamp
    );

    modifier onlyAuthorizedIssuer() {
        require(issuerRegistry.isIssuerAuthorized(msg.sender), "Caller is not an authorized university issuer");
        _;
    }

    constructor(address issuerRegistryAddress) {
        require(issuerRegistryAddress != address(0), "Invalid IssuerRegistry address");
        issuerRegistry = IssuerRegistry(issuerRegistryAddress);
    }

    /**
     * @notice Updates the university's SMT revocation root and status list hash.
     */
    function updateRevocationRoot(
        bytes32 newSmtRoot, 
        bytes32 statusListHash,
        uint256 totalRevokedCount
    ) external onlyAuthorizedIssuer {
        require(newSmtRoot != bytes32(0), "Invalid SMT root");

        bytes32 oldRoot = _issuerRevocations[msg.sender].smtRoot;
        _issuerRevocations[msg.sender] = RevocationState({
            smtRoot: newSmtRoot,
            statusListHash: statusListHash,
            totalRevokedCount: totalRevokedCount,
            lastUpdatedAt: block.timestamp
        });

        emit RevocationRootUpdated(
            msg.sender, 
            oldRoot, 
            newSmtRoot, 
            statusListHash, 
            totalRevokedCount, 
            block.timestamp
        );
    }

    /**
     * @notice Retrieves the current SMT root and status list state for an issuer.
     */
    function getRevocationState(address issuer) external view returns (RevocationState memory) {
        return _issuerRevocations[issuer];
    }
}
