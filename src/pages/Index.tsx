import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Cpu, Activity, Zap, ArrowRight, BarChart3, Database, Server, Smartphone, Lock, Unlock, Check, X, AlertTriangle, FastForward, Key } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const performanceData = [
  { name: 'Plaintext', Encryption: 0.1, Computation: 0.05, Decryption: 0 },
  { name: 'Paillier (PHE)', Encryption: 12.5, Computation: 2.1, Decryption: 4.8 },
  { name: 'BFV/CKKS (FHE)', Encryption: 45.2, Computation: 850.4, Decryption: 25.1 },
];

interface TooltipEntry { color?: string; name?: string; value?: number | string; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const customTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border cyber-border p-3 rounded-lg shadow-xl font-mono text-xs z-50">
        <p className="text-white font-bold mb-2">{label}</p>
        {payload.map((entry: TooltipEntry, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {entry.name}: {entry.value}ms
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Index() {
  return (
    <div className="w-full max-w-6xl flex flex-col items-center pt-10 pb-20 space-y-24 px-4 overflow-hidden">
      
      {/* 1. Hero Section */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-4xl relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10"></div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-mono text-xs mb-6 uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,128,0.2)]">
          <Shield className="w-3 h-3" /> Secure Cloud Strategy
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-bold text-glow-primary mb-6 leading-tight">
          Compute Without <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent relative">
            Compromise
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent blur-md"></div>
          </span>
        </h1>
        <div className="bg-black/40 border border-primary/30 p-6 rounded-xl mb-8 text-left max-w-3xl mx-auto shadow-[0_0_30px_rgba(0,255,128,0.1)]">
          <h2 className="text-xl font-mono text-primary mb-3 flex items-center gap-2"><Check className="w-5 h-5"/> What this system demonstrates</h2>
          <p className="text-sm text-foreground/80 font-mono leading-relaxed mb-4">
            This application demonstrates how homomorphic encryption enables secure data processing in untrusted environments.
          </p>
          <p className="text-sm text-foreground/80 font-mono leading-relaxed mb-2">
            It simulates a client-server architecture where:
          </p>
          <ul className="list-inside list-disc pl-2 text-sm text-foreground/80 font-mono leading-relaxed space-y-1 mb-4">
            <li>the client encrypts sensitive data</li>
            <li>the server computes on encrypted data</li>
            <li>the client decrypts the result</li>
          </ul>
          <p className="text-sm text-primary/90 font-mono leading-relaxed font-bold">
            This ensures that sensitive data is never exposed during processing.
          </p>
          <div className="mt-4 pt-4 border-t border-primary/20">
            <p className="text-xs text-muted-foreground font-mono leading-relaxed italic">
              Traditional encryption protects data at rest and in transit, but not during computation.<br/>
              <strong className="text-primary/80">Homomorphic encryption extends protection to data in use.</strong>
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/phe" className="btn-cyber flex items-center gap-2">Explore PHE Architecture <ArrowRight className="w-4 h-4" /></Link>
          <Link to="/use-cases" className="btn-cyber-accent flex items-center gap-2">Launch Story Scenarios <Zap className="w-4 h-4" /></Link>
        </div>
      </motion.div>

      {/* 2. Architecture Overview */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="w-full relative">
        <h2 className="text-2xl font-display font-bold text-center mb-10 text-glow-primary">Cryptosystem Architecture Flow</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 w-full max-w-4xl mx-auto">
          
          <div className="flex flex-col items-center bg-blue-950/20 border border-blue-500/30 p-6 rounded-xl w-full md:w-64 relative shadow-[0_0_30px_rgba(59,130,246,0.1)]">
             <Smartphone className="w-10 h-10 text-blue-400 mb-4" />
             <h3 className="font-mono text-blue-400 font-bold mb-2">Trusted Client</h3>
             <div className="text-xs text-muted-foreground font-mono space-y-2 w-full">
               <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded border border-blue-500/20"><Key className="w-3 h-3 text-blue-400"/> Generates Keys</div>
               <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded border border-blue-500/20"><Lock className="w-3 h-3 text-green-400"/> Encrypts Data</div>
               <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded border border-blue-500/20"><Unlock className="w-3 h-3 text-amber-400"/> Decrypts Results</div>
             </div>
          </div>

          <div className="flex md:flex-col items-center justify-center gap-2 text-primary font-mono text-xs">
            <div className="flex flex-col items-center opacity-80">
              <span>Send E(Data)</span>
              <ArrowRight className="w-6 h-6 hidden md:block my-2" />
              <ArrowRight className="w-6 h-6 rotate-90 md:hidden mx-2" />
            </div>
            <div className="flex flex-col items-center opacity-80">
              <ArrowRight className="w-6 h-6 hidden md:block my-2 rotate-180" />
              <ArrowRight className="w-6 h-6 -rotate-90 md:hidden mx-2" />
              <span>Return E(Res)</span>
            </div>
          </div>

          <div className="flex flex-col items-center bg-orange-950/20 border border-orange-500/30 p-6 rounded-xl w-full md:w-64 relative shadow-[0_0_30px_rgba(249,115,22,0.1)]">
             <Server className="w-10 h-10 text-orange-400 mb-4" />
             <h3 className="font-mono text-orange-400 font-bold mb-2">Untrusted Cloud</h3>
             <div className="text-xs text-muted-foreground font-mono space-y-2 w-full">
               <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded border border-orange-500/20"><Database className="w-3 h-3 text-orange-400"/> Stores Ciphertexts</div>
               <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded border border-orange-500/20"><Activity className="w-3 h-3 text-accent"/> Homomorphic Compute</div>
               <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded border border-red-500/20"><Shield className="w-3 h-3 text-red-500"/> Zero-Knowledge State</div>
             </div>
          </div>

        </div>
      </motion.div>

      {/* 3. PHE vs FHE Comparison */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="w-full flex justify-center">
        <div className="w-full max-w-4xl glass p-8 rounded-2xl cyber-border text-left">
          <h2 className="text-2xl font-display font-bold mb-6 text-glow-primary">Cryptosystem Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono border-collapse">
              <thead>
                <tr className="border-b border-primary/30">
                  <th className="p-4 text-muted-foreground font-normal">Feature matrix</th>
                  <th className="p-4 text-primary font-bold bg-primary/5 rounded-tl-lg">Partially Homomorphic (PHE)<br/><span className="text-[10px] text-muted-foreground font-normal">e.g., Paillier</span></th>
                  <th className="p-4 text-accent font-bold bg-accent/5 rounded-tr-lg">Fully Homomorphic (FHE)<br/><span className="text-[10px] text-muted-foreground font-normal">e.g., BFV/CKKS</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-muted-foreground">Encrypted Addition (⊕)</td>
                  <td className="p-4 bg-primary/5 text-center"><Check className="w-5 h-5 text-primary mx-auto"/></td>
                  <td className="p-4 bg-accent/5 text-center"><Check className="w-5 h-5 text-accent mx-auto"/></td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-muted-foreground">Encrypted Multiplication (⊗)</td>
                  <td className="p-4 bg-primary/5 text-center"><X className="w-5 h-5 text-red-500/50 mx-auto"/></td>
                  <td className="p-4 bg-accent/5 text-center"><Check className="w-5 h-5 text-accent mx-auto"/></td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-muted-foreground">Noise Management Required</td>
                  <td className="p-4 bg-primary/5 text-center"><X className="w-5 h-5 text-green-500/50 mx-auto"/></td>
                  <td className="p-4 bg-accent/5 text-center"><Check className="w-5 h-5 text-red-500 mx-auto"/></td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-muted-foreground">Computational Overhead</td>
                  <td className="p-4 bg-primary/5 text-center text-primary/80">Low - Moderate</td>
                  <td className="p-4 bg-accent/5 text-center text-red-400">Extreme (1000x +)</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-muted-foreground">Ideal Datasets</td>
                  <td className="p-4 bg-primary/5 text-center text-[10px]">Tallying, Financial ledgers</td>
                  <td className="p-4 bg-accent/5 text-center text-[10px]">Machine learning, Neural nets</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* 4. Analytics */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="w-full max-w-5xl glass p-8 rounded-2xl cyber-border border-primary/30 relative">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20"><BarChart3 className="w-6 h-6 text-primary" /></div>
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Performance Latency Story</h2>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mt-1">Why Homomorphic encryption is expensive</p>
          </div>
        </div>
        
        <div className="h-80 w-full mt-4 bg-black/30 rounded-lg p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary) / 0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <RechartsTooltip content={customTooltip} cursor={{ fill: 'hsl(var(--primary) / 0.05)' }} />
              <Legend wrapperStyle={{ paddingTop: '20px', fontFamily: 'monospace', fontSize: '12px' }}/>
              <Bar yAxisId="left" dataKey="Encryption" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 4, 4]} />
              <Bar yAxisId="left" dataKey="Computation" stackId="a" fill="hsl(var(--accent))" />
              <Bar yAxisId="left" dataKey="Decryption" stackId="a" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/40 border border-muted p-4 rounded-lg">
            <h3 className="text-sm font-bold text-white mb-2">Plaintext Baseline</h3>
            <p className="text-[11px] text-muted-foreground font-mono leading-relaxed">Raw operations execute directly on computer registers at native clock speeds (microseconds). However, data is completely exposed during processing.</p>
          </div>
          <div className="bg-black/40 border border-primary/40 p-4 rounded-lg">
            <h3 className="text-sm font-bold text-primary mb-2">PHE (Modular Math)</h3>
            <p className="text-[11px] text-muted-foreground font-mono leading-relaxed">Slower due to cryptographic <strong className="text-primary/70">modular exponentiation</strong> over massive &gt;2048-bit numbers. Addition requires multiplying huge polynomials, yielding noticeable latency.</p>
          </div>
          <div className="bg-black/40 border border-accent/40 p-4 rounded-lg">
            <h3 className="text-sm font-bold text-accent mb-2">FHE (Noise Management)</h3>
            <p className="text-[11px] text-muted-foreground font-mono leading-relaxed">Exponentially slower. Multiplication introduces <strong className="text-accent/70">cryptographic noise</strong> that must be mitigated via complex Relinearization or Bootstrapping algorithms to prevent data loss.</p>
          </div>
        </div>
      </motion.div>

      {/* 5. Limitations & Future Work Panel */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-xl cyber-border border-red-500/30 bg-red-950/5">
          <h3 className="text-lg font-mono text-red-400 flex items-center gap-2 mb-4 border-b border-red-500/20 pb-3">
            <AlertTriangle className="w-5 h-5" /> Current Limitations
          </h3>
          <ul className="space-y-3 text-xs font-mono text-muted-foreground">
            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">•</span> <strong>Browser CPU Limits:</strong> 256-bit prime generation was utilized instead of 2048-bit to ensure immediate browser rendering times for the PHE demo.</li>
            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">•</span> <strong>FHE Simulated Runtime:</strong> Deep fully homomorphic schemes require massive WebAssembly binaries (like Microsoft SEAL). This system simulates noise growth and latency for educational transparency.</li>
            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">•</span> <strong>Partial Operations:</strong> Paillier is strictly additive. Attempting arbitrary compute with it fails mathematically.</li>
          </ul>
        </div>
        
        <div className="glass p-6 rounded-xl cyber-border border-purple-500/30 bg-purple-950/5">
          <h3 className="text-lg font-mono text-purple-400 flex items-center gap-2 mb-4 border-b border-purple-500/20 pb-3">
            <FastForward className="w-5 h-5" /> Future Research Horizon
          </h3>
          <ul className="space-y-3 text-xs font-mono text-muted-foreground">
            <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">🚀</span> <strong>WASM SEAL Integration:</strong> Compiling Microsoft SEAL via Emscripten to run legitimate CKKS context generation entirely inside the browser thread.</li>
            <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">🚀</span> <strong>Hardware Acceleration:</strong> Using WebGPU APIs to offload polynomial multiplications and RNS transformations from the CPU.</li>
            <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">🚀</span> <strong>Distributed Clouds:</strong> Setting up a real Express server to physically isolate the untrusted computation environment.</li>
          </ul>
        </div>
      </motion.div>

    </div>
  );
}
