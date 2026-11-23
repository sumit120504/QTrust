import request from "supertest";
import { app } from "../src/server";

describe("Q-Trust Backend API & W3C DID / VC 2.0 Integration Suite", () => {
  let issuedCredential: any;
  let generatedProofPayload: any;

  // 1. Health & Cryptographic Telemetry
  it("GET /api/health should return cryptographic engines and smart contract addresses", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("HEALTHY");
    expect(res.body.cryptography.postQuantumSignature).toContain("ML-DSA-65");
    expect(res.body.cryptography.zeroKnowledgeProof).toContain("Groth16 on BN254");
    expect(res.body.blockchain.contracts.IssuerRegistry).toBeDefined();
  });

  // 2. W3C DID Resolution
  it("GET /api/did/:did should resolve a canonical W3C DID Document with separated key purposes", async () => {
    const testDid = "did:qtrust:polygon:0x8f72a91c3d0e28b847125e9821a4f49b10c5512b";
    const res = await request(app).get(`/api/did/${testDid}`);
    expect(res.status).toBe(200);
    expect(res.body.didDocument.id).toBe(testDid);
    expect(res.body.didDocument.authentication.length).toBeGreaterThan(0);
    expect(res.body.didDocument.assertionMethod.length).toBeGreaterThan(0);
    expect(res.body.didDocument.keyAgreement.length).toBeGreaterThan(0);
  });

  // 3. Credential Issuance Pipeline
  it("POST /api/credentials/issue should issue a W3C VC 2.0 accredited degree signed with ML-DSA-65", async () => {
    const payload = {
      universityDid: "did:qtrust:university:uem_jaipur",
      universityName: "University of Engineering & Management Jaipur",
      studentDid: "did:qtrust:holder:8f72a91c3d0e",
      claims: {
        degree: "B.Tech Computer Science & Engineering",
        graduationYear: 2027,
        actualCgpaScaled: 870, // 8.70
        rollNumber: "UEMJ/2023/BTECH/CSE/042",
      },
    };

    const res = await request(app).post("/api/credentials/issue").send(payload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.credential.proof.algorithm).toContain("ML-DSA-65");
    expect(res.body.credential.proof.signatureSizeBytes).toBe(3309);
    expect(res.body.credential.credentialCommitment.hex).toMatch(/^0x[a-f0-9]{64}$/);
    expect(res.body.credential.ipfsStorage.cid).toContain("bafybei");

    issuedCredential = res.body.credential;
  });

  // 4. Zero-Knowledge Selective Disclosure Prover
  it("POST /api/proofs/generate should generate a real Groth16 selective disclosure proof for CGPA >= 7.50", async () => {
    const payload = {
      studentSecret: "123456789012345678901234567890",
      identityCommitment: "987654321098765432109876543210",
      actualCgpaScaled: "870",
      graduationYear: "2027",
      institutionId: "101",
      credentialSalt: "555554444433333222221111100000",
      thresholdCgpaScaled: "750",
    };

    const res = await request(app).post("/api/proofs/generate").send(payload);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.proof.protocol).toBe("groth16");
    expect(res.body.publicSignals.length).toBe(4);
    expect(res.body.calldataSolidity.a.length).toBe(2);

    generatedProofPayload = res.body;
  });

  it("POST /api/proofs/generate should reject sub-threshold CGPA claims (e.g. 6.80 < 7.50)", async () => {
    const payload = {
      studentSecret: "123456789012345678901234567890",
      identityCommitment: "987654321098765432109876543210",
      actualCgpaScaled: "680",
      graduationYear: "2027",
      institutionId: "101",
      credentialSalt: "555554444433333222221111100000",
      thresholdCgpaScaled: "750",
    };

    const res = await request(app).post("/api/proofs/generate").send(payload);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 5. 6-Stage Corporate Verification Audit
  it("POST /api/proofs/verify should execute 6-stage cryptographic audit report", async () => {
    const payload = {
      verifierName: "ABC Technologies (Enterprise HR Compliance)",
      proof: generatedProofPayload.proof,
      publicSignals: generatedProofPayload.publicSignals,
      credentialEnvelope: issuedCredential,
      thresholdCgpa: 750,
    };

    const res = await request(app).post("/api/proofs/verify").send(payload);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.auditReport.checks.length).toBe(6);
    expect(res.body.auditReport.receiptId).toMatch(/^0x[a-f0-9]{64}$/);
    expect(res.body.auditReport.provenPredicate).toContain("CGPA >= 7.50");
  });

  // 6. Ledger Explorer Telemetry
  it("GET /api/ledger/contracts and /transactions should return on-chain state stream", async () => {
    const contractsRes = await request(app).get("/api/ledger/contracts");
    expect(contractsRes.status).toBe(200);
    expect(contractsRes.body.contracts.QTrustAnchor).toBeDefined();

    const txRes = await request(app).get("/api/ledger/transactions");
    expect(txRes.status).toBe(200);
    expect(txRes.body.transactions.length).toBeGreaterThan(0);
  });
});
