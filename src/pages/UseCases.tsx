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

  // Story state steps:
  // 0 = Input, 1 = Encrypted, 2 = In Transit To Server, 3 = At Server, 4 = Computed, 5 = In Transit To Client, 6 = Decrypted
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
    setTimeout(() => {
      setStep(3);
    }, 2000);
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
    if (step === 6) {
      handleDecrypt();
    }
  }, [step]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    let timer: NodeJS.Timeout;
    
    if (step === 0) {
      timer = setTimeout(() => handleEncryptAll(), 1500);
    } else if (step === 1) {
      timer = setTimeout(() => transmitToServer(), 2000);
    } else if (step === 3) {
      timer = setTimeout(() => handleCompute(), 2000);
    } else if (step === 4) {
      timer = setTimeout(() => transmitToClient(), 2000);
    } else if (step === 6) {
      setIsAutoPlaying(false);
    }
    
    return () => clearTimeout(timer);
  }, [step, isAutoPlaying, keys]);

  const handleStartAutoPlay = () => {
    resetStory();
    setTimeout(() => setIsAutoPlaying(true), 500);
  };

  const resetStory = () => {
    setStep(0);
    setEncryptedSalaries([]);
    setEncryptedTotal(null);
    setDecryptedTotal(null);
    setIsAutoPlaying(false);
  };

  const narration = {
    0: "Input plaintext salary values. The client device will generate a distinct ciphertext for each value.",
    1: "Salaries successfully encrypted via Paillier. Notice how each 'E(Salary)' is indistinguishable from random noise.",
    2: "Transmitting ciphertexts over the untrusted network. Network attackers intercepting packets see nothing of value.",
    3: "Server received the payload. It holds NO private key, establishing a Zero-Knowledge state where data remains perfectly secure at rest.",
    4: "Homomorphic property applied: Enc(S_1) × Enc(S_2) × ... mod n². The server computed the encrypted total without decryption.",
    5: "Returning the E(Total) ciphertext payload along the untrusted network back to the secure client perimeter.",
    6: "Client evaluates the private key to decrypt E(Total). Complete mathematical privacy of all individual inputs is guaranteed."
  }[step];

  const clientContent = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3">
        {salaries.map((s, i) => (
           <div key={i} className={`flex flex-col gap-2 p-3 border rounded-lg transition-all ${step >= 1 ? 'border-green-500/30 bg-green-950/20' : 'border-amber-500/20 bg-black/40'}`}>
             <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">Employee #{i+1}</span>
                <input 
                  type="text" 
                  value={s} 
                  disabled={step > 0}
                  onChange={(e) => {
                    const newS = [...salaries];
                    newS[i] = e.target.value;
                    setSalaries(newS);
                  }}
                  className="bg-black/50 border border-amber-500/30 rounded px-2 py-1 font-mono text-sm w-24 text-right disabled:opacity-50"
                />
             </div>
             {step >= 1 && encryptedSalaries[i] && (
               <div className="text-[9px] font-mono text-green-400 break-all bg-green-500/10 p-1.5 rounded">
                 E(S): {encryptedSalaries[i].substring(0, 40)}...
               </div>
             )}
           </div>
        ))}
      </div>

      {step === 0 && (
        <button onClick={handleEncryptAll} disabled={isAutoPlaying} className="w-full btn-cyber btn-cyber-sm border-amber-500/50 text-amber-500 flex justify-center items-center gap-2">
          {isAutoPlaying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />} Encrypt Salaries
        </button>
      )}

      {step === 1 && (
        <button onClick={transmitToServer} disabled={isAutoPlaying} className="w-full btn-cyber btn-cyber-sm bg-blue-500/20 border-blue-500/50 text-blue-400 flex justify-center items-center gap-2">
          {isAutoPlaying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Transmit to Payroll Cloud
        </button>
      )}

      {step === 6 && decryptedTotal && (
         <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-center shadow-[0_0_20px_rgba(34,197,94,0.2)]">
           <div className="text-xs text-green-500 font-mono uppercase tracking-widest mb-1">Decrypted Company Total</div>
           <div className="text-3xl font-display font-bold text-green-400">${parseInt(decryptedTotal).toLocaleString()}</div>
           <button onClick={resetStory} className="mt-4 text-[10px] font-mono border border-green-500/40 text-green-400 px-3 py-1 rounded hover:bg-green-500/20">Restart Scenario</button>
         </motion.div>
      )}
    </div>
  );

  const serverContent = (
    <div className="space-y-6 flex flex-col items-center justify-center h-full min-h-[300px]">
      {step < 3 ? (
        <div className="text-center text-amber-500/40 font-mono text-sm">
          <Server className="w-12 h-12 opacity-50 mx-auto mb-4" />
          Awaiting HR Payload...
        </div>
      ) : (
        <div className="w-full space-y-4">
          <div className="bg-black/40 p-3 rounded-lg border border-amber-500/30">
            <h4 className="text-[10px] font-mono text-amber-500 mb-2 uppercase tracking-widest border-b border-amber-500/20 pb-1">Received Ciphertexts</h4>
            <div className="space-y-1">
              {encryptedSalaries.map((c, i) => (
                <div key={i} className="text-[8px] font-mono text-amber-500/70 truncate bg-amber-500/5 p-1 rounded">E(S_{i+1})</div>
              ))}
            </div>
            <div className="mt-2 text-[9px] text-amber-500/50 font-mono leading-tight">Zero-Knowledge State: Server relies entirely on mathematical homomorphisms.</div>
          </div>

          {step === 3 && (
            <button onClick={handleCompute} disabled={isAutoPlaying} className="w-full btn-cyber btn-cyber-sm bg-amber-500/20 border-amber-500/50 text-amber-400 flex justify-center items-center gap-2">
              {isAutoPlaying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />} Compute Encrypted Total
            </button>
          )}

          {step >= 4 && encryptedTotal && (
             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-green-500/10 p-3 border border-green-500/40 rounded-lg">
               <h4 className="text-[10px] font-mono text-green-400 mb-2 uppercase tracking-widest border-b border-green-500/20 pb-1">Computed E(Total)</h4>
               <div className="text-[9px] font-mono text-green-300 break-all max-h-24 overflow-hidden">
                 {encryptedTotal}
               </div>
               
               {step === 4 && (
                 <button onClick={transmitToClient} disabled={isAutoPlaying} className="mt-4 w-full bg-blue-500/20 border-blue-500/50 text-blue-400 px-2 py-1.5 rounded font-mono text-[10px] flex justify-center items-center gap-2 hover:bg-blue-500/30">
                   {isAutoPlaying ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3 transform rotate-180" />} Dispatch Result to Client
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
      <div className="flex flex-col gap-4 w-full items-center justify-center">
        {step === 2 && <DataFlowArrow direction="left-to-right" label="[ E(S1), E(S2)... ]" isEncrypted={true} />}
        {step === 5 && <DataFlowArrow direction="right-to-left" label="E(Total)" isEncrypted={true} />}
      </div>
    </AnimatePresence>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-6xl w-full p-4 space-y-8 pb-20">
      
      <div className="text-center mb-6">
        <h2 className="text-3xl font-display font-semibold text-glow-primary">
          Real-world Guided Scenarios
        </h2>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-sm">
          A step-by-step interactive journey revealing how Homomorphic Encryption fundamentally alters cloud processing architectures. This simulates real-world cloud data processing where sensitive data is encrypted before being sent to external servers.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8 gap-4 border-b border-border pb-4">
        {[
          { id: 'PAYROLL', icon: Briefcase, label: 'Secure Payroll' },
          { id: 'VOTING', icon: FileSignature, label: 'E-Voting' },
          { id: 'MEDICAL', icon: Stethoscope, label: 'Medical Compute' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-mono text-sm transition-all relative overflow-hidden ${isActive ? 'text-amber-400 bg-amber-500/10 border-t border-x border-amber-500/50' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
            >
              {isActive && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,1)]"></div>}
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          )
        })}
      </div>
      
      {activeTab === 'PAYROLL' && (
         <div className="space-y-6">
            <div className="flex justify-end w-full max-w-2xl mx-auto">
              <button 
                onClick={isAutoPlaying ? resetStory : handleStartAutoPlay} 
                className={`btn-cyber btn-cyber-sm flex items-center gap-2 border ${isAutoPlaying ? 'border-red-500/50 text-red-500 hover:bg-red-500/20' : 'border-amber-500/50 text-amber-500 hover:bg-amber-500/20'}`}
              >
                {isAutoPlaying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                {isAutoPlaying ? 'Stop Auto-Play' : '🚀 Demo Presentation Mode (Auto-Play)'}
              </button>
            </div>
            
            {/* Story Narrator Box */}
            <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-5 rounded-xl border border-amber-500/30 bg-amber-500/5 relative overflow-hidden flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shrink-0">
                <span className="text-amber-400 font-mono font-bold text-lg">{step}</span>
              </div>
              <div className="flex-1">
                <h4 className="text-amber-400 font-mono text-sm mb-1 uppercase tracking-widest">System Architecture State</h4>
                <p className="text-sm font-mono text-amber-200/90 leading-relaxed">
                  {narration}
                </p>
              </div>
            </motion.div>

            {/* Stepper Progress Bar */}
            <div className="flex items-center gap-1 w-full max-w-2xl mx-auto py-4">
               {[0,1,2,3,4,5,6].map(i => (
                  <React.Fragment key={i}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${step >= i ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-black/50 border border-amber-500/30 text-amber-500/50'}`}>
                      {i}
                    </div>
                    {i < 6 && <div className={`flex-1 h-[2px] ${step > i ? 'bg-amber-500' : 'bg-amber-500/20'}`}></div>}
                  </React.Fragment>
               ))}
            </div>

            {/* Interactive Client-Server Viz */}
            {isInitializing ? (
               <div className="h-64 flex flex-col items-center justify-center text-amber-500/50 font-mono text-sm gap-4">
                 <RefreshCw className="w-8 h-8 animate-spin" />
                 Bootstrapping Cryptosystem Engine...
               </div>
            ) : (
               <ClientServerSplit clientContent={clientContent} serverContent={serverContent} attackerContent={attackerView} />
            )}
         </div>
      )}

      {/* Placeholders for other tabs to keep UI tight */}
      {activeTab !== 'PAYROLL' && (
         <div className="glass p-12 rounded-xl border border-white/10 text-center font-mono text-muted-foreground h-64 flex flex-col items-center justify-center">
            <ArrowRight className="w-8 h-8 mb-4 opacity-50" />
            <p>Please use the Secure Payroll scenario for the guided Academic Experience.</p>
         </div>
      )}

    </motion.div>
  );
}
