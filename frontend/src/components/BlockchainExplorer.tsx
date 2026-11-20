"use client";

import React, { useState } from "react";
import { BlockchainTransaction } from "@/types";
import { CONTRACT_ADDRESSES } from "@/lib/mockData";
import { Database, CheckCircle2 } from "lucide-react";

interface BlockchainExplorerProps {
  transactions: BlockchainTransaction[];
}

export const BlockchainExplorer: React.FC<BlockchainExplorerProps> = ({ transactions }) => {
  const [filterContract, setFilterContract] = useState<string>("ALL");
  const [, setSelectedTx] = useState<BlockchainTransaction | null>(null);

  const filtered = transactions.filter((t) => 
    filterContract === "ALL" ? true : t.contract === filterContract
  );

  return (
    <div className="space-y-8 font-sans text-[#22121b]">
      {/* Top Banner */}
      <div className="rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-[#ffffff] border-2 border-[#e27396] shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#f4f8eb] text-[#5a3045] border border-[#efcfe3] text-xs font-mono mb-2">
              <Database className="w-3.5 h-3.5 text-[#e27396]" />
              <span className="font-bold">POLYGON AMOY TESTNET · EVM TRUST ANCHOR</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#22121b] tracking-tight">
              On-Chain Ledger Explorer
            </h1>
            <p className="text-[#5a3045] text-xs sm:text-sm mt-1 max-w-2xl font-normal leading-relaxed">
              Auditable public ledger anchoring issuer authorizations, credential commitments, and Sparse Merkle Tree revocation roots. Personal student data is completely absent from block data.
            </p>
          </div>
        </div>
      </div>

      {/* Contract Registry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-2xl bg-[#ffffff] border-2 border-[#ea9ab2] space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-black text-[#22121b]">IssuerRegistry.sol</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-black bg-[#efcfe3] text-[#22121b]">v1.2</span>
          </div>
          <p className="text-[11px] text-[#e27396] font-bold truncate">{CONTRACT_ADDRESSES.IssuerRegistry}</p>
          <span className="text-[10px] text-[#5a3045] block font-sans font-medium">Authorizes university public key fingerprints</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#ffffff] border-2 border-[#ea9ab2] space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-black text-[#22121b]">CredentialRegistry.sol</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-black bg-[#efcfe3] text-[#22121b]">v2.0</span>
          </div>
          <p className="text-[11px] text-[#e27396] font-bold truncate">{CONTRACT_ADDRESSES.CredentialRegistry}</p>
          <span className="text-[10px] text-[#5a3045] block font-sans font-medium">Anchors Poseidon credential commitments</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#ffffff] border-2 border-[#ea9ab2] space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-black text-[#22121b]">RevocationRegistry.sol</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-black bg-[#efcfe3] text-[#22121b]">SMT-Root</span>
          </div>
          <p className="text-[11px] text-[#e27396] font-bold truncate">{CONTRACT_ADDRESSES.RevocationRegistry}</p>
          <span className="text-[10px] text-[#5a3045] block font-sans font-medium">Sparse Merkle Tree non-revocation roots</span>
        </div>
      </div>

      {/* Transactions Table & Details */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#ffffff] border-2 border-[#ea9ab2] space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#efcfe3]">
          <div>
            <h2 className="text-lg font-black text-[#22121b]">Confirmed Event Ledger</h2>
            <p className="text-xs text-[#5a3045] font-mono font-bold">Real-time indexed blockchain events</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-mono">
            {["ALL", "IssuerRegistry", "CredentialRegistry", "RevocationRegistry"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterContract(f)}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  filterContract === f
                    ? "bg-[#e27396] text-white shadow-sm"
                    : "bg-[#efcfe3]/40 text-[#22121b] hover:bg-[#efcfe3]"
                }`}
              >
                {f.replace("Registry", "")}
              </button>
            ))}
          </div>
        </div>

        {/* List of Transactions */}
        <div className="space-y-3 font-mono">
          {filtered.map((tx) => (
            <div
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className="p-4 rounded-2xl bg-[#f4f8eb] border border-[#efcfe3] hover:border-[#ea9ab2] cursor-pointer transition space-y-2 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className="p-1 rounded bg-[#ffffff] text-[#e27396] shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[#22121b] font-black truncate max-w-[200px]">{tx.txHash}</span>
                  <span className="text-[#5a3045] font-bold">Block #{tx.blockNumber}</span>
                </div>
                <div className="flex items-center space-x-3 text-[11px] text-[#5a3045] font-bold">
                  <span className="px-2 py-0.5 rounded bg-[#ffffff] border border-[#ea9ab2] text-[#e27396]">
                    {tx.event}
                  </span>
                  <span>{tx.timestamp}</span>
                </div>
              </div>

              {/* Event payload preview */}
              <div className="text-[11px] text-[#22121b] bg-[#ffffff] p-3 rounded-xl border border-[#efcfe3] flex flex-wrap gap-x-4 gap-y-1 font-bold">
                {Object.entries(tx.data).map(([k, v]) => (
                  <span key={k}>
                    <span className="text-[#5a3045]">{k}:</span>{" "}
                    <span className="text-[#22121b]">{String(v)}</span>
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
