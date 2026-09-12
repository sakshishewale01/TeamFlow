import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  AlertCircle,
  RotateCcw,
  Sparkles,
  FolderPlus,
  ArrowRight,
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { APP_ROUTES } from '../utils/constants';

import DashboardKPIs from '../components/dashboard/DashboardKPIs';
import TaskStatusBreakdown from '../components/dashboard/TaskStatusBreakdown';
import PriorityBreakdown from '../components/dashboard/PriorityBreakdown';
import UpcomingDeadlines from '../components/dashboard/UpcomingDeadlines';
import RecentActivity from '../components/dashboard/RecentActivity';
import DashboardQuickActions from '../components/dashboard/DashboardQuickActions';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';

import ProjectModal from '../components/projects/ProjectModal';
import TaskModal from '../components/tasks/TaskModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';

export const DashboardPage = () => {
  const { user, profile } = useAuth();
  const { canCreateProjects, isViewer } = useRole();
  const { data, loading, error, refresh, activeWorkspace } = useDashboard();

  // Modals state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [assignees, setAssignees] = useState([]);
  const [labels, setLabels] = useState([]);

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Team Member';
  const canCreateTasks = !isViewer && (data.projects || []).length > 0;

  // Preload assignees & labels for TaskModal when workspace changes
  useEffect(() => {
    let ignore = false;
    async function loadWorkspaceMeta() {
      if (!activeWorkspace?.id) return;
      try {
        const [assigneeList, labelList] = await Promise.all([
          taskService.getWorkspaceAssignees(activeWorkspace.id),
          taskService.getTaskLabels(activeWorkspace.id),
        ]);
        if (!ignore) {
          setAssignees(assigneeList || []);
          setLabels(labelList || []);
        }
      } catch (err) {
        console.error('[DashboardPage] Error preloading meta:', err);
      }
    }
    loadWorkspaceMeta();
    return () => {
      ignore = true;
    };
  }, [activeWorkspace?.id]);

  const handleCreateProject = async (formData) => {
    if (!activeWorkspace?.id || !user?.id) return;
    await projectService.createProject(activeWorkspace.id, formData, user.id);
    setShowProjectModal(false);
    refresh();
  };

  const handleCreateTask = async (formData) => {
    if (!user?.id) return;
    await taskService.createTask({
      ...formData,
      created_by: user.id,
    });
    setShowTaskModal(false);
    refresh();
  };

  const handleDeleteTask = async (taskId) => {
    await taskService.deleteTask(taskId);
    setSelectedTask(null);
    refresh();
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="space-y-6">
        <DashboardSkeleton />
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Unable to load dashboard data
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
          {error}
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={refresh}
          className="mt-5"
        >
          <RotateCcw className="w-4 h-4 mr-1.5" />
          Retry
        </Button>
      </div>
    );
  }

  const hasZeroData = data.totalProjects === 0 && data.totalTasks === 0;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Workspace Context Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white shadow-lg shadow-indigo-500/10">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-blue-100 border border-white/15">
            <Layers className="w-3.5 h-3.5 text-blue-200" />
            <span>{activeWorkspace?.name || 'Workspace'}</span>
            <span className="w-1 h-1 rounded-full bg-blue-300" />
            <span className="capitalize">{activeWorkspace?.userRole || 'Member'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {userName}!
          </h1>
          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Live operational overview for{' '}
            <strong className="text-white font-semibold">
              {activeWorkspace?.name || 'your workspace'}
            </strong>
            . Track sprint delivery milestones, active workloads, and team discussions.
          </p>

          {/* Quick Actions Header Toolbar */}
          <div className="pt-2">
            <DashboardQuickActions
              canCreateProjects={canCreateProjects}
              canCreateTasks={canCreateTasks}
              onNewProject={() => setShowProjectModal(true)}
              onNewTask={() => setShowTaskModal(true)}
            />
          </div>
        </div>

        {/* Ambient decorative glow */}
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      </div>

      {/* Empty Workspace Experience */}
      {hasZeroData ? (
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Welcome to {activeWorkspace?.name || 'your workspace'}!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              No projects or tasks have been created yet. Get started by organizing your first project and assigning team deliverables.
            </p>
          </div>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            {canCreateProjects ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowProjectModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-500/20"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                Create First Project
              </Button>
            ) : (
              <Link to={APP_ROUTES.PROJECTS}>
                <Button variant="primary" size="md">
                  View Projects
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Section 1: KPI Cards & Completion Rate */}
          <DashboardKPIs
            totalProjects={data.totalProjects}
            totalTasks={data.totalTasks}
            completedTasks={data.completedTasks}
            pendingTasks={data.pendingTasks}
            completionRate={data.completionRate}
          />

          {/* Section 2: Two-column Status & Priority Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <TaskStatusBreakdown
              statusCounts={data.statusCounts}
              totalTasks={data.totalTasks}
            />
            <PriorityBreakdown
              priorityCounts={data.priorityCounts}
              totalTasks={data.totalTasks}
            />
          </div>

          {/* Section 3: Two-column Deadlines & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <UpcomingDeadlines
              upcomingTasks={data.upcomingTasks}
              overdueTasks={data.overdueTasks}
              totalOverdueCount={data.totalOverdueCount}
              onTaskClick={(task) => setSelectedTask(task)}
            />
            <RecentActivity
              recentTasks={data.recentTasks}
              recentComments={data.recentComments}
              onTaskClick={(task) => setSelectedTask(task)}
            />
          </div>
        </>
      )}

      {/* Modals */}
      {showProjectModal && (
        <ProjectModal
          isOpen={showProjectModal}
          onClose={() => setShowProjectModal(false)}
          onSubmit={handleCreateProject}
        />
      )}

      {showTaskModal && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          onSubmit={handleCreateTask}
          projects={data.projects || []}
          showProjectSelect={true}
          assignees={assignees}
          labels={labels}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          isOpen={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          onDelete={handleDeleteTask}
          onEdit={() => {
            setSelectedTask(null);
            refresh();
          }}
        />
      )}
    </div>
  );
};

export default DashboardPage;
