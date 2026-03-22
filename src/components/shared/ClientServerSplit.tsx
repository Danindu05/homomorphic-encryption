import React from 'react';
import { Shield, Cloud, Eye, EyeOff, Brain } from 'lucide-react';

interface ClientServerSplitProps {
  clientContent: React.ReactNode;
  serverContent: React.ReactNode;
  attackerContent?: React.ReactNode;
  narration?: string | React.ReactNode;
}

export function ClientServerSplit({ clientContent, serverContent, attackerContent, narration }: ClientServerSplitProps) {

  return (
    <div className="w-full flex flex-col gap-6">
      {/* NARRATION PANEL */}
      {narration && (
        <div className="w-full bg-primary/10 border border-primary/40 p-4 rounded-xl flex items-start sm:items-center gap-4 shadow-[0_0_20px_rgba(0,255,128,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] -z-10 rounded-full"></div>
          <div className="p-2 bg-primary/20 rounded-lg shrink-0">
            <Brain className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-primary mb-1 uppercase tracking-widest">🧠 What is happening right now?</h3>
            <p className="text-sm font-sans text-white/90 leading-relaxed">
              {narration}
            </p>
            <div className="mt-3 pt-3 border-t border-primary/20 text-xs font-mono text-primary/80">
              <span className="font-bold text-primary">💡 Key Insight:</span> Computation is performed without revealing the underlying data.
            </div>
          </div>
        </div>
      )}

      {/* THREE COLUMN SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px_1fr] gap-6 w-full items-stretch">
        {/* Client Zone */}
        <div className="flex flex-col rounded-xl border border-blue-500/30 bg-blue-950/10 overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.05)] h-full">
          <div className="bg-blue-500/10 border-b border-blue-500/20 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold text-blue-400 tracking-widest uppercase">Trusted Client</span>
                <span className="font-mono text-[9px] text-blue-400/60 uppercase">Plaintext Boundary</span>
              </div>
            </div>
            <p className="text-[10px] text-blue-400/70 font-mono hidden sm:block text-right max-w-[120px] leading-tight">
              Holds Private Key
            </p>
          </div>
          <div className="p-4 sm:p-6 flex-1 flex flex-col gap-4 overflow-y-auto">
            {clientContent}
          </div>
        </div>

        {/* Network / Middle */}
        <div className="flex flex-col items-center justify-center p-2 min-w-[120px] gap-8 relative shrink-0">
          <div className="absolute inset-0 border-x border-dashed border-red-500/20 pointer-events-none -mx-2 h-full"></div>
          {attackerContent && (
            <div className="flex flex-col items-center p-4 border border-red-500/30 bg-red-950/20 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.1)] w-full relative z-10">
              <Eye className="w-6 h-6 text-red-500 mb-2 animate-pulse" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-red-400 font-mono font-bold uppercase tracking-wider text-center">Network Attacker</span>
                <span className="font-mono text-[8px] text-red-400/60 uppercase">Ciphertext Interception</span>
              </div>
              <div className="mt-3 text-[10px] text-red-300/90 text-center leading-tight tracking-tight w-full break-all">
                {attackerContent}
              </div>
            </div>
          )}
        </div>

        {/* Server Zone */}
        <div className="flex flex-col rounded-xl border border-orange-500/30 bg-orange-950/10 overflow-hidden shadow-[0_0_30px_rgba(249,115,22,0.05)] h-full">
          <div className="bg-orange-500/10 border-b border-orange-500/20 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-orange-400" />
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold text-orange-400 tracking-widest uppercase truncate max-w-[140px]" title="Untrusted Server (Honest-but-Curious)">Untrusted Server</span>
                <span className="font-mono text-[9px] text-orange-400/60 uppercase">Honest-but-Curious</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-orange-400/50 hidden sm:block" />
              <p className="text-[10px] text-orange-400/70 font-mono hidden sm:block text-right max-w-[120px] leading-tight">
                Ciphertext ONLY
              </p>
            </div>
          </div>
          <div className="p-4 sm:p-6 flex-1 flex flex-col gap-4 overflow-y-auto">
            {serverContent}
          </div>
        </div>
      </div>
    </div>
  );
}
