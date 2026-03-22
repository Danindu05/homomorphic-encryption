import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Lock, Unlock, Key, Calculator, Filter, RefreshCw, Layers, Send, Server, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { FheSimulator, FheContext, FheKeyPair, FheCiphertext } from '../lib/crypto/fhe';
import { ClientServerSplit } from '../components/shared/ClientServerSplit';
import { DataFlowArrow } from '../components/shared/DataFlowArrow';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ReferenceLine, ResponsiveContainer } from 'recharts';

type NetworkPhase = 'idle' | 'to-server' | 'at-server' | 'to-client' | 'at-client';

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

  const [phase, setPhase] = useState<NetworkPhase>('idle');

  const [logs, setLogs] = useState<{msg: string, time?: number, noise?: number}[]>([]);
  const [noiseHistory, setNoiseHistory] = useState<{ step: number; noise: number; label: string }[]>([]);

  const addLog = (msg: string, time?: number, noise?: number) => {
    setLogs(prev => [...prev.slice(-4), { msg, time, noise }]);
    if (noise !== undefined) {
      setNoiseHistory(prev => [...prev, { step: prev.length, noise, label: msg.substring(0, 15) + '...' }]);
    }
  };

  const getNarration = () => {
    if (!context || !keys) return "System uninitialized. Waiting for the Trusted Client to generate the cryptographic FHE parameters and keys.";
    if (phase === 'idle' && !cipherA) return "CKKS Parameters and Keys generated. The Client securely holds the Secret Key. Ready to encrypt local values.";
    if (phase === 'idle' && cipherA) return "Data encrypted into polynomial ciphertexts. They are inherently noisy by design (LWE). Ready to transmit.";
    if (phase === 'to-server') return "Transmitting massive FHE polynomial ciphertexts over the intercepted network. The attacker sees indistinguishable noise.";
    if (phase === 'at-server' && !cipherResult) return "The untrusted server received the ciphertexts. The server does not possess the private key and therefore cannot decrypt the data. Waiting for homomorphic circuit execution.";
    if (phase === 'at-server' && cipherResult) return `The server evaluated the ${computeType} circuit blindly. Noise grew significantly. Ready to return.`;
    if (phase === 'to-client') return "Returning the evaluated ciphertext back to the Trusted Client domain.";
    if (phase === 'at-client' && decryptedResult === null) return "The Client received the computed ciphertext. It will now attempt decryption using its Secret Key.";
    if (phase === 'at-client' && Number.isNaN(decryptedResult)) return "Decryption FAILED. The mathematical noise grew too large during compute and corrupted the underlying exact message polynomial.";
    if (phase === 'at-client' && decryptedResult !== null) return "Decryption successful! The noise remained within algorithmic bounds, so the original underlying message was safely recovered.";
    return "Waiting for action...";
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
      setPhase('idle');
      setNoiseHistory([{ step: 0, noise: 0, label: 'Init' }]);
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
      setPhase('idle');
    } catch (e) {
      console.error(e);
    }
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
    } catch (e) {
      console.error(e);
    }
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
    if (!keys || !cipherResult) return;
    setIsDecrypting(true);
    const start = performance.now();
    try {
      if (cipherResult.noiseLevel >= 100) {
        addLog(`DECRYPTION FAILED: Noise Over Threshold`, performance.now() - start, cipherResult.noiseLevel);
        setDecryptedResult(NaN);
      } else {
        const res = await FheSimulator.decrypt(cipherResult, keys.secretKey);
        setDecryptedResult(res);
        addLog(`Decrypted via Secret Key: ${res}`, performance.now() - start);
      }
    } catch(e) {
      console.error(e);
    }
    setIsDecrypting(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/90 border cyber-border p-3 rounded-lg shadow-xl font-mono text-xs">
          <p className="text-white font-bold mb-1">{data.label}</p>
          <p className={data.noise >= 100 ? 'text-red-500 font-bold' : 'text-accent'}>Noise: {data.noise}%</p>
        </div>
      );
    }
    return null;
  };

  /* CLIENT CONTENT */
  const clientView = (
    <div className="space-y-6">
      <div className="bg-black/40 p-4 rounded-lg cyber-border border-accent/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-mono text-accent">1. Key & Context Setup</h3>
          <button onClick={handleGenerateKeys} disabled={isGenerating} className="btn-cyber-accent btn-cyber-sm flex items-center gap-2 border-accent/50 text-accent hover:bg-accent/20">
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />} Init Context
          </button>
        </div>
        {keys && context && (
           <div className="grid grid-cols-1 gap-2 text-[10px] font-mono opacity-80 break-all">
             <div className="p-2 bg-accent/10 rounded border border-accent/20 text-accent/80">
               <Unlock className="w-3 h-3 inline mb-0.5 mr-1" /> Public Key: {keys.publicKey.substring(0,30)}...
             </div>
             <div className="p-2 bg-red-500/10 rounded border border-red-500/20 text-red-300">
               <Lock className="w-3 h-3 inline mb-0.5 mr-1" /> Secret Key: {keys.secretKey.substring(0,30)}...
             </div>
             <details className="group cursor-pointer">
               <summary className="text-[10px] font-mono hover:text-purple-300 transition-colors flex items-center gap-1 p-2 bg-purple-500/10 rounded border border-purple-500/20 text-purple-300/80">
                 <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" /> View Evaluation Keys (Relin)
               </summary>
               <div className="mt-2 text-[9px] text-purple-300/70 p-2 bg-purple-500/5 rounded border border-purple-500/10">
                 <Filter className="w-3 h-3 inline mb-0.5 mr-1" /> {keys.relinKeys.substring(0,30)}...
                 <p className="mt-1 opacity-80 leading-tight">Evaluation keys are public and sent to the server. They are required to reduce ciphertext size and noise after a multiplication operation via Relinearization.</p>
               </div>
             </details>
           </div>
        )}
      </div>

      <div className={`bg-black/40 p-4 rounded-lg cyber-border border-accent/20 transition-opacity ${!keys ? 'opacity-30 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-mono text-accent">2. Encrypt Dataset</h3>
          <button onClick={handleEncrypt} disabled={isEncrypting || !keys} className="btn-cyber-accent btn-cyber-sm flex items-center gap-2 border-accent/50 text-accent hover:bg-accent/20">
            {isEncrypting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />} Encrypt Data
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input type="number" value={inputA} onChange={e => setInputA(e.target.value)} className="w-full bg-black/50 border border-accent/30 rounded p-2 text-sm text-center font-mono focus:border-accent focus:outline-none" />
            <div className={`mt-2 text-[10px] font-mono p-2 rounded border break-all h-16 overflow-hidden ${cipherA ? 'bg-green-500/10 border-green-500/40 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'border-accent/10 text-transparent'}`}>
              {cipherA && <div className="absolute top-1 right-1 text-[8px] opacity-70">N:{cipherA.noiseLevel}%</div>}
              {cipherA ? `E(A)=${cipherA.data}` : ''}
            </div>
          </div>
          <div>
            <input type="number" value={inputB} onChange={e => setInputB(e.target.value)} className="w-full bg-black/50 border border-accent/30 rounded p-2 text-sm text-center font-mono focus:border-accent focus:outline-none" />
            <div className={`mt-2 text-[10px] font-mono p-2 rounded border break-all h-16 overflow-hidden ${cipherB ? 'bg-green-500/10 border-green-500/40 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'border-accent/10 text-transparent'}`}>
              {cipherB && <div className="absolute top-1 right-1 text-[8px] opacity-70">N:{cipherB.noiseLevel}%</div>}
              {cipherB ? `E(B)=${cipherB.data}` : ''}
            </div>
          </div>
        </div>

        {cipherA && phase === 'idle' && (
          <button onClick={transmitToServer} className="mt-4 w-full bg-accent/20 hover:bg-accent/30 border border-accent/50 p-2 rounded text-accent font-mono text-sm flex justify-center items-center gap-2 transition-all">
            <Send className="w-4 h-4" /> Transmit Ciphertexts to Server
          </button>
        )}
      </div>

      <div className={`bg-black/40 p-4 rounded-lg cyber-border border-accent/20 transition-opacity ${phase !== 'at-client' ? 'opacity-30 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-mono text-accent">5. Decrypt Result</h3>
          <button onClick={handleDecrypt} disabled={isDecrypting || phase !== 'at-client'} className="btn-cyber-accent btn-cyber-sm flex items-center gap-2 border-accent/50 text-accent hover:bg-accent/20">
            {isDecrypting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />} Decrypt
          </button>
        </div>
        
        {decryptedResult !== null && (
           <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`flex flex-col items-center justify-center p-4 rounded-lg border ${Number.isNaN(decryptedResult) ? 'bg-red-500/10 border-red-500/50' : 'bg-green-500/10 border-green-500/50'}`}>
             <div className={`text-3xl font-display font-bold ${Number.isNaN(decryptedResult) ? 'text-red-500' : 'text-green-400 animate-pulse-glow shadow-green-500/50 drop-shadow-lg'}`}>
               {Number.isNaN(decryptedResult) ? "CORRUPT DATA" : decryptedResult}
             </div>
             <div className={`mt-2 text-[10px] font-mono flex items-center gap-1 ${Number.isNaN(decryptedResult) ? 'text-red-400' : 'text-green-500/80'}`}>
               {Number.isNaN(decryptedResult) ? "Noise exceeded decryption threshold (100%)" : `Validated: ${inputA} ${computeType === 'ADD' ? '+' : '*'} ${inputB} = ${computeType === 'ADD' ? parseInt(inputA)+parseInt(inputB) : parseInt(inputA)*parseInt(inputB)}`}
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
          <p className="text-center px-4">Server is idle, awaiting payload.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-black/40 p-4 rounded-lg cyber-border border-orange-500/30">
            <h3 className="text-sm font-mono text-orange-400 mb-2">3. Received Ciphertexts</h3>
            <div className="grid grid-cols-1 gap-2 text-[8px] font-mono break-all text-orange-300 opacity-60">
              <div className="bg-orange-950/40 p-2 rounded relative">
                E(A): {cipherA?.data.substring(0, 30)}...
                <div className="absolute top-1 right-2 text-[8px] text-accent">N:{cipherA?.noiseLevel}%</div>
              </div>
              <div className="bg-orange-950/40 p-2 rounded relative">
                E(B): {cipherB?.data.substring(0, 30)}...
                <div className="absolute top-1 right-2 text-[8px] text-accent">N:{cipherB?.noiseLevel}%</div>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg transition-all duration-500 ${phase === 'at-server' ? 'bg-orange-950/40 border-2 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)]' : 'bg-black/40 cyber-border border-orange-500/30'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono text-orange-400">4. Compute FHE Circuit</h3>
            </div>
            {phase === 'at-server' && (
              <div className="mb-4 animate-pulse bg-orange-500/20 text-orange-300 p-2 rounded-lg border border-orange-500/50 text-xs font-mono font-bold flex items-center justify-center text-center">
                ⚠️ This is the critical step:<br/>The server computes WITHOUT decrypting the data.
              </div>
            )}
            
            <div className="flex items-center gap-2 mb-4 bg-black/50 p-1 rounded-lg cyber-border-accent">
              <button onClick={() => setComputeType('ADD')} className={`px-2 py-1 text-xs font-mono rounded flex-1 ${computeType === 'ADD' ? 'bg-accent/30 text-accent' : 'text-muted-foreground hover:text-foreground'}`}>
                ADD
              </button>
              <button onClick={() => setComputeType('MULT')} className={`px-2 py-1 text-xs font-mono rounded flex-1 ${computeType === 'MULT' ? 'bg-accent/30 text-accent' : 'text-muted-foreground hover:text-foreground'}`}>
                MULTIPLY
              </button>
            </div>

            <button onClick={handleCompute} disabled={isComputing || phase !== 'at-server'} className="w-full btn-cyber-accent btn-cyber-sm flex justify-center items-center gap-2 border-orange-500/50 text-orange-400 hover:bg-orange-500/20 mb-3">
              {isComputing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />} Execute {computeType}
            </button>

            <p className="text-[10px] text-orange-400/80 my-3 font-mono opacity-80 leading-tight">
              Addition incurs extremely low noise overhead. Multiplication creates huge polynomial noise growth, risking decryption failure.
            </p>

            <details className="mb-3 group cursor-pointer">
              <summary className="text-[10px] font-mono text-orange-400/80 hover:text-orange-400 transition-colors flex items-center gap-1">
                <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" /> View Math Formula
              </summary>
              <div className="mt-2 text-[9px] font-mono text-orange-300 bg-orange-900/20 p-2 border border-orange-500/20 rounded leading-relaxed">
                {computeType === 'ADD' ? (
                  <>Formula: <span className="text-white relative z-10">E(a + b) = E(a) ⊕ E(b)</span><br/><span className="mt-1 opacity-60">Additive homomorphism naturally limits noise expansion.</span></>
                ) : (
                  <>Formula: <span className="text-white relative z-10">E(a * b) = E(a) ⊗ E(b)</span><br/><span className="mt-1 opacity-60">Exponential noise growth. Requires Relinearization keys to constrain ciphertext bounds.</span></>
                )}
              </div>
            </details>
            
            <AnimatePresence>
              {cipherResult && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`mt-2 text-[10px] font-mono p-3 rounded border text-green-400 break-all h-20 overflow-hidden relative ${cipherResult.noiseLevel >= 100 ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-green-500/10 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]'}`}>
                  <div className={`absolute top-1 right-2 text-[8px] px-1 rounded ${cipherResult.noiseLevel >= 100 ? 'bg-red-500 text-white' : 'bg-accent/20 text-accent'}`}>
                    Noise: {cipherResult.noiseLevel}%
                  </div>
                  <span className="text-white">E(Res) = </span>{cipherResult.data}
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
        {phase === 'to-server' && <DataFlowArrow direction="left-to-right" label="Ciphertexts E(A), E(B)" isEncrypted={true} />}
        {phase === 'to-client' && <DataFlowArrow direction="right-to-left" label="Result E(A op B)" isEncrypted={true} />}
        {(phase === 'to-server' || phase === 'to-client') && (
           <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-[9px] text-red-300/60 leading-tight">
             Attacker intercepts:<br/>
             {cipherA ? cipherA.data.substring(0,25) + "..." : "Random Data..."}
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
          <div className="glass p-5 rounded-xl cyber-border-accent relative overflow-hidden mb-6 group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -z-10 group-hover:bg-accent/20 transition-all duration-700"></div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-display font-semibold text-glow-accent flex items-center gap-2">
                <Activity className="w-6 h-6 text-accent" /> FHE Cloud Deployment
              </h2>
            </div>
            <p className="text-muted-foreground text-sm max-w-2xl">
              An interactive simulation of Fully Homomorphic Encryption (BFV/CKKS paradigm). Unlike PHE, FHE allows for arbitrary computations (both addition and multiplication) on ciphertexts. However, successive ciphertext multiplications drastically increase underlying algorithmic noise, eventually causing decryption failure (data corruption) if the noise crosses the decryption threshold limit.
            </p>
          </div>

          <ClientServerSplit 
            clientContent={clientView} 
            serverContent={serverView} 
            attackerContent={attackerView}
            narration={getNarration()} 
          />
        </div>

        {/* Tracker Panel & Graphics */}
        <div className="w-full xl:w-80 shrink-0 space-y-4">
          
          <div className="glass p-4 rounded-xl cyber-border-accent">
            <h3 className="text-[11px] font-mono text-accent uppercase tracking-widest mb-3">FHE Noise Growth Visualization</h3>
            <div className="h-40 w-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={noiseHistory} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="step" tick={{ fontSize: 9, fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 120]} tick={{ fontSize: 9, fill: '#888' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={customTooltip} />
                  <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'DECRYPT FAIL', fill: '#ef4444', fontSize: 10, offset: 5 }} />
                  <Line type="monotone" dataKey="noise" stroke="#00d8ff" strokeWidth={2} dot={{ r: 3, fill: '#00d8ff' }} activeDot={{ r: 5 }} animationDuration={500} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass p-4 rounded-xl cyber-border-accent h-[40vh] flex flex-col">
            <h3 className="text-sm font-mono text-accent flex items-center gap-2 mb-3 border-b border-accent/20 pb-2">
              <Activity className="w-4 h-4" /> Operations Log
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-xs font-mono opacity-50">Log empty</div>
              ) : (
                logs.map((log, i) => (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={i} className="bg-black/60 border-l border-accent/50 p-2 rounded shadow-sm">
                    <p className="text-[10px] font-mono text-foreground/90">{log.msg}</p>
                    {log.noise !== undefined && (
                      <p className={`text-[9px] font-mono mt-1 ${log.noise >= 100 ? 'text-red-400' : 'text-accent/80'}`}>
                        Noise Level: {log.noise}%
                      </p>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
