"use client";

import React, { useState } from "react";
import { AppRole, CredentialClaims, CredentialEnvelope, ZKProofPayload, BlockchainTransaction, DIDDocument } from "@/types";
import { 
  INITIAL_STUDENT_CLAIMS, 
  INITIAL_CREDENTIAL, 
  STUDENT_DID_DOCUMENT, 
  INITIAL_TRANSACTIONS, 
  STUDENT_DID 
} from "@/lib/mockData";
import { Navbar } from "@/components/Navbar";
import { LandingPage } from "@/components/LandingPage";
import { HolderPortal } from "@/components/HolderPortal";
import { IssuerPortal } from "@/components/IssuerPortal";
import { VerifierPortal } from "@/components/VerifierPortal";
import { BlockchainExplorer } from "@/components/BlockchainExplorer";
import { PQCBenchmarks } from "@/components/PQCBenchmarks";

export default function Home() {
  const [activeRole, setActiveRole] = useState<AppRole>("landing");
  const [walletAddress] = useState<string>("0x8f72a91c3d0e28b847125e9821a4f49b10c5512b");
  
  const [claims, setClaims] = useState<CredentialClaims>(INITIAL_STUDENT_CLAIMS);
  const [credential, setCredential] = useState<CredentialEnvelope>(INITIAL_CREDENTIAL);
  const [didDoc] = useState<DIDDocument>(STUDENT_DID_DOCUMENT);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>(INITIAL_TRANSACTIONS);
  const [currentProof, setCurrentProof] = useState<ZKProofPayload | null>(null);

  // Transition handler: Student shares proof with Verifier
  const handleSendToVerifier = (proof: ZKProofPayload) => {
    setCurrentProof(proof);
    setActiveRole("verifier");
  };

  // Transition handler: University issues new credential
  const handleCredentialIssued = (newCred: CredentialEnvelope, tx: BlockchainTransaction) => {
    setCredential(newCred);
    setTransactions((prev) => [tx, ...prev]);
  };

  // Transition handler: University revokes/reinstates credential
  const handleRevocationToggled = (isCurrentlyActive: boolean, tx: BlockchainTransaction) => {
    setCredential((prev) => ({
      ...prev,
      status: isCurrentlyActive ? "REVOKED" : "ACTIVE",
    }));
    setTransactions((prev) => [tx, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 cyber-grid">
      <Navbar 
        activeRole={activeRole} 
        setActiveRole={setActiveRole} 
        walletAddress={walletAddress} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeRole === "landing" && (
          <LandingPage onNavigate={setActiveRole} />
        )}

        {activeRole === "holder" && (
          <HolderPortal
            claims={claims}
            credential={credential}
            didDoc={didDoc}
            onSendToVerifier={handleSendToVerifier}
          />
        )}

        {activeRole === "issuer" && (
          <IssuerPortal
            currentCredential={credential}
            onCredentialIssued={handleCredentialIssued}
            onRevocationToggled={handleRevocationToggled}
          />
        )}

        {activeRole === "verifier" && (
          <VerifierPortal
            currentProof={currentProof}
            credentialEnvelope={credential}
            onNavigateToHolder={() => setActiveRole("holder")}
          />
        )}

        {activeRole === "explorer" && (
          <BlockchainExplorer transactions={transactions} />
        )}

        {activeRole === "benchmarks" && (
          <PQCBenchmarks />
        )}
      </main>

      {/* Cyber Technical Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/95 py-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-300 font-semibold tracking-wider">Q-TRUST ARCHITECTURE</span>
            <span className="text-slate-600">|</span>
            <span>NIST FIPS 204 (ML-DSA) · CIRCOM 2.1 (Groth16) · W3C VC 2.0</span>
          </div>
          <div className="text-slate-400">
            Final-Year B.Tech Capstone Project
          </div>
        </div>
      </footer>
    </div>
  );
}
