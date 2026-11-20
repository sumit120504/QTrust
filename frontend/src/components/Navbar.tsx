"use client";

import React from "react";
import { AppRole } from "@/types";
import { 
  Shield, GraduationCap, Building2, CheckCircle2, Database, 
  BarChart3, Wallet, Cpu, Compass, Globe, Lock, Activity
} from "lucide-react";

interface NavbarProps {
  activeRole: AppRole;
  setActiveRole: (role: AppRole) => void;
  walletAddress: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeRole, setActiveRole, walletAddress }) => {
  const navItems: { id: AppRole; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "landing", label: "Overview", icon: <Compass className="w-3.5 h-3.5" /> },
    { id: "holder", label: "Student Wallet", icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: "issuer", label: "University Issuer", icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: "verifier", label: "Employer Station", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { id: "explorer", label: "Ledger", icon: <Database className="w-3.5 h-3.5" /> },
    { id: "benchmarks", label: "PQC Lab", icon: <BarChart3 className="w-3.5 h-3.5" />, badge: "Research" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      {/* Top Cyber Telemetry Bar */}
      <div className="border-b border-slate-900/90 bg-slate-950 px-4 py-1 text-[10px] font-mono text-slate-500 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>SYSTEM STATUS: OPERATIONAL</span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400 flex items-center space-x-1">
              <Globe className="w-3 h-3 text-cyan-400" />
              <span>NETWORK: POLYGON AMOY (EVM 80002)</span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-purple-300 flex items-center space-x-1">
              <Cpu className="w-3 h-3 text-purple-400" />
              <span>PQC: ML-DSA-65 (NIST FIPS 204)</span>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-slate-400">
            <span>CIRCUIT: BN254 / Groth16</span>
            <span className="text-slate-700">|</span>
            <span>CONTRACTS: 4 VERIFIED</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => setActiveRole("landing")}
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition">
              <Shield className="w-5 h-5 text-slate-950 font-bold" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg tracking-wider text-white">Q-TRUST</span>
                <span className="cyber-tag px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden md:block">
                Quantum-Safe Decentralized Identity
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800/80">
            {navItems.map((item) => {
              const active = activeRole === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveRole(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <span className={active ? "text-cyan-400" : "text-slate-500"}>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1 py-0.2 text-[9px] font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Connected Wallet Pill */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800/90 text-xs font-mono text-slate-300 hover:border-cyan-500/40 transition cursor-pointer">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-400 hidden sm:inline">WALLET:</span>
              <span className="text-cyan-300 font-medium">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-slate-800/60 overflow-x-auto gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveRole(item.id)}
              className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-mono whitespace-nowrap rounded-lg ${
                activeRole === item.id 
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" 
                  : "text-slate-400"
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
