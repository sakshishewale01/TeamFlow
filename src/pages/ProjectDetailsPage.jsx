import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FolderKanban,
  Calendar,
  Users,
  UserPlus,
  Trash2,
  Edit2,
  ArrowLeft,
  Clock,
  UserX,
} from 'lucide-react';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import ProjectModal from '../components/projects/ProjectModal';
import AddProjectMemberModal from '../components/projects/AddProjectMemberModal';
import KanbanBoard from '../components/tasks/KanbanBoard';
import { useWorkspace } from '../hooks/useWorkspace';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { projectService } from '../services/projectService';
import {
  PROJECT_STATUS_DETAILS,
  APP_ROUTES,
} from '../utils/constants';

export const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isWorkspaceAdmin, isWorkspaceManager, isWorkspaceViewer } = useWorkspace();
  const toast = useToast();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadDetails() {
      if (!projectId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await projectService.getProject(projectId);
        if (!ignore) {
          setProject(data);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Error loading project details:', err);
          setError(err.message || 'Failed to load project details.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDetails();
    return () => {
      ignore = true;
    };
  }, [projectId, refreshTrigger]);

  const fetchProjectDetails = () => setRefreshTrigger((prev) => prev + 1);

  const canManageProject =
    !isWorkspaceViewer &&
    (isWorkspaceAdmin || isWorkspaceManager || project?.created_by === user?.id);

  const handleEditSubmit = async (data) => {
    try {
      await projectService.updateProject(projectId, data);
      toast.success('Project details updated.', 'Saved');
      await fetchProjectDetails();
    } catch (err) {
      toast.error(err.message || 'Failed to update project');
      throw err;
    }
  };

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      await projectService.deleteProject(projectId);
      toast.success('Project has been deleted.', 'Deleted');
      navigate(APP_ROUTES.PROJECTS);
    } catch (err) {
      toast.error(err.message || 'Failed to delete project');
      setIsDeleting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setIsRemovingMember(true);
    try {
      await projectService.removeProjectMember(projectId, memberToRemove.user_id);
      toast.success('Team member removed from project.', 'Member Removed');
      setMemberToRemove(null);
      await fetchProjectDetails();
    } catch (err) {
      toast.error(err.message || 'Failed to remove member from project');
    } finally {
      setIsRemovingMember(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <Spinner size="xl" />
        <p className="mt-4 text-sm text-slate-500 animate-pulse">Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-center">
        <p className="text-base font-bold text-rose-800 dark:text-rose-200 mb-1">
          Project Not Found
        </p>
        <p className="text-xs text-rose-600 dark:text-rose-400 mb-6">
          {error || 'The project does not exist or you do not have permission to view it.'}
        </p>
        <Link to={APP_ROUTES.PROJECTS}>
          <Button variant="primary" icon={ArrowLeft}>
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const statusMeta = PROJECT_STATUS_DETAILS[project.status] || PROJECT_STATUS_DETAILS.planning;
  const existingMemberIds = (project.members || []).map((m) => m.user_id);

  const formattedStartDate = project.start_date
    ? new Date(project.start_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Not set';

  const formattedEndDate = project.end_date
    ? new Date(project.end_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Ongoing';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Link to={APP_ROUTES.PROJECTS} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
          Projects
        </Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white truncate">{project.name}</span>
      </nav>

      {/* Main Project Header Card */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20">
              <FolderKanban className="w-6 h-6" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {project.name}
                </h1>
                <Badge variant={statusMeta.badgeColor} size="sm">
                  {statusMeta.label}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                {project.description || 'No description provided for this project.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {canManageProject && (
            <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
              <Button
                variant="outline"
                size="sm"
                icon={Edit2}
                onClick={() => setShowEditModal(true)}
              >
                Edit Project
              </Button>
              <Button
                variant="dangerOutline"
                size="sm"
                icon={Trash2}
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Milestone Dates & Meta Strip */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px] block mb-1">
              Start Date
            </span>
            <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedStartDate}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px] block mb-1">
              Target Deadline
            </span>
            <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedEndDate}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px] block mb-1">
              Created By
            </span>
            <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200 truncate">
              <Avatar
                src={project.creator?.avatar_url}
                name={project.creator?.full_name || project.creator?.email || 'User'}
                size="xs"
              />
              <span className="truncate">{project.creator?.full_name || 'Project Lead'}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px] block mb-1">
              Assigned Teammates
            </span>
            <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{project.memberCount} member{project.memberCount === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Project Team Members */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Project Team</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned members from {project.workspace?.name || 'Workspace'}
            </p>
          </div>
          {canManageProject && (
            <Button
              variant="outline"
              size="xs"
              icon={UserPlus}
              onClick={() => setShowAddMemberModal(true)}
            >
              Add Member
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-4">
          {project.members?.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No members assigned yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {project.members?.map((member) => {
                const isOwner = member.user_id === project.created_by;
                const name = member.user?.full_name || member.user?.email || 'User';
                const isCurrentUser = member.user_id === user?.id;
                const canRemove = (canManageProject || isCurrentUser) && !isOwner;
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={member.user?.avatar_url} name={name} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {name} {isCurrentUser && <span className="text-[10px] text-indigo-500">(You)</span>}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{member.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant={isOwner ? 'purple' : 'slate'} size="xs">
                        {isOwner ? 'Lead' : 'Member'}
                      </Badge>
                      {canRemove && (
                        <button
                          type="button"
                          onClick={() => setMemberToRemove(member)}
                          className="p-1 rounded-lg text-slate-300 hover:text-rose-600 dark:text-slate-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition opacity-0 group-hover:opacity-100"
                          title={isCurrentUser ? 'Leave Project' : 'Remove from Project'}
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <KanbanBoard
        projectId={projectId}
        workspaceId={project.workspace_id}
        projectMembers={project.members || []}
      />

      {/* Edit Project Modal */}
      <ProjectModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditSubmit}
        initialData={project}
        isEditing
      />

      {/* Delete Project Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        title="Delete Project"
        description={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
        size="sm"
      >
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteProject}
            isLoading={isDeleting}
          >
            Delete Project
          </Button>
        </div>
      </Modal>

      {/* Add Project Member Modal */}
      <AddProjectMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        projectId={projectId}
        workspaceId={project.workspace_id}
        existingMemberUserIds={existingMemberIds}
        onMemberAdded={fetchProjectDetails}
      />

      {/* Remove Member Confirmation Modal */}
      <Modal
        isOpen={Boolean(memberToRemove)}
        onClose={() => !isRemovingMember && setMemberToRemove(null)}
        title="Remove Team Member"
        description={`Are you sure you want to remove "${memberToRemove?.user?.full_name || memberToRemove?.user?.email || 'this member'}" from "${project.name}"?`}
        size="sm"
      >
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={() => setMemberToRemove(null)}
            disabled={isRemovingMember}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleRemoveMember}
            isLoading={isRemovingMember}
          >
            Remove Member
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetailsPage;
