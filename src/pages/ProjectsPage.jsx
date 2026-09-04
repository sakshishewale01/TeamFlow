import { useState, useEffect, useCallback } from 'react'
import { FolderKanban, Plus, RefreshCw, AlertCircle, Calendar, X, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useWorkspace } from '@/hooks/useWorkspace'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Badge } from '@/components/common/Badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card'
import { Spinner } from '@/components/common/Spinner'
import { cn } from '@/lib/utils'

// ── Status badge variant mapping ─────────────────────────────────────────────
const statusBadgeVariant = {
  active: 'primary',
  completed: 'default', // Using default since 'success' isn't explicitly defined in standard variants, though we can use custom styles
  on_hold: 'warning',
  archived: 'secondary',
}

const statusDisplay = {
  active: 'Active',
  completed: 'Completed',
  on_hold: 'On Hold',
  archived: 'Archived',
}

// ── Create Project Modal ─────────────────────────────────────────────────────
function CreateProjectModal({ onClose, onCreate, workspaceId }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('active')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!name.trim()) {
      setFormError('Project name is required.')
      return
    }

    setSubmitting(true)
    try {
      await onCreate({
        workspace_id: workspaceId,
        name: name.trim(),
        description: description.trim() || null,
        status,
        start_date: startDate || null,
        end_date: endDate || null,
      })
      onClose()
    } catch (err) {
      setFormError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                New Project
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5 space-y-4">
            <Input
              label="Project Name"
              required
              placeholder="e.g. Website Redesign"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={formError && !name.trim() ? formError : undefined}
              autoFocus
            />

            <div className="w-full">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Description <span className="font-normal normal-case text-slate-400">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="What is this project about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={cn(
                  'w-full resize-none rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900',
                  'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20',
                  'dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:placeholder:text-slate-500 dark:focus:border-blue-500'
                )}
              />
            </div>

            <div className="w-full">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={cn(
                  'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900',
                  'focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20',
                  'dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:focus:border-blue-500'
                )}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {formError && name.trim() && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting} leftIcon={<Plus className="h-4 w-4" />}>
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export function ProjectsPage() {
  const { user } = useAuth()
  const { activeWorkspace } = useWorkspace()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const fetchProjects = useCallback(async () => {
    if (!activeWorkspace) {
      setProjects([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('workspace_id', activeWorkspace.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setProjects(data || [])
    } catch (err) {
      console.error('[ProjectsPage] fetchProjects:', err.message)
      setError(err.message || 'Failed to load projects.')
    } finally {
      setLoading(false)
    }
  }, [activeWorkspace])

  useEffect(() => {
    const loadProjects = async () => {
      await fetchProjects()
    }
    loadProjects()
  }, [fetchProjects])

  const createProject = async (projectData) => {
    if (!user) throw new Error('You must be logged in to create a project.')

    // Add created_by manually
    const payload = {
      ...projectData,
      created_by: user.id
    }

    const { error: insertError } = await supabase
      .from('projects')
      .insert(payload)

    if (insertError) throw insertError
    await fetchProjects()
  }

  // Loading state for workspace change
  if (loading && projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Spinner className="h-8 w-8 text-blue-600" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading projects…</p>
      </div>
    )
  }

  if (!activeWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <FolderKanban className="h-12 w-12 text-slate-300 dark:text-slate-600" />
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">No Workspace Selected</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
          Please select a workspace from the sidebar or create a new one to view and manage projects.
        </p>
      </div>
    )
  }

  return (
    <>
      {showModal && (
        <CreateProjectModal
          workspaceId={activeWorkspace.id}
          onClose={() => setShowModal(false)}
          onCreate={createProject}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Projects
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage projects for <strong>{activeWorkspace.name}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProjects}
              leftIcon={<RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowModal(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              New Project
            </Button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Failed to load projects</p>
              <p className="text-xs mt-0.5 opacity-80">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchProjects}
              className="ml-auto text-xs font-medium underline underline-offset-2 hover:no-underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!error && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 px-8 dark:border-slate-800 dark:bg-slate-900/30">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-500 dark:bg-blue-900/40 dark:text-blue-400">
              <FolderKanban className="h-8 w-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              No projects yet
            </h3>
            <p className="mt-1.5 max-w-xs text-center text-sm text-slate-500 dark:text-slate-400">
              Get started by creating your first project in this workspace.
            </p>
            <Button
              variant="primary"
              className="mt-6"
              onClick={() => setShowModal(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Create Project
            </Button>
          </div>
        )}

        {/* Project List */}
        {projects.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {projects.map((project) => (
              <Card key={project.id} className="hover:border-blue-300 transition-colors group">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant={statusBadgeVariant[project.status] ?? 'default'} className="capitalize">
                      {statusDisplay[project.status] || project.status || 'Active'}
                    </Badge>
                  </div>
                  {project.description && (
                    <CardDescription className="line-clamp-2 mt-2">
                      {project.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {project.start_date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {project.end_date && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Due: {new Date(project.end_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
