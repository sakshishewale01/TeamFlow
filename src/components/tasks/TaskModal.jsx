import React, { useState } from 'react';
import { AlignLeft, Calendar, Flag, User } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { TASK_STATUS, TASK_STATUS_DETAILS, TASK_PRIORITY, TASK_PRIORITY_DETAILS } from '../../utils/constants';

const statusOptions = Object.entries(TASK_STATUS_DETAILS).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

const priorityOptions = Object.entries(TASK_PRIORITY_DETAILS).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

export const TaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isEditing = false,
  defaultStatus = TASK_STATUS.TODO,
  projectMembers = [],
}) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: defaultStatus,
    priority: TASK_PRIORITY.MEDIUM,
    dueDate: '',
    assigneeId: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [prevTrigger, setPrevTrigger] = useState({ isOpen: false, initialData: null });
  if (isOpen !== prevTrigger.isOpen || initialData !== prevTrigger.initialData) {
    setPrevTrigger({ isOpen, initialData });
    if (isOpen) {
      if (isEditing && initialData) {
        setForm({
          title: initialData.title || '',
          description: initialData.description || '',
          status: initialData.status || defaultStatus,
          priority: initialData.priority || TASK_PRIORITY.MEDIUM,
          dueDate: initialData.due_date || '',
          assigneeId: initialData.assignee_id || '',
        });
      } else {
        setForm({
          title: '',
          description: '',
          status: defaultStatus,
          priority: TASK_PRIORITY.MEDIUM,
          dueDate: '',
          assigneeId: '',
        });
      }
      setErrors({});
    }
  }

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Task title is required.';
    return newErrors;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
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
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate || null,
        assigneeId: form.assigneeId || null,
      });
      onClose();
    } catch {
      // errors handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectClass =
    'block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Create New Task'}
      description={isEditing ? 'Update the task details below.' : 'Fill in the details for your new task.'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        {/* Title */}
        <Input
          label="Task Title"
          id="task-title"
          value={form.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="e.g. Design login screen mockup"
          error={errors.title}
          required
          autoFocus
        />

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Description
          </label>
          <div className="relative">
            <AlignLeft className="absolute top-3 left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add more context about this task..."
              rows={3}
              className="block w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none hover:border-slate-300 dark:hover:border-slate-700"
            />
          </div>
        </div>

        {/* Status + Priority row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className={selectClass}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              <Flag className="inline w-3 h-3 mr-1" />
              Priority
            </label>
            <select
              value={form.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className={selectClass}
            >
              {priorityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date + Assignee row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              <Calendar className="inline w-3 h-3 mr-1" />
              Due Date
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className={selectClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              <User className="inline w-3 h-3 mr-1" />
              Assignee
            </label>
            <select
              value={form.assigneeId}
              onChange={(e) => handleChange('assigneeId', e.target.value)}
              className={selectClass}
            >
              <option value="">Unassigned</option>
              {projectMembers.map((m) => {
                const name = m.user?.full_name || m.user?.email || m.user_id;
                return (
                  <option key={m.user_id} value={m.user_id}>{name}</option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
