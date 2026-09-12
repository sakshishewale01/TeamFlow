import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Service to manage Supabase Realtime subscriptions for TeamFlow.
 * Provides unified, scoped channel lifecycle management for Tasks, Comments, and Notifications.
 */
export const realtimeService = {
  /**
   * Helper to get a stable, shared channel name for task collaboration.
   */
  getTasksChannelName(projectId, workspaceId) {
    if (projectId) return `realtime-tasks-project-${projectId}`;
    if (workspaceId) return `realtime-tasks-workspace-${workspaceId}`;
    return 'realtime-tasks-global';
  },

  /**
   * Subscribe to real-time changes on tasks.
   * Can be scoped to a specific project (projectId) or workspace (workspaceId).
   * Supports both peer broadcast events (instant collaborative UI updates)
   * and postgres_changes (database CDC WAL updates).
   *
   * @param {Object} options
   * @param {string} [options.projectId] - Optional project ID to filter changes
   * @param {string} [options.workspaceId] - Optional workspace ID to filter changes
   * @param {Function} [options.onInsert] - Callback when a task is inserted
   * @param {Function} [options.onUpdate] - Callback when a task is updated
   * @param {Function} [options.onDelete] - Callback when a task is deleted
   * @param {Function} [options.onMove] - Callback when a task is moved
   * @returns {Function} Unsubscribe cleanup function
   */
  subscribeToTasks({ projectId, workspaceId, onInsert, onUpdate, onDelete, onMove } = {}) {
    if (!isSupabaseConfigured) {
      return () => {};
    }

    const channelName = this.getTasksChannelName(projectId, workspaceId);
    const filter = projectId ? `project_id=eq.${projectId}` : undefined;

    const channel = supabase.channel(channelName);

    // 1. Peer broadcast listeners
    channel
      .on('broadcast', { event: 'task:insert' }, ({ payload }) => {
        if (onInsert && payload?.task) {
          onInsert(payload.task);
        }
      })
      .on('broadcast', { event: 'task:update' }, ({ payload }) => {
        if (onUpdate && payload?.task) {
          onUpdate(payload.task);
        }
      })
      .on('broadcast', { event: 'task:delete' }, ({ payload }) => {
        if (onDelete && (payload?.task || payload?.taskId)) {
          onDelete(payload.task || { id: payload.taskId });
        }
      })
      .on('broadcast', { event: 'task:move' }, ({ payload }) => {
        if (onMove && payload) {
          onMove(payload);
        } else if (onUpdate && payload?.task) {
          onUpdate(payload.task);
        }
      });

    // 2. Postgres changes listeners (database CDC)
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tasks',
          ...(filter ? { filter } : {}),
        },
        (payload) => {
          if (onInsert && payload?.new) {
            onInsert(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
          ...(filter ? { filter } : {}),
        },
        (payload) => {
          if (onUpdate && payload?.new) {
            onUpdate(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'tasks',
          ...(filter ? { filter } : {}),
        },
        (payload) => {
          if (onDelete && payload?.old) {
            onDelete(payload.old);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('[realtimeService] Tasks channel error:', err);
        }
      });

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        console.warn('[realtimeService] Error removing tasks channel:', err);
      }
    };
  },

  /**
   * Broadcast a task event to project and workspace channels.
   *
   * @param {Object} options
   * @param {string} [options.projectId] - Target project ID
   * @param {string} [options.workspaceId] - Target workspace ID
   * @param {string} options.event - Event name ('task:insert' | 'task:update' | 'task:delete' | 'task:move')
   * @param {Object} options.payload - Event payload data
   */
  async broadcastTaskEvent({ projectId, workspaceId, event, payload }) {
    if (!isSupabaseConfigured) return;

    const channelsToNotify = new Set();
    if (projectId) {
      channelsToNotify.add(`realtime-tasks-project-${projectId}`);
    }
    if (workspaceId) {
      channelsToNotify.add(`realtime-tasks-workspace-${workspaceId}`);
    }
    if (channelsToNotify.size === 0) {
      channelsToNotify.add('realtime-tasks-global');
    }

    const promises = Array.from(channelsToNotify).map(async (chName) => {
      try {
        const channel = supabase.channel(chName);
        await channel.send({
          type: 'broadcast',
          event,
          payload,
        });
      } catch {
        // Silently catch broadcast transport error
      }
    });

    await Promise.allSettled(promises);
  },

  /**
   * Subscribe to real-time changes on comments for a specific task.
   *
   * @param {Object} options
   * @param {string} options.taskId - The task ID to listen to
   * @param {Function} [options.onInsert] - Callback when a comment is added
   * @param {Function} [options.onUpdate] - Callback when a comment is updated
   * @param {Function} [options.onDelete] - Callback when a comment is deleted
   * @returns {Function} Unsubscribe cleanup function
   */
  subscribeToComments({ taskId, onInsert, onUpdate, onDelete } = {}) {
    if (!isSupabaseConfigured || !taskId) {
      return () => {};
    }

    const channelId = `realtime-comments-${taskId}-${Math.random().toString(36).substring(2, 9)}`;

    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `task_id=eq.${taskId}`,
        },
        (payload) => {
          if (onInsert && payload?.new) {
            onInsert(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments',
          filter: `task_id=eq.${taskId}`,
        },
        (payload) => {
          if (onUpdate && payload?.new) {
            onUpdate(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `task_id=eq.${taskId}`,
        },
        (payload) => {
          if (onDelete && payload?.old) {
            onDelete(payload.old);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('[realtimeService] Comments channel error:', err);
        }
      });

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        console.warn('[realtimeService] Error removing comments channel:', err);
      }
    };
  },

  /**
   * Subscribe to real-time changes on notifications for a specific user.
   *
   * @param {Object} options
   * @param {string} options.userId - Recipient user UUID
   * @param {Function} [options.onInsert] - Callback when a notification is created
   * @param {Function} [options.onUpdate] - Callback when a notification is updated/read
   * @param {Function} [options.onDelete] - Callback when a notification is deleted
   * @returns {Function} Unsubscribe cleanup function
   */
  subscribeToNotifications({ userId, onInsert, onUpdate, onDelete } = {}) {
    if (!isSupabaseConfigured || !userId) {
      return () => {};
    }

    const channelId = `realtime-notifications-${userId}-${Math.random().toString(36).substring(2, 9)}`;

    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (onInsert && payload?.new) {
            onInsert(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (onUpdate && payload?.new) {
            onUpdate(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (onDelete && payload?.old) {
            onDelete(payload.old);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('[realtimeService] Notifications channel error:', err);
        }
      });

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        console.warn('[realtimeService] Error removing notifications channel:', err);
      }
    };
  },

  /**
   * Clean up all active channels (e.g. on user logout).
   */
  async removeAllSubscriptions() {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.removeAllChannels();
    } catch (err) {
      console.warn('[realtimeService] Error removing all channels:', err);
    }
  },
};

export default realtimeService;
