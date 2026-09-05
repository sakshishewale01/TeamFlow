import { useAuth } from './useAuth';
import { ROLES, ROLE_DETAILS } from '../utils/constants';

export const useRole = () => {
  const { role, isAdmin, isManager, isMember, isViewer, hasRole, profile } = useAuth();

  const currentRole = role || ROLES.MEMBER;
  const roleMeta = ROLE_DETAILS[currentRole] || ROLE_DETAILS[ROLES.MEMBER];

  return {
    role: currentRole,
    roleMeta,
    isAdmin,
    isManager,
    isMember,
    isViewer,
    hasRole,
    canManageTeam: isAdmin || isManager,
    canCreateProjects: isAdmin || isManager || isMember,
    isReadOnly: isViewer,
    profile,
  };
};

export default useRole;
