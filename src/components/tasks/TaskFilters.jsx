import React from 'react';
import { Search, X } from 'lucide-react';
import { TASK_PRIORITY_DETAILS } from '../../utils/constants';

export const TaskFilters = ({
  filters = {},
  onChange,
  projects = [],
  showProjectFilter = false,
  assignees = [],
}) => {
  const hasActiveFilters = Boolean(
    filters.search ||
    (filters.priority && filters.priority !== 'all') ||
    (filters.assigneeId && filters.assigneeId !== 'all') ||
    (filters.projectId && filters.projectId !== 'all')
  );

  const selectClass =
    'text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer';

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Search by title */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search tasks..."
          className="pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition w-44 sm:w-56"
        />
      </div>

      {/* Project filter (for workspace-level view) */}
      {showProjectFilter && projects.length > 0 && (
        <select
          value={filters.projectId || 'all'}
          onChange={(e) => onChange({ ...filters, projectId: e.target.value })}
          className={selectClass}
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      )}

      {/* Priority filter */}
      <select
        value={filters.priority || 'all'}
        onChange={(e) => onChange({ ...filters, priority: e.target.value })}
        className={selectClass}
      >
        <option value="all">All Priorities</option>
        {Object.entries(TASK_PRIORITY_DETAILS).map(([val, meta]) => (
          <option key={val} value={val}>
            {meta.label}
          </option>
        ))}
      </select>

      {/* Assignee filter */}
      {assignees.length > 0 && (
        <select
          value={filters.assigneeId || 'all'}
          onChange={(e) => onChange({ ...filters, assigneeId: e.target.value })}
          className={selectClass}
        >
          <option value="all">All Assignees</option>
          <option value="unassigned">Unassigned</option>
          {assignees.map((user) => {
            const name = user.full_name || user.email || user.id;
            return (
              <option key={user.id} value={user.id}>
                {name}
              </option>
            );
          })}
        </select>
      )}

      {/* Sort filter */}
      <select
        value={filters.sortBy || 'created_at'}
        onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}
        className={selectClass}
      >
        <option value="created_at">Newest First</option>
        <option value="due_date">Due Date</option>
      </select>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={() =>
            onChange({
              ...filters,
              search: '',
              priority: 'all',
              assigneeId: 'all',
              projectId: 'all',
            })
          }
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition ml-1 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          Reset Filters
        </button>
      )}
    </div>
  );
};

export default TaskFilters;
