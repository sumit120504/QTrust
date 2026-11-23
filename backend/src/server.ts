import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { DIDResolver } from "./did/didResolver";
import { VcEngine } from "./credentials/vcEngine";
import { ZkpService } from "./zkp/zkpService";
import { BlockchainService } from "./contracts/blockchainService";
import { SparseMerkleTree } from "./credentials/sparseMerkleTree";
import { IpfsAdapter } from "./storage/ipfsAdapter";
import { Repository } from "./db/repository";

dotenv.config();

export const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const smt = new SparseMerkleTree();

// 1. Health & Cryptographic Telemetry Endpoint
app.get("/api/health", async (_req: Request, res: Response) => {
  const smtRoot = await smt.getRoot();
  res.json({
    status: "HEALTHY",
    service: "Q-Trust Privacy-Preserving & Post-Quantum Credential Gateway",
    version: "1.0.0",
    cryptography: {
      postQuantumSignature: "NIST FIPS 204 ML-DSA-65 (192-bit Quantum Security)",
      zeroKnowledgeProof: "Circom 2.2 / Groth16 on BN254 Pairing Curve",
      identityStandard: "W3C DID Core 1.0 (did:qtrust:...)",
      credentialStandard: "W3C Verifiable Credentials Data Model 2.0",
      commitmentScheme: "Poseidon Algebraic Hash (32-byte off-chain root)",
      sparseMerkleTreeRoot: smtRoot,
      storageEncryption: "AES-256-GCM (Client-Side Encrypted IPFS)",
    },
    blockchain: {
      network: "Ethereum Sepolia / Polygon Amoy",
      contracts: BlockchainService.getDeployedAddresses(),
    },
    uptimeSeconds: process.uptime(),
  });
});

// 2. W3C DID Document Resolution Endpoint
app.get("/api/did/:did", (req: Request, res: Response) => {
  const did = Array.isArray(req.params.did) ? req.params.did[0] : req.params.did;
  const resolution = DIDResolver.resolve(did);

  if (!resolution.didDocument) {
    return res.status(400).json(resolution);
  }
  return res.json(resolution);
});

// 3. Credential Issuance Endpoint (University Registrar)
app.post("/api/credentials/issue", async (req: Request, res: Response) => {
  try {
    const {
      universityDid = "did:qtrust:university:uem_jaipur",
      universityName = "University of Engineering & Management (UEM) Jaipur",
      studentDid = "did:qtrust:holder:8f72a91c3d0e",
      claims = {
        degree: "B.Tech Computer Science & Engineering",
        graduationYear: 2027,
        actualCgpaScaled: 870, // 8.70
        rollNumber: "UEMJ/2023/BTECH/CSE/042",
      },
      studentSecret = "123456789012345678901234567890",
      credentialSalt = "555554444433333222221111100000",
      institutionId = "101",
    } = req.body;

    const credentialEnvelope = await VcEngine.issueCredential(
      universityDid,
      universityName,
      studentDid,
      claims,
      studentSecret,
      credentialSalt,
      institutionId
    );

    // Save to repository
    Repository.saveCredential(credentialEnvelope);

    return res.status(201).json({
      success: true,
      message: "Academic degree credential successfully issued and signed with NIST FIPS 204 ML-DSA-65.",
      credential: credentialEnvelope,
      onChainAnchorRequired: {
        contract: "CredentialRegistry",
        method: "anchorCredential(bytes32 commitment, string issuerDid)",
        commitmentHex: credentialEnvelope.credentialCommitment.hex,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to issue credential",
    });
  }
});

// 4. Credential Revocation Endpoint (University Registrar)
app.post("/api/credentials/revoke", async (req: Request, res: Response) => {
  try {
    const { commitmentHex, reason = "Degree conferral superseded or revoked" } = req.body;
    if (!commitmentHex) {
      return res.status(400).json({ success: false, error: "Missing commitmentHex" });
    }

    const newSmtRoot = await smt.revoke(commitmentHex);
    Repository.revokeCredential(commitmentHex, reason);

    return res.json({
      success: true,
      message: "Credential revoked. Sparse Merkle Tree non-revocation root updated.",
      commitmentHex,
      newSmtRoot,
      revocationTimestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to revoke credential",
    });
  }
});

// 5. Zero-Knowledge Proof Generation Endpoint (Scholar Vault Prover)
app.post("/api/proofs/generate", async (req: Request, res: Response) => {
  try {
    const {
      studentSecret = "123456789012345678901234567890",
      identityCommitment = "987654321098765432109876543210",
      actualCgpaScaled = "870",
      graduationYear = "2027",
      institutionId = "101",
      credentialSalt = "555554444433333222221111100000",
      thresholdCgpaScaled = "750",
    } = req.body;

    // Check if sub-threshold
    if (parseInt(actualCgpaScaled) < parseInt(thresholdCgpaScaled)) {
      return res.status(400).json({
        success: false,
        error: "Predicate failed: Actual CGPA is below the claimed corporate threshold.",
      });
    }

    const proofResult = await ZkpService.generateProof({
      studentSecret,
      identityCommitment,
      actualCgpaScaled,
      graduationYear,
      institutionId,
      credentialSalt,
      thresholdCgpaScaled,
    });

    return res.json({
      success: true,
      message: "Groth16 Zero-Knowledge Selective Disclosure Proof generated successfully.",
      provingDurationMs: proofResult.durationMs,
      proof: proofResult.proof,
      publicSignals: proofResult.publicSignals,
      calldataSolidity: proofResult.calldataSolidity,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate ZK proof",
    });
  }
});

// 6. 6-Stage Cryptographic Audit Verification Endpoint (Corporate Verifier)
app.post("/api/proofs/verify", async (req: Request, res: Response) => {
  try {
    const {
      verifierName = "ABC Technologies (Enterprise HR Compliance)",
      proof,
      publicSignals,
      credentialEnvelope,
      thresholdCgpa = 750,
    } = req.body;

    const auditReport = await VcEngine.executeVerificationAudit(
      verifierName,
      proof,
      publicSignals || [],
      credentialEnvelope,
      thresholdCgpa
    );

    // Save audit receipt
    Repository.saveAuditReceipt(auditReport);

    return res.json({
      success: auditReport.overallPassed,
      auditReport,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Verification audit failed",
    });
  }
});

// 7. IPFS Encrypted Storage Endpoints
app.post("/api/storage/encrypt-pin", (req: Request, res: Response) => {
  try {
    const { payload, encryptionKeyHex = "0x98f411ba7823e410a0123456789abcdef" } = req.body;
    if (!payload) {
      return res.status(400).json({ success: false, error: "Missing payload" });
    }
    const encrypted = IpfsAdapter.encryptAndPin(payload, encryptionKeyHex);
    return res.json({ success: true, encrypted });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/storage/decrypt", (req: Request, res: Response) => {
  try {
    const { encryptedPayload, encryptionKeyHex = "0x98f411ba7823e410a0123456789abcdef" } = req.body;
    if (!encryptedPayload) {
      return res.status(400).json({ success: false, error: "Missing encryptedPayload" });
    }
    const decrypted = IpfsAdapter.decrypt(encryptedPayload, encryptionKeyHex);
    return res.json({ success: true, decrypted });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 8. On-Chain Ledger & Contract Telemetry Endpoints
app.get("/api/ledger/contracts", (_req: Request, res: Response) => {
  res.json({
    contracts: BlockchainService.getDeployedAddresses(),
  });
});

app.get("/api/ledger/transactions", (_req: Request, res: Response) => {
  res.json({
    transactions: BlockchainService.getRecentTransactions(),
  });
});

// 9. Audit Receipt Lookup Endpoint
app.get("/api/audit/receipt/:receiptId", (req: Request, res: Response) => {
  const receiptId = Array.isArray(req.params.receiptId) ? req.params.receiptId[0] : req.params.receiptId;
  const receipt = Repository.getAuditReceipt(receiptId);
  if (!receipt) {
    return res.status(404).json({ success: false, error: "Audit receipt not found" });
  }
  return res.json({ success: true, receipt });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Q-Trust Backend Gateway running on port ${PORT}`);
  });
}
