"use client";

import React, { useState, useEffect } from "react";
import { CredentialClaims, CredentialEnvelope, BlockchainTransaction } from "@/types";
import { simulatePoseidonCommitment, simulateMLDSASign } from "@/lib/cryptoSim";
import { ISSUER_DID, CONTRACT_ADDRESSES } from "@/lib/mockData";
import { ApiClient } from "@/lib/apiClient";
import { 
  Building2, ShieldCheck, PlusCircle, AlertTriangle, CheckCircle2, 
  Cpu, FileCheck, Layers, RefreshCw, Send, ArrowUpRight, Lock, 
  Database, Shield, Terminal, Hash, BookOpen, Radio
} from "lucide-react";

interface IssuerPortalProps {
  currentCredential: CredentialEnvelope;
  onCredentialIssued: (newCred: CredentialEnvelope, tx: BlockchainTransaction) => void;
  onRevocationToggled: (revoked: boolean, tx: BlockchainTransaction) => void;
}

export const IssuerPortal: React.FC<IssuerPortalProps> = ({
  currentCredential,
  onCredentialIssued,
  onRevocationToggled,
}) => {
  const [studentDid, setStudentDid] = useState<string>(currentCredential.holderDid);
  const [studentName, setStudentName] = useState<string>("Sumit Sharma");
  const [degree, setDegree] = useState<string>("B.Tech Computer Science & Engineering");
  const [cgpa, setCgpa] = useState<number>(8.7);
  const [gradYear, setGradYear] = useState<number>(2027);

  const [isIssuing, setIsIssuing] = useState<boolean>(false);
  const [issueSuccess, setIssueSuccess] = useState<boolean>(false);
  const [revoking, setRevoking] = useState<boolean>(false);
  const [isBackendLive, setIsBackendLive] = useState<boolean>(false);

  useEffect(() => {
    ApiClient.checkHealth().then((health) => {
      setIsBackendLive(!!health);
    });
  }, []);

  // Live calculation of preview commitment
  const previewCommitment = simulatePoseidonCommitment(
    "0x98f411ba7823e410a",
    Math.round(cgpa * 100),
    gradYear,
    "0x89d2c20a9bf5186b2de581fefc39d4b0d0671bbd3c19e532b217e29cf9761a29"
  );

  const handleIssueCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsIssuing(true);
    setIssueSuccess(false);

    try {
      // 1. Attempt live issuance through Phase 4 Backend Gateway
      const backendRes = await ApiClient.issueCredential({
        universityDid: ISSUER_DID,
        universityName: "UEM Jaipur (University of Engineering & Management)",
        studentDid: studentDid,
        claims: {
          degree,
          graduationYear: gradYear,
          actualCgpaScaled: Math.round(cgpa * 100),
          rollNumber: "UEMJ/2023/BTECH/CSE/042",
        },
        studentSecret: "123456789012345678901234567890",
        credentialSalt: "555554444433333222221111100000",
        institutionId: "101",
      });

      let pCommitment: string;
      let mlDsa: any;
      let credId: string;
      let txHash: string;
      let blockNum: number;
      let ipfsCid: string;
      let revHandle: string;

      if (backendRes && backendRes.success && backendRes.credential) {
        setIsBackendLive(true);
        const cred = backendRes.credential;
        pCommitment = cred.credentialCommitment.hex;
        mlDsa = {
          signatureHex: cred.proof.signatureHex.slice(0, 48) + "... (3,309 bytes NIST ML-DSA)",
          algorithm: "ML-DSA-65" as const,
          fipsStandard: "FIPS-204" as const,
          publicKeyHash: cred.proof.issuerFingerprint,
        };
        credId = cred.id.replace("urn:uuid:", "");
        txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        blockNum = 4892000 + Math.floor(Math.random() * 500);
        ipfsCid = cred.evidence?.[0]?.encryptedPayloadCid || `ipfs://bafybeiqtrust${txHash.slice(2, 38)}`;
        revHandle = cred.credentialStatus?.revocationHandle || ("0x77c2" + txHash.slice(6, 40));
      } else {
        // Fallback to local simulation
        await new Promise((r) => setTimeout(r, 600));
        pCommitment = simulatePoseidonCommitment(
          "0x98f411ba7823e410a",
          Math.round(cgpa * 100),
          gradYear,
          "0x89d2c20a9bf5186b2de581fefc39d4b0d0671bbd3c19e532b217e29cf9761a29"
        );
        mlDsa = simulateMLDSASign(pCommitment, ISSUER_DID);
        credId = `QT-${gradYear}-UEM-${Math.floor(1000 + Math.random() * 9000)}`;
        txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        blockNum = 4892000 + Math.floor(Math.random() * 500);
        ipfsCid = `ipfs://Qm${txHash.slice(2, 46)}`;
        revHandle = "0x77c2" + txHash.slice(6, 40);
      }

      const newEnvelope: CredentialEnvelope = {
        credentialId: credId,
        issuerDid: ISSUER_DID,
        issuerName: "UEM Jaipur (University of Engineering & Management)",
        holderDid: studentDid,
        schemaHash: "0x89d2c20a9bf5186b2de581fefc39d4b0d0671bbd3c19e532b217e29cf9761a29",
        credentialCommitment: pCommitment,
        validityPeriod: {
          validFrom: `${gradYear}-06-01T00:00:00Z`,
        },
        revocationHandle: revHandle,
        mlDsaSignature: mlDsa,
        encryptedPayloadCid: ipfsCid,
        txHash,
        blockNumber: blockNum,
        status: "ACTIVE",
      };

      const newTx: BlockchainTransaction = {
        id: "tx-" + Date.now(),
        txHash,
        blockNumber: blockNum,
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
        contract: "CredentialRegistry",
        event: "CredentialIssued",
        data: {
          credentialId: credId,
          commitment: pCommitment,
          issuerId: "0xuem_jaipur",
          holderDid: studentDid.slice(0, 20) + "...",
        },
        status: "CONFIRMED",
      };

      onCredentialIssued(newEnvelope, newTx);
      setIsIssuing(false);
      setIssueSuccess(true);
      setTimeout(() => setIssueSuccess(false), 5000);
    } catch {
      setIsIssuing(false);
    }
  };

  const handleToggleRevocation = async () => {
    setRevoking(true);
    const isCurrentlyActive = currentCredential.status === "ACTIVE";

    try {
      // Update Sparse Merkle Tree non-revocation root via Backend Gateway
      if (isCurrentlyActive) {
        await ApiClient.revokeCredential(
          currentCredential.credentialCommitment,
          "Degree conferral revoked or credential expired"
        );
      }
    } catch {
      // Continue with UI state update
    }

    await new Promise((r) => setTimeout(r, 600));

    const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const blockNum = 4892100 + Math.floor(Math.random() * 100);

    const newTx: BlockchainTransaction = {
      id: "tx-rev-" + Date.now(),
      txHash,
      blockNumber: blockNum,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      contract: "RevocationRegistry",
      event: "RevocationRootUpdated",
      data: {
        action: isCurrentlyActive ? "REVOKE_HANDLE" : "REINSTATE_HANDLE",
        revocationHandle: currentCredential.revocationHandle.slice(0, 20) + "...",
        newRoot: "0x" + txHash.slice(2, 66),
        rootVersion: 2,
      },
      status: "CONFIRMED",
    };

    onRevocationToggled(isCurrentlyActive, newTx);
    setRevoking(false);
  };

  return (
    <div className="space-y-8 font-sans text-[#22121b]">
      {/* 1. Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-[#ffffff] border-2 border-[#e27396] shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#f4f8eb] text-[#5a3045] border border-[#efcfe3] text-xs font-mono">
              <Building2 className="w-3.5 h-3.5 text-[#e27396]" />
              <span className="font-bold">ACCREDITED REGISTRAR AUTHORITY · SMART CONTRACT ANCHORED</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#22121b] tracking-tight">
              University Registrar Console
            </h1>
            <p className="text-[#5a3045] text-xs sm:text-sm max-w-2xl font-normal leading-relaxed">
              Issue post-quantum tamper-evident credentials. Credential commitments are anchored to the blockchain, while private student claims remain encrypted on IPFS.
            </p>
          </div>

          <div className="flex items-center space-x-3 font-mono">
            <div className={`p-4 rounded-2xl border text-left ${isBackendLive ? "bg-[#f4f8eb] border-[#b3dee2]" : "bg-[#efcfe3]/30 border-[#ea9ab2]"}`}>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isBackendLive ? "bg-emerald-500 animate-pulse" : "bg-[#ea9ab2]"}`} />
                <span className="text-[10px] text-[#5a3045] uppercase tracking-widest block font-bold">
                  {isBackendLive ? "BACKEND GATEWAY (PORT 4000)" : "LOCAL CRYPTO SIMULATION"}
                </span>
              </div>
              <span className="text-sm font-black text-[#e27396] flex items-center gap-1.5 mt-0.5">
                <Cpu className="w-4 h-4 text-[#e27396]" /> NIST ML-DSA-65 (v1)
              </span>
            </div>
          </div>
        </div>

        {/* Institution Metadata Bar */}
        <div className="mt-6 pt-4 border-t border-[#efcfe3] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#5a3045]">
          <div className="flex items-center space-x-2 truncate">
            <span className="text-[#5a3045] font-bold">ISSUER DID:</span>
            <span className="text-[#e27396] font-bold truncate max-w-md">{ISSUER_DID}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[#5a3045] font-bold">CONTRACT:</span>
            <span className="text-[#22121b] font-bold truncate max-w-[140px]">{CONTRACT_ADDRESSES.IssuerRegistry}</span>
          </div>
        </div>
      </div>

      {/* 2. Main Grid: Issuance Terminal & On-Chain Revocation Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Credential Issuance Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#ffffff] border-2 border-[#efcfe3] space-y-6 shadow-sm">
            <div className="flex items-center space-x-3 pb-4 border-b border-[#efcfe3]">
              <div className="p-2.5 rounded-xl bg-[#f4f8eb] text-[#e27396] border border-[#efcfe3]">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#22121b]">Issue Post-Quantum Credential</h2>
                <p className="text-xs text-[#5a3045] font-mono font-bold">Generates Poseidon Commitment &amp; Signs with NIST FIPS 204</p>
              </div>
            </div>

            {issueSuccess && (
              <div className="p-4 rounded-2xl bg-[#f4f8eb] border-2 border-[#e27396] text-[#22121b] text-xs font-mono font-bold flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#e27396]" />
                <span>Credential issued successfully! Commitment registered on CredentialRegistry.sol.</span>
              </div>
            )}

            <form onSubmit={handleIssueCredential} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#22121b] mb-1.5 font-mono uppercase">
                  Recipient Student DID
                </label>
                <input
                  type="text"
                  required
                  value={studentDid}
                  onChange={(e) => setStudentDid(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f4f8eb] border border-[#efcfe3] text-[#22121b] text-xs font-mono font-bold focus:border-[#e27396] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#22121b] mb-1.5 font-mono uppercase">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f4f8eb] border border-[#efcfe3] text-[#22121b] text-xs font-bold focus:border-[#e27396] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#22121b] mb-1.5 font-mono uppercase">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    required
                    value={gradYear}
                    onChange={(e) => setGradYear(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f4f8eb] border border-[#efcfe3] text-[#22121b] text-xs font-mono font-bold focus:border-[#e27396] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#22121b] mb-1.5 font-mono uppercase">
                    Degree Program
                  </label>
                  <input
                    type="text"
                    required
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f4f8eb] border border-[#efcfe3] text-[#22121b] text-xs font-bold focus:border-[#e27396] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#22121b] mb-1.5 font-mono uppercase">
                    Cumulative CGPA (10.0 Scale)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.0"
                    max="10.0"
                    required
                    value={cgpa}
                    onChange={(e) => setCgpa(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f4f8eb] border border-[#efcfe3] text-[#22121b] text-xs font-mono font-black focus:border-[#e27396] focus:outline-none"
                  />
                </div>
              </div>

              {/* Cryptographic Telemetry Box */}
              <div className="p-4 rounded-2xl bg-[#f4f8eb] border border-[#efcfe3] space-y-2 text-xs font-mono">
                <span className="text-[10px] text-[#5a3045] uppercase tracking-widest block font-black">
                  Live Cryptographic Hashing Telemetry
                </span>
                <div className="flex items-center justify-between text-[#22121b]">
                  <span className="font-bold">Scalar Poseidon Hash:</span>
                  <span className="text-[#e27396] font-black truncate max-w-[220px]">{previewCommitment}</span>
                </div>
                <div className="flex items-center justify-between text-[#22121b]">
                  <span className="font-bold">Signature Algorithm:</span>
                  <span className="text-[#22121b] font-black">NIST ML-DSA-65 (Lattice Standard)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isIssuing}
                className="w-full py-3.5 px-4 rounded-xl bg-[#e27396] hover:bg-[#b8476d] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#e27396]/25 flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                {isIssuing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Signing Envelope &amp; Anchoring to EVM...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-white" />
                    <span>Issue Credential with ML-DSA Signature</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Active Credential & Revocation Console (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#ffffff] border-2 border-[#efcfe3] space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#efcfe3]">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#e27396]" />
                <h3 className="font-black text-[#22121b] text-sm">Issued Credential Record</h3>
              </div>
              <span className="text-[11px] font-mono text-[#5a3045] font-bold">
                {currentCredential.credentialId}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#f4f8eb] border border-[#efcfe3] space-y-3 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#5a3045] font-bold">RECIPIENT:</span>
                <span className="text-[#22121b] font-bold truncate max-w-[160px]">
                  {currentCredential.holderDid}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a3045] font-bold">STATUS:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                  currentCredential.status === "ACTIVE"
                    ? "bg-[#b3dee2] text-[#22121b] border border-[#e27396]/30"
                    : "bg-[#efcfe3] text-[#e27396] border border-[#e27396]"
                }`}>
                  {currentCredential.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a3045] font-bold">REVOCATION HANDLE:</span>
                <span className="text-[#22121b] font-semibold truncate max-w-[140px]">
                  {currentCredential.revocationHandle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a3045] font-bold">ON-CHAIN TX:</span>
                <span className="text-[#e27396] font-bold truncate max-w-[140px]">
                  {currentCredential.txHash}
                </span>
              </div>
            </div>

            {/* Revoke Controller */}
            <div className="p-4 rounded-2xl bg-[#f4f8eb] border-2 border-[#efcfe3] space-y-3 font-mono text-xs">
              <div className="flex items-center space-x-2 text-[#e27396] font-black">
                <AlertTriangle className="w-4 h-4 text-[#e27396]" />
                <span>Sparse Merkle Tree Revocation Accumulator</span>
              </div>
              <p className="text-[11px] text-[#5a3045] font-sans leading-relaxed">
                Updating status recalculates the cryptographic root on <code className="text-[#e27396] font-bold">RevocationRegistry.sol</code>. Zero-knowledge proofs generated against revoked roots will fail pairing checks.
              </p>

              <button
                disabled={revoking}
                onClick={handleToggleRevocation}
                className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center space-x-2 shadow-xs ${
                  currentCredential.status === "ACTIVE"
                    ? "bg-[#efcfe3] hover:bg-[#ea9ab2] text-[#22121b] border border-[#e27396]"
                    : "bg-[#e27396] hover:bg-[#b8476d] text-white"
                }`}
              >
                {revoking ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Recalculating SMT Root...</span>
                  </>
                ) : (
                  <span>
                    {currentCredential.status === "ACTIVE" ? "Revoke Credential On-Chain" : "Reinstate Credential"}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
