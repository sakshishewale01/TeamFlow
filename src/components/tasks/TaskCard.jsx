import React from 'react';
import { MessageSquare, Clock } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { TASK_PRIORITY_DETAILS } from '../../utils/constants';

export const TaskCard = ({ task, onClick, onDragStart, onDragEnd }) => {
  const priorityMeta = TASK_PRIORITY_DETAILS[task.priority] || TASK_PRIORITY_DETAILS.medium;

  const formattedDue = task.due_date
    ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== 'done';

  const commentCount = task.comment_count ?? 0;
  const assigneeName = task.assignee?.full_name || task.assignee?.email || null;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`
        group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800
        shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800
        p-3 cursor-pointer select-none transition-all duration-150 active:opacity-70
        border-l-4 ${priorityMeta.borderColor}
      `}
    >
      {/* Priority dot */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug flex-1">
          {task.title}
        </p>
        <span
          className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${priorityMeta.dotColor}`}
          title={`Priority: ${priorityMeta.label}`}
        />
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between gap-2 mt-2.5">
        <div className="flex items-center gap-2">
          {/* Due date */}
          {formattedDue && (
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-medium ${
                isOverdue
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <Clock className="w-3 h-3" />
              {formattedDue}
            </span>
          )}

          {/* Comment count */}
          {commentCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
              <MessageSquare className="w-3 h-3" />
              {commentCount}
            </span>
          )}
        </div>

        {/* Assignee avatar */}
        {task.assignee && (
          <Avatar
            src={task.assignee.avatar_url}
            name={assigneeName}
            size="xs"
            title={assigneeName}
          />
        )}
      </div>
    </div>
  );
};

export default TaskCard;
