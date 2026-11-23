import path from "path";
import fs from "fs";

export interface ContractAddresses {
  IssuerRegistry: string;
  CredentialRegistry: string;
  RevocationRegistry: string;
  Groth16Verifier: string;
  QTrustAnchor: string;
}

export interface ChainTransaction {
  id: string;
  txHash: string;
  blockNumber: number;
  contract: string;
  event: string;
  timestamp: string;
  data: Record<string, any>;
}

export class BlockchainService {
  private static deploymentsPath = path.resolve(__dirname, "../../../contracts/deployments.json");

  public static getDeployedAddresses(): ContractAddresses {
    if (fs.existsSync(this.deploymentsPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.deploymentsPath, "utf8"));
        return data.contracts;
      } catch (err) {
        console.warn("Could not read deployments.json, using defaults", err);
      }
    }

    // Default Sepolia / Amoy addresses
    return {
      IssuerRegistry: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      CredentialRegistry: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      RevocationRegistry: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
      Groth16Verifier: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
      QTrustAnchor: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
    };
  }

  public static getRecentTransactions(): ChainTransaction[] {
    return [
      {
        id: "tx-1",
        txHash: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
        blockNumber: 4210985,
        contract: "IssuerRegistry",
        event: "IssuerRegistered",
        timestamp: "Just now",
        data: {
          did: "did:qtrust:university:uem_jaipur",
          name: "UEM Jaipur",
          pqcKeyFingerprint: "0x621569afd7e11e20d21a5c26b133a287530f2bcf6614b9b9c34224dc8b4a485c",
        },
      },
      {
        id: "tx-2",
        txHash: "0x3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d",
        blockNumber: 4210986,
        contract: "CredentialRegistry",
        event: "CredentialAnchored",
        timestamp: "1 min ago",
        data: {
          commitment: "0x98f411ba7823e410a0123456789abcdef0123456789abcdef0123456789abcdef",
          issuerDid: "did:qtrust:university:uem_jaipur",
        },
      },
      {
        id: "tx-3",
        txHash: "0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b9a8b7c6d5e4f3a2b1c0d9e8f",
        blockNumber: 4210987,
        contract: "RevocationRegistry",
        event: "RevocationRootUpdated",
        timestamp: "5 mins ago",
        data: {
          smtRoot: "0x2897fa11c38e920d31bb990021cfa590123847a9b0123456789abcdef0123456",
          totalRevokedCount: 0,
        },
      },
      {
        id: "tx-4",
        txHash: "0x4b3c2d1e0f9a8b9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a",
        blockNumber: 4210988,
        contract: "QTrustAnchor",
        event: "CredentialAudited",
        timestamp: "8 mins ago",
        data: {
          verifier: "ABC Technologies (Enterprise HR Compliance)",
          isVerified: true,
          thresholdCgpaScaled: 750,
        },
      },
    ];
  }
}
