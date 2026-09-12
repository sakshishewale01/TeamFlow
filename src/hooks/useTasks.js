import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { realtimeService } from '../services/realtimeService';
import { useAuth } from './useAuth';

/**
 * Hook to manage tasks state for either a single project or an entire workspace.
 * Fetches the project/workspace tasks once and provides reactive actions.
 */
export const useTasks = ({ projectId, workspaceId } = {}) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
        if (projectId) {
          data = await taskService.getTasks(projectId, { sortBy: 'position' });
        } else if (workspaceId) {
          data = await taskService.getWorkspaceTasks(workspaceId, { sortBy: 'created_at' });
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

    if ((!projectId && !workspaceId) || !user?.id) {
      return () => {
        ignore = true;
      };
    }

    const unsubscribe = realtimeService.subscribeToTasks({
      projectId: projectId || undefined,
      onInsert: async (newTaskRow) => {
        if (ignore || !newTaskRow) return;

        // Scope check for projectId
        if (projectId && newTaskRow.project_id !== projectId) {
          return;
        }

        try {
          const fullTask = await taskService.getTask(newTaskRow.id);
          if (!ignore && fullTask) {
            // If workspace-scoped, verify it belongs to this workspace
            if (workspaceId && fullTask.project?.workspace_id !== workspaceId) {
              return;
            }

            setTasks((prev) => {
              if (prev.some((t) => t.id === fullTask.id)) {
                return prev;
              }
              if (projectId) {
                return [...prev, fullTask];
              }
              return [fullTask, ...prev];
            });
          }
        } catch (err) {
          console.error('[useTasks] Error handling realtime task insert:', err);
        }
      },
      onUpdate: (updatedTaskRow) => {
        if (ignore || !updatedTaskRow) return;

        // Immediate scalar update for instant UI responsiveness (Kanban status/position, title, etc.)
        setTasks((prev) => {
          const exists = prev.some((t) => t.id === updatedTaskRow.id);
          if (!exists) return prev;

          return prev.map((t) =>
            t.id === updatedTaskRow.id
              ? {
                  ...t,
                  ...updatedTaskRow,
                }
              : t
          );
        });

        // Background relation sync (e.g. assignee profile changes)
        taskService
          .getTask(updatedTaskRow.id)
          .then((fullTask) => {
            if (!ignore && fullTask) {
              setTasks((prev) =>
                prev.map((t) => (t.id === fullTask.id ? fullTask : t))
              );
            }
          })
          .catch(() => {
            // Scalar update is already active, ignore relation sync error
          });
      },
      onDelete: (deletedTaskRow) => {
        if (ignore || !deletedTaskRow) return;
        setTasks((prev) => prev.filter((t) => t.id !== deletedTaskRow.id));
      },
    });

    return () => {
      ignore = true;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [projectId, workspaceId, refreshTrigger, user?.id]);

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

  const moveTask = useCallback(
    async ({ taskId, destinationStatus, destinationPosition, affectedUpdates = [], optimisticTasks }) => {
      const previousTasks = tasks;
      if (optimisticTasks) {
        setTasks(optimisticTasks);
      }
      try {
        await taskService.moveTask(taskId, destinationStatus, destinationPosition, affectedUpdates);
      } catch (err) {
        setTasks(previousTasks);
        throw err;
      }
    },
    [tasks]
  );

  return {
    tasks,
    setTasks,
    loading,
    error,
    refreshTasks,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  };
};

export default useTasks;
