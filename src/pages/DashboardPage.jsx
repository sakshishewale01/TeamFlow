import { Link } from 'react-router-dom'
import {
  FolderKanban,
  CheckSquare,
  Users,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'

export function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-blue-100">
            <Layers className="w-3.5 h-3.5 text-blue-200" />
            <span>Workspace Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            TeamFlow Dashboard
          </h1>
          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Welcome to TeamFlow. Manage your team projects, prioritize tasks, and track real-time delivery milestones.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link to="/projects">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-blue-700 hover:bg-blue-50 border-0 font-semibold"
              >
                View Projects
              </Button>
            </Link>
            <Link to="/tasks">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white/30 hover:bg-white/10"
              >
                View Tasks
              </Button>
            </Link>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Active Projects
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                --
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Phase 4: Workspace Projects
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <FolderKanban className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Total Tasks
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                --
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Phase 5: Kanban Board
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckSquare className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Team Members
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                --
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Workspace Collaborators
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Sprint Velocity
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                --
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Realtime Analytics
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Launch & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Quick Navigation</CardTitle>
                <CardDescription>Core sections of your project workspace</CardDescription>
              </div>
              <Badge variant="primary">Foundation</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              to="/projects"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <FolderKanban className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Projects Management
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Create, organize, and monitor workspace projects
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/tasks"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Task Board
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kanban status boards and workflow assignments
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/profile"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    User Profile & Security
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Update personal profile, avatar, and credentials
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Architecture Status</CardTitle>
            <CardDescription>System layer readiness for upcoming development phases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Phase 0: Project Foundation
              </span>
              <Badge variant="success">Completed</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Phase 1: Authentication & Profiles
              </span>
              <Badge variant="primary">Next</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Phase 2: Workspaces & RBAC
              </span>
              <Badge variant="default">Scheduled</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Phase 3: Projects & Kanban Tasks
              </span>
              <Badge variant="default">Scheduled</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
