import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useToast } from './ToastContext';
import api from '../services/api';

const IssuesContext = createContext(null);

export const useIssues = () => useContext(IssuesContext);

const errorToMessage = (err) => {
  return err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Request failed';
};

export const IssuesProvider = ({ children }) => {
  const toast = useToast();

  const [issues, setIssues] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState(null);

  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchAllIssues = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const response = await api.get('/issue/all');
      setIssues(response.data || []);
    } catch (err) {
      setListError(errorToMessage(err));
    } finally {
      setListLoading(false);
    }
  }, []);

  const createIssue = useCallback(
    async ({ repositoryId, title, description, status }) => {
      setCreateLoading(true);
      setCreateError(null);
      try {
        const response = await api.post('/issue/create', {
          repository: repositoryId,
          title,
          description,
          status,
        });
        toast.success(response.data?.message || 'Issue created');
        await fetchAllIssues();
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
    [fetchAllIssues, toast]
  );

  const updateIssue = useCallback(
    async (issueId, { title, description, status, repositoryId }) => {
      setUpdateLoading(true);
      setUpdateError(null);
      try {
        const response = await api.put(`/issue/update/${issueId}`, {
          title,
          description,
          status,
          repository: repositoryId, // optional if backend supports it
        });
        toast.success(response.data?.message || 'Issue updated');
        await fetchAllIssues();
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
    [fetchAllIssues, toast]
  );

  const deleteIssue = useCallback(
    async (issueId) => {
      setDeleteLoading(true);
      setDeleteError(null);
      try {
        const response = await api.delete(`/issue/delete/${issueId}`);
        toast.success(response.data?.message || 'Issue deleted');
        await fetchAllIssues();
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
    [fetchAllIssues, toast]
  );

  const value = useMemo(
    () => ({
      issues,
      listLoading,
      listError,
      createLoading,
      createError,
      updateLoading,
      updateError,
      deleteLoading,
      deleteError,
      fetchAllIssues,
      createIssue,
      updateIssue,
      deleteIssue,
    }),
    [
      createError,
      createLoading,
      deleteError,
      deleteLoading,
      fetchAllIssues,
      issues,
      listError,
      listLoading,
      updateError,
      updateLoading,
      createIssue,
      updateIssue,
      deleteIssue,
    ]
  );

  return <IssuesContext.Provider value={value}>{children}</IssuesContext.Provider>;
};

