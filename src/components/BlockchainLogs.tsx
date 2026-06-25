import { useState } from "react";
import { Link, Check, Cpu, RefreshCw, Terminal, ExternalLink } from "lucide-react";
import { BlockLog } from "../types";
import BlockchainAnimation from "./three/BlockchainAnimation";

interface BlockchainLogsProps {
  logs: BlockLog[];
  onRefresh?: () => void;
  loading?: boolean;
}

export default function BlockchainLogs({ logs, onRefresh, loading }: BlockchainLogsProps) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const formatHash = (hash: string) => {
    if (hash.length <= 12) return hash;
    return `${hash.slice(0, 6)}...${hash.slice(-6)}`;
  };

  return (
    <section className="relative max-w-7xl mx-auto px-6 py-24 border-t border-white/5 bg-[#050505]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[300px] bg-orange-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-4 mb-16 items-start lg:items-center">
        <span className="text-6xl sm:text-8xl text-white/5 font-display font-light leading-none tracking-tighter">06.</span>
        <div className="space-y-3 flex-1">
          <h2 className="text-3xl sm:text-5xl text-white font-display font-medium tracking-tight">
            Blockchain Audit Trail
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl leading-relaxed font-sans">
            Every submission, verification threshold, and municipal resolution is permanently sealed on our public ledger. Citizens can audit the transaction stream to guarantee full transparency.
          </p>
        </div>
        
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 text-xs text-neutral-400 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer disabled:opacity-50 font-sans font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-orange-500" : ""}`} />
            Sync Ledger Chain
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Left Side: Ledger Terminal */}
        <div className="lg:col-span-7 bg-[#0A0A0A] border border-white/10 rounded-3xl p-5 sm:p-6 font-mono relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-neutral-300 font-sans flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-orange-500" />
                Live Polygon Audit Stream
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 font-sans bg-white/5 px-2 py-0.5 rounded border border-white/5 font-medium">
              Gas Fee: 0.0001 MATIC
            </span>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-xs">
                Awaiting first transaction sequence...
              </div>
            ) : (
              logs.map((log, index) => {
                let badgeColor = "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
                if (log.action === "CREATED") badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                if (log.action === "VALIDATED") badgeColor = "bg-purple-500/10 text-purple-400 border-purple-500/20";
                if (log.action === "ESCALATED") badgeColor = "bg-red-500/10 text-red-400 border-red-500/20";
                if (log.action === "RESOLVED") badgeColor = "bg-green-500/10 text-green-400 border-green-500/20";
                if (log.action === "CONTRACTOR_ASSIGNED" || log.action === "WORK_STARTED") badgeColor = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

                return (
                  <div
                    key={index}
                    className="border border-white/5 rounded-2xl p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 relative group/log"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-orange-400">
                          BLOCK #{log.blockNumber.toLocaleString()}
                        </span>
                        <span className={`text-[9px] font-semibold border px-2 py-0.5 rounded-full font-sans uppercase ${badgeColor}`}>
                          {log.action}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-sans">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-200 font-sans mb-3 leading-relaxed">
                      {log.details}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-neutral-500 font-sans">TX Hash:</span>
                        <button
                          onClick={() => copyToClipboard(log.transactionHash)}
                          className="text-[10px] text-neutral-400 hover:text-white hover:underline transition-colors focus:outline-none flex items-center gap-1 cursor-pointer font-sans"
                        >
                          {copiedHash === log.transactionHash ? (
                            <span className="text-green-400 flex items-center gap-0.5 font-semibold">
                              <Check className="w-3 h-3" /> Copied
                            </span>
                          ) : (
                            formatHash(log.transactionHash)
                          )}
                        </button>
                      </div>
                      
                      <a
                        href={`https://polygonscan.com/tx/${log.transactionHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[9px] text-neutral-500 hover:text-orange-400 transition-colors flex items-center gap-1 font-sans font-medium"
                      >
                        Scanner <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Blockchain explanation info */}
        <div className="lg:col-span-5 space-y-6">
          <BlockchainAnimation />
          
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8">
            <h3 className="text-white text-lg font-sans font-medium mb-6 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-orange-500" />
              Smart-Contract Ledger Rules
            </h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm">🛡️</span>
                </div>
                <div>
                  <h4 className="text-sm text-neutral-200 font-semibold font-sans mb-1">Uncensored Public Complaints</h4>
                  <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                    Once sealed, a civic issue cannot be deleted, modified, or hidden by municipal supervisors, developers, or contractors. Public transparency is guaranteed.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm">💬</span>
                </div>
                <div>
                  <h4 className="text-sm text-neutral-200 font-semibold font-sans mb-1">Double-Verified Closure</h4>
                  <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                    An issue is marked resolved on-chain ONLY after the original reporting citizen or three verified neighbors sign off on the fix. Falsified paper closures are impossible.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm">⚖️</span>
                </div>
                <div>
                  <h4 className="text-sm text-neutral-200 font-semibold font-sans mb-1">Automated Escrow Triggers</h4>
                  <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                    Budget allocations and contractor payouts are released dynamically via Smart Contracts upon successful on-chain citizen verification, eliminating contractor bribes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
