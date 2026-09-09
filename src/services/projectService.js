import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const projectService = {
  async getProjects(workspaceId, filters = {}) {
    if (!isSupabaseConfigured || !workspaceId) return [];

    let query = supabase
      .from('projects')
      .select(`
        *,
        creator:profiles!fk_projects_created_by_profile(id, full_name, email, avatar_url),
        members:project_members(
          id,
          user_id,
          added_at,
          user:profiles!fk_project_members_profile(id, full_name, email, avatar_url)
        )
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.search && filters.search.trim()) {
      query = query.ilike('name', `%${filters.search.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }

    return (data || []).map((project) => ({
      ...project,
      memberCount: project.members?.length || 0,
    }));
  },

  async getProject(projectId) {
    if (!isSupabaseConfigured || !projectId) return null;

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        workspace:workspaces(id, name, owner_id),
        creator:profiles!fk_projects_created_by_profile(id, full_name, email, avatar_url),
        members:project_members(
          id,
          project_id,
          user_id,
          added_at,
          user:profiles!fk_project_members_profile(id, full_name, email, avatar_url)
        )
      `)
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      throw error;
    }

    return {
      ...data,
      memberCount: data.members?.length || 0,
    };
  },

  async createProject(workspaceId, userId, { name, description, status, startDate, endDate }) {
    if (!isSupabaseConfigured || !workspaceId || !userId) {
      throw new Error('Supabase is not configured, or workspace/user is missing.');
    }

    if (!name || !name.trim()) {
      throw new Error('Project name is required.');
    }

    const insertPayload = {
      workspace_id: workspaceId,
      created_by: userId,
      name: name.trim(),
      description: description ? description.trim() : null,
      status: status || 'planning',
      start_date: startDate || null,
      end_date: endDate || null,
    };

    const { data, error } = await supabase
      .from('projects')
      .insert(insertPayload)
      .select(`
        *,
        creator:profiles!fk_projects_created_by_profile(id, full_name, email, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw error;
    }

    return {
      ...data,
      memberCount: 1,
    };
  },

  async updateProject(projectId, updates) {
    if (!isSupabaseConfigured || !projectId) {
      throw new Error('Project ID is missing.');
    }

    const payload = {};
    if (updates.name !== undefined) payload.name = updates.name.trim();
    if (updates.description !== undefined) payload.description = updates.description ? updates.description.trim() : null;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.startDate !== undefined) payload.start_date = updates.startDate || null;
    if (updates.endDate !== undefined) payload.end_date = updates.endDate || null;

    const { data, error } = await supabase
      .from('projects')
      .update(payload)
      .eq('id', projectId)
      .select(`
        *,
        creator:profiles!fk_projects_created_by_profile(id, full_name, email, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }

    return data;
  },

  async deleteProject(projectId) {
    if (!isSupabaseConfigured || !projectId) {
      throw new Error('Project ID is missing.');
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }

    return true;
  },

  async getProjectMembers(projectId) {
    if (!isSupabaseConfigured || !projectId) return [];

    const { data, error } = await supabase
      .from('project_members')
      .select(`
        id,
        project_id,
        user_id,
        added_at,
        user:profiles!fk_project_members_profile(id, full_name, email, avatar_url)
      `)
      .eq('project_id', projectId)
      .order('added_at', { ascending: true });

    if (error) {
      console.error('Error fetching project members:', error);
      throw error;
    }

    return data || [];
  },

  async addProjectMember(projectId, userId) {
    if (!isSupabaseConfigured || !projectId || !userId) {
      throw new Error('Project ID and User ID are required.');
    }

    const { data, error } = await supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: userId,
      })
      .select(`
        id,
        project_id,
        user_id,
        added_at,
        user:profiles!fk_project_members_profile(id, full_name, email, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error adding project member:', error);
      throw error;
    }

    return data;
  },

  async removeProjectMember(projectId, userId) {
    if (!isSupabaseConfigured || !projectId || !userId) {
      throw new Error('Project ID and User ID are required.');
    }

    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing project member:', error);
      throw error;
    }

    return true;
  },
};
