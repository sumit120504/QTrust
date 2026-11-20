"use client";

import React from "react";
import { BENCHMARK_DATA } from "@/lib/mockData";
import { Cpu, ShieldCheck, AlertTriangle, Scale, BarChart2 } from "lucide-react";

export const PQCBenchmarks: React.FC = () => {
  return (
    <div className="space-y-8 font-sans text-[#22121b]">
      {/* Top Banner */}
      <div className="rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-[#ffffff] border-2 border-[#e27396] shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#f4f8eb] text-[#5a3045] border border-[#efcfe3] text-xs font-mono mb-2">
              <Cpu className="w-3.5 h-3.5 text-[#e27396]" />
              <span className="font-bold">NIST FIPS 204 EVALUATION SUITE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#22121b] tracking-tight">
              Post-Quantum Cryptography &amp; Signature Benchmarks
            </h1>
            <p className="text-[#5a3045] text-xs sm:text-sm mt-1 max-w-2xl font-normal leading-relaxed">
              Comparative performance evaluation of Classical ECDSA (<code className="text-[#e27396] font-bold">secp256k1</code>) versus NIST Standardized ML-DSA (Module-Lattice-Based Digital Signature Algorithm).
            </p>
          </div>
        </div>
      </div>

      {/* Benchmark Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-5 rounded-2xl bg-[#ffffff] border-2 border-[#ea9ab2] space-y-1 shadow-sm">
          <span className="text-[10px] text-[#5a3045] uppercase tracking-wider font-bold">
            Classical ECDSA Signature
          </span>
          <div className="text-2xl font-black text-[#22121b]">65 Bytes</div>
          <span className="text-[10px] text-[#e27396] flex items-center gap-1 font-sans font-bold">
            <AlertTriangle className="w-3 h-3" /> Vulnerable to Shor&apos;s Algorithm
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#b3dee2]/30 border-2 border-[#b3dee2] space-y-1 shadow-sm">
          <span className="text-[10px] text-[#5a3045] uppercase tracking-wider font-bold">
            ML-DSA-65 Signature Size
          </span>
          <div className="text-2xl font-black text-[#22121b]">3,309 Bytes</div>
          <span className="text-[10px] text-[#22121b] flex items-center gap-1 font-sans font-bold">
            <ShieldCheck className="w-3 h-3 text-[#e27396]" /> Quantum Resistant (NIST Level 3)
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#ffffff] border-2 border-[#ea9ab2] space-y-1 shadow-sm">
          <span className="text-[10px] text-[#5a3045] uppercase tracking-wider font-bold">
            ML-DSA-65 Verify Latency
          </span>
          <div className="text-2xl font-black text-[#e27396]">0.89 ms</div>
          <span className="text-[10px] text-[#22121b] font-sans font-bold">
            2.6x faster verification than ECDSA
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#ffffff] border-2 border-[#ea9ab2] space-y-1 shadow-sm">
          <span className="text-[10px] text-[#5a3045] uppercase tracking-wider font-bold">
            Groth16 Verification Gas
          </span>
          <div className="text-2xl font-black text-[#e27396]">~210k Gas</div>
          <span className="text-[10px] text-[#5a3045] font-sans font-bold">
            Pairing check on BN254 Curve
          </span>
        </div>
      </div>

      {/* Detailed Benchmark Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#ffffff] border-2 border-[#ea9ab2] space-y-6 shadow-sm">
        <div className="flex items-center space-x-2 pb-4 border-b border-[#efcfe3]">
          <BarChart2 className="w-5 h-5 text-[#e27396]" />
          <h2 className="text-base font-black text-[#22121b]">Cryptographic Benchmarks (Empirical Test Vectors)</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#efcfe3] text-[#5a3045]">
                <th className="py-3 px-3 font-bold">Algorithm</th>
                <th className="py-3 px-3 font-bold">Classification</th>
                <th className="py-3 px-3 font-bold">Public Key</th>
                <th className="py-3 px-3 font-bold">Signature Size</th>
                <th className="py-3 px-3 font-bold">Sign Latency</th>
                <th className="py-3 px-3 font-bold">Verify Latency</th>
                <th className="py-3 px-3 font-bold">Quantum Safe?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efcfe3]">
              {BENCHMARK_DATA.map((row, idx) => (
                <tr key={idx} className={row.algorithm.includes("Q-Trust") ? "bg-[#f4f8eb] font-black" : ""}>
                  <td className="py-3.5 px-3 text-[#22121b] flex items-center space-x-1.5 font-bold">
                    <span>{row.algorithm}</span>
                  </td>
                  <td className="py-3.5 px-3 text-[#5a3045] font-medium">{row.type}</td>
                  <td className="py-3.5 px-3 text-[#e27396] font-bold">{row.publicKeySizeBytes} B</td>
                  <td className="py-3.5 px-3 text-[#e27396] font-bold">{row.signatureSizeBytes} B</td>
                  <td className="py-3.5 px-3 text-[#22121b] font-bold">{row.signTimeMs} ms</td>
                  <td className="py-3.5 px-3 text-[#e27396] font-bold">{row.verifyTimeMs} ms</td>
                  <td className="py-3.5 px-3">
                    {row.quantumResistant ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#b3dee2] text-[#22121b] border border-[#b3dee2] text-[10px] font-black">
                        YES (Lattice)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-[#efcfe3] text-[#e27396] border border-[#ea9ab2] text-[10px] font-bold">
                        NO (Vulnerable)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Architectural Justification Notice */}
      <div className="p-6 rounded-3xl bg-[#efcfe3]/50 border-2 border-[#e27396] space-y-3 font-mono text-xs shadow-sm">
        <div className="flex items-center space-x-2 text-[#22121b] font-black text-sm">
          <Scale className="w-4 h-4 text-[#e27396]" />
          <span>Research Contribution &amp; Design Trade-off Note</span>
        </div>
        <p className="text-[#22121b] leading-relaxed font-sans font-medium">
          While ML-DSA signatures ensure long-term, quantum-resistant non-repudiation for university credentials, storing 3.3 KB signatures directly in EVM smart contract state would incur prohibitive gas costs (~55,000 gas per issuance for calldata alone). Q-Trust solves this by establishing a <strong>two-layer architecture</strong>: the smart contract anchors a 32-byte Poseidon commitment and the issuer&apos;s public-key fingerprint, while the verifier verifies the off-chain ML-DSA signature envelope alongside the Groth16 zero-knowledge proof.
        </p>
      </div>
    </div>
  );
};
