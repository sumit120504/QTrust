"use client";

import React, { useState } from "react";
import { AppRole } from "@/types";
import { 
  Shield, GraduationCap, Building2, CheckCircle2, Database, 
  BarChart3, Cpu, Compass, Globe, Menu, X, ChevronRight, 
  ArrowUpRight, Lock, KeyRound
} from "lucide-react";

interface NavbarProps {
  activeRole: AppRole;
  setActiveRole: (role: AppRole) => void;
  walletAddress: string;
}

interface NavItem {
  id: AppRole;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeRole, setActiveRole, walletAddress }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const navItems: NavItem[] = [
    { 
      id: "landing", 
      label: "Executive Blueprint", 
      shortLabel: "Overview", 
      description: "Architecture blueprint & trust triangle",
      icon: Compass 
    },
    { 
      id: "holder", 
      label: "Scholar Vault", 
      shortLabel: "Scholar Vault", 
      description: "Student identity, DID & Groth16 selective proofs",
      icon: GraduationCap 
    },
    { 
      id: "issuer", 
      label: "University Registrar", 
      shortLabel: "Registrar", 
      description: "Issue degree credentials & ML-DSA signatures",
      icon: Building2 
    },
    { 
      id: "verifier", 
      label: "Corporate Verifier", 
      shortLabel: "Verifier", 
      description: "Zero-PII candidate presentation verification",
      icon: CheckCircle2 
    },
    { 
      id: "explorer", 
      label: "Ledger", 
      shortLabel: "Ledger", 
      description: "Polygon Amoy on-chain event ledger",
      icon: Database 
    },
    { 
      id: "benchmarks", 
      label: "PQC Research", 
      shortLabel: "PQC Lab", 
      description: "NIST FIPS 204 ML-DSA vs ECDSA benchmarks",
      icon: BarChart3, 
      badge: "FIPS 204" 
    },
  ];

  const handleSelectRole = (role: AppRole) => {
    setActiveRole(role);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#efcfe3] bg-[#ffffff]/95 backdrop-blur-xl shadow-xs">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Brand Logo & Title */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer group flex-shrink-0" 
            onClick={() => handleSelectRole("landing")}
          >
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#e27396] via-[#ea9ab2] to-[#b3dee2] shadow-sm shadow-[#e27396]/30 group-hover:shadow-md transition">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white font-black" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#eaf2d7] rounded-full border border-[#e27396]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-[#22121b] font-sans">
                  Q-TRUST
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#b3dee2]/40 text-[#22121b] border border-[#b3dee2]">
                  VC 2.0
                </span>
              </div>
              <p className="text-[10px] text-[#5a3045] font-mono tracking-tight hidden xl:block leading-none mt-0.5">
                Quantum-Resilient Credential Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (visible on lg: and up) */}
          <nav className="hidden lg:flex items-center space-x-1 bg-[#f4f8eb] p-1 rounded-xl border border-[#efcfe3]">
            {navItems.map((item) => {
              const active = activeRole === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectRole(item.id)}
                  className={`flex items-center space-x-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all duration-150 whitespace-nowrap ${
                    active
                      ? "bg-[#e27396] text-white shadow-sm"
                      : "text-[#5a3045] hover:text-[#22121b] hover:bg-[#efcfe3]/40"
                  }`}
                  title={item.label}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden xl:inline">{item.label}</span>
                  <span className="xl:hidden">{item.shortLabel}</span>
                  {item.badge && (
                    <span className={`ml-0.5 px-1 py-0.2 text-[8px] font-bold rounded ${
                      active ? "bg-white/20 text-white" : "bg-[#b3dee2] text-[#22121b] border border-[#efcfe3]"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Area: Wallet Pill & Mobile Menu Toggle */}
          <div className="flex items-center space-x-2">
            {/* Wallet Address Chip */}
            <div 
              className="flex items-center space-x-1.5 px-2.5 py-1 sm:py-1.5 rounded-xl bg-[#ffffff] border border-[#efcfe3] text-xs font-mono text-[#22121b] shadow-xs"
              title={`Connected: ${walletAddress}`}
            >
              <span className="w-2 h-2 rounded-full bg-[#e27396] animate-pulse" />
              <span className="text-[#5a3045] hidden sm:inline font-bold text-[11px]">WALLET:</span>
              <span className="text-[#e27396] font-bold text-[11px] tracking-tight">
                {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
              </span>
            </div>

            {/* Mobile Hamburger / Close Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#22121b] bg-[#f4f8eb] hover:bg-[#efcfe3]/50 border border-[#efcfe3] transition flex items-center justify-center focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[#e27396]" />
              ) : (
                <Menu className="w-5 h-5 text-[#22121b]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Mobile Navigation Dropdown Drawer (< lg:) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#efcfe3] bg-[#ffffff] shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1.5">
            <div className="px-2 pb-1 text-[10px] font-mono font-bold text-[#5a3045] uppercase tracking-wider">
              Platform Portals &amp; Tools
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {navItems.map((item) => {
                const active = activeRole === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectRole(item.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-left transition font-mono ${
                      active
                        ? "bg-[#e27396] text-white shadow-sm"
                        : "bg-[#f4f8eb] hover:bg-[#efcfe3]/50 text-[#22121b] border border-[#efcfe3]"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg ${
                        active ? "bg-white/20 text-white" : "bg-[#efcfe3] text-[#e27396]"
                      }`}>
                        <Icon className="w-4 h-4 flex-shrink-0" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-black truncate">{item.label}</span>
                          {item.badge && (
                            <span className={`px-1 py-0.2 text-[8px] font-bold rounded ${
                              active ? "bg-white/20 text-white" : "bg-[#b3dee2] text-[#22121b]"
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] truncate ${
                          active ? "text-white/80" : "text-[#5a3045]"
                        }`}>
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 ml-1 flex-shrink-0 ${
                      active ? "text-white" : "text-[#5a3045]"
                    }`} />
                  </button>
                );
              })}
            </div>

            {/* Mobile Footer Status Strip */}
            <div className="pt-2 mt-2 border-t border-[#efcfe3] flex items-center justify-between text-[10px] font-mono text-[#5a3045] px-1">
              <span className="flex items-center space-x-1">
                <Globe className="w-3 h-3 text-[#b3dee2]" />
                <span>Polygon Amoy</span>
              </span>
              <span className="flex items-center space-x-1">
                <Cpu className="w-3 h-3 text-[#e27396]" />
                <span>ML-DSA-65</span>
              </span>
              <span className="font-bold text-[#e27396]">W3C VC 2.0</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
