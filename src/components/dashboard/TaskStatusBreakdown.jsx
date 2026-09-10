import { TASK_STATUS } from '../../utils/constants';

export const TaskStatusBreakdown = ({ statusCounts = {}, totalTasks = 0 }) => {
  const statuses = [
    {
      key: TASK_STATUS.TODO,
      label: 'Todo',
      color: 'bg-slate-400 dark:bg-slate-500',
      dotColor: 'bg-slate-400',
      badgeBg: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    },
    {
      key: TASK_STATUS.IN_PROGRESS,
      label: 'In Progress',
      color: 'bg-blue-500',
      dotColor: 'bg-blue-500',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300',
    },
    {
      key: TASK_STATUS.REVIEW,
      label: 'Review',
      color: 'bg-amber-500',
      dotColor: 'bg-amber-500',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
    },
    {
      key: TASK_STATUS.DONE,
      label: 'Done',
      color: 'bg-emerald-500',
      dotColor: 'bg-emerald-500',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Task Status Breakdown
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Distribution across workflow stages
          </p>
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {/* Multi-segment Distribution Bar */}
      {totalTasks > 0 ? (
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5 p-0.5">
          {statuses.map((item) => {
            const count = statusCounts[item.key] || 0;
            const pct = (count / totalTasks) * 100;
            if (pct <= 0) return null;
            return (
              <div
                key={item.key}
                style={{ width: `${pct}%` }}
                className={`h-full ${item.color} rounded-full transition-all duration-300`}
                title={`${item.label}: ${count} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>
      ) : (
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full" />
      )}

      {/* Status Grid Cards */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        {statuses.map((item) => {
          const count = statusCounts[item.key] || 0;
          const pct = totalTasks === 0 ? 0 : Math.round((count / totalTasks) * 100);

          return (
            <div
              key={item.key}
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.dotColor}`} />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {item.label}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {count}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">
                  ({pct}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskStatusBreakdown;
