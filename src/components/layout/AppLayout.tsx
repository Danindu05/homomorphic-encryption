import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Shield, Cpu, Activity, Zap, BookOpen } from 'lucide-react';

const navItems = [
  { to: '/architecture', label: 'Threat Models', icon: Shield, color: 'blue' },
  { to: '/phe', label: 'PHE Mode', icon: Cpu, color: 'primary' },
  { to: '/fhe', label: 'FHE Mode', icon: Activity, color: 'accent' },
  { to: '/use-cases', label: 'Demo Gallery', icon: Zap, color: 'primary' },
];

const colorMap: Record<string, { active: string; hover: string }> = {
  blue: {
    active: 'bg-blue-500/15 text-blue-400 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    hover: 'hover:text-blue-300 hover:bg-blue-500/8',
  },
  primary: {
    active: 'bg-primary/15 text-primary border-primary/40 shadow-[0_0_20px_hsl(160_100%_45%/0.15)]',
    hover: 'hover:text-primary hover:bg-primary/8',
  },
  accent: {
    active: 'bg-accent/15 text-accent border-accent/40 shadow-[0_0_20px_hsl(190_100%_50%/0.15)]',
    hover: 'hover:text-accent hover:bg-accent/8',
  },
};

export function AppLayout() {
  return (
    <div className="min-h-screen grid-bg flex flex-col text-foreground overflow-x-hidden selection:bg-primary/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full glass-strong px-4 md:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/15 group-hover:border-primary/30 transition-all duration-300">
            <Shield className="w-5 h-5 text-primary animate-pulse-glow" />
          </div>
          <div>
            <h1 className="text-lg font-display tracking-wider text-glow-primary uppercase leading-none">
              HE<span className="text-primary">.</span>Compute
            </h1>
            <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-mono mt-0.5">
              Homomorphic Encryption
            </p>
          </div>
        </Link>
        
        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-black/30 p-1 rounded-2xl border border-white/5">
          {navItems.map(({ to, label, icon: Icon, color }) => {
            const colors = colorMap[color];
            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-wider transition-all duration-300 border ${
                    isActive
                      ? colors.active
                      : `text-muted-foreground ${colors.hover} border-transparent`
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Status badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-[10px] font-mono text-emerald-400 tracking-wider uppercase">Secure</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-6 text-center">
        <p className="text-[10px] text-muted-foreground font-mono tracking-wider">
          Built for academic research and presentation purposes &middot; React &middot; TypeScript &middot; Tailwind CSS
        </p>
      </footer>
    </div>
  );
}
