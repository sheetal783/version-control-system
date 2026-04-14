import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Star, GitFork, ArrowLeft, GitBranch, Terminal, 
  FileText, CircleDot, GitCommit, Sparkles, Folder,
  Clock, CheckCircle, MessageSquare, Plus, Pencil, Trash2, AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import CommitGenerator from '../components/CommitGenerator';
import { useIssues } from '../context/IssuesContext';

const RepoDetails = () => {
  const { id } = useParams();
  const [repo, setRepo] = useState(null);
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);

  const {
    createIssue,
    updateIssue,
    deleteIssue,
    createLoading,
    createError,
    updateLoading,
    updateError,
    deleteLoading,
    deleteError,
  } = useIssues();

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueModalMode, setIssueModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [issueForm, setIssueForm] = useState({ title: '', description: '', status: 'open' });

  const fetchCommits = useCallback(async (repoName) => {
    try {
      const response = await api.get(`/api/commits/${repoName}`);
      setCommits(response.data);
    } catch (error) {
      console.error("Failed to fetch commits", error);
    }
  }, []);

  const fetchRepoDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/repo/${id}`);
      setRepo(response.data);
      if (response.data.name) {
        fetchCommits(response.data.name);
      }
    } catch (error) {
      console.error("Failed to fetch repository details", error);
      setError(error?.response?.data?.message || error.message || 'Failed to load repository');
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  }, [id, fetchCommits]);

  useEffect(() => {
    fetchRepoDetails();
  }, [fetchRepoDetails]);

  const issuesTab = repo?.issues || [];
  const openIssuesCount = issuesTab.filter((i) => i?.status === 'open').length;
  const closedIssuesCount = issuesTab.filter((i) => i?.status === 'closed').length;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Loading repository...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'Overview', icon: Terminal },
    { id: 'Issues', icon: CircleDot, count: openIssuesCount },
    { id: 'Commits', icon: GitCommit, count: commits.length },
  ];

  const files = commits.length > 0 ? (commits[0].files || []).map(f => ({
    name: f,
    type: 'file', // Our push logic currently only tracks files
    message: commits[0].message,
    time: new Date(commits[0].timestamp).toLocaleString()
  })) : [];

  const tabContentVariants = {
    initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
    enter: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { duration: 0.3, staggerChildren: 0.05, ease: 'easeOut' } 
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      filter: 'blur(4px)',
      transition: { duration: 0.2, ease: 'easeIn' } 
    }
  };

  const itemVariants = {
    initial: { opacity: 0, x: -10 },
    enter: { opacity: 1, x: 0 }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-fade-in relative">
      {/* Premium background styling specific to repo */}
      <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

      <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group text-sm font-medium">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to Dashboard
      </Link>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-2xl flex items-center justify-between gap-4">
          <span className="text-sm">{error}</span>
          <button
            type="button"
            onClick={fetchRepoDetails}
            className="text-sm text-red-200 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-red-500/20 rounded-xl px-3 py-2 disabled:opacity-70"
            disabled={createLoading || updateLoading || deleteLoading}
          >
            Retry
          </button>
        </div>
      )}
      
      {/* Repo Header */}
      <div className="glass-panel p-6 md:p-8 mb-8 border-t-[3px] border-t-blue-500 overflow-hidden relative">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BookOpen size={24} className="text-blue-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
                {repo?.name || 'Unnamed Repository'}
              </h1>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-gray-300 ml-2 shadow-inner">
                {repo?.visibility ? 'Private' : 'Public'}
              </span>
            </div>
            <p className="text-gray-400 max-w-2xl text-base leading-relaxed">
              {repo?.description || 'No description provided.'}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 self-start">
            {/* Generate Commit Message Button */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCommitModalOpen(true)}
              className="relative group overflow-hidden bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg py-2 px-4 font-medium shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all flex items-center gap-2 border border-purple-400/30 backdrop-blur-md text-sm"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <Sparkles size={16} className="relative z-10 text-purple-200 group-hover:animate-pulse" />
              <span className="relative z-10">Generate Commit Message</span>
            </motion.button>

            <div className="flex bg-black/40 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden shadow-inner">
              <button className="flex items-center gap-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 py-2 px-3 border-r border-white/10 transition-colors">
                <Star size={16} /> <span className="font-medium">Star</span>
                <span className="ml-1 px-1.5 bg-white/10 text-white rounded text-xs font-mono">{repo?.stars?.length || 0}</span>
              </button>
              <button className="flex items-center gap-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 py-2 px-3 transition-colors">
                <GitFork size={16} /> <span className="font-medium">Fork</span>
                <span className="ml-1 px-1.5 bg-white/10 text-white rounded text-xs font-mono">{repo?.forks?.length || 0}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Animated Tabs */}
        <div className="flex overflow-x-auto gap-4 mt-8 pb-px border-b border-white/10 scrollbar-hide relative z-10">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-t-lg'
                }`}
              >
                <tab.icon size={16} className={isActive ? 'text-blue-400' : 'text-gray-500'} />
                {tab.id}
                {tab.count !== undefined && (
                  <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-mono ${isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-white/10 text-gray-400'}`}>
                    {tab.count}
                  </span>
                )}
                
                {/* Framer Motion Active Indicator */}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_-2px_10px_rgba(59,130,246,0.8)] rounded-t-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'Overview' && (
            <motion.div 
              key="Overview"
              variants={tabContentVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              <div className="lg:col-span-3 space-y-6">
                {/* File Explorer UI */}
                <motion.div variants={itemVariants} className="glass-panel overflow-hidden border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                  <div className="bg-[#1e293b]/50 px-4 py-3 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-4 text-sm font-medium">
                      <button className="flex items-center gap-2 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 py-1.5 px-3 rounded-md transition-all">
                        <GitBranch size={16} className="text-blue-400" /> <span>main</span>
                      </button>
                      <span className="text-gray-400 hidden sm:inline-flex items-center gap-2 text-xs">
                        <img src="https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff" alt="User" className="w-5 h-5 rounded-full" />
                        <strong className="text-gray-300">sheetal</strong> Update components architecture
                      </span>
                    </div>
                    <span className="flex items-center gap-2 text-sm text-gray-400 hover:text-white cursor-pointer transition-colors bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
                      <Clock size={14} /> <span className="hidden sm:inline">History</span>
                    </span>
                  </div>
                  
                  <ul className="divide-y divide-white/5">
                    {files.length > 0 ? files.map((file, i) => (
                      <motion.li 
                        variants={itemVariants}
                        key={i} 
                        className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 hover:bg-white/5 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-[200px]">
                          {file.type === 'folder' ? (
                            <Folder size={18} className="text-blue-400 group-hover:text-blue-300 transition-colors" fill="currentColor" fillOpacity={0.2} />
                          ) : (
                            <FileText size={18} className="text-gray-400 group-hover:text-gray-300 transition-colors" />
                          )}
                          <span className="text-sm text-gray-200 group-hover:text-blue-400 transition-colors font-medium">{file.name}</span>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-500 truncate flex-1 group-hover:text-gray-400 transition-colors pl-7 sm:pl-0">{file.message}</span>
                        <span className="text-xs text-gray-500 text-right w-24 hidden md:block group-hover:text-gray-400">{file.time}</span>
                      </motion.li>
                    )) : (
                      <div className="p-8 text-center">
                        <p className="text-gray-500 text-sm">This repository has no files yet.</p>
                        <p className="text-gray-600 text-xs mt-1">Run <code className="bg-white/5 px-1 rounded">push</code> from your CLI to upload files.</p>
                      </div>
                    )}
                  </ul>
                </motion.div>
                
                {/* README UI (Only show if README.md exists) */}
                {files.some(f => f.name.toLowerCase() === 'readme.md') && (
                  <motion.div variants={itemVariants} className="glass-panel p-6 sm:p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-[100px] pointer-events-none group-hover:bg-purple-500/10 transition-colors duration-500"></div>
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                      <BookOpen className="text-blue-400" size={20} />
                      <h3 className="font-bold text-white tracking-widest text-sm uppercase">README.md</h3>
                    </div>
                    <div className="prose prose-invert max-w-none prose-headings:text-transparent prose-headings:bg-clip-text prose-headings:bg-gradient-to-r prose-headings:from-white prose-headings:to-gray-400">
                      <h1 className="text-4xl font-extrabold mb-4">{repo?.name || 'Repository'}</h1>
                      <p className="text-gray-400 text-lg leading-relaxed mb-6">
                        {repo?.description || 'Repository content.'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Sidebar Info */}
              <div className="lg:col-span-1 space-y-6">
                <motion.div variants={itemVariants} className="glass-card p-5 border border-white/5 bg-black/20">
                  <h3 className="font-semibold text-white mb-4">About</h3>
                  <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                    {repo?.description || 'No description available for this repository yet.'}
                  </p>
                  <div className="space-y-3 pt-4 border-t border-white/5 text-sm text-gray-400">
                    <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                      <BookOpen size={16} className="text-blue-400" /> <span>Readme included</span>
                    </div>
                    <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                      <Star size={16} className="text-yellow-500" /> <span>{repo?.stars?.length || 0} stars</span>
                    </div>
                    <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                      <GitFork size={16} className="text-purple-400" /> <span>{repo?.forks?.length || 0} forks</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Issues' && (
            <motion.div 
              key="Issues"
              variants={tabContentVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              className="glass-panel overflow-hidden"
            >
              <div className="bg-[#1e293b]/50 px-6 py-4 flex items-center justify-between border-b border-white/5">
                <div className="flex gap-4 text-sm font-medium">
                  <span className="flex items-center gap-2 text-white">
                    <CircleDot size={16} /> {openIssuesCount} Open
                  </span>
                  <span className="flex items-center gap-2 text-gray-500">
                    <CheckCircle size={16} /> {closedIssuesCount} Closed
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIssueModalMode('create');
                    setSelectedIssue(null);
                    setIssueForm({ title: '', description: '', status: 'open' });
                    setIsIssueModalOpen(true);
                  }}
                  disabled={createLoading || updateLoading || deleteLoading}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-200 hover:text-white transition-colors disabled:opacity-70"
                >
                  <span className="inline-flex items-center gap-2">
                    <Plus size={16} /> New Issue
                  </span>
                </button>
              </div>

              {issuesTab.length > 0 ? (
                <ul className="divide-y divide-white/5">
                  {issuesTab.map((issue, i) => {
                    const isOpen = (issue?.status || 'open') === 'open';
                    const issueId = issue?._id || i;
                    const authorName = issue?.owner?.username || issue?.owner?.name || 'Unknown';
                    const commentsCount = Array.isArray(issue?.comments) ? issue.comments.length : 0;

                    return (
                      <motion.li
                        variants={itemVariants}
                        key={issueId}
                        className="p-5 hover:bg-white/5 transition-colors flex items-start gap-4"
                      >
                        {isOpen ? (
                          <CircleDot className="text-green-500 shrink-0 mt-1" size={18} />
                        ) : (
                          <CheckCircle className="text-purple-500 shrink-0 mt-1" size={18} />
                        )}

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="text-base font-medium text-gray-200 hover:text-blue-400 transition-colors">
                              {issue.title}
                            </h4>
                            <span className="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 font-mono shrink-0">
                              {String(issueId).slice(0, 8)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-2 flex items-center gap-2 flex-wrap">
                            <span>by <span className="text-gray-400">{authorName}</span></span>
                            <span>•</span>
                            <span>{isOpen ? 'opened' : 'closed'}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                            <MessageSquare size={14} /> {commentsCount}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setIssueModalMode('edit');
                                setSelectedIssue(issue);
                                setIssueForm({
                                  title: issue?.title || '',
                                  description: issue?.description || '',
                                  status: issue?.status || 'open',
                                });
                                setIsIssueModalOpen(true);
                              }}
                              disabled={createLoading || updateLoading || deleteLoading}
                              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-70"
                            >
                              <span className="inline-flex items-center gap-2">
                                <Pencil size={16} /> Edit
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                (async () => {
                                  const ok = window.confirm('Delete this issue?');
                                  if (!ok) return;
                                  try {
                                    await deleteIssue(issueId);
                                    await fetchRepoDetails();
                                  } catch {
                                    // Error toast is handled in IssuesContext; keep UI stable.
                                  }
                                })();
                              }}
                              disabled={createLoading || updateLoading || deleteLoading}
                              className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-sm text-red-300 hover:text-red-200 transition-colors disabled:opacity-70"
                            >
                              <span className="inline-flex items-center gap-2">
                                <Trash2 size={16} /> Del
                              </span>
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-10">
                  <div className="text-center text-gray-400">
                    <p className="text-white font-semibold mb-2">No issues yet</p>
                    <p className="text-sm">Create the first issue for this repository.</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'Commits' && (
            <motion.div 
              key="Commits"
              variants={tabContentVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              className="glass-panel p-6"
            >
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <GitCommit className="text-blue-400" /> Commit History
              </h3>
              <div className="relative border-l-2 border-white/10 ml-3 md:ml-4 space-y-8 pb-4">
                {commits.length > 0 ? commits.map((commit, i) => (
                  <motion.div variants={itemVariants} key={commit.commitId} className="relative pl-6 md:pl-8">
                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-blue-500/20 border-2 border-blue-500 ring-4 ring-[#0a0f1c]"></div>
                    <div className="glass-card bg-black/20 p-4 hover:border-blue-500/30 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                        <span className="font-mono text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded inline-block w-fit">
                          {commit.commitId.slice(0, 7)}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={12} /> {new Date(commit.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-200 font-medium mb-3">{commit.message}</p>
                      <div className="flex items-center gap-2">
                        <img src={`https://ui-avatars.com/api/?name=${commit.author}&background=1e293b&color=fff`} alt={commit.author} className="w-5 h-5 rounded-full" />
                        <span className="text-xs text-gray-400 font-medium">{commit.author}</span>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="pl-6 md:pl-8 py-4">
                    <p className="text-gray-500 text-sm">No commits found yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Smart Commit Modal */}
      <CommitGenerator 
        isOpen={isCommitModalOpen} 
        onClose={() => setIsCommitModalOpen(false)} 
      />

      <AnimatePresence>
        {isIssueModalOpen && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setIsIssueModalOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 250, damping: 25 }}
              className="relative w-full max-w-2xl bg-[#0f172a]/90 border border-blue-500/20 rounded-2xl shadow-[0_0_60px_rgba(59,130,246,0.25)] overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-white">
                  {issueModalMode === 'create' ? 'Create Issue' : 'Edit Issue'}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="text-gray-400 hover:text-white hover:bg-white/10 transition-colors rounded-lg p-2"
                >
                  Close
                </button>
              </div>

              <div className="p-6">
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const payload = {
                      title: issueForm.title.trim(),
                      description: issueForm.description.trim(),
                      status: issueForm.status,
                    };

                    if (!payload.title || !payload.description) return;

                    if (issueModalMode === 'create') {
                      await createIssue({
                        repositoryId: id,
                        ...payload,
                      });
                    } else if (issueModalMode === 'edit' && selectedIssue?._id) {
                      await updateIssue(selectedIssue._id, {
                        repositoryId: id,
                        ...payload,
                      });
                    }

                    setIsIssueModalOpen(false);
                    await fetchRepoDetails();
                  }}
                >
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Title</label>
                    <input
                      value={issueForm.title}
                      onChange={(e) => setIssueForm((p) => ({ ...p, title: e.target.value }))}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Description</label>
                    <textarea
                      value={issueForm.description}
                      onChange={(e) => setIssueForm((p) => ({ ...p, description: e.target.value }))}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[130px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Status</label>
                    <select
                      value={issueForm.status}
                      onChange={(e) => setIssueForm((p) => ({ ...p, status: e.target.value }))}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                      <option value="open">open</option>
                      <option value="closed">closed</option>
                    </select>
                  </div>

                  {(createError || updateError || deleteError) && (
                    <div className="text-sm text-red-300 flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <AlertTriangle size={16} className="mt-0.5" />
                      {createError || updateError || deleteError}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={createLoading || updateLoading || deleteLoading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {issueModalMode === 'create'
                        ? createLoading
                          ? 'Creating...'
                          : 'Create'
                        : updateLoading
                          ? 'Saving...'
                          : 'Save changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsIssueModalOpen(false)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 rounded-xl transition-colors disabled:opacity-70"
                      disabled={createLoading || updateLoading || deleteLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RepoDetails;
