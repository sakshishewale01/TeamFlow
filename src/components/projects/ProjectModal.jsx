import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { FolderKanban, Calendar } from 'lucide-react';
import { PROJECT_STATUS, PROJECT_STATUS_DETAILS } from '../../utils/constants';

const ProjectModalForm = ({
  onClose,
  onSubmit,
  initialData = null,
  isEditing = false,
}) => {
  const [name, setName] = useState(isEditing && initialData ? initialData.name || '' : '');
  const [description, setDescription] = useState(isEditing && initialData ? initialData.description || '' : '');
  const [status, setStatus] = useState(isEditing && initialData ? initialData.status || PROJECT_STATUS.PLANNING : PROJECT_STATUS.PLANNING);
  const [startDate, setStartDate] = useState(isEditing && initialData ? initialData.start_date || '' : '');
  const [endDate, setEndDate] = useState(isEditing && initialData ? initialData.end_date || '' : '');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    const newErrors = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Project name is required';
    } else if (trimmedName.length > 100) {
      newErrors.name = 'Project name must be 100 characters or fewer';
    }

    if (description && description.trim().length > 500) {
      newErrors.description = 'Description must be 500 characters or fewer';
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = 'End date cannot be earlier than start date';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await onSubmit({
        name: trimmedName,
        description: description ? description.trim() : null,
        status,
        startDate: startDate || null,
        endDate: endDate || null,
      });
      onClose();
    } catch (err) {
      setErrors({ general: err.message || 'Failed to save project' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
          {errors.general}
        </div>
      )}

      <Input
        label="Project Name"
        placeholder="e.g. Mobile App Redesign"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
        }}
        error={errors.name}
        icon={FolderKanban}
        required
        autoFocus
      />

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
          Description (Optional)
        </label>
        <textarea
          rows={2}
          placeholder="Brief overview of project scope..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm p-3 transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
          Project Status
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(PROJECT_STATUS_DETAILS).map(([key, item]) => {
            const isSelected = status === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setStatus(key)}
                className={`p-2 rounded-xl text-xs font-semibold border transition text-center cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            if (errors.endDate) setErrors((prev) => ({ ...prev, endDate: null }));
          }}
          icon={Calendar}
        />
        <Input
          label="Target End Date"
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            if (errors.endDate) setErrors((prev) => ({ ...prev, endDate: null }));
          }}
          error={errors.endDate}
          icon={Calendar}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {isEditing ? 'Save Changes' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
};

export const ProjectModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isEditing = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Project' : 'Create New Project'}
      description={
        isEditing
          ? 'Update project parameters, status, and milestone dates.'
          : 'Projects organize team tasks, milestones, and deliverables under your workspace.'
      }
      size="md"
    >
      {isOpen && (
        <ProjectModalForm
          key={`${initialData?.id || 'new'}-${isEditing}`}
          onClose={onClose}
          onSubmit={onSubmit}
          initialData={initialData}
          isEditing={isEditing}
        />
      )}
    </Modal>
  );
};

export default ProjectModal;
