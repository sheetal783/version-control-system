import { BellIcon, SearchIcon, MenuIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = ({ toggleSidebar }) => {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-panel mx-4 md:mx-6 lg:mx-8 mt-4 md:mt-6 px-4 py-3 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.1)] z-10 sticky top-4 md:top-6"
    >
      {/* Left side (Logo on mobile, empty on desktop since sidebar has it) */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
        >
          <MenuIcon size={22} />
        </button>
        <div className="md:hidden font-bold text-xl bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent tracking-tight">
          VCS
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-2xl px-4 md:px-12 flex justify-center hidden sm:flex">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
          </div>
          <input
            type="text"
            className="w-full bg-black/20 backdrop-blur-xl border border-white/5 focus:border-blue-500/50 hover:border-white/20 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-500 shadow-inner"
            placeholder="Search repositories, issues, users..."
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="hidden md:inline-block px-2 py-1 text-xs font-mono font-medium text-gray-500 bg-white/5 rounded-md border border-white/5 drop-shadow-sm">Ctrl+K</kbd>
          </div>
        </div>
      </div>

      {/* Right side: User avatar and notifications */}
      <div className="flex items-center gap-4">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
        >
          <BellIcon size={20} />
          <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 border-2 border-background"></span>
          </span>
        </motion.button>
        
        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 p-[2px] shadow-lg shadow-blue-500/20 cursor-pointer overflow-hidden group">
          <img 
            src={`https://ui-avatars.com/api/?name=User&background=1e293b&color=3b82f6&bold=true`} 
            alt="User Avatar"
            className="w-full h-full rounded-[10px] object-cover bg-surface group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
