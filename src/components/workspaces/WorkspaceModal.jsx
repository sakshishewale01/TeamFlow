import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Briefcase } from 'lucide-react';

const WorkspaceModalForm = ({
  onClose,
  onSubmit,
  initialData = null,
  isEditing = false,
}) => {
  const [name, setName] = useState(isEditing && initialData ? initialData.name || '' : '');
  const [description, setDescription] = useState(isEditing && initialData ? initialData.description || '' : '');
  const [nameError, setNameError] = useState(null);
  const [descError, setDescError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Workspace name is required');
      return;
    }
    if (trimmedName.length > 100) {
      setNameError('Workspace name must be 100 characters or fewer');
      return;
    }

    const trimmedDesc = description.trim();
    if (trimmedDesc.length > 500) {
      setDescError('Description must be 500 characters or fewer');
      return;
    }

    setNameError(null);
    setDescError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        name: trimmedName,
        description: trimmedDesc || null,
      });
      onClose();
    } catch (err) {
      setNameError(err.message || 'Failed to save workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Workspace Name"
        placeholder="e.g. Acme Engineering"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (nameError) setNameError(null);
        }}
        error={nameError}
        icon={Briefcase}
        required
        maxLength={100}
        autoFocus
      />

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Description (Optional)
          </label>
          <span className="text-[11px] text-slate-400">
            {description.length}/500
          </span>
        </div>
        <textarea
          rows={3}
          placeholder="What is this workspace focused on?"
          value={description}
          maxLength={500}
          onChange={(e) => {
            setDescription(e.target.value);
            if (descError) setDescError(null);
          }}
          className={`block w-full rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm p-3 transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
            descError
              ? 'border-rose-300 dark:border-rose-800 focus:border-rose-500'
              : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500'
          }`}
        />
        {descError && (
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
            {descError}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {isEditing ? 'Save Changes' : 'Create Workspace'}
        </Button>
      </div>
    </form>
  );
};

export const WorkspaceModal = ({
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
      title={isEditing ? 'Edit Workspace' : 'Create New Workspace'}
      description={
        isEditing
          ? 'Update the name and description of this workspace.'
          : 'Workspaces are top-level hubs for your teams, projects, and collaboration.'
      }
      size="md"
    >
      {isOpen && (
        <WorkspaceModalForm
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

export default WorkspaceModal;
