import { supabase, isSupabaseConfigured } from '../lib/supabase';

const VALID_STATUSES = ['todo', 'in_progress', 'review', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const TASK_SELECT = `
  id,
  project_id,
  title,
  description,
  status,
  priority,
  position,
  due_date,
  created_at,
  updated_at,
  assignee_id,
  created_by,
  assignee:profiles!tasks_assignee_id_fkey(id, full_name, email, avatar_url),
  creator:profiles!tasks_created_by_fkey(id, full_name, email, avatar_url),
  project:projects(id, name, workspace_id),
  task_label_links(
    label:task_labels(id, name, color)
  ),
  comments(count)
`;

function formatTask(task) {
  if (!task) return null;
  const labels = (task.task_label_links || [])
    .map((link) => link?.label)
    .filter(Boolean);

  const commentCount = task.comments?.[0]?.count ?? 0;

  return {
    ...task,
    labels,
    comment_count: commentCount,
  };
}

export const taskService = {
  /**
   * Fetch all tasks for a specific project with optional filters
   */
  async getTasks(projectId, filters = {}) {
    if (!isSupabaseConfigured || !projectId) return [];

    let query = supabase
      .from('tasks')
      .select(TASK_SELECT)
      .eq('project_id', projectId);

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.priority && filters.priority !== 'all') {
      query = query.eq('priority', filters.priority);
    }

    if (filters.assigneeId && filters.assigneeId !== 'all') {
      if (filters.assigneeId === 'unassigned') {
        query = query.is('assignee_id', null);
      } else {
        query = query.eq('assignee_id', filters.assigneeId);
      }
    }

    if (filters.search && filters.search.trim()) {
      query = query.ilike('title', `%${filters.search.trim()}%`);
    }

    // Default sorting
    if (filters.sortBy === 'due_date') {
      query = query.order('due_date', { ascending: true, nullsFirst: false });
    } else if (filters.sortBy === 'position') {
      query = query.order('status').order('position', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('[taskService] getTasks error:', error);
      throw error;
    }

    return (data || []).map(formatTask);
  },

  /**
   * Fetch tasks across an entire workspace with optional filters
   */
  async getWorkspaceTasks(workspaceId, filters = {}) {
    if (!isSupabaseConfigured || !workspaceId) return [];

    let projectIds = [];

    if (filters.projectId && filters.projectId !== 'all') {
      projectIds = [filters.projectId];
    } else {
      const { data: projects, error: pError } = await supabase
        .from('projects')
        .select('id')
        .eq('workspace_id', workspaceId);

      if (pError) {
        console.error('[taskService] getWorkspaceTasks project lookup error:', pError);
        throw pError;
      }

      if (!projects || projects.length === 0) {
        return [];
      }

      projectIds = projects.map((p) => p.id);
    }

    let query = supabase
      .from('tasks')
      .select(TASK_SELECT)
      .in('project_id', projectIds);

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.priority && filters.priority !== 'all') {
      query = query.eq('priority', filters.priority);
    }

    if (filters.assigneeId && filters.assigneeId !== 'all') {
      if (filters.assigneeId === 'unassigned') {
        query = query.is('assignee_id', null);
      } else {
        query = query.eq('assignee_id', filters.assigneeId);
      }
    }

    if (filters.search && filters.search.trim()) {
      query = query.ilike('title', `%${filters.search.trim()}%`);
    }

    if (filters.sortBy === 'due_date') {
      query = query.order('due_date', { ascending: true, nullsFirst: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('[taskService] getWorkspaceTasks error:', error);
      throw error;
    }

    return (data || []).map(formatTask);
  },

  /**
   * Fetch a single task by ID
   */
  async getTask(taskId) {
    if (!isSupabaseConfigured || !taskId) return null;

    const { data, error } = await supabase
      .from('tasks')
      .select(TASK_SELECT)
      .eq('id', taskId)
      .single();

    if (error) {
      console.error('[taskService] getTask error:', error);
      throw error;
    }

    return formatTask(data);
  },

  /**
   * Create a new task
   */
  async createTask(projectId, userId, taskData) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    if (!projectId) throw new Error('Project ID is required.');
    if (!userId) throw new Error('User ID is required.');

    const title = taskData.title?.trim();
    if (!title) throw new Error('Task title is required.');
    if (title.length > 100) throw new Error('Task title cannot exceed 100 characters.');

    const description = taskData.description?.trim() || null;
    if (description && description.length > 500) {
      throw new Error('Task description cannot exceed 500 characters.');
    }

    const status = VALID_STATUSES.includes(taskData.status) ? taskData.status : 'todo';
    const priority = VALID_PRIORITIES.includes(taskData.priority) ? taskData.priority : 'medium';
    const dueDate = taskData.dueDate || taskData.due_date || null;
    const assigneeId = taskData.assigneeId || taskData.assignee_id || null;

    // Get next position in that status column
    const { data: existing } = await supabase
      .from('tasks')
      .select('position')
      .eq('project_id', projectId)
      .eq('status', status)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = (existing?.[0]?.position ?? -1) + 1;

    const { data: newTask, error: insertError } = await supabase
      .from('tasks')
      .insert({
        project_id: projectId,
        created_by: userId,
        title,
        description,
        status,
        priority,
        position: nextPosition,
        due_date: dueDate,
        assignee_id: assigneeId,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[taskService] createTask error:', insertError);
      throw insertError;
    }

    // Attach labels if provided
    if (taskData.labelIds && taskData.labelIds.length > 0) {
      const labelLinks = taskData.labelIds.map((labelId) => ({
        task_id: newTask.id,
        label_id: labelId,
      }));

      const { error: labelError } = await supabase
        .from('task_label_links')
        .insert(labelLinks);

      if (labelError) {
        console.error('[taskService] setTaskLabels error during create:', labelError);
      }
    }

    return await this.getTask(newTask.id);
  },

  /**
   * Update an existing task
   */
  async updateTask(taskId, updates) {
    if (!isSupabaseConfigured || !taskId) throw new Error('Task ID is required.');

    const payload = {};

    if (updates.title !== undefined) {
      const trimmed = updates.title.trim();
      if (!trimmed) throw new Error('Task title cannot be empty.');
      if (trimmed.length > 100) throw new Error('Task title cannot exceed 100 characters.');
      payload.title = trimmed;
    }

    if (updates.description !== undefined) {
      const trimmedDesc = updates.description?.trim() || null;
      if (trimmedDesc && trimmedDesc.length > 500) {
        throw new Error('Task description cannot exceed 500 characters.');
      }
      payload.description = trimmedDesc;
    }

    if (updates.status !== undefined) {
      if (!VALID_STATUSES.includes(updates.status)) {
        throw new Error(`Invalid status: ${updates.status}`);
      }
      payload.status = updates.status;
    }

    if (updates.priority !== undefined) {
      if (!VALID_PRIORITIES.includes(updates.priority)) {
        throw new Error(`Invalid priority: ${updates.priority}`);
      }
      payload.priority = updates.priority;
    }

    if (updates.dueDate !== undefined) {
      payload.due_date = updates.dueDate || null;
    } else if (updates.due_date !== undefined) {
      payload.due_date = updates.due_date || null;
    }

    if (updates.assigneeId !== undefined) {
      payload.assignee_id = updates.assigneeId || null;
    } else if (updates.assignee_id !== undefined) {
      payload.assignee_id = updates.assignee_id || null;
    }

    if (updates.position !== undefined) {
      payload.position = updates.position;
    }

    if (Object.keys(payload).length > 0) {
      const { error: updateError } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', taskId);

      if (updateError) {
        console.error('[taskService] updateTask error:', updateError);
        throw updateError;
      }
    }

    // Sync labels if explicitly provided
    if (updates.labelIds !== undefined) {
      // Remove current label links
      const { error: deleteLinksError } = await supabase
        .from('task_label_links')
        .delete()
        .eq('task_id', taskId);

      if (deleteLinksError) {
        console.error('[taskService] remove label links error:', deleteLinksError);
        throw deleteLinksError;
      }

      // Add new links
      if (updates.labelIds && updates.labelIds.length > 0) {
        const links = updates.labelIds.map((labelId) => ({
          task_id: taskId,
          label_id: labelId,
        }));

        const { error: insertLinksError } = await supabase
          .from('task_label_links')
          .insert(links);

        if (insertLinksError) {
          console.error('[taskService] insert label links error:', insertLinksError);
          throw insertLinksError;
        }
      }
    }

    return await this.getTask(taskId);
  },

  /**
   * Delete a task
   */
  async deleteTask(taskId) {
    if (!isSupabaseConfigured || !taskId) throw new Error('Task ID is required.');

    const { error } = await supabase.from('tasks').delete().eq('id', taskId);

    if (error) {
      console.error('[taskService] deleteTask error:', error);
      throw error;
    }

    return true;
  },

  /**
   * Bulk update task positions and optional statuses in Supabase
   * @param {Array<{ id: string, status?: string, position: number }>} updates
   */
  async updateTaskPositions(updates) {
    if (!isSupabaseConfigured || !updates?.length) return [];

    const promises = updates.map(({ id, status, position }) => {
      const payload = { position };
      if (status) payload.status = status;
      return supabase.from('tasks').update(payload).eq('id', id);
    });

    const results = await Promise.all(promises);
    const failed = results.find((r) => r.error);
    if (failed?.error) {
      console.error('[taskService] updateTaskPositions error:', failed.error);
      throw failed.error;
    }

    return true;
  },

  /**
   * Move a task to a new status and position, applying any shifted task positions atomically
   */
  async moveTask(taskId, destinationStatus, destinationPosition, affectedUpdates = []) {
    if (!isSupabaseConfigured || !taskId) throw new Error('Task ID is required.');

    const allUpdates = [
      { id: taskId, status: destinationStatus, position: destinationPosition },
      ...affectedUpdates,
    ];

    await this.updateTaskPositions(allUpdates);
    return await this.getTask(taskId);
  },

  /**
   * Fetch eligible assignees for a workspace
   */
  async getWorkspaceAssignees(workspaceId) {
    if (!isSupabaseConfigured || !workspaceId) return [];

    const { data, error } = await supabase
      .from('workspace_members')
      .select(`
        user_id,
        role,
        user:profiles!fk_workspace_members_profile(id, full_name, email, avatar_url)
      `)
      .eq('workspace_id', workspaceId);

    if (error) {
      console.error('[taskService] getWorkspaceAssignees error:', error);
      return [];
    }

    return (data || [])
      .map((m) => m.user)
      .filter(Boolean);
  },

  /**
   * Fetch eligible assignees for a project (its workspace members)
   */
  async getProjectTaskAssignees(projectId) {
    if (!isSupabaseConfigured || !projectId) return [];

    const { data: project, error: pError } = await supabase
      .from('projects')
      .select('workspace_id')
      .eq('id', projectId)
      .single();

    if (pError || !project?.workspace_id) {
      console.error('[taskService] getProjectTaskAssignees project lookup error:', pError);
      return [];
    }

    return await this.getWorkspaceAssignees(project.workspace_id);
  },

  /**
   * Fetch task labels for a workspace
   */
  async getTaskLabels(workspaceId) {
    if (!isSupabaseConfigured || !workspaceId) return [];

    const { data, error } = await supabase
      .from('task_labels')
      .select('id, name, color, workspace_id')
      .eq('workspace_id', workspaceId)
      .order('name', { ascending: true });

    if (error) {
      console.error('[taskService] getTaskLabels error:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Create a new task label in a workspace
   */
  async createTaskLabel(workspaceId, { name, color }) {
    if (!isSupabaseConfigured || !workspaceId) {
      throw new Error('Workspace ID is required.');
    }

    const trimmed = name?.trim();
    if (!trimmed) throw new Error('Label name is required.');

    const { data, error } = await supabase
      .from('task_labels')
      .insert({
        workspace_id: workspaceId,
        name: trimmed,
        color: color || '#6366f1',
      })
      .select('id, name, color, workspace_id')
      .single();

    if (error) {
      console.error('[taskService] createTaskLabel error:', error);
      throw error;
    }

    return data;
  },
};
