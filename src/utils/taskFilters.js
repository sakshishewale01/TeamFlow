import { TASK_STATUS } from './constants.js';

export const DEFAULT_TASK_FILTERS = {
  search: '',
  status: 'all',
  priority: 'all',
  assigneeId: 'all',
  projectId: 'all',
  labelId: 'all',
  sortBy: 'newest',
};

const PRIORITY_ORDER = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Filter an array of tasks by multiple criteria (search, status, priority, assignee, project, label).
 * Matching logic: tasks must satisfy ALL active filter conditions simultaneously.
 *
 * @param {Array} tasks - List of task objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered tasks array
 */
export function filterTasks(tasks = [], filters = {}) {
  if (!tasks || tasks.length === 0) return [];

  const searchQuery = (filters.search || '').trim().toLowerCase();
  const statusFilter = filters.status || 'all';
  const priorityFilter = filters.priority || 'all';
  const assigneeFilter = filters.assigneeId || 'all';
  const projectFilter = filters.projectId || 'all';
  const labelFilter = filters.labelId || 'all';

  return tasks.filter((task) => {
    // 1. Search Query: Matches title or description (case-insensitive)
    if (searchQuery) {
      const titleMatch = task.title ? task.title.toLowerCase().includes(searchQuery) : false;
      const descMatch = task.description ? task.description.toLowerCase().includes(searchQuery) : false;
      if (!titleMatch && !descMatch) {
        return false;
      }
    }

    // 2. Status Filter
    if (statusFilter !== 'all') {
      if (task.status !== statusFilter) {
        return false;
      }
    }

    // 3. Priority Filter
    if (priorityFilter !== 'all') {
      if (task.priority !== priorityFilter) {
        return false;
      }
    }

    // 4. Assignee Filter
    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'unassigned') {
        if (task.assignee_id) return false;
      } else {
        if (task.assignee_id !== assigneeFilter) return false;
      }
    }

    // 5. Project Filter
    if (projectFilter !== 'all') {
      if (task.project_id !== projectFilter) {
        return false;
      }
    }

    // 6. Label Filter: Task must possess the selected label
    if (labelFilter !== 'all') {
      const hasLabel = (task.labels || []).some(
        (lbl) => lbl && ((lbl.id && lbl.id === labelFilter) || (lbl.name && lbl.name === labelFilter))
      );
      if (!hasLabel) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort tasks without mutating original array
 *
 * @param {Array} tasks
 * @param {string} sortBy - 'newest' | 'oldest' | 'due_date' | 'priority' | 'position'
 * @returns {Array} Sorted tasks array
 */
export function sortTasks(tasks = [], sortBy = 'newest') {
  if (!tasks || tasks.length === 0) return [];

  const copy = [...tasks];

  switch (sortBy) {
    case 'oldest':
      return copy.sort((a, b) => {
        const timeA = new Date(a.created_at).getTime() || 0;
        const timeB = new Date(b.created_at).getTime() || 0;
        return timeA - timeB;
      });

    case 'due_date':
      return copy.sort((a, b) => {
        const hasA = Boolean(a.due_date);
        const hasB = Boolean(b.due_date);

        // Put tasks without due dates at the end deterministically
        if (!hasA && !hasB) {
          const timeA = new Date(a.created_at).getTime() || 0;
          const timeB = new Date(b.created_at).getTime() || 0;
          return timeB - timeA;
        }
        if (!hasA) return 1;
        if (!hasB) return -1;

        const dateDiff = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        if (dateDiff !== 0) return dateDiff;

        // Deterministic fallback for identical due dates
        const timeA = new Date(a.created_at).getTime() || 0;
        const timeB = new Date(b.created_at).getTime() || 0;
        return timeB - timeA;
      });

    case 'priority':
      return copy.sort((a, b) => {
        const rankA = PRIORITY_ORDER[a.priority] || 0;
        const rankB = PRIORITY_ORDER[b.priority] || 0;
        if (rankB !== rankA) {
          return rankB - rankA;
        }
        const timeA = new Date(a.created_at).getTime() || 0;
        const timeB = new Date(b.created_at).getTime() || 0;
        return timeB - timeA;
      });

    case 'position':
      return copy.sort((a, b) => {
        const posDiff = (a.position ?? 0) - (b.position ?? 0);
        if (posDiff !== 0) return posDiff;
        const timeA = new Date(a.created_at).getTime() || 0;
        const timeB = new Date(b.created_at).getTime() || 0;
        return timeA - timeB;
      });

    case 'newest':
    default:
      return copy.sort((a, b) => {
        const timeA = new Date(a.created_at).getTime() || 0;
        const timeB = new Date(b.created_at).getTime() || 0;
        return timeB - timeA;
      });
  }
}

/**
 * Filter and sort tasks in one pipeline
 */
export function filterAndSortTasks(tasks = [], filters = {}) {
  const filtered = filterTasks(tasks, filters);
  return sortTasks(filtered, filters.sortBy || 'newest');
}

/**
 * Compute status counts against tasks that match all active filters EXCEPT status.
 * This guarantees tab counters never collapse when switching between status tabs.
 *
 * @param {Array} allTasks
 * @param {Object} filters
 * @returns {Object} Counts per status: { all, todo, in_progress, review, done }
 */
export function computeStatusCounts(allTasks = [], filters = {}) {
  // Filter using all criteria EXCEPT status
  const baseFiltered = filterTasks(allTasks, {
    ...filters,
    status: 'all',
  });

  const counts = {
    all: baseFiltered.length,
    [TASK_STATUS.TODO]: 0,
    [TASK_STATUS.IN_PROGRESS]: 0,
    [TASK_STATUS.REVIEW]: 0,
    [TASK_STATUS.DONE]: 0,
  };

  baseFiltered.forEach((task) => {
    const status = task.status || TASK_STATUS.TODO;
    if (counts[status] !== undefined) {
      counts[status] += 1;
    }
  });

  return counts;
}

/**
 * Determine if any non-default filters are active, and count them
 */
export function getActiveFilterInfo(filters = {}, defaultSort = 'newest') {
  let count = 0;

  if (filters.search && filters.search.trim()) count += 1;
  if (filters.status && filters.status !== 'all') count += 1;
  if (filters.priority && filters.priority !== 'all') count += 1;
  if (filters.assigneeId && filters.assigneeId !== 'all') count += 1;
  if (filters.projectId && filters.projectId !== 'all') count += 1;
  if (filters.labelId && filters.labelId !== 'all') count += 1;
  if (filters.sortBy && filters.sortBy !== defaultSort) count += 1;

  return {
    hasActiveFilters: count > 0,
    activeCount: count,
  };
}
