import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

export const searchService = {
  /**
   * Search projects and tasks in the active workspace.
   * Scoped strictly to the active workspace ID and authorized via RLS.
   *
   * @param {string} workspaceId - Active workspace UUID
   * @param {string} query - Raw search query string
   * @returns {Promise<{ projects: Array, tasks: Array }>}
   */
  async searchWorkspace(workspaceId, query) {
    if (!isSupabaseConfigured || !workspaceId || !query || !query.trim()) {
      return { projects: [], tasks: [] };
    }

    const cleanQuery = query.trim();

    try {
      // 1. Search projects belonging to this active workspace
      const projectsQuery = supabase
        .from('projects')
        .select('id, name, description, status, workspace_id, created_at')
        .eq('workspace_id', workspaceId)
        .or(`name.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`)
        .order('name', { ascending: true })
        .limit(6);

      // 2. Fetch project IDs in workspace to scope tasks
      const workspaceProjectsQuery = supabase
        .from('projects')
        .select('id')
        .eq('workspace_id', workspaceId);

      const [projectsRes, workspaceProjectsRes] = await Promise.all([
        projectsQuery,
        workspaceProjectsQuery,
      ]);

      if (projectsRes.error) {
        console.error('[searchService] Projects search error:', projectsRes.error);
        throw projectsRes.error;
      }

      const projects = projectsRes.data || [];
      const projectIds = (workspaceProjectsRes.data || []).map((p) => p.id);

      let tasks = [];
      if (projectIds.length > 0) {
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('id, title, description, status, priority, project_id, project:projects(id, name)')
          .in('project_id', projectIds)
          .or(`title.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`)
          .order('created_at', { ascending: false })
          .limit(8);

        if (tasksError) {
          console.error('[searchService] Tasks search error:', tasksError);
          throw tasksError;
        }

        tasks = tasksData || [];
      }

      return { projects, tasks };
    } catch (err) {
      console.error('[searchService] Error performing workspace search:', err);
      return { projects: [], tasks: [] };
    }
  },
};

export default searchService;
