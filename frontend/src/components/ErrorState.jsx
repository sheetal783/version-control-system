import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

const ErrorState = ({ title = "Something went wrong", message = "We encountered an error loading this data.", onRetry }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full py-12 px-6 flex flex-col items-center justify-center text-center bg-red-500/[0.02] border border-red-500/10 rounded-3xl"
    >
      <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] relative animate-pulse">
        <AlertTriangle size={28} className="relative z-10" />
      </div>
      <h3 className="text-lg font-bold text-red-200 mb-2">{title}</h3>
      <p className="text-red-400/80 text-sm max-w-sm mx-auto mb-6">{message}</p>
      {onRetry && (
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/20"
        >
          <RefreshCcw size={14} /> Try Again
        </motion.button>
      )}
    </motion.div>
  );
};

export default ErrorState;
