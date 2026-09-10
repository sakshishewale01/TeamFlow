import React, { useState } from 'react';
import { AlignLeft, Calendar, Flag, User, FolderKanban, Tag } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import {
  TASK_STATUS,
  TASK_STATUS_DETAILS,
  TASK_PRIORITY,
  TASK_PRIORITY_DETAILS,
} from '../../utils/constants';

const statusOptions = Object.entries(TASK_STATUS_DETAILS).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

const priorityOptions = Object.entries(TASK_PRIORITY_DETAILS).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

const TaskModalForm = ({
  onClose,
  onSubmit,
  initialData = null,
  isEditing = false,
  defaultStatus = TASK_STATUS.TODO,
  defaultProjectId = '',
  projects = [],
  showProjectSelect = false,
  assignees = [],
  labels = [],
}) => {
  const [form, setForm] = useState(() => {
    if (isEditing && initialData) {
      return {
        title: initialData.title || '',
        description: initialData.description || '',
        projectId: initialData.project_id || defaultProjectId || '',
        status: initialData.status || defaultStatus,
        priority: initialData.priority || TASK_PRIORITY.MEDIUM,
        dueDate: initialData.due_date || '',
        assigneeId: initialData.assignee_id || '',
        selectedLabelIds: (initialData.labels || []).map((l) => l.id),
      };
    }
    return {
      title: '',
      description: '',
      projectId: defaultProjectId || (projects.length > 0 ? projects[0].id : ''),
      status: defaultStatus,
      priority: TASK_PRIORITY.MEDIUM,
      dueDate: '',
      assigneeId: '',
      selectedLabelIds: [],
    };
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    const trimmedTitle = form.title.trim();
    if (!trimmedTitle) {
      newErrors.title = 'Task title is required.';
    } else if (trimmedTitle.length > 100) {
      newErrors.title = 'Task title cannot exceed 100 characters.';
    }

    if (form.description && form.description.trim().length > 500) {
      newErrors.description = 'Task description cannot exceed 500 characters.';
    }

    if (showProjectSelect && !form.projectId) {
      newErrors.projectId = 'Please select a project.';
    }

    return newErrors;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const toggleLabel = (labelId) => {
    setForm((prev) => {
      const exists = prev.selectedLabelIds.includes(labelId);
      const updated = exists
        ? prev.selectedLabelIds.filter((id) => id !== labelId)
        : [...prev.selectedLabelIds, labelId];
      return { ...prev, selectedLabelIds: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim() || null,
        projectId: form.projectId,
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate || null,
        assigneeId: form.assigneeId || null,
        labelIds: form.selectedLabelIds,
      });
      onClose();
    } catch {
      // Errors handled by parent component toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectClass =
    'block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      {/* Project Selector (if required from multi-project view) */}
      {showProjectSelect && !isEditing && (
        <div>
          <label
            htmlFor="task-project-select"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
          >
            <FolderKanban className="inline w-3.5 h-3.5 mr-1" />
            Project <span className="text-rose-500">*</span>
          </label>
          <select
            id="task-project-select"
            value={form.projectId}
            onChange={(e) => handleChange('projectId', e.target.value)}
            className={selectClass}
          >
            <option value="">Select a project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {errors.projectId && (
            <p className="mt-1 text-xs text-rose-500">{errors.projectId}</p>
          )}
        </div>
      )}

      {/* Title */}
      <div>
        <Input
          label="Task Title"
          id="task-title"
          value={form.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="e.g. Design responsive navigation"
          error={errors.title}
          required
          autoFocus
          maxLength={100}
        />
        <div className="flex justify-end mt-1">
          <span className="text-[11px] text-slate-400">
            {form.title.length}/100
          </span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="task-description"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
        >
          Description
        </label>
        <div className="relative">
          <AlignLeft className="absolute top-3 left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <textarea
            id="task-description"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Provide background context, scope, or acceptance criteria..."
            rows={3}
            maxLength={500}
            className="block w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none hover:border-slate-300 dark:hover:border-slate-700"
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          {errors.description ? (
            <p className="text-xs text-rose-500">{errors.description}</p>
          ) : <span />}
          <span className="text-[11px] text-slate-400">
            {form.description.length}/500
          </span>
        </div>
      </div>

      {/* Status + Priority Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="task-status"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Status
          </label>
          <select
            id="task-status"
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className={selectClass}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="task-priority"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
          >
            <Flag className="inline w-3 h-3 mr-1" />
            Priority
          </label>
          <select
            id="task-priority"
            value={form.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className={selectClass}
          >
            {priorityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Due Date + Assignee Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="task-due-date"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
          >
            <Calendar className="inline w-3 h-3 mr-1" />
            Due Date
          </label>
          <input
            id="task-due-date"
            type="date"
            value={form.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
            className={selectClass}
          />
        </div>

        <div>
          <label
            htmlFor="task-assignee"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
          >
            <User className="inline w-3 h-3 mr-1" />
            Assignee
          </label>
          <select
            id="task-assignee"
            value={form.assigneeId}
            onChange={(e) => handleChange('assigneeId', e.target.value)}
            className={selectClass}
          >
            <option value="">Unassigned</option>
            {assignees.map((user) => {
              const label = user.full_name || user.email || user.id;
              return (
                <option key={user.id} value={user.id}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Labels Selection */}
      {labels.length > 0 && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            <Tag className="inline w-3 h-3 mr-1" />
            Labels
          </label>
          <div className="flex flex-wrap gap-2">
            {labels.map((lbl) => {
              const isSelected = form.selectedLabelIds.includes(lbl.id);
              return (
                <button
                  key={lbl.id}
                  type="button"
                  onClick={() => toggleLabel(lbl.id)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition cursor-pointer border ${
                    isSelected
                      ? 'text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:border-slate-300'
                  }`}
                  style={
                    isSelected
                      ? { backgroundColor: lbl.color || '#6366f1', borderColor: lbl.color || '#6366f1' }
                      : {}
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: lbl.color || '#6366f1' }}
                  />
                  {lbl.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <Button variant="ghost" onClick={onClose} disabled={isSubmitting} type="button">
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={isSubmitting}>
          {isEditing ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export const TaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isEditing = false,
  defaultStatus = TASK_STATUS.TODO,
  defaultProjectId = '',
  projects = [],
  showProjectSelect = false,
  assignees = [],
  labels = [],
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Create New Task'}
      description={isEditing ? 'Update task attributes and assignments below.' : 'Add a new task to your project.'}
      size="md"
    >
      {isOpen && (
        <TaskModalForm
          key={`${initialData?.id || 'new'}-${isEditing}`}
          onClose={onClose}
          onSubmit={onSubmit}
          initialData={initialData}
          isEditing={isEditing}
          defaultStatus={defaultStatus}
          defaultProjectId={defaultProjectId}
          projects={projects}
          showProjectSelect={showProjectSelect}
          assignees={assignees}
          labels={labels}
        />
      )}
    </Modal>
  );
};

export default TaskModal;
