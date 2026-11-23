pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

// ============================================================================
// Q-Trust: Privacy-Preserving Academic Degree Verification Circuit
// ============================================================================
// Proves in zero-knowledge that:
// 1. The scholar holds a legitimate credential matching on-chain commitment C.
// 2. The scholar's scaled CGPA >= required corporate threshold (e.g. 870 >= 750).
// 3. The CGPA is within a valid normalized range [0, 1000].
// 4. The graduation year and issuing institution match the verification policy.
// 
// ZERO-KNOWLEDGE PROPERTY:
// The exact CGPA, roll number, student identity secret, and credential salt
// are STRICTLY PRIVATE. Neither the employer nor the blockchain learns them.
// ============================================================================

template CgpaThreshold() {
    // ------------------------------------------------------------------------
    // Public Inputs (known to Employer & Blockchain Verifier)
    // ------------------------------------------------------------------------
    signal input credentialCommitment;       // Public commitment C
    signal input thresholdCgpaScaled;        // Minimum required CGPA (e.g. 750 for 7.50)
    signal input requiredGraduationYear;     // Required year (e.g. 2027)
    signal input expectedInstitutionId;      // Issuing university ID (e.g. 101)

    // ------------------------------------------------------------------------
    // Private Inputs (known ONLY to the Scholar Vault)
    // ------------------------------------------------------------------------
    signal input studentSecret;              // Secret blinding factor s
    signal input identityCommitment;         // Poseidon hash of roll number/ID
    signal input actualCgpaScaled;           // Actual CGPA (e.g. 870 for 8.70)
    signal input graduationYear;             // Actual graduation year
    signal input institutionId;              // Actual institution ID
    signal input credentialSalt;             // Cryptographic entropy salt r

    // ------------------------------------------------------------------------
    // Constraint 1: Credential Commitment Verification
    // C === Poseidon(studentSecret, identityCommitment, actualCgpaScaled, graduationYear, institutionId, credentialSalt)
    // ------------------------------------------------------------------------
    component commitmentHasher = Poseidon(6);
    commitmentHasher.inputs[0] <== studentSecret;
    commitmentHasher.inputs[1] <== identityCommitment;
    commitmentHasher.inputs[2] <== actualCgpaScaled;
    commitmentHasher.inputs[3] <== graduationYear;
    commitmentHasher.inputs[4] <== institutionId;
    commitmentHasher.inputs[5] <== credentialSalt;

    // Enforce that calculated commitment equals the public commitment
    commitmentHasher.out === credentialCommitment;

    // ------------------------------------------------------------------------
    // Constraint 2: Academic Threshold Predicate
    // Proves actualCgpaScaled >= thresholdCgpaScaled using 16-bit comparator
    // ------------------------------------------------------------------------
    component gteCheck = GreaterEqThan(16);
    gteCheck.in[0] <== actualCgpaScaled;
    gteCheck.in[1] <== thresholdCgpaScaled;
    gteCheck.out === 1;

    // ------------------------------------------------------------------------
    // Constraint 3: Sanity Range Checks (0 <= actualCgpaScaled <= 1000)
    // ------------------------------------------------------------------------
    component maxCheck = LessEqThan(16);
    maxCheck.in[0] <== actualCgpaScaled;
    maxCheck.in[1] <== 1000;
    maxCheck.out === 1;

    // ------------------------------------------------------------------------
    // Constraint 4: Degree & Institution Policy Constraints
    // ------------------------------------------------------------------------
    graduationYear === requiredGraduationYear;
    institutionId === expectedInstitutionId;
}

// Instantiate main component with public inputs
component main {public [credentialCommitment, thresholdCgpaScaled, requiredGraduationYear, expectedInstitutionId]} = CgpaThreshold();
