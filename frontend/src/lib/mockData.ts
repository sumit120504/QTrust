import { CredentialClaims, CredentialEnvelope, BlockchainTransaction, BenchmarkMetric, DIDDocument } from "@/types";

export const STUDENT_DID = "did:qtrust:polygon:0x8f72a91c3d0e28b847125e9821a4f49b10c5512b";
export const ISSUER_DID = "did:qtrust:issuer:uem-jaipur";

export const STUDENT_DID_DOCUMENT: DIDDocument = {
  "@context": ["https://www.w3.org/ns/did/v1"],
  id: STUDENT_DID,
  verificationMethod: [
    {
      id: `${STUDENT_DID}#key-1`,
      type: "Multikey",
      controller: STUDENT_DID,
      publicKeyMultibase: "z6MkuV3Z9bK8...x9Wq",
    },
  ],
  authentication: [`${STUDENT_DID}#key-1`],
};

export const INITIAL_STUDENT_CLAIMS: CredentialClaims = {
  degree: "B.Tech Computer Science & Engineering",
  major: "Data Science & Cryptography",
  cgpa: 8.7,
  graduationYear: 2027,
  studentName: "Sumit Sharma",
  studentRollNumber: "UEMJ-CSE-2023-042",
  dateOfBirth: "2005-04-18",
};

export const INITIAL_CREDENTIAL: CredentialEnvelope = {
  credentialId: "QT-2027-UEM-0042",
  issuerDid: ISSUER_DID,
  issuerName: "UEM Jaipur (University of Engineering & Management)",
  holderDid: STUDENT_DID,
  schemaHash: "0x89d2c20a9bf5186b2de581fefc39d4b0d0671bbd3c19e532b217e29cf9761a29",
  credentialCommitment: "0x19a4e8d02c5be093ef5138125a174dfb2940bc2e0d31ef841c3048ec17812903",
  validityPeriod: {
    validFrom: "2027-06-01T00:00:00Z",
  },
  revocationHandle: "0x77c2901a55b381ec3900bb214f4e229c19302e1b6a71829e011492e7aa210042",
  mlDsaSignature: {
    algorithm: "ML-DSA-65",
    fipsStandard: "FIPS-204",
    signatureHex: "0x5d4e...a38b (3,309 bytes NIST ML-DSA Lattice Signature)",
    publicKeyHash: "0x4b7194f1c4e92a83e0bbd39162aa38910e53a94821a738c82910fae19b94091a",
  },
  encryptedPayloadCid: "ipfs://QmZ8rTYq4K2v69Npx2WvK8Wk89LmMzX9Qx4Jk1vV7Np39c",
  txHash: "0x39a14d8721c0e3952f10b7e28a9b4cf610e47da091c304b821a0094e82b719f2",
  blockNumber: 4892014,
  status: "ACTIVE",
};

export const INITIAL_TRANSACTIONS: BlockchainTransaction[] = [
  {
    id: "tx-1",
    txHash: "0x7c91a0f443b2e01a89c30f4e190b2c5890df21a409b8214e007819feaa20b14e",
    blockNumber: 4891890,
    timestamp: "2026-11-20 10:14:22",
    contract: "IssuerRegistry",
    event: "IssuerRegistered",
    data: {
      issuerId: "0xuem_jaipur",
      admin: "0x140eB8c4bB190a48...93f4",
      publicKeyHash: "0x4b7194f1c4e92a83e0bbd39162aa38910e53a94821a738c82910fae19b94091a",
      algorithm: "ML-DSA-65 (FIPS 204)",
      keyVersion: 1,
    },
    status: "CONFIRMED",
  },
  {
    id: "tx-2",
    txHash: "0x39a14d8721c0e3952f10b7e28a9b4cf610e47da091c304b821a0094e82b719f2",
    blockNumber: 4892014,
    timestamp: "2026-11-20 11:32:05",
    contract: "CredentialRegistry",
    event: "CredentialIssued",
    data: {
      credentialId: "QT-2027-UEM-0042",
      commitment: "0x19a4e8d02c5be093ef5138125a174dfb2940bc2e0d31ef841c3048ec17812903",
      issuerId: "0xuem_jaipur",
      revocationHandle: "0x77c2901a55b381ec3900bb214f4e229c19302e1b6a71829e011492e7aa210042",
      schemaHash: "0x89d2c20a9bf5186b2de581fefc39d4b0d0671bbd3c19e532b217e29cf9761a29",
    },
    status: "CONFIRMED",
  },
  {
    id: "tx-3",
    txHash: "0x110fb82a048c719e349a0bb2491a0c7e2840ef91a274bb81920efc82914ba810",
    blockNumber: 4892050,
    timestamp: "2026-11-20 11:35:10",
    contract: "RevocationRegistry",
    event: "RevocationRootUpdated",
    data: {
      newRoot: "0x55aa914b7201c840912beefc84019283749201ba87301928471029e8471920aa",
      rootVersion: 1,
      accumulatedLeaves: 1,
    },
    status: "CONFIRMED",
  },
];

export const BENCHMARK_DATA: BenchmarkMetric[] = [
  {
    algorithm: "ECDSA (secp256k1)",
    type: "Classical (Pre-Quantum)",
    keyGenTimeMs: 0.85,
    signTimeMs: 1.12,
    verifyTimeMs: 2.34,
    publicKeySizeBytes: 64,
    signatureSizeBytes: 65,
    securityBitsEquivalent: 128,
    quantumResistant: false,
  },
  {
    algorithm: "ML-DSA-44",
    type: "Post-Quantum (NIST FIPS 204)",
    keyGenTimeMs: 0.42,
    signTimeMs: 1.84,
    verifyTimeMs: 0.61,
    publicKeySizeBytes: 1312,
    signatureSizeBytes: 2420,
    securityBitsEquivalent: 128,
    quantumResistant: true,
  },
  {
    algorithm: "ML-DSA-65 (Q-Trust Choice)",
    type: "Post-Quantum (NIST FIPS 204)",
    keyGenTimeMs: 0.68,
    signTimeMs: 2.45,
    verifyTimeMs: 0.89,
    publicKeySizeBytes: 1952,
    signatureSizeBytes: 3309,
    securityBitsEquivalent: 192,
    quantumResistant: true,
  },
  {
    algorithm: "ML-DSA-87",
    type: "Post-Quantum (NIST FIPS 204)",
    keyGenTimeMs: 1.15,
    signTimeMs: 3.20,
    verifyTimeMs: 1.22,
    publicKeySizeBytes: 2592,
    signatureSizeBytes: 4627,
    securityBitsEquivalent: 256,
    quantumResistant: true,
  },
];

export const CONTRACT_ADDRESSES = {
  QTrustController: "0x89205A3A3b2A6632ef64FBac487085790C240E19",
  IssuerRegistry: "0x2F7f1d46b2b4C649692484a86b96E58b9cf2a7b8",
  IdentityRegistry: "0x51A25368aE7403487f2874bc298E1535E6D4B7f9",
  CredentialRegistry: "0xAc916B27B55711B86aD4D54133A17dF7E3C8B953",
  RevocationRegistry: "0xD06B579123c52A9D710188b776263B964Fe68E2D",
  Groth16Verifier: "0x44E0499C6A3982A153f36a8E05f7787B2E3dAc02",
};
