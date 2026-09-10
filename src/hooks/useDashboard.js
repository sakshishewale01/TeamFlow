import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';
import { useWorkspace } from './useWorkspace';

export const useDashboard = () => {
  const { activeWorkspace } = useWorkspace() || {};
  const workspaceId = activeWorkspace?.id;

  const [data, setData] = useState(() => dashboardService.getEmptyDashboard());
  const [loading, setLoading] = useState(Boolean(workspaceId));
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!workspaceId) {
      setData(dashboardService.getEmptyDashboard());
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await dashboardService.getDashboardData(workspaceId);
      setData(result);
    } catch (err) {
      console.error('[useDashboard] refresh error:', err);
      setError(err.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!workspaceId) {
        setData(dashboardService.getEmptyDashboard());
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await dashboardService.getDashboardData(workspaceId);
        if (!ignore) {
          setData(result);
        }
      } catch (err) {
        if (!ignore) {
          console.error('[useDashboard] load error:', err);
          setError(err.message || 'Unable to load dashboard data.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [workspaceId]);

  return {
    data,
    loading,
    error,
    refresh,
    activeWorkspace,
  };
};

export default useDashboard;
