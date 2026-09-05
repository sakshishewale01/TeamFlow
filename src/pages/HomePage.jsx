import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { Input } from '@/components/common/Input'
import { ROLES, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '@/lib/constants'
import { isSupabaseConfigured } from '@/lib/supabase'
import {
  CheckCircle2,
  Circle,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Database,
} from 'lucide-react'

export function HomePage() {
  const [btnLoading, setBtnLoading] = useState(false)
  const [testInput, setTestInput] = useState('')

  const handleSimulateClick = () => {
    setBtnLoading(true)
    setTimeout(() => setBtnLoading(false), 1200)
  }

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-blue-100 backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Phase 1: Project Foundation Complete</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            TeamFlow Foundation is Ready
          </h1>
          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
            The modern architecture, responsive app shell, light/dark theme system,
            path aliasing, and reusable UI primitives are prepared for step-by-step feature development.
          </p>
        </div>
      </div>

      {/* Grid: Architecture & Status Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Workspace Model Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Workspace Hierarchy</CardTitle>
                <CardDescription>Multi-tenant organization model</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3 font-mono text-[11px] leading-relaxed">
              <div>🏢 Workspace</div>
              <div className="pl-4">├── 👥 Members (Admin, Manager, Member, Viewer)</div>
              <div className="pl-4">└── 📁 Projects</div>
              <div className="pl-8">├── 👥 Project Members</div>
              <div className="pl-8">└── 📋 Tasks</div>
              <div className="pl-12">└── 💬 Comments</div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Users can belong to multiple workspaces with independent permission roles.
            </p>
          </CardContent>
        </Card>

        {/* Roles & Permissions Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Planned User Roles</CardTitle>
                <CardDescription>Role-based access matrix</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <Badge variant="primary" dot>{ROLES.ADMIN}</Badge>
              <span className="text-xs text-slate-500">Full workspace control</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <Badge variant="success" dot>{ROLES.MANAGER}</Badge>
              <span className="text-xs text-slate-500">Projects & team management</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <Badge variant="warning" dot>{ROLES.MEMBER}</Badge>
              <span className="text-xs text-slate-500">Tasks & comments</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <Badge variant="default" dot>{ROLES.VIEWER}</Badge>
              <span className="text-xs text-slate-500">Read-only access</span>
            </div>
          </CardContent>
        </Card>

        {/* Backend & Supabase Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Backend Integration</CardTitle>
                <CardDescription>Supabase hosted configuration</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Connection:</span>
              <Badge variant={isSupabaseConfigured ? 'success' : 'warning'}>
                {isSupabaseConfigured ? 'Connected' : 'Pending Credentials'}
              </Badge>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Configured safely via <code>.env.local</code>. Database schema and Row Level Security (RLS) policies will be designed and reviewed in the next phase.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* UI Primitives Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Foundational UI Components Showcase</CardTitle>
          <CardDescription>
            Built using standard React primitives, Tailwind CSS v4, and Lucide icons without bulky external libraries.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Button Variants */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Button Component Variants
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button
                variant="primary"
                isLoading={btnLoading}
                onClick={handleSimulateClick}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                {btnLoading ? 'Processing...' : 'Click to Test Loading'}
              </Button>
            </div>
          </div>

          {/* Input Component */}
          <div className="max-w-md">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Input Component
            </h4>
            <Input
              label="Test Form Input"
              placeholder="Type something to test..."
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              helperText={testInput ? `You entered: ${testInput}` : 'Type to see interactive reactive state'}
            />
          </div>

          {/* Badges */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Status & Priority Badges
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              {Object.entries(TASK_STATUS_LABELS).map(([key, label]) => (
                <Badge key={key} variant="primary" dot>{label}</Badge>
              ))}
              {Object.entries(TASK_PRIORITY_LABELS).map(([key, label]) => (
                <Badge key={key} variant="warning">{label}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roadmap Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>TeamFlow Step-by-Step Roadmap</CardTitle>
          <CardDescription>
            Structured incremental progression for safe full-stack development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-xs sm:text-sm">
            <li className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Step 1: Project Foundation (Configuration, Router, Theme, UI Primitives, Shell)</span>
            </li>
            <li className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <Circle className="h-4 w-4 shrink-0" />
              <span>Step 2: Supabase Database Schema & RLS Design (Workspaces, Projects, Tasks, Roles)</span>
            </li>
            <li className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <Circle className="h-4 w-4 shrink-0" />
              <span>Step 3: Authentication Flow (Signup, Login, Logout, Forgot Password, Profile)</span>
            </li>
            <li className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <Circle className="h-4 w-4 shrink-0" />
              <span>Step 4: Workspace & Project Management (CRUD, Inviting Members)</span>
            </li>
            <li className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <Circle className="h-4 w-4 shrink-0" />
              <span>Step 5: Task Management & Kanban Board (Drag-and-Drop, Statuses, Priority)</span>
            </li>
            <li className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <Circle className="h-4 w-4 shrink-0" />
              <span>Step 6: Realtime Collaboration, Comments & Storage (Live updates, File uploads)</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
