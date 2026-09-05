import { useState } from 'react'
import {
  Building2,
  Plus,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  X,
  Layers,
} from 'lucide-react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Badge } from '@/components/common/Badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card'
import { Spinner } from '@/components/common/Spinner'
import { cn } from '@/lib/utils'

// ── Role badge colour mapping ────────────────────────────────────────────────
const roleBadgeVariant = {
  Admin:   'danger',
  Manager: 'warning',
  Member:  'primary',
  Viewer:  'default',
}

// ── Workspace initials helper ────────────────────────────────────────────────
function getInitials(name = '') {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

// ── Avatar colour based on name hash ────────────────────────────────────────
const avatarColors = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-pink-500',
]
function getAvatarColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

// ── Create Workspace Modal ───────────────────────────────────────────────────
function CreateWorkspaceModal({ onClose, onCreate }) {
  const [name, setName]               = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [formError, setFormError]     = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!name.trim()) {
      setFormError('Workspace name is required.')
      return
    }

    setSubmitting(true)
    try {
      await onCreate({ name, description })
      onClose()
    } catch (err) {
      setFormError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-workspace-dialog-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="create-workspace-dialog-title"
                className="text-base font-semibold text-slate-900 dark:text-slate-100"
              >
                New Workspace
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You&apos;ll be added as Admin automatically.
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-create-workspace-modal"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5 space-y-4">
            <Input
              id="workspace-name"
              label="Workspace Name"
              required
              placeholder="e.g. Acme Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={formError && !name.trim() ? formError : undefined}
              autoFocus
            />
            <div className="w-full">
              <label
                htmlFor="workspace-description"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Description <span className="font-normal normal-case text-slate-400">(optional)</span>
              </label>
              <textarea
                id="workspace-description"
                rows={3}
                placeholder="What is this workspace for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={cn(
                  'w-full resize-none rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900',
                  'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20',
                  'dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:placeholder:text-slate-500 dark:focus:border-blue-500'
                )}
              />
            </div>

            {/* Non-field error */}
            {formError && name.trim() && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              id="cancel-create-workspace"
              variant="secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              id="submit-create-workspace"
              variant="primary"
              isLoading={submitting}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Create Workspace
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Workspace Card ───────────────────────────────────────────────────────────
function WorkspaceCard({ workspace, isActive, onSelect }) {
  const initials   = getInitials(workspace.name)
  const avatarColor = getAvatarColor(workspace.name)
  const badgeVariant = roleBadgeVariant[workspace.role] ?? 'default'

  const formattedDate = workspace.created_at
    ? new Date(workspace.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—'

  return (
    <button
      type="button"
      id={`workspace-card-${workspace.id}`}
      onClick={() => onSelect(workspace)}
      className={cn(
        'group w-full text-left rounded-xl border p-4 transition-all duration-150 cursor-pointer',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
        isActive
          ? 'border-blue-400 bg-blue-50/60 shadow-sm ring-1 ring-blue-400/30 dark:border-blue-700 dark:bg-blue-950/30 dark:ring-blue-700/30'
          : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/60'
      )}
    >
      <div className="flex items-start gap-3.5">
        {/* Workspace avatar */}
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white font-bold text-sm shadow-xs',
            avatarColor
          )}
        >
          {initials || <Layers className="h-5 w-5" />}
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {workspace.name}
            </span>
            {isActive && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Active
              </span>
            )}
          </div>

          {workspace.description && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {workspace.description}
            </p>
          )}

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Badge variant={badgeVariant} className="text-[11px]">
              {workspace.role}
            </Badge>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Created {formattedDate}
            </span>
          </div>
        </div>

        {/* Chevron */}
        <ChevronRight
          className={cn(
            'mt-1 h-4 w-4 shrink-0 transition-transform duration-150',
            isActive
              ? 'text-blue-500 dark:text-blue-400'
              : 'text-slate-300 group-hover:text-slate-500 dark:text-slate-700 dark:group-hover:text-slate-500'
          )}
        />
      </div>
    </button>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export function WorkspacesPage() {
  const { profile } = useAuth()
  const {
    workspaces,
    activeWorkspace,
    loading,
    error,
    fetchWorkspaces,
    createWorkspace,
    selectWorkspace,
  } = useWorkspace()

  const [showModal, setShowModal] = useState(false)

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Spinner className="h-8 w-8 text-blue-600" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading workspaces…</p>
      </div>
    )
  }

  return (
    <>
      {/* ── Create Workspace Modal ─────────────────────────────────────── */}
      {showModal && (
        <CreateWorkspaceModal
          onClose={() => setShowModal(false)}
          onCreate={createWorkspace}
        />
      )}

      <div className="space-y-6">
        {/* ── Page Header ───────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Workspaces
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {profile?.full_name ? `Welcome, ${profile.full_name}. ` : ''}
              Manage and switch between your team workspaces.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              id="refresh-workspaces"
              variant="outline"
              size="sm"
              onClick={fetchWorkspaces}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              aria-label="Refresh workspaces"
            >
              Refresh
            </Button>
            <Button
              id="open-create-workspace-modal"
              variant="primary"
              size="sm"
              onClick={() => setShowModal(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              New Workspace
            </Button>
          </div>
        </div>

        {/* ── Error banner ──────────────────────────────────────────────── */}
        {error && (
          <div
            id="workspaces-error-banner"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Failed to load workspaces</p>
              <p className="text-xs mt-0.5 opacity-80">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchWorkspaces}
              className="ml-auto text-xs font-medium underline underline-offset-2 hover:no-underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Active Workspace summary card ─────────────────────────────── */}
        {activeWorkspace && (
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30">
            <CardHeader className="border-blue-100 dark:border-blue-900/50">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm text-white shadow-xs',
                    getAvatarColor(activeWorkspace.name)
                  )}
                >
                  {getInitials(activeWorkspace.name) || <Layers className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-blue-900 dark:text-blue-100">
                    {activeWorkspace.name}
                  </CardTitle>
                  {activeWorkspace.description && (
                    <CardDescription className="text-blue-700/70 dark:text-blue-400/70 truncate">
                      {activeWorkspace.description}
                    </CardDescription>
                  )}
                </div>
                <Badge variant={roleBadgeVariant[activeWorkspace.role] ?? 'default'} className="ml-auto shrink-0">
                  {activeWorkspace.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="py-3">
              <p className="text-xs text-blue-700/80 dark:text-blue-300/70 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                This is your currently active workspace. All pages load data from this context.
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Workspace list / empty state ──────────────────────────────── */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            {workspaces.length > 0
              ? `All Workspaces (${workspaces.length})`
              : 'Your Workspaces'}
          </h2>

          {!error && workspaces.length === 0 && (
            /* ── Empty state ──────────────────────────────────────────── */
            <div
              id="workspaces-empty-state"
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 px-8 dark:border-slate-800 dark:bg-slate-900/30"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-500 dark:bg-blue-900/40 dark:text-blue-400">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                No workspaces yet
              </h3>
              <p className="mt-1.5 max-w-xs text-center text-sm text-slate-500 dark:text-slate-400">
                Create your first workspace to start collaborating with your team.
              </p>
              <Button
                id="empty-state-create-workspace"
                variant="primary"
                className="mt-6"
                onClick={() => setShowModal(true)}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Create Your First Workspace
              </Button>
            </div>
          )}

          {workspaces.length > 0 && (
            <div id="workspaces-list" className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
              {workspaces.map((ws) => (
                <WorkspaceCard
                  key={ws.id}
                  workspace={ws}
                  isActive={activeWorkspace?.id === ws.id}
                  onSelect={selectWorkspace}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
