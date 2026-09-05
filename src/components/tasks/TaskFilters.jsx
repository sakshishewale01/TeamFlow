import React from 'react';
import { Search, X } from 'lucide-react';
import { TASK_PRIORITY_DETAILS } from '../../utils/constants';

export const TaskFilters = ({ filters, onChange, projectMembers = [] }) => {
  const hasActiveFilters =
    filters.search || filters.status || filters.priority || filters.assigneeId;

  const selectClass =
    'text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search tasks..."
          className="pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition w-44"
        />
      </div>

      {/* Priority filter */}
      <select
        value={filters.priority || ''}
        onChange={(e) => onChange({ ...filters, priority: e.target.value })}
        className={selectClass}
      >
        <option value="">All Priorities</option>
        {Object.entries(TASK_PRIORITY_DETAILS).map(([val, meta]) => (
          <option key={val} value={val}>{meta.label}</option>
        ))}
      </select>

      {/* Assignee filter */}
      <select
        value={filters.assigneeId || ''}
        onChange={(e) => onChange({ ...filters, assigneeId: e.target.value })}
        className={selectClass}
      >
        <option value="">All Members</option>
        <option value="unassigned">Unassigned</option>
        {projectMembers.map((m) => {
          const name = m.user?.full_name || m.user?.email || m.user_id;
          return (
            <option key={m.user_id} value={m.user_id}>{name}</option>
          );
        })}
      </select>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={() => onChange({ search: '', priority: '', assigneeId: '' })}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}
    </div>
  );
};

export default TaskFilters;
