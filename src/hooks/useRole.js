import { useAuth } from './useAuth';
import { useWorkspace } from './useWorkspace';
import { ROLES, ROLE_DETAILS } from '../utils/constants';

export const useRole = () => {
  const { profile } = useAuth();
  const workspaceContext = useWorkspace() || {};
  const { activeWorkspace } = workspaceContext;

  // Workspace-level role is the source of truth
  const currentRole = activeWorkspace?.userRole || ROLES.MEMBER;
  const roleMeta = ROLE_DETAILS[currentRole] || ROLE_DETAILS[ROLES.MEMBER];

  const isAdmin = currentRole === ROLES.ADMIN;
  const isManager = currentRole === ROLES.MANAGER || isAdmin;
  const isMember = currentRole === ROLES.MEMBER || isManager;
  const isViewer = currentRole === ROLES.VIEWER;

  const hasRole = (allowedRoles) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(currentRole);
  };

  return {
    role: currentRole,
    roleMeta,
    isAdmin,
    isManager,
    isMember,
    isViewer,
    hasRole,
    canManageTeam: isAdmin || isManager,
    canCreateProjects: isAdmin || isManager,
    isReadOnly: isViewer,
    profile,
  };
};

export default useRole;
