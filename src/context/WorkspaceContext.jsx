import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { workspaceService } from '../services/workspaceService';
import { WorkspaceContext } from './workspaceContextDef';

export const WorkspaceProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadWorkspaces() {
      if (!isAuthenticated || !user?.id) {
        if (!ignore) {
          setWorkspaces([]);
          setActiveWorkspaceState(null);
          setLoading(false);
        }
        return;
      }

      try {
        if (!ignore) {
          setLoading(true);
          setError(null);
        }
        const list = await workspaceService.getWorkspaces(user.id);
        if (!ignore) {
          setWorkspaces(list);

          if (list.length > 0) {
            const savedId = localStorage.getItem('teamflow_active_workspace_id');
            const matched = list.find((w) => w.id === savedId) || list[0];
            setActiveWorkspaceState(matched);
            localStorage.setItem('teamflow_active_workspace_id', matched.id);
          } else {
            setActiveWorkspaceState(null);
            localStorage.removeItem('teamflow_active_workspace_id');
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error('[WorkspaceContext] Error fetching workspaces:', err);
          setError(err.message || 'Failed to load workspaces.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadWorkspaces();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, user?.id, refreshTrigger]);

  const refreshWorkspaces = (selectWorkspaceId = null) => {
    if (selectWorkspaceId) {
      localStorage.setItem('teamflow_active_workspace_id', selectWorkspaceId);
    }
    setRefreshTrigger((prev) => prev + 1);
  };

  const switchWorkspace = (workspace) => {
    if (!workspace) return;
    setActiveWorkspaceState(workspace);
    localStorage.setItem('teamflow_active_workspace_id', workspace.id);
  };

  const createWorkspace = async ({ name, description }) => {
    const newWorkspace = await workspaceService.createWorkspace(user.id, { name, description });
    refreshWorkspaces(newWorkspace.id);
    return newWorkspace;
  };

  const updateWorkspace = async (id, data) => {
    const updated = await workspaceService.updateWorkspace(id, data);
    refreshWorkspaces(activeWorkspace?.id === id ? id : null);
    return updated;
  };

  const deleteWorkspace = async (id) => {
    await workspaceService.deleteWorkspace(id);
    refreshWorkspaces();
  };

  // Role in current active workspace
  const workspaceRole = activeWorkspace?.userRole || 'member';
  const isWorkspaceAdmin = workspaceRole === 'admin';
  const isWorkspaceManager = workspaceRole === 'manager' || isWorkspaceAdmin;
  const isWorkspaceViewer = workspaceRole === 'viewer';
  const canManageWorkspace = isWorkspaceAdmin || isWorkspaceManager;

  const value = {
    workspaces,
    activeWorkspace,
    loading,
    error,
    workspaceRole,
    isWorkspaceAdmin,
    isWorkspaceManager,
    isWorkspaceViewer,
    canManageWorkspace,
    switchWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    refreshWorkspaces,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceProvider;