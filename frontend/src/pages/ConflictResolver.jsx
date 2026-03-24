import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, GitMerge, Check, X, Code, Terminal, Save, Edit3, ArrowRightLeft, GitCommit, Sparkles, Loader2 } from 'lucide-react';
import { generateCommitMessage } from '../services/api';

const ConflictResolver = () => {
  const navigate = useNavigate();
  const [resolvedState, setResolvedState] = useState(null); // 'current', 'incoming', 'manual', or null
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [autoMessage, setAutoMessage] = useState('');

  // Simple hardcoded syntax highlighting function to avoid heavy libraries
  const renderCode = (code, type) => {
    return code.split('\n').map((line, i) => {
      // Basic syntax coloring logic
      let formattedLine = line
        .replace(/(const|let|var|function|return|if|else|for|while)/g, '<span class="text-purple-400">$1</span>')
        .replace(/([\w]+)(?=\()/g, '<span class="text-blue-400">$1</span>')
        .replace(/('.*?'|".*?"|`.*?`)/g, '<span class="text-green-400">$1</span>')
        .replace(/([0-9]+)/g, '<span class="text-orange-400">$1</span>')
        .replace(/(\/\/.+)/g, '<span class="text-gray-500 italic">$1</span>');

      // Add diff colors
      let bgClass = "transparent";
      if (type === 'current') bgClass = "bg-green-500/10";
      if (type === 'incoming') bgClass = "bg-blue-500/10";
      if (type === 'conflict-marker') bgClass = "bg-red-500/20 text-red-200 font-bold";

      return (
        <div key={i} className={`flex text-sm leading-relaxed ${bgClass}`}>
          <span className="w-8 shrink-0 text-right pr-4 text-gray-600 select-none border-r border-white/5 mr-4 bg-[#0a0f1c]/50">
            {i + 1}
          </span>
          <span className="font-mono whitespace-pre text-gray-300" dangerouslySetInnerHTML={{ __html: formattedLine }} />
        </div>
      );
    });
  };

  const currentCodeArr = [
    "function calculateTotal(items) {",
    "  let total = 0;",
    "  for (let i = 0; i < items.length; i++) {",
    "    total += items[i].price;",
    "  }",
    "  return total;",
    "}"
  ];

  const incomingCodeArr = [
    "function calculateTotal(items) {",
    "  return items.reduce((total, item) => {",
    "    return total + item.price;",
    "  }, 0);",
    "}"
  ];

  const handleResolve = (type) => {
    setResolvedState(type);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate backend auto-commit processing
      const results = await generateCommitMessage("Merged incoming feature branch changes into main for calculator context");
      const msg = Array.isArray(results) ? results[0] : String(results);
      
      setAutoMessage(msg);
      setSuccess(true);
      
      // Delay navigation to let the user see the success animation
      setTimeout(() => {
        navigate('/'); 
      }, 4000);
    } catch (err) {
      console.error(err);
      setAutoMessage("fix: manually resolved merge conflict");
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-fade-in relative">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

      <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group text-sm font-medium relative z-10">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="glass-panel p-6 mb-6 border-t-[3px] border-t-red-500 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
            <GitMerge size={24} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Merge Conflict</h1>
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <span className="text-green-400 font-mono">main</span> 
              <ArrowRightLeft size={12} /> 
              <span className="text-blue-400 font-mono">feature/reduce-refactor</span>
            </p>
          </div>
        </div>
        
        <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-lg px-4 py-2 flex items-center gap-3">
          <Terminal size={16} className="text-gray-400" />
          <span className="text-sm font-mono text-gray-300">src/utils/calculator.js</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!resolvedState ? (
          <motion.div 
            key="conflict-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            className="space-y-6 relative z-10"
          >
            {/* Split Screen View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Code (Left) */}
              <div className="glass-panel border border-green-500/20 overflow-hidden flex flex-col">
                <div className="bg-green-500/10 px-4 py-3 border-b border-green-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="font-semibold text-green-400 text-sm">Current Change</span>
                  </div>
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded font-mono">HEAD</span>
                </div>
                <div className="p-4 bg-[#0a0f1c]/80 overflow-x-auto flex-1 font-mono text-sm">
                  {renderCode(currentCodeArr.join('\n'), 'current')}
                </div>
              </div>

              {/* Incoming Code (Right) */}
              <div className="glass-panel border border-blue-500/20 overflow-hidden flex flex-col">
                <div className="bg-blue-500/10 px-4 py-3 border-b border-blue-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="font-semibold text-blue-400 text-sm">Incoming Change</span>
                  </div>
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded font-mono">feature/reduce-refactor</span>
                </div>
                <div className="p-4 bg-[#0a0f1c]/80 overflow-x-auto flex-1 font-mono text-sm">
                  {renderCode(incomingCodeArr.join('\n'), 'incoming')}
                </div>
              </div>
            </div>

            {/* Conflict Section (Bottom) */}
            <div className="glass-panel border-l-4 border-l-red-500 overflow-hidden">
              <div className="bg-red-500/5 px-4 py-3 flex justify-between items-center border-b border-red-500/10">
                <span className="text-sm font-semibold text-red-400 flex items-center gap-2">
                  <GitCommit size={16} /> Resolve Conflict
                </span>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleResolve('current')}
                    className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Check size={14} /> Accept Current
                  </button>
                  <button 
                    onClick={() => handleResolve('incoming')}
                    className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Check size={14} /> Accept Incoming
                  </button>
                  <button 
                    onClick={() => handleResolve('manual')}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Edit3 size={14} /> Edit Manually
                  </button>
                </div>
              </div>

              {/* Raw Git Conflict Output */}
              <div className="p-4 bg-[#0a0f1c]/90 overflow-x-auto font-mono text-sm">
                {renderCode("<<<<<<< HEAD (Current Change)", "conflict-marker")}
                {renderCode(currentCodeArr.slice(1, 6).join('\n'), "current")}
                {renderCode("=======", "conflict-marker")}
                {renderCode(incomingCodeArr.slice(1, 4).join('\n'), "incoming")}
                {renderCode(">>>>>>> feature/reduce-refactor (Incoming Change)", "conflict-marker")}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="resolved-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel border border-purple-500/30 overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.1)] relative z-10"
          >
            <div className="bg-purple-500/10 px-6 py-4 border-b border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Check size={16} strokeWidth={3} />
                </div>
                <div>
                  <h3 className="text-white font-bold">Conflict Resolved</h3>
                  <p className="text-xs text-purple-300/70">
                    Using {resolvedState === 'current' ? 'Current (main)' : resolvedState === 'incoming' ? 'Incoming (feature)' : 'Manual'} edits
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <AnimatePresence mode="popLayout">
                  {success ? (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, x: 20, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      className="flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20 font-medium"
                    >
                      <Check size={16} className="text-green-400" /> 
                      Successfully Merged!
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="buttons"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-3"
                    >
                      <button 
                        onClick={() => setResolvedState(null)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm font-medium transition-colors border border-white/5 flex items-center gap-2"
                      >
                        <ArrowLeft size={16} /> Undo
                      </button>
                      <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {isSaving ? 'Committing...' : 'Commit Merge'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence>
              {success && autoMessage && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-blue-500/10 border-b border-blue-500/20 px-6 py-4 flex items-start gap-3 overflow-hidden shadow-inner"
                >
                  <div className="p-1.5 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)] rounded-lg text-blue-400 shrink-0 mt-0.5">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs text-blue-300/80 font-bold uppercase tracking-wider mb-1">Auto-generated Commit</h4>
                    <code className="text-sm font-mono text-blue-200 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {autoMessage}
                    </code>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-6 bg-[#0a0f1c]/90 overflow-x-auto min-h-[300px]">
              {resolvedState === 'current' && renderCode(currentCodeArr.join('\n'), 'current')}
              {resolvedState === 'incoming' && renderCode(incomingCodeArr.join('\n'), 'incoming')}
              {resolvedState === 'manual' && (
                <textarea 
                  className="w-full h-[250px] bg-transparent text-gray-300 font-mono text-sm resize-none outline-none"
                  defaultValue={currentCodeArr.join('\n')}
                  spellCheck="false"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConflictResolver;
