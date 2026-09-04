/**
 * TeamFlow Core Domain Constants
 */

// User Workspace Roles
export const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
}

// Role Descriptions for display & onboarding
export const ROLE_DESCRIPTIONS = {
  [ROLES.ADMIN]: 'Full access to workspace settings, billing, projects, and members',
  [ROLES.MANAGER]: 'Can create and manage projects, assign tasks, and invite members',
  [ROLES.MEMBER]: 'Can create, update, and comment on assigned tasks',
  [ROLES.VIEWER]: 'Read-only access to workspace projects and tasks',
}

// Task Statuses
export const TASK_STATUS = {
  BACKLOG: 'backlog',
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  DONE: 'done',
}

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.BACKLOG]: 'Backlog',
  [TASK_STATUS.TODO]: 'To Do',
  [TASK_STATUS.IN_PROGRESS]: 'In Progress',
  [TASK_STATUS.IN_REVIEW]: 'In Review',
  [TASK_STATUS.DONE]: 'Done',
}

// Task Priorities
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
