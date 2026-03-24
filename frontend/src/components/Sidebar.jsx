import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, FolderGit2, CircleDot, UserCircle, LogOut, Settings, X, FolderGit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { logout } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Repositories', path: '/repos', icon: FolderGit2 },
    { name: 'Issues', path: '/issues', icon: CircleDot },
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: '-100%', opacity: 0 },
  };

  // We only animate the x transition if we are on mobile, 
  // on desktop we want it always visible via CSS translations or we ignore variants.
  
  return (
    <motion.aside
      initial={false}
      animate={isOpen ? 'open' : 'closed'}
      variants={sidebarVariants}
      transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
      // Responsive classes: mobile relies on animate state, md+ ignores animate state and is fixed
      className={`fixed md:relative md:!transform-none md:!opacity-100 md:!translate-x-0 ${!isOpen ? 'max-md:-translate-x-full' : ''} z-40 h-full w-64 glass-panel border-r border-white/5 flex flex-col shadow-[0_0_30px_rgba(59,130,246,0.1)] rounded-none md:rounded-tr-2xl md:rounded-br-2xl md:my-0 backdrop-blur-xl bg-surface/50`}
    >
      <div className="px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
            <FolderGit size={22} className="text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-textDefault to-textMuted bg-clip-text text-transparent tracking-tight">VCS</span>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-lg"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5">
        <p className="px-4 text-xs font-semibold text-gray-500 tracking-wider uppercase mb-4 mt-2">Main Menu</p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${
                isActive 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeSidebarTab" 
                  className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-500/5 border border-blue-500/20 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon size={20} className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'group-hover:text-blue-400'}`} />
              <span className="relative z-10 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 mt-auto border-t border-white/5">
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all group">
            <Settings size={18} className="group-hover:rotate-45 transition-transform duration-300" />
            Settings
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
