import { FolderKanban, CheckSquare, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

export const DashboardKPIs = ({
  totalProjects = 0,
  totalTasks = 0,
  completedTasks = 0,
  pendingTasks = 0,
  completionRate = 0,
}) => {
  const kpiItems = [
    {
      title: 'Total Projects',
      value: totalProjects,
      subtitle: `${totalProjects === 1 ? '1 active project' : `${totalProjects} active projects`}`,
      icon: FolderKanban,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      border: 'hover:border-blue-200 dark:hover:border-blue-800',
    },
    {
      title: 'Total Tasks',
      value: totalTasks,
      subtitle: `${totalTasks === 1 ? '1 task across workspace' : `${totalTasks} tasks across workspace`}`,
      icon: CheckSquare,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/60',
      border: 'hover:border-indigo-200 dark:hover:border-indigo-800',
    },
    {
      title: 'Completed Tasks',
      value: completedTasks,
      subtitle: `${completionRate}% of all tasks`,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      border: 'hover:border-emerald-200 dark:hover:border-emerald-800',
    },
    {
      title: 'Pending Tasks',
      value: pendingTasks,
      subtitle: `${totalTasks === 0 ? 'No active work' : `${pendingTasks} tasks in progress`}`,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      border: 'hover:border-amber-200 dark:hover:border-amber-800',
    },
  ];

  return (
    <div className="space-y-4">
      {/* 4 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all duration-200 ${item.border}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {item.title}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1.5 tracking-tight">
                    {item.value}
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    {item.subtitle}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${item.bg} ${item.color} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Rate Banner Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Workspace Task Completion Rate
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {completedTasks} of {totalTasks} tasks resolved
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              {completionRate}% Complete
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardKPIs;
