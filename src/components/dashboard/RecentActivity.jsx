import React, { useState } from 'react';
import { History, MessageSquare, CheckSquare } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { formatRelativeTime } from '../../utils/dateUtils';
import { TASK_STATUS_DETAILS } from '../../utils/constants';

export const RecentActivity = ({
  recentTasks = [],
  recentComments = [],
  onTaskClick,
}) => {
  const [activeTab, setActiveTab] = useState('tasks');

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      {/* Header with Activity Tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Recent Activity
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Latest task updates and team discussions
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Tasks ({recentTasks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('comments')}
            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'comments'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Comments ({recentComments.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Recent Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-2">
          {recentTasks.length === 0 ? (
            <div className="py-8 text-center rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800">
              <CheckSquare className="w-6 h-6 text-slate-400 mx-auto mb-1.5 opacity-60" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No recent tasks
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Tasks created in this workspace will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentTasks.map((task) => {
                const statusMeta = TASK_STATUS_DETAILS[task.status] || TASK_STATUS_DETAILS.todo;
                const relativeTime = formatRelativeTime(task.updated_at || task.created_at);

                return (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick?.(task)}
                    className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-xl transition-colors"
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
                        <span>{relativeTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={statusMeta.badgeColor} size="xs">
                        {statusMeta.label}
                      </Badge>
                      {task.assignee && (
                        <Avatar
                          src={task.assignee.avatar_url}
                          name={task.assignee.full_name || task.assignee.email}
                          size="xs"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Recent Comments */}
      {activeTab === 'comments' && (
        <div className="space-y-2">
          {recentComments.length === 0 ? (
            <div className="py-8 text-center rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800">
              <MessageSquare className="w-6 h-6 text-slate-400 mx-auto mb-1.5 opacity-60" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No recent comments
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Task discussions and team feedback will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2 divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentComments.map((comment) => {
                const authorName =
                  comment.user?.full_name || comment.user?.email?.split('@')[0] || 'Member';
                const relativeTime = formatRelativeTime(comment.created_at);

                return (
                  <div
                    key={comment.id}
                    onClick={() => comment.task && onTaskClick?.(comment.task)}
                    className="pt-2 first:pt-0 flex items-start gap-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-xl transition-colors"
                  >
                    <Avatar
                      src={comment.user?.avatar_url}
                      name={authorName}
                      size="xs"
                      className="mt-0.5 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {authorName}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          on
                        </span>
                        <span className="font-medium text-indigo-600 dark:text-indigo-400 truncate max-w-[150px]">
                          {comment.task?.title || 'Task'}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-auto">
                          {relativeTime}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 line-clamp-2 leading-snug">
                        "{comment.content}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
