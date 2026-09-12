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
      workspaceId: workspaceId || undefined,
      onInsert: async (newTask) => {
        if (ignore || !newTask) return;

        // Scope check for projectId
        if (projectId && newTask.project_id && newTask.project_id !== projectId) {
          return;
        }

        // If it's already an enriched full task (from broadcast)
        if (newTask.project || newTask.labels || newTask.assignee || newTask.creator) {
          if (workspaceId && newTask.project?.workspace_id && newTask.project.workspace_id !== workspaceId) {
            return;
          }

          setTasks((prev) => {
            if (prev.some((t) => t.id === newTask.id)) return prev;
            return projectId ? [...prev, newTask] : [newTask, ...prev];
          });
          return;
        }

        // If it's a raw database row (from postgres_changes), fetch the full task
        try {
          const fullTask = await taskService.getTask(newTask.id);
          if (!ignore && fullTask) {
            if (workspaceId && fullTask.project?.workspace_id !== workspaceId) {
              return;
            }

            setTasks((prev) => {
              if (prev.some((t) => t.id === fullTask.id)) return prev;
              return projectId ? [...prev, fullTask] : [fullTask, ...prev];
            });
          }
        } catch (err) {
          console.error('[useTasks] Error handling realtime task insert:', err);
        }
      },
      onUpdate: (updatedTask) => {
        if (ignore || !updatedTask) return;

        // If it's already an enriched full task (from broadcast)
        if (updatedTask.project || updatedTask.labels || updatedTask.assignee || updatedTask.creator) {
          setTasks((prev) => {
            const exists = prev.some((t) => t.id === updatedTask.id);
            if (!exists) {
              if (projectId && updatedTask.project_id === projectId) {
                return [...prev, updatedTask];
              }
              return prev;
            }
            return prev.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t));
          });
          return;
        }

        // Immediate scalar update for instant UI responsiveness (Kanban status/position, title, etc.)
        setTasks((prev) => {
          const exists = prev.some((t) => t.id === updatedTask.id);
          if (!exists) return prev;

          return prev.map((t) =>
            t.id === updatedTask.id
              ? {
                  ...t,
                  ...updatedTask,
                }
              : t
          );
        });

        // Background relation sync for raw database row
        taskService
          .getTask(updatedTask.id)
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
      onMove: ({ taskId, destinationStatus, destinationPosition, affectedUpdates = [], task }) => {
        if (ignore || !taskId) return;

        setTasks((prev) => {
          const exists = prev.some((t) => t.id === taskId);
          if (!exists) return prev;

          return prev.map((t) => {
            if (t.id === taskId) {
              return {
                ...t,
                ...(task || {}),
                status: destinationStatus,
                position: destinationPosition,
              };
            }
            const affected = affectedUpdates.find((u) => u.id === t.id);
            if (affected) {
              return {
                ...t,
                position: affected.position !== undefined ? affected.position : t.position,
                status: affected.status || t.status,
              };
            }
            return t;
          });
        });
      },
      onDelete: (deletedTask) => {
        if (ignore || !deletedTask) return;
        const targetId = deletedTask.id || deletedTask.taskId;
        if (!targetId) return;
        setTasks((prev) => prev.filter((t) => t.id !== targetId));
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

      // Broadcast to project and workspace peers
      realtimeService.broadcastTaskEvent({
        projectId: targetProjectId,
        workspaceId: created?.project?.workspace_id || workspaceId,
        event: 'task:insert',
        payload: { task: created },
      });

      return created;
    },
    [projectId, workspaceId, userId, refreshTasks]
  );

  const updateTask = useCallback(
    async (taskId, updates) => {
      const updated = await taskService.updateTask(taskId, updates);
      refreshTasks();

      // Broadcast to project and workspace peers
      realtimeService.broadcastTaskEvent({
        projectId: updated?.project_id || projectId,
        workspaceId: updated?.project?.workspace_id || workspaceId,
        event: 'task:update',
        payload: { task: updated },
      });

      return updated;
    },
    [projectId, workspaceId, refreshTasks]
  );

  const deleteTask = useCallback(
    async (taskId) => {
      const target = tasks.find((t) => t.id === taskId);
      const targetProjectId = target?.project_id || projectId;
      const targetWorkspaceId = target?.project?.workspace_id || workspaceId;

      await taskService.deleteTask(taskId);
      refreshTasks();

      // Broadcast to project and workspace peers
      realtimeService.broadcastTaskEvent({
        projectId: targetProjectId,
        workspaceId: targetWorkspaceId,
        event: 'task:delete',
        payload: { taskId },
      });
    },
    [tasks, projectId, workspaceId, refreshTasks]
  );

  const moveTask = useCallback(
    async ({ taskId, destinationStatus, destinationPosition, affectedUpdates = [], optimisticTasks }) => {
      const previousTasks = tasks;
      if (optimisticTasks) {
        setTasks(optimisticTasks);
      }
      try {
        const moved = await taskService.moveTask(taskId, destinationStatus, destinationPosition, affectedUpdates);

        // Broadcast move event to project and workspace peers
        realtimeService.broadcastTaskEvent({
          projectId: moved?.project_id || projectId,
          workspaceId: moved?.project?.workspace_id || workspaceId,
          event: 'task:move',
          payload: {
            taskId,
            destinationStatus,
            destinationPosition,
            affectedUpdates,
            task: moved,
          },
        });
      } catch (err) {
        setTasks(previousTasks);
        throw err;
      }
    },
    [tasks, projectId, workspaceId]
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
