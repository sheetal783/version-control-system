import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderGit2, Mail, Lock, User, UserPlus, AlertCircle, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const calculateStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, label: '', color: 'bg-gray-700/50' };
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score === 3 || score === 4) return { score, label: 'Fair', color: 'bg-yellow-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = useMemo(() => calculateStrength(password), [password]);

  const validate = () => {
    const errors = {};
    if (!name) {
      errors.name = 'Name is required';
    } else if (name.length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }

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
      // Backend expects username, email, password according to api
      await signup(name, email, password);
      // Wait a tick for premium feel
      setTimeout(() => navigate('/'), 400);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -30 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: 'spring', 
        damping: 25, 
        stiffness: 300,
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    },
    exit: { opacity: 0, scale: 0.95, y: 30, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0f1c]">
      {/* Premium Background Effects */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none opacity-50"></div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0,transparent_50%)] pointer-events-none"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="backdrop-blur-2xl bg-[#111827]/40 border border-white/10 p-8 sm:p-10 rounded-[2rem] shadow-[0_0_40px_rgba(147,51,234,0.15)] ring-1 ring-white/5">
          
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-10">
            <div className="h-16 w-16 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 mb-5 relative group">
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <FolderGit2 size={32} className="text-white relative z-10" strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Create account</h2>
            <p className="text-gray-400 mt-2 text-sm text-center">Join VCS and start collaborating today</p>
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
            {/* Name Field with Floating Label */}
            <motion.div variants={itemVariants} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <User className={`h-5 w-5 transition-colors duration-300 ${validationErrors.name ? 'text-red-400' : 'text-gray-500 group-focus-within:text-purple-400'}`} />
              </div>
              <input
                type="text"
                id="name"
                className={`w-full bg-[#1e293b]/50 peer placeholder-transparent border ${validationErrors.name ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 hover:border-white/20 focus:border-purple-500 focus:ring-purple-500/20'} rounded-xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:ring-4 transition-all duration-300`}
                placeholder="Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (validationErrors.name) setValidationErrors({...validationErrors, name: ''});
                  if (error) setError('');
                }}
              />
              <label 
                htmlFor="name" 
                className="absolute left-11 -top-2.5 text-xs text-purple-400 bg-[#0a0f1c] px-1 transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-purple-400 peer-focus:bg-[#0a0f1c] cursor-text pointer-events-none rounded-sm"
              >
                Full Name
              </label>
              <AnimatePresence>
                {validationErrors.name && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5 pl-2">
                    {validationErrors.name}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Email Field with Floating Label */}
            <motion.div variants={itemVariants} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Mail className={`h-5 w-5 transition-colors duration-300 ${validationErrors.email ? 'text-red-400' : 'text-gray-500 group-focus-within:text-purple-400'}`} />
              </div>
              <input
                type="email"
                id="email"
                className={`w-full bg-[#1e293b]/50 peer placeholder-transparent border ${validationErrors.email ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 hover:border-white/20 focus:border-purple-500 focus:ring-purple-500/20'} rounded-xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:ring-4 transition-all duration-300`}
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
                className="absolute left-11 -top-2.5 text-xs text-purple-400 bg-[#0a0f1c] px-1 transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-purple-400 peer-focus:bg-[#0a0f1c] cursor-text pointer-events-none rounded-sm"
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
                <Lock className={`h-5 w-5 transition-colors duration-300 ${validationErrors.password ? 'text-red-400' : 'text-gray-500 group-focus-within:text-purple-400'}`} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className={`w-full bg-[#1e293b]/50 peer placeholder-transparent border ${validationErrors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 hover:border-white/20 focus:border-purple-500 focus:ring-purple-500/20'} rounded-xl py-3.5 pl-11 pr-12 text-white focus:outline-none focus:ring-4 transition-all duration-300`}
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
                className="absolute left-11 -top-2.5 text-xs text-purple-400 bg-[#0a0f1c] px-1 transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-purple-400 peer-focus:bg-[#0a0f1c] cursor-text pointer-events-none rounded-sm"
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
              
              {/* Password Strength Indicator */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 flex gap-1 h-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div 
                      key={level} 
                      className={`h-full flex-1 rounded-full transition-colors duration-500 ${password.length > 0 && level <= passwordStrength.score ? passwordStrength.color : 'bg-gray-700/50'}`}
                    ></div>
                  ))}
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 w-12 text-right">
                  {password.length > 0 ? passwordStrength.label : ''}
                </span>
              </div>

              <AnimatePresence>
                {validationErrors.password && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5 pl-2">
                    {validationErrors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl py-3.5 font-medium shadow-[0_4px_20px_rgba(147,51,234,0.4)] transition-all duration-300 mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed border border-white/10"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
                  </>
                )}
              </span>
            </motion.button>
          </form>

          <motion.p variants={itemVariants} className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors relative after:content-[''] after:absolute after:-bottom-0.5 after:left-0 after:w-full after:h-[1px] after:bg-purple-400 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left">
              Sign in instead
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
