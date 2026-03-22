import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, FileSignature, Stethoscope, Lock, Unlock, Calculator, Key, RefreshCw, Send, Shield, Server, ArrowRight, Activity } from 'lucide-react';
import { PaillierAsync } from '../lib/crypto/paillier-client';
import { PaillierKeyPair } from '../lib/crypto/paillier';
import { ClientServerSplit } from '../components/shared/ClientServerSplit';
import { DataFlowArrow } from '../components/shared/DataFlowArrow';

export default function UseCases() {
  const [activeTab, setActiveTab] = useState<'PAYROLL' | 'VOTING' | 'MEDICAL'>('PAYROLL');
  
  const paillierRef = useRef<PaillierAsync | null>(null);
  const [keys, setKeys] = useState<PaillierKeyPair | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const [step, setStep] = useState<number>(0);

  const [salaries, setSalaries] = useState<string[]>(['65000', '82000', '54000', '91000']);
  const [encryptedSalaries, setEncryptedSalaries] = useState<string[]>([]);
  const [encryptedTotal, setEncryptedTotal] = useState<string | null>(null);
  const [decryptedTotal, setDecryptedTotal] = useState<string | null>(null);

  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  useEffect(() => {
    paillierRef.current = new PaillierAsync();
    paillierRef.current.generateKeys(128).then(k => {
      setKeys(k);
      setIsInitializing(false);
    });
    return () => {
      paillierRef.current?.destroy();
    };
  }, []);

  const handleEncryptAll = async () => {
    if (!paillierRef.current || !keys) return;
    setStep(1);
    const ciphers: string[] = [];
    for (const s of salaries) {
      const c = await paillierRef.current.encrypt(BigInt(s), keys.publicKey);
      ciphers.push(c.toString());
      setEncryptedSalaries([...ciphers]);
    }
  };

  const transmitToServer = () => {
    setStep(2);
    setTimeout(() => { setStep(3); }, 2000);
  };

  const handleCompute = async () => {
    if (!paillierRef.current || !keys) return;
    let runningTotal = BigInt(encryptedSalaries[0]);
    for (let i = 1; i < encryptedSalaries.length; i++) {
        runningTotal = await paillierRef.current.add(runningTotal, BigInt(encryptedSalaries[i]), keys.publicKey);
    }
    setEncryptedTotal(runningTotal.toString());
    setStep(4);
  };

  const transmitToClient = () => {
    setStep(5);
    setTimeout(() => setStep(6), 2000);
  };

  const handleDecrypt = async () => {
    if (!paillierRef.current || !keys || !encryptedTotal) return;
    const dec = await paillierRef.current.decrypt(BigInt(encryptedTotal), keys.publicKey, keys.privateKey);
    setDecryptedTotal(dec.toString());
  };

  useEffect(() => {
    if (step === 6) { handleDecrypt(); }
  }, [step]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    let timer: NodeJS.Timeout;
    if (step === 0) { timer = setTimeout(() => handleEncryptAll(), 1500); }
    else if (step === 1) { timer = setTimeout(() => transmitToServer(), 2000); }
    else if (step === 3) { timer = setTimeout(() => handleCompute(), 2000); }
    else if (step === 4) { timer = setTimeout(() => transmitToClient(), 2000); }
    else if (step === 6) { setIsAutoPlaying(false); }
    return () => clearTimeout(timer);
  }, [step, isAutoPlaying, keys]);

  const handleStartAutoPlay = () => {
    resetStory();
    setTimeout(() => setIsAutoPlaying(true), 500);
  };

  const resetStory = () => {
    setStep(0); setEncryptedSalaries([]); setEncryptedTotal(null); setDecryptedTotal(null); setIsAutoPlaying(false);
  };

  const narration = {
    0: "Input plaintext salary values. The client device will generate a distinct ciphertext for each value.",
    1: "Salaries successfully encrypted via Paillier. Each ciphertext is indistinguishable from random noise.",
    2: "Transmitting ciphertexts over the untrusted network. Interceptors see nothing of value.",
    3: "Server received the payload. The server does not possess the private key and therefore cannot decrypt the data. Zero-Knowledge state established.",
    4: "Homomorphic property applied: Enc(S₁) × Enc(S₂) × ... mod n². The server computed the encrypted total without decryption.",
    5: "Returning E(Total) ciphertext along the untrusted network back to the secure client perimeter.",
    6: "Client uses private key to decrypt E(Total). Complete mathematical privacy of all individual inputs guaranteed."
  }[step];

  const stepLabels = ['Input', 'Encrypt', 'Transit', 'Server', 'Compute', 'Return', 'Decrypt'];

  const clientContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2.5">
        {salaries.map((s, i) => (
           <div key={i} className={`flex flex-col gap-1.5 p-3 border rounded-xl transition-all ${step >= 1 ? 'border-emerald-500/15 bg-emerald-500/[0.03]' : 'border-white/5 bg-black/20'}`}>
             <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-mono">Employee #{i+1}</span>
                <input 
                  type="text" value={s} disabled={step > 0}
                  onChange={(e) => { const newS = [...salaries]; newS[i] = e.target.value; setSalaries(newS); }}
                  className="bg-black/30 border border-white/10 rounded-lg px-2 py-1 font-mono text-xs w-24 text-right disabled:opacity-40 focus:border-primary/30 focus:outline-none transition-colors"
                />
             </div>
             {step >= 1 && encryptedSalaries[i] && (
               <div className="text-[8px] font-mono text-emerald-400/70 break-all bg-emerald-500/[0.04] p-1.5 rounded-lg">
                 E(S): {encryptedSalaries[i].substring(0, 40)}...
               </div>
             )}
           </div>
        ))}
      </div>

      {step === 0 && (
        <button onClick={handleEncryptAll} disabled={isAutoPlaying} className="w-full flex items-center gap-1.5 justify-center px-3 py-2 text-[11px] font-mono font-semibold rounded-xl bg-amber-500/10 border border-amber-500/15 text-amber-400 hover:bg-amber-500/15 transition-all disabled:opacity-50">
          {isAutoPlaying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />} Encrypt Salaries
        </button>
      )}

      {step === 1 && (
        <button onClick={transmitToServer} disabled={isAutoPlaying} className="w-full flex items-center gap-1.5 justify-center px-3 py-2 text-[11px] font-mono font-semibold rounded-xl bg-blue-500/10 border border-blue-500/15 text-blue-400 hover:bg-blue-500/15 transition-all disabled:opacity-50">
          {isAutoPlaying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Transmit to Payroll Cloud
        </button>
      )}

      {step === 6 && decryptedTotal && (
         <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-5 bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl text-center">
           <div className="text-[10px] text-emerald-500/70 font-mono uppercase tracking-wider mb-1.5">Decrypted Company Total</div>
           <div className="text-3xl font-display font-bold text-emerald-400">${parseInt(decryptedTotal).toLocaleString()}</div>
           <p className="text-[9px] text-muted-foreground font-mono mt-3 leading-relaxed max-w-sm mx-auto">
             In a real-world deployment, this same workflow secures payroll, healthcare records, financial audits, and government data across untrusted cloud infrastructure.
           </p>
           <button onClick={resetStory} className="mt-3 text-[9px] font-mono border border-emerald-500/20 text-emerald-400/70 px-3 py-1 rounded-lg hover:bg-emerald-500/10 transition-colors">Restart Scenario</button>
         </motion.div>
      )}
    </div>
  );

  const serverContent = (
    <div className="space-y-4 flex flex-col items-center justify-center h-full min-h-[280px]">
      {step < 3 ? (
        <div className="text-center text-orange-400/25 font-mono text-xs py-8">
          <Server className="w-10 h-10 opacity-40 mx-auto mb-3" />
          Awaiting HR Payload...
        </div>
      ) : (
        <div className="w-full space-y-3">
          <div className="bg-black/20 p-3 rounded-xl border border-orange-500/10">
            <h4 className="text-[9px] font-mono text-orange-400 mb-2 uppercase tracking-wider font-semibold pb-1 border-b border-orange-500/10">Received Ciphertexts</h4>
            <div className="space-y-1">
              {encryptedSalaries.map((c, i) => (
                <div key={i} className="text-[8px] font-mono text-orange-400/40 bg-orange-500/[0.04] p-1.5 rounded-lg truncate">E(S_{i+1})</div>
              ))}
            </div>
            <div className="mt-2 text-[8px] text-orange-400/30 font-mono">Zero-Knowledge State. The server does not possess the private key.</div>
          </div>

          {step === 3 && (
            <button onClick={handleCompute} disabled={isAutoPlaying} className="w-full flex items-center gap-1.5 justify-center px-3 py-2 text-[11px] font-mono font-semibold rounded-xl bg-amber-500/10 border border-amber-500/15 text-amber-400 hover:bg-amber-500/15 transition-all disabled:opacity-50">
              {isAutoPlaying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Calculator className="w-3.5 h-3.5" />} Compute Encrypted Total
            </button>
          )}

          {step >= 4 && encryptedTotal && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-emerald-500/[0.04] p-3 border border-emerald-500/15 rounded-xl">
               <h4 className="text-[9px] font-mono text-emerald-400 mb-1.5 uppercase tracking-wider font-semibold pb-1 border-b border-emerald-500/10">Computed E(Total)</h4>
               <div className="text-[8px] font-mono text-emerald-300/60 break-all max-h-20 overflow-hidden">{encryptedTotal}</div>
               {step === 4 && (
                 <button onClick={transmitToClient} disabled={isAutoPlaying} className="mt-3 w-full flex items-center gap-1.5 justify-center px-3 py-1.5 text-[10px] font-mono font-semibold rounded-lg bg-blue-500/10 border border-blue-500/15 text-blue-400 hover:bg-blue-500/15 transition-all disabled:opacity-50">
                   {isAutoPlaying ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3 transform rotate-180" />} Dispatch to Client
                 </button>
               )}
             </motion.div>
          )}
        </div>
      )}
    </div>
  );

  const attackerView = (
    <AnimatePresence>
      <div className="flex flex-col gap-3 w-full items-center justify-center">
        {step === 2 && <DataFlowArrow direction="left-to-right" label="[ E(S1), E(S2)... ]" isEncrypted={true} />}
        {step === 5 && <DataFlowArrow direction="right-to-left" label="E(Total)" isEncrypted={true} />}
      </div>
    </AnimatePresence>
  );

  const tabs = [
    { id: 'PAYROLL', icon: Briefcase, label: 'Secure Payroll' },
    { id: 'VOTING', icon: FileSignature, label: 'E-Voting' },
    { id: 'MEDICAL', icon: Stethoscope, label: 'Medical Compute' },
  ];

  return (
    <div className="w-full flex flex-col items-center overflow-hidden">
      {/* Header */}
      <section className="w-full max-w-6xl px-4 pt-12 pb-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-3xl font-display font-bold mb-3">Real-World Guided Scenarios</h2>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
            A step-by-step interactive journey revealing how Homomorphic Encryption fundamentally alters cloud processing architectures.
          </p>
        </motion.div>
      </section>

      {/* Tabs */}
      <section className="w-full max-w-6xl px-4">
        <div className="flex justify-center gap-2 mb-8 pb-4 border-b border-white/5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs transition-all border ${
                  isActive 
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03] border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>
      </section>
      
      {activeTab === 'PAYROLL' && (
        <section className="w-full max-w-6xl px-4 pb-20 space-y-5">
          {/* Auto-play button */}
          <div className="flex justify-end">
            <button 
              onClick={isAutoPlaying ? resetStory : handleStartAutoPlay} 
              className={`flex items-center gap-2 px-4 py-2 text-[10px] font-mono font-semibold rounded-xl border transition-all ${
                isAutoPlaying 
                  ? 'border-red-500/20 text-red-400 bg-red-500/10 hover:bg-red-500/15' 
                  : 'border-amber-500/20 text-amber-400 bg-amber-500/10 hover:bg-amber-500/15'
              }`}
            >
              {isAutoPlaying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
              {isAutoPlaying ? 'Stop' : '🚀 Auto-Play Demo'}
            </button>
          </div>
          
          {/* Narrator */}
          <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-500/[0.03] p-5 rounded-2xl border border-amber-500/15 flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
              <span className="text-amber-400 font-mono font-bold text-sm">{step}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-amber-400 font-mono text-[10px] mb-0.5 uppercase tracking-wider font-semibold">System State</h4>
              <p className="text-xs text-amber-200/70 leading-relaxed">{narration}</p>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <div className="flex items-center gap-1 w-full max-w-xl mx-auto py-2">
             {stepLabels.map((label, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-mono font-bold transition-all ${step >= i ? 'bg-amber-500 text-black' : 'bg-black/30 border border-amber-500/15 text-amber-500/30'}`}>
                      {i}
                    </div>
                    <span className={`text-[7px] font-mono ${step >= i ? 'text-amber-400/60' : 'text-white/15'}`}>{label}</span>
                  </div>
                  {i < 6 && <div className={`flex-1 h-[1.5px] ${step > i ? 'bg-amber-500/60' : 'bg-amber-500/10'}`}></div>}
                </React.Fragment>
             ))}
          </div>

          {/* Client-Server Viz */}
          {isInitializing ? (
             <div className="h-48 flex flex-col items-center justify-center text-amber-500/30 font-mono text-xs gap-3">
               <RefreshCw className="w-6 h-6 animate-spin" />
               Bootstrapping Cryptosystem Engine...
             </div>
          ) : (
             <ClientServerSplit clientContent={clientContent} serverContent={serverContent} attackerContent={attackerView} />
          )}
        </section>
      )}

      {activeTab !== 'PAYROLL' && (
         <section className="w-full max-w-6xl px-4 pb-20">
           <div className="bg-white/[0.02] p-12 rounded-2xl border border-white/5 text-center font-mono text-muted-foreground flex flex-col items-center justify-center h-48">
              <ArrowRight className="w-6 h-6 mb-3 opacity-30" />
              <p className="text-sm">Use the <strong className="text-amber-400">Secure Payroll</strong> scenario for the guided experience.</p>
           </div>
         </section>
      )}
    </div>
  );
}
