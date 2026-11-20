"use client";

import React, { useState } from "react";
import { CredentialClaims, CredentialEnvelope, BlockchainTransaction } from "@/types";
import { simulatePoseidonCommitment, simulateMLDSASign } from "@/lib/cryptoSim";
import { ISSUER_DID } from "@/lib/mockData";
import { 
  Building2, ShieldCheck, PlusCircle, AlertTriangle, CheckCircle2, 
  Cpu, FileCheck, Layers, RefreshCw, Send, ArrowUpRight 
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

    await new Promise((r) => setTimeout(r, 800));

    const pCommitment = simulatePoseidonCommitment(
      "0x98f411ba7823e410a",
      Math.round(cgpa * 100),
      gradYear,
      "0x89d2c20a9bf5186b2de581fefc39d4b0d0671bbd3c19e532b217e29cf9761a29"
    );

    const mlDsa = simulateMLDSASign(pCommitment, ISSUER_DID);

    const credId = `QT-${gradYear}-UEM-${Math.floor(1000 + Math.random() * 9000)}`;
    const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const blockNum = 4892000 + Math.floor(Math.random() * 500);

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
      revocationHandle: "0x77c2" + txHash.slice(6, 40),
      mlDsaSignature: mlDsa,
      encryptedPayloadCid: `ipfs://Qm${txHash.slice(2, 46)}`,
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
  };

  const handleToggleRevocation = async () => {
    setRevoking(true);
    await new Promise((r) => setTimeout(r, 600));

    const isCurrentlyActive = currentCredential.status === "ACTIVE";
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
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/60 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Accredited Academic Authority</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              University Issuer Management Portal
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Issue post-quantum tamper-evident credentials. Credential commitments are anchored to the blockchain, while private student claims remain encrypted on IPFS.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-left">
              <span className="text-[10px] text-purple-400 font-mono uppercase block">Active Signer</span>
              <span className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
                <Cpu className="w-4 h-4 text-purple-400" /> ML-DSA-65
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Issuance Form & Live Revocation Registry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Issue Verifiable Degree</h2>
                <p className="text-xs text-slate-400">Signs with NIST FIPS 204 & anchors commitment on-chain</p>
              </div>
            </div>

            {issueSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>Credential issued successfully! Poseidon commitment registered on CredentialRegistry.sol.</span>
              </div>
            )}

            <form onSubmit={handleIssueCredential} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Recipient Student DID
                </label>
                <input
                  type="text"
                  required
                  value={studentDid}
                  onChange={(e) => setStudentDid(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    required
                    value={gradYear}
                    onChange={(e) => setGradYear(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Degree Program
                  </label>
                  <input
                    type="text"
                    required
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cumulative CGPA (Scale 10.0)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.0"
                    max="10.0"
                    required
                    value={cgpa}
                    onChange={(e) => setCgpa(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Cryptographic Preview Panel */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs font-mono">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                  Real-Time Cryptographic Preview
                </span>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Scalar Field Poseidon Commitment:</span>
                  <span className="text-cyan-400 truncate max-w-[220px]">{previewCommitment}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Signer Envelope:</span>
                  <span className="text-purple-400">NIST ML-DSA-65 (Lattice)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isIssuing}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                {isIssuing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing Envelope & Anchoring to EVM...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Issue Credential with ML-DSA Signature</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Active Registry & Instant Revocation Management (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-white text-sm">Issued Credential Status</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                ID: {currentCredential.credentialId}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient:</span>
                <span className="text-slate-200 font-mono truncate max-w-[160px]">
                  {currentCredential.holderDid}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  currentCredential.status === "ACTIVE"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-rose-500/20 text-rose-300"
                }`}>
                  {currentCredential.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Revocation Handle:</span>
                <span className="text-slate-300 font-mono text-[11px] truncate max-w-[150px]">
                  {currentCredential.revocationHandle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">On-Chain TX:</span>
                <span className="text-cyan-400 font-mono text-[11px] truncate max-w-[150px]">
                  {currentCredential.txHash}
                </span>
              </div>
            </div>

            {/* Revoke / Reinstate Trigger */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-rose-500/20 space-y-3">
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>Sparse Merkle Tree Revocation Control</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Updating revocation status recalculates the cryptographic accumulator root on <code className="text-slate-300">RevocationRegistry.sol</code> without revealing the student identity.
              </p>

              <button
                disabled={revoking}
                onClick={handleToggleRevocation}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                  currentCredential.status === "ACTIVE"
                    ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40"
                    : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                {revoking ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating On-Chain SMT Root...</span>
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
