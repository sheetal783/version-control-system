import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import api from '../services/api';

const RepositoriesContext = createContext(null);

export const useRepositories = () => useContext(RepositoriesContext);

const errorToMessage = (err) => {
  return err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Request failed';
};

export const RepositoriesProvider = ({ children }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [allRepos, setAllRepos] = useState([]);
  const [myRepos, setMyRepos] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState(null);

  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const [toggleLoading, setToggleLoading] = useState(false);
  const [toggleError, setToggleError] = useState(null);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchAllRepos = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const response = await api.get('/repo/all');
      setAllRepos(response.data || []);
    } catch (err) {
      setListError(errorToMessage(err));
    } finally {
      setListLoading(false);
    }
  }, []);

  const fetchMyRepos = useCallback(async () => {
    if (!user?.id) return;
    setListLoading(true);
    setListError(null);
    try {
      const response = await api.get(`/repo/user/${user.id}`);
      // Some backend endpoints wrap response in { repositories }
      setMyRepos(response.data?.repositories || response.data || []);
    } catch (err) {
      if (err?.response?.status === 404) {
        // Treat "no repositories" as an empty list, not a hard error.
        setMyRepos([]);
      } else {
        setListError(errorToMessage(err));
      }
    } finally {
      setListLoading(false);
    }
  }, [user?.id]);

  const createRepo = useCallback(
    async ({ name, description, content, visibility }) => {
      if (!user?.id) throw new Error('Not authenticated');

      setCreateLoading(true);
      setCreateError(null);
      try {
        const response = await api.post('/repo/create', {
          owner: user.id,
          name,
          description,
          content,
          visibility: Boolean(visibility),
        });
        toast.success(response.data?.message || 'Repository created');
        await fetchMyRepos();
        await fetchAllRepos();
        return response.data;
      } catch (err) {
        const msg = errorToMessage(err);
        setCreateError(msg);
        toast.error(msg);
        throw err;
      } finally {
        setCreateLoading(false);
      }
    },
    [fetchAllRepos, fetchMyRepos, toast, user?.id]
  );

  const updateRepo = useCallback(
    async (repoId, { name, description, content, visibility }) => {
      setUpdateLoading(true);
      setUpdateError(null);
      try {
        const response = await api.put(`/repo/update/${repoId}`, {
          name,
          description,
          content,
          visibility: visibility === undefined ? undefined : Boolean(visibility),
        });
        toast.success(response.data?.message || 'Repository updated');
        await fetchMyRepos();
        await fetchAllRepos();
        return response.data;
      } catch (err) {
        const msg = errorToMessage(err);
        setUpdateError(msg);
        toast.error(msg);
        throw err;
      } finally {
        setUpdateLoading(false);
      }
    },
    [fetchAllRepos, fetchMyRepos, toast]
  );

  const toggleRepoVisibility = useCallback(
    async (repoId) => {
      setToggleLoading(true);
      setToggleError(null);
      try {
        const response = await api.patch(`/repo/toggle/${repoId}`);
        toast.success(response.data?.message || 'Visibility updated');
        await fetchMyRepos();
        await fetchAllRepos();
        return response.data;
      } catch (err) {
        const msg = errorToMessage(err);
        setToggleError(msg);
        toast.error(msg);
        throw err;
      } finally {
        setToggleLoading(false);
      }
    },
    [fetchAllRepos, fetchMyRepos, toast]
  );

  const deleteRepo = useCallback(
    async (repoId) => {
      setDeleteLoading(true);
      setDeleteError(null);
      try {
        const response = await api.delete(`/repo/delete/${repoId}`);
        toast.success(response.data?.message || 'Repository deleted');
        await fetchMyRepos();
        await fetchAllRepos();
        return response.data;
      } catch (err) {
        const msg = errorToMessage(err);
        setDeleteError(msg);
        toast.error(msg);
        throw err;
      } finally {
        setDeleteLoading(false);
      }
    },
    [fetchAllRepos, fetchMyRepos, toast]
  );

  const value = useMemo(
    () => ({
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
    }),
    [
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
    ]
  );

  return <RepositoriesContext.Provider value={value}>{children}</RepositoriesContext.Provider>;
};

