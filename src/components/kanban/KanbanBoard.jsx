import React, { useState, useMemo, useRef } from 'react';
import { Plus, CheckSquare } from 'lucide-react';
import Button from '../ui/Button';
import KanbanColumn from './KanbanColumn';
import { TASK_STATUS, TASK_STATUS_DETAILS } from '../../utils/constants';

const KANBAN_COLUMNS = [
  {
    key: TASK_STATUS.TODO,
    label: 'Todo',
    dotColor: TASK_STATUS_DETAILS[TASK_STATUS.TODO]?.dotColor || 'bg-blue-500',
    columnColor: TASK_STATUS_DETAILS[TASK_STATUS.TODO]?.columnColor || 'border-t-blue-500',
  },
  {
    key: TASK_STATUS.IN_PROGRESS,
    label: 'In Progress',
    dotColor: TASK_STATUS_DETAILS[TASK_STATUS.IN_PROGRESS]?.dotColor || 'bg-amber-500',
    columnColor: TASK_STATUS_DETAILS[TASK_STATUS.IN_PROGRESS]?.columnColor || 'border-t-amber-500',
  },
  {
    key: TASK_STATUS.REVIEW,
    label: 'Review',
    dotColor: TASK_STATUS_DETAILS[TASK_STATUS.REVIEW]?.dotColor || 'bg-purple-500',
    columnColor: TASK_STATUS_DETAILS[TASK_STATUS.REVIEW]?.columnColor || 'border-t-purple-500',
  },
  {
    key: TASK_STATUS.DONE,
    label: 'Done',
    dotColor: TASK_STATUS_DETAILS[TASK_STATUS.DONE]?.dotColor || 'bg-emerald-500',
    columnColor: TASK_STATUS_DETAILS[TASK_STATUS.DONE]?.columnColor || 'border-t-emerald-500',
  },
];

export const KanbanBoard = ({
  tasks = [],
  canDrag = true,
  canAddTask = true,
  onTaskClick,
  onAddTask,
  onMoveTask,
}) => {
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const isDraggingRef = useRef(false);

  // Group tasks by canonical status and sort by position
  const columnTasksMap = useMemo(() => {
    const map = {
      [TASK_STATUS.TODO]: [],
      [TASK_STATUS.IN_PROGRESS]: [],
      [TASK_STATUS.REVIEW]: [],
      [TASK_STATUS.DONE]: [],
    };

    tasks.forEach((task) => {
      const status = task.status || TASK_STATUS.TODO;
      if (map[status]) {
        map[status].push(task);
      } else {
        // Fallback unrecognized status to todo
        map[TASK_STATUS.TODO].push(task);
      }
    });

    // Sort each column by position ascending
    Object.keys(map).forEach((colKey) => {
      map[colKey].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    });

    return map;
  }, [tasks]);

  // Drag handlers
  const handleTaskDragStart = (e, task) => {
    if (!canDrag) return;
    setDraggedTask(task);
    isDraggingRef.current = true;
  };

  const handleTaskDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
    setDropIndex(null);
    isDraggingRef.current = false;
  };

  const handleColumnDragOver = (e, columnKey) => {
    e.preventDefault();
    if (!canDrag || !draggedTask) return;
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnKey) {
      setDragOverColumn(columnKey);
    }
  };

  const handleColumnDragLeave = (e, columnKey) => {
    // Only clear if leaving the column element itself
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (dragOverColumn === columnKey) {
      setDragOverColumn(null);
      setDropIndex(null);
    }
  };

  const handleTaskDragOver = (e, task, index) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canDrag || !draggedTask) return;
    e.dataTransfer.dropEffect = 'move';

    setDragOverColumn(task.status);

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const targetIdx = e.clientY > midY ? index + 1 : index;

    if (dropIndex !== targetIdx) {
      setDropIndex(targetIdx);
    }
  };

  const handleDrop = async (e, targetColumnKey) => {
    e.preventDefault();
    if (!canDrag || !draggedTask) return;

    const sourceStatus = draggedTask.status || TASK_STATUS.TODO;
    const targetStatus = targetColumnKey;

    const sourceList = [...(columnTasksMap[sourceStatus] || [])];
    const targetList = sourceStatus === targetStatus ? sourceList : [...(columnTasksMap[targetStatus] || [])];

    const sourceIndex = sourceList.findIndex((t) => t.id === draggedTask.id);
    if (sourceIndex === -1) {
      handleTaskDragEnd();
      return;
    }

    let targetIdx = dropIndex !== null ? dropIndex : targetList.length;

    // Boundary check
    if (targetIdx < 0) targetIdx = 0;
    if (targetIdx > targetList.length) targetIdx = targetList.length;

    // Check if position and status are completely unchanged
    if (sourceStatus === targetStatus && (sourceIndex === targetIdx || sourceIndex === targetIdx - 1)) {
      handleTaskDragEnd();
      return;
    }

    // Build new lists
    let newSourceList = [];
    let newTargetList = [];
    const affectedUpdates = [];

    if (sourceStatus === targetStatus) {
      // Reordering within the same column
      const reordered = [...sourceList];
      const [removed] = reordered.splice(sourceIndex, 1);
      // Adjust target index if removing item before it
      const adjustedTargetIdx = sourceIndex < targetIdx ? targetIdx - 1 : targetIdx;
      reordered.splice(adjustedTargetIdx, 0, removed);

      newTargetList = reordered.map((task, idx) => ({
        ...task,
        position: idx,
      }));

      // Collect position updates
      newTargetList.forEach((task) => {
        if (task.id !== draggedTask.id) {
          const original = sourceList.find((t) => t.id === task.id);
          if (original && original.position !== task.position) {
            affectedUpdates.push({ id: task.id, position: task.position });
          }
        }
      });

      const updatedMovedTask = newTargetList.find((t) => t.id === draggedTask.id);
      const destinationPosition = updatedMovedTask ? updatedMovedTask.position : adjustedTargetIdx;

      // Construct optimistic tasks across entire project
      const optimisticTasks = tasks.map((t) => {
        if (t.status === targetStatus) {
          const matching = newTargetList.find((updated) => updated.id === t.id);
          return matching || t;
        }
        return t;
      });

      handleTaskDragEnd();

      if (onMoveTask) {
        await onMoveTask({
          taskId: draggedTask.id,
          destinationStatus: targetStatus,
          destinationPosition,
          affectedUpdates,
          optimisticTasks,
        });
      }
    } else {
      // Moving across different columns
      newSourceList = sourceList.filter((t) => t.id !== draggedTask.id).map((t, idx) => ({
        ...t,
        position: idx,
      }));

      const targetCopy = [...targetList];
      const movedTaskUpdated = {
        ...draggedTask,
        status: targetStatus,
        position: targetIdx,
      };
      targetCopy.splice(targetIdx, 0, movedTaskUpdated);

      newTargetList = targetCopy.map((t, idx) => ({
        ...t,
        position: idx,
      }));

      // Updates for shifted tasks in source column
      newSourceList.forEach((task) => {
        const original = sourceList.find((t) => t.id === task.id);
        if (original && original.position !== task.position) {
          affectedUpdates.push({ id: task.id, position: task.position });
        }
      });

      // Updates for shifted tasks in target column
      newTargetList.forEach((task) => {
        if (task.id !== draggedTask.id) {
          const original = targetList.find((t) => t.id === task.id);
          if (original && (original.position !== task.position || original.status !== targetStatus)) {
            affectedUpdates.push({ id: task.id, status: targetStatus, position: task.position });
          }
        }
      });

      const finalMovedTask = newTargetList.find((t) => t.id === draggedTask.id);
      const destinationPosition = finalMovedTask ? finalMovedTask.position : targetIdx;

      // Construct optimistic full tasks array
      const optimisticTasks = tasks.map((t) => {
        if (t.id === draggedTask.id) {
          return { ...t, status: targetStatus, position: destinationPosition };
        }
        if (t.status === sourceStatus) {
          const matching = newSourceList.find((u) => u.id === t.id);
          return matching || t;
        }
        if (t.status === targetStatus) {
          const matching = newTargetList.find((u) => u.id === t.id);
          return matching || t;
        }
        return t;
      });

      handleTaskDragEnd();

      if (onMoveTask) {
        await onMoveTask({
          taskId: draggedTask.id,
          destinationStatus: targetStatus,
          destinationPosition,
          affectedUpdates,
          optimisticTasks,
        });
      }
    }
  };

  // If project has zero tasks at all
  if (tasks.length === 0) {
    return (
      <div className="p-10 sm:p-14 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
          <CheckSquare className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          No tasks yet
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
          Organize work, track deliverables, and move cards across stages on this Kanban board.
        </p>
        {canAddTask && (
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => onAddTask?.(TASK_STATUS.TODO)}
          >
            Create First Task
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Horizontal scrolling columns container */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory sm:snap-none select-none">
        {KANBAN_COLUMNS.map((col) => {
          const columnTasks = columnTasksMap[col.key] || [];
          const isOverThisColumn = dragOverColumn === col.key;

          return (
            <div key={col.key} className="snap-start">
              <KanbanColumn
                column={col}
                tasks={columnTasks}
                isDragOver={isOverThisColumn}
                canDrag={canDrag}
                canAddTask={canAddTask}
                draggedTaskId={draggedTask?.id || null}
                dropIndex={isOverThisColumn ? dropIndex : null}
                onDragOver={handleColumnDragOver}
                onDragLeave={handleColumnDragLeave}
                onDrop={handleDrop}
                onTaskDragStart={handleTaskDragStart}
                onTaskDragEnd={handleTaskDragEnd}
                onTaskDragOver={handleTaskDragOver}
                onTaskClick={onTaskClick}
                onAddTask={onAddTask}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;
