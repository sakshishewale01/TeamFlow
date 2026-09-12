import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';
import { workspaceService } from '../../services/workspaceService';
import { projectService } from '../../services/projectService';
import { useToast } from '../../hooks/useToast';
import { ROLE_DETAILS } from '../../utils/constants';

export const AddProjectMemberModal = ({
  isOpen,
  onClose,
  projectId,
  workspaceId,
  existingMemberUserIds = [],
  onMemberAdded,
}) => {
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const toast = useToast();

  const handleClose = () => {
    setError(null);
    setSelectedUserId('');
    onClose();
  };

  useEffect(() => {
    if (!isOpen || !workspaceId) return;

    let mounted = true;
    async function fetchMembers() {
      try {
        setLoading(true);
        setError(null);
        const members = await workspaceService.getWorkspaceMembers(workspaceId);
        if (mounted) {
          setWorkspaceMembers(members);
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load workspace members');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchMembers();
    return () => {
      mounted = false;
    };
  }, [isOpen, workspaceId]);

  const existingSet = useMemo(() => {
    return new Set(
      (existingMemberUserIds || []).filter(Boolean).map((id) => String(id).toLowerCase())
    );
  }, [existingMemberUserIds]);

  const availableMembers = useMemo(() => {
    return workspaceMembers.filter((m) => {
      const uid = m.user_id || m.user?.id;
      return uid && !existingSet.has(String(uid).toLowerCase());
    });
  }, [workspaceMembers, existingSet]);

  const isSelectedAvailable = availableMembers.some(
    (m) => String(m.user_id || m.user?.id).toLowerCase() === String(selectedUserId).toLowerCase()
  );
  const activeSelectedUserId = isSelectedAvailable
    ? selectedUserId
    : (availableMembers[0]?.user_id || availableMembers[0]?.user?.id || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeSelectedUserId) {
      setError('Please select a member to add');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const added = await projectService.addProjectMember(projectId, activeSelectedUserId);
      toast.success('Member assigned to project.', 'Member Added');
      if (onMemberAdded) onMemberAdded(added);
      handleClose();
    } catch (err) {
      console.error('Error adding member to project:', err);
      setError(err.message || 'Failed to add member to project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Project Member"
      description="Assign workspace teammates to this project."
      size="md"
    >
      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="mt-3 text-xs text-slate-500">Loading workspace members...</p>
        </div>
      ) : error && workspaceMembers.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-1">
            Failed to load workspace members
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Close
          </Button>
        </div>
      ) : availableMembers.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            All workspace members are already assigned to this project!
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Invite new members to your workspace first if you want to assign more teammates.
          </p>
          <div className="mt-5">
            <Button variant="outline" size="sm" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Select Workspace Teammate
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1.5 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              {availableMembers.map((member) => {
                const memberId = member.user_id || member.user?.id;
                const isSelected = activeSelectedUserId === memberId;
                const roleMeta = ROLE_DETAILS[member.role] || ROLE_DETAILS.member;
                const name = member.user?.full_name || member.user?.email || 'User';

                return (
                  <div
                    key={member.id}
                    onClick={() => setSelectedUserId(memberId)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={member.user?.avatar_url}
                        name={name}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {member.user?.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant={roleMeta.badgeColor} size="xs">
                      {roleMeta.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Add to Project
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default AddProjectMemberModal;
