import path from "path";
import fs from "fs";
const { buildPoseidon } = require("circomlibjs");
const snarkjs = require("snarkjs");

export interface CircuitInputs {
  studentSecret: string;
  identityCommitment: string;
  actualCgpaScaled: string;
  graduationYear: string;
  institutionId: string;
  credentialSalt: string;
  thresholdCgpaScaled: string;
}

export interface ZkProofResult {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
  };
  publicSignals: string[];
  calldataSolidity: {
    a: [string, string];
    b: [[string, string], [string, string]];
    c: [string, string];
    input: [string, string, string, string];
  };
  durationMs: number;
}

export class ZkpService {
  private static poseidonInstance: any = null;
  private static wasmPath = path.resolve(__dirname, "../../../circuits/build/cgpa_threshold_js/cgpa_threshold.wasm");
  private static zkeyPath = path.resolve(__dirname, "../../../circuits/build/cgpa_threshold_final.zkey");
  private static vKeyPath = path.resolve(__dirname, "../../../circuits/build/verification_key.json");

  private static async getPoseidon() {
    if (!this.poseidonInstance) {
      this.poseidonInstance = await buildPoseidon();
    }
    return this.poseidonInstance;
  }

  /**
   * Computes the 32-byte algebraic Poseidon hash commitment over 6 credential elements.
   */
  public static async computePoseidonCommitment(
    studentSecret: string,
    identityCommitment: string,
    actualCgpaScaled: string,
    graduationYear: string,
    institutionId: string,
    credentialSalt: string
  ): Promise<{ decimal: string; hex: string }> {
    const poseidon = await this.getPoseidon();
    const F = poseidon.F;

    const rawHash = poseidon([
      BigInt(studentSecret),
      BigInt(identityCommitment),
      BigInt(actualCgpaScaled),
      BigInt(graduationYear),
      BigInt(institutionId),
      BigInt(credentialSalt),
    ]);

    const decimal = F.toString(rawHash);
    const hex = "0x" + BigInt(decimal).toString(16).padStart(64, "0");
    return { decimal, hex };
  }

  /**
   * Generates a Groth16 selective disclosure proof ensuring actual CGPA >= threshold CGPA
   * without revealing exact CGPA or student identity.
   */
  public static async generateProof(inputs: CircuitInputs): Promise<ZkProofResult> {
    const commitment = await this.computePoseidonCommitment(
      inputs.studentSecret,
      inputs.identityCommitment,
      inputs.actualCgpaScaled,
      inputs.graduationYear,
      inputs.institutionId,
      inputs.credentialSalt
    );

    const witnessInput = {
      // Public signals
      credentialCommitment: commitment.decimal,
      thresholdCgpaScaled: inputs.thresholdCgpaScaled,
      requiredGraduationYear: inputs.graduationYear,
      expectedInstitutionId: inputs.institutionId,
      // Private signals
      studentSecret: inputs.studentSecret,
      identityCommitment: inputs.identityCommitment,
      actualCgpaScaled: inputs.actualCgpaScaled,
      graduationYear: inputs.graduationYear,
      institutionId: inputs.institutionId,
      credentialSalt: inputs.credentialSalt,
    };

    const startTime = Date.now();
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      witnessInput,
      this.wasmPath,
      this.zkeyPath
    );
    const durationMs = Date.now() - startTime;

    const calldataSolidity = {
      a: [proof.pi_a[0], proof.pi_a[1]] as [string, string],
      b: [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]],
      ] as [[string, string], [string, string]],
      c: [proof.pi_c[0], proof.pi_c[1]] as [string, string],
      input: [
        publicSignals[0],
        publicSignals[1],
        publicSignals[2],
        publicSignals[3],
      ] as [string, string, string, string],
    };

    return {
      proof,
      publicSignals,
      calldataSolidity,
      durationMs,
    };
  }

  /**
   * Verifies a Groth16 proof off-chain using verification_key.json.
   */
  public static async verifyProofOffChain(proof: any, publicSignals: string[]): Promise<boolean> {
    const vKey = JSON.parse(fs.readFileSync(this.vKeyPath, "utf8"));
    return await snarkjs.groth16.verify(vKey, publicSignals, proof);
  }
}
