import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';
import { workspaceService } from '../../services/workspaceService';
import { projectService } from '../../services/projectService';
import { useToast } from '../../hooks/useToast';
import { ROLES, ROLE_DETAILS } from '../../utils/constants';

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
  const [selectedRole, setSelectedRole] = useState(ROLES.MEMBER);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const toast = useToast();

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
          const available = members.filter((m) => !existingMemberUserIds.includes(m.user_id));
          if (available.length > 0) {
            setSelectedUserId(available[0].user_id);
          } else {
            setSelectedUserId('');
          }
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
  }, [isOpen, workspaceId, existingMemberUserIds]);

  const availableMembers = workspaceMembers.filter(
    (m) => !existingMemberUserIds.includes(m.user_id)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError('Please select a member to add');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const added = await projectService.addProjectMember(projectId, selectedUserId, selectedRole);
      toast.success('Member assigned to project.', 'Member Added');
      if (onMemberAdded) onMemberAdded(added);
      onClose();
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
      onClose={onClose}
      title="Add Project Member"
      description="Only existing workspace members can be added to this project."
      size="md"
    >
      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="mt-3 text-xs text-slate-500">Loading workspace members...</p>
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
            <Button variant="outline" size="sm" onClick={onClose}>
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
                const isSelected = selectedUserId === member.user_id;
                const roleMeta = ROLE_DETAILS[member.role] || ROLE_DETAILS.member;
                const name = member.user?.full_name || member.user?.email || 'User';

                return (
                  <div
                    key={member.id}
                    onClick={() => setSelectedUserId(member.user_id)}
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
                      Workspace: {roleMeta.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Project Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(ROLE_DETAILS).map(([roleKey, item]) => {
                const isSelected = selectedRole === roleKey;
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => setSelectedRole(roleKey)}
                    className={`p-2 rounded-xl text-xs font-semibold border transition text-center ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
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
