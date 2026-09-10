import React from 'react';
import { Calendar, AlertTriangle, Clock, CheckCircle, User } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { TASK_PRIORITY_DETAILS, TASK_STATUS_DETAILS } from '../../utils/constants';

function formatDate(dateStr) {
  if (!dateStr) return 'No date';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const UpcomingDeadlines = ({
  upcomingTasks = [],
  overdueTasks = [],
  totalOverdueCount = 0,
  onTaskClick,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Deadlines & Delivery
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Imminent deadlines and active overdue items
          </p>
        </div>
        {totalOverdueCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            {totalOverdueCount} Overdue
          </span>
        )}
      </div>

      {/* Overdue Section (if any overdue tasks exist) */}
      {overdueTasks.length > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-800 dark:text-rose-300">
            <span>Action Required: Overdue Work</span>
            <span className="text-[11px] font-normal text-rose-600 dark:text-rose-400">
              Needs immediate attention
            </span>
          </div>
          <div className="space-y-1.5 divide-y divide-rose-200/50 dark:divide-rose-900/40">
            {overdueTasks.map((task) => {
              const priorityMeta = TASK_PRIORITY_DETAILS[task.priority] || TASK_PRIORITY_DETAILS.medium;

              return (
                <div
                  key={task.id}
                  onClick={() => onTaskClick?.(task)}
                  className="pt-1.5 first:pt-0 flex items-center justify-between gap-3 text-xs cursor-pointer hover:bg-rose-100/50 dark:hover:bg-rose-900/30 p-1.5 rounded-lg transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {task.project?.name && (
                        <span className="truncate max-w-[120px]">
                          {task.project.name}
                        </span>
                      )}
                      <span>&bull;</span>
                      <span className="text-rose-600 dark:text-rose-400 font-medium">
                        Due {formatDate(task.due_date)} ({task.daysOverdue}d ago)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`w-2 h-2 rounded-full ${priorityMeta.dotColor}`}
                      title={`Priority: ${priorityMeta.label}`}
                    />
                    {task.assignee ? (
                      <Avatar
                        src={task.assignee.avatar_url}
                        name={task.assignee.full_name || task.assignee.email}
                        size="xs"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <User className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Tasks List */}
      <div>
        <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Upcoming ({upcomingTasks.length})
        </h5>

        {upcomingTasks.length === 0 ? (
          <div className="py-8 text-center rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800">
            <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-1.5 opacity-80" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No upcoming deadlines
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              All tasks are on schedule or have no due date set.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/60">
            {upcomingTasks.map((task) => {
              const priorityMeta = TASK_PRIORITY_DETAILS[task.priority] || TASK_PRIORITY_DETAILS.medium;
              const statusMeta = TASK_STATUS_DETAILS[task.status] || TASK_STATUS_DETAILS.todo;

              return (
                <div
                  key={task.id}
                  onClick={() => onTaskClick?.(task)}
                  className="pt-1.5 first:pt-0 flex items-center justify-between gap-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-xl transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {task.project?.name && (
                        <span className="truncate max-w-[120px] font-medium text-slate-600 dark:text-slate-400">
                          {task.project.name}
                        </span>
                      )}
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400">
                        <Clock className="w-3 h-3" />
                        {task.daysUntilDue === 0
                          ? 'Due today'
                          : task.daysUntilDue === 1
                          ? 'Due tomorrow'
                          : `Due in ${task.daysUntilDue} days`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={statusMeta.badgeColor} size="xs">
                      {statusMeta.label}
                    </Badge>
                    <span
                      className={`w-2 h-2 rounded-full ${priorityMeta.dotColor}`}
                      title={`Priority: ${priorityMeta.label}`}
                    />
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingDeadlines;
