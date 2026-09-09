export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member',
  VIEWER: 'viewer',
};

export const ROLE_DETAILS = {
  [ROLES.ADMIN]: {
    label: 'Admin',
    color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
    badgeColor: 'purple',
    description: 'Full access to workspaces, team settings, and administration',
  },
  [ROLES.MANAGER]: {
    label: 'Manager',
    color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    badgeColor: 'blue',
    description: 'Can manage projects, tasks, and project team members',
  },
  [ROLES.MEMBER]: {
    label: 'Member',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    badgeColor: 'emerald',
    description: 'Can create and edit assigned tasks, comments, and items',
  },
  [ROLES.VIEWER]: {
    label: 'Viewer',
    color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    badgeColor: 'amber',
    description: 'Read-only access to workspaces, projects, and boards',
  },
};

export const PROJECT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
};

export const PROJECT_STATUS_DETAILS = {
  [PROJECT_STATUS.PLANNING]: {
    label: 'Planning',
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    badgeColor: 'blue',
  },
  [PROJECT_STATUS.ACTIVE]: {
    label: 'Active',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    badgeColor: 'emerald',
  },
  [PROJECT_STATUS.COMPLETED]: {
    label: 'Completed',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
    badgeColor: 'indigo',
  },
  [PROJECT_STATUS.ARCHIVED]: {
    label: 'Archived',
    color: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    badgeColor: 'slate',
  },
};

export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  PROJECT_DETAILS: '/projects/:projectId',
  TASKS: '/tasks',
  PROFILE: '/profile',
  UNAUTHORIZED: '/unauthorized',
  // Backward compatibility aliases
  APP: '/dashboard',
  WORKSPACES: '/projects',
};

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done',
};

export const TASK_STATUS_DETAILS = {
  [TASK_STATUS.TODO]: {
    label: 'To Do',
    badgeColor: 'blue',
    columnColor: 'border-t-blue-500',
    headerBg: 'bg-blue-50 dark:bg-blue-950/40',
    dotColor: 'bg-blue-500',
  },
  [TASK_STATUS.IN_PROGRESS]: {
    label: 'In Progress',
    badgeColor: 'amber',
    columnColor: 'border-t-amber-500',
    headerBg: 'bg-amber-50 dark:bg-amber-950/40',
    dotColor: 'bg-amber-500',
  },
  [TASK_STATUS.REVIEW]: {
    label: 'Review',
    badgeColor: 'purple',
    columnColor: 'border-t-purple-500',
    headerBg: 'bg-purple-50 dark:bg-purple-950/40',
    dotColor: 'bg-purple-500',
  },
  [TASK_STATUS.DONE]: {
    label: 'Done',
    badgeColor: 'emerald',
    columnColor: 'border-t-emerald-500',
    headerBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    dotColor: 'bg-emerald-500',
  },
};

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const TASK_PRIORITY_DETAILS = {
  [TASK_PRIORITY.LOW]: {
    label: 'Low',
    badgeColor: 'slate',
    borderColor: 'border-l-slate-400',
    dotColor: 'bg-slate-400',
  },
  [TASK_PRIORITY.MEDIUM]: {
    label: 'Medium',
    badgeColor: 'blue',
    borderColor: 'border-l-blue-500',
    dotColor: 'bg-blue-500',
  },
  [TASK_PRIORITY.HIGH]: {
    label: 'High',
    badgeColor: 'amber',
    borderColor: 'border-l-amber-500',
    dotColor: 'bg-amber-500',
  },
  [TASK_PRIORITY.URGENT]: {
    label: 'Urgent',
    badgeColor: 'rose',
    borderColor: 'border-l-rose-500',
    dotColor: 'bg-rose-500',
  },
};
