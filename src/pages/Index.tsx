import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Cpu, Activity, Zap, ArrowRight, BarChart3, Database, Server, Smartphone, Lock, Unlock, Check, X, AlertTriangle, FastForward, Key, ArrowDown, BookOpen } from 'lucide-react';
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
      <div className="bg-black/95 border border-white/10 p-4 rounded-xl shadow-2xl font-mono text-xs backdrop-blur-md">
        <p className="text-white font-bold mb-2">{label}</p>
        {payload.map((entry: TooltipEntry, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="py-0.5">
            {entry.name}: {entry.value}ms
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function Index() {
  return (
    <div className="w-full flex flex-col items-center overflow-hidden">
      
      {/* ====== HERO ====== */}
      <section className="w-full max-w-6xl px-4 pt-16 pb-24 flex flex-col items-center text-center relative">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/20 text-primary font-mono text-[11px] mb-8 uppercase tracking-[0.2em]">
            <Shield className="w-3 h-3" /> Research-Grade Simulation
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-display font-black leading-[1.05] mb-8 tracking-tight">
            Compute Without<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary relative inline-block">
              Compromise
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-60 blur-sm"></div>
            </span>
          </motion.h1>

          {/* Opening Statement Card */}
          <motion.div variants={fadeUp} className="bg-white/[0.03] border border-white/10 p-6 md:p-8 rounded-2xl mb-10 text-left backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
            
            <h2 className="text-base font-semibold text-primary mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> What this system demonstrates
            </h2>
            <p className="text-sm text-foreground/70 leading-relaxed mb-3">
              This application demonstrates how <strong className="text-foreground/90">homomorphic encryption</strong> enables secure data processing in untrusted environments.
            </p>
            <p className="text-sm text-foreground/70 leading-relaxed mb-2">It simulates a client-server architecture where:</p>
            <ul className="space-y-1.5 mb-4 pl-1">
              {['the client encrypts sensitive data', 'the server computes on encrypted data', 'the client decrypts the result'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-foreground/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0"></div>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-sm text-primary font-semibold">
              This ensures that sensitive data is never exposed during processing.
            </p>
            <div className="mt-5 pt-5 border-t border-white/8">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Traditional encryption protects data at rest and in transit, but not during computation.<br/>
                <strong className="text-primary/70">Homomorphic encryption extends protection to data in use.</strong>
              </p>
            </div>
          </motion.div>
          
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/phe" className="btn-cyber flex items-center gap-2">
              Explore PHE <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/use-cases" className="btn-cyber-accent flex items-center gap-2">
              Launch Demo <Zap className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ====== ARCHITECTURE FLOW ====== */}
      <section className="w-full bg-white/[0.015] border-y border-white/5 py-20 px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="max-w-5xl mx-auto">
          <motion.h2 variants={fadeUp} className="text-2xl font-display font-bold text-center mb-3">
            Cryptosystem Architecture
          </motion.h2>
          <motion.p variants={fadeUp} className="text-sm text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Data flows through three distinct trust domains. The private key never leaves the client boundary.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-4">
            {/* Client */}
            <div className="flex-1 rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-6 hover:border-blue-500/40 hover:bg-blue-500/[0.06] transition-all duration-500 group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                <Smartphone className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-blue-400 mb-3">Trusted Client</h3>
              <div className="space-y-2">
                {[
                  { icon: Key, text: 'Generates Keys', color: 'text-blue-300' },
                  { icon: Lock, text: 'Encrypts Data', color: 'text-emerald-300' },
                  { icon: Unlock, text: 'Decrypts Results', color: 'text-amber-300' },
                ].map(({ icon: Icon, text, color }, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs font-mono text-muted-foreground bg-black/20 px-3 py-2 rounded-lg border border-white/5">
                    <Icon className={`w-3.5 h-3.5 ${color}`} /> {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow column */}
            <div className="flex flex-col items-center justify-center gap-1 py-4 md:py-0 shrink-0 min-w-[80px]">
              <div className="text-[10px] font-mono text-primary/60 mb-1">Send E(Data)</div>
              <ArrowRight className="w-5 h-5 text-primary/40 hidden md:block" />
              <ArrowDown className="w-5 h-5 text-primary/40 md:hidden" />
              <div className="w-px h-6 bg-gradient-to-b from-primary/20 to-red-500/20 hidden md:block"></div>
              <ArrowRight className="w-5 h-5 text-primary/40 rotate-180 hidden md:block" />
              <ArrowDown className="w-5 h-5 text-primary/40 rotate-180 md:hidden" />
              <div className="text-[10px] font-mono text-primary/60 mt-1">Return E(Res)</div>
            </div>

            {/* Server */}
            <div className="flex-1 rounded-2xl border border-orange-500/20 bg-orange-500/[0.04] p-6 hover:border-orange-500/40 hover:bg-orange-500/[0.06] transition-all duration-500 group">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                <Server className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="font-semibold text-orange-400 mb-3">Untrusted Cloud</h3>
              <div className="space-y-2">
                {[
                  { icon: Database, text: 'Stores Ciphertexts', color: 'text-orange-300' },
                  { icon: Activity, text: 'Homomorphic Compute', color: 'text-accent' },
                  { icon: Shield, text: 'Zero-Knowledge State', color: 'text-red-400' },
                ].map(({ icon: Icon, text, color }, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs font-mono text-muted-foreground bg-black/20 px-3 py-2 rounded-lg border border-white/5">
                    <Icon className={`w-3.5 h-3.5 ${color}`} /> {text}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ====== PHE VS FHE COMPARISON ====== */}
      <section className="w-full py-20 px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="max-w-4xl mx-auto">
          <motion.h2 variants={fadeUp} className="text-2xl font-display font-bold text-center mb-3">
            Cryptosystem Comparison
          </motion.h2>
          <motion.p variants={fadeUp} className="text-sm text-muted-foreground text-center mb-10">
            Two generations of homomorphic encryption, side by side.
          </motion.p>

          <motion.div variants={fadeUp} className="bg-white/[0.02] rounded-2xl border border-white/8 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="p-4 text-left text-muted-foreground font-normal text-xs uppercase tracking-wider">Feature</th>
                    <th className="p-4 text-center text-primary font-semibold bg-primary/[0.03]">
                      PHE (Paillier)
                    </th>
                    <th className="p-4 text-center text-accent font-semibold bg-accent/[0.03]">
                      FHE (BFV/CKKS)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { label: 'Encrypted Addition (⊕)', phe: true, fhe: true },
                    { label: 'Encrypted Multiplication (⊗)', phe: false, fhe: true },
                    { label: 'Noise Management', phe: false, fhe: 'warn' },
                    { label: 'Computational Overhead', phe: 'Low', fhe: 'Extreme (1000x+)' },
                    { label: 'Ideal Datasets', phe: 'Financial, Tallying', fhe: 'ML, Neural Nets' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-muted-foreground text-xs">{row.label}</td>
                      <td className="p-4 text-center bg-primary/[0.02]">
                        {row.phe === true ? <Check className="w-4 h-4 text-primary mx-auto" />
                          : row.phe === false ? <X className="w-4 h-4 text-red-500/40 mx-auto" />
                          : <span className="text-xs text-primary/70">{row.phe as string}</span>}
                      </td>
                      <td className="p-4 text-center bg-accent/[0.02]">
                        {row.fhe === true ? <Check className="w-4 h-4 text-accent mx-auto" />
                          : row.fhe === 'warn' ? <Check className="w-4 h-4 text-red-400 mx-auto" />
                          : <span className="text-xs text-accent/70">{row.fhe as string}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ====== PERFORMANCE ANALYTICS ====== */}
      <section className="w-full bg-white/[0.015] border-y border-white/5 py-20 px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/15">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">Performance Latency</h2>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-0.5">Why homomorphic encryption is computationally expensive</p>
            </div>
          </motion.div>
          
          <motion.div variants={fadeUp} className="bg-black/20 rounded-2xl border border-white/5 p-4 md:p-6">
            <div className="h-72 md:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 20% / 0.3)" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(220 15% 55%)" tick={{ fill: 'hsl(220 15% 55%)', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" orientation="left" stroke="hsl(220 15% 55%)" tick={{ fill: 'hsl(220 15% 55%)', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={customTooltip} cursor={{ fill: 'hsl(160 100% 45% / 0.03)' }} />
                  <Legend wrapperStyle={{ paddingTop: '16px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}/>
                  <Bar yAxisId="left" dataKey="Encryption" stackId="a" fill="hsl(160 100% 45%)" radius={[0, 0, 4, 4]} />
                  <Bar yAxisId="left" dataKey="Computation" stackId="a" fill="hsl(190 100% 50%)" />
                  <Bar yAxisId="left" dataKey="Decryption" stackId="a" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Plaintext Baseline', border: 'border-white/10', color: 'text-white', text: 'Raw operations execute on CPU registers at native clock speeds (μs). Data is fully exposed during processing.' },
              { title: 'PHE (Modular Math)', border: 'border-primary/25', color: 'text-primary', text: 'Slower due to modular exponentiation over massive >2048-bit numbers. Noticeable but practical latency.' },
              { title: 'FHE (Noise Mgmt)', border: 'border-accent/25', color: 'text-accent', text: 'Exponentially slower. Multiplication noise must be mitigated via Relinearization or Bootstrapping.' },
            ].map(({ title, border, color, text }, i) => (
              <div key={i} className={`bg-black/20 ${border} border p-5 rounded-xl hover:bg-black/30 transition-colors`}>
                <h3 className={`text-[13px] font-semibold ${color} mb-2`}>{title}</h3>
                <p className="text-[11px] text-muted-foreground font-mono leading-relaxed">{text}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ====== LIMITATIONS & FUTURE ====== */}
      <section className="w-full py-20 px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Limitations */}
          <motion.div variants={fadeUp} className="bg-red-500/[0.03] border border-red-500/15 rounded-2xl p-6 hover:border-red-500/25 transition-colors">
            <h3 className="text-base font-semibold text-red-400 flex items-center gap-2 mb-5 pb-4 border-b border-red-500/10">
              <AlertTriangle className="w-4 h-4" /> Limitations
            </h3>
            <ul className="space-y-4 text-xs font-mono text-muted-foreground">
              {[
                { label: 'Browser CPU Limits', text: '256-bit primes instead of 2048-bit for fluid browser rendering.' },
                { label: 'FHE Simulated', text: 'Algorithmic simulation for noise growth; not a real SEAL/OpenFHE binding.' },
                { label: 'Addition Only (PHE)', text: 'Paillier is strictly additive. Multiplication requires FHE schemes.' },
              ].map(({ label, text }, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-500/60 mt-0.5 shrink-0">•</span>
                  <div><strong className="text-red-300/80">{label}:</strong> {text}</div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Future */}
          <motion.div variants={fadeUp} className="bg-purple-500/[0.03] border border-purple-500/15 rounded-2xl p-6 hover:border-purple-500/25 transition-colors">
            <h3 className="text-base font-semibold text-purple-400 flex items-center gap-2 mb-5 pb-4 border-b border-purple-500/10">
              <FastForward className="w-4 h-4" /> Future Work
            </h3>
            <ul className="space-y-4 text-xs font-mono text-muted-foreground">
              {[
                { label: 'WASM SEAL', text: 'Compile Microsoft SEAL via Emscripten for real CKKS in-browser.' },
                { label: 'WebGPU Accel', text: 'Offload polynomial multiplications and RNS transformations.' },
                { label: 'Distributed Cloud', text: 'Real Express.js backend to physically isolate untrusted compute.' },
              ].map(({ label, text }, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-purple-400/60 mt-0.5 shrink-0">🚀</span>
                  <div><strong className="text-purple-300/80">{label}:</strong> {text}</div>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </section>

    </div>
  );
}
