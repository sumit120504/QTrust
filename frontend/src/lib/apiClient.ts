/**
 * Q-Trust Backend API Client
 * Connects the Frontend UI directly to the Phase 4 Express + Circom + ML-DSA-65 backend service.
 * Includes graceful offline fallback to local cryptographic simulation.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface BackendHealthResponse {
  status: string;
  service: string;
  version: string;
  cryptography: {
    postQuantumSignature: string;
    zeroKnowledgeProof: string;
    identityStandard: string;
    credentialStandard: string;
    commitmentScheme: string;
    sparseMerkleTreeRoot: string;
    storageEncryption: string;
  };
  blockchain: {
    network: string;
    contracts: Record<string, string>;
  };
  uptimeSeconds: number;
}

export interface IssueCredentialRequest {
  universityDid?: string;
  universityName?: string;
  studentDid?: string;
  claims: {
    degree: string;
    graduationYear: number;
    actualCgpaScaled: number; // e.g. 870 for 8.70
    rollNumber: string;
  };
  studentSecret?: string;
  credentialSalt?: string;
  institutionId?: string;
}

export interface IssueCredentialResponse {
  success: boolean;
  message: string;
  credential: any;
  onChainAnchorRequired: {
    contract: string;
    method: string;
    commitmentHex: string;
  };
}

export interface GenerateProofRequest {
  studentSecret?: string;
  identityCommitment?: string;
  actualCgpaScaled: string | number;
  graduationYear: string | number;
  institutionId?: string;
  credentialSalt?: string;
  thresholdCgpaScaled: string | number;
}

export interface GenerateProofResponse {
  success: boolean;
  message: string;
  provingDurationMs: number;
  proof: {
    pi_a: [string, string, string];
    pi_b: [[string, string], [string, string], [string, string]];
    pi_c: [string, string, string];
    protocol: string;
    curve: string;
  };
  publicSignals: string[];
  calldataSolidity?: {
    a: [string, string];
    b: [[string, string], [string, string]];
    c: [string, string];
    input: string[];
  };
}

export interface VerifyProofRequest {
  verifierName?: string;
  proof: any;
  publicSignals: string[];
  credentialEnvelope?: any;
  thresholdCgpa?: number;
}

export interface VerificationCheckStep {
  name: string;
  category: string;
  passed: boolean;
  details: string;
  latencyMs: number;
}

export interface AuditReport {
  overallPassed: boolean;
  totalLatencyMs: number;
  checks: VerificationCheckStep[];
  predicateSummary: string;
  privacyGuarantee: string;
  receiptId: string;
  auditTimestamp: string;
}

export interface VerifyProofResponse {
  success: boolean;
  auditReport: AuditReport;
}

export const ApiClient = {
  /**
   * Health & Telemetry check
   */
  async checkHealth(): Promise<BackendHealthResponse | null> {
    try {
      const res = await fetch(`${API_BASE}/api/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * Resolve W3C DID Core 1.0 Document
   */
  async resolveDid(did: string): Promise<any | null> {
    try {
      const res = await fetch(`${API_BASE}/api/did/${encodeURIComponent(did)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * Issue W3C VC 2.0 Credential with ML-DSA-65 & Poseidon Commitment
   */
  async issueCredential(data: IssueCredentialRequest): Promise<IssueCredentialResponse | null> {
    try {
      const res = await fetch(`${API_BASE}/api/credentials/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * Generate Groth16 Zero-Knowledge Selective Disclosure Proof
   */
  async generateProof(data: GenerateProofRequest): Promise<GenerateProofResponse | null> {
    try {
      const res = await fetch(`${API_BASE}/api/proofs/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * Verify Presentation through 6-Stage Cryptographic Audit
   */
  async verifyProof(data: VerifyProofRequest): Promise<VerifyProofResponse | null> {
    try {
      const res = await fetch(`${API_BASE}/api/proofs/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * Revoke credential and update Sparse Merkle Tree non-revocation root
   */
  async revokeCredential(commitmentHex: string, reason?: string): Promise<any | null> {
    try {
      const res = await fetch(`${API_BASE}/api/credentials/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commitmentHex, reason }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * Get Deployed Smart Contract Addresses
   */
  async getContracts(): Promise<Record<string, string> | null> {
    try {
      const res = await fetch(`${API_BASE}/api/ledger/contracts`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.contracts;
    } catch {
      return null;
    }
  },

  /**
   * Get Confirmed Blockchain Ledger Transactions
   */
  async getTransactions(): Promise<any[] | null> {
    try {
      const res = await fetch(`${API_BASE}/api/ledger/transactions`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.transactions;
    } catch {
      return null;
    }
  },

  /**
   * Retrieve Audit Receipt by ID
   */
  async getAuditReceipt(receiptId: string): Promise<any | null> {
    try {
      const res = await fetch(`${API_BASE}/api/audit/receipt/${encodeURIComponent(receiptId)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.receipt;
    } catch {
      return null;
    }
  },
};
