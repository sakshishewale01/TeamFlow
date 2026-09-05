import React, { useState, useEffect, useRef } from 'react';
import {
  X, Edit2, Trash2, Calendar, Flag, User, MessageSquare,
  Send, Clock,
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import Modal from '../ui/Modal';
import TaskModal from './TaskModal';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useWorkspace } from '../../hooks/useWorkspace';
import {
  TASK_STATUS_DETAILS,
  TASK_PRIORITY_DETAILS,
} from '../../utils/constants';

export const TaskDetailModal = ({
  isOpen,
  onClose,
  task,
  projectMembers = [],
  onTaskUpdated,
  onTaskDeleted,
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const { isWorkspaceViewer } = useWorkspace();

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [deletingCommentId, setDeletingCommentId] = useState(null);

  const commentInputRef = useRef(null);
  const commentsEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && task?.id) {
      loadComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, task?.id]);

  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      const data = await taskService.getComments(task.id);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isAddingComment) return;

    setIsAddingComment(true);
    try {
      const added = await taskService.addComment(task.id, user.id, newComment.trim());
      setComments((prev) => [...prev, added]);
      setNewComment('');
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      onTaskUpdated?.();
    } catch (err) {
      toast.error(err.message || 'Failed to add comment');
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setDeletingCommentId(commentId);
    try {
      await taskService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onTaskUpdated?.();
    } catch (err) {
      toast.error(err.message || 'Failed to delete comment');
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleEditSubmit = async (data) => {
    await onTaskUpdated?.(task.id, data);
    setShowEditModal(false);
  };

  const handleDeleteTask = async () => {
    setIsDeleting(true);
    try {
      await taskService.deleteTask(task.id);
      toast.success('Task deleted.', 'Task Deleted');
      onTaskDeleted?.(task.id);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!task) return null;

  const statusMeta = TASK_STATUS_DETAILS[task.status] || TASK_STATUS_DETAILS.todo;
  const priorityMeta = TASK_PRIORITY_DETAILS[task.priority] || TASK_PRIORITY_DETAILS.medium;
  const assigneeName = task.assignee?.full_name || task.assignee?.email || null;
  const canDelete =
    !isWorkspaceViewer &&
    (task.created_by === user?.id || true); // admins/managers handled by RLS

  const formattedDue = task.due_date
    ? new Date(task.due_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  return (
    <>
      <Modal
        isOpen={isOpen && !showEditModal && !showDeleteConfirm}
        onClose={onClose}
        title=""
        showClose={false}
        size="xl"
      >
        <div className="flex flex-col gap-0 -mt-4">
          {/* Header */}
          <div className={`flex items-start justify-between gap-3 pb-4 border-b-4 ${priorityMeta.borderColor} border-b border-slate-100 dark:border-slate-800`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant={statusMeta.badgeColor} size="sm">{statusMeta.label}</Badge>
                <Badge variant={priorityMeta.badgeColor} size="sm">
                  <Flag className="w-3 h-3" /> {priorityMeta.label}
                </Badge>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
                {task.title}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {!isWorkspaceViewer && (
                <Button
                  variant="outline"
                  size="xs"
                  icon={Edit2}
                  onClick={() => setShowEditModal(true)}
                >
                  Edit
                </Button>
              )}
              {!isWorkspaceViewer && canDelete && (
                <Button
                  variant="dangerOutline"
                  size="xs"
                  icon={Trash2}
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete
                </Button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
            {/* Left: Description + Comments */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Description
                </h4>
                {task.description ? (
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {task.description}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500 italic">No description provided.</p>
                )}
              </div>

              {/* Comments */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Comments ({comments.length})
                </h4>

                {commentsLoading ? (
                  <div className="flex justify-center py-4">
                    <Spinner size="sm" />
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {comments.length === 0 && (
                      <p className="text-xs text-slate-400 italic">No comments yet. Be the first!</p>
                    )}
                    {comments.map((c) => {
                      const isOwn = c.user_id === user?.id;
                      const canDeleteComment = isOwn; // also admins/managers, handled by RLS
                      return (
                        <div key={c.id} className="flex items-start gap-2.5 group">
                          <Avatar
                            src={c.user?.avatar_url}
                            name={c.user?.full_name || c.user?.email}
                            size="xs"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {c.user?.full_name || c.user?.email || 'User'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(c.created_at).toLocaleString('en-US', {
                                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                              {c.content}
                            </p>
                          </div>
                          {canDeleteComment && (
                            <button
                              onClick={() => handleDeleteComment(c.id)}
                              disabled={deletingCommentId === c.id}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-300 hover:text-rose-500 transition shrink-0 mt-0.5"
                              title="Delete comment"
                            >
                              {deletingCommentId === c.id ? (
                                <Spinner size="xs" />
                              ) : (
                                <X className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                    <div ref={commentsEndRef} />
                  </div>
                )}

                {/* Add Comment */}
                {!isWorkspaceViewer && (
                  <form onSubmit={handleAddComment} className="mt-3 flex items-end gap-2">
                    <Avatar
                      src={null}
                      name={user?.email}
                      size="xs"
                      className="shrink-0 mt-1"
                    />
                    <div className="flex-1 relative">
                      <textarea
                        ref={commentInputRef}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        rows={1}
                        className="block w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment(e);
                          }
                        }}
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      size="xs"
                      icon={Send}
                      isLoading={isAddingComment}
                      disabled={!newComment.trim()}
                    >
                      Send
                    </Button>
                  </form>
                )}
              </div>
            </div>

            {/* Right: Metadata */}
            <div className="space-y-4">
              {/* Assignee */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1">
                  <User className="w-3 h-3" /> Assignee
                </p>
                {task.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar src={task.assignee.avatar_url} name={assigneeName} size="xs" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{assigneeName}</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Unassigned</p>
                )}
              </div>

              {/* Due Date */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Due Date
                </p>
                {formattedDue ? (
                  <span className={`text-xs font-semibold flex items-center gap-1 ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    <Clock className="w-3 h-3" />
                    {formattedDue}
                    {isOverdue && <span className="text-[10px] ml-1">(Overdue)</span>}
                  </span>
                ) : (
                  <p className="text-xs text-slate-400 italic">No due date</p>
                )}
              </div>

              {/* Created by */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Created By
                </p>
                <div className="flex items-center gap-2">
                  <Avatar
                    src={task.creator?.avatar_url}
                    name={task.creator?.full_name || task.creator?.email}
                    size="xs"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {task.creator?.full_name || task.creator?.email || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Created
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(task.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Task Modal */}
      <TaskModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditSubmit}
        initialData={task}
        isEditing
        projectMembers={projectMembers}
      />

      {/* Delete Confirmation */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => !isDeleting && setShowDeleteConfirm(false)}
        title="Delete Task"
        description={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        size="sm"
      >
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteTask} isLoading={isDeleting}>
            Delete Task
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default TaskDetailModal;
