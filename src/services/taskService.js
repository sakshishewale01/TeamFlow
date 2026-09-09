import { supabase, isSupabaseConfigured } from '../lib/supabase';

const TASK_SELECT = `
  id, project_id, title, description,
  status, priority, position, due_date, created_at, updated_at,
  assignee_id,
  assignee:profiles!tasks_assignee_id_fkey(id, full_name, email, avatar_url),
  creator:profiles!tasks_created_by_fkey(id, full_name, email, avatar_url),
  comment_count:comments(count)
`;

export const taskService = {
  /** Fetch all tasks for a project, ordered by status + position */
  async getTasks(projectId) {
    if (!isSupabaseConfigured || !projectId) return [];

    const { data, error } = await supabase
      .from('tasks')
      .select(TASK_SELECT)
      .eq('project_id', projectId)
      .order('status')
      .order('position');

    if (error) {
      console.error('[taskService] getTasks error:', error);
      throw error;
    }

    return (data || []).map((t) => ({
      ...t,
      comment_count: t.comment_count?.[0]?.count ?? 0,
    }));
  },

  /** Create a new task */
  async createTask(projectId, workspaceId, userId, { title, description, status, priority, dueDate, assigneeId }) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    if (!title?.trim()) throw new Error('Task title is required.');

    // Get next position in that status column
    const { data: existing } = await supabase
      .from('tasks')
      .select('position')
      .eq('project_id', projectId)
      .eq('status', status || 'todo')
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = (existing?.[0]?.position ?? -1) + 1;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        project_id: projectId,
        created_by: userId,
        title: title.trim(),
        description: description?.trim() || null,
        status: status || 'todo',
        priority: priority || 'medium',
        position: nextPosition,
        due_date: dueDate || null,
        assignee_id: assigneeId || null,
      })
      .select(TASK_SELECT)
      .single();

    if (error) {
      console.error('[taskService] createTask error:', error);
      throw error;
    }

    return { ...data, comment_count: 0 };
  },

  /** Update task fields */
  async updateTask(taskId, updates) {
    if (!isSupabaseConfigured || !taskId) throw new Error('Task ID is required.');

    const payload = {};
    if (updates.title !== undefined) payload.title = updates.title.trim();
    if (updates.description !== undefined) payload.description = updates.description?.trim() || null;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.dueDate !== undefined) payload.due_date = updates.dueDate || null;
    if (updates.assigneeId !== undefined) payload.assignee_id = updates.assigneeId || null;

    const { data, error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', taskId)
      .select(TASK_SELECT)
      .single();

    if (error) {
      console.error('[taskService] updateTask error:', error);
      throw error;
    }

    return { ...data, comment_count: data.comment_count?.[0]?.count ?? 0 };
  },

  /** Move task to a new status column and assign a position */
  async moveTask(taskId, newStatus, newPosition) {
    if (!isSupabaseConfigured || !taskId) throw new Error('Task ID is required.');

    const { data, error } = await supabase
      .from('tasks')
      .update({ status: newStatus, position: newPosition })
      .eq('id', taskId)
      .select(TASK_SELECT)
      .single();

    if (error) {
      console.error('[taskService] moveTask error:', error);
      throw error;
    }

    return { ...data, comment_count: data.comment_count?.[0]?.count ?? 0 };
  },

  /** Bulk update positions for tasks in a column (after drag reorder) */
  async bulkUpdatePositions(updates) {
    // updates = [{ id, position }]
    if (!isSupabaseConfigured || !updates?.length) return;

    const promises = updates.map(({ id, position }) =>
      supabase.from('tasks').update({ position }).eq('id', id)
    );

    const results = await Promise.all(promises);
    const failed = results.find((r) => r.error);
    if (failed?.error) {
      console.error('[taskService] bulkUpdatePositions error:', failed.error);
      throw failed.error;
    }
  },

  /** Delete a task */
  async deleteTask(taskId) {
    if (!isSupabaseConfigured || !taskId) throw new Error('Task ID is required.');

    const { error } = await supabase.from('tasks').delete().eq('id', taskId);

    if (error) {
      console.error('[taskService] deleteTask error:', error);
      throw error;
    }

    return true;
  },

  // ─── COMMENTS ───────────────────────────────────────────────────────────────

  async getComments(taskId) {
    if (!isSupabaseConfigured || !taskId) return [];

    const { data, error } = await supabase
      .from('comments')
      .select(`
        id, task_id, content, created_at, updated_at,
        user:profiles!comments_user_id_fkey(id, full_name, email, avatar_url)
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[taskService] getComments error:', error);
      throw error;
    }

    return data || [];
  },

  async addComment(taskId, userId, content) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    if (!content?.trim()) throw new Error('Comment cannot be empty.');

    const { data, error } = await supabase
      .from('comments')
      .insert({ task_id: taskId, user_id: userId, content: content.trim() })
      .select(`
        id, task_id, content, created_at, updated_at,
        user:profiles!comments_user_id_fkey(id, full_name, email, avatar_url)
      `)
      .single();

    if (error) {
      console.error('[taskService] addComment error:', error);
      throw error;
    }

    return data;
  },

  async deleteComment(commentId) {
    if (!isSupabaseConfigured || !commentId) throw new Error('Comment ID is required.');

    const { error } = await supabase.from('comments').delete().eq('id', commentId);

    if (error) {
      console.error('[taskService] deleteComment error:', error);
      throw error;
    }

    return true;
  },
};
