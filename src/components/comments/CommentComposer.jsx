import React, { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { MAX_COMMENT_LENGTH } from '../../services/commentService';

export const CommentComposer = ({
  currentUser,
  onSubmit,
  isSubmitting = false,
  canComment = true,
  placeholder = 'Write a comment...',
}) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);

  if (!canComment) {
    return (
      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 text-center">
        You have view-only access. You cannot post comments in this workspace.
      </div>
    );
  }

  const trimmed = content.trim();
  const charCount = content.length;
  const isOverLimit = charCount > MAX_COMMENT_LENGTH;
  const isEmpty = trimmed.length === 0;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (isEmpty || isOverLimit || isSubmitting) return;

    setError(null);
    try {
      await onSubmit(trimmed);
      setContent('');
    } catch (err) {
      setError(err.message || 'Failed to post comment. Please try again.');
    }
  };

  const handleKeyDown = (e) => {
    // Cmd+Enter or Ctrl+Enter submits
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-start gap-3">
        <Avatar
          src={currentUser?.avatar_url}
          name={currentUser?.full_name || currentUser?.email || 'Me'}
          size="sm"
          className="mt-1 shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <textarea
              id="comment-textarea"
              rows={3}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 bg-transparent resize-y rounded-xl focus:outline-hidden disabled:opacity-50"
              aria-label="Write a comment"
            />

            {/* Bottom bar inside card */}
            <div className="flex items-center justify-between px-3.5 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20 rounded-b-xl">
              <span
                className={`text-[11px] font-medium ${
                  isOverLimit
                    ? 'text-rose-600 dark:text-rose-400 font-semibold'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {charCount} / {MAX_COMMENT_LENGTH}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  isLoading={isSubmitting}
                  disabled={isEmpty || isOverLimit || isSubmitting}
                  className="px-3.5 py-1.5 text-xs font-medium"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Comment
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default CommentComposer;
