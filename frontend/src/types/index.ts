export type AppRole = 'landing' | 'holder' | 'issuer' | 'verifier' | 'explorer' | 'benchmarks';

export interface DIDDocument {
  "@context": string[];
  id: string;
  verificationMethod: {
    id: string;
    type: string;
    controller: string;
    publicKeyMultibase: string;
  }[];
  authentication: string[];
}

export interface CredentialClaims {
  degree: string;
  major: string;
  cgpa: number; // Stored as scaled integer in circuit (e.g. 8.7 -> 870)
  graduationYear: number;
  studentName: string;
  studentRollNumber: string;
  dateOfBirth: string;
}

export interface CredentialEnvelope {
  credentialId: string;
  issuerDid: string;
  issuerName: string;
  holderDid: string;
  schemaHash: string;
  credentialCommitment: string; // Poseidon hash
  validityPeriod: {
    validFrom: string;
    expiresAt?: string;
  };
  revocationHandle: string; // Leaf in Sparse Merkle Tree
  mlDsaSignature: {
    algorithm: "ML-DSA-65" | "ML-DSA-44";
    signatureHex: string;
    publicKeyHash: string;
    fipsStandard: "FIPS-204";
  };
  encryptedPayloadCid: string; // IPFS CID of AES-256-GCM encrypted claims
  txHash: string;
  blockNumber: number;
  status: "ACTIVE" | "REVOKED";
}

export interface ZKProofPayload {
  circuitId: string;
  provingSystem: "Groth16" | "BN254";
  proof: {
    pi_a: [string, string, string];
    pi_b: [[string, string], [string, string], [string, string]];
    pi_c: [string, string, string];
    protocol: string;
    curve: string;
  };
  publicSignals: {
    credentialCommitment: string;
    thresholdCgpa: number; // e.g. 750 (7.5 scaled)
    revocationRoot: string;
    verifierChallenge: string;
    isSatisfied: boolean;
  };
  provenPredicates: {
    cgpaThresholdMet: boolean;
    claimedThreshold: number;
    nonRevokedProofVerified: boolean;
    identityBound: boolean;
  };
  revealedClaims: {
    degree: string;
    graduationYear: number;
    // Notice cgpa, rollNumber, dob are NOT in revealedClaims!
  };
}

export interface BlockchainTransaction {
  id: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  contract: "IssuerRegistry" | "CredentialRegistry" | "RevocationRegistry" | "ZKVerifier" | "IdentityRegistry";
  event: string;
  data: Record<string, any>;
  status: "CONFIRMED" | "PENDING";
}

export interface BenchmarkMetric {
  algorithm: string;
  type: "Classical (Pre-Quantum)" | "Post-Quantum (NIST FIPS 204)";
  keyGenTimeMs: number;
  signTimeMs: number;
  verifyTimeMs: number;
  publicKeySizeBytes: number;
  signatureSizeBytes: number;
  securityBitsEquivalent: number;
  quantumResistant: boolean;
}
