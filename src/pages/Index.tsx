import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Cpu, Activity, Zap, ArrowRight, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Plaintext',
    Encryption: 0.1,
    Computation: 0.05,
    Decryption: 0,
  },
  {
    name: 'Paillier (PHE)',
    Encryption: 12.5,
    Computation: 2.1,
    Decryption: 4.8,
  },
  {
    name: 'BFV/CKKS (FHE)',
    Encryption: 45.2,
    Computation: 850.4,
    Decryption: 25.1,
  },
];

interface TooltipEntry { color?: string; name?: string; value?: number | string; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const customTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border cyber-border p-3 rounded-lg shadow-xl font-mono text-xs">
        <p className="text-foreground font-bold mb-2">{label}</p>
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
    <div className="w-full max-w-6xl flex flex-col items-center pt-10 pb-20 space-y-16 px-4">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl relative"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10"></div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-xs mb-6 uppercase tracking-widest">
          <Shield className="w-3 h-3" /> Secure Compute Engine Online
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-bold text-glow-primary mb-6 leading-tight">
          Compute Without <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Compromise</span>
        </h1>
        <p className="text-lg text-muted-foreground font-mono leading-relaxed mb-8">
          A visual exploration of Homomorphic Encryption. Encrypt your data locally, process it securely on the server, and decrypt the results without ever exposing the underlying information.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/phe" className="btn-cyber flex items-center gap-2">
            Explore PHE <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/use-cases" className="btn-cyber-accent flex items-center gap-2">
            View Live Demos <Zap className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {/* Grid Features */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
      >
        <Link to="/phe" className="glass p-8 rounded-2xl cyber-border group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <Cpu className="w-12 h-12 text-primary mb-6" />
          <h2 className="text-2xl font-display font-bold mb-3 text-foreground group-hover:text-primary transition-colors">Partial Homomorphic (PHE)</h2>
          <p className="text-muted-foreground text-sm font-mono leading-relaxed">
            Utilizing the Paillier cryptosystem. Supports only addition operations on ciphertexts. Extremely fast and lightweight.
          </p>
        </Link>
        <Link to="/fhe" className="glass p-8 rounded-2xl cyber-border-accent group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <Activity className="w-12 h-12 text-accent mb-6" />
          <h2 className="text-2xl font-display font-bold mb-3 text-foreground group-hover:text-accent transition-colors">Fully Homomorphic (FHE)</h2>
          <p className="text-muted-foreground text-sm font-mono leading-relaxed">
            Utilizing simulated BFV/CKKS schemes. Supports both addition and multiplication, allowing arbitrary logic at the cost of immense computational overhead.
          </p>
        </Link>
      </motion.div>

      {/* Analytics */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="w-full glass p-8 rounded-2xl cyber-border border-primary/30 relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10"></div>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Performance Architecture</h2>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mt-1">Latency Cost Analysis (Simulated ms/op)</p>
          </div>
        </div>
        
        <div className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
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
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/40 border border-primary/20 p-4 rounded-lg">
            <h3 className="text-sm font-bold text-primary mb-1">Plaintext</h3>
            <p className="text-xs text-muted-foreground font-mono">Operations run in microseconds. No security during computation phase.</p>
          </div>
          <div className="bg-black/40 border border-primary/20 p-4 rounded-lg">
            <h3 className="text-sm font-bold text-primary mb-1">PHE Overhead</h3>
            <p className="text-xs text-muted-foreground font-mono">100-1000x slower. Highly practical for simple aggregations like secure voting.</p>
          </div>
          <div className="bg-black/40 border border-accent/20 p-4 rounded-lg">
            <h3 className="text-sm font-bold text-accent mb-1">FHE Overhead</h3>
            <p className="text-xs text-muted-foreground font-mono">1M+x slower. Noise grows exponentially during multiplication, requiring heavy relinearization.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
