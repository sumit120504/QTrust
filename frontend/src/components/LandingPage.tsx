"use client";

import React, { useState } from "react";
import { AppRole } from "@/types";
import { 
  Shield, Key, Lock, Cpu, EyeOff, CheckCircle2, ArrowRight, 
  Sparkles, Layers, Building2, GraduationCap, CheckCircle, Database, 
  Zap, FileCheck, Terminal, Compass, ChevronRight, Activity, ShieldCheck
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (role: AppRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  // Live Simulator state
  const [simCgpa, setSimCgpa] = useState<number>(8.7);
  const [simThreshold, setSimThreshold] = useState<number>(7.5);
  const [maskPii, setMaskPii] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simComplete, setSimComplete] = useState<boolean>(true);

  const handleRunSim = () => {
    setIsSimulating(true);
    setSimComplete(false);
    setTimeout(() => {
      setIsSimulating(false);
      setSimComplete(true);
    }, 500);
  };

  const isEligible = simCgpa >= simThreshold;

  return (
    <div className="space-y-24 py-6">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-12">
        {/* Ambient tactical lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/10 to-purple-600/15 rounded-full blur-[130px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          {/* Tactical Security Badge */}
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-mono text-cyan-400 shadow-lg shadow-cyan-500/5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold tracking-wider">DEFENSE-GRADE IDENTITY ARCHITECTURE</span>
            <span className="text-slate-600">|</span>
            <span className="text-purple-300 font-bold">NIST FIPS 204 &amp; CIRCOM 2.1</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
            The Post-Quantum Trust Fabric for{" "}
            <span className="gradient-text-cyan">Self-Sovereign Identity</span>
          </h1>

          {/* Precision Subhead */}
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
            Universities issue <span className="text-cyan-300 font-mono font-medium">quantum-resistant</span> verifiable credentials. Students own and selectively disclose their achievements using <span className="text-purple-300 font-mono font-medium">Zero-Knowledge SNARKs</span>. Employers verify predicate claims with mathematical certainty—without storing superfluous personal data.
          </p>

          {/* Strategic Call to Action Launchpads */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate("holder")}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center space-x-2.5 transition transform hover:-translate-y-0.5"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Launch Student Wallet</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate("verifier")}
              className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider border border-slate-700/80 hover:border-cyan-500/50 flex items-center space-x-2.5 transition transform hover:-translate-y-0.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Employer Verification Station</span>
            </button>

            <button
              onClick={() => onNavigate("issuer")}
              className="px-6 py-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider border border-slate-800 hover:border-purple-500/50 flex items-center space-x-2.5 transition transform hover:-translate-y-0.5"
            >
              <Building2 className="w-4 h-4 text-purple-400" />
              <span>University Registrar Console</span>
            </button>
          </div>

          {/* Telemetry Strip */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left font-mono">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Signature Standard</span>
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" /> NIST ML-DSA-65
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Privacy Scheme</span>
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" /> Groth16 / BN254
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Trust Layer</span>
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" /> Polygon EVM
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Storage Anchor</span>
              <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-400" /> Encrypted IPFS
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Proof-of-Claim Simulator */}
      <section className="relative">
        <div className="cyber-card-glow rounded-3xl p-6 sm:p-10 border border-cyan-500/30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interactive Verification Sandbox</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Experience Zero-Knowledge Verification Live
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
                Test how an applicant proves their CGPA meets a corporate threshold without revealing their actual grades, date of birth, or roll number.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>circom: `cgpaProof.circom`</span>
            </div>
          </div>

          {/* Interactive controls and side-by-side view */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
            {/* Left: Input parameters */}
            <div className="lg:col-span-6 space-y-5">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div>
                  <div className="flex justify-between items-center text-xs font-mono mb-2">
                    <span className="text-slate-400">Actual Student CGPA (Private Claim):</span>
                    <span className="text-cyan-400 font-bold text-sm">{simCgpa.toFixed(1)} / 10.0</span>
                  </div>
                  <input
                    type="range"
                    min="5.0"
                    max="10.0"
                    step="0.1"
                    value={simCgpa}
                    onChange={(e) => setSimCgpa(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>5.0</span>
                    <span>7.5 (Standard)</span>
                    <span>8.7 (Sumit Sharma)</span>
                    <span>10.0</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900">
                  <div className="flex justify-between items-center text-xs font-mono mb-2">
                    <span className="text-slate-400">Employer Requirement (Public Predicate):</span>
                    <span className="text-purple-400 font-bold text-sm">CGPA &ge; {simThreshold.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="6.0"
                    max="9.5"
                    step="0.1"
                    value={simThreshold}
                    onChange={(e) => setSimThreshold(parseFloat(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">Mask Personal Identifiers (ZKP)</span>
                  <button
                    onClick={() => setMaskPii(!maskPii)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center space-x-1.5 transition ${
                      maskPii
                        ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    {maskPii ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{maskPii ? "Protected (Active)" : "Exposed (Raw)"}</span>
                  </button>
                </div>
              </div>

              <button
                disabled={isSimulating}
                onClick={handleRunSim}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-md shadow-cyan-500/20"
              >
                {isSimulating ? "Synthesizing Groth16 Constraints..." : "Compute Proof of Claim"}
              </button>
            </div>

            {/* Right: What Employer Sees */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-6 space-y-4 font-mono text-xs h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-slate-400 font-bold flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-emerald-400" /> VERIFIER OBSERVABLE DATA
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isEligible
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}>
                      {isEligible ? "CONDITION SATISFIED" : "CONSTRAINT VIOLATED"}
                    </span>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                      <span className="text-slate-500">Degree:</span>
                      <span className="text-slate-200">B.Tech Computer Science &amp; Engg</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                      <span className="text-slate-500">Threshold Predicate:</span>
                      <span className="text-purple-300 font-bold">CGPA &ge; {simThreshold.toFixed(1)}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                      <span className="text-slate-500">Applicant CGPA:</span>
                      {maskPii ? (
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          [REDACTED &amp; PRESERVED]
                        </span>
                      ) : (
                        <span className="text-amber-400 font-bold">{simCgpa.toFixed(1)} (Unmasked)</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                      <span className="text-slate-500">Post-Quantum Signature:</span>
                      <span className="text-purple-300">NIST ML-DSA-65 Valid</span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500">Pairing Check Result:</span>
                      <span className={isEligible ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                        {isEligible ? "e(A, B) = e(α, β) · e(C, δ) [VALID]" : "PAIRING MISMATCH [FAILED]"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                  {isEligible ? (
                    <span className="text-emerald-300">
                      The employer confirms that the applicant meets the threshold requirement without ever learning whether the student earned a 7.6, 8.7, or 9.9.
                    </span>
                  ) : (
                    <span className="text-rose-300">
                      The applicant CGPA ({simCgpa.toFixed(1)}) does not satisfy the requested threshold (&ge; {simThreshold.toFixed(1)}). The circuit cannot generate a valid witness.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Three Functional Portals Showcase */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider font-semibold">
            Modular Web3 Ecosystem
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Three Dedicated Role Portals
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Engineered with strict separation of concerns to safeguard student autonomy and prevent central point of failure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Holder Portal Card */}
          <div className="cyber-card rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-cyan-500/50 transition">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="cyber-tag text-cyan-400 block mb-1">PORTAL 01</span>
                <h3 className="text-lg font-bold text-white">Student Credential Wallet</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Students manage their pseudonymous W3C DIDs, store AES-256 encrypted credential payloads, and generate client-side Groth16 zero-knowledge proofs.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>W3C DID Document Controller</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Selective Disclosure Controls</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Off-chain Witness Generation</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigate("holder")}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 font-semibold text-xs border border-cyan-500/30 flex items-center justify-center space-x-2 transition"
            >
              <span>Enter Student Wallet</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Issuer Portal Card */}
          <div className="cyber-card rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-purple-500/50 transition">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="cyber-tag text-purple-400 block mb-1">PORTAL 02</span>
                <h3 className="text-lg font-bold text-white">University Registrar Console</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Authorized academic institutions sign credential envelopes with NIST FIPS 204 ML-DSA and maintain real-time Sparse Merkle Tree revocation accumulators.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>ML-DSA-65 Key Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Poseidon Commitment Anchoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>On-Chain SMT Revocation</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigate("issuer")}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-purple-500 hover:text-white text-purple-300 font-semibold text-xs border border-purple-500/30 flex items-center justify-center space-x-2 transition"
            >
              <span>Enter University Console</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Verifier Portal Card */}
          <div className="cyber-card rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-emerald-500/50 transition">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="cyber-tag text-emerald-400 block mb-1">PORTAL 03</span>
                <h3 className="text-lg font-bold text-white">Employer Verification Station</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Enterprises independently verify zero-knowledge presentations, validate lattice signatures, and check on-chain revocation roots in milliseconds.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>6-Stage Cryptographic Audit</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Zero-PII Storage Compliance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sub-150ms Total Latency</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigate("verifier")}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 font-semibold text-xs border border-emerald-500/30 flex items-center justify-center space-x-2 transition"
            >
              <span>Enter Verifier Station</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Architectural Highlights & Research Contribution */}
      <section className="p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">Why Q-Trust is Quantum-Resistant &amp; Privacy-First</h2>
            <p className="text-xs text-slate-400 mt-1">Understanding the dual-layer cryptographic design</p>
          </div>
          <button
            onClick={() => onNavigate("benchmarks")}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 text-xs font-mono border border-purple-500/30 flex items-center space-x-2"
          >
            <span>View Full PQC Benchmarks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed text-slate-300">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Zero-Knowledge Layer (Circom + Groth16)
            </h3>
            <p>
              Rather than uploading academic records to the blockchain, the student generates an arithmetic constraint circuit locally in the browser. The Groth16 proof validates that the student&apos;s private CGPA satisfies the inequality without revealing the raw scalar. The hash commitment binds the claims directly to the issuer&apos;s signed envelope.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Post-Quantum Layer (NIST FIPS 204 ML-DSA)
            </h3>
            <p>
              Classical digital signatures (ECDSA/RSA) rely on discrete logarithms and integer factorization, both solved by Shor&apos;s algorithm on quantum machines. Q-Trust incorporates Module-Lattice-Based Signatures (ML-DSA-65) to protect credentials against Harvest Now, Decrypt Later threats for decades to come.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
