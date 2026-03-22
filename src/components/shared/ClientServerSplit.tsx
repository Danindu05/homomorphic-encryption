import React from 'react';
import { Shield, Cloud, Eye, EyeOff, Brain, Lightbulb } from 'lucide-react';

interface ClientServerSplitProps {
  clientContent: React.ReactNode;
  serverContent: React.ReactNode;
  attackerContent?: React.ReactNode;
  narration?: string | React.ReactNode;
}

export function ClientServerSplit({ clientContent, serverContent, attackerContent, narration }: ClientServerSplitProps) {
  return (
    <div className="w-full flex flex-col gap-5">
      {/* NARRATION PANEL */}
      {narration && (
        <div className="w-full bg-white/[0.03] border border-primary/20 p-5 rounded-2xl flex items-start gap-4 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/15 shrink-0">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[10px] font-mono font-semibold text-primary mb-1.5 uppercase tracking-[0.15em]">
              What is happening right now
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {narration}
            </p>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-primary/70">
              <Lightbulb className="w-3.5 h-3.5 text-primary/60 shrink-0" />
              <span>Computation is performed without revealing the underlying data.</span>
            </div>
          </div>
        </div>
      )}

      {/* THREE COLUMN SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px_1fr] gap-4 w-full items-stretch">
        {/* Client Zone */}
        <div className="flex flex-col rounded-2xl border border-blue-500/20 bg-blue-500/[0.03] overflow-hidden h-full">
          <div className="bg-blue-500/[0.06] border-b border-blue-500/10 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-blue-400" />
              <div className="flex flex-col">
                <span className="font-mono text-[11px] font-semibold text-blue-400 tracking-wider uppercase">Trusted Client</span>
                <span className="font-mono text-[8px] text-blue-400/50 uppercase tracking-wider">Plaintext Boundary</span>
              </div>
            </div>
            <span className="text-[9px] text-blue-400/50 font-mono hidden sm:block">Holds sk</span>
          </div>
          <div className="p-4 sm:p-5 flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            {clientContent}
          </div>
        </div>

        {/* Network / Middle */}
        <div className="flex flex-col items-center justify-center p-2 min-w-[100px] gap-6 relative shrink-0">
          <div className="absolute inset-0 border-x border-dashed border-red-500/10 pointer-events-none -mx-2 h-full"></div>
          {attackerContent && (
            <div className="flex flex-col items-center p-3 border border-red-500/20 bg-red-500/[0.04] rounded-xl backdrop-blur-sm w-full relative z-10">
              <Eye className="w-5 h-5 text-red-500/70 mb-2" />
              <span className="text-[9px] text-red-400/80 font-mono font-semibold uppercase tracking-wider text-center">Network Attacker</span>
              <span className="font-mono text-[7px] text-red-400/40 uppercase mt-0.5">Ciphertext Interception</span>
              <div className="mt-2 text-[9px] text-red-300/60 text-center leading-tight w-full break-all">
                {attackerContent}
              </div>
            </div>
          )}
        </div>

        {/* Server Zone */}
        <div className="flex flex-col rounded-2xl border border-orange-500/20 bg-orange-500/[0.03] overflow-hidden h-full">
          <div className="bg-orange-500/[0.06] border-b border-orange-500/10 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <Cloud className="w-4 h-4 text-orange-400" />
              <div className="flex flex-col">
                <span className="font-mono text-[11px] font-semibold text-orange-400 tracking-wider uppercase">Untrusted Server</span>
                <span className="font-mono text-[8px] text-orange-400/50 uppercase tracking-wider">Honest-but-Curious</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <EyeOff className="w-3 h-3 text-orange-400/40 hidden sm:block" />
              <span className="text-[9px] text-orange-400/50 font-mono hidden sm:block">Ciphertext Only</span>
            </div>
          </div>
          <div className="p-4 sm:p-5 flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            {serverContent}
          </div>
        </div>
      </div>
    </div>
  );
}
