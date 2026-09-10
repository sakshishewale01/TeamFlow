import React from 'react';
import { Calendar, Clock, User } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import {
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
  });
}

function isOverdue(dateStr, status) {
  if (!dateStr || status === TASK_STATUS.DONE) return false;
  const due = new Date(dateStr);
  const now = new Date();
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return due.getTime() < now.getTime();
}

export const KanbanTaskCard = ({
  task,
  canDrag = true,
  onClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  isDragging = false,
}) => {
  if (!task) return null;

  const priorityMeta = TASK_PRIORITY_DETAILS[task.priority] || TASK_PRIORITY_DETAILS.medium;
  const overdue = isOverdue(task.due_date, task.status);
  const formattedDueDate = formatDate(task.due_date);
  const assigneeName = task.assignee?.full_name || task.assignee?.email || 'Unassigned';

  const handleDragStart = (e) => {
    if (!canDrag) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    onDragStart?.(e, task);
  };

  return (
    <div
      draggable={canDrag}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOver?.(e, task)}
      onClick={() => onClick?.(task)}
      className={`
        group relative bg-white dark:bg-slate-900 rounded-xl border
        p-3.5 select-none transition-all duration-150
        border-l-4 ${priorityMeta.borderColor}
        ${canDrag ? 'cursor-grab active:cursor-grabbing hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700' : 'cursor-pointer hover:shadow-sm'}
        ${isDragging ? 'opacity-40 scale-95 border-dashed border-indigo-400 dark:border-indigo-500' : 'opacity-100 border-slate-200/90 dark:border-slate-800 shadow-xs'}
      `}
    >
      {/* Top row: Priority badge + Labels */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <Badge variant={priorityMeta.badgeColor} size="xs">
          <span className={`w-1.5 h-1.5 rounded-full mr-1 ${priorityMeta.dotColor}`} />
          {priorityMeta.label}
        </Badge>

        {task.labels && task.labels.length > 0 && (
          <div className="flex items-center gap-1 overflow-hidden">
            {task.labels.slice(0, 2).map((lbl) => (
              <span
                key={lbl.id}
                className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-md text-white truncate max-w-[80px]"
                style={{ backgroundColor: lbl.color || '#6366f1' }}
                title={lbl.name}
              >
                {lbl.name}
              </span>
            ))}
            {task.labels.length > 2 && (
              <span className="text-[10px] text-slate-400 font-medium">
                +{task.labels.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {task.title}
      </h4>

      {/* Description Snippet (optional if brief) */}
      {task.description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
          {task.description}
        </p>
      )}

      {/* Footer: Due date + Assignee avatar */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
        {/* Due Date */}
        {formattedDueDate ? (
          <div
            className={`flex items-center gap-1 font-medium ${
              overdue
                ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded-md'
                : 'text-slate-400 dark:text-slate-500'
            }`}
            title={overdue ? 'Overdue' : 'Due date'}
          >
            {overdue ? <Clock className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
            <span>{formattedDueDate}</span>
          </div>
        ) : (
          <span />
        )}

        {/* Assignee */}
        <div className="flex items-center gap-1.5 shrink-0" title={assigneeName}>
          {task.assignee ? (
            <Avatar
              src={task.assignee.avatar_url}
              name={task.assignee.full_name || task.assignee.email}
              size="xs"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <User className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KanbanTaskCard;
