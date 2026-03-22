import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Server, Lock, Unlock, Zap, Eye, EyeOff, Key, Database, RefreshCw, Cpu, Activity, AlertTriangle, AlertCircle } from 'lucide-react';

export default function Architecture() {
  return (
    <div className="w-full max-w-6xl flex flex-col items-center pt-8 pb-20 space-y-12 px-4">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-glow-primary mb-4">
          System & Threat Models
        </h1>
        <p className="text-muted-foreground font-mono text-sm leading-relaxed">
          Understanding the foundational security architecture of Outsourced Computation. Homomorphic encryption redefines trust boundaries.
        </p>
      </motion.div>

      {/* Before vs After Security View */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full space-y-6">
        <h2 className="text-2xl font-display font-bold text-center border-b border-white/10 pb-4">Before vs After Security View</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* TRADITIONAL */}
          <div className="glass p-6 rounded-xl cyber-border border-red-500/30 bg-red-950/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 bg-red-500/20 text-red-500 text-[10px] font-mono font-bold uppercase rounded-bl-lg">Traditional Security ❌</div>
            <h3 className="text-lg font-mono text-red-400 flex items-center gap-2 mb-6">
              <Unlock className="w-5 h-5" /> Data Exfiltration Risk
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-black/40 p-3 rounded border border-red-500/20">
                <Shield className="w-8 h-8 text-blue-400" />
                <div className="flex-1">
                  <p className="text-xs font-mono text-muted-foreground mb-1">1. Client Device (Trusted)</p>
                  <p className="text-[10px] text-green-400 font-mono">Data: "Salary: $50,000" <Unlock className="inline w-3 h-3 text-red-400"/></p>
                </div>
              </div>
              <div className="flex justify-center text-red-500"><Zap className="w-4 h-4" /></div>
              <div className="flex items-center gap-4 bg-black/40 p-3 rounded border border-red-500/50 relative shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <Server className="w-8 h-8 text-red-400" />
                <div className="flex-1">
                  <p className="text-xs font-mono text-red-300 mb-1">2. Cloud Server (Compromised)</p>
                  <p className="text-[10px] text-red-400 font-mono">Must Decrypt to Compute:</p>
                  <p className="text-[10px] text-green-400 font-mono mt-1 bg-green-500/10 p-1 rounded">"Salary: $50,000" <Eye className="inline w-3 h-3 ml-1 text-red-500"/></p>
                </div>
              </div>
            </div>
            <p className="mt-6 text-xs text-red-400/80 font-mono leading-relaxed border-t border-red-500/20 pt-4">
              In traditional architectures, the server <strong>must decrypt</strong> data to perform operations like searching, sorting, or aggregating. If the server is breached, or an insider is malicious, the raw plaintext is totally exposed.
            </p>
          </div>

          {/* HOMOMORPHIC */}
          <div className="glass p-6 rounded-xl cyber-border border-primary/30 bg-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 bg-primary/20 text-primary text-[10px] font-mono font-bold uppercase rounded-bl-lg">Homomorphic Security ✅</div>
            <h3 className="text-lg font-mono text-primary flex items-center gap-2 mb-6">
              <Lock className="w-5 h-5" /> Zero-Knowledge Compute
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-black/40 p-3 rounded border border-primary/20">
                <Shield className="w-8 h-8 text-blue-400" />
                <div className="flex-1">
                  <p className="text-xs font-mono text-muted-foreground mb-1">1. Client Device (Trusted)</p>
                  <p className="text-[10px] text-primary font-mono">Data: E("Salary: $50k") = 0x8F2A... <Lock className="inline w-3 h-3"/></p>
                </div>
              </div>
              <div className="flex justify-center text-primary"><Zap className="w-4 h-4" /></div>
              <div className="flex items-center gap-4 bg-black/40 p-3 rounded border border-primary/50 relative shadow-[0_0_15px_rgba(0,255,128,0.1)]">
                <Server className="w-8 h-8 text-orange-400" />
                <div className="flex-1">
                  <p className="text-xs font-mono text-orange-300 mb-1">2. Cloud Server (Untrusted)</p>
                  <p className="text-[10px] text-orange-400 font-mono">Computes blindly on Ciphertexts:</p>
                  <p className="text-[10px] text-primary font-mono mt-1 bg-primary/10 p-1 rounded">0x8F2A + 0x1B4... <EyeOff className="inline w-3 h-3 ml-1 text-primary"/></p>
                </div>
              </div>
            </div>
            <p className="mt-6 text-xs text-primary/80 font-mono leading-relaxed border-t border-primary/20 pt-4">
              The external cloud server receives algorithmic instructions (e.g., MULTIPLY) but operates natively on the encrypted polynomials. The server sees only mathematically indistinguishable random noise.
            </p>
          </div>
        </div>
      </motion.div>

      {/* System Model vs Threat Model */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* System Model */}
        <div className="glass p-8 rounded-2xl cyber-border content-start">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20"><Activity className="w-6 h-6 text-blue-400" /></div>
            <div>
              <h2 className="text-2xl font-display font-bold text-blue-400">System Model</h2>
              <p className="text-[10px] text-blue-400/50 font-mono uppercase tracking-widest mt-1">Entity Roles & Trust Boundaries</p>
            </div>
          </div>
          
          <ul className="space-y-4 text-sm font-mono text-muted-foreground">
            <li className="bg-black/30 p-4 rounded-lg border-l-2 border-blue-400">
              <strong className="text-blue-300 block mb-1">Data Owner (Trusted Client)</strong>
              Generates the KeyGen tuple (pk, sk, evk). Holds the Plaintext Domain. Ultimately decrypts ciphertext results.
            </li>
            <li className="bg-black/30 p-4 rounded-lg border-l-2 border-orange-400">
              <strong className="text-orange-300 block mb-1">Compute Node (Honest-but-Curious Server)</strong>
              Executes the Eval(evk, F, c1...cn) function. Strictly adheres to the cryptographic protocol but attempts to glean plaintext information from the transcript.
            </li>
            <li className="bg-black/30 p-4 rounded-lg border-l-2 border-primary">
              <strong className="text-primary block mb-1">Zero-Knowledge Guarantee</strong>
              The mathematical property that guarantees the server gains absolutely zero entropy or knowledge about the underlying plaintext variables during execution.
            </li>
          </ul>
        </div>

        {/* Threat Model */}
        <div className="glass p-8 rounded-2xl cyber-border border-red-500/30 content-start">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20"><AlertTriangle className="w-6 h-6 text-red-500" /></div>
            <div>
              <h2 className="text-2xl font-display font-bold text-red-500">Threat Model</h2>
              <p className="text-[10px] text-red-400/50 font-mono uppercase tracking-widest mt-1">Attack Vectors & Mitigations</p>
            </div>
          </div>
          
          <ul className="space-y-4 text-sm font-mono text-muted-foreground">
            <li className="bg-red-950/10 p-4 rounded-lg border border-red-500/20">
              <strong className="text-red-400 block mb-2 flex items-center gap-2"><Eye className="w-4 h-4"/> 1. Transcript Inspection</strong>
              A malicious server administrator actively analyzes the ciphertexts loaded in RAM to deduce the client's financial data.
              <div className="mt-2 text-[10px] text-primary bg-primary/10 p-2 rounded"><strong>Mitigated by HE:</strong> Ciphertexts are semantically secure. Without the private key, the ciphertexts are statistically indistinguishable from uniform randomness.</div>
            </li>
            <li className="bg-red-950/10 p-4 rounded-lg border border-red-500/20">
              <strong className="text-red-400 block mb-2 flex items-center gap-2"><Database className="w-4 h-4"/> 2. Database Compromise</strong>
              A hacker breaches the cloud firewall and dumps the entire SQL database containing user records.
              <div className="mt-2 text-[10px] text-primary bg-primary/10 p-2 rounded"><strong>Mitigated by HE:</strong> All records are stored as HE ciphertexts. The database dump is completely useless to the attacker (Quantum adversaries excluded for pre-lattice schemes).</div>
            </li>
            <li className="bg-red-950/10 p-4 rounded-lg border border-red-500/20">
              <strong className="text-red-400 block mb-2 flex items-center gap-2"><EyeOff className="w-4 h-4"/> 3. Intercepted Traffic</strong>
              A Man-In-The-Middle (MITM) intercepts the computed result returning to the client.
              <div className="mt-2 text-[10px] text-primary bg-primary/10 p-2 rounded"><strong>Mitigated by HE:</strong> The returning data is simply the evaluated ciphertext E(f(m)). It still requires the private Client-Side key to evaluate into plaintext.</div>
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Limitations Panel */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full relative">
        <div className="glass p-8 rounded-2xl cyber-border border-purple-500/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20"><AlertCircle className="w-6 h-6 text-purple-400" /></div>
             <div>
               <h2 className="text-2xl font-display font-bold text-purple-400">Academic Limitations</h2>
               <p className="text-[10px] text-purple-400/50 font-mono uppercase tracking-widest mt-1">Presentation & Deployment Constraints</p>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono text-muted-foreground relative z-10">
             <div className="bg-black/40 p-4 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors">
               <strong className="text-purple-300 block mb-1">PHE Capabilities</strong>
               Paillier supports strictly additive homomorphism. Encrypted multiplications natively require highly complex interactivity protocols.
             </div>
             <div className="bg-black/40 p-4 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors">
               <strong className="text-purple-300 block mb-1">FHE Circuit Simulation</strong>
               The FHE mode utilizes an exact algorithmic simulation to demonstrate noise accumulation, rather than forcing heavy C++/WASM bindings in the browser thread.
             </div>
             <div className="bg-black/40 p-4 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors">
               <strong className="text-purple-300 block mb-1">Computational Cost</strong>
               True multi-depth FHE demands extreme RAM capabilities and induces latency multiple orders of magnitude higher than plaintext execution environments.
             </div>
             <div className="bg-black/40 p-4 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors">
               <strong className="text-purple-300 block mb-1">Reduced Crypto Key Sizes</strong>
               To guarantee fluid 60fps UI performance inside a standard browser via Javascript BigInt, the bit-lengths generated are critically insecure for real-world production cryptography.
             </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
