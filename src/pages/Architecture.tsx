import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Server, Lock, Unlock, Zap, Eye, EyeOff, Key, Database, Activity, AlertTriangle, AlertCircle } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

export default function Architecture() {
  return (
    <div className="w-full flex flex-col items-center overflow-hidden">

      {/* Header */}
      <section className="w-full max-w-5xl px-4 pt-12 pb-16 text-center">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-display font-black mb-4 tracking-tight">
            System & Threat Models
          </motion.h1>
          <motion.p variants={fadeUp} className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Understanding the foundational security architecture of outsourced computation. Homomorphic encryption redefines trust boundaries.
          </motion.p>
        </motion.div>
      </section>

      {/* Before vs After */}
      <section className="w-full bg-white/[0.015] border-y border-white/5 py-16 px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-5xl mx-auto">
          <motion.h2 variants={fadeUp} className="text-2xl font-display font-bold text-center mb-3">Security Architecture Comparison</motion.h2>
          <motion.p variants={fadeUp} className="text-sm text-muted-foreground text-center mb-10">How traditional and homomorphic encryption handle data during computation.</motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-red-500/15 bg-red-500/[0.03] p-6 relative overflow-hidden hover:border-red-500/25 transition-colors">
              <div className="absolute top-0 right-0 px-3 py-1 bg-red-500/10 text-red-400 text-[9px] font-mono font-semibold uppercase rounded-bl-xl tracking-wider">Traditional ✗</div>
              <h3 className="text-base font-semibold text-red-400 flex items-center gap-2 mb-5">
                <Unlock className="w-4 h-4" /> Data Exfiltration Risk
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                  <Shield className="w-6 h-6 text-blue-400 shrink-0" />
                  <div>
                    <p className="text-[11px] font-mono text-muted-foreground">Client Device (Trusted)</p>
                    <p className="text-[10px] text-emerald-400 font-mono mt-0.5">Data: "Salary: $50,000" <Unlock className="inline w-3 h-3 text-red-400 ml-1"/></p>
                  </div>
                </div>
                <div className="flex justify-center"><Zap className="w-3 h-3 text-red-500/50" /></div>
                <div className="flex items-center gap-3 bg-red-500/[0.06] p-3 rounded-xl border border-red-500/20">
                  <Server className="w-6 h-6 text-red-400 shrink-0" />
                  <div>
                    <p className="text-[11px] font-mono text-red-300">Cloud Server (Compromised)</p>
                    <p className="text-[10px] text-red-400 font-mono mt-0.5">Must decrypt to compute:</p>
                    <div className="mt-1 text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded-lg inline-flex items-center gap-1">
                      "Salary: $50,000" <Eye className="w-3 h-3 text-red-500"/>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-5 pt-4 border-t border-red-500/10 text-xs text-muted-foreground leading-relaxed">
                The server <strong className="text-red-300">must decrypt</strong> data to perform operations. If breached, raw plaintext is fully exposed.
              </p>
            </motion.div>

            {/* Homomorphic */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-primary/15 bg-primary/[0.03] p-6 relative overflow-hidden hover:border-primary/25 transition-colors">
              <div className="absolute top-0 right-0 px-3 py-1 bg-primary/10 text-primary text-[9px] font-mono font-semibold uppercase rounded-bl-xl tracking-wider">Homomorphic ✓</div>
              <h3 className="text-base font-semibold text-primary flex items-center gap-2 mb-5">
                <Lock className="w-4 h-4" /> Zero-Knowledge Compute
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                  <Shield className="w-6 h-6 text-blue-400 shrink-0" />
                  <div>
                    <p className="text-[11px] font-mono text-muted-foreground">Client Device (Trusted)</p>
                    <p className="text-[10px] text-primary font-mono mt-0.5">Data: E("Salary") = 0x8F2A... <Lock className="inline w-3 h-3 ml-1"/></p>
                  </div>
                </div>
                <div className="flex justify-center"><Zap className="w-3 h-3 text-primary/50" /></div>
                <div className="flex items-center gap-3 bg-primary/[0.06] p-3 rounded-xl border border-primary/20">
                  <Server className="w-6 h-6 text-orange-400 shrink-0" />
                  <div>
                    <p className="text-[11px] font-mono text-orange-300">Cloud Server (Untrusted)</p>
                    <p className="text-[10px] text-orange-400 font-mono mt-0.5">Computes blindly on ciphertexts:</p>
                    <div className="mt-1 text-[10px] text-primary font-mono bg-primary/10 px-2 py-1 rounded-lg inline-flex items-center gap-1">
                      0x8F2A + 0x1B4... <EyeOff className="w-3 h-3 text-primary"/>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-5 pt-4 border-t border-primary/10 text-xs text-muted-foreground leading-relaxed">
                The server operates on encrypted polynomials. It sees only mathematically indistinguishable random noise.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* System & Threat Models */}
      <section className="w-full py-16 px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* System Model */}
          <motion.div variants={fadeUp} className="bg-white/[0.02] p-6 rounded-2xl border border-blue-500/15 hover:border-blue-500/25 transition-colors">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/15">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-blue-400">System Model</h2>
                <p className="text-[9px] text-blue-400/50 font-mono uppercase tracking-wider">Entity Roles & Trust Boundaries</p>
              </div>
            </div>
            <ul className="space-y-3">
              {[
                { color: 'border-blue-400/40', title: 'Data Owner (Trusted Client)', titleColor: 'text-blue-300', text: 'Generates the KeyGen tuple (pk, sk, evk). Holds the Plaintext Domain. Decrypts ciphertext results.' },
                { color: 'border-orange-400/40', title: 'Compute Node (Honest-but-Curious)', titleColor: 'text-orange-300', text: 'Executes Eval(evk, F, c1...cn). Adheres to protocol but attempts to glean plaintext from transcript.' },
                { color: 'border-primary/40', title: 'Zero-Knowledge Guarantee', titleColor: 'text-primary', text: 'Guarantees the server gains zero entropy about the underlying plaintext during execution.' },
              ].map((item, i) => (
                <li key={i} className={`bg-black/20 p-4 rounded-xl border-l-2 ${item.color}`}>
                  <strong className={`${item.titleColor} text-xs block mb-1`}>{item.title}</strong>
                  <p className="text-xs font-mono text-muted-foreground leading-relaxed">{item.text}</p>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Threat Model */}
          <motion.div variants={fadeUp} className="bg-white/[0.02] p-6 rounded-2xl border border-red-500/15 hover:border-red-500/25 transition-colors">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/15">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-red-400">Threat Model</h2>
                <p className="text-[9px] text-red-400/50 font-mono uppercase tracking-wider">Attack Vectors & Mitigations</p>
              </div>
            </div>
            <ul className="space-y-3">
              {[
                { icon: Eye, title: 'Transcript Inspection', text: 'Server admin analyzes ciphertexts in RAM.', mitigation: 'Ciphertexts are semantically secure — statistically indistinguishable from uniform randomness.' },
                { icon: Database, title: 'Database Compromise', text: 'Hacker breaches cloud and dumps user records.', mitigation: 'All records stored as HE ciphertexts. The dump is useless without the private key.' },
                { icon: EyeOff, title: 'Intercepted Traffic', text: 'MITM intercepts computed results.', mitigation: 'Returning data is evaluated ciphertext E(f(m)). Requires private key to decrypt.' },
              ].map(({ icon: Icon, title, text, mitigation }, i) => (
                <li key={i} className="bg-red-500/[0.03] p-4 rounded-xl border border-red-500/10">
                  <strong className="text-red-300 text-xs flex items-center gap-2 mb-1.5">
                    <Icon className="w-3.5 h-3.5" /> {title}
                  </strong>
                  <p className="text-xs font-mono text-muted-foreground mb-2">{text}</p>
                  <div className="text-[10px] text-primary font-mono bg-primary/[0.06] p-2 rounded-lg border border-primary/10">
                    <strong>Mitigated:</strong> {mitigation}
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </section>

      {/* Academic Limitations */}
      <section className="w-full bg-white/[0.015] border-y border-white/5 py-16 px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/15">
              <AlertCircle className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-purple-400">Academic Limitations</h2>
              <p className="text-[9px] text-purple-400/50 font-mono uppercase tracking-wider">Presentation & Deployment Constraints</p>
            </div>
          </motion.div>
          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'PHE Capabilities', text: 'Paillier supports strictly additive homomorphism. Encrypted multiplications require complex interactivity protocols.' },
              { title: 'FHE Circuit Simulation', text: 'The FHE mode uses an algorithmic simulation to demonstrate noise accumulation, not real C++/WASM bindings.' },
              { title: 'Computational Cost', text: 'True multi-depth FHE demands extreme RAM and induces latency orders of magnitude higher than plaintext.' },
              { title: 'Reduced Key Sizes', text: 'Bit-lengths are reduced for fluid 60fps browser performance — not cryptographically secure for production.' },
            ].map(({ title, text }, i) => (
              <div key={i} className="bg-black/20 p-4 rounded-xl border border-purple-500/10 hover:border-purple-500/20 transition-colors">
                <strong className="text-purple-300 text-xs block mb-1.5">{title}</strong>
                <p className="text-xs font-mono text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

    </div>
  );
}
