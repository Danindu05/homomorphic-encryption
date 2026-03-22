import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, FileSignature, Stethoscope, Lock, Unlock, Calculator, Key, RefreshCw, CheckCircle } from 'lucide-react';
import { PaillierAsync } from '../lib/crypto/paillier-client';
import { PaillierKeyPair } from '../lib/crypto/paillier';

export default function UseCases() {
  const [activeTab, setActiveTab] = useState<'PAYROLL' | 'VOTING' | 'MEDICAL'>('PAYROLL');
  
  const paillierRef = useRef<PaillierAsync | null>(null);
  const [keys, setKeys] = useState<PaillierKeyPair | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // States for Payroll
  const [salaries, setSalaries] = useState<string[]>(['65000', '82000', '54000', '91000']);
  const [encryptedSalaries, setEncryptedSalaries] = useState<string[]>([]);
  const [encryptedTotal, setEncryptedTotal] = useState<string | null>(null);
  const [decryptedTotal, setDecryptedTotal] = useState<string | null>(null);
  const [payrollStatus, setPayrollStatus] = useState<string>('Ready');

  useEffect(() => {
    paillierRef.current = new PaillierAsync();
    // Auto-generate keys for use cases
    paillierRef.current.generateKeys(128).then(k => {
      setKeys(k);
      setIsInitializing(false);
    });
    return () => {
      paillierRef.current?.destroy();
    };
  }, []);

  const runPayrollDemo = async () => {
    if (!paillierRef.current || !keys) return;
    
    // 1. Encrypt all
    setPayrollStatus('Encrypting individual salaries...');
    setEncryptedSalaries([]);
    setEncryptedTotal(null);
    setDecryptedTotal(null);
    
    const ciphers: string[] = [];
    for (const s of salaries) {
      const c = await paillierRef.current.encrypt(BigInt(s), keys.publicKey);
      ciphers.push(c.toString());
      setEncryptedSalaries([...ciphers]);
    }
    
    // 2. Compute sum homomorphically
    setPayrollStatus('Server computing secure sum of ciphertexts...');
    let runningTotal = BigInt(ciphers[0]);
    for (let i = 1; i < ciphers.length; i++) {
        runningTotal = await paillierRef.current.add(runningTotal, BigInt(ciphers[i]), keys.publicKey);
    }
    
    setEncryptedTotal(runningTotal.toString());
    
    // 3. Decrypt result
    setPayrollStatus('Decrypting the final verified total...');
    const dec = await paillierRef.current.decrypt(runningTotal, keys.publicKey, keys.privateKey);
    setDecryptedTotal(dec.toString());
    setPayrollStatus('Computation Complete & Verified');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl w-full p-4 space-y-8 pb-20"
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl font-display font-semibold text-glow-primary">
          Real-world Applications
        </h2>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
          Explore interactive demos showing how homomorphic encryption protects sensitive data in different industries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => setActiveTab('PAYROLL')}
          className={`glass p-6 rounded-xl cyber-border transition-all duration-500 cursor-pointer ${activeTab === 'PAYROLL' ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'hover:cyber-border-accent'}`}
        >
          <Briefcase className={`w-10 h-10 mb-4 transition-colors ${activeTab === 'PAYROLL' ? 'text-amber-400' : 'text-primary hover:text-amber-400'}`} />
          <h3 className="text-xl font-mono text-foreground mb-2">Secure Payroll</h3>
          <p className="text-sm text-muted-foreground">
            Calculate sum across employees without seeing individual wages.
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('VOTING')}
          className={`glass p-6 rounded-xl cyber-border transition-all duration-500 cursor-pointer ${activeTab === 'VOTING' ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'hover:cyber-border-accent'}`}
        >
          <FileSignature className={`w-10 h-10 mb-4 transition-colors ${activeTab === 'VOTING' ? 'text-blue-400' : 'text-primary hover:text-blue-400'}`} />
          <h3 className="text-xl font-mono text-foreground mb-2">Electronic Voting</h3>
          <p className="text-sm text-muted-foreground">
            Tally thousands of user votes securely, verifying the total.
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('MEDICAL')}
          className={`glass p-6 rounded-xl cyber-border transition-all duration-500 cursor-pointer ${activeTab === 'MEDICAL' ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'hover:cyber-border-accent'}`}
        >
          <Stethoscope className={`w-10 h-10 mb-4 transition-colors ${activeTab === 'MEDICAL' ? 'text-red-400' : 'text-primary hover:text-red-400'}`} />
          <h3 className="text-xl font-mono text-foreground mb-2">Medical Compute</h3>
          <p className="text-sm text-muted-foreground">
            Compute averages and deviations on private health metrics.
          </p>
        </div>
      </div>
      
      <div className="mt-8">
        <AnimatePresence mode="popLayout">
          {activeTab === 'PAYROLL' && (
             <motion.div 
               key="payroll"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
               className="glass p-8 rounded-xl border border-amber-500/30 bg-amber-500/5 relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-display text-amber-500 mb-2 flex items-center gap-2">
                       <Briefcase /> Private Payroll Computation
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-2xl">
                       A third-party accounting server can calculate the total payroll obligation of the company 
                       by homomorphically adding encrypted employee salaries, without ever learning what any individual makes.
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isInitializing ? (
                       <span className="text-xs font-mono text-amber-500 animate-pulse flex items-center gap-2">
                         <RefreshCw className="w-3 h-3 animate-spin"/> Bootstrapping Keys...
                       </span>
                    ) : (
                       <span className="text-xs font-mono text-green-400 flex items-center gap-1">
                         <Key className="w-3 h-3"/> Keys Ready
                       </span>
                    )}
                    <button 
                       onClick={runPayrollDemo} 
                       disabled={isInitializing}
                       className="px-6 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/50 rounded-lg font-mono text-sm hover:bg-amber-500/30 transition shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    >
                       Run Demo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <h4 className="text-sm font-mono text-foreground border-b border-amber-500/20 pb-2 flex items-center gap-2"><Lock className="w-4 h-4 text-amber-500"/> Employee Salaries (Client-Side)</h4>
                      {salaries.map((s, i) => (
                         <div key={i} className="flex items-center gap-4">
                            <span className="text-muted-foreground text-xs font-mono w-24">Employee #{i+1}</span>
                            <div className="flex-1 bg-black/40 border border-amber-500/20 p-2 rounded text-foreground font-mono text-sm">
                               ${parseInt(s).toLocaleString()}
                            </div>
                         </div>
                      ))}
                   </div>
                   
                   <div className="space-y-4">
                      <h4 className="text-sm font-mono text-foreground border-b border-amber-500/20 pb-2 flex items-center gap-2"><Calculator className="w-4 h-4 text-amber-500"/> Encrypted Payload (Server-Side)</h4>
                      <div className="space-y-2">
                        {encryptedSalaries.length === 0 ? (
                           <div className="h-40 flex items-center justify-center border border-dashed border-amber-500/20 rounded-lg text-amber-500/40 text-xs font-mono">
                             Awaiting Encryption...
                           </div>
                        ) : (
                           encryptedSalaries.map((c, i) => (
                             <div key={i} className="bg-amber-500/10 border border-amber-500/30 p-2 rounded text-[10px] font-mono text-amber-500/70 truncate">
                               E(Sal_{i+1}): {c}
                             </div>
                           ))
                        )}
                      </div>
                   </div>
                </div>

                {encryptedTotal && (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-black/40 border border-amber-500/30 rounded-xl p-6">
                      <h4 className="text-sm font-mono text-amber-400 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Server Computed Total (Still Encrypted)
                      </h4>
                      <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded text-xs font-mono text-amber-500 break-all mb-6">
                        {encryptedTotal}
                      </div>

                      {decryptedTotal && (
                         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center p-6 bg-amber-500/10 rounded-lg cyber-border border-amber-500/50">
                            <span className="text-xs font-mono text-amber-200 uppercase tracking-widest mb-2"><Unlock className="inline w-3 h-3 mr-1" /> Decrypted Verification</span>
                            <span className="text-4xl font-display font-bold text-amber-400">${parseInt(decryptedTotal).toLocaleString()}</span>
                            <span className="text-[10px] text-amber-500/70 font-mono mt-2">({salaries.join(' + ')})</span>
                         </motion.div>
                      )}
                   </motion.div>
                )}
                
                <div className="mt-6 text-center text-xs font-mono text-amber-400/50">
                  Status: {payrollStatus}
                </div>
             </motion.div>
          )}

          {activeTab === 'VOTING' && (
             <motion.div 
               key="voting"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
               className="glass p-12 rounded-xl border border-blue-500/30 text-center font-mono"
             >
                <FileSignature className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                <h3 className="text-2xl text-blue-400 mb-2">Electronic Voting</h3>
                <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                  A full demonstration of this module requires similar logic to payroll (summing encrypted 1s and 0s). 
                  Select the Payroll demo above to see homomorphic summation in action!
                </p>
             </motion.div>
          )}

          {activeTab === 'MEDICAL' && (
             <motion.div 
               key="medical"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
               className="glass p-12 rounded-xl border border-red-500/30 text-center font-mono"
             >
                <Stethoscope className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h3 className="text-2xl text-red-400 mb-2">Medical Compute</h3>
                <p className="text-muted-foreground text-sm max-w-lg mx-auto border border-red-500/20 bg-red-500/5 p-4 rounded-lg mt-4">
                  Using Paillier scalar multiplication on encrypted health records allows hospitals to compute statistical averages 
                  without decrypting patient data. (Similar to Payroll logic).
                </p>
             </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}
