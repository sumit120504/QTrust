"use client";

import React, { useState } from "react";
import { BlockchainTransaction } from "@/types";
import { CONTRACT_ADDRESSES } from "@/lib/mockData";
import { Database, Search, ArrowUpRight, CheckCircle2, Shield, Layers, FileCode, Clock } from "lucide-react";

interface BlockchainExplorerProps {
  transactions: BlockchainTransaction[];
}

export const BlockchainExplorer: React.FC<BlockchainExplorerProps> = ({ transactions }) => {
  const [filterContract, setFilterContract] = useState<string>("ALL");
  const [selectedTx, setSelectedTx] = useState<BlockchainTransaction | null>(null);

  const filtered = transactions.filter((t) => 
    filterContract === "ALL" ? true : t.contract === filterContract
  );

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono mb-2">
              <Database className="w-3.5 h-3.5" />
              <span>Polygon Amoy Testnet · EVM Compatible</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Q-Trust On-Chain Ledger Explorer
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Auditable public ledger anchoring issuer authorizations, credential commitments, and Sparse Merkle Tree revocation roots. Personal student data is completely absent from block data.
            </p>
          </div>
        </div>
      </div>

      {/* Contract Registry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">IssuerRegistry.sol</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">v1.2</span>
          </div>
          <p className="text-[11px] font-mono text-cyan-400 truncate">{CONTRACT_ADDRESSES.IssuerRegistry}</p>
          <span className="text-[10px] text-slate-500 block">Authorizes university public key fingerprints</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">CredentialRegistry.sol</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono">v2.0</span>
          </div>
          <p className="text-[11px] font-mono text-cyan-400 truncate">{CONTRACT_ADDRESSES.CredentialRegistry}</p>
          <span className="text-[10px] text-slate-500 block">Anchors Poseidon credential commitments</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">RevocationRegistry.sol</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono">SMT-Root</span>
          </div>
          <p className="text-[11px] font-mono text-cyan-400 truncate">{CONTRACT_ADDRESSES.RevocationRegistry}</p>
          <span className="text-[10px] text-slate-500 block">Sparse Merkle Tree non-revocation roots</span>
        </div>
      </div>

      {/* Transactions Table & Details */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">Confirmed Event Ledger</h2>
            <p className="text-xs text-slate-400">Events indexed by NestJS blockchain event listener</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-mono">
            {["ALL", "IssuerRegistry", "CredentialRegistry", "RevocationRegistry"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterContract(f)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterContract === f
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                {f.replace("Registry", "")}
              </button>
            ))}
          </div>
        </div>

        {/* List of Transactions */}
        <div className="space-y-3">
          {filtered.map((tx) => (
            <div
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2.5 font-mono">
                  <span className="p-1 rounded bg-slate-800 text-cyan-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-cyan-300 font-bold truncate max-w-[200px]">{tx.txHash}</span>
                  <span className="text-slate-500">Block #{tx.blockNumber}</span>
                </div>
                <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-300">
                    {tx.event}
                  </span>
                  <span>{tx.timestamp}</span>
                </div>
              </div>

              {/* Event payload preview */}
              <div className="text-[11px] font-mono text-slate-400 bg-slate-900/60 p-2.5 rounded-lg flex flex-wrap gap-x-4 gap-y-1">
                {Object.entries(tx.data).map(([k, v]) => (
                  <span key={k}>
                    <span className="text-slate-500">{k}:</span>{" "}
                    <span className="text-slate-300">{String(v)}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
