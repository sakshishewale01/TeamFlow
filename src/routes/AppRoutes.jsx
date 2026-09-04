import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card'
import { Clock } from 'lucide-react'
import { WorkspacesPage } from '@/pages/WorkspacesPage'
import { ProjectsPage } from '@/pages/ProjectsPage'

// Lightweight placeholder view for navigation items scheduled for subsequent phases
function FeaturePlaceholder({ title, description, phase }) {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
          <p>
            This section is part of <strong>{phase}</strong> and will be implemented after completing the database schema & authentication modules.
          </p>
          <p>
            The project foundation is active. You can explore the component showcase and architecture on the{' '}
            <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
              Dashboard
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="login" element={<LoginPage />} />
      <Route path="signup" element={<SignupPage />} />

      {/* Protected Application Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route
            path="workspaces"
            element={<WorkspacesPage />}
          />
          <Route
            path="projects"
            element={<ProjectsPage />}
          />
          <Route
            path="tasks"
            element={
              <FeaturePlaceholder
                title="Tasks & Kanban"
                description="Interactive Kanban board with drag-and-drop tasks"
                phase="Phase 5 (Kanban & Tasks)"
              />
            }
          />
          <Route
            path="members"
            element={
              <FeaturePlaceholder
                title="Team Members & Roles"
                description="Manage Admin, Manager, Member, and Viewer roles"
                phase="Phase 2 & 4 (RBAC & Members)"
              />
            }
          />
          <Route
            path="settings"
            element={
              <FeaturePlaceholder
                title="Workspace Settings"
                description="General preferences, notifications, and integration settings"
                phase="Phase 4 (Settings)"
              />
            }
          />
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
