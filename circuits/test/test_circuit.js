const fs = require("fs");
const path = require("path");
const { buildPoseidon } = require("circomlibjs");
const snarkjs = require("snarkjs");

async function main() {
  console.log("============================================================");
  console.log("Q-Trust Zero-Knowledge Circuit Verification Test Suite");
  console.log("Circuit: CgpaThreshold (Groth16 on BN254 Curve)");
  console.log("============================================================\n");

  const poseidon = await buildPoseidon();
  const F = poseidon.F;

  const wasmPath = path.join(__dirname, "../build/cgpa_threshold_js/cgpa_threshold.wasm");
  const zkeyPath = path.join(__dirname, "../build/cgpa_threshold_final.zkey");
  const vKeyPath = path.join(__dirname, "../build/verification_key.json");
  const vKey = JSON.parse(fs.readFileSync(vKeyPath, "utf8"));

  // Common Scholar Credential Attributes
  const studentSecret = "123456789012345678901234567890";
  const identityCommitment = "987654321098765432109876543210";
  const graduationYear = "2027";
  const institutionId = "101"; // e.g. UEM Jaipur ID
  const credentialSalt = "555554444433333222221111100000";

  // Helper to compute Poseidon commitment
  function computeCommitment(actualCgpa) {
    const rawHash = poseidon([
      BigInt(studentSecret),
      BigInt(identityCommitment),
      BigInt(actualCgpa),
      BigInt(graduationYear),
      BigInt(institutionId),
      BigInt(credentialSalt),
    ]);
    return F.toString(rawHash);
  }

  // --------------------------------------------------------------------------
  // TEST 1: Valid Selective Disclosure (Actual: 8.70 >= Threshold: 7.50)
  // --------------------------------------------------------------------------
  console.log("[TEST 1] Valid Claim: Scholar CGPA 8.70 >= Required 7.50");
  const actualCgpaValid = "870";
  const thresholdValid = "750";
  const validCommitment = computeCommitment(actualCgpaValid);

  const validWitnessInput = {
    // Public signals
    credentialCommitment: validCommitment,
    thresholdCgpaScaled: thresholdValid,
    requiredGraduationYear: graduationYear,
    expectedInstitutionId: institutionId,
    // Private signals
    studentSecret,
    identityCommitment,
    actualCgpaScaled: actualCgpaValid,
    graduationYear,
    institutionId,
    credentialSalt,
  };

  const startTime = Date.now();
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    validWitnessInput,
    wasmPath,
    zkeyPath
  );
  const proofDuration = Date.now() - startTime;
  console.log(`  ✓ Groth16 Proof Generated in ${proofDuration}ms`);
  console.log(`  ✓ Public Signals count: ${publicSignals.length}`);

  const verifyStart = Date.now();
  const isVerified = await snarkjs.groth16.verify(vKey, publicSignals, proof);
  const verifyDuration = Date.now() - verifyStart;
  console.log(`  ✓ Proof Verification: ${isVerified ? "PASSED (Cryptographically Valid)" : "FAILED"} (${verifyDuration}ms)`);
  if (!isVerified) throw new Error("TEST 1 Failed: Expected proof to verify!");

  // --------------------------------------------------------------------------
  // TEST 2: Exact Boundary Check (Actual: 7.50 == Threshold: 7.50)
  // --------------------------------------------------------------------------
  console.log("\n[TEST 2] Boundary Condition: Actual 7.50 == Required 7.50");
  const actualCgpaBoundary = "750";
  const boundaryCommitment = computeCommitment(actualCgpaBoundary);
  const boundaryInput = {
    ...validWitnessInput,
    actualCgpaScaled: actualCgpaBoundary,
    credentialCommitment: boundaryCommitment,
    thresholdCgpaScaled: "750",
  };

  const { proof: bProof, publicSignals: bSignals } = await snarkjs.groth16.fullProve(
    boundaryInput,
    wasmPath,
    zkeyPath
  );
  const isBoundaryVerified = await snarkjs.groth16.verify(vKey, bSignals, bProof);
  console.log(`  ✓ Boundary Verification: ${isBoundaryVerified ? "PASSED" : "FAILED"}`);
  if (!isBoundaryVerified) throw new Error("TEST 2 Failed: Boundary should pass!");

  // --------------------------------------------------------------------------
  // TEST 3: Negative Test - CGPA Below Threshold (Actual: 6.80 < Threshold: 7.50)
  // --------------------------------------------------------------------------
  console.log("\n[TEST 3] Security Enforcement: Actual 6.80 < Required 7.50 (Should Fail)");
  const actualCgpaLow = "680";
  const lowCommitment = computeCommitment(actualCgpaLow);
  const lowInput = {
    ...validWitnessInput,
    actualCgpaScaled: actualCgpaLow,
    credentialCommitment: lowCommitment,
    thresholdCgpaScaled: "750",
  };

  let rejected = false;
  try {
    await snarkjs.groth16.fullProve(lowInput, wasmPath, zkeyPath);
  } catch (err) {
    rejected = true;
    console.log(`  ✓ Circuit Constraint Correctly Rejected Witness Generation:`);
    console.log(`    "${err.message.slice(0, 80)}..."`);
  }
  if (!rejected) throw new Error("TEST 3 Failed: Circuit did not reject sub-threshold CGPA!");

  // --------------------------------------------------------------------------
  // TEST 4: Security Enforcement - Tampered Public Signal
  // --------------------------------------------------------------------------
  console.log("\n[TEST 4] Tamper Detection: Attacker alters threshold public signal in transit");
  const tamperedSignals = [...publicSignals];
  // Tamper with threshold from 750 to 900
  tamperedSignals[1] = "900";
  const isTamperVerified = await snarkjs.groth16.verify(vKey, tamperedSignals, proof);
  console.log(`  ✓ Tampered Public Input Verification: ${isTamperVerified ? "ACCEPTED (BAD)" : "REJECTED (SECURE)"}`);
  if (isTamperVerified) throw new Error("TEST 4 Failed: Tampered signal should NOT verify!");

  console.log("\n============================================================");
  console.log("ALL ZERO-KNOWLEDGE CIRCUIT TESTS PASSED SUCCESSFULLY! (4/4)");
  console.log("============================================================");
}

main().catch((err) => {
  console.error("Test Suite Error:", err);
  process.exit(1);
});
