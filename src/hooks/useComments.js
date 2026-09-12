import { useState, useEffect, useCallback } from 'react';
import { commentService } from '../services/commentService';
import { realtimeService } from '../services/realtimeService';
import { useAuth } from './useAuth';

export const useComments = (taskId) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(Boolean(taskId));
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshComments = useCallback(async () => {
    if (!taskId) {
      setComments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await commentService.getComments(taskId);
      setComments(data);
    } catch (err) {
      setError(err.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!taskId) {
        setComments([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await commentService.getComments(taskId);
        if (!ignore) {
          setComments(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Failed to load comments');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    if (!taskId || !user?.id) {
      return () => {
        ignore = true;
      };
    }

    const unsubscribe = realtimeService.subscribeToComments({
      taskId,
      onInsert: async (newCommentRow) => {
        if (ignore) return;
        try {
          const fullComment = await commentService.getComment(newCommentRow.id);
          if (!ignore && fullComment) {
            setComments((prev) => {
              if (prev.some((c) => c.id === fullComment.id)) {
                return prev;
              }
              return [...prev, fullComment];
            });
          }
        } catch (err) {
          console.error('[useComments] Error handling realtime comment insert:', err);
        }
      },
      onUpdate: (updatedCommentRow) => {
        if (ignore) return;
        setComments((prev) =>
          prev.map((c) =>
            c.id === updatedCommentRow.id
              ? {
                  ...c,
                  content: updatedCommentRow.content,
                  updated_at: updatedCommentRow.updated_at,
                }
              : c
          )
        );
      },
      onDelete: (deletedCommentRow) => {
        if (ignore) return;
        setComments((prev) => prev.filter((c) => c.id !== deletedCommentRow.id));
      },
    });

    return () => {
      ignore = true;
      unsubscribe();
    };
  }, [taskId, user?.id]);

  const createComment = useCallback(
    async (content) => {
      if (!taskId || !user?.id) {
        throw new Error('You must be signed in to comment');
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const newComment = await commentService.createComment(taskId, user.id, content);
        setComments((prev) => [...prev, newComment]);
        return newComment;
      } catch (err) {
        setError(err.message || 'Failed to add comment');
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [taskId, user]
  );

  const updateComment = useCallback(
    async (commentId, content) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const updatedComment = await commentService.updateComment(commentId, content);
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? updatedComment : c))
        );
        return updatedComment;
      } catch (err) {
        setError(err.message || 'Failed to update comment');
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const deleteComment = useCallback(
    async (commentId) => {
      setIsSubmitting(true);
      setError(null);

      try {
        await commentService.deleteComment(commentId);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } catch (err) {
        setError(err.message || 'Failed to delete comment');
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return {
    comments,
    commentCount: comments.length,
    loading,
    error,
    isSubmitting,
    refreshComments,
    createComment,
    updateComment,
    deleteComment,
  };
};

export default useComments;
