const { expect } = require("chai");
const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");
const { buildPoseidon } = require("circomlibjs");
const snarkjs = require("snarkjs");

describe("Q-Trust Smart Contract & On-Chain ZKP Trust Architecture", function () {
  let governance, university, employer, student, adversary;
  let issuerRegistry, credentialRegistry, revocationRegistry, groth16Verifier, qTrustAnchor;
  let poseidon, F;

  const universityDid = "did:qtrust:university:uem_jaipur";
  const universityName = "University of Engineering & Management Jaipur";
  const samplePqcKeyFingerprint = "0x621569afd7e11e20d21a5c26b133a287530f2bcf6614b9b9c34224dc8b4a485c";

  before(async function () {
    [governance, university, employer, student, adversary] = await ethers.getSigners();
    poseidon = await buildPoseidon();
    F = poseidon.F;
  });

  beforeEach(async function () {
    // 1. Deploy IssuerRegistry
    const IssuerRegistryFactory = await ethers.getContractFactory("IssuerRegistry");
    issuerRegistry = await IssuerRegistryFactory.deploy(governance.address);
    await issuerRegistry.waitForDeployment();

    // 2. Deploy CredentialRegistry
    const CredentialRegistryFactory = await ethers.getContractFactory("CredentialRegistry");
    credentialRegistry = await CredentialRegistryFactory.deploy(await issuerRegistry.getAddress());
    await credentialRegistry.waitForDeployment();

    // 3. Deploy RevocationRegistry
    const RevocationRegistryFactory = await ethers.getContractFactory("RevocationRegistry");
    revocationRegistry = await RevocationRegistryFactory.deploy(await issuerRegistry.getAddress());
    await revocationRegistry.waitForDeployment();

    // 4. Deploy Groth16Verifier (generated from Circom Phase 1)
    const Groth16VerifierFactory = await ethers.getContractFactory("Groth16Verifier");
    groth16Verifier = await Groth16VerifierFactory.deploy();
    await groth16Verifier.waitForDeployment();

    // 5. Deploy Master Coordinator QTrustAnchor
    const QTrustAnchorFactory = await ethers.getContractFactory("QTrustAnchor");
    qTrustAnchor = await QTrustAnchorFactory.deploy(
      await issuerRegistry.getAddress(),
      await credentialRegistry.getAddress(),
      await revocationRegistry.getAddress(),
      await groth16Verifier.getAddress()
    );
    await qTrustAnchor.waitForDeployment();
  });

  describe("1. IssuerRegistry (Accreditation & PQC Key Anchoring)", function () {
    it("Should allow governance to register an accredited university with PQC key fingerprint", async function () {
      await expect(
        issuerRegistry.connect(governance).registerIssuer(
          university.address,
          universityDid,
          universityName,
          samplePqcKeyFingerprint
        )
      )
        .to.emit(issuerRegistry, "IssuerRegistered")
        .withArgs(university.address, universityDid, universityName, samplePqcKeyFingerprint, (t) => t > 0);

      const isAuth = await issuerRegistry.isIssuerAuthorized(university.address);
      expect(isAuth).to.equal(true);

      const profile = await issuerRegistry.getIssuerProfile(university.address);
      expect(profile.did).to.equal(universityDid);
      expect(profile.name).to.equal(universityName);
      expect(profile.pqcKeyFingerprint).to.equal(samplePqcKeyFingerprint);

      // Reverse resolution by DID
      const resolved = await issuerRegistry.resolveIssuerByDid(universityDid);
      expect(resolved).to.equal(university.address);
    });

    it("Should prevent non-governance addresses from registering universities", async function () {
      await expect(
        issuerRegistry.connect(adversary).registerIssuer(
          adversary.address,
          "did:qtrust:fake",
          "Fake University",
          samplePqcKeyFingerprint
        )
      ).to.be.revertedWithCustomError(issuerRegistry, "OwnableUnauthorizedAccount");
    });

    it("Should allow an authorized university to rotate its ML-DSA-65 key fingerprint", async function () {
      await issuerRegistry.connect(governance).registerIssuer(
        university.address,
        universityDid,
        universityName,
        samplePqcKeyFingerprint
      );

      const newKeyFingerprint = "0x9999999999999999999999999999999999999999999999999999999999999999";
      await expect(
        issuerRegistry.connect(university).rotatePqcKeyFingerprint(newKeyFingerprint)
      )
        .to.emit(issuerRegistry, "IssuerPqcKeyRotated")
        .withArgs(university.address, samplePqcKeyFingerprint, newKeyFingerprint, (t) => t > 0);

      const profile = await issuerRegistry.getIssuerProfile(university.address);
      expect(profile.pqcKeyFingerprint).to.equal(newKeyFingerprint);
    });
  });

  describe("2. CredentialRegistry (Poseidon Commitment Anchors & Revocation)", function () {
    const commitment = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

    beforeEach(async function () {
      await issuerRegistry.connect(governance).registerIssuer(
        university.address,
        universityDid,
        universityName,
        samplePqcKeyFingerprint
      );
    });

    it("Should allow authorized university to anchor a 32-byte credential commitment", async function () {
      await expect(
        credentialRegistry.connect(university).anchorCredential(commitment, universityDid)
      )
        .to.emit(credentialRegistry, "CredentialAnchored")
        .withArgs(commitment, university.address, universityDid, (t) => t > 0);

      const isValid = await credentialRegistry.isCredentialValid(commitment);
      expect(isValid).to.equal(true);

      const record = await credentialRegistry.getCredentialRecord(commitment);
      expect(record.issuer).to.equal(university.address);
      expect(record.status).to.equal(1); // ACTIVE
    });

    it("Should reject commitment anchoring from unauthorized callers", async function () {
      await expect(
        credentialRegistry.connect(adversary).anchorCredential(commitment, "did:qtrust:fake")
      ).to.be.revertedWith("Caller is not an authorized university issuer");
    });

    it("Should support batch anchoring of graduating cohort commitments", async function () {
      const cohort = [
        "0x1111111111111111111111111111111111111111111111111111111111111111",
        "0x2222222222222222222222222222222222222222222222222222222222222222",
        "0x3333333333333333333333333333333333333333333333333333333333333333",
      ];

      await credentialRegistry.connect(university).batchAnchorCredentials(cohort, universityDid);

      for (const c of cohort) {
        expect(await credentialRegistry.isCredentialValid(c)).to.equal(true);
      }
    });

    it("Should allow issuing university to revoke a credential and prevent unauthorized revocation", async function () {
      await credentialRegistry.connect(university).anchorCredential(commitment, universityDid);

      // Adversary attempts to revoke
      await expect(
        credentialRegistry.connect(adversary).updateCredentialStatus(commitment, 2) // 2 = REVOKED
      ).to.be.revertedWith("Only issuing university can modify credential lifecycle");

      // Legitimate university revokes
      await expect(
        credentialRegistry.connect(university).updateCredentialStatus(commitment, 2)
      )
        .to.emit(credentialRegistry, "CredentialStatusChanged")
        .withArgs(commitment, 1, 2, (t) => t > 0);

      expect(await credentialRegistry.isCredentialValid(commitment)).to.equal(false);
    });
  });

  describe("3. End-to-End On-Chain ZKP Presentation & Audit (QTrustAnchor)", function () {
    let wasmPath, zkeyPath;
    let studentSecret, identityCommitment, actualCgpaScaled, graduationYear, institutionId, credentialSalt;
    let validCommitmentDecimal, validCommitmentBytes32;

    before(async function () {
      wasmPath = path.join(__dirname, "../../circuits/build/cgpa_threshold_js/cgpa_threshold.wasm");
      zkeyPath = path.join(__dirname, "../../circuits/build/cgpa_threshold_final.zkey");

      // Verify circuit files exist
      if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath)) {
        throw new Error("Compiled circuit WASM or zkey missing from Phase 1!");
      }

      studentSecret = "123456789012345678901234567890";
      identityCommitment = "987654321098765432109876543210";
      actualCgpaScaled = "870"; // 8.70
      graduationYear = "2027";
      institutionId = "101"; // UEM Jaipur ID
      credentialSalt = "555554444433333222221111100000";

      // Compute Poseidon commitment
      const rawHash = poseidon([
        BigInt(studentSecret),
        BigInt(identityCommitment),
        BigInt(actualCgpaScaled),
        BigInt(graduationYear),
        BigInt(institutionId),
        BigInt(credentialSalt),
      ]);
      validCommitmentDecimal = F.toString(rawHash);
      validCommitmentBytes32 = "0x" + BigInt(validCommitmentDecimal).toString(16).padStart(64, "0");
    });

    beforeEach(async function () {
      // Register university and anchor commitment on-chain
      await issuerRegistry.connect(governance).registerIssuer(
        university.address,
        universityDid,
        universityName,
        samplePqcKeyFingerprint
      );

      await credentialRegistry.connect(university).anchorCredential(
        validCommitmentBytes32,
        universityDid
      );
    });

    it("Should generate real Groth16 ZK proof and verify it completely on-chain via QTrustAnchor", async function () {
      const thresholdCgpa = "750"; // Required >= 7.50

      const circuitInput = {
        credentialCommitment: validCommitmentDecimal,
        thresholdCgpaScaled: thresholdCgpa,
        requiredGraduationYear: graduationYear,
        expectedInstitutionId: institutionId,
        studentSecret,
        identityCommitment,
        actualCgpaScaled,
        graduationYear,
        institutionId,
        credentialSalt,
      };

      // Generate Groth16 Proof using snarkjs
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        circuitInput,
        wasmPath,
        zkeyPath
      );

      // Format proof for Solidity verifier
      const pA = [proof.pi_a[0], proof.pi_a[1]];
      const pB = [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]],
      ];
      const pC = [proof.pi_c[0], proof.pi_c[1]];
      const pInput = publicSignals;

      // Execute on-chain verification
      const tx = await qTrustAnchor.connect(employer).verifyCredentialPresentation(
        pA,
        pB,
        pC,
        pInput
      );
      const receipt = await tx.wait();

      // Verify event was emitted
      expect(tx).to.emit(qTrustAnchor, "CredentialAudited");

      // Verify on-chain state
      const isCommitmentValid = await credentialRegistry.isCredentialValid(validCommitmentBytes32);
      expect(isCommitmentValid).to.equal(true);
    });

    it("Should revert on-chain verification if the credential was revoked by the university", async function () {
      const thresholdCgpa = "750";

      const circuitInput = {
        credentialCommitment: validCommitmentDecimal,
        thresholdCgpaScaled: thresholdCgpa,
        requiredGraduationYear: graduationYear,
        expectedInstitutionId: institutionId,
        studentSecret,
        identityCommitment,
        actualCgpaScaled,
        graduationYear,
        institutionId,
        credentialSalt,
      };

      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        circuitInput,
        wasmPath,
        zkeyPath
      );

      const pA = [proof.pi_a[0], proof.pi_a[1]];
      const pB = [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]],
      ];
      const pC = [proof.pi_c[0], proof.pi_c[1]];
      const pInput = publicSignals;

      // University REVOKES the credential
      await credentialRegistry.connect(university).updateCredentialStatus(validCommitmentBytes32, 2);

      // Employer attempts to verify revoked credential on-chain
      await expect(
        qTrustAnchor.connect(employer).verifyCredentialPresentation(pA, pB, pC, pInput)
      ).to.be.revertedWith("Credential commitment is not active or has been revoked");
    });

    it("Should revert on-chain verification if an invalid/tampered proof is supplied", async function () {
      const thresholdCgpa = "750";

      const circuitInput = {
        credentialCommitment: validCommitmentDecimal,
        thresholdCgpaScaled: thresholdCgpa,
        requiredGraduationYear: graduationYear,
        expectedInstitutionId: institutionId,
        studentSecret,
        identityCommitment,
        actualCgpaScaled,
        graduationYear,
        institutionId,
        credentialSalt,
      };

      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        circuitInput,
        wasmPath,
        zkeyPath
      );

      // Corrupt point A
      const corruptedA = [proof.pi_a[0], "12345678901234567890"];
      const pB = [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]],
      ];
      const pC = [proof.pi_c[0], proof.pi_c[1]];
      const pInput = publicSignals;

      await expect(
        qTrustAnchor.connect(employer).verifyCredentialPresentation(corruptedA, pB, pC, pInput)
      ).to.be.revertedWith("Cryptographic zero-knowledge proof verification failed");
    });
  });
});
