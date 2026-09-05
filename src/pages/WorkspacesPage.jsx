import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Users,
  Edit2,
  Trash2,
  Building2,
} from 'lucide-react';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import WorkspaceModal from '../components/workspaces/WorkspaceModal';
import EmptyState from '../components/common/EmptyState';
import { useWorkspace } from '../hooks/useWorkspace';
import { useToast } from '../hooks/useToast';
import { ROLE_DETAILS } from '../utils/constants';

export const WorkspacesPage = () => {
  const {
    workspaces,
    activeWorkspace,
    loading,
    error,
    switchWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
  } = useWorkspace();

  const [modalState, setModalState] = useState({ isOpen: false, isEditing: false, data: null });
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, workspace: null, isDeleting: false });
  const toast = useToast();

  const handleOpenCreate = () => {
    setModalState({ isOpen: true, isEditing: false, data: null });
  };

  const handleOpenEdit = (ws, e) => {
    e.stopPropagation();
    setModalState({ isOpen: true, isEditing: true, data: ws });
  };

  const handleModalSubmit = async (data) => {
    try {
      if (modalState.isEditing && modalState.data) {
        await updateWorkspace(modalState.data.id, data);
        toast.success(`Workspace "${data.name}" updated.`, 'Workspace Saved');
      } else {
        const created = await createWorkspace(data);
        toast.success(`Workspace "${created.name}" created.`, 'Workspace Created');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save workspace');
      throw err;
    }
  };

  const handleOpenDelete = (ws, e) => {
    e.stopPropagation();
    setDeleteModalState({ isOpen: true, workspace: ws, isDeleting: false });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalState.workspace) return;
    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));

    try {
      await deleteWorkspace(deleteModalState.workspace.id);
      toast.success(`Workspace "${deleteModalState.workspace.name}" was deleted.`, 'Workspace Deleted');
      setDeleteModalState({ isOpen: false, workspace: null, isDeleting: false });
    } catch (err) {
      toast.error(err.message || 'Failed to delete workspace');
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Workspaces
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Workspaces group your projects, team members, and shared resources together.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          variant="primary"
          icon={Plus}
        >
          New Workspace
        </Button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center">
          <Spinner size="xl" />
          <p className="mt-4 text-sm text-slate-500 animate-pulse">Loading workspaces...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-center">
          <p className="text-sm font-bold text-rose-700 dark:text-rose-300 mb-1">
            Failed to load workspaces
          </p>
          <p className="text-xs text-rose-600 dark:text-rose-400 mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      ) : workspaces.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No workspaces yet"
          description="Create your first workspace to start collaborating on projects, assigning tasks, and organizing your team."
          actionLabel="Create First Workspace"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((ws) => {
            const isActive = activeWorkspace?.id === ws.id;
            const roleMeta = ROLE_DETAILS[ws.userRole] || ROLE_DETAILS.member;
            const canEdit = ws.userRole === 'admin' || ws.userRole === 'manager';
            const canDelete = ws.userRole === 'admin';

            return (
              <Card
                key={ws.id}
                hover
                className={`relative flex flex-col transition-all cursor-pointer ${
                  isActive
                    ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 border-indigo-200 dark:border-indigo-800'
                    : ''
                }`}
                onClick={() => switchWorkspace(ws)}
              >
                <CardContent className="p-6 flex-1 flex flex-col">
                  {/* Top Row: Icon, Status, Role */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
                      <Briefcase className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {isActive && (
                        <Badge variant="indigo" size="xs" dot>
                          Active
                        </Badge>
                      )}
                      <Badge variant={roleMeta.badgeColor} size="xs">
                        {roleMeta.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Name & Description */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 truncate">
                    {ws.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 flex-1">
                    {ws.description || 'No description provided.'}
                  </p>

                  {/* Metadata & Actions */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5" title="Members count">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ws.memberCount || 1} member{ws.memberCount > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(ws, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Edit Workspace"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={(e) => handleOpenDelete(ws, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Delete Workspace"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Workspace Modal */}
      <WorkspaceModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, isEditing: false, data: null })}
        onSubmit={handleModalSubmit}
        initialData={modalState.data}
        isEditing={modalState.isEditing}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalState.isOpen}
        onClose={() => !deleteModalState.isDeleting && setDeleteModalState({ isOpen: false, workspace: null, isDeleting: false })}
        title="Delete Workspace"
        description={`Are you sure you want to delete "${deleteModalState.workspace?.name}"? All associated projects and member links will be permanently deleted.`}
        size="sm"
      >
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={() => setDeleteModalState({ isOpen: false, workspace: null, isDeleting: false })}
            disabled={deleteModalState.isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            isLoading={deleteModalState.isDeleting}
          >
            Delete Workspace
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default WorkspacesPage;
