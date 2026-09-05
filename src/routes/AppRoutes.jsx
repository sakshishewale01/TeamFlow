import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CheckSquare, Users, Settings } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import AppLayout from '../layouts/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicOnlyRoute from './PublicOnlyRoute';

// Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import ProfilePage from '../pages/ProfilePage';
import DashboardPlaceholder from '../pages/DashboardPlaceholder';
import WorkspacesPage from '../pages/WorkspacesPage';
import ProjectsPage from '../pages/ProjectsPage';
import ProjectDetailsPage from '../pages/ProjectDetailsPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';
import EmptyState from '../components/common/EmptyState';
import { APP_ROUTES } from '../utils/constants';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path={APP_ROUTES.HOME} element={<LandingPage />} />

      {/* Public Only Auth Flow */}
      <Route element={<AuthLayout />}>
        <Route
          path={APP_ROUTES.LOGIN}
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path={APP_ROUTES.SIGNUP}
          element={
            <PublicOnlyRoute>
              <SignupPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path={APP_ROUTES.FORGOT_PASSWORD}
          element={
            <PublicOnlyRoute>
              <ForgotPassword />
            </PublicOnlyRoute>
          }
        />
        <Route path={APP_ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
      </Route>

      {/* Protected App Routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPlaceholder />} />
        <Route path="workspaces" element={<WorkspacesPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:projectId" element={<ProjectDetailsPage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Future Prompt Placeholders with clean empty states */}
        <Route
          path="tasks"
          element={
            <EmptyState
              icon={CheckSquare}
              title="Tasks Module"
              description="Task management, assignments and filtering will be unlocked in Prompt 3."
            />
          }
        />
        <Route
          path="team"
          element={
            <EmptyState
              icon={Users}
              title="Team Members"
              description="Workspace team member invitations and management will be unlocked in upcoming prompt."
            />
          }
        />
        <Route
          path="settings"
          element={
            <EmptyState
              icon={Settings}
              title="Workspace Settings"
              description="Workspace configurations and role delegation will be unlocked in upcoming prompt."
            />
          }
        />
      </Route>

      {/* Unauthorized & 404 Pages */}
      <Route path={APP_ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
