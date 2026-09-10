import React, { useState, useEffect, useMemo } from 'react';
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
  CheckSquare,
  Plus,
  ListTodo,
  KanbanSquare,
  LayoutList,
  SearchX,
  FilterX,
  RotateCcw,
} from 'lucide-react';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import ProjectModal from '../components/projects/ProjectModal';
import AddProjectMemberModal from '../components/projects/AddProjectMemberModal';
import TaskItem from '../components/tasks/TaskItem';
import TaskModal from '../components/tasks/TaskModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import TaskFilters from '../components/tasks/TaskFilters';
import KanbanBoard from '../components/kanban/KanbanBoard';
import { useWorkspace } from '../hooks/useWorkspace';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useTasks } from '../hooks/useTasks';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import {
  PROJECT_STATUS_DETAILS,
  TASK_STATUS,
  APP_ROUTES,
} from '../utils/constants';
import {
  DEFAULT_TASK_FILTERS,
  filterAndSortTasks,
  computeStatusCounts,
  getActiveFilterInfo,
} from '../utils/taskFilters';

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

  // Modals for Project
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  // Task filtering, view mode, and metadata state
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'list'
  const [createDefaultStatus, setCreateDefaultStatus] = useState(TASK_STATUS.TODO);
  const [taskFilters, setTaskFilters] = useState(DEFAULT_TASK_FILTERS);
  const [assignees, setAssignees] = useState([]);
  const [labels, setLabels] = useState([]);

  // Modals for Tasks
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToView, setTaskToView] = useState(null);

  // Hook for tasks in this project (fetched once and filtered locally)
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useTasks({ projectId });

  // Load project details
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
          console.error('[ProjectDetailsPage] Error loading project:', err);
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

  // Load project assignees and task labels
  useEffect(() => {
    let ignore = false;
    async function loadTaskMetadata() {
      if (!projectId || !project?.workspace_id) return;
      try {
        const [assigneesList, labelsList] = await Promise.all([
          taskService.getProjectTaskAssignees(projectId),
          taskService.getTaskLabels(project.workspace_id),
        ]);
        if (!ignore) {
          setAssignees(assigneesList);
          setLabels(labelsList);
        }
      } catch (err) {
        console.error('[ProjectDetailsPage] Error loading task metadata:', err);
      }
    }

    loadTaskMetadata();
    return () => {
      ignore = true;
    };
  }, [projectId, project?.workspace_id]);

  const fetchProjectDetails = () => setRefreshTrigger((prev) => prev + 1);

  // Authorization matching canonical RLS
  const isCreator = project?.created_by === user?.id;
  const canManageProject = !isWorkspaceViewer && (isWorkspaceAdmin || isWorkspaceManager || isCreator);
  const canDeleteProject = isWorkspaceAdmin; // RLS: Only Admins can delete projects
  const canAddMembers = !isWorkspaceViewer && (isWorkspaceAdmin || isWorkspaceManager);
  const canCreateTask = !isWorkspaceViewer;

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

  // Task Handlers
  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData, projectId);
      toast.success('Task created successfully.', 'Task Created');
    } catch (err) {
      toast.error(err.message || 'Failed to create task');
      throw err;
    }
  };

  const handleUpdateTask = async (taskData) => {
    if (!taskToEdit?.id) return;
    try {
      await updateTask(taskToEdit.id, taskData);
      toast.success('Task updated successfully.', 'Task Updated');
      setTaskToEdit(null);
    } catch (err) {
      toast.error(err.message || 'Failed to update task');
      throw err;
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      toast.success('Task deleted.', 'Deleted');
      if (taskToView?.id === taskId) {
        setTaskToView(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete task');
      throw err;
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      toast.success('Task status updated.');
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleMoveTask = async ({ taskId, destinationStatus, destinationPosition, affectedUpdates, optimisticTasks }) => {
    try {
      await moveTask({ taskId, destinationStatus, destinationPosition, affectedUpdates, optimisticTasks });
    } catch (err) {
      toast.error(err.message || 'Failed to move task. Please try again.');
      throw err;
    }
  };

  const handleOpenCreateTask = (status = TASK_STATUS.TODO) => {
    setCreateDefaultStatus(status);
    setShowCreateTaskModal(true);
  };

  // Harmonized project labels from database and loaded tasks
  const allProjectLabels = useMemo(() => {
    const map = new Map();
    (labels || []).forEach((lbl) => {
      if (lbl && (lbl.id || lbl.name)) {
        const key = lbl.id || lbl.name;
        map.set(key, { id: key, name: lbl.name, color: lbl.color });
      }
    });
    (tasks || []).forEach((t) => {
      (t.labels || []).forEach((lbl) => {
        if (lbl && (lbl.id || lbl.name)) {
          const key = lbl.id || lbl.name;
          if (!map.has(key)) {
            map.set(key, { id: key, name: lbl.name, color: lbl.color });
          }
        }
      });
    });
    return Array.from(map.values()).sort((a, b) =>
      (a.name || '').localeCompare(b.name || '')
    );
  }, [labels, tasks]);

  // Unified in-memory filtering and sorting
  const filteredTasks = useMemo(
    () => filterAndSortTasks(tasks, taskFilters),
    [tasks, taskFilters]
  );

  // Accurate status counts that do not collapse when selecting tabs
  const statusCounts = useMemo(
    () => computeStatusCounts(tasks, taskFilters),
    [tasks, taskFilters]
  );

  const { hasActiveFilters } = useMemo(
    () => getActiveFilterInfo(taskFilters, 'newest'),
    [taskFilters]
  );

  const handleResetFilters = () => {
    setTaskFilters(DEFAULT_TASK_FILTERS);
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
  const creatorName = project.creator?.full_name || project.creator?.email || 'Lead';

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

  const formattedCreatedDate = project.created_at
    ? new Date(project.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

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
            <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20">
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
          <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
            {canManageProject && (
              <Button
                variant="outline"
                size="sm"
                icon={Edit2}
                onClick={() => setShowEditModal(true)}
              >
                Edit Project
              </Button>
            )}
            {canDeleteProject && (
              <Button
                variant="dangerOutline"
                size="sm"
                icon={Trash2}
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </Button>
            )}
          </div>
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
                name={creatorName}
                size="xs"
              />
              <span className="truncate">{creatorName}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px] block mb-1">
              Created Date
            </span>
            <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedCreatedDate}</span>
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
              Assigned members from {project.workspace?.name || 'Workspace'} ({project.members?.length || 0})
            </p>
          </div>
          {canAddMembers && (
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
                          {name} {isCurrentUser && <span className="text-[10px] text-indigo-500 font-normal">(You)</span>}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{member.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant={isOwner ? 'purple' : 'slate'} size="xs">
                        {isOwner ? 'Lead' : 'Member'}
                      </Badge>
                      {canRemove && (
                        <button
                          type="button"
                          onClick={() => setMemberToRemove(member)}
                          className="p-1 rounded-lg text-slate-300 hover:text-rose-600 dark:text-slate-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition opacity-0 group-hover:opacity-100 cursor-pointer"
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

      {/* Project Tasks Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-indigo-600" />
                <span>Project Tasks</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                {tasks.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage deliverables, track progress, and assign team members for {project.name}.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Switcher: Board vs List */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'board'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Kanban Board View"
              >
                <KanbanSquare className="w-3.5 h-3.5" />
                <span>Board</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="List View"
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>

            {canCreateTask && (
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => handleOpenCreateTask(TASK_STATUS.TODO)}
              >
                New Task
              </Button>
            )}
          </div>
        </div>

        {/* Filter controls row */}
        <div className="space-y-3">
          <TaskFilters
            filters={taskFilters}
            onChange={setTaskFilters}
            assignees={assignees}
            labels={allProjectLabels}
            showProjectFilter={false}
            defaultSort="newest"
          />

          {/* Results summary */}
          {!tasksLoading && !tasksError && tasks.length > 0 && (
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
              <span>
                Showing <strong className="text-slate-800 dark:text-slate-200">{filteredTasks.length}</strong>{' '}
                {filteredTasks.length === 1 ? 'task' : 'tasks'}
                {hasActiveFilters && tasks.length !== filteredTasks.length && (
                  <span className="text-slate-400 dark:text-slate-500"> (filtered from {tasks.length})</span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Tasks Views: Kanban Board or List */}
        {tasksLoading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <Spinner size="lg" />
            <p className="mt-3 text-xs text-slate-500">Loading tasks...</p>
          </div>
        ) : tasksError ? (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs">
            {tasksError}
          </div>
        ) : viewMode === 'board' ? (
          <KanbanBoard
            tasks={filteredTasks}
            canDrag={!isWorkspaceViewer}
            canAddTask={canCreateTask}
            onTaskClick={(t) => setTaskToView(t)}
            onAddTask={handleOpenCreateTask}
            onMoveTask={handleMoveTask}
          />
        ) : (
          <div className="space-y-4">
            {/* Status Filter Tabs for List View */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs font-medium">
              <button
                type="button"
                onClick={() => setTaskFilters((f) => ({ ...f, status: 'all' }))}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  taskFilters.status === 'all'
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                All Tasks ({statusCounts.all})
              </button>
              <button
                type="button"
                onClick={() => setTaskFilters((f) => ({ ...f, status: TASK_STATUS.TODO }))}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  taskFilters.status === TASK_STATUS.TODO
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                To Do ({statusCounts[TASK_STATUS.TODO]})
              </button>
              <button
                type="button"
                onClick={() => setTaskFilters((f) => ({ ...f, status: TASK_STATUS.IN_PROGRESS }))}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  taskFilters.status === TASK_STATUS.IN_PROGRESS
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                In Progress ({statusCounts[TASK_STATUS.IN_PROGRESS]})
              </button>
              <button
                type="button"
                onClick={() => setTaskFilters((f) => ({ ...f, status: TASK_STATUS.REVIEW }))}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  taskFilters.status === TASK_STATUS.REVIEW
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Review ({statusCounts[TASK_STATUS.REVIEW]})
              </button>
              <button
                type="button"
                onClick={() => setTaskFilters((f) => ({ ...f, status: TASK_STATUS.DONE }))}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  taskFilters.status === TASK_STATUS.DONE
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Done ({statusCounts[TASK_STATUS.DONE]})
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  No tasks found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                  Get started by creating your first task for this project.
                </p>
                {canCreateTask && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={() => handleOpenCreateTask(TASK_STATUS.TODO)}
                  >
                    Create First Task
                  </Button>
                )}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  {taskFilters.search ? <SearchX className="w-6 h-6" /> : <FilterX className="w-6 h-6" />}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  {taskFilters.search ? 'No tasks match your search' : 'No tasks match the selected filters'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                  {taskFilters.search
                    ? `No tasks found matching "${taskFilters.search}". Try searching for another term.`
                    : 'Try adjusting or clearing your filter criteria to view tasks.'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  icon={RotateCcw}
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => {
                  const canEdit = !isWorkspaceViewer;
                  const canDelete = !isWorkspaceViewer;

                  return (
                    <TaskItem
                      key={task.id}
                      task={task}
                      showProject={false}
                      onView={(t) => setTaskToView(t)}
                      onEdit={(t) => setTaskToEdit(t)}
                      onDelete={(t) => handleDeleteTask(t.id)}
                      onStatusChange={handleStatusChange}
                      canEdit={canEdit}
                      canDelete={canDelete}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

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
        description={`Are you sure you want to delete "${project.name}"? All project milestones and member assignments will be permanently deleted. This action cannot be undone.`}
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

      {/* Create Task Modal */}
      <TaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        onSubmit={handleCreateTask}
        defaultProjectId={projectId}
        defaultStatus={createDefaultStatus}
        assignees={assignees}
        labels={labels}
      />

      {/* Edit Task Modal */}
      <TaskModal
        isOpen={Boolean(taskToEdit)}
        onClose={() => setTaskToEdit(null)}
        onSubmit={handleUpdateTask}
        isEditing
        initialData={taskToEdit}
        defaultProjectId={projectId}
        assignees={assignees}
        labels={labels}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={Boolean(taskToView)}
        onClose={() => setTaskToView(null)}
        task={taskToView}
        onEdit={(t) => {
          setTaskToView(null);
          setTaskToEdit(t);
        }}
        onDelete={handleDeleteTask}
        canEdit={!isWorkspaceViewer}
        canDelete={!isWorkspaceViewer}
      />
    </div>
  );
};

export default ProjectDetailsPage;
