import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, MailCheck, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await api.post('/user/forgot-password', { email });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0f1c]">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-[420px] relative z-10"
            >
                <div className="backdrop-blur-2xl bg-[#111827]/40 border border-white/10 p-8 rounded-[2rem] shadow-2xl">
                    <div className="mb-8 flex flex-col items-center">
                        <div className="h-16 w-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                            <MailCheck className="text-blue-400" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Forgot Password</h2>
                        <p className="text-gray-400 mt-2 text-sm text-center">
                            Enter your email and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {message ? (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
                            <MailCheck size={18} className="shrink-0" />
                            <p>{message}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-start gap-3 text-sm">
                                    <AlertCircle size={18} className="shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-[#1e293b]/50 border border-white/10 focus:border-blue-500 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3.5 font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-500/25"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Send Reset Link'}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 text-center">
                        <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2">
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
