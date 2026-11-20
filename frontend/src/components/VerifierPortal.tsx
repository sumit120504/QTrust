"use client";

import React, { useState } from "react";
import { ZKProofPayload, CredentialEnvelope } from "@/types";
import { verifyPresentation, VerificationReport } from "@/lib/cryptoSim";
import { 
  CheckCircle2, XCircle, ShieldCheck, Lock, UserCheck, Eye, 
  EyeOff, Award, Cpu, AlertTriangle, RefreshCw, FileText, Check 
} from "lucide-react";

interface VerifierPortalProps {
  currentProof: ZKProofPayload | null;
  credentialEnvelope: CredentialEnvelope;
  onNavigateToHolder: () => void;
}

export const VerifierPortal: React.FC<VerifierPortalProps> = ({
  currentProof,
  credentialEnvelope,
  onNavigateToHolder,
}) => {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [report, setReport] = useState<VerificationReport | null>(null);

  const handleVerify = async () => {
    if (!currentProof) return;
    setIsVerifying(true);
    setReport(null);

    const res = await verifyPresentation(currentProof, credentialEnvelope);
    setReport(res);
    setIsVerifying(false);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verifier Verification Station (ABC Technologies)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Privacy-Preserving Credential Verification
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Verify claims against on-chain smart contracts and post-quantum digital signatures with zero disclosure of superfluous personal information.
            </p>
          </div>
        </div>
      </div>

      {!currentProof ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/60 p-12 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No Presentation Loaded Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Switch to the Student Portal to generate a Zero-Knowledge Proof for CGPA &ge; 7.5, then click &quot;Share With Employer Verifier&quot;.
            </p>
          </div>
          <button
            onClick={onNavigateToHolder}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-500/20"
          >
            Go to Student Portal to Generate Proof
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Presentation Payload Received (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-white text-sm">Submitted Presentation</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  ZK-SNARK Groth16
                </span>
              </div>

              {/* Revealed Claims */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Disclosed Academic Claims
                </span>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Claimed Degree:</span>
                    <span className="text-slate-200 font-semibold">{currentProof.revealedClaims.degree}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Graduation Year:</span>
                    <span className="text-slate-200 font-mono">{currentProof.revealedClaims.graduationYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Issuer Institution:</span>
                    <span className="text-slate-200">{credentialEnvelope.issuerName}</span>
                  </div>
                </div>
              </div>

              {/* Zero-Knowledge Claims (Redacted) */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Zero-Knowledge Redacted Claims
                </span>
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/20 space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <EyeOff className="w-3.5 h-3.5 text-emerald-400" /> Exact CGPA:
                    </span>
                    <span className="text-emerald-400 font-bold">REDACTED IN PROOF</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <EyeOff className="w-3.5 h-3.5 text-emerald-400" /> Candidate Roll No:
                    </span>
                    <span className="text-emerald-400 font-bold">REDACTED IN PROOF</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <EyeOff className="w-3.5 h-3.5 text-emerald-400" /> Date of Birth:
                    </span>
                    <span className="text-emerald-400 font-bold">REDACTED IN PROOF</span>
                  </div>
                </div>
              </div>

              {/* Predicate to Verify */}
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs flex items-center justify-between">
                <span className="text-blue-300">Employer Predicate Requirement:</span>
                <span className="font-mono font-bold text-white">CGPA &ge; {currentProof.provenPredicates.claimedThreshold}</span>
              </div>

              {/* Verify Trigger */}
              <button
                disabled={isVerifying}
                onClick={handleVerify}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Executing 6-Stage Cryptographic Verifier...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>Run Verification Protocol</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: 6-Stage Cryptographic Report (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel-glow rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-white text-base">Cryptographic Audit Breakdown</h3>
                  <p className="text-xs text-slate-400">Smart Contract Trust Anchor + Lattice Signature + ZKP Check</p>
                </div>
                {report && (
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg font-mono ${
                    report.overallPassed
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  }`}>
                    {report.overallPassed ? "VERIFIED (100% VALID)" : "VERIFICATION FAILED"}
                  </span>
                )}
              </div>

              {!report ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Click &quot;Run Verification Protocol&quot; to execute contract resolution, ML-DSA signature check, and Groth16 pairing tests.
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Step Checklist */}
                  <div className="space-y-2.5">
                    {report.checks.map((chk, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-start space-x-3 text-xs transition ${
                          chk.passed
                            ? "bg-slate-950/80 border-slate-800/80 hover:border-emerald-500/30"
                            : "bg-rose-950/20 border-rose-500/40"
                        }`}
                      >
                        <div className="mt-0.5">
                          {chk.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{chk.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{chk.latencyMs}ms</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">{chk.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Callout */}
                  <div className={`p-4 rounded-xl border space-y-2 ${
                    report.overallPassed
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-200"
                  }`}>
                    <div className="flex items-center space-x-2 font-bold text-xs">
                      {report.overallPassed ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      <span>{report.predicateSummary}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      <strong className="text-cyan-300">Privacy Guarantee:</strong> {report.privacyGuarantee}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
