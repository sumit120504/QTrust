"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AppRole } from "@/types";
import { 
  Shield, Key, Lock, Cpu, EyeOff, CheckCircle2, ArrowRight, 
  Sparkles, Layers, Building2, GraduationCap, CheckCircle, Database, 
  Zap, FileCheck, Terminal, Compass, ChevronRight, Activity, ShieldCheck,
  FileText, Award, AlertCircle, RefreshCw, XCircle, ArrowUpRight, Scale,
  ExternalLink, Check
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (role: AppRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  // Interactive Sandbox state
  const [activeRolePerspective, setActiveRolePerspective] = useState<"student" | "university" | "employer">("student");
  const [applicantCgpa, setApplicantCgpa] = useState<number>(8.7);
  const [requiredThreshold, setRequiredThreshold] = useState<number>(7.5);
  const [hideExactMarks, setHideExactMarks] = useState<boolean>(true);
  const [isVerifyingInSandbox, setIsVerifyingInSandbox] = useState<boolean>(false);
  const [sandboxReportReady, setSandboxReportReady] = useState<boolean>(true);

  const handleTestEvaluation = () => {
    setIsVerifyingInSandbox(true);
    setSandboxReportReady(false);
    setTimeout(() => {
      setIsVerifyingInSandbox(false);
      setSandboxReportReady(true);
    }, 450);
  };

  const isRequirementSatisfied = applicantCgpa >= requiredThreshold;

  return (
    <div className="space-y-24 py-4 font-sans text-[#22121b]">
      {/* 1. HERO SECTION WITH ACADEMIC IMAGERY */}
      <section className="relative overflow-hidden pt-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Text (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Institutional Badge */}
            <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-[#ffffff] border border-[#efcfe3] text-xs font-mono text-[#5a3045] shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e27396] animate-pulse" />
              <span className="font-bold tracking-wider">ACADEMIC TRUST INFRASTRUCTURE</span>
              <span className="text-[#ea9ab2]">|</span>
              <span className="text-[#22121b] font-extrabold">NIST FIPS 204 &amp; CIRCOM 2.1</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#22121b] tracking-tight leading-[1.08]">
              Verifiable Academic Degrees.{" "}
              <span className="text-[#e27396]">Quantum-Safe. Zero-Knowledge.</span>
            </h1>

            {/* Realistic Domain Explanation */}
            <p className="text-base sm:text-lg text-[#5a3045] leading-relaxed font-normal max-w-2xl">
              Universities issue tamper-evident diplomas signed with post-quantum lattice cryptography. Students maintain sovereign ownership of their credentials in a private cryptographic vault. Employers verify academic eligibility without acquiring or storing sensitive transcripts.
            </p>

            {/* Action Portals */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => onNavigate("holder")}
                className="px-6 py-3.5 rounded-xl bg-[#e27396] hover:bg-[#b8476d] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#e27396]/25 flex items-center space-x-2.5 transition transform hover:-translate-y-0.5"
              >
                <GraduationCap className="w-4 h-4 text-white" />
                <span>Enter Scholar Identity Vault</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <button
                onClick={() => onNavigate("issuer")}
                className="px-6 py-3.5 rounded-xl bg-[#ffffff] hover:bg-[#f4f8eb] text-[#22121b] font-bold text-xs uppercase tracking-wider border-2 border-[#e27396] flex items-center space-x-2.5 transition transform hover:-translate-y-0.5 shadow-xs"
              >
                <Building2 className="w-4 h-4 text-[#e27396]" />
                <span>University Registrar Console</span>
              </button>

              <button
                onClick={() => onNavigate("verifier")}
                className="px-6 py-3.5 rounded-xl bg-[#b3dee2] hover:bg-[#9ecfd3] text-[#22121b] font-bold text-xs uppercase tracking-wider border border-[#e27396]/40 flex items-center space-x-2.5 transition transform hover:-translate-y-0.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-[#e27396]" />
                <span>Corporate Verifier Station</span>
              </button>
            </div>

            {/* Telemetry Strip */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-left">
              <div className="p-3 rounded-2xl bg-[#ffffff] border border-[#efcfe3] shadow-xs">
                <span className="text-[10px] text-[#5a3045] uppercase tracking-widest block font-bold">Signatures</span>
                <span className="text-xs font-black text-[#e27396]">ML-DSA-65</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#ffffff] border border-[#efcfe3] shadow-xs">
                <span className="text-[10px] text-[#5a3045] uppercase tracking-widest block font-bold">Prover</span>
                <span className="text-xs font-black text-[#22121b]">Groth16 BN254</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#ffffff] border border-[#efcfe3] shadow-xs">
                <span className="text-[10px] text-[#5a3045] uppercase tracking-widest block font-bold">Trust Anchor</span>
                <span className="text-xs font-black text-[#e27396]">Polygon Amoy</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#ffffff] border border-[#efcfe3] shadow-xs">
                <span className="text-[10px] text-[#5a3045] uppercase tracking-widest block font-bold">Decentralized</span>
                <span className="text-xs font-black text-[#22121b]">W3C VC 2.0</span>
              </div>
            </div>
          </div>

          {/* Right Hero Image Card (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#efcfe3] shadow-xl bg-white">
              {/* Actual Graduation & Academic Credential Image */}
              <div className="relative h-80 w-full">
                <img
                  src="https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?q=80&w=900&auto=format&fit=crop"
                  alt="University Graduation and Degree Parchment"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#22121b]/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#e27396] text-white inline-block mb-1">
                    ACCREDITED ACADEMIC ISSUANCE
                  </span>
                  <h3 className="text-lg font-black leading-snug">
                    UEM Jaipur · B.Tech Degree Conferral
                  </h3>
                  <p className="text-xs text-white/80 font-mono">
                    Candidate: Sumit Sharma · Class of 2027
                  </p>
                </div>
              </div>

              {/* Floating Holographic Cryptographic Proof Pill */}
              <div className="p-4 bg-[#ffffff] border-t border-[#efcfe3] space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[#5a3045] font-bold">Cryptographic Status:</span>
                  <span className="text-[#e27396] font-black flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> NIST ML-DSA-65 Valid
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5a3045] font-bold">On-Chain Commitment:</span>
                  <span className="text-[#22121b] truncate max-w-[170px] font-bold">0x19a4e8d02c5be093...</span>
                </div>
              </div>
            </div>

            {/* Decorative Powder Blue Accent Badge */}
            <div className="absolute -bottom-4 -left-4 p-3.5 rounded-2xl bg-[#b3dee2] border border-[#e27396] shadow-lg flex items-center space-x-2.5 text-xs font-mono font-black text-[#22121b]">
              <Sparkles className="w-4 h-4 text-[#e27396]" />
              <span>Zero Knowledge: CGPA Redacted</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE OPERATIONAL PILLARS WITH VISUAL IMAGERY */}
      <section className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono uppercase text-[#e27396] tracking-wider font-extrabold">
            The Three-Actor Trust Triangle
          </span>
          <h2 className="text-3xl font-black text-[#22121b] tracking-tight">
            How Q-Trust Modernizes Academic Identity
          </h2>
          <p className="text-[#5a3045] text-xs sm:text-sm">
            Strict separation of responsibilities guarantees student privacy while delivering instant certainty to universities and employers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Scholar Vault */}
          <div className="rounded-3xl bg-[#ffffff] border-2 border-[#efcfe3] overflow-hidden flex flex-col justify-between hover:border-[#e27396] transition shadow-xs group">
            <div>
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=700&auto=format&fit=crop"
                  alt="Student using cryptographic wallet on campus"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#e27396] text-white text-[10px] font-mono font-bold">
                  PORTAL 01 · SCHOLAR
                </div>
              </div>
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-black text-[#22121b]">
                  Scholar Identity Vault
                </h3>
                <p className="text-xs text-[#5a3045] leading-relaxed">
                  Students own their diplomas in a private browser wallet. They generate client-side Groth16 zero-knowledge proofs to prove academic cutoffs without releasing raw marks or transcripts.
                </p>
                <ul className="space-y-1.5 text-xs text-[#22121b] font-mono pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#e27396]" />
                    <span>W3C DID Multikey Controller</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#e27396]" />
                    <span>Circom Selective Disclosure</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => onNavigate("holder")}
                className="w-full py-2.5 px-4 rounded-xl bg-[#eaf2d7] hover:bg-[#e27396] hover:text-white text-[#22121b] font-bold text-xs border border-[#efcfe3] flex items-center justify-center space-x-2 transition"
              >
                <span>Enter Scholar Vault</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pillar 2: University Registrar */}
          <div className="rounded-3xl bg-[#ffffff] border-2 border-[#efcfe3] overflow-hidden flex flex-col justify-between hover:border-[#e27396] transition shadow-xs group">
            <div>
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=700&auto=format&fit=crop"
                  alt="University Registrar and Academic Hall"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#b3dee2] text-[#22121b] text-[10px] font-mono font-bold">
                  PORTAL 02 · UNIVERSITY
                </div>
              </div>
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-black text-[#22121b]">
                  University Registrar Console
                </h3>
                <p className="text-xs text-[#5a3045] leading-relaxed">
                  Accredited institutions issue post-quantum tamper-evident credentials using NIST FIPS 204 ML-DSA-65. Credential commitments are anchored on-chain without storing student PII.
                </p>
                <ul className="space-y-1.5 text-xs text-[#22121b] font-mono pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#e27396]" />
                    <span>ML-DSA-65 Lattice Signer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#e27396]" />
                    <span>Sparse Merkle Tree Revocation</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => onNavigate("issuer")}
                className="w-full py-2.5 px-4 rounded-xl bg-[#eaf2d7] hover:bg-[#e27396] hover:text-white text-[#22121b] font-bold text-xs border border-[#efcfe3] flex items-center justify-center space-x-2 transition"
              >
                <span>Enter Registrar Console</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pillar 3: Corporate Verifier */}
          <div className="rounded-3xl bg-[#ffffff] border-2 border-[#efcfe3] overflow-hidden flex flex-col justify-between hover:border-[#e27396] transition shadow-xs group">
            <div>
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=700&auto=format&fit=crop"
                  alt="Corporate Recruiter and Talent Verification"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#ea9ab2] text-white text-[10px] font-mono font-bold">
                  PORTAL 03 · EMPLOYER
                </div>
              </div>
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-black text-[#22121b]">
                  Corporate Verifier Station
                </h3>
                <p className="text-xs text-[#5a3045] leading-relaxed">
                  Hiring managers independently verify zero-knowledge presentations and check university public keys in &lt;150ms. Zero transcript storage liability under GDPR and DPDP laws.
                </p>
                <ul className="space-y-1.5 text-xs text-[#22121b] font-mono pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#e27396]" />
                    <span>6-Stage Cryptographic Audit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#e27396]" />
                    <span>Verifiable Compliance Certificate</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => onNavigate("verifier")}
                className="w-full py-2.5 px-4 rounded-xl bg-[#eaf2d7] hover:bg-[#e27396] hover:text-white text-[#22121b] font-bold text-xs border border-[#efcfe3] flex items-center justify-center space-x-2 transition"
              >
                <span>Enter Verifier Station</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MULTI-PERSPECTIVE ROLE SIMULATOR WORKBENCH */}
      <section className="relative">
        <div className="rounded-3xl p-6 sm:p-10 bg-[#ffffff] border-2 border-[#e27396] shadow-xl space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#efcfe3]">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#f4f8eb] text-[#5a3045] border border-[#efcfe3] text-xs font-mono mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#e27396]" />
                <span className="font-bold">INTERACTIVE ROLE SIMULATION WORKBENCH</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#22121b] tracking-tight">
                Inspect Q-Trust Through Each Actor&apos;s Lens
              </h2>
              <p className="text-[#5a3045] text-xs sm:text-sm mt-1 max-w-xl">
                Select a participant role to simulate how degree issuance, selective proving, and zero-PII hiring verification unfold.
              </p>
            </div>

            {/* Role perspective selector tabs */}
            <div className="flex items-center p-1.5 rounded-2xl bg-[#f4f8eb] border border-[#efcfe3] font-mono text-xs">
              <button
                onClick={() => setActiveRolePerspective("student")}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition ${
                  activeRolePerspective === "student"
                    ? "bg-[#e27396] text-white font-bold shadow-md shadow-[#e27396]/25"
                    : "text-[#5a3045] hover:text-[#22121b]"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>1. Scholar View</span>
              </button>
              <button
                onClick={() => setActiveRolePerspective("university")}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition ${
                  activeRolePerspective === "university"
                    ? "bg-[#e27396] text-white font-bold shadow-md shadow-[#e27396]/25"
                    : "text-[#5a3045] hover:text-[#22121b]"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>2. University View</span>
              </button>
              <button
                onClick={() => setActiveRolePerspective("employer")}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition ${
                  activeRolePerspective === "employer"
                    ? "bg-[#e27396] text-white font-bold shadow-md shadow-[#e27396]/25"
                    : "text-[#5a3045] hover:text-[#22121b]"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>3. Employer View</span>
              </button>
            </div>
          </div>

          {/* Perspective 1: Student / Scholar */}
          {activeRolePerspective === "student" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-6 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#e27396] uppercase tracking-wider">SCHOLAR / CREDENTIAL HOLDER</span>
                  <h3 className="text-xl font-black text-[#22121b]">Full Ownership of Your B.Tech Degree</h3>
                  <p className="text-xs text-[#5a3045] leading-relaxed">
                    You hold an encrypted degree issued by UEM Jaipur. When applying to ABC Technologies, you choose exactly what to prove.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#f4f8eb] border border-[#efcfe3] space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#5a3045] font-bold">Your Official CGPA:</span>
                    <span className="text-[#22121b] font-black text-sm">{applicantCgpa.toFixed(1)} / 10.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#5a3045] font-bold">Employer Threshold Cutoff:</span>
                    <span className="text-[#e27396] font-black text-sm">CGPA &ge; {requiredThreshold.toFixed(1)}</span>
                  </div>
                  <div className="pt-2 border-t border-[#efcfe3] flex items-center justify-between">
                    <span className="text-[#5a3045] font-bold">Zero-Knowledge Shield:</span>
                    <button
                      onClick={() => setHideExactMarks(!hideExactMarks)}
                      className="px-3 py-1 rounded-xl bg-[#e27396] text-white text-[11px] font-bold shadow-xs"
                    >
                      {hideExactMarks ? "Active (Hide Raw CGPA)" : "Deactivated (Reveal Raw CGPA)"}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate("holder")}
                  className="w-full py-3.5 rounded-xl bg-[#e27396] hover:bg-[#b8476d] text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-[#e27396]/20 flex items-center justify-center space-x-2"
                >
                  <span>Open Full Scholar Vault</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Scholar Preview Card */}
              <div className="lg:col-span-6">
                <div className="rounded-3xl p-6 bg-[#f4f8eb] border-2 border-[#efcfe3] space-y-4 font-mono text-xs shadow-md">
                  <div className="flex justify-between items-center border-b border-[#efcfe3] pb-3">
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-[#e27396]" />
                      <span className="font-black text-[#22121b]">B.Tech Degree in Computer Science &amp; Engg</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#b3dee2] text-[#22121b]">
                      ACTIVE
                    </span>
                  </div>
                  <div className="space-y-2 text-[#5a3045]">
                    <div className="flex justify-between">
                      <span className="font-bold">Candidate:</span>
                      <span className="text-[#22121b] font-black">Sumit Sharma</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">Accredited University:</span>
                      <span className="font-semibold text-[#22121b]">UEM Jaipur</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">Graduation Year:</span>
                      <span className="font-semibold text-[#22121b]">2027</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">Cryptographic Signature:</span>
                      <span className="text-[#e27396] font-bold">NIST ML-DSA-65 (FIPS 204)</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#ffffff] border border-[#efcfe3] text-[11px] text-[#5a3045] font-bold">
                    Your private witness stays in the browser. Only the Groth16 elliptic curve proof is transmitted.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Perspective 2: University Registrar */}
          {activeRolePerspective === "university" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-6 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#e27396] uppercase tracking-wider">INSTITUTIONAL REGISTRAR CONSOLE</span>
                  <h3 className="text-xl font-black text-[#22121b]">Quantum-Resistant Credential Issuance</h3>
                  <p className="text-xs text-[#5a3045] leading-relaxed">
                    UEM Jaipur registers its authorized public key on <code className="text-[#e27396] font-bold">IssuerRegistry.sol</code> and signs student envelopes with ML-DSA-65.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#f4f8eb] border border-[#efcfe3] space-y-2.5 font-mono text-xs text-[#22121b]">
                  <div className="flex justify-between">
                    <span className="text-[#5a3045] font-bold">Institution DID:</span>
                    <span className="text-[#e27396] font-bold">did:qtrust:issuer:uem-jaipur</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5a3045] font-bold">Commitment Scheme:</span>
                    <span>Poseidon Hash over BN254</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5a3045] font-bold">Revocation Management:</span>
                    <span>Sparse Merkle Tree (SMT Root)</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate("issuer")}
                  className="w-full py-3.5 rounded-xl bg-[#e27396] hover:bg-[#b8476d] text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-[#e27396]/20 flex items-center justify-center space-x-2"
                >
                  <span>Launch University Registrar Console</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="lg:col-span-6">
                <div className="p-6 rounded-3xl bg-[#f4f8eb] border-2 border-[#efcfe3] space-y-4 font-mono text-xs">
                  <span className="text-xs font-black text-[#22121b] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#e27396]" /> ON-CHAIN COMMITMENT ANCHOR
                  </span>
                  <p className="text-[#5a3045] font-sans text-xs">
                    Instead of publishing student names or roll numbers to the blockchain, the university commits a 32-byte Poseidon hash:
                  </p>
                  <pre className="p-3.5 rounded-xl bg-[#ffffff] border border-[#efcfe3] text-[#5a3045] overflow-x-auto text-[11px] font-bold">
{`bytes32 credentialCommitment = Poseidon(
  studentSecret, 
  scaledCGPA, 
  graduationYear, 
  schemaHash
);
// Anchored in CredentialRegistry.sol`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Perspective 3: Employer */}
          {activeRolePerspective === "employer" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-6 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#e27396] uppercase tracking-wider">ENTERPRISE AUDIT TERMINAL</span>
                  <h3 className="text-xl font-black text-[#22121b]">Zero-PII Compliance &amp; Instant Hire Check</h3>
                  <p className="text-xs text-[#5a3045] leading-relaxed">
                    ABC Technologies checks the candidate against corporate predicates in &lt;150ms. No background check delays, zero GDPR/DPDP data storage liability.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#f4f8eb] border border-[#efcfe3] space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#5a3045] font-bold">Condition to Prove:</span>
                    <span className="text-[#22121b] font-black">Degree = B.Tech &amp; CGPA &ge; {requiredThreshold.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#5a3045] font-bold">Raw CGPA Received:</span>
                    <span className="text-[#e27396] font-black">[REDACTED BY CIRCOM CIRCUIT]</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#5a3045] font-bold">Proof Verification:</span>
                    <span className="text-[#22121b] font-black">100% MATHEMATICALLY VALID</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate("verifier")}
                  className="w-full py-3.5 rounded-xl bg-[#e27396] hover:bg-[#b8476d] text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-[#e27396]/20 flex items-center justify-center space-x-2"
                >
                  <span>Open Corporate Verification Terminal</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="lg:col-span-6">
                <div className="p-6 rounded-3xl bg-[#f4f8eb] border-2 border-[#efcfe3] space-y-3 font-mono text-xs shadow-xs">
                  <div className="flex items-center justify-between border-b border-[#efcfe3] pb-2">
                    <span className="text-[#e27396] font-black flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> VERIFICATION RECEIPT #QT-8902
                    </span>
                    <span className="text-[10px] text-[#5a3045] font-bold">ABC TECHNOLOGIES</span>
                  </div>
                  <div className="space-y-1.5 text-[#22121b]">
                    <div>1. University Signature (ML-DSA-65): <strong className="text-[#e27396]">PASSED</strong></div>
                    <div>2. Zero-Knowledge Proof Check: <strong className="text-[#e27396]">PASSED</strong></div>
                    <div>3. On-Chain Revocation Status: <strong className="text-[#e27396]">ACTIVE</strong></div>
                    <div>4. Exact Student CGPA: <strong className="text-[#b3dee2] bg-[#22121b] px-1.5 py-0.5 rounded font-bold">CONFIDENTIAL (Zero PII)</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. QUANTUM DEFENSE & RESEARCH SECTION WITH CRYPTO NETWORK IMAGE */}
      <section className="rounded-3xl bg-[#ffffff] border-2 border-[#efcfe3] overflow-hidden shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          {/* Image (5 cols) */}
          <div className="lg:col-span-5 relative h-72 lg:h-full min-h-[300px]">
            <img
              src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=900&auto=format&fit=crop"
              alt="Cryptographic network and post-quantum security"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#ffffff]/90 hidden lg:block" />
            <div className="absolute bottom-4 left-4 p-2.5 rounded-xl bg-[#22121b]/80 backdrop-blur-md text-white text-[11px] font-mono">
              FIPS 204 Lattice Cryptography
            </div>
          </div>

          {/* Research & Benchmarks Details (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-[#e27396] uppercase tracking-wider">
                B.TECH FINAL-YEAR RESEARCH CONTRIBUTION
              </span>
              <h2 className="text-2xl font-black text-[#22121b]">
                Post-Quantum Cryptography &amp; Signature Analysis
              </h2>
              <p className="text-xs text-[#5a3045] leading-relaxed">
                Classical ECDSA (<code className="text-[#e27396]">secp256k1</code>) will succumb to Shor&apos;s algorithm on quantum hardware. Q-Trust integrates Module-Lattice Signatures (ML-DSA-65) to future-proof degree authenticity for decades.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-2xl bg-[#f4f8eb] border border-[#efcfe3]">
                <span className="text-[#5a3045] text-[10px] block font-bold">ECDSA SIZE</span>
                <span className="text-base font-black text-[#22121b] mt-0.5 block">65 Bytes</span>
                <span className="text-[9px] text-[#e27396] font-bold">Quantum Vulnerable</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#efcfe3] border border-[#ea9ab2]">
                <span className="text-[#5a3045] text-[10px] block font-bold">ML-DSA-65</span>
                <span className="text-base font-black text-[#22121b] mt-0.5 block">3,309 B</span>
                <span className="text-[9px] text-[#22121b] font-bold">NIST Category 3</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#f4f8eb] border border-[#efcfe3]">
                <span className="text-[#5a3045] text-[10px] block font-bold">VERIFY SPEED</span>
                <span className="text-base font-black text-[#22121b] mt-0.5 block">0.89 ms</span>
                <span className="text-[9px] text-[#22121b] font-bold">2.6x Faster</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#b3dee2] border border-[#e27396]/40">
                <span className="text-[#22121b] text-[10px] block font-bold">GAS SAVINGS</span>
                <span className="text-base font-black text-[#22121b] mt-0.5 block">~55k Gas</span>
                <span className="text-[9px] text-[#22121b] font-bold">Off-chain PQC</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate("benchmarks")}
              className="px-5 py-3 rounded-xl bg-[#e27396] hover:bg-[#b8476d] text-white text-xs font-mono font-bold flex items-center space-x-2 transition shadow-md shadow-[#e27396]/20"
            >
              <span>Explore Full Empirical Benchmark Suite</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
