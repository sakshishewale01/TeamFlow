import { supabase, isSupabaseConfigured } from '../lib/supabase';

const COMMENT_SELECT = `
  id,
  task_id,
  user_id,
  content,
  created_at,
  updated_at,
  user:profiles(id, full_name, email, avatar_url)
`;

export const MAX_COMMENT_LENGTH = 1000;

export const commentService = {
  /**
   * Fetch all comments for a specific task in chronological order
   */
  async getComments(taskId) {
    if (!isSupabaseConfigured || !taskId) return [];

    const { data, error } = await supabase
      .from('comments')
      .select(COMMENT_SELECT)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[commentService] getComments error:', error);
      throw new Error(error.message || 'Failed to fetch comments');
    }

    return data || [];
  },

  /**
   * Create a new comment on a task
   */
  async createComment(taskId, userId, content) {
    if (!isSupabaseConfigured) {
      throw new Error('Database is not configured');
    }

    if (!taskId) {
      throw new Error('Task ID is required');
    }

    if (!userId) {
      throw new Error('You must be signed in to comment');
    }

    const trimmed = (content || '').trim();
    if (!trimmed) {
      throw new Error('Comment cannot be empty');
    }

    if (trimmed.length > MAX_COMMENT_LENGTH) {
      throw new Error(`Comment exceeds maximum limit of ${MAX_COMMENT_LENGTH} characters`);
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        task_id: taskId,
        user_id: userId,
        content: trimmed,
      })
      .select(COMMENT_SELECT)
      .single();

    if (error) {
      console.error('[commentService] createComment error:', error);
      throw new Error(error.message || 'Failed to add comment');
    }

    return data;
  },

  /**
   * Update an existing comment (author only)
   */
  async updateComment(commentId, content) {
    if (!isSupabaseConfigured) {
      throw new Error('Database is not configured');
    }

    if (!commentId) {
      throw new Error('Comment ID is required');
    }

    const trimmed = (content || '').trim();
    if (!trimmed) {
      throw new Error('Comment cannot be empty');
    }

    if (trimmed.length > MAX_COMMENT_LENGTH) {
      throw new Error(`Comment exceeds maximum limit of ${MAX_COMMENT_LENGTH} characters`);
    }

    const { data, error } = await supabase
      .from('comments')
      .update({
        content: trimmed,
      })
      .eq('id', commentId)
      .select(COMMENT_SELECT)
      .single();

    if (error) {
      console.error('[commentService] updateComment error:', error);
      throw new Error(error.message || 'Failed to update comment');
    }

    return data;
  },

  /**
   * Delete a comment (author, admin, or manager)
   */
  async deleteComment(commentId) {
    if (!isSupabaseConfigured) {
      throw new Error('Database is not configured');
    }

    if (!commentId) {
      throw new Error('Comment ID is required');
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('[commentService] deleteComment error:', error);
      throw new Error(error.message || 'Failed to delete comment');
    }

    return { success: true };
  },
};

export default commentService;
