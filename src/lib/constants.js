/**
 * TeamFlow Core Domain Constants (Aligned with Canonical PostgreSQL Schema)
 */

// Canonical Workspace Roles
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member',
  VIEWER: 'viewer',
}

// Role Descriptions for display & onboarding
export const ROLE_DESCRIPTIONS = {
  [ROLES.ADMIN]: 'Full access to workspace settings, billing, projects, and members',
  [ROLES.MANAGER]: 'Can create and manage projects, assign tasks, and invite members',
  [ROLES.MEMBER]: 'Can create, update, and comment on assigned tasks',
  [ROLES.VIEWER]: 'Read-only access to workspace projects and tasks',
}

// Canonical Task Statuses
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done',
}

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.TODO]: 'To Do',
  [TASK_STATUS.IN_PROGRESS]: 'In Progress',
  [TASK_STATUS.REVIEW]: 'Review',
  [TASK_STATUS.DONE]: 'Done',
}

// Canonical Task Priorities
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
}

export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITY.LOW]: 'Low',
  [TASK_PRIORITY.MEDIUM]: 'Medium',
  [TASK_PRIORITY.HIGH]: 'High',
  [TASK_PRIORITY.URGENT]: 'Urgent',
}
