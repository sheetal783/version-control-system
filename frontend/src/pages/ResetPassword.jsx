import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }
        if (password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);
        setError('');

        try {
            await api.post(`/user/reset-password/${token}`, { password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired token. Please request a new one.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0f1c]">
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-[420px] relative z-10"
            >
                <div className="backdrop-blur-2xl bg-[#111827]/40 border border-white/10 p-8 rounded-[2rem] shadow-2xl">
                    <div className="mb-8 flex flex-col items-center">
                        <div className="h-16 w-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-4">
                            <Lock className="text-indigo-400" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Reset Password</h2>
                        <p className="text-gray-400 mt-2 text-sm text-center">
                            Please enter your new password below.
                        </p>
                    </div>

                    {success ? (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm flex flex-col items-center gap-3">
                            <CheckCircle2 size={32} />
                            <p className="font-medium text-center">Password reset successful!<br/>Redirecting to login...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-start gap-3 text-sm">
                                    <AlertCircle size={18} className="shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full bg-[#1e293b]/50 border border-white/10 focus:border-indigo-500 rounded-xl py-3.5 pl-12 pr-12 text-white focus:outline-none transition-all"
                                    placeholder="New Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-[#1e293b]/50 border border-white/10 focus:border-indigo-500 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none transition-all"
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3.5 font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
