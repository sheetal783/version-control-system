import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, GitFork, Clock, Plus, BookOpen, Activity, Lock, Search, FolderGit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRepositories } from '../context/RepositoriesContext';
import ErrorState from '../components/ErrorState';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { allRepos, myRepos, listLoading, listError, fetchAllRepos, fetchMyRepos } = useRepositories();

  const [trendingRepos, setTrendingRepos] = useState([]);
  
  // Custom asymmetric mapping strategy
  const getAsymmetricClass = (index) => {
    // This creates an organic, staggered grid look on large screens
    const pattern = [
      'col-span-1 md:col-span-2 lg:col-span-2', 
      'col-span-1', 
      'col-span-1', 
      'col-span-1 md:col-span-2 lg:col-span-2',
      'col-span-1 lg:col-span-1',
      'col-span-1 lg:col-span-1 lg:row-span-2', 
      'col-span-1 md:col-span-2 lg:col-span-2'
    ];
    return pattern[index % pattern.length];
  };

  useEffect(() => {
    fetchAllRepos();
    fetchMyRepos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    const trending = [...(allRepos || [])]
      .sort((a, b) => ((b?.issues?.length || 0) - (a?.issues?.length || 0)))
      .slice(0, 5);
    setTrendingRepos(trending);
  }, [allRepos]);

  const containerAnimations = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemAnimations = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const SkeletonCard = ({ className }) => (
    <div className={`backdrop-blur-xl bg-[#1e293b]/30 border border-white/5 rounded-2xl p-6 animate-pulse ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/10"></div>
        <div className="h-6 bg-white/10 rounded-md w-1/3"></div>
      </div>
      <div className="space-y-3 mb-6">
        <div className="h-4 bg-white/10 rounded-md w-full"></div>
        <div className="h-4 bg-white/10 rounded-md w-4/5"></div>
        <div className="h-4 bg-white/5 rounded-md w-2/3"></div>
      </div>
      <div className="flex gap-4">
        <div className="h-5 bg-white/10 rounded-md w-12"></div>
        <div className="h-5 bg-white/10 rounded-md w-12"></div>
      </div>
    </div>
  );

  const RepoCard = ({ repo, index, showVisibility }) => (
    <motion.div variants={itemAnimations} className={getAsymmetricClass(index)}>
      <Link 
        to={`/repo/${repo._id || repo.id || '1'}`}
        className="block h-full relative group overflow-hidden"
      >
        <motion.div 
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="h-full bg-black/20 backdrop-blur-xl border border-white/5 hover:border-blue-500/30 rounded-2xl p-6 shadow-lg hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] transition-all duration-300 z-10 relative flex flex-col"
        >
          {/* Subtle gradient follow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
          
          <div className="flex justify-between items-start mb-5 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                <BookOpen size={20} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate max-w-[180px] sm:max-w-xs md:max-w-sm">
                  {repo.name || 'Unnamed Repository'}
                </h3>
                {showVisibility && (
                  <span className="flex items-center gap-1 mt-0.5 text-xs text-blue-300/70 font-medium">
                    {repo?.visibility ? <Lock size={12} /> : <BookOpen size={12} />}
                    {repo?.visibility ? 'Private' : 'Public'}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm mb-6 line-clamp-2 md:line-clamp-3 leading-relaxed flex-1 relative z-10">
            {repo.description || 'No description provided for this repository. Add a description to help others understand its purpose.'}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mt-auto pt-4 border-t border-white/5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 hover:text-yellow-400 transition-colors">
                <Star size={16} className={repo.stars?.length > 0 ? "fill-yellow-500/20 text-yellow-500" : ""} /> 
                <span className="font-medium text-gray-400">{repo.stars?.length || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                <GitFork size={16} /> 
                <span className="font-medium text-gray-400">{repo.forks?.length || 0}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-white/5">
              <Clock size={12} className="text-blue-400/70" /> 
              <span className="truncate max-w-[100px] sm:max-w-none">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );

  return (
    <div className="h-full pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 px-2">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-400 mt-1.5 font-medium flex items-center gap-2">
            <Activity size={16} className="text-blue-400" />
            Welcome back to your workspace
          </p>
        </motion.div>
        
        <motion.button 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all flex items-center gap-2 border border-blue-400/20"
        onClick={() => navigate('/repos')}
        type="button"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>New Repository</span>
        </motion.button>
      </div>

      {listError ? (
        <ErrorState
          title="Failed to load dashboard"
          message={listError}
          onRetry={() => {
            fetchAllRepos();
            fetchMyRepos();
          }}
        />
      ) : (
      <div className="space-y-12">
        {/* Your Repositories Section */}
        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FolderGit2 className="text-blue-400" size={22} />
              Your Repositories
            </h2>
            <Link to="/repos" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
              View all
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 auto-rows-fr">
            <AnimatePresence mode="popLayout">
              {listLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={`skeleton-your-${i}`} className={getAsymmetricClass(i)} />
                ))
              ) : myRepos.length > 0 ? (
                <motion.div 
                  variants={containerAnimations}
                  initial="hidden"
                  animate="show"
                  className="contents"
                >
                  {myRepos.map((repo, i) => (
                    <RepoCard key={repo._id || i} repo={repo} index={i} showVisibility={true} />
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="col-span-full backdrop-blur-xl bg-[#1e293b]/30 border border-white/5 border-dashed rounded-3xl p-12 text-center flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <FolderGit2 size={32} className="text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No repositories yet</h3>
                  <p className="text-gray-400 mb-6 max-w-md">You haven't created or joined any repositories. Create your first project to get started.</p>
                  <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2">
                    <Plus size={18} />
                    Create Repository
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Trending Repositories Section */}
        <section>
          <div className="flex items-center justify-between mb-6 px-2 pt-6 border-t border-white/5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="text-purple-400" size={22} />
              Trending Repositories
            </h2>
            <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
              <Search size={18} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 auto-rows-fr">
            <AnimatePresence mode="popLayout">
              {listLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={`skeleton-trend-${i}`} className={getAsymmetricClass(i+3)} />
                ))
              ) : trendingRepos.length > 0 ? (
                <motion.div 
                  variants={containerAnimations}
                  initial="hidden"
                  animate="show"
                  className="contents"
                >
                  {trendingRepos.map((repo, i) => (
                    <RepoCard key={repo._id || `trend-${i}`} repo={repo} index={i+3} showVisibility={false} />
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </section>
      </div>
      )}
    </div>
  );
};

export default Dashboard;
