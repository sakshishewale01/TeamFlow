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
    description: 'Full access to workspaces, team settings, and billing',
  },
  [ROLES.MANAGER]: {
    label: 'Manager',
    color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    badgeColor: 'blue',
    description: 'Can manage projects, tasks, and team members',
  },
  [ROLES.MEMBER]: {
    label: 'Member',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    badgeColor: 'emerald',
    description: 'Can create and edit tasks, comments, and project items',
  },
  [ROLES.VIEWER]: {
    label: 'Viewer',
    color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    badgeColor: 'amber',
    description: 'Read-only access to workspaces and project boards',
  },
};

export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  APP: '/app',
  PROFILE: '/app/profile',
  UNAUTHORIZED: '/unauthorized',
};
