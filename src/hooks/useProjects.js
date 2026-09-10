import { useState, useEffect, useCallback } from 'react';
import { projectService } from '../services/projectService';
import { useAuth } from './useAuth';

/**
 * Hook to manage projects state for an active workspace.
 * Provides projects list, loading/error states, and CRUD action handlers.
 */
export const useProjects = (workspaceId, filters = {}) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const statusFilter = filters.status || 'all';
  const searchQuery = filters.search || '';

  const refreshProjects = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function fetchProjects() {
      if (!workspaceId) {
        setProjects([]);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const list = await projectService.getProjects(workspaceId, {
          status: statusFilter,
          search: searchQuery,
        });

        if (!ignore) {
          setProjects(list);
        }
      } catch (err) {
        if (!ignore) {
          console.error('[useProjects] Error fetching projects:', err);
          setError(err.message || 'Failed to load projects.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchProjects();

    return () => {
      ignore = true;
    };
  }, [workspaceId, statusFilter, searchQuery, refreshTrigger]);

  const userId = user?.id;

  const createProject = useCallback(
    async (projectData) => {
      if (!workspaceId || !userId) {
        throw new Error('Active workspace and authenticated user are required to create a project.');
      }
      const created = await projectService.createProject(workspaceId, userId, projectData);
      refreshProjects();
      return created;
    },
    [workspaceId, userId, refreshProjects]
  );

  const updateProject = useCallback(
    async (projectId, updates) => {
      const updated = await projectService.updateProject(projectId, updates);
      refreshProjects();
      return updated;
    },
    [refreshProjects]
  );

  const deleteProject = useCallback(
    async (projectId) => {
      await projectService.deleteProject(projectId);
      refreshProjects();
    },
    [refreshProjects]
  );

  return {
    projects,
    loading,
    error,
    refreshProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};

export default useProjects;
