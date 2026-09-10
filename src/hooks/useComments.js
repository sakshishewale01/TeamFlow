import { useState, useEffect, useCallback } from 'react';
import { commentService } from '../services/commentService';
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
      if (!taskId) return;

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

    return () => {
      ignore = true;
    };
  }, [taskId]);

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
