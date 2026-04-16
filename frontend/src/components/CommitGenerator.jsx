import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Copy, Check, TerminalSquare, MessageSquare, Wand2, AlertCircle } from 'lucide-react';
import { generateCommitMessage } from '../services/api';

const CommitGenerator = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [error, setError] = useState(null);

  // Stop body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const generateMessages = async () => {
    if (!input.trim()) return;
    
    setIsGenerating(true);
    setSuggestions([]);
    setError(null);
    
    try {
      // Pass the user input as 'changes' context to the AI service
      const results = await generateCommitMessage(input);
      
      if (results && results.length > 0) {
        // Set all results to the state to be mapped over in the UI
        setSuggestions(results);
      } else {
        throw new Error('No suggestions returned from AI. Please try again with more detail.');
      }
    } catch (err) {
      console.error('Failed to generate commit messages:', err);
      // Backend errors might be in err.response.data.error or err.response.data.details
      const backendError = err.response?.data?.error || err.response?.data?.details || err.response?.data?.message;
      setError(backendError || err.message || 'AI Provider offline. Could not generate messages.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-xl glass-panel bg-[#0f172a]/90 border border-blue-500/20 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden flex flex-col"
          >
            {/* AI Glow Effect Background */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>

            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-600/20 flex items-center justify-center border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <Sparkles size={20} className="text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">AI Commit Generator</h2>
                  <p className="text-xs text-purple-300/70 font-medium tracking-wide uppercase">Smart Message Suggestions</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 relative z-10 space-y-6">
              {/* Input Area */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                  <TerminalSquare size={16} className="text-blue-400" />
                  What did you change?
                </label>
                <div className="relative group">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g. Added a new dark mode toggle to the navigation bar..."
                    className="w-full h-28 bg-black/40 border border-white/10 hover:border-purple-500/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl p-4 text-gray-200 placeholder-gray-600 resize-none transition-all outline-none"
                    spellCheck="false"
                  />
                  <div className="absolute inset-0 rounded-xl pointer-events-none bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-blue-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                </div>
              </div>

              {/* Generate Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateMessages}
                disabled={!input.trim() || isGenerating}
                className={`w-full relative group overflow-hidden bg-gradient-to-r ${error ? 'from-red-600/90 to-orange-600/90 hover:from-red-500 hover:to-orange-500 border-red-400/30' : 'from-purple-600/90 to-blue-600/90 hover:from-purple-500 hover:to-blue-500 border-purple-400/30'} text-white rounded-xl py-3.5 font-medium shadow-[0_4px_20px_rgba(147,51,234,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed border flex items-center justify-center gap-2`}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Sparkles size={18} className="text-purple-200" />
                    </motion.div>
                    <span className="relative z-10 animate-pulse">Analyzing Context...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={18} className="relative z-10 group-hover:-rotate-12 transition-transform" />
                    <span className="relative z-10">Generate Suggestions</span>
                  </>
                )}
              </motion.button>

              {/* Output / Suggestions Area */}
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div 
                    key="generating"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 pt-4 border-t border-white/10"
                  >
                    <div className="flex items-center gap-2 text-sm text-purple-400 font-medium mb-2">
                       Generating suggestions...
                    </div>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 bg-white/5 border border-white/5 rounded-xl flex items-center px-4 overflow-hidden relative">
                        {/* Shimmer effect */}
                        <motion.div 
                          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 cursor-default"
                          animate={{ translateX: ['-100%', '200%'] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear', delay: i * 0.2 }}
                        />
                        <div className="h-4 bg-white/10 rounded-md w-3/4"></div>
                      </div>
                    ))}
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-4 border-t border-red-500/20"
                  >
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-4 backdrop-blur-md">
                      <div className="bg-red-500/20 p-2 rounded-lg isolate">
                        <AlertCircle size={20} className="shrink-0" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-1 text-red-300">Generation Failed</h4>
                        <p className="text-sm leading-relaxed text-red-400/80">{error}</p>
                      </div>
                    </div>
                  </motion.div>
                ) : suggestions.length > 0 ? (
                  <motion.div
                    key="suggestions"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-4 border-t border-white/10"
                  >
                    <div className="flex items-center text-sm text-gray-400 font-medium mb-2">
                      <MessageSquare size={14} className="mr-2 text-blue-400" />
                      Select a message to copy
                    </div>
                    <div className="space-y-3">
                      {suggestions.map((msg, idx) => (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          key={idx}
                          className="group relative flex items-center justify-between bg-black/30 hover:bg-black/50 border border-white/10 hover:border-purple-500/40 rounded-xl p-3.5 transition-all cursor-pointer overflow-hidden"
                          onClick={() => copyToClipboard(msg, idx)}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          
                          <code className="text-gray-200 text-sm font-mono relative z-10 flex-1 truncate pr-4 selection:bg-purple-500/30">
                            {/* Highlight prefix dynamically */}
                            <span className="text-purple-400 font-semibold">{msg.includes(':') ? msg.split(':')[0] : 'commit'}</span>
                            {msg.includes(':') ? ':' + msg.split(':').slice(1).join(':') : ' ' + msg}
                          </code>
                          
                          <button className="relative z-10 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors flex-shrink-0">
                            {copiedIndex === idx ? (
                              <Check size={16} className="text-green-400" />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommitGenerator;
