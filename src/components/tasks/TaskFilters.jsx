import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import { TASK_PRIORITY_DETAILS, TASK_STATUS_DETAILS } from '../../utils/constants';
import { getActiveFilterInfo, DEFAULT_TASK_FILTERS } from '../../utils/taskFilters';

export const TaskFilters = ({
  filters = DEFAULT_TASK_FILTERS,
  onChange,
  projects = [],
  showProjectFilter = false,
  assignees = [],
  labels = [],
  showStatusFilter = false,
  defaultSort = 'newest',
}) => {
  const { hasActiveFilters, activeCount } = getActiveFilterInfo(filters, defaultSort);

  const selectClass =
    'text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer hover:border-slate-300 dark:hover:border-slate-700';

  const handleClear = () => {
    onChange({
      search: '',
      status: 'all',
      priority: 'all',
      assigneeId: 'all',
      projectId: 'all',
      labelId: 'all',
      sortBy: defaultSort,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 w-full">
      {/* Search by title or description */}
      <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search tasks by title, description..."
          className="w-full pl-8 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition hover:border-slate-300 dark:hover:border-slate-700"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => onChange({ ...filters, search: '' })}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Project filter (for workspace-level view) */}
      {showProjectFilter && projects.length > 0 && (
        <select
          value={filters.projectId || 'all'}
          onChange={(e) => onChange({ ...filters, projectId: e.target.value })}
          className={selectClass}
          aria-label="Filter by project"
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      )}

      {/* Optional Status filter dropdown (when tabs are not rendered) */}
      {showStatusFilter && (
        <select
          value={filters.status || 'all'}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className={selectClass}
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          {Object.entries(TASK_STATUS_DETAILS).map(([val, meta]) => (
            <option key={val} value={val}>
              {meta.label}
            </option>
          ))}
        </select>
      )}

      {/* Priority filter */}
      <select
        value={filters.priority || 'all'}
        onChange={(e) => onChange({ ...filters, priority: e.target.value })}
        className={selectClass}
        aria-label="Filter by priority"
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
          aria-label="Filter by assignee"
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

      {/* Label filter */}
      <select
        value={filters.labelId || 'all'}
        onChange={(e) => onChange({ ...filters, labelId: e.target.value })}
        className={selectClass}
        aria-label="Filter by label"
      >
        <option value="all">All Labels</option>
        {labels.map((lbl) => (
          <option key={lbl.id || lbl.name} value={lbl.id || lbl.name}>
            {lbl.name}
          </option>
        ))}
      </select>

      {/* Sort order filter */}
      <select
        value={filters.sortBy || defaultSort}
        onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}
        className={selectClass}
        aria-label="Sort tasks by"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="due_date">Due Date</option>
        <option value="priority">Priority (Highest)</option>
      </select>

      {/* Clear / Reset filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/60 transition cursor-pointer"
          title="Reset all filters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Clear Filters</span>
          <span className="w-4 h-4 rounded-full bg-rose-200 dark:bg-rose-900 text-[10px] flex items-center justify-center font-bold">
            {activeCount}
          </span>
        </button>
      )}
    </div>
  );
};

export default TaskFilters;
