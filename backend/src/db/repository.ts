import fs from "fs";
import path from "path";
import { IssuedCredentialEnvelope, VerificationAuditReport } from "../credentials/vcEngine";

export class Repository {
  private static storePath = path.resolve(__dirname, "../../data/store.json");
  private static memoryStore: {
    credentials: Record<string, IssuedCredentialEnvelope>;
    auditReceipts: Record<string, VerificationAuditReport>;
    revokedCommitments: Record<string, { revokedAt: string; reason: string }>;
  } = {
    credentials: {},
    auditReceipts: {},
    revokedCommitments: {},
  };

  public static init() {
    const dir = path.dirname(this.storePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(this.storePath)) {
      try {
        const raw = fs.readFileSync(this.storePath, "utf8");
        this.memoryStore = JSON.parse(raw);
      } catch (e) {
        console.warn("Initializing fresh data store", e);
      }
    }
  }

  private static persist() {
    try {
      const dir = path.dirname(this.storePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.storePath, JSON.stringify(this.memoryStore, null, 2));
    } catch (e) {
      console.warn("Could not persist to file, staying in memory", e);
    }
  }

  public static saveCredential(cred: IssuedCredentialEnvelope) {
    this.memoryStore.credentials[cred.credentialCommitment.hex.toLowerCase()] = cred;
    this.persist();
  }

  public static getCredentialByCommitment(commitmentHex: string): IssuedCredentialEnvelope | null {
    return this.memoryStore.credentials[commitmentHex.toLowerCase()] || null;
  }

  public static getAllCredentials(): IssuedCredentialEnvelope[] {
    return Object.values(this.memoryStore.credentials);
  }

  public static revokeCredential(commitmentHex: string, reason: string = "Graduation records updated") {
    this.memoryStore.revokedCommitments[commitmentHex.toLowerCase()] = {
      revokedAt: new Date().toISOString(),
      reason,
    };
    this.persist();
  }

  public static isRevoked(commitmentHex: string): boolean {
    return Boolean(this.memoryStore.revokedCommitments[commitmentHex.toLowerCase()]);
  }

  public static saveAuditReceipt(receipt: VerificationAuditReport) {
    this.memoryStore.auditReceipts[receipt.receiptId] = receipt;
    this.persist();
  }

  public static getAuditReceipt(receiptId: string): VerificationAuditReport | null {
    return this.memoryStore.auditReceipts[receiptId] || null;
  }
}

Repository.init();
