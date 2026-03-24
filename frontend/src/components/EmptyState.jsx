import { motion } from 'framer-motion';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({ title = "No items found", message = "Get started by creating your first item.", icon: Icon = PackageOpen, action }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full py-16 px-6 flex flex-col items-center justify-center text-center backdrop-blur-md bg-white/[0.02] border border-white/5 border-dashed rounded-3xl group transition-all duration-300 hover:bg-white/[0.03] hover:border-white/10"
    >
      <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-5 border border-blue-500/20 text-blue-400 shadow-inner group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 ease-out">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-gray-400 max-w-sm mx-auto mb-6 text-sm leading-relaxed">{message}</p>
      {action && <div>{action}</div>}
    </motion.div>
  );
};

export default EmptyState;
