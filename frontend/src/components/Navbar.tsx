"use client";

import React from "react";
import { AppRole } from "@/types";
import { 
  Shield, GraduationCap, Building2, CheckCircle2, Database, 
  BarChart3, Wallet, Cpu, Compass, Globe, Lock, ArrowUpRight
} from "lucide-react";

interface NavbarProps {
  activeRole: AppRole;
  setActiveRole: (role: AppRole) => void;
  walletAddress: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeRole, setActiveRole, walletAddress }) => {
  const navItems: { id: AppRole; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "landing", label: "Executive Blueprint", icon: <Compass className="w-3.5 h-3.5" /> },
    { id: "holder", label: "Scholar Vault", icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: "issuer", label: "University Registrar", icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: "verifier", label: "Corporate Verifier", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { id: "explorer", label: "Ledger", icon: <Database className="w-3.5 h-3.5" /> },
    { id: "benchmarks", label: "PQC Research", icon: <BarChart3 className="w-3.5 h-3.5" />, badge: "FIPS 204" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#efcfe3] bg-[#ffffff]/90 backdrop-blur-xl shadow-xs">
      {/* Top Academic & Cryptographic Telemetry Ribbon */}
      <div className="border-b border-[#efcfe3] bg-[#f4f8eb] px-4 py-1.5 text-[10px] font-mono text-[#5a3045] hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5 text-[#e27396] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#e27396] animate-pulse" />
              <span>POST-QUANTUM TRUST PROTOCOL ACTIVE</span>
            </span>
            <span className="text-[#efcfe3]">|</span>
            <span className="text-[#22121b] flex items-center space-x-1">
              <Globe className="w-3 h-3 text-[#b3dee2]" />
              <span>CHAIN: POLYGON EVM (AMOY 80002)</span>
            </span>
            <span className="text-[#efcfe3]">|</span>
            <span className="text-[#22121b] flex items-center space-x-1">
              <Cpu className="w-3 h-3 text-[#e27396]" />
              <span>SIGNATURE: NIST FIPS 204 ML-DSA-65</span>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[#5a3045]">
            <span>PAIRINGS: BN254 GROTH16</span>
            <span className="text-[#efcfe3]">|</span>
            <span className="text-[#e27396] font-bold">ZERO-PII COMPLIANT</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Academic Identity */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => setActiveRole("landing")}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#e27396] via-[#ea9ab2] to-[#b3dee2] shadow-md shadow-[#e27396]/20 group-hover:shadow-[#e27396]/40 transition">
              <Shield className="w-5 h-5 text-white font-black" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#eaf2d7] rounded-full border-2 border-[#e27396]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-[#22121b] font-sans">
                  Q-TRUST
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#b3dee2]/40 text-[#22121b] border border-[#b3dee2]">
                  ACADEMIC VC 2.0
                </span>
              </div>
              <p className="text-[10px] text-[#5a3045] font-mono tracking-tight hidden md:block">
                Quantum-Resilient Decentralized Credential Platform
              </p>
            </div>
          </div>

          {/* Role Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-[#f4f8eb] p-1.5 rounded-xl border border-[#efcfe3]">
            {navItems.map((item) => {
              const active = activeRole === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveRole(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all duration-200 ${
                    active
                      ? "bg-[#e27396] text-white shadow-md shadow-[#e27396]/30"
                      : "text-[#5a3045] hover:text-[#22121b] hover:bg-[#efcfe3]/40"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`ml-1 px-1.5 py-0.2 text-[9px] font-bold rounded ${
                      active ? "bg-white/20 text-white" : "bg-[#b3dee2] text-[#22121b] border border-[#efcfe3]"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Connected Identity Pill */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#ffffff] border border-[#efcfe3] text-xs font-mono text-[#22121b] hover:border-[#e27396] transition shadow-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-[#e27396]" />
              <span className="text-[#5a3045] hidden sm:inline font-bold">WALLET:</span>
              <span className="text-[#e27396] font-semibold">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <div className="lg:hidden flex items-center justify-between py-2 border-t border-[#efcfe3] overflow-x-auto gap-2 bg-[#ffffff]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveRole(item.id)}
              className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-mono whitespace-nowrap rounded-lg ${
                activeRole === item.id 
                  ? "bg-[#e27396] text-white font-bold" 
                  : "text-[#5a3045]"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
