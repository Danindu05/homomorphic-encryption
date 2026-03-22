import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Shield, Cpu, Activity } from 'lucide-react';

export function AppLayout() {
  return (
    <div className="min-h-screen grid-bg flex flex-col text-foreground overflow-x-hidden selection:bg-primary/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b cyber-border glass-strong px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 w-1/3">
          <div className="p-2 rounded-md bg-primary/10 border cyber-border">
            <Shield className="w-6 h-6 text-primary animate-pulse-glow" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-wider text-glow-primary uppercase">
              HE<span className="text-primary">.</span>Compute
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
              Homomorphic Encryption 
            </p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center justify-center gap-2 bg-black/40 p-1.5 rounded-xl border cyber-border shadow-2xl backdrop-blur-md">
          <NavLink
            to="/phe"
            className={({ isActive }) =>
              `px-5 py-2 rounded-lg font-mono text-sm uppercase tracking-wider transition-all duration-300 ${
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/50 shadow-[0_0_20px_rgba(0,255,255,0.2)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent'
              }`
            }
          >
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4" /> PHE Mode
            </div>
          </NavLink>
          <NavLink
            to="/fhe"
            className={({ isActive }) =>
              `px-5 py-2 rounded-lg font-mono text-sm uppercase tracking-wider transition-all duration-300 ${
                isActive
                  ? 'bg-accent/20 text-accent border border-accent/50 shadow-[0_0_20px_rgba(0,255,0,0.2)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent'
              }`
            }
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" /> FHE Mode
            </div>
          </NavLink>
          <NavLink
            to="/use-cases"
            className={({ isActive }) =>
              `px-5 py-2 rounded-lg font-mono text-sm uppercase tracking-wider transition-all duration-300 ${
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/50 shadow-[0_0_20px_rgba(0,255,255,0.2)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent'
              }`
            }
          >
            Demo Gallery
          </NavLink>
        </nav>

        <div className="w-1/3 flex justify-end">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-mono text-green-400 font-medium">SYSTEM SECURE</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col items-center">
        <Outlet />
      </main>
    </div>
  );
}
