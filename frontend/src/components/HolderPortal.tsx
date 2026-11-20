"use client";

import React, { useState } from "react";
import { CredentialClaims, CredentialEnvelope, ZKProofPayload, DIDDocument } from "@/types";
import { simulateGroth16Proof } from "@/lib/cryptoSim";
import { 
  Key, ShieldCheck, Eye, EyeOff, Lock, Sparkles, CheckCircle2, 
  Copy, ArrowRight, ExternalLink, RefreshCw, FileCode, Award, 
  QrCode, X, Check, Database, Cpu, Terminal, ShieldAlert
} from "lucide-react";

interface HolderPortalProps {
  claims: CredentialClaims;
  credential: CredentialEnvelope;
  didDoc: DIDDocument;
  onSendToVerifier: (proof: ZKProofPayload) => void;
}

export const HolderPortal: React.FC<HolderPortalProps> = ({
  claims,
  credential,
  didDoc,
  onSendToVerifier,
}) => {
  const [threshold, setThreshold] = useState<number>(7.5);
  const [hideCgpa, setHideCgpa] = useState<boolean>(true);
  const [hideRollNo, setHideRollNo] = useState<boolean>(true);
  const [hideDob, setHideDob] = useState<boolean>(true);
  
  const [isProving, setIsProving] = useState<boolean>(false);
  const [provingStep, setProvingStep] = useState<string>("");
  const [generatedProof, setGeneratedProof] = useState<ZKProofPayload | null>(null);
  const [showDidDoc, setShowDidDoc] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string>("");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const handleGenerateProof = async () => {
    setIsProving(true);
    setGeneratedProof(null);
    try {
      const proof = await simulateGroth16Proof(
        claims,
        threshold,
        credential.credentialCommitment,
        "0x98f411ba7823e410a",
        (step) => setProvingStep(step)
      );
      setGeneratedProof(proof);
    } finally {
      setIsProving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Cyber Security Status Banner */}
      <div className="cyber-card-glow rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono">
              <Key className="w-3.5 h-3.5" />
              <span>W3C SELF-SOVEREIGN IDENTITY · ENCRYPTED VAULT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Student Credential Vault
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-light leading-relaxed">
              Cryptographically verified academic passport. Personal claims remain encrypted on IPFS; only your zero-knowledge proofs and cryptographic commitments are shared with employers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowDidDoc(!showDidDoc)}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono border border-slate-700/80 transition"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showDidDoc ? "Hide DID Doc" : "Inspect DID Doc"}</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono border border-slate-700/80 transition"
            >
              <QrCode className="w-3.5 h-3.5 text-purple-400" />
              <span>Export QR</span>
            </button>
          </div>
        </div>

        {/* DID Address Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-2 truncate">
            <span className="text-slate-500">DID URI:</span>
            <span className="text-cyan-300 font-medium truncate max-w-lg">{credential.holderDid}</span>
          </div>
          <button
            onClick={() => copyToClipboard(credential.holderDid, "did")}
            className="text-slate-400 hover:text-cyan-300 flex items-center space-x-1.5 transition"
          >
            {copiedText === "did" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedText === "did" ? "Copied" : "Copy URI"}</span>
          </button>
        </div>
      </div>

      {/* DID Document Inspection Drawer */}
      {showDidDoc && (
        <div className="rounded-2xl bg-slate-950 border border-cyan-500/40 p-5 font-mono text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="text-cyan-400 font-bold flex items-center gap-2">
              <FileCode className="w-4 h-4" /> W3C DID Core 2.0 Document
            </span>
            <span className="text-[10px] text-slate-500">Multikey ED25519 · Controller-Bound</span>
          </div>
          <pre className="text-slate-300 overflow-x-auto p-3 bg-slate-900/90 rounded-xl border border-slate-800">
            {JSON.stringify(didDoc, null, 2)}
          </pre>
        </div>
      )}

      {/* QR Code Presentation Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="cyber-card-glow rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 border border-cyan-500/40">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Offline Verification QR</h3>
              <button 
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl flex flex-col items-center justify-center space-y-2">
              {/* Simulated QR matrix visual */}
              <div className="w-48 h-48 bg-slate-950 p-2 rounded-xl flex items-center justify-center">
                <div className="grid grid-cols-6 gap-1 w-full h-full p-2">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`rounded-sm ${
                        (i % 2 === 0 || i % 5 === 0) ? "bg-cyan-400" : "bg-slate-900"
                      }`} 
                    />
                  ))}
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-900 font-bold">
                QTRUST-VC-PAYLOAD-V2
              </span>
            </div>

            <p className="text-[11px] text-slate-400 text-center font-mono">
              Contains signed envelope commitment and DID authentication challenge for on-site employer scanning.
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs border border-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Credential Detail Card (5 cols) & Zero-Knowledge Studio (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Holographic Credential Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="cyber-card rounded-3xl p-6 border border-slate-800/90 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Credential Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base leading-tight">
                    {claims.degree}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{credential.issuerName}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-full uppercase tracking-wider ${
                credential.status === "ACTIVE"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              }`}>
                {credential.status}
              </span>
            </div>

            {/* Claims Table with Strict Privacy Flags */}
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between py-2 border-b border-slate-900">
                <span className="text-slate-500">HOLDER NAME</span>
                <span className="text-slate-200 font-semibold">{claims.studentName}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-900">
                <span className="text-slate-500">OFFICIAL CGPA</span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-cyan-400 text-sm">{claims.cgpa} / 10.0</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    Private
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-900">
                <span className="text-slate-500">GRADUATION YEAR</span>
                <span className="text-slate-200">{claims.graduationYear}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-900">
                <span className="text-slate-500">ROLL NUMBER</span>
                <span className="text-slate-300">{claims.studentRollNumber}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-900">
                <span className="text-slate-500">DATE OF BIRTH</span>
                <span className="text-slate-300">{claims.dateOfBirth}</span>
              </div>
            </div>

            {/* Cryptographic Proof Anchors */}
            <div className="pt-2 space-y-2.5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950/90 border border-purple-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-purple-300">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>ML-DSA-65 SIGNATURE</span>
                </div>
                <span className="text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                  NIST FIPS 204
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/90 border border-cyan-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-cyan-300">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span>POSEIDON COMMITMENT</span>
                </div>
                <span className="text-[10px] text-cyan-300 truncate max-w-[140px]">
                  {credential.credentialCommitment.slice(0, 14)}...
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-400">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span>ENCRYPTED IPFS CID</span>
                </div>
                <span className="text-blue-300 flex items-center gap-1">
                  <span>QmZ8...39c</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Zero-Knowledge Proof Studio (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="cyber-card-glow rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Zero-Knowledge Proof Studio</h2>
                  <p className="text-xs text-slate-400 font-mono">Circom 2.1 · Groth16 Prover · Client-Side Execution</p>
                </div>
              </div>
              <span className="cyber-tag px-2.5 py-1 rounded bg-slate-900 text-cyan-400 border border-cyan-500/30">
                cgpaProof.circom
              </span>
            </div>

            {/* Predicate Selector */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 font-mono uppercase">
                  1. Select Employer Predicate Threshold
                </label>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Prove condition:</span>
                    <span className="text-cyan-400 font-bold text-base">CGPA &ge; {threshold.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="6.0"
                    max="9.0"
                    step="0.1"
                    value={threshold}
                    onChange={(e) => setThreshold(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>6.0 (First Class)</span>
                    <span>7.5 (Standard Cutoff)</span>
                    <span>8.5 (Distinction)</span>
                  </div>
                </div>
              </div>

              {/* Privacy Safeguards */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 font-mono uppercase">
                  2. Configure Zero-Knowledge Privacy Shields
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
                  <button
                    onClick={() => setHideCgpa(!hideCgpa)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition ${
                      hideCgpa
                        ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    <span>Hide Exact CGPA</span>
                    {hideCgpa ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => setHideRollNo(!hideRollNo)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition ${
                      hideRollNo
                        ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    <span>Hide Roll No</span>
                    {hideRollNo ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => setHideDob(!hideDob)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition ${
                      hideDob
                        ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    <span>Hide Birthdate</span>
                    {hideDob ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Action Trigger */}
              <div className="pt-2">
                <button
                  disabled={isProving}
                  onClick={handleGenerateProof}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center space-x-2 transition"
                >
                  {isProving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Synthesizing Groth16 Proof (WASM)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Zero-Knowledge Proof</span>
                    </>
                  )}
                </button>
              </div>

              {/* Proving Status Strip */}
              {isProving && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>{provingStep}</span>
                </div>
              )}

              {/* Generated Proof Viewer */}
              {generatedProof && (
                <div className="cyber-card-emerald rounded-2xl p-5 space-y-4 animate-in fade-in duration-300 font-mono text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>PROOF GENERATED (GROTH16 / BN254)</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      READY TO TRANSMIT
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20">
                      <span className="text-slate-500 text-[10px] block">PROVEN PREDICATE</span>
                      <span className="text-cyan-300 font-bold">CGPA &ge; {generatedProof.provenPredicates.claimedThreshold}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20">
                      <span className="text-slate-500 text-[10px] block">ACTUAL CGPA</span>
                      <span className="text-emerald-400 font-bold">[CONFIDENTIAL]</span>
                    </div>
                  </div>

                  {/* Public signals snippet */}
                  <div className="text-[11px] text-slate-400 space-y-1 bg-slate-950/70 p-3 rounded-xl border border-slate-900">
                    <div className="truncate">
                      <span className="text-slate-500">COMMITMENT:</span> {generatedProof.publicSignals.credentialCommitment}
                    </div>
                    <div className="truncate">
                      <span className="text-slate-500">REVOCATION ROOT:</span> {generatedProof.publicSignals.revocationRoot}
                    </div>
                  </div>

                  {/* Forward actions */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => onSendToVerifier(generatedProof)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-md shadow-emerald-500/20"
                    >
                      <span>Share With Employer Verifier</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(generatedProof, null, 2), "proof")}
                      className="py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs border border-slate-700 flex items-center justify-center space-x-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedText === "proof" ? "Copied" : "Copy Proof JSON"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
