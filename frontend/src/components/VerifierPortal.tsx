"use client";

import React, { useState, useEffect } from "react";
import { ZKProofPayload, CredentialEnvelope } from "@/types";
import { verifyPresentation, VerificationReport } from "@/lib/cryptoSim";
import { ApiClient } from "@/lib/apiClient";
import { 
  CheckCircle2, XCircle, ShieldCheck, Lock, EyeOff, Check, 
  Copy, RefreshCw, FileText, Terminal, AlertTriangle, Shield
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
  const [copiedAudit, setCopiedAudit] = useState<boolean>(false);
  const [isBackendLive, setIsBackendLive] = useState<boolean>(false);

  useEffect(() => {
    ApiClient.checkHealth().then((health) => {
      setIsBackendLive(!!health);
    });
  }, []);

  const handleVerify = async () => {
    if (!currentProof) return;
    setIsVerifying(true);
    setReport(null);

    try {
      // 1. Attempt verification via Phase 4 Cryptographic Audit Gateway
      const liveAuditRes = await ApiClient.verifyProof({
        verifierName: "ABC Technologies (Enterprise HR Compliance)",
        proof: currentProof.proof,
        publicSignals: [
          currentProof.publicSignals.credentialCommitment,
          currentProof.publicSignals.thresholdCgpa.toString(),
        ],
        credentialEnvelope,
        thresholdCgpa: currentProof.publicSignals.thresholdCgpa,
      });

      if (liveAuditRes && liveAuditRes.success && liveAuditRes.auditReport) {
        setIsBackendLive(true);
        const rep = liveAuditRes.auditReport;
        setReport({
          overallPassed: rep.overallPassed,
          totalLatencyMs: rep.totalLatencyMs,
          checks: rep.checks.map((chk: any) => ({
            name: chk.name,
            category: "DID",
            passed: chk.passed,
            details: chk.details,
            latencyMs: chk.latencyMs,
          })),
          predicateSummary: rep.predicateSummary,
          privacyGuarantee: rep.privacyGuarantee,
          receiptId: rep.receiptId,
        });
      } else {
        // Fallback to local cryptographic simulation
        const res = await verifyPresentation(currentProof, credentialEnvelope);
        setReport(res);
      }
    } catch {
      const res = await verifyPresentation(currentProof, credentialEnvelope);
      setReport(res);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyAuditReceipt = () => {
    if (!report) return;
    const receipt = {
      auditTimestamp: new Date().toISOString(),
      receiptId: report.receiptId || "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      verifierId: "ABC Technologies (Enterprise HR Compliance)",
      overallStatus: report.overallPassed ? "PASSED" : "FAILED",
      totalLatencyMs: report.totalLatencyMs,
      checks: report.checks,
      predicateProven: report.predicateSummary,
      privacyGuarantee: report.privacyGuarantee,
    };
    navigator.clipboard.writeText(JSON.stringify(receipt, null, 2));
    setCopiedAudit(true);
    setTimeout(() => setCopiedAudit(false), 2500);
  };

  return (
    <div className="space-y-8 font-sans text-[#22121b]">
      {/* 1. Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-[#ffffff] border-2 border-[#e27396] shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#f4f8eb] text-[#5a3045] border border-[#efcfe3] text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-[#e27396]" />
              <span className="font-bold">ENTERPRISE TALENT AUDIT TERMINAL · ZERO-PII INGESTION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#22121b] tracking-tight">
              Corporate Verification Station
            </h1>
            <p className="text-[#5a3045] text-xs sm:text-sm max-w-2xl font-normal leading-relaxed">
              Verify claims against on-chain smart contracts and post-quantum digital signatures with zero disclosure of superfluous personal information.
            </p>
          </div>

          <div className="flex items-center space-x-3 font-mono">
            <div className={`p-4 rounded-2xl border text-left ${isBackendLive ? "bg-[#f4f8eb] border-[#b3dee2]" : "bg-[#efcfe3]/40 border-[#ea9ab2]"}`}>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isBackendLive ? "bg-emerald-500 animate-pulse" : "bg-[#ea9ab2]"}`} />
                <span className="text-[10px] text-[#5a3045] uppercase tracking-widest block font-bold">
                  {isBackendLive ? "VERIFICATION GATEWAY (PORT 4000)" : "LOCAL AUDIT ENGINE"}
                </span>
              </div>
              <span className="text-sm font-black text-[#22121b] flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-[#e27396]" /> ABC Technologies
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry info */}
        <div className="mt-6 pt-4 border-t border-[#efcfe3] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#5a3045]">
          <div className="flex items-center space-x-2">
            <span className="font-bold">PAIRING ENGINE:</span>
            <span className="text-[#e27396] font-bold">BN254 Optimal Ate Pairing</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold">REGULATORY STANDARD:</span>
            <span className="text-[#e27396] font-black">GDPR &amp; DPDP Zero-PII Ingestion</span>
          </div>
        </div>
      </div>

      {!currentProof ? (
        <div className="p-12 rounded-3xl bg-[#ffffff] border-2 border-dashed border-[#ea9ab2] text-center space-y-4 shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#efcfe3] text-[#e27396] flex items-center justify-center border border-[#ea9ab2]">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-[#22121b]">No Candidate Presentation Loaded</h3>
            <p className="text-xs text-[#5a3045] max-w-md mx-auto font-medium">
              Switch to the Scholar Vault to generate a Zero-Knowledge Proof for CGPA &ge; 7.5, then click &quot;Share With Corporate Verifier&quot;.
            </p>
          </div>
          <button
            onClick={onNavigateToHolder}
            className="px-6 py-3 rounded-xl bg-[#e27396] hover:bg-[#d46286] text-white font-bold text-xs uppercase tracking-wider transition shadow-md"
          >
            Launch Scholar Vault to Generate Proof
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Presentation Payload Received (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#ffffff] border-2 border-[#ea9ab2] space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#efcfe3]">
                <div className="flex items-center space-x-2 font-mono">
                  <FileText className="w-4 h-4 text-[#e27396]" />
                  <h3 className="font-black text-[#22121b] text-sm">Transmitted Presentation</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#b3dee2]/40 text-[#22121b] border border-[#b3dee2] font-mono text-[10px] font-black">
                  Groth16 Proof &pi;
                </span>
              </div>

              {/* Revealed Claims */}
              <div className="space-y-2.5 font-mono text-xs">
                <span className="text-[10px] uppercase text-[#5a3045] font-bold block">
                  Publicly Disclosed Claims
                </span>
                <div className="p-4 rounded-2xl bg-[#f4f8eb] border border-[#efcfe3] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#5a3045] font-bold">DEGREE:</span>
                    <span className="text-[#22121b] font-black">{currentProof.revealedClaims.degree}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5a3045] font-bold">GRAD YEAR:</span>
                    <span className="text-[#22121b] font-black">{currentProof.revealedClaims.graduationYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5a3045] font-bold">ISSUER:</span>
                    <span className="text-[#22121b] font-bold truncate max-w-[170px]">{credentialEnvelope.issuerName}</span>
                  </div>
                </div>
              </div>

              {/* Zero-Knowledge Claims (Redacted) */}
              <div className="space-y-2.5 font-mono text-xs">
                <span className="text-[10px] uppercase text-[#5a3045] font-bold block">
                  Zero-Knowledge Redacted Claims
                </span>
                <div className="p-4 rounded-2xl bg-[#ffffff] border border-[#ea9ab2] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#5a3045] font-bold flex items-center gap-1.5">
                      <EyeOff className="w-3.5 h-3.5 text-[#e27396]" /> EXACT CGPA:
                    </span>
                    <span className="text-[#e27396] font-black">[REDACTED IN PROOF]</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#5a3045] font-bold flex items-center gap-1.5">
                      <EyeOff className="w-3.5 h-3.5 text-[#e27396]" /> ROLL NUMBER:
                    </span>
                    <span className="text-[#e27396] font-black">[REDACTED IN PROOF]</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#5a3045] font-bold flex items-center gap-1.5">
                      <EyeOff className="w-3.5 h-3.5 text-[#e27396]" /> BIRTHDATE:
                    </span>
                    <span className="text-[#e27396] font-black">[REDACTED IN PROOF]</span>
                  </div>
                </div>
              </div>

              {/* Predicate Requirement Pill */}
              <div className="p-3.5 rounded-xl bg-[#b3dee2]/25 border border-[#b3dee2] text-xs font-mono flex items-center justify-between">
                <span className="text-[#5a3045] font-bold">Predicate Requirement:</span>
                <span className="font-black text-[#e27396] text-sm">CGPA &ge; {currentProof.provenPredicates.claimedThreshold}</span>
              </div>

              {/* Run Verification Button */}
              <button
                disabled={isVerifying}
                onClick={handleVerify}
                className="w-full py-3.5 px-4 rounded-xl bg-[#e27396] hover:bg-[#d46286] text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Executing Cryptographic Verifier Pipeline...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Execute 6-Stage Verification</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: 6-Stage Verification Breakdown (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl p-6 sm:p-8 bg-[#ffffff] border-2 border-[#e27396] space-y-6 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-[#efcfe3]">
                <div>
                  <h3 className="font-black text-[#22121b] text-base">Cryptographic Audit Inspection</h3>
                  <p className="text-xs text-[#5a3045] font-mono font-bold">On-Chain Trust Anchor · Post-Quantum Signature · Pairings</p>
                </div>
                {report && (
                  <span className={`px-3 py-1 rounded-full font-mono text-[10px] font-black ${
                    report.overallPassed
                      ? "bg-[#b3dee2] text-[#22121b] border border-[#b3dee2]"
                      : "bg-[#efcfe3] text-[#e27396] border border-[#ea9ab2]"
                  }`}>
                    {report.overallPassed ? "100% VERIFIED" : "AUDIT FAILED"}
                  </span>
                )}
              </div>

              {!report ? (
                <div className="py-16 text-center text-[#5a3045] text-xs font-mono space-y-2">
                  <Terminal className="w-6 h-6 mx-auto text-[#e27396]" />
                  <p className="font-bold">Click &quot;Execute 6-Stage Verification&quot; to test elliptic curve pairings, ML-DSA signature, and revocation accumulators.</p>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Step Checklist */}
                  <div className="space-y-2.5">
                    {report.checks.map((chk, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border-2 flex items-start space-x-3.5 text-xs font-mono transition ${
                          chk.passed
                            ? "bg-[#f4f8eb] border-[#efcfe3] hover:border-[#ea9ab2]"
                            : "bg-[#efcfe3]/40 border-[#e27396]"
                        }`}
                      >
                        <div className="mt-0.5">
                          {chk.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-[#e27396] flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-[#e27396] flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-[#22121b]">{chk.name}</span>
                            <span className="text-[10px] text-[#5a3045] font-bold">{chk.latencyMs}ms</span>
                          </div>
                          <p className="text-[11px] text-[#5a3045] mt-1 truncate font-sans font-medium">{chk.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary & Compliance Card */}
                  <div className={`p-5 rounded-2xl border-2 space-y-3 ${
                    report.overallPassed
                      ? "bg-[#b3dee2]/25 border-[#b3dee2] text-[#22121b]"
                      : "bg-[#efcfe3]/50 border-[#ea9ab2] text-[#22121b]"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 font-black text-xs font-mono">
                        {report.overallPassed ? <Check className="w-4 h-4 text-[#e27396]" /> : <AlertTriangle className="w-4 h-4 text-[#e27396]" />}
                        <span>{report.predicateSummary}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#22121b] font-black">Total Latency: {report.totalLatencyMs}ms</span>
                    </div>

                    <p className="text-xs text-[#22121b] leading-relaxed font-sans font-medium">
                      <strong className="text-[#e27396] font-black font-mono">Privacy Guarantee:</strong> {report.privacyGuarantee}
                    </p>

                    {report.receiptId && (
                      <div className="p-2.5 rounded-xl bg-[#ffffff] border border-[#ea9ab2] text-[11px] font-mono text-[#5a3045] truncate">
                        <span className="text-[#22121b] font-bold">ON-CHAIN AUDIT RECEIPT:</span>{" "}
                        <span className="text-[#e27396] font-bold">{report.receiptId}</span>
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleCopyAuditReceipt}
                        className="px-4 py-2 rounded-xl bg-[#ffffff] hover:bg-[#efcfe3] text-xs font-mono text-[#22121b] font-black border border-[#ea9ab2] flex items-center space-x-1.5 shadow-sm transition"
                      >
                        {copiedAudit ? <Check className="w-3.5 h-3.5 text-[#e27396]" /> : <Copy className="w-3.5 h-3.5 text-[#e27396]" />}
                        <span>{copiedAudit ? "Receipt Copied!" : "Copy Audit Certificate"}</span>
                      </button>
                    </div>
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
