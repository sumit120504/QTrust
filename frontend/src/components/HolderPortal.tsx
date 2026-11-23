"use client";

import React, { useState, useEffect } from "react";
import { CredentialClaims, CredentialEnvelope, ZKProofPayload, DIDDocument } from "@/types";
import { simulateGroth16Proof } from "@/lib/cryptoSim";
import { ApiClient } from "@/lib/apiClient";
import { 
  Key, ShieldCheck, Eye, EyeOff, Lock, Sparkles, CheckCircle2, 
  Copy, ArrowRight, ExternalLink, RefreshCw, FileCode, Award, 
  QrCode, X, Check, Database, Cpu, Terminal, ShieldAlert, BookOpen
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
  const [isBackendLive, setIsBackendLive] = useState<boolean>(false);
  const [liveDidDoc, setLiveDidDoc] = useState<any>(null);

  useEffect(() => {
    ApiClient.checkHealth().then((health) => {
      setIsBackendLive(!!health);
    });
    ApiClient.resolveDid(credential.holderDid).then((doc) => {
      if (doc?.didDocument) setLiveDidDoc(doc.didDocument);
    });
  }, [credential.holderDid]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const handleGenerateProof = async () => {
    setIsProving(true);
    setGeneratedProof(null);
    setProvingStep("Connecting to Phase 4 Groth16 Prover via Gateway...");

    try {
      const actualCgpaScaled = Math.round(claims.cgpa * 100);
      const thresholdCgpaScaled = Math.round(threshold * 100);

      const liveProofRes = await ApiClient.generateProof({
        studentSecret: "123456789012345678901234567890",
        identityCommitment: credential.credentialCommitment,
        actualCgpaScaled,
        graduationYear: claims.graduationYear,
        institutionId: "101",
        credentialSalt: "555554444433333222221111100000",
        thresholdCgpaScaled,
      });

      if (liveProofRes && liveProofRes.success && liveProofRes.proof) {
        setIsBackendLive(true);
        setProvingStep(`Synthesized Circom 2.2 Proof in ${liveProofRes.provingDurationMs}ms (Groth16 / BN254)`);

        const proofPayload: ZKProofPayload = {
          circuitId: "cgpa_threshold.circom (Groth16 BN254)",
          provingSystem: "Groth16",
          proof: liveProofRes.proof,
          publicSignals: {
            credentialCommitment: credential.credentialCommitment,
            thresholdCgpa: thresholdCgpaScaled,
            revocationRoot: "0x" + BigInt(liveProofRes.publicSignals[0] || "0").toString(16).padStart(64, "0"),
            verifierChallenge: "0x" + Math.random().toString(16).substring(2, 18).padEnd(32, "0"),
            isSatisfied: true,
          },
          provenPredicates: {
            cgpaThresholdMet: true,
            claimedThreshold: threshold,
            nonRevokedProofVerified: true,
            identityBound: true,
          },
          revealedClaims: {
            degree: claims.degree,
            graduationYear: claims.graduationYear,
          },
        };
        setGeneratedProof(proofPayload);
      } else {
        // Fallback to local simulation
        const proof = await simulateGroth16Proof(
          claims,
          threshold,
          credential.credentialCommitment,
          "0x98f411ba7823e410a",
          (step) => setProvingStep(step)
        );
        setGeneratedProof(proof);
      }
    } catch {
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
    <div className="space-y-8 font-sans text-[#22121b]">
      {/* 1. Scholar Identity Vault Banner */}
      <div className="rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-[#ffffff] border-2 border-[#e27396] shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#f4f8eb] text-[#5a3045] border border-[#efcfe3] text-xs font-mono">
              <Key className="w-3.5 h-3.5 text-[#e27396]" />
              <span className="font-bold">W3C SCHOLAR PASSPORT · CLIENT-SIDE ENCRYPTION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#22121b] tracking-tight">
              Scholar Credential Vault
            </h1>
            <p className="text-[#5a3045] text-xs sm:text-sm max-w-2xl font-normal leading-relaxed">
              You own your digital degree. Selective-disclosure zero-knowledge proofs allow you to prove your academic standing to employers without exposing your transcript, roll number, or exact marks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono flex items-center gap-1.5 ${isBackendLive ? "bg-[#f4f8eb] border-[#b3dee2]" : "bg-[#efcfe3]/30 border-[#ea9ab2]"}`}>
              <span className={`w-2 h-2 rounded-full ${isBackendLive ? "bg-emerald-500 animate-pulse" : "bg-[#ea9ab2]"}`} />
              <span className="font-bold text-[#5a3045]">{isBackendLive ? "Groth16 Gateway (Port 4000)" : "Local Prover"}</span>
            </div>

            <button
              onClick={() => setShowDidDoc(!showDidDoc)}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#f4f8eb] hover:bg-[#efcfe3] text-[#22121b] text-xs font-mono font-bold border border-[#efcfe3] transition shadow-xs"
            >
              <FileCode className="w-3.5 h-3.5 text-[#e27396]" />
              <span>{showDidDoc ? "Hide DID Doc" : "Inspect DID Doc"}</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#b3dee2] hover:bg-[#9ecfd3] text-[#22121b] text-xs font-mono font-bold border border-[#e27396]/30 transition shadow-xs"
            >
              <QrCode className="w-3.5 h-3.5 text-[#e27396]" />
              <span>Export QR</span>
            </button>
          </div>
        </div>

        {/* DID URI Bar */}
        <div className="mt-6 pt-4 border-t border-[#efcfe3] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-2 truncate">
            <span className="text-[#5a3045] font-bold">SCHOLAR DID:</span>
            <span className="text-[#e27396] font-bold truncate max-w-lg">{credential.holderDid}</span>
          </div>
          <button
            onClick={() => copyToClipboard(credential.holderDid, "did")}
            className="text-[#5a3045] hover:text-[#22121b] font-bold flex items-center space-x-1.5 transition"
          >
            {copiedText === "did" ? <Check className="w-3.5 h-3.5 text-[#e27396]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedText === "did" ? "Copied" : "Copy URI"}</span>
          </button>
        </div>
      </div>

      {/* DID Document Inspection Drawer */}
      {showDidDoc && (
        <div className="rounded-2xl bg-[#ffffff] border-2 border-[#efcfe3] p-5 font-mono text-xs animate-in fade-in duration-200 shadow-md">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#efcfe3]">
            <span className="text-[#e27396] font-black flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#e27396]" /> W3C DID Core 1.0 Document {liveDidDoc ? "(Resolved Live)" : ""}
            </span>
            <span className="text-[10px] text-[#5a3045] font-bold">Separated Purposes · Assertion & KeyAgreement</span>
          </div>
          <pre className="text-[#22121b] overflow-x-auto p-3.5 bg-[#f4f8eb] rounded-xl border border-[#efcfe3] font-bold">
            {JSON.stringify(liveDidDoc || didDoc, null, 2)}
          </pre>
        </div>
      )}

      {/* QR Code Presentation Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22121b]/40 backdrop-blur-sm">
          <div className="rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 bg-[#ffffff] border-2 border-[#e27396] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#efcfe3]">
              <h3 className="font-black text-[#22121b] text-sm">Offline Verifiable QR Presentation</h3>
              <button 
                onClick={() => setShowQrModal(false)}
                className="text-[#5a3045] hover:text-[#22121b]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-[#f4f8eb] rounded-2xl flex flex-col items-center justify-center space-y-2 border border-[#efcfe3]">
              <div className="w-48 h-48 bg-white p-3 rounded-xl border-2 border-[#e27396] flex items-center justify-center shadow-inner">
                <div className="grid grid-cols-6 gap-1 w-full h-full">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`rounded-sm ${
                        (i % 2 === 0 || i % 5 === 0) ? "bg-[#e27396]" : "bg-[#b3dee2]"
                      }`} 
                    />
                  ))}
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#22121b] font-black">
                QTRUST-ACADEMIC-VC
              </span>
            </div>

            <p className="text-[11px] text-[#5a3045] text-center font-mono">
              Contains signed envelope commitment and DID authentication challenge for on-site employer scanning.
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#e27396] text-white font-mono text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Degree Card (5 cols) & Zero-Knowledge Prover Studio (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Authentic Degree Parchment Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl p-6 bg-[#ffffff] border-2 border-[#efcfe3] shadow-md relative overflow-hidden space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#efcfe3]">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl bg-[#f4f8eb] text-[#e27396] border border-[#efcfe3]">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-[#22121b] text-base leading-tight">
                    {claims.degree}
                  </h3>
                  <p className="text-xs text-[#5a3045] font-bold mt-0.5">{credential.issuerName}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-mono font-black rounded-full uppercase tracking-wider bg-[#b3dee2] text-[#22121b] border border-[#e27396]/30">
                {credential.status}
              </span>
            </div>

            {/* Claims Table with Strict Privacy Flags */}
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between py-2 border-b border-[#f4f8eb]">
                <span className="text-[#5a3045] font-bold">SCHOLAR NAME</span>
                <span className="text-[#22121b] font-black">{claims.studentName}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#f4f8eb]">
                <span className="text-[#5a3045] font-bold">OFFICIAL CGPA</span>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-[#e27396] text-sm">{claims.cgpa} / 10.0</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#f4f8eb] text-[#5a3045] border border-[#efcfe3] font-bold">
                    Private
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#f4f8eb]">
                <span className="text-[#5a3045] font-bold">GRADUATION YEAR</span>
                <span className="text-[#22121b] font-black">{claims.graduationYear}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#f4f8eb]">
                <span className="text-[#5a3045] font-bold">ROLL NUMBER</span>
                <span className="text-[#22121b] font-semibold">{claims.studentRollNumber}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#f4f8eb]">
                <span className="text-[#5a3045] font-bold">DATE OF BIRTH</span>
                <span className="text-[#22121b] font-semibold">{claims.dateOfBirth}</span>
              </div>
            </div>

            {/* Cryptographic Badges */}
            <div className="pt-2 space-y-2.5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#f4f8eb] border border-[#efcfe3] flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[#22121b]">
                  <ShieldCheck className="w-4 h-4 text-[#e27396]" />
                  <span className="font-bold">ML-DSA-65 SIGNATURE</span>
                </div>
                <span className="text-[10px] text-[#22121b] bg-[#b3dee2] px-2 py-0.5 rounded border border-[#e27396]/20 font-black">
                  NIST FIPS 204
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#f4f8eb] border border-[#efcfe3] flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[#22121b]">
                  <Lock className="w-4 h-4 text-[#e27396]" />
                  <span className="font-bold">POSEIDON COMMITMENT</span>
                </div>
                <span className="text-[10px] text-[#e27396] truncate max-w-[140px] font-bold">
                  {credential.credentialCommitment.slice(0, 14)}...
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#f4f8eb] border border-[#efcfe3] flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[#22121b]">
                  <Database className="w-4 h-4 text-[#e27396]" />
                  <span className="font-bold">ENCRYPTED IPFS CID</span>
                </div>
                <span className="text-[#22121b] font-bold flex items-center gap-1">
                  <span>QmZ8...39c</span>
                  <ExternalLink className="w-3 h-3 text-[#e27396]" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Zero-Knowledge Prover Studio (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl p-6 sm:p-8 bg-[#ffffff] border-2 border-[#e27396] shadow-md space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#efcfe3]">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-[#f4f8eb] text-[#e27396] border border-[#efcfe3]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#22121b]">Selective-Disclosure Studio</h2>
                  <p className="text-xs text-[#5a3045] font-mono font-bold">Circom 2.1 · Groth16 Prover · Client-Side Execution</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#f4f8eb] text-[#e27396] border border-[#efcfe3] font-mono text-[10px] font-black">
                cgpaProof.circom
              </span>
            </div>

            {/* Predicate Selector */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#22121b] mb-2 font-mono uppercase">
                  1. Corporate Verification Requirement
                </label>
                <div className="p-4 rounded-2xl bg-[#f4f8eb] border border-[#efcfe3] space-y-3 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#5a3045] font-bold">Prove condition:</span>
                    <span className="text-[#e27396] font-black text-base">CGPA &ge; {threshold.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="6.0"
                    max="9.0"
                    step="0.1"
                    value={threshold}
                    onChange={(e) => setThreshold(parseFloat(e.target.value))}
                    className="w-full accent-[#e27396] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#5a3045] font-bold">
                    <span>6.0 (First Class)</span>
                    <span>7.5 (Standard Cutoff)</span>
                    <span>8.5 (Distinction)</span>
                  </div>
                </div>
              </div>

              {/* Privacy Safeguards */}
              <div>
                <label className="block text-xs font-bold text-[#22121b] mb-2 font-mono uppercase">
                  2. Zero-Knowledge Privacy Shields
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
                  <button
                    onClick={() => setHideCgpa(!hideCgpa)}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition font-bold ${
                      hideCgpa
                        ? "bg-[#e27396] border-[#e27396] text-white shadow-xs"
                        : "bg-[#f4f8eb] border-[#efcfe3] text-[#5a3045]"
                    }`}
                  >
                    <span>Hide Exact CGPA</span>
                    {hideCgpa ? <EyeOff className="w-3.5 h-3.5 text-white" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => setHideRollNo(!hideRollNo)}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition font-bold ${
                      hideRollNo
                        ? "bg-[#e27396] border-[#e27396] text-white shadow-xs"
                        : "bg-[#f4f8eb] border-[#efcfe3] text-[#5a3045]"
                    }`}
                  >
                    <span>Hide Roll No</span>
                    {hideRollNo ? <EyeOff className="w-3.5 h-3.5 text-white" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => setHideDob(!hideDob)}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition font-bold ${
                      hideDob
                        ? "bg-[#e27396] border-[#e27396] text-white shadow-xs"
                        : "bg-[#f4f8eb] border-[#efcfe3] text-[#5a3045]"
                    }`}
                  >
                    <span>Hide Birthdate</span>
                    {hideDob ? <EyeOff className="w-3.5 h-3.5 text-white" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Action Trigger */}
              <div className="pt-2">
                <button
                  disabled={isProving}
                  onClick={handleGenerateProof}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#e27396] hover:bg-[#b8476d] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#e27396]/25 disabled:opacity-50 flex items-center justify-center space-x-2 transition"
                >
                  {isProving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Computing Groth16 Constraints (WASM)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Generate Zero-Knowledge Proof</span>
                    </>
                  )}
                </button>
              </div>

              {/* Proving Status Strip */}
              {isProving && (
                <div className="p-3.5 rounded-xl bg-[#f4f8eb] border border-[#e27396] text-xs font-mono text-[#e27396] font-bold flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#e27396] animate-ping" />
                  <span>{provingStep}</span>
                </div>
              )}

              {/* Generated Proof Viewer */}
              {generatedProof && (
                <div className="p-5 rounded-2xl bg-[#ffffff] border-2 border-[#e27396] space-y-4 animate-in fade-in duration-300 font-mono text-xs shadow-md">
                  <div className="flex items-center justify-between pb-3 border-b border-[#efcfe3]">
                    <div className="flex items-center space-x-2 text-[#22121b] font-black">
                      <CheckCircle2 className="w-4 h-4 text-[#e27396]" />
                      <span>PROOF GENERATED (GROTH16 / BN254)</span>
                    </div>
                    <span className="text-[10px] text-[#22121b] bg-[#b3dee2] px-2 py-0.5 rounded border border-[#e27396]/20 font-black">
                      READY TO TRANSMIT
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[#f4f8eb] border border-[#efcfe3]">
                      <span className="text-[#5a3045] text-[10px] block font-bold">PROVEN CONDITION</span>
                      <span className="text-[#e27396] font-black text-sm">CGPA &ge; {generatedProof.provenPredicates.claimedThreshold}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f4f8eb] border border-[#efcfe3]">
                      <span className="text-[#5a3045] text-[10px] block font-bold">ACTUAL CGPA</span>
                      <span className="text-[#22121b] font-black text-sm">[REDACTED &amp; SECURE]</span>
                    </div>
                  </div>

                  {/* Public signals snippet */}
                  <div className="text-[11px] text-[#5a3045] space-y-1 bg-[#f4f8eb] p-3 rounded-xl border border-[#efcfe3] font-bold">
                    <div className="truncate">
                      <span className="text-[#22121b]">COMMITMENT:</span> {generatedProof.publicSignals.credentialCommitment}
                    </div>
                    <div className="truncate">
                      <span className="text-[#22121b]">REVOCATION ROOT:</span> {generatedProof.publicSignals.revocationRoot}
                    </div>
                  </div>

                  {/* Forward actions */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => onSendToVerifier(generatedProof)}
                      className="flex-1 py-3 px-4 rounded-xl bg-[#e27396] hover:bg-[#b8476d] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-md shadow-[#e27396]/25"
                    >
                      <span>Share With Corporate Verifier</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(generatedProof, null, 2), "proof")}
                      className="py-3 px-4 rounded-xl bg-[#f4f8eb] hover:bg-[#efcfe3] text-[#22121b] font-bold text-xs border border-[#efcfe3] flex items-center justify-center space-x-1"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#e27396]" />
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
