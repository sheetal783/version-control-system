import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Plus,
  Loader2,
  CircleDot,
  CheckCircle,
  MessageSquare,
  Pencil,
  Trash2,
  AlertTriangle,
  Circle,
} from 'lucide-react';
import { useIssues } from '../context/IssuesContext';
import { useRepositories } from '../context/RepositoriesContext';
import ErrorState from '../components/ErrorState';

const Modal = ({ title, children, onClose }) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 250, damping: 25 }}
          className="relative w-full max-w-2xl bg-[#0f172a]/90 border border-blue-500/20 rounded-2xl shadow-[0_0_60px_rgba(59,130,246,0.25)] overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-white/10 transition-colors rounded-lg p-2"
              type="button"
            >
              Close
            </button>
          </div>
          <div className="p-6">{children}</div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const getIssueRepoId = (issue) => {
  const repo = issue?.repository;
  if (!repo) return '';
  if (typeof repo === 'string') return repo;
  return repo._id || repo.id || '';
};

const Issues = () => {
  const {
    issues,
    listLoading,
    listError,
    fetchAllIssues,
    createLoading,
    createError,
    updateLoading,
    updateError,
    deleteLoading,
    deleteError,
    createIssue,
    updateIssue,
    deleteIssue,
  } = useIssues();

  const { myRepos, fetchMyRepos } = useRepositories();

  const [selectedRepoId, setSelectedRepoId] = useState('');
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [form, setForm] = useState({ repositoryId: '', title: '', description: '', status: 'open' });

  useEffect(() => {
    fetchAllIssues();
    fetchMyRepos();
  }, [fetchAllIssues, fetchMyRepos]);

  const repoOptions = useMemo(() => {
    const opts = [{ _id: '', name: 'All repositories' }];
    for (const r of myRepos || []) opts.push({ _id: r._id, name: r.name });
    return opts;
  }, [myRepos]);

  const filteredIssues = useMemo(() => {
    if (!selectedRepoId) return issues || [];
    return (issues || []).filter((issue) => getIssueRepoId(issue) === selectedRepoId);
  }, [issues, selectedRepoId]);

  const openCreate = () => {
    const defaultRepoId = selectedRepoId || myRepos?.[0]?._id || '';
    setSelectedIssue(null);
    setForm({ repositoryId: defaultRepoId, title: '', description: '', status: 'open' });
    setModalMode('create');
  };

  const openEdit = (issue) => {
    setSelectedIssue(issue);
    setForm({
      repositoryId: getIssueRepoId(issue),
      title: issue?.title || '',
      description: issue?.description || '',
      status: issue?.status || 'open',
    });
    setModalMode('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      repositoryId: form.repositoryId,
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
    };
    if (!payload.repositoryId) return;
    if (!payload.title) return;

    if (modalMode === 'create') {
      await createIssue(payload);
    } else if (modalMode === 'edit' && selectedIssue?._id) {
      await updateIssue(selectedIssue._id, payload);
    }
    setModalMode(null);
  };

  const handleDelete = async (issueId) => {
    if (!issueId) return;
    const ok = window.confirm('Delete this issue?');
    if (!ok) return;
    await deleteIssue(issueId);
  };

  const loadingAny = listLoading || createLoading || updateLoading || deleteLoading;

  return (
    <div className="h-full pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent tracking-tight">
            Issues
          </h1>
          <p className="text-gray-400 flex items-center gap-2 text-sm font-medium">
            <MessageSquare size={16} className="text-blue-400" /> Track bugs & work items
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedRepoId}
            onChange={(e) => setSelectedRepoId(e.target.value)}
            className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
          >
            {repoOptions.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreate}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all flex items-center gap-2 border border-blue-400/20 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loadingAny}
            type="button"
          >
            {loadingAny ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} strokeWidth={2.5} />}
            <span>New Issue</span>
          </motion.button>
        </div>
      </div>

      {listError ? (
        <ErrorState title="Failed to load issues" message={listError} onRetry={() => fetchAllIssues()} />
      ) : (
        <div className="space-y-3">
          {loadingAny && filteredIssues.length === 0 ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
            ))
          ) : filteredIssues.length > 0 ? (
            filteredIssues.map((issue, idx) => {
              const isOpen = (issue?.status || 'open') === 'open';
              const repoId = getIssueRepoId(issue);
              return (
                <motion.div
                  key={issue._id || idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 24, delay: idx * 0.03 }}
                  className="bg-black/20 backdrop-blur-xl border border-white/5 hover:border-blue-500/30 rounded-2xl p-5 flex items-start justify-between gap-5"
                >
                  <div className="flex items-start gap-4">
                    {isOpen ? (
                      <CircleDot className="text-green-500 shrink-0 mt-1" size={20} />
                    ) : (
                      <CheckCircle className="text-purple-500 shrink-0 mt-1" size={20} />
                    )}
                    <div>
                      <h3 className="text-white font-medium text-base hover:text-blue-300 transition-colors">
                        {issue.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mt-1">
                        {issue.description}
                      </p>
                      <div className="text-xs text-gray-500 mt-2 flex items-center gap-2 flex-wrap">
                        <span className="bg-white/5 border border-white/10 rounded-full px-2 py-1">
                          {isOpen ? 'Open' : 'Closed'}
                        </span>
                        {repoId ? (
                          <Link to={`/repo/${repoId}`} className="text-blue-300 hover:text-blue-200 underline">
                            {issue?.repository?.name ? `Repo: ${issue.repository.name}` : 'View repository'}
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(issue)}
                      disabled={loadingAny}
                      className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-70"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Pencil size={16} /> Edit
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(issue._id)}
                      disabled={loadingAny}
                      className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-sm text-red-300 hover:text-red-200 transition-colors disabled:opacity-70"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Trash2 size={16} /> Delete
                      </span>
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="bg-[#1e293b]/30 border border-white/5 rounded-3xl p-12 text-center">
              <p className="text-lg font-bold text-white">No issues found</p>
              <p className="text-gray-400 mt-2">Try changing the repository filter or create a new issue.</p>
            </div>
          )}

          {(createError || updateError || deleteError) && (
            <div className="text-sm text-red-300 flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <AlertTriangle size={16} className="mt-0.5" /> {createError || updateError || deleteError}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {modalMode && (
          <Modal
            title={modalMode === 'create' ? 'Create Issue' : 'Edit Issue'}
            onClose={() => setModalMode(null)}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Repository</label>
                <select
                  value={form.repositoryId}
                  onChange={(e) => setForm((p) => ({ ...p, repositoryId: e.target.value }))}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  {repoOptions
                    .filter((r) => r._id)
                    .map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Title</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Description</label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[120px]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="open">open</option>
                  <option value="closed">closed</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={createLoading || updateLoading || loadingAny}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {modalMode === 'create'
                    ? createLoading
                      ? 'Creating...'
                      : 'Create'
                    : updateLoading
                      ? 'Saving...'
                      : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 rounded-xl transition-colors"
                  disabled={loadingAny}
                >
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Issues;

