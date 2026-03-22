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
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`flex flex-col items-center justify-center p-2 px-4 rounded-md border text-xs font-mono font-bold w-full relative z-20 group
        ${isEncrypted 
          ? 'bg-green-500/20 border-green-500/70 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]' 
          : 'bg-white/10 border-white/30 text-white flex-row gap-2'}`}
      style={{
        boxShadow: isEncrypted ? '0 0 15px rgba(34,197,94,0.2), inset 0 0 10px rgba(34,197,94,0.1)' : 'none'
      }}
    >
      <div className="flex items-center gap-2">
        {isEncrypted ? <Lock className="w-3.5 h-3.5 text-green-400" /> : <Unlock className="w-3 h-3 text-gray-300" />}
        <span className="tracking-wider">{label}</span>
      </div>
      
      {/* Absolute Arrow Indicators for directional logic */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
         {isRtoL ? '⟵' : '⟶'}
      </div>
    </motion.div>
  );
}
