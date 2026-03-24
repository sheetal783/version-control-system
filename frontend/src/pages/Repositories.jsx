import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderGit2,
  Plus,
  Pencil,
  Trash2,
  Lock,
  BookOpen,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
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
          className="relative w-full max-w-xl bg-[#0f172a]/90 border border-blue-500/20 rounded-2xl shadow-[0_0_60px_rgba(59,130,246,0.25)] overflow-hidden"
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

const Repositories = () => {
  const {
    allRepos,
    myRepos,
    listLoading,
    listError,
    createLoading,
    createError,
    updateLoading,
    updateError,
    toggleLoading,
    toggleError,
    deleteLoading,
    deleteError,
    fetchAllRepos,
    fetchMyRepos,
    createRepo,
    updateRepo,
    toggleRepoVisibility,
    deleteRepo,
  } = useRepositories();

  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', content: '', visibility: false }); // visibility: private?
  const [showAdvanced, setShowAdvanced] = useState(false);

  const openCreate = () => {
    setSelectedRepo(null);
    setForm({ name: '', description: '', content: '', visibility: false });
    setModalMode('create');
  };

  const openEdit = (repo) => {
    setSelectedRepo(repo);
    setForm({
      name: repo?.name || '',
      description: repo?.description || '',
      content: repo?.content || '',
      visibility: Boolean(repo?.visibility), // true => private
    });
    setModalMode('edit');
  };

  useEffect(() => {
    fetchAllRepos();
    fetchMyRepos();
  }, [fetchAllRepos, fetchMyRepos]);

  const hasAny = useMemo(() => myRepos && myRepos.length > 0, [myRepos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      content: form.content.trim() || undefined,
      visibility: form.visibility, // boolean
    };

    if (!payload.name) return;
    if (modalMode === 'create') {
      await createRepo(payload);
    } else if (modalMode === 'edit' && selectedRepo?._id) {
      await updateRepo(selectedRepo._id, payload);
    }
    setModalMode(null);
  };

  const handleDelete = async (repoId) => {
    if (!repoId) return;
    const ok = window.confirm('Delete this repository? This cannot be undone.');
    if (!ok) return;
    await deleteRepo(repoId);
  };

  const loadingAny = listLoading || createLoading || updateLoading || toggleLoading || deleteLoading;

  return (
    <div className="h-full pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent tracking-tight">
            Repositories
          </h1>
          <p className="text-gray-400 flex items-center gap-2 text-sm font-medium">
            <FolderGit2 size={16} className="text-blue-400" /> Manage your projects
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreate}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all flex items-center gap-2 border border-blue-400/20 disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={loadingAny}
          type="button"
        >
          {loadingAny ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} strokeWidth={2.5} />}
          <span>New Repository</span>
        </motion.button>
      </div>

      {listError ? (
        <ErrorState title="Failed to load repositories" message={listError} onRetry={() => fetchMyRepos()} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {listLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="backdrop-blur-xl bg-[#1e293b]/30 border border-white/5 rounded-2xl p-6 animate-pulse h-44"
              />
            ))
          ) : hasAny ? (
            myRepos.map((repo, i) => {
              const isPrivate = Boolean(repo?.visibility);
              return (
                <motion.div
                  key={repo._id || i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 24, delay: i * 0.03 }}
                  className="bg-black/20 backdrop-blur-xl border border-white/5 hover:border-blue-500/30 rounded-2xl p-6 shadow-lg transition-colors relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center border border-blue-500/20">
                        <FolderGit2 size={20} className="text-blue-400" />
                      </div>
                      <div>
                        <Link to={`/repo/${repo._id}`} className="block">
                          <h3 className="text-lg font-bold text-white hover:text-blue-300 transition-colors truncate max-w-[240px]">
                            {repo?.name || 'Unnamed Repository'}
                          </h3>
                        </Link>
                        <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                          {isPrivate ? (
                            <Lock size={12} className="text-blue-300" />
                          ) : (
                            <BookOpen size={12} className="text-blue-300" />
                          )}
                          <span>{isPrivate ? 'Private' : 'Public'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mt-4 line-clamp-3">
                    {repo?.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center gap-2 mt-5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => openEdit(repo)}
                      disabled={loadingAny}
                      className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-70"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Pencil size={16} /> Edit
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleRepoVisibility(repo._id)}
                      disabled={toggleLoading || loadingAny}
                      className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-70"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Lock size={16} /> Toggle Privacy
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(repo._id)}
                      disabled={deleteLoading || loadingAny}
                      className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-sm text-red-300 hover:text-red-200 transition-colors disabled:opacity-70"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Trash2 size={16} /> Delete
                      </span>
                    </button>
                  </div>

                  {toggleError && (
                    <div className="mt-3 text-xs text-red-300 flex items-center gap-2">
                      <AlertTriangle size={14} /> {toggleError}
                    </div>
                  )}
                  {deleteError && (
                    <div className="mt-3 text-xs text-red-300 flex items-center gap-2">
                      <AlertTriangle size={14} /> {deleteError}
                    </div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full bg-[#1e293b]/30 border border-white/5 rounded-3xl p-12 text-center">
              <p className="text-lg font-bold text-white">No repositories yet</p>
              <p className="text-gray-400 mt-2">Create your first repository to start tracking issues.</p>
              <button
                type="button"
                onClick={openCreate}
                className="mt-6 bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 mx-auto"
                disabled={loadingAny}
              >
                <Plus size={18} /> Create Repository
              </button>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {modalMode && (
          <Modal title={modalMode === 'create' ? 'Create Repository' : 'Edit Repository'} onClose={() => setModalMode(null)}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.visibility}
                    onChange={(e) => setForm((p) => ({ ...p, visibility: e.target.checked }))}
                  />
                  <span className="text-sm text-gray-300">Private</span>
                </label>
                <button
                  type="button"
                  className="text-xs text-blue-300 hover:text-blue-200 underline"
                  onClick={() => setShowAdvanced((v) => !v)}
                >
                  {showAdvanced ? 'Hide' : 'Show'} advanced
                </button>
              </div>

              <AnimatePresence>
                {showAdvanced && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Content</label>
                    <textarea
                      value={form.content}
                      onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[92px]"
                    />
                  </div>
                )}
              </AnimatePresence>

              {(createError || updateError) && (
                <div className="text-sm text-red-300 flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <AlertTriangle size={16} className="mt-0.5" /> {createError || updateError}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={createLoading || updateLoading || loadingAny}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {modalMode === 'create' ? (createLoading ? 'Creating...' : 'Create') : updateLoading ? 'Saving...' : 'Save changes'}
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

export default Repositories;

