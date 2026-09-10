import React from 'react';
import { Plus, Inbox } from 'lucide-react';
import KanbanTaskCard from './KanbanTaskCard';

export const KanbanColumn = ({
  column,
  tasks = [],
  isDragOver = false,
  canDrag = true,
  canAddTask = true,
  draggedTaskId = null,
  dropIndex = null,
  onDragOver,
  onDragLeave,
  onDrop,
  onTaskDragStart,
  onTaskDragEnd,
  onTaskDragOver,
  onTaskClick,
  onAddTask,
}) => {
  return (
    <div
      className={`
        flex flex-col shrink-0 w-72 sm:w-80 rounded-2xl
        border transition-all duration-200
        ${
          isDragOver
            ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800 shadow-md ring-2 ring-indigo-500/20'
            : 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800'
        }
      `}
      onDragOver={(e) => onDragOver?.(e, column.key)}
      onDragLeave={(e) => onDragLeave?.(e, column.key)}
      onDrop={(e) => onDrop?.(e, column.key)}
    >
      {/* Column Header */}
      <div
        className={`
          flex items-center justify-between px-4 py-3 rounded-t-2xl border-t-4
          ${column.columnColor || 'border-t-indigo-500'}
          bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800
        `}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${column.dotColor || 'bg-indigo-500'}`} />
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
            {column.label}
          </h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
            {tasks.length}
          </span>
        </div>

        {canAddTask && (
          <button
            type="button"
            onClick={() => onAddTask?.(column.key)}
            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={`Add task to ${column.label}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Column Cards Drop Area */}
      <div className="flex-1 p-2.5 space-y-2.5 min-h-[380px] max-h-[calc(100vh-280px)] overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-4">
            {isDragOver ? (
              <div className="w-full h-full rounded-xl border-2 border-dashed border-indigo-400 dark:border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 flex items-center justify-center">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Drop task here
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-2">
                <Inbox className="w-6 h-6 stroke-[1.5]" />
                <p className="text-xs font-medium">No tasks in this stage.</p>
                {canAddTask && (
                  <button
                    type="button"
                    onClick={() => onAddTask?.(column.key)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    + Add task
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          tasks.map((task, index) => {
            const isBeingDragged = draggedTaskId === task.id;
            const showDropIndicator = isDragOver && dropIndex === index;

            return (
              <React.Fragment key={task.id}>
                {showDropIndicator && (
                  <div className="h-1.5 rounded-full bg-indigo-500 shadow-sm animate-pulse my-1" />
                )}
                <KanbanTaskCard
                  task={task}
                  canDrag={canDrag}
                  isDragging={isBeingDragged}
                  onClick={onTaskClick}
                  onDragStart={onTaskDragStart}
                  onDragEnd={onTaskDragEnd}
                  onDragOver={(e) => onTaskDragOver?.(e, task, index)}
                />
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
