// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./IssuerRegistry.sol";

/**
 * @title CredentialRegistry
 * @notice Maintains on-chain commitments and lifecycle state for academic credentials.
 *         Maintains zero PII on-chain by storing only 32-byte algebraic Poseidon commitments.
 */
contract CredentialRegistry {
    enum CredentialStatus { NONE, ACTIVE, REVOKED, SUSPENDED }

    struct CredentialRecord {
        bytes32 commitment;             // 32-byte Poseidon hash commitment
        address issuer;                 // University wallet address
        string issuerDid;               // University DID
        uint256 issuedAt;               // Block timestamp of issuance
        CredentialStatus status;        // ACTIVE / REVOKED / SUSPENDED
        uint256 statusUpdatedAt;        // Timestamp of status transition
    }

    IssuerRegistry public immutable issuerRegistry;

    // Mapping from commitment to on-chain record
    mapping(bytes32 => CredentialRecord) private _credentials;

    // Events
    event CredentialAnchored(
        bytes32 indexed commitment, 
        address indexed issuer, 
        string issuerDid, 
        uint256 timestamp
    );
    event CredentialStatusChanged(
        bytes32 indexed commitment, 
        CredentialStatus oldStatus, 
        CredentialStatus newStatus, 
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
     * @notice Anchors a single Poseidon credential commitment on-chain.
     */
    function anchorCredential(bytes32 commitment, string calldata issuerDid) external onlyAuthorizedIssuer {
        require(commitment != bytes32(0), "Invalid commitment");
        require(_credentials[commitment].status == CredentialStatus.NONE, "Credential already anchored");

        _credentials[commitment] = CredentialRecord({
            commitment: commitment,
            issuer: msg.sender,
            issuerDid: issuerDid,
            issuedAt: block.timestamp,
            status: CredentialStatus.ACTIVE,
            statusUpdatedAt: block.timestamp
        });

        emit CredentialAnchored(commitment, msg.sender, issuerDid, block.timestamp);
    }

    /**
     * @notice Batch anchors multiple credential commitments (e.g. for an entire graduating cohort).
     */
    function batchAnchorCredentials(
        bytes32[] calldata commitments, 
        string calldata issuerDid
    ) external onlyAuthorizedIssuer {
        require(commitments.length > 0, "Empty commitments array");
        require(commitments.length <= 250, "Batch exceeds max size of 250");

        for (uint256 i = 0; i < commitments.length; i++) {
            bytes32 c = commitments[i];
            require(c != bytes32(0), "Invalid commitment in batch");
            require(_credentials[c].status == CredentialStatus.NONE, "Commitment already anchored");

            _credentials[c] = CredentialRecord({
                commitment: c,
                issuer: msg.sender,
                issuerDid: issuerDid,
                issuedAt: block.timestamp,
                status: CredentialStatus.ACTIVE,
                statusUpdatedAt: block.timestamp
            });

            emit CredentialAnchored(c, msg.sender, issuerDid, block.timestamp);
        }
    }

    /**
     * @notice Updates the lifecycle status of a credential (e.g. Revoke or Suspend).
     *         Only the issuing university can update status.
     */
    function updateCredentialStatus(bytes32 commitment, CredentialStatus newStatus) external {
        CredentialRecord storage record = _credentials[commitment];
        require(record.status != CredentialStatus.NONE, "Credential not found");
        require(record.issuer == msg.sender, "Only issuing university can modify credential lifecycle");
        require(newStatus != CredentialStatus.NONE, "Cannot reset to NONE");

        CredentialStatus oldStatus = record.status;
        record.status = newStatus;
        record.statusUpdatedAt = block.timestamp;

        emit CredentialStatusChanged(commitment, oldStatus, newStatus, block.timestamp);
    }

    /**
     * @notice Checks if a credential commitment is active and valid.
     */
    function isCredentialValid(bytes32 commitment) external view returns (bool) {
        CredentialRecord storage record = _credentials[commitment];
        if (record.status != CredentialStatus.ACTIVE) {
            return false;
        }
        // Also check if the issuing university is still authorized
        return issuerRegistry.isIssuerAuthorized(record.issuer);
    }

    /**
     * @notice Retrieves credential details.
     */
    function getCredentialRecord(bytes32 commitment) external view returns (CredentialRecord memory) {
        require(_credentials[commitment].status != CredentialStatus.NONE, "Credential not found");
        return _credentials[commitment];
    }
}
