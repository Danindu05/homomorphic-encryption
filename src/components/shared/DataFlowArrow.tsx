import { motion } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';

interface DataFlowArrowProps {
  direction?: 'left-to-right' | 'right-to-left';
  label: string;
  isEncrypted?: boolean;
}

export function DataFlowArrow({ direction = 'left-to-right', label, isEncrypted = true }: DataFlowArrowProps) {
  const isRtoL = direction === 'right-to-left';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`flex items-center justify-center gap-2 p-2 px-3 rounded-xl text-[10px] font-mono font-semibold w-full relative z-20
        ${isEncrypted 
          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
          : 'bg-white/5 border border-white/15 text-white/70'}`}
    >
      {isRtoL && <span className="text-[10px] opacity-50">←</span>}
      {isEncrypted ? <Lock className="w-3 h-3 shrink-0" /> : <Unlock className="w-3 h-3 shrink-0" />}
      <span className="tracking-wider truncate">{label}</span>
      {!isRtoL && <span className="text-[10px] opacity-50">→</span>}
    </motion.div>
  );
}
