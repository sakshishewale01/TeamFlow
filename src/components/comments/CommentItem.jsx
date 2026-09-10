import React, { useState } from 'react';
import { Edit3, Trash2, Check, X, AlertTriangle, AlertCircle } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { formatRelativeTime, formatFullDateTime } from '../../utils/dateUtils';
import { MAX_COMMENT_LENGTH } from '../../services/commentService';

export const CommentItem = ({
  comment,
  currentUserId,
  isAdmin = false,
  isManager = false,
  isViewer = false,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  if (!comment) return null;

  const isAuthor = currentUserId && comment.user_id === currentUserId;
  // Authors can edit their own comments. Nobody else can edit, not even Admin/Manager.
  const canEdit = isAuthor && !isViewer;
  // Authors, Admins, and Managers can delete.
  const canDelete = (isAuthor || isAdmin || isManager) && !isViewer;

  const authorName =
    comment.user?.full_name || comment.user?.email?.split('@')[0] || 'Team Member';
  const authorAvatar = comment.user?.avatar_url;

  // Check if edited (difference between updated_at and created_at > 1 second)
  const isEdited = Boolean(
    comment.updated_at &&
      comment.created_at &&
      Math.abs(new Date(comment.updated_at).getTime() - new Date(comment.created_at).getTime()) > 1000
  );

  const relativeTime = formatRelativeTime(comment.created_at);
  const fullTime = formatFullDateTime(comment.created_at);

  const trimmedEdit = editContent.trim();
  const editCharCount = editContent.length;
  const isEditOverLimit = editCharCount > MAX_COMMENT_LENGTH;
  const isEditEmpty = trimmedEdit.length === 0;

  const handleStartEdit = () => {
    setEditContent(comment.content);
    setEditError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (isEditEmpty || isEditOverLimit || isSaving) return;

    setIsSaving(true);
    setEditError(null);
    try {
      await onUpdate(comment.id, trimmedEdit);
      setIsEditing(false);
    } catch (err) {
      setEditError(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDelete(comment.id);
      setShowDeleteConfirm(false);
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete comment');
      setIsDeleting(false);
    }
  };

  return (
    <div className="group relative flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
      <Avatar
        src={authorAvatar}
        name={authorName}
        size="sm"
        className="mt-0.5 shrink-0"
      />

      <div className="flex-1 min-w-0">
        {/* Header: Author + Timestamp + Actions */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
              {authorName}
            </span>
            <span
              className="text-[11px] text-slate-400 dark:text-slate-500 cursor-default"
              title={fullTime}
            >
              {relativeTime}
            </span>
            {isEdited && (
              <span
                className="text-[10px] text-slate-400 dark:text-slate-500 italic cursor-default"
                title={`Edited at ${formatFullDateTime(comment.updated_at)}`}
              >
                (edited)
              </span>
            )}
          </div>

          {/* Action buttons (only if not currently editing or confirming delete) */}
          {!isEditing && !showDeleteConfirm && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
              {canEdit && (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Edit comment"
                  aria-label="Edit comment"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title={isAuthor ? 'Delete comment' : 'Moderate/delete comment'}
                  aria-label="Delete comment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Comment Body or Inline Editor */}
        {isEditing ? (
          <div className="mt-2 space-y-2">
            <div className="relative rounded-xl border border-indigo-400 dark:border-indigo-500 bg-white dark:bg-slate-900 p-2 shadow-xs">
              <textarea
                rows={3}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                disabled={isSaving}
                className="w-full text-sm text-slate-900 dark:text-slate-100 bg-transparent resize-y rounded-lg focus:outline-hidden"
                aria-label="Edit comment content"
              />
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                <span
                  className={
                    isEditOverLimit
                      ? 'text-rose-600 font-semibold'
                      : 'text-slate-400'
                  }
                >
                  {editCharCount} / {MAX_COMMENT_LENGTH}
                </span>

                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="xs"
                    onClick={handleSaveEdit}
                    isLoading={isSaving}
                    disabled={isEditEmpty || isEditOverLimit || isSaving}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            </div>

            {editError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{editError}</span>
              </div>
            )}
          </div>
        ) : showDeleteConfirm ? (
          /* Inline Delete Confirmation */
          <div className="mt-2 p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs">
            <div className="flex items-start gap-2 text-rose-800 dark:text-rose-200 mb-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Delete this comment?</p>
                <p className="text-rose-700/80 dark:text-rose-300/80">
                  This comment will be permanently removed.
                </p>
              </div>
            </div>

            {deleteError && (
              <p className="text-rose-600 mb-2 font-medium">{deleteError}</p>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="xs"
                onClick={handleDeleteConfirm}
                isLoading={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
