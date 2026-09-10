import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Calendar,
  Users,
  Search,
  Edit2,
  Trash2,
  Layers,
  Building2,
} from 'lucide-react';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/common/EmptyState';
import ProjectModal from '../components/projects/ProjectModal';
import WorkspaceModal from '../components/workspaces/WorkspaceModal';
import { useWorkspace } from '../hooks/useWorkspace';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useProjects } from '../hooks/useProjects';
import {
  PROJECT_STATUS,
  PROJECT_STATUS_DETAILS,
} from '../utils/constants';

export const ProjectsPage = () => {
  const {
    activeWorkspace,
    isWorkspaceAdmin,
    isWorkspaceManager,
    isWorkspaceViewer,
    createWorkspace,
  } = useWorkspace();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Hook-managed project state
  const {
    projects,
    loading,
    error,
    refreshProjects,
    createProject,
    updateProject,
    deleteProject,
  } = useProjects(activeWorkspace?.id, {
    status: statusFilter,
    search: searchQuery,
  });

  // Modals
  const [modalState, setModalState] = useState({ isOpen: false, isEditing: false, data: null });
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, project: null, isDeleting: false });
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);

  const canCreate = !isWorkspaceViewer && (isWorkspaceAdmin || isWorkspaceManager);

  const handleOpenCreate = () => {
    setModalState({ isOpen: true, isEditing: false, data: null });
  };

  const handleOpenEdit = (project, e) => {
    e.stopPropagation();
    setModalState({ isOpen: true, isEditing: true, data: project });
  };

  const handleModalSubmit = async (data) => {
    try {
      if (modalState.isEditing && modalState.data) {
        await updateProject(modalState.data.id, data);
        toast.success(`Project "${data.name}" updated.`, 'Project Saved');
      } else {
        const created = await createProject(data);
        toast.success(`Project "${created.name}" created!`, 'Project Created');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save project');
      throw err;
    }
  };

  const handleOpenDelete = (project, e) => {
    e.stopPropagation();
    setDeleteModalState({ isOpen: true, project, isDeleting: false });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalState.project) return;
    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));

    try {
      await deleteProject(deleteModalState.project.id);
      toast.success(`Project "${deleteModalState.project.name}" deleted.`, 'Project Deleted');
      setDeleteModalState({ isOpen: false, project: null, isDeleting: false });
    } catch (err) {
      toast.error(err.message || 'Failed to delete project');
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCreateWorkspace = async (wsData) => {
    try {
      const newWs = await createWorkspace(wsData);
      toast.success(`Workspace "${newWs.name}" created!`, 'Workspace Ready');
      setShowWorkspaceModal(false);
    } catch (err) {
      toast.error(err.message || 'Failed to create workspace');
      throw err;
    }
  };

  if (!activeWorkspace) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <EmptyState
          icon={Layers}
          title="No active workspace"
          description="Please create or select a workspace first before viewing and managing projects."
          actionLabel="Create Workspace"
          onAction={() => setShowWorkspaceModal(true)}
        />
        <WorkspaceModal
          isOpen={showWorkspaceModal}
          onClose={() => setShowWorkspaceModal(false)}
          onSubmit={handleCreateWorkspace}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Workspace: {activeWorkspace.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Projects
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track deliverables, assign team members, and organize project milestones.
          </p>
        </div>

        {canCreate && (
          <Button
            onClick={handleOpenCreate}
            variant="primary"
            icon={Plus}
          >
            New Project
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All ({projects.length})
          </button>
          {Object.entries(PROJECT_STATUS_DETAILS).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
                statusFilter === key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center">
          <Spinner size="xl" />
          <p className="mt-4 text-sm text-slate-500 animate-pulse">Loading projects...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-center">
          <p className="text-sm font-bold text-rose-700 dark:text-rose-300 mb-1">
            Failed to load projects
          </p>
          <p className="text-xs text-rose-600 dark:text-rose-400 mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={refreshProjects}>
            Retry
          </Button>
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={searchQuery || statusFilter !== 'all' ? 'No matching projects' : 'No projects created yet'}
          description={
            searchQuery || statusFilter !== 'all'
              ? 'Try changing your search term or status filter.'
              : `Create your first project under "${activeWorkspace.name}" to organize milestones and team members.`
          }
          actionLabel={canCreate ? 'Create First Project' : undefined}
          onAction={canCreate ? handleOpenCreate : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const statusMeta = PROJECT_STATUS_DETAILS[project.status] || PROJECT_STATUS_DETAILS[PROJECT_STATUS.PLANNING];
            const canEdit = !isWorkspaceViewer && (isWorkspaceAdmin || isWorkspaceManager || project.created_by === user?.id);
            // Deletion is strictly enforced by RLS to Workspace Admins
            const canDelete = isWorkspaceAdmin;

            const formattedDateRange = project.start_date || project.end_date
              ? `${project.start_date ? new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'} - ${
                  project.end_date ? new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Ongoing'
                }`
              : null;

            const creatorName = project.creator?.full_name || project.creator?.email || 'Lead';

            return (
              <Card
                key={project.id}
                hover
                className="relative flex flex-col transition-all cursor-pointer group"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardContent className="p-6 flex-1 flex flex-col">
                  {/* Top Row: Icon & Status Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                      <FolderKanban className="w-5 h-5" />
                    </div>

                    <Badge variant={statusMeta.badgeColor} size="xs">
                      {statusMeta.label}
                    </Badge>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
                    {project.description || 'No description provided.'}
                  </p>

                  {/* Owner / Creator Row */}
                  <div className="flex items-center gap-2 mb-4 text-xs text-slate-500 dark:text-slate-400">
                    <Avatar
                      src={project.creator?.avatar_url}
                      name={creatorName}
                      size="xs"
                    />
                    <span className="text-[11px] truncate">
                      Owner: <strong className="text-slate-700 dark:text-slate-300 font-medium">{creatorName}</strong>
                    </span>
                  </div>

                  {/* Metadata & Actions Row */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex flex-col gap-1">
                      {formattedDateRange ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formattedDateRange}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">No dates set</span>
                      )}

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{project.memberCount || 1} member{(project.memberCount || 1) === 1 ? '' : 's'}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(project, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="Edit Project"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={(e) => handleOpenDelete(project, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title="Delete Project"
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

      {/* Create / Edit Project Modal */}
      <ProjectModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, isEditing: false, data: null })}
        onSubmit={handleModalSubmit}
        initialData={modalState.data}
        isEditing={modalState.isEditing}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalState.isOpen}
        onClose={() => !deleteModalState.isDeleting && setDeleteModalState({ isOpen: false, project: null, isDeleting: false })}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteModalState.project?.name}"? All project details and member assignments will be deleted. This action cannot be undone.`}
        size="sm"
      >
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={() => setDeleteModalState({ isOpen: false, project: null, isDeleting: false })}
            disabled={deleteModalState.isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            isLoading={deleteModalState.isDeleting}
          >
            Delete Project
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
