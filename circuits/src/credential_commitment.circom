pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/poseidon.circom";

// Q-Trust: Credential Commitment Generator
// Computes an algebraic Poseidon commitment over scholar identity and academic claims
template CredentialCommitment() {
    // Private Inputs
    signal input studentSecret;
    signal input identityCommitment;
    signal input actualCgpaScaled;
    signal input graduationYear;
    signal input institutionId;
    signal input credentialSalt;

    // Public Output
    signal output commitment;

    component hasher = Poseidon(6);
    hasher.inputs[0] <== studentSecret;
    hasher.inputs[1] <== identityCommitment;
    hasher.inputs[2] <== actualCgpaScaled;
    hasher.inputs[3] <== graduationYear;
    hasher.inputs[4] <== institutionId;
    hasher.inputs[5] <== credentialSalt;

    commitment <== hasher.out;
}
