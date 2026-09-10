import React from 'react';
import PropTypes from 'prop-types';
import {
  CheckCircle2,
  MessageSquare,
  UserPlus,
  ClipboardList,
  Bell,
  Trash2,
  Check,
} from 'lucide-react';
import { formatRelativeTime } from '../../utils/dateUtils';

/**
 * Maps notification type to corresponding icon & color scheme.
 */
function getTypeMeta(type) {
  switch (type) {
    case 'task_assigned':
      return {
        icon: ClipboardList,
        bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50',
      };
    case 'comment_added':
      return {
        icon: MessageSquare,
        bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
      };
    case 'project_member_added':
      return {
        icon: UserPlus,
        bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
      };
    case 'task_status_changed':
      return {
        icon: CheckCircle2,
        bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
      };
    default:
      return {
        icon: Bell,
        bg: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      };
  }
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }) {
  const meta = getTypeMeta(notification.type);
  const IconComponent = meta.icon;
  const isUnread = !notification.is_read;

  return (
    <div
      role="article"
      aria-label={`Notification: ${notification.message}`}
      className={`group relative flex items-start gap-3 p-3.5 transition rounded-xl border ${
        isUnread
          ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40'
          : 'bg-white dark:bg-slate-900/50 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
      }`}
    >
      {/* Type Icon */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${meta.bg}`}
      >
        <IconComponent className="w-4 h-4" />
      </div>

      {/* Message and Timestamp */}
      <div className="flex-1 min-w-0 pr-1">
        <p
          className={`text-sm leading-snug break-words ${
            isUnread
              ? 'font-medium text-slate-900 dark:text-slate-100'
              : 'text-slate-700 dark:text-slate-300'
          }`}
        >
          {notification.message}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {formatRelativeTime(notification.created_at)}
          </span>
          {isUnread && (
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500"
              title="Unread"
              aria-label="Unread"
            />
          )}
        </div>
      </div>

      {/* Action buttons (hover or mobile visible) */}
      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
        {isUnread && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            className="p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
            title="Mark as read"
            aria-label="Mark as read"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
          title="Delete notification"
          aria-label="Delete notification"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    user_id: PropTypes.string.isRequired,
    type: PropTypes.string,
    message: PropTypes.string.isRequired,
    is_read: PropTypes.bool.isRequired,
    created_at: PropTypes.string.isRequired,
  }).isRequired,
  onMarkAsRead: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
