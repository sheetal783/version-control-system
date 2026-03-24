import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import ErrorState from '../components/ErrorState';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get(`/userProfile/${user.id}`);
        setProfile(res.data);
        setForm({
          username: res.data?.username || '',
          email: res.data?.email || '',
          password: '',
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.id]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setError('');
    try {
      const res = await apiClient.put(`/userProfile/${user.id}`, {
        username: form.username,
        email: form.email,
        password: form.password || undefined,
      });
      setProfile(res.data?.user || res.data);
      setForm((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-10 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Profile error" message={error} onRetry={() => window.location.reload()} />;
  }

  if (!profile) {
    return <ErrorState title="No profile found" message="Please login again." onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>

      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 backdrop-blur-md">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Name</label>
            <input
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">New password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="Leave empty to keep current"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            {error && <span className="text-sm text-red-400">{error}</span>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;

