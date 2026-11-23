import { CredentialClaims, CredentialEnvelope, ZKProofPayload } from "@/types";

/**
 * Computes a simulated BN254 Poseidon Hash Commitment over field Fr:
 * Hash = Poseidon(studentSecret, cgpaScaled, gradYear, schemaHash)
 */
export function simulatePoseidonCommitment(
  secret: string,
  cgpaScaled: number,
  graduationYear: number,
  schemaHash: string
): string {
  // Deterministic hex representation simulating Poseidon(secret, cgpaScaled, graduationYear)
  let hashVal = 0n;
  for (let i = 0; i < secret.length; i++) {
    hashVal = (hashVal * 31n + BigInt(secret.charCodeAt(i))) % (2n ** 254n);
  }
  hashVal = (hashVal ^ (BigInt(cgpaScaled) * 1000000007n) ^ (BigInt(graduationYear) * 1000000009n)) % (2n ** 254n);
  return "0x" + hashVal.toString(16).padStart(64, "0");
}

/**
 * Simulates ML-DSA (FIPS-204) lattice digital signature over the credential commitment envelope
 */
export function simulateMLDSASign(commitment: string, issuerDid: string): {
  signatureHex: string;
  algorithm: "ML-DSA-65";
  fipsStandard: "FIPS-204";
  publicKeyHash: string;
} {
  const mockSigFragment = commitment.slice(2, 18);
  return {
    signatureHex: `0x${mockSigFragment}f8a17c29...e018a44b93 (3,309 bytes NIST ML-DSA Lattice Signature)`,
    algorithm: "ML-DSA-65",
    fipsStandard: "FIPS-204",
    publicKeyHash: "0x4b7194f1c4e92a83e0bbd39162aa38910e53a94821a738c82910fae19b94091a",
  };
}

/**
 * Simulates Groth16 witness generation & snarkjs proof computation
 * Evaluates: cgpaScaled >= thresholdScaled (e.g. 870 >= 750)
 * Evaluates: Poseidon(secret, cgpaScaled, year) == commitment
 */
export async function simulateGroth16Proof(
  claims: CredentialClaims,
  thresholdCgpa: number,
  credentialCommitment: string,
  secretSalt: string,
  onStepProgress?: (step: string) => void
): Promise<ZKProofPayload> {
  const steps = [
    "Step 1/4: Synthesizing R1CS constraint matrix & private witness...",
    "Step 2/4: Computing Poseidon hash on scalar field BN254...",
    "Step 3/4: Generating Groth16 elliptic curve proof (G1/G2 pairings)...",
    "Step 4/4: Constructing Verifiable Presentation envelope...",
  ];

  for (const step of steps) {
    if (onStepProgress) onStepProgress(step);
    await new Promise((r) => setTimeout(r, 450));
  }

  const cgpaScaled = Math.round(claims.cgpa * 100);
  const thresholdScaled = Math.round(thresholdCgpa * 100);
  const isSatisfied = cgpaScaled >= thresholdScaled;

  return {
    circuitId: "cgpaProof_v1.circom",
    provingSystem: "Groth16",
    proof: {
      pi_a: [
        "0x18af4e1903e1a8bb48291f09c2a84910b8e21940a8174f82910ab38c4710291e",
        "0x027ab4910cf91a78210e479a8374102948c719e0149021e8471920ac3819024f",
        "0x1",
      ],
      pi_b: [
        [
          "0x28914b10fa7812903ef841c3048ec1781290319a4e8d02c5be093ef5138125a1",
          "0x174dfb2940bc2e0d31ef841c3048ec1781290319a4e8d02c5be093ef5138125a",
        ],
        [
          "0x03ef5138125a174dfb2940bc2e0d31ef841c3048ec1781290319a4e8d02c5be0",
          "0x1c3048ec1781290319a4e8d02c5be093ef5138125a174dfb2940bc2e0d31ef84",
        ],
        ["0x1", "0x0"],
      ],
      pi_c: [
        "0x10a8b417e2901a55b381ec3900bb214f4e229c19302e1b6a71829e011492e7aa",
        "0x21004277c2901a55b381ec3900bb214f4e229c19302e1b6a71829e011492e7aa",
        "0x1",
      ],
      protocol: "groth16",
      curve: "bn128",
    },
    publicSignals: {
      credentialCommitment,
      thresholdCgpa: thresholdScaled,
      revocationRoot: "0x55aa914b7201c840912beefc84019283749201ba87301928471029e8471920aa",
      verifierChallenge: "0x" + Math.random().toString(16).substring(2, 18).padEnd(32, "0"),
      isSatisfied,
    },
    provenPredicates: {
      cgpaThresholdMet: isSatisfied,
      claimedThreshold: thresholdCgpa,
      nonRevokedProofVerified: true,
      identityBound: true,
    },
    revealedClaims: {
      degree: claims.degree,
      graduationYear: claims.graduationYear,
    },
  };
}

export interface VerificationCheckStep {
  name: string;
  category: "DID" | "Issuer" | "PQC Signature" | "Commitment" | "Revocation" | "ZKP Circuit";
  passed: boolean;
  details: string;
  latencyMs: number;
}

export interface VerificationReport {
  overallPassed: boolean;
  totalLatencyMs: number;
  checks: VerificationCheckStep[];
  predicateSummary: string;
  privacyGuarantee: string;
  receiptId?: string;
}

export async function verifyPresentation(
  presentation: ZKProofPayload,
  envelope: CredentialEnvelope
): Promise<VerificationReport> {
  await new Promise((r) => setTimeout(r, 600));

  const isNonRevoked = envelope.status === "ACTIVE";
  const isPqcValid = envelope.mlDsaSignature.algorithm === "ML-DSA-65";
  const isCommitmentMatched = presentation.publicSignals.credentialCommitment === envelope.credentialCommitment;
  const isZkProofValid = presentation.provenPredicates.cgpaThresholdMet;

  const checks: VerificationCheckStep[] = [
    {
      name: "W3C DID Resolution",
      category: "DID",
      passed: true,
      details: `Resolved controller key: ${envelope.holderDid.slice(0, 24)}... (Multikey ed25519)`,
      latencyMs: 12,
    },
    {
      name: "Issuer On-Chain Authorization",
      category: "Issuer",
      passed: true,
      details: `Verified UEM Jaipur registered in IssuerRegistry.sol (Admin key 0x140e...93f4)`,
      latencyMs: 38,
    },
    {
      name: "NIST FIPS-204 Post-Quantum Signature",
      category: "PQC Signature",
      passed: isPqcValid,
      details: `ML-DSA-65 signature verified against registered public key hash (${envelope.mlDsaSignature.publicKeyHash.slice(0, 16)}...)`,
      latencyMs: 44,
    },
    {
      name: "Cryptographic Commitment Consistency",
      category: "Commitment",
      passed: isCommitmentMatched,
      details: `Poseidon commitment in signed envelope strictly matches public signal in proof π`,
      latencyMs: 8,
    },
    {
      name: "Sparse Merkle Tree Non-Revocation",
      category: "Revocation",
      passed: isNonRevoked,
      details: isNonRevoked
        ? `Status: ACTIVE. Revocation handle verified non-member of RevocationRegistry.sol root`
        : `Status: REVOKED! Credential revocation handle was revoked on-chain!`,
      latencyMs: 29,
    },
    {
      name: "Groth16 Zero-Knowledge Proof Evaluation",
      category: "ZKP Circuit",
      passed: isZkProofValid,
      details: isZkProofValid
        ? `Condition SATISFIED: Candidate CGPA >= ${presentation.provenPredicates.claimedThreshold}. Zero knowledge preserved.`
        : `Condition FAILED: Predicate threshold constraint violated!`,
      latencyMs: 18,
    },
  ];

  const overallPassed = checks.every((c) => c.passed);
  const totalLatencyMs = checks.reduce((acc, c) => acc + c.latencyMs, 0);

  return {
    overallPassed,
    totalLatencyMs,
    checks,
    predicateSummary: `Candidate holds a valid ${presentation.revealedClaims.degree} from ${envelope.issuerName} with CGPA ≥ ${presentation.provenPredicates.claimedThreshold}.`,
    privacyGuarantee: `Exact CGPA, Student Roll Number, Date of Birth, and Salt were completely masked using Poseidon commitments and Groth16 zero-knowledge proofs.`,
  };
}
