import React, { useState } from 'react';
import {
  Calendar,
  Flag,
  User,
  Clock,
  Edit3,
  Trash2,
  FolderKanban,
  Tag,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import CommentItem from '../comments/CommentItem';
import CommentComposer from '../comments/CommentComposer';
import { useComments } from '../../hooks/useComments';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import {
  TASK_STATUS_DETAILS,
  TASK_PRIORITY_DETAILS,
  TASK_STATUS,
} from '../../utils/constants';

function formatDate(dateStr) {
  if (!dateStr) return 'Not set';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function isOverdue(dateStr, status) {
  if (!dateStr || status === TASK_STATUS.DONE) return false;
  const due = new Date(dateStr);
  const now = new Date();
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return due.getTime() < now.getTime();
}

export const TaskDetailModal = ({
  isOpen,
  onClose,
  task,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}) => {
  const { user, profile } = useAuth();
  const { isAdmin, isManager, isViewer } = useRole();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    comments,
    commentCount,
    loading: commentsLoading,
    error: commentsError,
    isSubmitting: isSubmittingComment,
    refreshComments,
    createComment,
    updateComment,
    deleteComment,
  } = useComments(isOpen && task ? task.id : null);

  if (!task) return null;

  const statusMeta = TASK_STATUS_DETAILS[task.status] || TASK_STATUS_DETAILS.todo;
  const priorityMeta = TASK_PRIORITY_DETAILS[task.priority] || TASK_PRIORITY_DETAILS.medium;
  const overdue = isOverdue(task.due_date, task.status);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(task.id);
      }
      setShowDeleteConfirm(false);
      onClose();
    } catch {
      // error handled by parent
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showDeleteConfirm}
        onClose={onClose}
        title={task.title}
        size="lg"
      >
        <div className="space-y-6 mt-1">
          {/* Badges & Meta strip */}
          <div className="flex flex-wrap items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Badge variant={statusMeta.badgeColor}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusMeta.dotColor || 'bg-current'}`} />
              {statusMeta.label}
            </Badge>

            <Badge variant={priorityMeta.badgeColor}>
              <Flag className="w-3 h-3 mr-1 inline" />
              {priorityMeta.label} Priority
            </Badge>

            {task.project?.name && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
                {task.project.name}
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Description
            </h4>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-sm text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800/80 leading-relaxed whitespace-pre-wrap">
              {task.description || (
                <span className="text-slate-400 italic">No description provided.</span>
              )}
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Assignee */}
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Assignee
              </span>
              <div className="flex items-center gap-2.5">
                {task.assignee ? (
                  <>
                    <Avatar
                      src={task.assignee.avatar_url}
                      name={task.assignee.full_name || task.assignee.email}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {task.assignee.full_name || 'Team Member'}
                      </p>
                      {task.assignee.email && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                          {task.assignee.email}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <User className="w-4 h-4" />
                    <span>Unassigned</span>
                  </div>
                )}
              </div>
            </div>

            {/* Due Date */}
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Due Date
              </span>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span
                  className={
                    overdue
                      ? 'text-rose-600 dark:text-rose-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300'
                  }
                >
                  {formatDate(task.due_date)}
                  {overdue && (
                    <span className="ml-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md font-medium">
                      Overdue
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Created By */}
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Created By
              </span>
              <div className="flex items-center gap-2.5">
                {task.creator ? (
                  <>
                    <Avatar
                      src={task.creator.avatar_url}
                      name={task.creator.full_name || task.creator.email}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {task.creator.full_name || task.creator.email}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                        {formatDateTime(task.created_at)}
                      </p>
                    </div>
                  </>
                ) : (
                  <span className="text-sm text-slate-500">System</span>
                )}
              </div>
            </div>

            {/* Updated At */}
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Last Updated
              </span>
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{formatDateTime(task.updated_at || task.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Labels
              </h4>
              <div className="flex flex-wrap gap-2">
                {task.labels.map((lbl) => (
                  <span
                    key={lbl.id}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full text-white shadow-xs"
                    style={{ backgroundColor: lbl.color || '#6366f1' }}
                  >
                    <Tag className="w-3 h-3" />
                    {lbl.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Comments
                </h4>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {commentCount}
                </span>
              </div>
            </div>

            {/* Loading state */}
            {commentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : commentsError ? (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-center justify-between mb-4 border border-rose-200 dark:border-rose-900/50">
                <span>{commentsError}</span>
                <button
                  type="button"
                  onClick={refreshComments}
                  className="underline font-medium hover:text-rose-700 dark:hover:text-rose-300 ml-2 shrink-0 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Empty State */}
                {comments.length === 0 ? (
                  <div className="py-7 px-4 text-center rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                      No comments yet.
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Start the conversation about this task.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-80 overflow-y-auto pr-1 -mr-1">
                    {comments.map((c) => (
                      <CommentItem
                        key={c.id}
                        comment={c}
                        currentUserId={user?.id}
                        isAdmin={isAdmin}
                        isManager={isManager}
                        isViewer={isViewer}
                        onUpdate={updateComment}
                        onDelete={deleteComment}
                      />
                    ))}
                  </div>
                )}

                {/* Composer */}
                <CommentComposer
                  currentUser={profile || user}
                  onSubmit={createComment}
                  isSubmitting={isSubmittingComment}
                  canComment={!isViewer}
                />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              {canDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/40"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Delete Task
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
              {canEdit && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onEdit?.(task);
                  }}
                >
                  <Edit3 className="w-4 h-4 mr-1.5" />
                  Edit Task
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal for Delete */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => !isDeleting && setShowDeleteConfirm(false)}
        title="Delete Task"
        size="sm"
      >
        <div className="space-y-4 mt-2">
          <div className="flex items-start gap-3 p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-900/50">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-0.5">Are you sure you want to delete this task?</p>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                "{task.title}" will be permanently removed. This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDelete}
              isLoading={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TaskDetailModal;
