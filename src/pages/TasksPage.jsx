import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CheckSquare,
  Plus,
  FolderKanban,
  ListTodo,
  Layers,
  SearchX,
  FilterX,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import TaskItem from '../components/tasks/TaskItem';
import TaskModal from '../components/tasks/TaskModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import TaskFilters from '../components/tasks/TaskFilters';
import { useWorkspace } from '../hooks/useWorkspace';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { useToast } from '../hooks/useToast';
import { taskService } from '../services/taskService';
import { TASK_STATUS, APP_ROUTES } from '../utils/constants';
import {
  DEFAULT_TASK_FILTERS,
  filterAndSortTasks,
  computeStatusCounts,
  getActiveFilterInfo,
} from '../utils/taskFilters';

export const TasksPage = () => {
  const { activeWorkspace, isWorkspaceViewer } = useWorkspace();
  const toast = useToast();

  const [taskFilters, setTaskFilters] = useState(DEFAULT_TASK_FILTERS);
  const [assignees, setAssignees] = useState([]);
  const [labels, setLabels] = useState([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const urlTaskId = searchParams.get('taskId');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToView, setTaskToView] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  // Fetch workspace projects for filter dropdown and task creation
  const { projects, loading: projectsLoading } = useProjects(activeWorkspace?.id);

  // Fetch workspace tasks once
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks({
    workspaceId: activeWorkspace?.id,
  });

  // Active task for modal view (from direct state or URL deep-link)
  const activeTaskToView =
    taskToView ||
    (urlTaskId && tasks?.length > 0 ? tasks.find((t) => t.id === urlTaskId) : null);

  // Load assignees and labels for workspace
  useEffect(() => {
    let ignore = false;
    async function loadWorkspaceMetadata() {
      if (!activeWorkspace?.id) return;
      try {
        const [assigneesList, labelsList] = await Promise.all([
          taskService.getWorkspaceAssignees(activeWorkspace.id),
          taskService.getTaskLabels(activeWorkspace.id),
        ]);
        if (!ignore) {
          setAssignees(assigneesList);
          setLabels(labelsList);
        }
      } catch (err) {
        console.error('[TasksPage] Error loading workspace metadata:', err);
      }
    }

    loadWorkspaceMetadata();
    return () => {
      ignore = true;
    };
  }, [activeWorkspace?.id]);

  const canCreateTask = !isWorkspaceViewer;

  // Harmonized workspace labels from database and loaded tasks
  const allWorkspaceLabels = useMemo(() => {
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

  // In-memory unified filtering and sorting
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

  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData, taskData.projectId);
      toast.success('Task created successfully.', 'Task Created');
      setShowCreateModal(false);
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

  const handleResetFilters = () => {
    setTaskFilters(DEFAULT_TASK_FILTERS);
  };

  if (!activeWorkspace) {
    return (
      <div className="py-20 text-center">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">No Workspace Selected</h2>
        <p className="text-xs text-slate-500 mt-1">Please select or create a workspace to view tasks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <ListTodo className="w-6 h-6 text-indigo-600" />
              <span>Tasks</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              {activeWorkspace.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track, assign, and organize deliverables across all projects in this workspace.
          </p>
        </div>

        {canCreateTask && (
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                if (projects.length === 0) {
                  toast.error('You need at least one project before creating tasks.', 'No Projects');
                  return;
                }
                setShowCreateModal(true);
              }}
            >
              New Task
            </Button>
          </div>
        )}
      </div>

      {/* Status Filter Tabs */}
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

      {/* Filter Controls Bar */}
      <div className="space-y-3">
        <TaskFilters
          filters={taskFilters}
          onChange={setTaskFilters}
          projects={projects}
          showProjectFilter={true}
          assignees={assignees}
          labels={allWorkspaceLabels}
          defaultSort="newest"
        />

        {/* Results Counter Summary */}
        {!tasksLoading && !projectsLoading && !tasksError && projects.length > 0 && tasks.length > 0 && (
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

      {/* Task List / Refined Empty States */}
      {tasksLoading || projectsLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="mt-3 text-xs text-slate-500">Loading workspace tasks...</p>
        </div>
      ) : tasksError ? (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs">
          {tasksError}
        </div>
      ) : projects.length === 0 ? (
        <div className="p-10 sm:p-14 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No projects in this workspace yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            Tasks belong to projects. Create your first project to start organizing tasks.
          </p>
          <Link to={APP_ROUTES.PROJECTS}>
            <Button variant="primary" size="sm" icon={Plus}>
              Create Project
            </Button>
          </Link>
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-10 sm:p-14 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No tasks yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            Get started by creating your first task in this workspace.
          </p>
          {canCreateTask && (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setShowCreateModal(true)}
            >
              Create First Task
            </Button>
          )}
        </div>
      ) : filteredTasks.length === 0 ? (
        /* Differentiated No-Match States */
        <div className="p-10 sm:p-14 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            {taskFilters.search ? <SearchX className="w-6 h-6" /> : <FilterX className="w-6 h-6" />}
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            {taskFilters.search ? 'No tasks match your search' : 'No tasks match the selected filters'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            {taskFilters.search
              ? `No tasks found matching "${taskFilters.search}". Try checking for spelling or searching a different term.`
              : 'Try broadening or clearing your filter criteria to view more tasks.'}
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
                showProject={true}
                onView={(t) => setTaskToView(t)}
                onEdit={(t) => setTaskToEdit(t)}
                onDelete={(t) => setTaskToDelete(t)}
                onStatusChange={handleStatusChange}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      <TaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTask}
        projects={projects}
        showProjectSelect={true}
        defaultProjectId={taskFilters.projectId !== 'all' ? taskFilters.projectId : projects[0]?.id || ''}
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
        projects={projects}
        showProjectSelect={false}
        assignees={assignees}
        labels={labels}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={Boolean(activeTaskToView)}
        onClose={() => {
          setTaskToView(null);
          if (searchParams.get('taskId')) {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.delete('taskId');
            setSearchParams(nextParams, { replace: true });
          }
        }}
        task={activeTaskToView}
        onEdit={(t) => {
          setTaskToView(null);
          setTaskToEdit(t);
        }}
        onDelete={handleDeleteTask}
        canEdit={!isWorkspaceViewer}
        canDelete={!isWorkspaceViewer}
      />

      {/* Task Deletion Confirmation Modal */}
      <Modal
        isOpen={Boolean(taskToDelete)}
        onClose={() => !isDeletingTask && setTaskToDelete(null)}
        title="Delete Task"
        size="sm"
      >
        <div className="space-y-4 mt-2">
          <div className="flex items-start gap-3 p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-900/50">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-0.5">Are you sure you want to delete this task?</p>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                "{taskToDelete?.title}" will be permanently removed. This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTaskToDelete(null)}
              disabled={isDeletingTask}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={async () => {
                if (!taskToDelete?.id) return;
                setIsDeletingTask(true);
                try {
                  await handleDeleteTask(taskToDelete.id);
                  setTaskToDelete(null);
                } finally {
                  setIsDeletingTask(false);
                }
              }}
              isLoading={isDeletingTask}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TasksPage;
