import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';

/**
 * Hook to manage user in-app notifications.
 * Automatically loads notifications on mount when user is authenticated.
 */
export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = user?.id;

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const [list, count] = await Promise.all([
        notificationService.getNotifications(userId),
        notificationService.getUnreadCount(userId),
      ]);
      setNotifications(list);
      setUnreadCount(count);
    } catch (err) {
      console.error('[useNotifications] fetch error:', err);
      setError(err.message || 'Could not load notifications');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      if (!userId) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const [list, count] = await Promise.all([
          notificationService.getNotifications(userId),
          notificationService.getUnreadCount(userId),
        ]);
        if (!ignore) {
          setNotifications(list);
          setUnreadCount(count);
        }
      } catch (err) {
        if (!ignore) {
          console.error('[useNotifications] load error:', err);
          setError(err.message || 'Could not load notifications');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [userId]);

  /**
   * Mark a single notification as read (optimistic update).
   */
  const markAsRead = useCallback(
    async (notificationId) => {
      if (!notificationId) return;

      // Find the notification to check if it's currently unread
      const target = notifications.find((n) => n.id === notificationId);
      const wasUnread = target && !target.is_read;

      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      try {
        await notificationService.markAsRead(notificationId);
      } catch (err) {
        console.error('[useNotifications] markAsRead error:', err);
        // Revert on error
        fetchNotifications();
      }
    },
    [notifications, fetchNotifications]
  );

  /**
   * Mark all notifications as read (optimistic update).
   */
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      await notificationService.markAllAsRead(userId);
    } catch (err) {
      console.error('[useNotifications] markAllAsRead error:', err);
      // Revert on error
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  /**
   * Delete an individual notification (optimistic update).
   */
  const deleteNotification = useCallback(
    async (notificationId) => {
      if (!notificationId) return;

      const target = notifications.find((n) => n.id === notificationId);
      const wasUnread = target && !target.is_read;

      // Optimistic update
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      try {
        await notificationService.deleteNotification(notificationId);
      } catch (err) {
        console.error('[useNotifications] deleteNotification error:', err);
        // Revert on error
        fetchNotifications();
      }
    },
    [notifications, fetchNotifications]
  );

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
