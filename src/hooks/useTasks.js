import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { useAuth } from './useAuth';

/**
 * Hook to manage tasks state for either a single project or an entire workspace.
 * Provides tasks list, loading/error states, and CRUD action handlers.
 */
export const useTasks = ({ projectId, workspaceId, filters = {} } = {}) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const statusFilter = filters.status || 'all';
  const priorityFilter = filters.priority || 'all';
  const assigneeFilter = filters.assigneeId || 'all';
  const projectFilter = filters.projectId || 'all';
  const searchQuery = filters.search || '';
  const sortBy = filters.sortBy || 'created_at';

  const refreshTasks = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function fetchTasks() {
      if (!projectId && !workspaceId) {
        setTasks([]);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let data = [];
        const activeFilters = {
          status: statusFilter,
          priority: priorityFilter,
          assigneeId: assigneeFilter,
          projectId: projectFilter,
          search: searchQuery,
          sortBy,
        };

        if (projectId) {
          data = await taskService.getTasks(projectId, activeFilters);
        } else if (workspaceId) {
          data = await taskService.getWorkspaceTasks(workspaceId, activeFilters);
        }

        if (!ignore) {
          setTasks(data);
        }
      } catch (err) {
        if (!ignore) {
          console.error('[useTasks] Error fetching tasks:', err);
          setError(err.message || 'Failed to load tasks.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchTasks();

    return () => {
      ignore = true;
    };
  }, [
    projectId,
    workspaceId,
    statusFilter,
    priorityFilter,
    assigneeFilter,
    projectFilter,
    searchQuery,
    sortBy,
    refreshTrigger,
  ]);

  const userId = user?.id;

  const createTask = useCallback(
    async (taskData, overrideProjectId) => {
      const targetProjectId = overrideProjectId || projectId || taskData.projectId || taskData.project_id;
      if (!targetProjectId) {
        throw new Error('A project must be selected to create a task.');
      }
      if (!userId) {
        throw new Error('Authenticated user is required to create a task.');
      }

      const created = await taskService.createTask(targetProjectId, userId, taskData);
      refreshTasks();
      return created;
    },
    [projectId, userId, refreshTasks]
  );

  const updateTask = useCallback(
    async (taskId, updates) => {
      const updated = await taskService.updateTask(taskId, updates);
      refreshTasks();
      return updated;
    },
    [refreshTasks]
  );

  const deleteTask = useCallback(
    async (taskId) => {
      await taskService.deleteTask(taskId);
      refreshTasks();
    },
    [refreshTasks]
  );

  return {
    tasks,
    loading,
    error,
    refreshTasks,
    createTask,
    updateTask,
    deleteTask,
  };
};

export default useTasks;
