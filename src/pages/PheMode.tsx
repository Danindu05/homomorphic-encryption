import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Unlock, Key, Calculator, RefreshCw, Cpu, CheckCircle2, Send, Server, ChevronRight, AlertTriangle } from 'lucide-react';
import { PaillierAsync } from '../lib/crypto/paillier-client';
import { PaillierKeyPair } from '../lib/crypto/paillier';
import { ClientServerSplit } from '../components/shared/ClientServerSplit';
import { DataFlowArrow } from '../components/shared/DataFlowArrow';

type NetworkPhase = 'idle' | 'to-server' | 'at-server' | 'to-client' | 'at-client';

export default function PheMode() {
  const paillierRef = useRef<PaillierAsync | null>(null);
  
  const [keys, setKeys] = useState<PaillierKeyPair | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [inputA, setInputA] = useState<string>('50');
  const [inputB, setInputB] = useState<string>('150');
  
  const [cipherA, setCipherA] = useState<string | null>(null);
  const [cipherB, setCipherB] = useState<string | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  
  const [cipherResult, setCipherResult] = useState<string | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  
  const [decryptedResult, setDecryptedResult] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const [phase, setPhase] = useState<NetworkPhase>('idle');

  const [logs, setLogs] = useState<{msg: string, time?: number}[]>([]);

  const addLog = (msg: string, time?: number) => {
    setLogs(prev => [...prev.slice(-4), { msg, time }]);
  };

  const getNarration = () => {
    if (!keys) return "System uninitialized. Waiting for the Trusted Client to generate the cryptographic (Public/Private) keys.";
    if (phase === 'idle' && !cipherA) return "Keys generated. The Client securely holds the Private Key. Ready to encrypt local plaintext data.";
    if (phase === 'idle' && cipherA) return "Data encrypted using the Public Key. The plaintexts are now ciphertexts. It is safe to transmit them to the untrusted server.";
    if (phase === 'to-server') return "Transmitting ciphertexts over the intercepted network. The attacker sees only mathematically random noise.";
    if (phase === 'at-server' && !cipherResult) return "The untrusted server has received the ciphertexts. The server does not possess the private key and therefore cannot decrypt the data. It is eagerly awaiting homomorphic compute instructions.";
    if (phase === 'at-server' && cipherResult) return "The server blindly computed the homomorphic addition: Enc(A) × Enc(B) mod n² = Enc(A+B). The encrypted result is ready to return.";
    if (phase === 'to-client') return "Returning the newly computed ciphertext back to the Trusted Client domain.";
    if (phase === 'at-client' && !decryptedResult) return "The Client received the computed ciphertext. It can now use its strict Private Key to open the mathematically evaluated result.";
    if (phase === 'at-client' && decryptedResult) return "Decryption successful! We proved we can outsource computation to an untrusted server without ever exposing the underlying private data.";
    return "Waiting for action...";
  };

  useEffect(() => {
    paillierRef.current = new PaillierAsync();
    return () => {
      paillierRef.current?.destroy();
    };
  }, []);

  const handleGenerateKeys = async () => {
    if (!paillierRef.current) return;
    setIsGenerating(true);
    const start = performance.now();
    try {
      const newKeys = await paillierRef.current.generateKeys(256);
      setKeys(newKeys);
      addLog('Generated 256-bit Paillier Keys', performance.now() - start);
      setCipherA(null); setCipherB(null); setCipherResult(null); setDecryptedResult(null); setPhase('idle');
    } catch (e) { console.error(e); }
    setIsGenerating(false);
  };

  const handleEncrypt = async () => {
    if (!paillierRef.current || !keys) return;
    setIsEncrypting(true);
    const start = performance.now();
    try {
      const cA = await paillierRef.current.encrypt(BigInt(inputA), keys.publicKey);
      const cB = await paillierRef.current.encrypt(BigInt(inputB), keys.publicKey);
      setCipherA(cA.toString()); setCipherB(cB.toString());
      addLog(`Encrypted values ${inputA} and ${inputB}`, performance.now() - start);
      setCipherResult(null); setDecryptedResult(null); setPhase('idle');
    } catch (e) { console.error(e); }
    setIsEncrypting(false);
  };

  const transmitToServer = () => {
    setPhase('to-server');
    addLog('Transmitting ciphertexts via untrusted network');
    setTimeout(() => { setPhase('at-server'); addLog('Ciphertexts arrived at Server safely'); }, 2000);
  };

  const handleCompute = async () => {
    if (!paillierRef.current || !keys || !cipherA || !cipherB) return;
    setIsComputing(true);
    const start = performance.now();
    try {
      const res = await paillierRef.current.add(BigInt(cipherA), BigInt(cipherB), keys.publicKey);
      setCipherResult(res.toString());
      addLog(`Server Homomorphic Add: E(A) ⊕ E(B)`, performance.now() - start);
    } catch (e) { console.error(e); }
    setIsComputing(false);
  };

  const transmitToClient = () => {
    setPhase('to-client');
    addLog('Returning encrypted result via untrusted network');
    setTimeout(() => { setPhase('at-client'); addLog('Result arrived at Client'); }, 2000);
  };

  const handleDecrypt = async () => {
    if (!paillierRef.current || !keys || !cipherResult) return;
    setIsDecrypting(true);
    const start = performance.now();
    try {
      const res = await paillierRef.current.decrypt(BigInt(cipherResult), keys.publicKey, keys.privateKey);
      setDecryptedResult(res.toString());
      addLog(`Decrypted via Private Key: ${res.toString()}`, performance.now() - start);
    } catch(e) { console.error(e); }
    setIsDecrypting(false);
  };

  /* CLIENT CONTENT */
  const clientView = (
    <div className="space-y-4">
      {/* Key Generation */}
      <div className="bg-black/20 p-4 rounded-xl border border-blue-500/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono text-blue-400 font-semibold">1. Key Generation</h3>
          <button onClick={handleGenerateKeys} disabled={isGenerating} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-semibold rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/15 hover:border-blue-500/30 transition-all disabled:opacity-50">
            {isGenerating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Key className="w-3 h-3" />}
            {keys ? 'Regenerate' : 'Generate Keys'}
          </button>
        </div>
        {keys && (
           <div className="grid grid-cols-1 gap-2 text-[9px] font-mono break-all">
             <div className="p-2 bg-blue-500/[0.06] rounded-lg border border-blue-500/10 text-blue-300/80">
               <Unlock className="w-3 h-3 inline mb-0.5 mr-1" /> Pub (n): {keys.publicKey.n.toString().substring(0,25)}...
             </div>
             <div className="p-2 bg-red-500/[0.06] rounded-lg border border-red-500/10 text-red-300/80">
               <Lock className="w-3 h-3 inline mb-0.5 mr-1" /> Priv (λ): {keys.privateKey.lambda.toString().substring(0,25)}...
               <span className="block mt-1 text-red-400/60 text-[8px]">Private key strictly never leaves this trusted device.</span>
             </div>
           </div>
        )}
      </div>

      {/* Encrypt */}
      <div className={`bg-black/20 p-4 rounded-xl border border-blue-500/10 transition-opacity ${!keys ? 'opacity-30 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono text-blue-400 font-semibold">2. Encrypt Data</h3>
          <button onClick={handleEncrypt} disabled={isEncrypting || !keys} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-semibold rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/15 transition-all disabled:opacity-50">
            {isEncrypting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />} Encrypt
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input type="number" value={inputA} onChange={e => setInputA(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-center font-mono focus:border-blue-400/40 focus:outline-none transition-colors" />
            <div className={`mt-2 text-[9px] font-mono p-2 rounded-lg border break-all h-14 overflow-hidden ${cipherA ? 'bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-400' : 'border-white/5 text-transparent'}`}>
              {cipherA ? `E(A)=${cipherA}` : ''}
            </div>
          </div>
          <div>
            <input type="number" value={inputB} onChange={e => setInputB(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-center font-mono focus:border-blue-400/40 focus:outline-none transition-colors" />
            <div className={`mt-2 text-[9px] font-mono p-2 rounded-lg border break-all h-14 overflow-hidden ${cipherB ? 'bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-400' : 'border-white/5 text-transparent'}`}>
              {cipherB ? `E(B)=${cipherB}` : ''}
            </div>
          </div>
        </div>
        {cipherA && phase === 'idle' && (
          <button onClick={transmitToServer} className="mt-3 w-full bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 p-2 rounded-xl text-blue-300 font-mono text-[11px] flex justify-center items-center gap-2 transition-all">
            <Send className="w-3.5 h-3.5" /> Transmit Ciphertexts to Server
          </button>
        )}
      </div>

      {/* Decrypt */}
      <div className={`bg-black/20 p-4 rounded-xl border border-blue-500/10 transition-opacity ${phase !== 'at-client' ? 'opacity-30 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono text-blue-400 font-semibold">5. Decrypt Result</h3>
          <button onClick={handleDecrypt} disabled={isDecrypting || phase !== 'at-client'} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-semibold rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/15 transition-all disabled:opacity-50">
            {isDecrypting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Unlock className="w-3 h-3" />} Decrypt
          </button>
        </div>
        {decryptedResult && (
           <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center p-4 bg-emerald-500/[0.08] border border-emerald-500/30 rounded-xl">
             <div className="text-3xl font-display font-bold text-emerald-400">{decryptedResult}</div>
             <div className="mt-2 text-[10px] font-mono text-emerald-500/70 flex items-center gap-1">
               <CheckCircle2 className="w-3 h-3" /> Validated: {inputA} + {inputB} = {parseInt(inputA) + parseInt(inputB)}
             </div>
           </motion.div>
        )}
      </div>
    </div>
  );

  /* SERVER CONTENT */
  const serverView = (
    <div className="space-y-4 h-full flex flex-col justify-center">
      {phase === 'idle' || phase === 'to-server' ? (
        <div className="flex flex-col items-center justify-center h-full text-orange-400/30 font-mono text-sm gap-3 py-8">
          <Server className="w-10 h-10 opacity-40" />
          <p className="text-center text-xs">Awaiting encrypted payload...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-black/20 p-4 rounded-xl border border-orange-500/10">
            <h3 className="text-xs font-mono text-orange-400 font-semibold mb-2">3. Received Ciphertexts</h3>
            <div className="grid grid-cols-1 gap-1.5 text-[8px] font-mono break-all text-orange-300/50">
              <div className="bg-orange-500/[0.04] p-2 rounded-lg">E(A): {cipherA?.substring(0, 50)}...</div>
              <div className="bg-orange-500/[0.04] p-2 rounded-lg">E(B): {cipherB?.substring(0, 50)}...</div>
            </div>
            <p className="text-[10px] text-orange-400/60 mt-2 font-mono leading-relaxed">The server does not possess the private key and therefore cannot decrypt the data.</p>
          </div>

          <div className={`p-4 rounded-xl transition-all duration-500 ${phase === 'at-server' && !cipherResult ? 'bg-orange-500/[0.06] border-2 border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.15)]' : 'bg-black/20 border border-orange-500/10'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono text-orange-400 font-semibold">4. Homomorphic Compute</h3>
              <button onClick={handleCompute} disabled={isComputing || !!cipherResult} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-semibold rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/15 transition-all disabled:opacity-50">
                {isComputing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Calculator className="w-3 h-3" />} Compute Sum
              </button>
            </div>
            {phase === 'at-server' && !cipherResult && (
              <div className="mb-3 animate-pulse bg-orange-500/10 text-orange-300 p-2.5 rounded-xl border border-orange-500/20 text-[10px] font-mono font-semibold text-center">
                <AlertTriangle className="w-3 h-3 inline mr-1" />Critical step: The server computes WITHOUT decrypting the data.
              </div>
            )}
            <details className="group cursor-pointer">
              <summary className="text-[9px] font-mono text-orange-400/60 hover:text-orange-400 transition-colors flex items-center gap-1">
                <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" /> View Math Formula
              </summary>
              <div className="mt-2 text-[9px] font-mono text-orange-300/70 bg-orange-500/[0.04] p-2 rounded-lg border border-orange-500/10">
                Enc(a + b) = Enc(a) × Enc(b) mod n²
              </div>
            </details>
            <AnimatePresence>
              {cipherResult && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 text-[9px] font-mono p-3 bg-emerald-500/[0.06] rounded-lg border border-emerald-500/20 text-emerald-400 break-all h-16 overflow-hidden">
                  <span className="text-white/80">E(Result) = </span>{cipherResult}
                </motion.div>
              )}
            </AnimatePresence>
            {cipherResult && phase === 'at-server' && (
              <button onClick={transmitToClient} className="mt-3 w-full bg-orange-500/10 hover:bg-orange-500/15 border border-orange-500/20 p-2 rounded-xl text-orange-300 font-mono text-[11px] flex justify-center items-center gap-2 transition-all">
                <Send className="w-3.5 h-3.5 transform rotate-180" /> Return to Client
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  /* ATTACKER CONTENT */
  const attackerView = (
    <AnimatePresence>
      <div className="flex flex-col gap-3 w-full items-center justify-center">
        {phase === 'to-server' && <DataFlowArrow direction="left-to-right" label="E(A), E(B)" isEncrypted={true} />}
        {phase === 'to-client' && <DataFlowArrow direction="right-to-left" label="E(A+B)" isEncrypted={true} />}
        {(phase === 'to-server' || phase === 'to-client') && (
           <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-[8px] text-red-300/40 leading-tight text-center">
             Intercepted: {cipherA ? cipherA.substring(0,20) + "..." : "…"}
           </motion.div>
        )}
        {phase !== 'to-server' && phase !== 'to-client' && (
          <div className="h-8 text-[8px] text-red-500/20 uppercase tracking-widest flex items-center text-center">No transmission</div>
        )}
      </div>
    </AnimatePresence>
  );

  return (
    <div className="w-full flex flex-col items-center overflow-hidden">
      {/* Page Header */}
      <section className="w-full max-w-7xl px-4 pt-10 pb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white/[0.02] p-5 rounded-2xl border border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            <h2 className="text-2xl font-display font-bold mb-1.5 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> Paillier PHE Architecture
            </h2>
            <p className="text-muted-foreground text-xs max-w-2xl leading-relaxed">
              A precise Client-Server simulation. The untrusted server evaluates E(A)×E(B) mod n² purely on ciphertexts. Private key material never leaves the trusted client boundary.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Main Layout */}
      <section className="w-full max-w-7xl px-4 pb-16">
        <div className="flex flex-col xl:flex-row gap-5">
          <div className="flex-1">
            <ClientServerSplit 
              clientContent={clientView} 
              serverContent={serverView} 
              attackerContent={attackerView}
              narration={getNarration()} 
            />
          </div>

          {/* Tracker Panel */}
          <div className="w-full xl:w-72 shrink-0">
            <div className="bg-white/[0.02] p-4 rounded-2xl border border-primary/10 xl:sticky xl:top-24 flex flex-col">
              <h3 className="text-sm font-mono text-primary flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                <Cpu className="w-4 h-4" /> Operation Tracker
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[350px] xl:max-h-[55vh] custom-scrollbar">
                {logs.length === 0 ? (
                  <div className="h-24 flex items-center justify-center text-muted-foreground text-xs font-mono opacity-40">System initialized...</div>
                ) : (
                  logs.map((log, i) => (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={i} className="bg-black/20 border border-white/5 p-3 rounded-xl">
                      <p className="text-[10px] font-mono text-foreground/80">{log.msg}</p>
                      {log.time && (
                        <p className="text-[9px] text-primary/50 font-mono mt-1.5 pt-1.5 border-t border-white/5 flex items-center justify-between">
                          <span>EXEC_TIME</span>
                          <span className="bg-primary/10 px-1.5 py-0.5 rounded text-primary/70">{log.time.toFixed(1)}ms</span>
                        </p>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
              <details className="mt-4 pt-3 border-t border-white/5 group cursor-pointer">
                <summary className="text-[9px] uppercase tracking-wider text-primary/50 font-mono hover:text-primary/80 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" /> Core Formulas
                </summary>
                <div className="text-[9px] text-primary/60 space-y-1.5 font-mono leading-relaxed bg-primary/[0.03] p-3 rounded-lg border border-primary/5 mt-2">
                  <div><span className="text-muted-foreground">Encryption:</span><br/>Enc(m) = g^m · r^n mod n²</div>
                  <div><span className="text-muted-foreground">Addition:</span><br/>Enc(a+b) = Enc(a) × Enc(b) mod n²</div>
                  <div className="text-[8px] text-primary/30 pt-1.5 border-t border-primary/10">n = p*q | λ = lcm(p-1, q-1)</div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
