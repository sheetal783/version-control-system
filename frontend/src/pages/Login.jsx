import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderGit2, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Invalid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validate()) return;
    
    setLoading(true);
    
    try {
      await login(email, password);
      // Let animation finish gracefully, wait a tick to feel premium
      setTimeout(() => navigate('/'), 300);
    } catch (err) {
      // Show error immediately to user
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: 'spring', 
        damping: 25, 
        stiffness: 300,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0f1c]">
      {/* Premium Background Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none opacity-60 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none opacity-50"></div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0,transparent_50%)] pointer-events-none"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="backdrop-blur-2xl bg-[#111827]/40 border border-white/10 p-8 sm:p-10 rounded-[2rem] shadow-[0_0_40px_rgba(37,99,235,0.15)] ring-1 ring-white/5">
          
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-10">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-5 relative group">
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <FolderGit2 size={32} className="text-white relative z-10" strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back</h2>
            <p className="text-gray-400 mt-2 text-sm text-center">Enter your credentials to access your workspace</p>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, mb: 0 }}
                animate={{ opacity: 1, height: 'auto', mb: 24 }}
                exit={{ opacity: 0, height: 0, mb: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-start gap-3 backdrop-blur-md">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field with Floating Label */}
            <motion.div variants={itemVariants} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Mail className={`h-5 w-5 transition-colors duration-300 ${validationErrors.email ? 'text-red-400' : 'text-gray-500 group-focus-within:text-blue-400'}`} />
              </div>
              <input
                type="email"
                id="email"
                className={`w-full bg-[#1e293b]/50 peer placeholder-transparent border ${validationErrors.email ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 hover:border-white/20 focus:border-blue-500 focus:ring-blue-500/20'} rounded-xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:ring-4 transition-all duration-300`}
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationErrors.email) setValidationErrors({...validationErrors, email: ''});
                  if (error) setError('');
                }}
              />
              <label 
                htmlFor="email" 
                className="absolute left-11 -top-2.5 text-xs text-blue-400 bg-[#0a0f1c] px-1 transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-400 peer-focus:bg-[#0a0f1c] cursor-text pointer-events-none rounded-sm"
              >
                Email Address
              </label>
              <AnimatePresence>
                {validationErrors.email && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5 pl-2">
                    {validationErrors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password Field with Floating Label */}
            <motion.div variants={itemVariants} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Lock className={`h-5 w-5 transition-colors duration-300 ${validationErrors.password ? 'text-red-400' : 'text-gray-500 group-focus-within:text-blue-400'}`} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className={`w-full bg-[#1e293b]/50 peer placeholder-transparent border ${validationErrors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 hover:border-white/20 focus:border-blue-500 focus:ring-blue-500/20'} rounded-xl py-3.5 pl-11 pr-12 text-white focus:outline-none focus:ring-4 transition-all duration-300`}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationErrors.password) setValidationErrors({...validationErrors, password: ''});
                  if (error) setError('');
                }}
              />
              <label 
                htmlFor="password" 
                className="absolute left-11 -top-2.5 text-xs text-blue-400 bg-[#0a0f1c] px-1 transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-400 peer-focus:bg-[#0a0f1c] cursor-text pointer-events-none rounded-sm"
              >
                Password
              </label>
              
              <button 
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white focus:outline-none transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              
              <AnimatePresence>
                {validationErrors.password && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5 pl-2">
                    {validationErrors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="rounded border-gray-600 bg-gray-700/50 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0 transition-colors w-4 h-4 cursor-pointer" />
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">Forgot password?</Link>
            </motion.div>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl py-3.5 font-medium shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all duration-300 mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed border border-white/10"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </motion.button>
          </form>

          <motion.p variants={itemVariants} className="mt-8 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors relative after:content-[''] after:absolute after:-bottom-0.5 after:left-0 after:w-full after:h-[1px] after:bg-blue-400 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left">
              Create one now
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
