import React, { useState, useEffect, useRef } from 'react';
import { Plus, RefreshCw, KanbanSquare, AlertCircle } from 'lucide-react';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import TaskDetailModal from './TaskDetailModal';
import TaskFilters from './TaskFilters';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useWorkspace } from '../../hooks/useWorkspace';
import { TASK_STATUS, TASK_STATUS_DETAILS } from '../../utils/constants';

const COLUMNS = Object.entries(TASK_STATUS_DETAILS).map(([key, meta]) => ({
  key,
  ...meta,
}));

export const KanbanBoard = ({ projectId, workspaceId, projectMembers = [] }) => {
  const { user } = useAuth();
  const toast = useToast();
  const { isWorkspaceViewer } = useWorkspace();

  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({ search: '', priority: '', assigneeId: '' });

  // Create task
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState(TASK_STATUS.TODO);

  // Detail
  const [selectedTask, setSelectedTask] = useState(null);

  // Drag state
  const draggingTaskRef = useRef(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    const fetchTasks = async () => {
      if (!projectId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await taskService.getTasks(projectId);
        if (!ignore) {
          setAllTasks(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Failed to load tasks.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchTasks();
    return () => {
      ignore = true;
    };
  }, [projectId, refreshTrigger]);

  const handleRetry = () => setRefreshTrigger((prev) => prev + 1);

  // ─── Filter logic ────────────────────────────────────────────────────────────
  const filteredTasks = allTasks.filter((t) => {
    if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    if (filters.assigneeId === 'unassigned' && t.assignee_id) return false;
    if (filters.assigneeId && filters.assigneeId !== 'unassigned' && t.assignee_id !== filters.assigneeId) return false;
    return true;
  });

  const getColumnTasks = (status) =>
    filteredTasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position);

  // ─── Create task ─────────────────────────────────────────────────────────────
  const handleCreateTask = async (data) => {
    try {
      const created = await taskService.createTask(projectId, workspaceId, user.id, {
        ...data,
        status: createDefaultStatus,
      });
      setAllTasks((prev) => [...prev, created]);
      toast.success(`Task "${created.title}" created!`, 'Task Created');
    } catch (err) {
      toast.error(err.message || 'Failed to create task');
      throw err;
    }
  };

  const handleOpenCreate = (status = TASK_STATUS.TODO) => {
    setCreateDefaultStatus(status);
    setShowCreateModal(true);
  };

  // ─── Update task (from detail modal) ────────────────────────────────────────
  const handleTaskUpdated = async (taskId, updates) => {
    if (!taskId || !updates) {
      // Called without args = just refresh comment count
      const data = await taskService.getTasks(projectId);
      setAllTasks(data);
      return;
    }
    try {
      const updated = await taskService.updateTask(taskId, updates);
      setAllTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setSelectedTask(updated);
      toast.success('Task updated.', 'Saved');
    } catch (err) {
      toast.error(err.message || 'Failed to update task');
      throw err;
    }
  };

  // ─── Delete task ─────────────────────────────────────────────────────────────
  const handleTaskDeleted = (taskId) => {
    setAllTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTask(null);
  };

  // ─── Drag & Drop ─────────────────────────────────────────────────────────────
  const handleDragStart = (e, task) => {
    draggingTaskRef.current = task;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragEnd = () => {
    draggingTaskRef.current = null;
    setDragOverColumn(null);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    const task = draggingTaskRef.current;
    if (!task) return;
    if (task.status === newStatus) return;

    // Optimistic update
    const columnTasks = getColumnTasks(newStatus);
    const newPosition = columnTasks.length; // put at end

    const previousTasks = allTasks;
    setAllTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, status: newStatus, position: newPosition } : t
      )
    );

    try {
      await taskService.moveTask(task.id, newStatus, newPosition);
    } catch {
      // Rollback
      setAllTasks(previousTasks);
      toast.error('Failed to move task. Please try again.');
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Spinner size="xl" />
        <p className="text-sm text-slate-500 animate-pulse">Loading Kanban board...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <AlertCircle className="w-10 h-10 text-rose-500" />
        <p className="text-sm font-bold text-rose-700 dark:text-rose-300">{error}</p>
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={handleRetry}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Board Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <KanbanSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Kanban Board</h3>
          <Badge variant="indigo" size="xs">{allTasks.length} task{allTasks.length !== 1 ? 's' : ''}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <TaskFilters filters={filters} onChange={setFilters} projectMembers={projectMembers} />
          {!isWorkspaceViewer && (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => handleOpenCreate()}
            >
              New Task
            </Button>
          )}
        </div>
      </div>

      {/* Kanban columns — horizontal scroll on small screens */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const tasks = getColumnTasks(col.key);
          const isDragTarget = dragOverColumn === col.key;

          return (
            <div
              key={col.key}
              className="flex-shrink-0 w-64 flex flex-col"
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              {/* Column Header */}
              <div
                className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl border-t-4 ${col.columnColor} ${col.headerBg} border border-slate-200 dark:border-slate-700/50`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {col.label}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    {tasks.length}
                  </span>
                </div>
                {!isWorkspaceViewer && (
                  <button
                    onClick={() => handleOpenCreate(col.key)}
                    className="p-0.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition"
                    title={`Add task to ${col.label}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Drop Zone + Cards */}
              <div
                className={`
                  flex-1 min-h-[200px] p-2 space-y-2 rounded-b-xl border-x border-b
                  border-slate-200 dark:border-slate-700/50 transition-colors
                  ${isDragTarget
                    ? 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800'
                    : 'bg-slate-50/60 dark:bg-slate-900/40'
                  }
                `}
              >
                {tasks.length === 0 && !isDragTarget && (
                  <div className="flex flex-col items-center justify-center h-24 text-center">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      No tasks here
                    </p>
                    {!isWorkspaceViewer && (
                      <button
                        onClick={() => handleOpenCreate(col.key)}
                        className="mt-1 text-[11px] text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition"
                      >
                        + Add task
                      </button>
                    )}
                  </div>
                )}

                {isDragTarget && tasks.length === 0 && (
                  <div className="flex items-center justify-center h-24 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700">
                    <p className="text-xs text-indigo-500 dark:text-indigo-400">Drop here</p>
                  </div>
                )}

                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      <TaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTask}
        defaultStatus={createDefaultStatus}
        projectMembers={projectMembers}
      />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          task={allTasks.find((t) => t.id === selectedTask.id) || selectedTask}
          projectMembers={projectMembers}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
