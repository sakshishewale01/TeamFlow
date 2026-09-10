import { Flag } from 'lucide-react';

export const PriorityBreakdown = ({ priorityCounts = {}, totalTasks = 0 }) => {
  const priorities = [
    {
      key: 'urgent',
      label: 'Urgent',
      color: 'bg-rose-500',
      textColor: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-100 dark:border-rose-900/40',
    },
    {
      key: 'high',
      label: 'High',
      color: 'bg-orange-500',
      textColor: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950/40',
      border: 'border-orange-100 dark:border-orange-900/40',
    },
    {
      key: 'medium',
      label: 'Medium',
      color: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-100 dark:border-blue-900/40',
    },
    {
      key: 'low',
      label: 'Low',
      color: 'bg-slate-400',
      textColor: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-800/40',
      border: 'border-slate-100 dark:border-slate-800/60',
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Priority Breakdown
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Urgency classification across all tasks
          </p>
        </div>
        <Flag className="w-4 h-4 text-slate-400" />
      </div>

      {/* Priority Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {priorities.map((item) => {
          const count = priorityCounts[item.key] || 0;
          const pct = totalTasks === 0 ? 0 : Math.round((count / totalTasks) * 100);

          return (
            <div
              key={item.key}
              className={`p-3.5 rounded-xl border ${item.border} ${item.bg} flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-semibold ${item.textColor}`}>
                  {item.label}
                </span>
                <span className={`w-2 h-2 rounded-full ${item.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {count}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {pct}% of tasks
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PriorityBreakdown;
