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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Workspace name is required');
      return;
    }

    setNameError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
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
        autoFocus
      />

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
          Description (Optional)
        </label>
        <textarea
          rows={3}
          placeholder="What is this workspace focused on?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm p-3 transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
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
