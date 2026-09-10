import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Service to manage in-app notifications.
 *
 * DB Schema:
 *   id: uuid (PK)
 *   user_id: uuid (FK profiles.id)
 *   type: text
 *   message: text
 *   is_read: boolean (default false)
 *   created_at: timestamptz (default now())
 */
export const notificationService = {
  /**
   * Fetch notifications for a specific user.
   * RLS ensures users can only read their own notifications.
   * @param {string} userId
   * @param {number} [limit=50]
   */
  async getNotifications(userId, limit = 50) {
    if (!isSupabaseConfigured) {
      throw new Error('Database is not configured');
    }
    if (!userId) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('id, user_id, type, message, is_read, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[notificationService] getNotifications error:', error);
      throw new Error(error.message || 'Failed to fetch notifications');
    }

    return data || [];
  },

  /**
   * Get unread notification count for a user.
   * @param {string} userId
   */
  async getUnreadCount(userId) {
    if (!isSupabaseConfigured || !userId) return 0;

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('[notificationService] getUnreadCount error:', error);
      return 0;
    }

    return count || 0;
  },

  /**
   * Safe internal creator.
   * Prevents creating self-notifications if actorId matches recipient userId.
   * @param {Object} params
   * @param {string} params.userId - Recipient user UUID
   * @param {string} params.type - Canonical notification type
   * @param {string} params.message - Notification message text
   * @param {string} [params.actorId] - ID of the user performing the action (for self-notification check)
   */
  async createNotification({ userId, type, message, actorId }) {
    if (!isSupabaseConfigured) return null;
    if (!userId || !type || !message) return null;

    // Strict self-notification suppression:
    // If an actor is provided and is the recipient, skip creation silently.
    if (actorId && actorId === userId) {
      return null;
    }

    const cleanMessage = message.trim();
    if (!cleanMessage) return null;

    try {
      // First attempt the secure server-controlled RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'create_system_notification',
        {
          p_user_id: userId,
          p_type: type,
          p_message: cleanMessage,
        }
      );

      if (!rpcError) {
        return { id: rpcData, user_id: userId, type, message: cleanMessage, is_read: false };
      }

      // If the RPC is not yet installed in the active DB, fall back to direct insert
      if (rpcError.message?.includes('function') || rpcError.code === '42883') {
        const { data, error } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type,
            message: cleanMessage,
            is_read: false,
          })
          .select('id, user_id, type, message, is_read, created_at')
          .single();

        if (error) {
          console.error('[notificationService] createNotification fallback error:', error);
          return null;
        }
        return data;
      }

      console.error('[notificationService] create_system_notification RPC error:', rpcError);
      return null;
    } catch (err) {
      console.error('[notificationService] createNotification unexpected error:', err);
      return null;
    }
  },

  /**
   * Mark a single notification as read.
   * RLS ensures users can only update their own notifications.
   * @param {string} notificationId
   */
  async markAsRead(notificationId) {
    if (!isSupabaseConfigured) {
      throw new Error('Database is not configured');
    }
    if (!notificationId) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('[notificationService] markAsRead error:', error);
      throw new Error(error.message || 'Failed to mark notification as read');
    }
  },

  /**
   * Mark all unread notifications as read for a user.
   * @param {string} userId
   */
  async markAllAsRead(userId) {
    if (!isSupabaseConfigured) {
      throw new Error('Database is not configured');
    }
    if (!userId) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('[notificationService] markAllAsRead error:', error);
      throw new Error(error.message || 'Failed to mark all notifications as read');
    }
  },

  /**
   * Delete an individual notification.
   * RLS ensures users can only delete their own notifications.
   * @param {string} notificationId
   */
  async deleteNotification(notificationId) {
    if (!isSupabaseConfigured) {
      throw new Error('Database is not configured');
    }
    if (!notificationId) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('[notificationService] deleteNotification error:', error);
      throw new Error(error.message || 'Failed to delete notification');
    }
  },
};
