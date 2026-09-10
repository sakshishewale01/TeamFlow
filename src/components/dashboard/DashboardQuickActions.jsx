import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderKanban, CheckSquare } from 'lucide-react';
import Button from '../ui/Button';
import { APP_ROUTES } from '../../utils/constants';

export const DashboardQuickActions = ({
  canCreateProjects = false,
  canCreateTasks = false,
  onNewProject,
  onNewTask,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Primary mutations for permitted roles */}
      {canCreateProjects && (
        <Button
          variant="primary"
          size="sm"
          onClick={onNewProject}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          New Project
        </Button>
      )}

      {canCreateTasks && (
        <Button
          variant="outline"
          size="sm"
          onClick={onNewTask}
          className="font-medium bg-white dark:bg-slate-900"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
          New Task
        </Button>
      )}

      {/* Navigation shortcuts available to all roles */}
      <Link to={APP_ROUTES.PROJECTS}>
        <Button variant="ghost" size="sm">
          <FolderKanban className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
          View Projects
        </Button>
      </Link>

      <Link to={APP_ROUTES.TASKS}>
        <Button variant="ghost" size="sm">
          <CheckSquare className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
          View Tasks
        </Button>
      </Link>
    </div>
  );
};

export default DashboardQuickActions;
