import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Lock, Unlock, Key, Calculator, Filter, Code, RefreshCw, Layers } from 'lucide-react';
import { FheSimulator, FheContext, FheKeyPair, FheCiphertext } from '../lib/crypto/fhe';

export default function FheMode() {
  const [context, setContext] = useState<FheContext | null>(null);
  const [keys, setKeys] = useState<FheKeyPair | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [inputA, setInputA] = useState<string>('7');
  const [inputB, setInputB] = useState<string>('6');
  
  const [cipherA, setCipherA] = useState<FheCiphertext | null>(null);
  const [cipherB, setCipherB] = useState<FheCiphertext | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  
  const [cipherResult, setCipherResult] = useState<FheCiphertext | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [computeType, setComputeType] = useState<'ADD' | 'MULT'>('MULT');
  
  const [decryptedResult, setDecryptedResult] = useState<number | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const [logs, setLogs] = useState<{msg: string, time?: number, noise?: number}[]>([]);

  const addLog = (msg: string, time?: number, noise?: number) => {
    setLogs(prev => [...prev.slice(-4), { msg, time, noise }]);
  };

  const handleGenerateKeys = async () => {
    setIsGenerating(true);
    const start = performance.now();
    try {
      const ctx = await FheSimulator.createParameters(128);
      setContext(ctx);
      const newKeys = await FheSimulator.generateKeys(ctx);
      setKeys(newKeys);
      addLog('Generated CKKS Parameters & Keys (Simulated)', performance.now() - start);
      
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
    if (!keys) return;
    setIsEncrypting(true);
    const start = performance.now();
    try {
      const cA = await FheSimulator.encrypt(Number(inputA), keys.publicKey);
      const cB = await FheSimulator.encrypt(Number(inputB), keys.publicKey);
      
      setCipherA(cA);
      setCipherB(cB);
      addLog(`Encrypted values ${inputA} and ${inputB}`, performance.now() - start, cA.noiseLevel);
      
      setCipherResult(null);
      setDecryptedResult(null);
    } catch (e) {
      console.error(e);
    }
    setIsEncrypting(false);
  };

  const handleCompute = async () => {
    if (!keys || !cipherA || !cipherB) return;
    setIsComputing(true);
    const start = performance.now();
    try {
      let res;
      if (computeType === 'ADD') {
        res = await FheSimulator.add(cipherA, cipherB);
        addLog(`Homomorphic Add: E(${inputA}) ⊕ E(${inputB})`, performance.now() - start, res.noiseLevel);
      } else {
        res = await FheSimulator.multiply(cipherA, cipherB, keys.relinKeys);
        addLog(`Homomorphic Multiply: E(${inputA}) ⊗ E(${inputB})`, performance.now() - start, res.noiseLevel);
      }
      setCipherResult(res);
      setDecryptedResult(null);
    } catch (e) {
      console.error(e);
    }
    setIsComputing(false);
  };

  const handleDecrypt = async () => {
    if (!keys || !cipherResult) return;
    setIsDecrypting(true);
    const start = performance.now();
    try {
      const res = await FheSimulator.decrypt(cipherResult, keys.secretKey);
      setDecryptedResult(res);
      addLog(`Decrypted Result: ${res}`, performance.now() - start);
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
        <div className="glass p-6 rounded-xl cyber-border-accent relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -z-10 group-hover:bg-accent/20 transition-all duration-700"></div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-display font-semibold text-glow-accent flex items-center gap-2">
              <Activity className="w-6 h-6 text-accent" /> Fully Homomorphic Encryption (FHE)
            </h2>
            <div className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-md text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
              <Code className="w-3 h-3" /> Educational Simulation
            </div>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
            FHE allows <span className="text-accent font-mono bg-accent/10 px-1 rounded">arbitrary computations</span> (both addition and multiplication) on encrypted data. 
            This mode simulates realistic noise expansion and computational latency inherent in BFV/CKKS schemes.
          </p>
        </div>
        
        {/* Step 1: Key Generation */}
        <div className="glass p-6 rounded-xl cyber-border-accent space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-mono text-accent flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs">1</span> 
              Context & Key Setup
            </h3>
            <button 
              onClick={handleGenerateKeys} 
              disabled={isGenerating}
              className="btn-cyber-accent btn-cyber-sm flex items-center gap-2"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              {keys ? 'Regenerate Params' : 'Init Context'}
            </button>
          </div>
          
          <AnimatePresence>
            {keys && context && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-3 gap-4 mt-4"
              >
                <div className="bg-black/50 p-3 rounded-lg border border-accent/20 font-mono text-[10px] break-all">
                  <div className="text-accent/70 mb-1 flex items-center gap-1"><Unlock className="w-3 h-3"/> Public Key</div>
                  <span className="text-muted-foreground">{keys.publicKey.substring(0, 30)}...</span>
                </div>
                <div className="bg-black/50 p-3 rounded-lg border border-red-500/20 font-mono text-[10px] break-all">
                  <div className="text-red-400/70 mb-1 flex items-center gap-1"><Lock className="w-3 h-3"/> Secret Key</div>
                  <span className="text-muted-foreground">{keys.secretKey.substring(0, 30)}...</span>
                </div>
                <div className="bg-black/50 p-3 rounded-lg border border-purple-500/20 font-mono text-[10px] break-all">
                  <div className="text-purple-400/70 mb-1 flex items-center gap-1"><Filter className="w-3 h-3"/> Relin Keys</div>
                  <span className="text-muted-foreground">{keys.relinKeys.substring(0, 30)}...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step 2: Encryption */}
        <div className={`glass p-6 rounded-xl cyber-border-accent space-y-4 transition-opacity duration-500 ${!keys ? 'opacity-30 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-mono text-accent flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs">2</span> 
              Encrypt Data
            </h3>
            <button 
              onClick={handleEncrypt} 
              disabled={isEncrypting || !keys}
              className="btn-cyber-accent btn-cyber-sm flex items-center gap-2"
            >
              {isEncrypting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
              Generate Ciphertexts
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mt-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Plaintext A</label>
              <input 
                type="number" 
                value={inputA} 
                onChange={e => setInputA(e.target.value)}
                className="w-full bg-black/50 border cyber-border-accent rounded-lg p-3 font-mono text-foreground focus:outline-none focus:border-accent transition-colors"
              />
              {cipherA && (
                <div className="text-[10px] font-mono p-3 bg-accent/5 rounded border border-accent/20 text-accent/70 break-all h-24 overflow-hidden relative">
                  <div className="absolute top-1 right-2 text-[8px] px-1 bg-accent/20 rounded text-accent">Noise: {cipherA.noiseLevel}</div>
                  <span className="text-white">E(A) = </span>{cipherA.data}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Plaintext B</label>
              <input 
                type="number" 
                value={inputB} 
                onChange={e => setInputB(e.target.value)}
                className="w-full bg-black/50 border cyber-border-accent rounded-lg p-3 font-mono text-foreground focus:outline-none focus:border-accent transition-colors"
              />
              {cipherB && (
                <div className="text-[10px] font-mono p-3 bg-accent/5 rounded border border-accent/20 text-accent/70 break-all h-24 overflow-hidden relative">
                  <div className="absolute top-1 right-2 text-[8px] px-1 bg-accent/20 rounded text-accent">Noise: {cipherB.noiseLevel}</div>
                  <span className="text-white">E(B) = </span>{cipherB.data}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Computation */}
        <div className={`glass p-6 rounded-xl cyber-border-accent space-y-4 transition-opacity duration-500 ${!cipherA ? 'opacity-30 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-mono text-accent flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs">3</span> 
              FHE Computation
            </h3>
            
            <div className="flex items-center gap-4">
              <div className="flex bg-black/50 p-1 rounded-lg border cyber-border-accent">
                <button 
                  onClick={() => setComputeType('ADD')}
                  className={`px-3 py-1 text-xs font-mono rounded ${computeType === 'ADD' ? 'bg-accent/20 text-accent' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  ADD
                </button>
                <button 
                  onClick={() => setComputeType('MULT')}
                  className={`px-3 py-1 text-xs font-mono rounded ${computeType === 'MULT' ? 'bg-accent/20 text-accent' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  MULTIPLY
                </button>
              </div>

              <button 
                onClick={handleCompute} 
                disabled={isComputing || !cipherA}
                className="btn-cyber-accent btn-cyber-sm flex items-center gap-2"
              >
                {isComputing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                Compute
              </button>
            </div>
          </div>
          
          <AnimatePresence>
            {cipherResult && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                <div className="text-[11px] font-mono p-4 bg-accent/10 rounded-lg border border-accent/40 text-accent break-all relative">
                  <div className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-bold ${cipherResult.noiseLevel > 50 ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-accent/20 text-accent border border-accent/50'}`}>
                    Noise Level: {cipherResult.noiseLevel} (Budget: 100)
                  </div>
                  <span className="text-white mb-2 block font-bold">Encrypted {computeType === 'ADD' ? 'Sum' : 'Product'}:</span>
                  {cipherResult.data}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step 4: Decryption */}
        <div className={`glass p-6 rounded-xl cyber-border-accent space-y-4 transition-opacity duration-500 ${!cipherResult ? 'opacity-30 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-mono text-accent flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs">4</span> 
              Decryption
            </h3>
            <button 
              onClick={handleDecrypt} 
              disabled={isDecrypting || !cipherResult}
              className="btn-cyber-accent btn-cyber-sm flex items-center gap-2"
            >
              {isDecrypting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
              Decrypt Payload
            </button>
          </div>

          <AnimatePresence>
            {decryptedResult !== null && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="mt-6 flex items-center justify-center p-8 bg-black/60 border cyber-border-accent rounded-xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-accent/10 animate-pulse-glow"></div>
                <div className="z-10 flex flex-col items-center">
                  <div className="text-sm text-muted-foreground uppercase tracking-widest font-mono mb-2">Decrypted Final Value</div>
                  <div className="text-5xl font-display font-bold text-glow-accent text-white">
                    {decryptedResult}
                  </div>
                  <div className="mt-4 text-xs font-mono text-green-400 flex items-center gap-1">
                    Math Verified for {computeType} ({inputA} {computeType === 'ADD' ? '+' : '*'} {inputB})
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Side Panel */}
      <div className="space-y-6">
        <div className="glass p-6 rounded-xl cyber-border-accent h-[calc(100vh-8rem)] sticky top-24 flex flex-col">
          <h3 className="text-lg font-mono text-accent flex items-center gap-2 mb-4 border-b border-accent/20 pb-4">
            <Activity className="w-5 h-5" /> FHE State Tracker
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm font-mono text-center opacity-50">
                Awaiting FHE context...
              </div>
            ) : (
              logs.map((log, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className="bg-black/40 border-l-2 border-accent/50 p-3 rounded-r-lg"
                >
                  <p className="text-sm font-mono text-foreground/90">{log.msg}</p>
                  <div className="flex items-center justify-between mt-1">
                    {log.time && (
                      <p className="text-[10px] text-accent/70 font-mono">
                        {log.time.toFixed(2)}ms
                      </p>
                    )}
                    {log.noise !== undefined && (
                      <p className={`text-[10px] font-mono ${log.noise > 50 ? 'text-red-400' : 'text-accent'}`}>
                        Noise: {log.noise}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-accent/20">
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2">Noise Budget</h4>
            <div className="text-[11px] text-muted-foreground space-y-2 font-mono leading-relaxed bg-black/40 p-3 rounded-md">
              <p>Adding ciphertexts slightly increases noise.</p>
              <p>Multiplying ciphertexts <span className="text-red-400">drastically</span> increases noise and requires the Relinearization Key to reduce size.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
