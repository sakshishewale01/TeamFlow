import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Service to manage Supabase Realtime subscriptions for TeamFlow.
 * Provides unified, scoped channel lifecycle management for Tasks, Comments, and Notifications.
 */
export const realtimeService = {
  /**
   * Subscribe to real-time changes on tasks.
   * Can be scoped to a specific project (projectId) or workspace.
   *
   * @param {Object} options
   * @param {string} [options.projectId] - Optional project ID to filter changes
   * @param {Function} [options.onInsert] - Callback when a task is inserted
   * @param {Function} [options.onUpdate] - Callback when a task is updated
   * @param {Function} [options.onDelete] - Callback when a task is deleted
   * @returns {Function} Unsubscribe cleanup function
   */
  subscribeToTasks({ projectId, onInsert, onUpdate, onDelete } = {}) {
    if (!isSupabaseConfigured) {
      return () => {};
    }

    const channelId = `realtime-tasks-${projectId || 'all'}-${Math.random().toString(36).substring(2, 9)}`;
    const filter = projectId ? `project_id=eq.${projectId}` : undefined;

    const channel = supabase
      .channel(channelId)
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
