# 🚀 TeamFlow

<div align="center">

  <p align="center">
    <strong>Production-Ready, Real-Time Collaborative Workspace & Kanban Project Management Platform</strong>
  </p>

  <p align="center">
    <a href="#-overview">Overview</a> •
    <a href="#-key-features">Key Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-architecture--project-structure">Architecture</a> •
    <a href="#-database--migrations">Database & Migrations</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-environment-variables">Environment</a> •
    <a href="#-scripts">Scripts</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/TeamFlow-v1.0%20Production%20Ready-6366f1?style=for-the-badge&logo=rocket" alt="Version 1.0" />
    <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-Auth%2C%20Postgres%20%26%20Storage-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/React_Router-v7-CA4245?style=for-the-badge&logo=react-router&logoColor=white" alt="React Router" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
  </p>
</div>

---

## 📖 Overview

**TeamFlow** is a modern, enterprise-grade project management and team collaboration web application. Engineered on **React 19**, **Vite 8**, **Tailwind CSS**, and **Supabase (PostgreSQL, Auth, Storage, and Realtime)**, TeamFlow empowers organizations to orchestrate multi-tenant workspaces, track project lifecycles, visualize task delivery via an interactive **Kanban Board**, manage rich discussions, and stay updated with live in-app notifications.

TeamFlow is architected with security and speed at its core:
- **Strict Multi-Tenancy**: Built on PostgreSQL **Row Level Security (RLS)** ensuring isolated tenant spaces.
- **Granular Access Control**: Role-Based Access Control (`Admin`, `Manager`, `Member`, `Viewer`).
- **Realtime Synchronization**: Instant client updates via Supabase Realtime websocket feeds.
- **Accessible Design System**: WCAG-compliant Light and Dark modes with responsive viewports.

---

## ✨ Key Features

### 🏢 Workspace Multi-Tenancy & Access Control
- **Dynamic Multi-Tenancy**: Create, customize, and switch between multiple workspaces on the fly.
- **Granular RBAC**: Enforce permissions across `Admin`, `Manager`, `Member`, and `Viewer` roles.
- **Team Roster**: Invite team members, delegate workspace privileges, and manage member participation.

### 📊 Executive Operational Dashboard
- **Sprint Overview**: Real-time snapshot of active projects, completed tasks, and milestone health.
- **Live Metrics**: Progress bars, delivery statuses, workload distribution, and task breakdowns.
- **Quick Action Toolbar**: Immediate creation shortcuts for projects and tasks with high-contrast UI controls.

### 📁 Project Management
- **Lifecycle Tracking**: Categorize projects by lifecycle phases (`Planning`, `Active`, `Completed`, `Archived`).
- **Flexible Views**: Toggle seamlessly between interactive **Board View** and structured **List View**.
- **Project Members**: Assign workspace members to specific projects with granular project-level visibility.
- **Milestones & Deadlines**: Set target dates, track completion percentages, and monitor schedules.

### 📋 Interactive Kanban Board & Task Engine
- **Visual Workflow**: Drag-and-drop or status-toggle tasks across stages: `To Do`, `In Progress`, `In Review`, and `Done`.
- **In-Depth Task Details**:
  - Assignee selectors with user avatar integration.
  - Priority flags (`Low`, `Medium`, `High`, `Urgent`).
  - Due date tracking and position-based sorting within columns.
  - Color-coded workspace task labels.
- **Task Search & Filter Suite**: Filter by assignee, priority, status, project, and labels simultaneously.

### 🔍 Global Workspace Search (Projects & Tasks)
- **Unified Live Search**: Fast, debounced (250ms) search directly in the top Navbar across projects and tasks.
- **Keyboard Navigation**: Seamless arrow-key cycling (`↑`/`↓`), `Enter` selection, and `Esc` dismissal.
- **Deep-Link Navigation**: Selecting a project navigates to the project view; selecting a task navigates directly and auto-opens its `TaskDetailModal`.
- **Mobile Optimized**: Full-width header search overlay on mobile screens without horizontal overflow.

### 💬 Team Discussions & Activity
- **Real-Time Task Comments**: Threaded discussion feed inside each task detail modal.
- **Author Identity**: Integrated avatars, full name badges, and relative audit timestamps.

### 🔔 In-App Notifications & Realtime Collaboration
- **Live Notification Bell**: Visual unread count badge updated in real time via Supabase websocket subscriptions.
- **Interactive Notification Center**: Read, unread, and clear notifications for task assignments, project invites, and team comments.
- **Realtime Database Sync**: Automatic UI synchronization when team members update tasks or projects.

### 👤 User Profile & Supabase Storage
- **Avatar Management**: Upload and update custom profile avatars directly to Supabase Storage.
- **Profile Customization**: Edit display name, username, bio, and account metadata.

### 🌓 Theme Engine & Accessibility
- **Light & Dark Modes**: Fully integrated dark mode with instant theme switching and local storage persistence.
- **High-Contrast Design**: Carefully tuned color palettes, transparent glassmorphism accents, and accessible focus outlines.

---

## 🛠 Tech Stack

| Layer | Technology | Version | Role in TeamFlow |
| :--- | :--- | :---: | :--- |
| **Frontend Core** | [React](https://react.dev/) | `^19.2.8` | Declarative UI, state management, and modern React hooks |
| **Bundler & Tooling** | [Vite](https://vitejs.dev/) | `^8.2.2` | High-performance dev server, fast HMR, and optimized production builds |
| **Client Routing** | [React Router](https://reactrouter.com/) | `^7.18.3` | Nested routes, route guards (`ProtectedRoute`, `PublicOnlyRoute`), and layouts |
| **Styling & CSS** | [Tailwind CSS](https://tailwindcss.com/) | `^3.4.19` | Utility-first responsive styling, tokens, and dark theme support |
| **Backend as a Service** | [Supabase](https://supabase.com/) | `^2.115.0` | PostgreSQL DB, Auth session management, Storage, and Realtime feeds |
| **Database Security** | PostgreSQL RLS | — | Tenant isolation and row-level authorization |
| **Iconography** | [Lucide React](https://lucide.dev/) | `^1.41.0` | Lightweight SVG icons |
| **Class Utilities** | [tailwind-merge](https://github.com/dcastil/tailwind-merge) / [clsx](https://github.com/lukeed/clsx) | Latest | Safe utility class composition and collision resolution |
| **Linter & Code Quality** | [Oxlint](https://oxc.rs/) | `^1.79.0` | Ultra-fast linter for JavaScript, JSX, and React best practices |

---

## 📐 Architecture & Project Structure

```text
TeamFlow/
├── public/                     # Static public assets, favicon, and logos
├── src/
│   ├── assets/                 # App graphics, brand logos, and illustrations
│   ├── components/
│   │   ├── comments/           # Task discussion threads and CommentItem
│   │   ├── common/             # ThemeToggle, WorkspaceSwitcher, EmptyState, Spinners
│   │   ├── dashboard/          # DashboardStats, QuickActions, MilestoneProgress
│   │   ├── kanban/             # Board views and drag-and-drop column containers
│   │   ├── layout/             # AppLayout, Navbar (with GlobalSearch), Sidebar
│   │   ├── notifications/      # NotificationBell and NotificationDropdown
│   │   ├── projects/           # ProjectModal, ProjectCard, Member modals
│   │   ├── search/             # GlobalSearch component and popover listbox
│   │   ├── tasks/              # KanbanBoard, TaskItem, TaskModal, TaskDetailModal, TaskFilters
│   │   ├── ui/                 # Accessible Button, Input, Modal, Dropdown, Badge
│   │   └── workspaces/         # WorkspaceModal and configuration dialogs
│   ├── context/                # React Contexts (AuthContext, WorkspaceContext, ThemeContext, ToastContext)
│   ├── hooks/                  # Custom hooks (useAuth, useWorkspace, useProjects, useTasks, useToast, etc.)
│   ├── layouts/                # Route shell layouts (AppLayout, AuthLayout)
│   ├── lib/                    # Supabase client singleton (supabase.js) and utility helpers (utils.js)
│   ├── pages/                  # Route view components:
│   │   ├── auth/               # LoginPage, SignupPage, ForgotPasswordPage, ResetPasswordPage
│   │   ├── DashboardPage.jsx   # Operational workspace dashboard
│   │   ├── LandingPage.jsx     # Marketing home page
│   │   ├── ProjectsPage.jsx    # Projects index & filter view
│   │   ├── ProjectDetailsPage.jsx # Project Kanban board, list view, and member roster
│   │   ├── TasksPage.jsx       # Workspace-wide task manager
│   │   ├── ProfilePage.jsx     # User profile editor & avatar storage upload
│   │   └── NotFoundPage.jsx    # 404 handler
│   ├── routes/                 # AppRoutes, ProtectedRoute, and PublicOnlyRoute
│   ├── services/               # API & Supabase integration services:
│   │   ├── authService.js      # Authentication and password recovery
│   │   ├── commentService.js   # Task discussions
│   │   ├── dashboardService.js # Metrics aggregation
│   │   ├── notificationService.js # Notification queries & mutations
│   │   ├── profileService.js   # User profiles & avatar storage upload
│   │   ├── projectService.js   # Project CRUD & member assignment
│   │   ├── realtimeService.js  # Supabase Realtime channel subscriptions
│   │   ├── searchService.js    # Debounced workspace search for projects & tasks
│   │   ├── taskService.js      # Task CRUD, filters, assignees, and labels
│   │   └── workspaceService.js # Workspace multi-tenancy & memberships
│   ├── utils/                  # Constants, task filter utilities, and formatters
│   ├── App.jsx                 # Application entry point with providers
│   ├── index.css               # Design system tokens and global Tailwind directives
│   └── main.jsx                # DOM root bootstrap
├── supabase/
│   └── migrations/             # Production SQL migrations & RLS policies:
│       ├── 001_initial_schema.sql         # Base schemas, tables, RLS, functions & triggers
│       ├── 002_secure_notifications.sql   # Realtime notification tables, RPCs & RLS
│       └── 003_realtime_setup.sql         # Realtime replication publications
├── .env.example                # Sample environment configuration template
├── package.json                # Project dependencies and npm scripts
├── tailwind.config.js          # Tailwind CSS design configuration
└── vite.config.js              # Vite configuration and plugins
```

---

## 🚦 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Supabase Account**: A free cloud project at [supabase.com](https://supabase.com) (or local Supabase CLI)

### 2. Clone the Repository
```bash
git clone https://github.com/sakshishewale01/TeamFlow.git
cd TeamFlow
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy the template to create your local `.env` or `.env.local` file:

```bash
cp .env.example .env.local
```

Populate `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-or-anon-key
```

> **Where to find credentials**: In your Supabase Dashboard, navigate to **Project Settings** → **API** to copy the Project URL and anon public key.

---

## 🗄 Database & Migrations

Execute the SQL migration scripts in order inside your Supabase **SQL Editor**:

1. **`supabase/migrations/001_initial_schema.sql`**
   - Creates tables: `profiles`, `workspaces`, `workspace_members`, `projects`, `project_members`, `tasks`, `task_labels`, `task_label_links`, `comments`, and `activity_logs`.
   - Establishes relational integrity, automatic timestamps, and profile triggers on user registration.
   - Enforces strict multi-tenant Row Level Security (RLS) policies.

2. **`supabase/migrations/002_secure_notifications.sql`**
   - Configures the `notifications` table, status tracking, and automated triggers.
   - Sets secure RLS policies ensuring users only read their own notifications.

3. **`supabase/migrations/003_realtime_setup.sql`**
   - Adds tables to `supabase_realtime` publication for instant client-side websocket updates.

### Storage Bucket Setup (Avatars)
In the Supabase Dashboard under **Storage**:
1. Create a public bucket named `avatars`.
2. Ensure public read access is enabled so user avatar URLs resolve correctly.

---

## 🚀 Running the Application

### Development Server
Start Vite development server with Hot Module Replacement:
```bash
npm run dev
```
Access the application at [http://localhost:5173](http://localhost:5173).

### Production Build
Compile and bundle optimized static assets:
```bash
npm run build
```

### Local Preview
Serve the production bundle locally:
```bash
npm run preview
```

### Linting & Code Quality
Run high-speed quality checks via Oxlint:
```bash
npm run lint
```

---

## 🗺 Application Routes

| Path | Access | Description |
| :--- | :---: | :--- |
| `/` | Public | SaaS Landing & Feature Overview |
| `/login` | Public Only | User sign in with email and password |
| `/signup` | Public Only | User account registration |
| `/forgot-password` | Public Only | Password reset request |
| `/reset-password` | Public Only | Password update with auth recovery token |
| `/dashboard` | Protected | Executive workspace dashboard and delivery stats |
| `/projects` | Protected | Workspace projects index and project creation |
| `/projects/:projectId` | Protected | Project Kanban Board, list view, and member management |
| `/tasks` | Protected | Cross-project task management with multi-criteria filtering |
| `/profile` | Protected | User profile settings and Supabase Storage avatar upload |

---

## ⚙️ Environment Variables Reference

| Variable | Required | Description |
| :--- | :---: | :--- |
| `VITE_SUPABASE_URL` | **Yes** | HTTPS URL of your Supabase project instance |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | **Yes** | Supabase anonymous public API key (`anon` / `publishable`) |

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Vite dev server on `http://localhost:5173` |
| `npm run build` | Compiles production bundle to `dist/` |
| `npm run preview` | Previews production build locally |
| `npm run lint` | Runs Oxlint to ensure code cleanliness with 0 errors |

---

## 🤝 Contributing 

Contributions are welcome! Please feel free to submit issues and pull requests.



---

<div align="center">
  <sub>Built with ❤️ using React 19, Tailwind CSS & Supabase by <a href="https://github.com/sakshishewale01">Sakshi Shewale</a></sub>
</div>
