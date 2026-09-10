import React from 'react';
import { Calendar, User, Clock, Edit3, Trash2, Eye, Tag } from 'lucide-react';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import {
  TASK_STATUS_DETAILS,
  TASK_PRIORITY_DETAILS,
  TASK_STATUS,
} from '../../utils/constants';

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isOverdue(dateStr, status) {
  if (!dateStr || status === TASK_STATUS.DONE) return false;
  const due = new Date(dateStr);
  const now = new Date();
  // compare dates at midnight
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return due.getTime() < now.getTime();
}

export const TaskItem = ({
  task,
  showProject = false,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  canEdit = true,
  canDelete = true,
}) => {
  if (!task) return null;

  const statusMeta = TASK_STATUS_DETAILS[task.status] || TASK_STATUS_DETAILS.todo;
  const priorityMeta = TASK_PRIORITY_DETAILS[task.priority] || TASK_PRIORITY_DETAILS.medium;
  const overdue = isOverdue(task.due_date, task.status);
  const formattedDueDate = formatDate(task.due_date);

  const assigneeName = task.assignee?.full_name || task.assignee?.email || 'Unassigned';

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 sm:p-5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Side: Details & Title */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {/* Status Badge */}
            <Badge variant={statusMeta.badgeColor} size="sm">
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusMeta.dotColor || 'bg-current'}`} />
              {statusMeta.label}
            </Badge>

            {/* Priority Badge */}
            <Badge variant={priorityMeta.badgeColor} size="sm">
              {priorityMeta.label}
            </Badge>

            {/* Project Tag (optional for Workspace views) */}
            {showProject && task.project && (
              <span className="inline-flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
                {task.project.name}
              </span>
            )}

            {/* Labels */}
            {task.labels && task.labels.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {task.labels.map((lbl) => (
                  <span
                    key={lbl.id}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full text-white shadow-xs"
                    style={{ backgroundColor: lbl.color || '#6366f1' }}
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {lbl.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <button
            type="button"
            onClick={() => onView && onView(task)}
            className="text-left font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition text-base line-clamp-1 cursor-pointer"
          >
            {task.title}
          </button>

          {/* Description Snippet */}
          {task.description && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Metadata Footer */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
            {/* Assignee */}
            <div className="flex items-center gap-1.5">
              {task.assignee ? (
                <>
                  <Avatar
                    src={task.assignee.avatar_url}
                    name={task.assignee.full_name || task.assignee.email}
                    size="xs"
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {assigneeName}
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                  <User className="w-3.5 h-3.5" />
                  <span>Unassigned</span>
                </div>
              )}
            </div>

            {/* Due Date */}
            {task.due_date && (
              <div
                className={`flex items-center gap-1 font-medium ${
                  overdue
                    ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
                title={overdue ? 'This task is overdue' : 'Due date'}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {formattedDueDate}
                  {overdue && ' (Overdue)'}
                </span>
              </div>
            )}

            {/* Created Timestamp */}
            <div className="hidden md:flex items-center gap-1 text-slate-400 dark:text-slate-500">
              <Clock className="w-3 h-3" />
              <span>Created {formatDate(task.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Status Select + Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
          {/* Quick status toggle dropdown if editable */}
          {canEdit && onStatusChange && (
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task.id, e.target.value)}
              className="text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition cursor-pointer"
              title="Change task status"
            >
              <option value={TASK_STATUS.TODO}>To Do</option>
              <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
              <option value={TASK_STATUS.REVIEW}>Review</option>
              <option value={TASK_STATUS.DONE}>Done</option>
            </select>
          )}

          <div className="flex items-center gap-1">
            {/* View Details */}
            {onView && (
              <button
                type="button"
                onClick={() => onView(task)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="View task details"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}

            {/* Edit */}
            {canEdit && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Edit task"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            {/* Delete */}
            {canDelete && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(task)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
