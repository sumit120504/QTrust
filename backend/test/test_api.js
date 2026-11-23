const assert = require("assert");
const request = require("supertest");
const { app } = require("../dist/server");

async function runTests() {
  console.log("============================================================");
  console.log("Q-Trust Backend API & W3C Integration Test Suite");
  console.log("Testing W3C DID, VC 2.0, Groth16 Prover & 6-Stage Audit");
  console.log("============================================================\n");

  let issuedCredential = null;
  let generatedProofPayload = null;

  // 1. Health & Cryptographic Telemetry
  console.log("[TEST 1] GET /api/health");
  const resHealth = await request(app).get("/api/health");
  assert.strictEqual(resHealth.status, 200);
  assert.strictEqual(resHealth.body.status, "HEALTHY");
  assert.ok(resHealth.body.cryptography.postQuantumSignature.includes("ML-DSA-65"));
  assert.ok(resHealth.body.cryptography.zeroKnowledgeProof.includes("Groth16 on BN254"));
  assert.ok(resHealth.body.blockchain.contracts.IssuerRegistry);
  console.log("  ✓ Status: HEALTHY");
  console.log(`  ✓ PQC Signature: ${resHealth.body.cryptography.postQuantumSignature}`);
  console.log(`  ✓ ZKP Prover: ${resHealth.body.cryptography.zeroKnowledgeProof}`);

  // 2. W3C DID Resolution
  console.log("\n[TEST 2] GET /api/did/:did (W3C DID Core 1.0 Resolution)");
  const testDid = "did:qtrust:polygon:0x8f72a91c3d0e28b847125e9821a4f49b10c5512b";
  const resDid = await request(app).get(`/api/did/${testDid}`);
  assert.strictEqual(resDid.status, 200);
  assert.strictEqual(resDid.body.didDocument.id, testDid);
  assert.strictEqual(resDid.body.didDocument.verificationMethod.length, 3);
  assert.strictEqual(resDid.body.didDocument.authentication[0], `${testDid}#key-1`);
  assert.strictEqual(resDid.body.didDocument.assertionMethod[0], `${testDid}#pqc-mldsa-1`);
  assert.strictEqual(resDid.body.didDocument.keyAgreement[0], `${testDid}#pqc-kem-1`);
  console.log(`  ✓ Resolved DID: ${testDid}`);
  console.log(`  ✓ Separated Key Purposes: Authentication, AssertionMethod (PQC), KeyAgreement`);

  // 3. Credential Issuance Pipeline (W3C VC 2.0)
  console.log("\n[TEST 3] POST /api/credentials/issue (W3C VC 2.0 Issuance)");
  const issuePayload = {
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
  const resIssue = await request(app).post("/api/credentials/issue").send(issuePayload);
  assert.strictEqual(resIssue.status, 201);
  assert.strictEqual(resIssue.body.success, true);
  assert.strictEqual(resIssue.body.credential.proof.signatureSizeBytes, 3309);
  assert.ok(resIssue.body.credential.credentialCommitment.hex.startsWith("0x"));
  assert.ok(resIssue.body.credential.ipfsStorage.cid.startsWith("bafybei"));
  issuedCredential = resIssue.body.credential;
  console.log(`  ✓ Issued Credential ID: ${issuedCredential.id}`);
  console.log(`  ✓ ML-DSA-65 Signature Size: ${issuedCredential.proof.signatureSizeBytes} bytes`);
  console.log(`  ✓ Poseidon Commitment: ${issuedCredential.credentialCommitment.hex}`);
  console.log(`  ✓ IPFS Content-Addressed URI: ${issuedCredential.ipfsStorage.encryptedUri}`);

  // 4. Zero-Knowledge Proof Generation (Scholar Vault)
  console.log("\n[TEST 4] POST /api/proofs/generate (Groth16 Selective Disclosure Prover)");
  const proofPayload = {
    studentSecret: "123456789012345678901234567890",
    identityCommitment: "987654321098765432109876543210",
    actualCgpaScaled: "870",
    graduationYear: "2027",
    institutionId: "101",
    credentialSalt: "555554444433333222221111100000",
    thresholdCgpaScaled: "750",
  };
  const resProof = await request(app).post("/api/proofs/generate").send(proofPayload);
  assert.strictEqual(resProof.status, 200);
  assert.strictEqual(resProof.body.success, true);
  assert.strictEqual(resProof.body.proof.protocol, "groth16");
  assert.strictEqual(resProof.body.publicSignals.length, 4);
  assert.strictEqual(resProof.body.calldataSolidity.a.length, 2);
  generatedProofPayload = resProof.body;
  console.log(`  ✓ Generated Proof Protocol: ${generatedProofPayload.proof.protocol}`);
  console.log(`  ✓ Prover Execution Duration: ${generatedProofPayload.provingDurationMs} ms`);
  console.log(`  ✓ Calldata Formatted for Groth16Verifier.sol`);

  // Sub-threshold check
  const lowCgpaPayload = { ...proofPayload, actualCgpaScaled: "680" };
  const resLow = await request(app).post("/api/proofs/generate").send(lowCgpaPayload);
  assert.strictEqual(resLow.status, 400);
  console.log(`  ✓ Sub-threshold claim (6.80 < 7.50) correctly rejected.`);

  // 5. 6-Stage Corporate Verification Audit
  console.log("\n[TEST 5] POST /api/proofs/verify (6-Stage Cryptographic Audit)");
  const verifyPayload = {
    verifierName: "ABC Technologies (Enterprise HR Compliance)",
    proof: generatedProofPayload.proof,
    publicSignals: generatedProofPayload.publicSignals,
    credentialEnvelope: issuedCredential,
    thresholdCgpa: 750,
  };
  const resVerify = await request(app).post("/api/proofs/verify").send(verifyPayload);
  assert.strictEqual(resVerify.status, 200);
  assert.strictEqual(resVerify.body.success, true);
  assert.strictEqual(resVerify.body.auditReport.checks.length, 6);
  assert.ok(resVerify.body.auditReport.receiptId.startsWith("0x"));
  console.log(`  ✓ Overall Passed: ${resVerify.body.auditReport.overallPassed}`);
  console.log(`  ✓ Proven Predicate: ${resVerify.body.auditReport.provenPredicate}`);
  console.log(`  ✓ Privacy Guarantee: ${resVerify.body.auditReport.privacyGuarantee}`);
  console.log(`  ✓ Unique Receipt ID: ${resVerify.body.auditReport.receiptId}`);
  for (const chk of resVerify.body.auditReport.checks) {
    console.log(`    - [${chk.passed ? "PASS" : "FAIL"}] ${chk.name} (${chk.latencyMs}ms)`);
  }

  // 6. On-Chain Ledger & Contract Telemetry
  console.log("\n[TEST 6] GET /api/ledger/contracts & GET /api/ledger/transactions");
  const resContracts = await request(app).get("/api/ledger/contracts");
  assert.strictEqual(resContracts.status, 200);
  assert.ok(resContracts.body.contracts.QTrustAnchor);
  console.log(`  ✓ QTrustAnchor Address: ${resContracts.body.contracts.QTrustAnchor}`);

  const resTx = await request(app).get("/api/ledger/transactions");
  assert.strictEqual(resTx.status, 200);
  assert.ok(resTx.body.transactions.length >= 4);
  console.log(`  ✓ Confirmed Indexed Events: ${resTx.body.transactions.length}`);

  console.log("\n============================================================");
  console.log("ALL BACKEND & W3C INTEGRATION TESTS PASSED (6/6)");
  console.log("============================================================\n");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
