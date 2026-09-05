import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const workspaceService = {
  async getWorkspaces(userId) {
    if (!isSupabaseConfigured || !userId) return [];

    const { data, error } = await supabase
      .from('workspaces')
      .select(`
        *,
        owner:profiles!fk_workspaces_owner_profile(id, full_name, email, avatar_url),
        members:workspace_members(id, user_id, role)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching workspaces:', error);
      throw error;
    }

    // Attach current user's role and memberCount to each workspace
    return (data || []).map((ws) => {
      const userMembership = ws.members?.find((m) => m.user_id === userId);
      const isOwner = ws.owner_id === userId;
      const role = isOwner ? 'admin' : (userMembership?.role || 'member');
      return {
        ...ws,
        userRole: role,
        memberCount: ws.members?.length || 1,
      };
    });
  },

  async getWorkspace(id) {
    if (!isSupabaseConfigured || !id) return null;

    const { data, error } = await supabase
      .from('workspaces')
      .select(`
        *,
        owner:profiles!fk_workspaces_owner_profile(id, full_name, email, avatar_url),
        members:workspace_members(
          id,
          user_id,
          role,
          created_at,
          user:profiles!fk_workspace_members_profile(id, full_name, email, avatar_url)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching workspace:', error);
      throw error;
    }

    return data;
  },

  async createWorkspace(userId, { name, description }) {
    if (!isSupabaseConfigured || !userId) {
      throw new Error('Supabase is not configured or user ID is missing.');
    }

    if (!name || !name.trim()) {
      throw new Error('Workspace name is required.');
    }

    const { data, error } = await supabase
      .from('workspaces')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        owner_id: userId,
      })
      .select(`
        *,
        owner:profiles!fk_workspaces_owner_profile(id, full_name, email, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }

    return {
      ...data,
      userRole: 'admin',
      memberCount: 1,
    };
  },

  async updateWorkspace(id, { name, description }) {
    if (!isSupabaseConfigured || !id) {
      throw new Error('Workspace ID is missing.');
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description ? description.trim() : null;

    const { data, error } = await supabase
      .from('workspaces')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        owner:profiles!fk_workspaces_owner_profile(id, full_name, email, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error updating workspace:', error);
      throw error;
    }

    return data;
  },

  async deleteWorkspace(id) {
    if (!isSupabaseConfigured || !id) {
      throw new Error('Workspace ID is missing.');
    }

    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting workspace:', error);
      throw error;
    }

    return true;
  },

  async getWorkspaceMembers(workspaceId) {
    if (!isSupabaseConfigured || !workspaceId) return [];

    const { data, error } = await supabase
      .from('workspace_members')
      .select(`
        id,
        workspace_id,
        user_id,
        role,
        created_at,
        user:profiles!fk_workspace_members_profile(id, full_name, email, avatar_url)
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching workspace members:', error);
      throw error;
    }

    return data || [];
  },
};
