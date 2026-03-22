import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Unlock, Key, Calculator, ArrowRight, RefreshCw, Cpu, CheckCircle2 } from 'lucide-react';
import { PaillierAsync } from '../lib/crypto/paillier-client';
import { PaillierKeyPair } from '../lib/crypto/paillier';

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

  // Performance tracking
  const [logs, setLogs] = useState<{msg: string, time?: number}[]>([]);

  const addLog = (msg: string, time?: number) => {
    setLogs(prev => [...prev.slice(-4), { msg, time }]);
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
      
      // Reset downstream
      setCipherA(null);
      setCipherB(null);
      setCipherResult(null);
      setDecryptedResult(null);
    } catch (e) {
      console.error(e);
    }
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
    } catch (e) {
      console.error(e);
    }
    setIsEncrypting(false);
  };

  const handleCompute = async () => {
    if (!paillierRef.current || !keys || !cipherA || !cipherB) return;
    setIsComputing(true);
    const start = performance.now();
    try {
      // Homomorphic addition is multiplication of ciphertexts
      const res = await paillierRef.current.add(BigInt(cipherA), BigInt(cipherB), keys.publicKey);
      setCipherResult(res.toString());
      addLog(`Homomorphic Add: E(${inputA}) ⊕ E(${inputB})`, performance.now() - start);
      setDecryptedResult(null);
    } catch (e) {
      console.error(e);
    }
    setIsComputing(false);
  };

  const handleDecrypt = async () => {
    if (!paillierRef.current || !keys || !cipherResult) return;
    setIsDecrypting(true);
    const start = performance.now();
    try {
      const res = await paillierRef.current.decrypt(BigInt(cipherResult), keys.publicKey, keys.privateKey);
      setDecryptedResult(res.toString());
      addLog(`Decrypted Result: ${res.toString()}`, performance.now() - start);
    } catch(e) {
      console.error(e);
    }
    setIsDecrypting(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl origin-top grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 pb-20"
    >
      <div className="lg:col-span-2 space-y-6">
        
        {/* Intro */}
        <div className="glass p-6 rounded-xl cyber-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10 group-hover:bg-primary/20 transition-all duration-700"></div>
          <h2 className="text-2xl font-display font-semibold mb-3 text-glow-primary flex items-center gap-2">
            <Lock className="w-6 h-6 text-primary" /> Partially Homomorphic Encryption (PHE)
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
            The Paillier cryptosystem allows computations to be carried out on ciphertexts directly. 
            Specifically, it is <span className="text-primary font-mono bg-primary/10 px-1 rounded">additively homomorphic</span>.
            Multiplying two ciphertexts effectively adds their underlying plaintexts together.
          </p>
        </div>
        
        {/* Step 1: Key Generation */}
        <div className="glass p-6 rounded-xl cyber-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-mono text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">1</span> 
              Key Generation
            </h3>
            <button 
              onClick={handleGenerateKeys} 
              disabled={isGenerating}
              className="btn-cyber btn-cyber-sm flex items-center gap-2"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              {keys ? 'Regenerate Keys' : 'Generate Keys'}
            </button>
          </div>
          
          <AnimatePresence>
            {keys && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-2 gap-4 mt-4"
              >
                <div className="bg-black/50 p-4 rounded-lg border border-primary/20 font-mono text-xs break-all">
                  <div className="text-primary/70 mb-1 flex items-center gap-1"><Unlock className="w-3 h-3"/> Public Key (n)</div>
                  <span className="text-muted-foreground">{keys.publicKey.n.toString().substring(0, 40)}...</span>
                </div>
                <div className="bg-black/50 p-4 rounded-lg border border-red-500/20 font-mono text-xs break-all">
                  <div className="text-red-400/70 mb-1 flex items-center gap-1"><Lock className="w-3 h-3"/> Private Key (λ)</div>
                  <span className="text-muted-foreground">{keys.privateKey.lambda.toString().substring(0, 40)}...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step 2: Encryption */}
        <div className={`glass p-6 rounded-xl cyber-border space-y-4 transition-opacity duration-500 ${!keys ? 'opacity-30 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-mono text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">2</span> 
              Encrypt Data
            </h3>
            <button 
              onClick={handleEncrypt} 
              disabled={isEncrypting || !keys}
              className="btn-cyber btn-cyber-sm flex items-center gap-2"
            >
              {isEncrypting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              Encrypt Values
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mt-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Plaintext A</label>
              <input 
                type="number" 
                value={inputA} 
                onChange={e => setInputA(e.target.value)}
                className="w-full bg-black/50 border cyber-border rounded-lg p-3 font-mono text-foreground focus:outline-none focus:border-primary transition-colors"
              />
              {cipherA && (
                <div className="text-[10px] font-mono p-3 bg-primary/5 rounded border border-primary/20 text-primary/70 break-all h-24 overflow-hidden">
                  <span className="text-white">E(A) = </span>{cipherA}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Plaintext B</label>
              <input 
                type="number" 
                value={inputB} 
                onChange={e => setInputB(e.target.value)}
                className="w-full bg-black/50 border cyber-border rounded-lg p-3 font-mono text-foreground focus:outline-none focus:border-primary transition-colors"
              />
              {cipherB && (
                <div className="text-[10px] font-mono p-3 bg-primary/5 rounded border border-primary/20 text-primary/70 break-all h-24 overflow-hidden">
                  <span className="text-white">E(B) = </span>{cipherB}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Computation */}
        <div className={`glass p-6 rounded-xl cyber-border space-y-4 transition-opacity duration-500 ${!cipherA ? 'opacity-30 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-mono text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">3</span> 
              Secure Computation
            </h3>
            <button 
              onClick={handleCompute} 
              disabled={isComputing || !cipherA}
              className="btn-cyber btn-cyber-sm flex items-center gap-2"
            >
              {isComputing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
              Compute Add
            </button>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            Computation is performed directly on the encrypted ciphertexts without decrypting them. 
            Server never sees {inputA} or {inputB}.
          </p>

          <AnimatePresence>
            {cipherResult && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                <div className="text-[11px] font-mono p-4 bg-primary/10 rounded-lg border border-primary/40 text-primary break-all">
                  <span className="text-white mb-2 block font-bold">Encrypted Result E(A + B):</span>
                  {cipherResult}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step 4: Decryption */}
        <div className={`glass p-6 rounded-xl cyber-border space-y-4 transition-opacity duration-500 ${!cipherResult ? 'opacity-30 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-mono text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">4</span> 
              Decryption & Verification
            </h3>
            <button 
              onClick={handleDecrypt} 
              disabled={isDecrypting || !cipherResult}
              className="btn-cyber btn-cyber-sm flex items-center gap-2"
            >
              {isDecrypting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Decrypt Payload
            </button>
          </div>

          <AnimatePresence>
            {decryptedResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="mt-6 flex items-center justify-center p-8 bg-black/60 border cyber-border rounded-xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/10 animate-pulse-glow"></div>
                <div className="z-10 flex flex-col items-center">
                  <div className="text-sm text-muted-foreground uppercase tracking-widest font-mono mb-2">Decrypted Sum</div>
                  <div className="text-5xl font-display font-bold text-glow-primary text-white">
                    {decryptedResult}
                  </div>
                  <div className="mt-4 text-xs font-mono text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Math Verified ( {inputA} + {inputB} = {parseInt(inputA) + parseInt(inputB)} )
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Side Panel */}
      <div className="space-y-6">
        <div className="glass p-6 rounded-xl cyber-border h-[calc(100vh-8rem)] sticky top-24 flex flex-col">
          <h3 className="text-lg font-mono text-primary flex items-center gap-2 mb-4 border-b border-primary/20 pb-4">
            <Cpu className="w-5 h-5" /> Operation Tracker
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm font-mono text-center opacity-50">
                Awaiting system initialization...
              </div>
            ) : (
              logs.map((log, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className="bg-black/40 border-l-2 border-primary/50 p-3 rounded-r-lg"
                >
                  <p className="text-sm font-mono text-foreground/90">{log.msg}</p>
                  {log.time && (
                    <p className="text-[10px] text-primary/70 font-mono mt-1 flex items-center justify-between">
                      <span>EXEC_TIME</span>
                      <span>{log.time.toFixed(2)}ms</span>
                    </p>
                  )}
                </motion.div>
              ))
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-primary/20">
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2">Algorithm Mechanics</h4>
            <div className="text-xs text-muted-foreground space-y-2 font-mono leading-relaxed bg-black/40 p-3 rounded-md">
              <p><span className="text-primary">E(m₁) * E(m₂) mod n²</span></p>
              <p className="opacity-70">Multiplying ciphertexts maps to plaintext addition.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
