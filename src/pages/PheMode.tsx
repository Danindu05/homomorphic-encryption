import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Unlock, Key, Calculator, RefreshCw, Cpu, CheckCircle2, Send, Server, ChevronRight } from 'lucide-react';
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
      
      setCipherA(null);
      setCipherB(null);
      setCipherResult(null);
      setDecryptedResult(null);
      setPhase('idle');
    } catch (e) { console.error(e); }
    setIsGenerating(false);
  };

  const handleEncrypt = async () => {
    if (!paillierRef.current || !keys) return;
    setIsEncrypting(true);
    const start = performance.now();
    try {
      const p = paillierRef.current;
      const cA = await p.encrypt(BigInt(inputA), keys.publicKey);
      const cB = await p.encrypt(BigInt(inputB), keys.publicKey);
      
      setCipherA(cA.toString());
      setCipherB(cB.toString());
      addLog(`Encrypted values ${inputA} and ${inputB}`, performance.now() - start);
      
      setCipherResult(null);
      setDecryptedResult(null);
      setPhase('idle');
    } catch (e) { console.error(e); }
    setIsEncrypting(false);
  };

  const transmitToServer = () => {
    setPhase('to-server');
    addLog('Transmitting ciphertexts via untrusted network');
    setTimeout(() => {
      setPhase('at-server');
      addLog('Ciphertexts arrived at Server safely');
    }, 2000);
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
    setTimeout(() => {
      setPhase('at-client');
      addLog('Result arrived at Client');
    }, 2000);
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
    <div className="space-y-6">
      <div className="bg-black/40 p-4 rounded-lg cyber-border border-blue-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-mono text-blue-400">1. Key Generation</h3>
          <button onClick={handleGenerateKeys} disabled={isGenerating} className="btn-cyber btn-cyber-sm flex items-center gap-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/20">
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            {keys ? 'Regenerate Keys' : 'Generate Keys'}
          </button>
        </div>
        {keys && (
           <div className="grid grid-cols-1 gap-2 text-[10px] font-mono opacity-80 break-all">
             <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20 text-blue-300">
               <Unlock className="w-3 h-3 inline mb-0.5 mr-1" /> Pub (n): {keys.publicKey.n.toString().substring(0,25)}...
             </div>
             <div className="p-2 bg-red-500/10 rounded border border-red-500/20 text-red-300">
               <Lock className="w-3 h-3 inline mb-0.5 mr-1" /> Priv (λ): {keys.privateKey.lambda.toString().substring(0,25)}...
               <span className="block mt-1 text-red-400/80 font-mono tracking-normal text-[9px]">The private key material strictly never leaves this trusted device.</span>
             </div>
           </div>
        )}
      </div>

      <div className={`bg-black/40 p-4 rounded-lg cyber-border border-blue-500/20 transition-opacity ${!keys ? 'opacity-30 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-mono text-blue-400">2. Encrypt Data</h3>
          <button onClick={handleEncrypt} disabled={isEncrypting || !keys} className="btn-cyber btn-cyber-sm flex items-center gap-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/20">
            {isEncrypting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />} Encrypt
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input type="number" value={inputA} onChange={e => setInputA(e.target.value)} className="w-full bg-black/50 border border-blue-500/30 rounded p-2 text-sm text-center font-mono focus:border-blue-400 focus:outline-none" />
            <div className={`mt-2 text-[10px] font-mono p-2 rounded border break-all h-16 overflow-hidden ${cipherA ? 'bg-green-500/10 border-green-500/40 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'border-blue-500/10 text-transparent'}`}>
              {cipherA ? `E(A)=${cipherA}` : ''}
            </div>
          </div>
          <div>
            <input type="number" value={inputB} onChange={e => setInputB(e.target.value)} className="w-full bg-black/50 border border-blue-500/30 rounded p-2 text-sm text-center font-mono focus:border-blue-400 focus:outline-none" />
            <div className={`mt-2 text-[10px] font-mono p-2 rounded border break-all h-16 overflow-hidden ${cipherB ? 'bg-green-500/10 border-green-500/40 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'border-blue-500/10 text-transparent'}`}>
              {cipherB ? `E(B)=${cipherB}` : ''}
            </div>
          </div>
        </div>

        {cipherA && phase === 'idle' && (
          <button onClick={transmitToServer} className="mt-4 w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 p-2 rounded text-blue-300 font-mono text-sm flex justify-center items-center gap-2 transition-all">
            <Send className="w-4 h-4" /> Transmit Ciphertexts to Server
          </button>
        )}
      </div>

      <div className={`bg-black/40 p-4 rounded-lg cyber-border border-blue-500/20 transition-opacity ${phase !== 'at-client' ? 'opacity-30 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-mono text-blue-400">5. Decrypt Result</h3>
          <button onClick={handleDecrypt} disabled={isDecrypting || phase !== 'at-client'} className="btn-cyber btn-cyber-sm flex items-center gap-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/20">
            {isDecrypting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />} Decrypt
          </button>
        </div>
        
        {decryptedResult && (
           <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
             <div className="text-4xl font-display font-bold text-green-400 shadow-green-500/50 drop-shadow-lg animate-pulse-glow">{decryptedResult}</div>
             <div className="mt-2 text-xs font-mono text-green-500/80 flex items-center gap-1">
               <CheckCircle2 className="w-3 h-3" /> Validated: {inputA} + {inputB} = {parseInt(inputA) + parseInt(inputB)}
             </div>
           </motion.div>
        )}
      </div>
    </div>
  );

  /* SERVER CONTENT */
  const serverView = (
    <div className="space-y-6 h-full flex flex-col justify-center">
      {phase === 'idle' || phase === 'to-server' ? (
        <div className="flex flex-col items-center justify-center h-full text-orange-400/50 font-mono text-sm gap-4">
          <Server className="w-12 h-12 opacity-50" />
          <p className="text-center px-4">Server is idle, awaiting encrypted payload.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-black/40 p-4 rounded-lg cyber-border border-orange-500/30">
            <h3 className="text-sm font-mono text-orange-400 mb-2">3. Received Ciphertexts</h3>
            <div className="grid grid-cols-1 gap-2 text-[8px] font-mono break-all text-orange-300 opacity-60">
              <div className="bg-orange-950/40 p-2 rounded">E(A): {cipherA?.substring(0, 50)}...</div>
              <div className="bg-orange-950/40 p-2 rounded">E(B): {cipherB?.substring(0, 50)}...</div>
            </div>
            <p className="text-xs text-orange-400 mt-2 font-mono italic opacity-80">Ciphertexts reside on un-trusted compute node. The server sees only statistically random values without the private key (λ).</p>
          </div>

          <div className={`p-4 rounded-lg transition-all duration-500 ${phase === 'at-server' ? 'bg-orange-950/40 border-2 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)]' : 'bg-black/40 cyber-border border-orange-500/30'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono text-orange-400">4. Homomorphic Compute</h3>
              <button onClick={handleCompute} disabled={isComputing || !!cipherResult} className="btn-cyber btn-cyber-sm flex items-center gap-2 border-orange-500/50 text-orange-400 hover:bg-orange-500/20">
                {isComputing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />} Compute Sum
              </button>
            </div>
            {phase === 'at-server' && (
              <div className="mb-4 animate-pulse bg-orange-500/20 text-orange-300 p-2 rounded-lg border border-orange-500/50 text-xs font-mono font-bold flex items-center justify-center text-center">
                ⚠️ This is the critical step:<br/>The server computes WITHOUT decrypting the data.
              </div>
            )}
            
            <details className="mb-3 group cursor-pointer">
              <summary className="text-[10px] font-mono text-orange-400/80 hover:text-orange-400 transition-colors flex items-center gap-1">
                <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" /> View Math Formula
              </summary>
              <div className="mt-2 text-[10px] font-mono text-orange-300 bg-orange-900/20 p-2 rounded border border-orange-500/20">
                Enc(a + b) = Enc(a) × Enc(b) mod n²
              </div>
            </details>
            
            <AnimatePresence>
              {cipherResult && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 text-[10px] font-mono p-3 bg-green-500/10 rounded border border-green-500/30 text-green-400 break-all h-20 overflow-hidden shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                  <span className="text-white">E(Result) = </span>{cipherResult}
                </motion.div>
              )}
            </AnimatePresence>

            {cipherResult && phase === 'at-server' && (
              <button onClick={transmitToClient} className="mt-4 w-full bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 p-2 rounded text-orange-300 font-mono text-sm flex justify-center items-center gap-2 transition-all">
                <Send className="w-4 h-4 transform rotate-180" /> Return to Client
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
      <div className="flex flex-col gap-4 w-full items-center justify-center">
        {phase === 'to-server' && (
          <DataFlowArrow direction="left-to-right" label="Ciphertexts E(A), E(B)" isEncrypted={true} />
        )}
        {phase === 'to-client' && (
          <DataFlowArrow direction="right-to-left" label="Result E(A+B)" isEncrypted={true} />
        )}
        {(phase === 'to-server' || phase === 'to-client') && (
           <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-[9px] text-red-300/60 leading-tight">
             Attacker intercepts:<br/>
             {cipherA ? cipherA.substring(0,25) + "..." : "Random Data..."}
           </motion.div>
        )}
        {phase !== 'to-server' && phase !== 'to-client' && (
          <div className="h-10 text-[9px] text-red-500/30 uppercase tracking-widest flex items-center text-center">No active transmission</div>
        )}
      </div>
    </AnimatePresence>
  );

  return (
    <div className="w-full flex flex-col gap-6 p-4 pb-20 items-center">
      <div className="w-full max-w-7xl flex flex-col xl:flex-row gap-6">
        
        {/* Main Split Interface */}
        <div className="flex-1">
          <div className="glass p-5 rounded-xl cyber-border relative overflow-hidden mb-6 group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10 group-hover:bg-primary/20 transition-all duration-700"></div>
            <h2 className="text-2xl font-display font-semibold mb-2 text-glow-primary flex items-center gap-2">
              <Lock className="w-6 h-6 text-primary" /> Paillier PHE Architecture
            </h2>
            <p className="text-muted-foreground text-sm max-w-2xl">
              A precise Client-Server deployment simulation. The untrusted server evaluates the homomorphic addition circuit (E(A)*E(B) mod n²) purely on ciphertexts. Private key material never leaves the trusted client boundary, completely maintaining data privacy during computation.
            </p>
          </div>

          <ClientServerSplit 
            clientContent={clientView} 
            serverContent={serverView} 
            attackerContent={attackerView}
            narration={getNarration()} 
          />
        </div>

        {/* Tracker Panel */}
        <div className="w-full xl:w-80 shrink-0">
          <div className="glass p-5 rounded-xl cyber-border h-auto xl:sticky xl:top-24 flex flex-col">
            <h3 className="text-lg font-mono text-primary flex items-center gap-2 mb-4 border-b border-primary/20 pb-4">
              <Cpu className="w-5 h-5" /> Operation Tracker
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[400px] xl:max-h-[60vh] custom-scrollbar">
              {logs.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-muted-foreground text-sm font-mono opacity-50">
                  System initialized...
                </div>
              ) : (
                logs.map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={i} 
                    className="bg-black/60 border border-primary/20 p-3 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                  >
                    <p className="text-xs font-mono text-foreground/90">{log.msg}</p>
                    {log.time && (
                      <p className="text-[9px] text-primary/70 font-mono mt-2 pt-2 border-t border-primary/10 flex items-center justify-between">
                        <span>EXEC_TIME</span>
                        <span className="bg-primary/10 px-1 rounded">{log.time.toFixed(1)}ms</span>
                      </p>
                    )}
                  </motion.div>
                ))
              )}
            </div>
            
            <details className="mt-4 pt-4 border-t border-primary/20 group cursor-pointer">
              <summary className="text-[10px] uppercase tracking-widest text-primary/70 font-mono mb-2 hover:text-primary transition-colors flex items-center gap-1">
                <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" /> Core Mathematical Formulas
              </summary>
              <div className="text-[10px] text-primary/80 space-y-2 font-mono leading-relaxed bg-primary/5 p-3 rounded border border-primary/10 mt-2">
                <div>
                  <span className="text-muted-foreground">Encryption:</span><br/>
                  Enc(m) = g^m · r^n mod n²
                </div>
                <div>
                  <span className="text-muted-foreground">Homomorphic Addition:</span><br/>
                  Enc(a + b) = Enc(a) × Enc(b) mod n²
                </div>
                <div className="text-[9px] text-primary/50 mt-2 border-t border-primary/20 pt-2">
                  <p>n = p * q &nbsp;&nbsp;|&nbsp;&nbsp; λ = lcm(p-1, q-1)</p>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
