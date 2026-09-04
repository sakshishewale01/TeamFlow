# TeamFlow

TeamFlow is a modern project management web application designed for multi-tenant team collaboration.

---

## 🏗️ Architecture & Workspace Model

TeamFlow organizes projects and collaboration through a structured workspace hierarchy:

```
Workspace
 ├── Members
 │    ├── Admin     (Full workspace & billing management)
 │    ├── Manager   (Project creation, task assignment, member invites)
 │    ├── Member    (Task management & collaboration)
 │    └── Viewer    (Read-only access)
 │
 └── Projects
      ├── Members
      └── Tasks
           └── Comments
```

- **Multi-Tenant**: A user can belong to multiple workspaces with independent permission roles.
- **Projects**: Each workspace contains projects with dedicated team members and task boards.
- **Tasks & Kanban**: Status tracking (`Backlog`, `To Do`, `In Progress`, `In Review`, `Done`) with drag-and-drop collaboration.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4
- **Routing**: React Router v7 (`react-router-dom`)
- **Icons**: Lucide React
- **Backend & Database**: Supabase (PostgreSQL, Supabase Auth, Row Level Security, Storage, Realtime)
- **Tooling**: ESLint flat configuration, `@vitejs/plugin-react`

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Create a local `.env.local` file from the provided template:
```bash
cp .env.example .env.local
```

Configure your Supabase credentials in `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

> **Security Rule**: Never commit `.env` or `.env.local` files. Only use the public `anon` key in frontend applications. Never expose your Supabase `service_role` key in frontend code.

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

### 6. Linting
```bash
npm run lint
```

---

## 📁 Project Structure

```
TeamFlow/
├── public/                    # Static assets
├── src/
│   ├── assets/                # Application images and branding
│   ├── components/
│   │   ├── common/            # Reusable UI primitives (Button, Input, Card, Badge, Spinner, ThemeToggle)
│   │   └── layout/            # Layout shell (Navbar, Sidebar, AppLayout)
│   ├── context/               # React Contexts (ThemeContext)
│   ├── hooks/                 # Custom React hooks (useTheme)
│   ├── lib/                   # Singletons & helpers (supabase.js, constants.js, utils.js)
│   ├── pages/                 # Route pages (HomePage, NotFoundPage)
│   ├── routes/                # Route definitions (AppRoutes)
│   ├── App.jsx                # Application root with providers
│   ├── index.css              # Tailwind v4 styles & dark variant configuration
│   └── main.jsx               # React DOM root mounting
├── .env.example               # Environment variables template
├── .gitignore                 # Secure Git ignore rules
├── jsconfig.json              # Path alias mapping (@/*)
├── package.json               # Project manifest
└── vite.config.js             # Vite configuration with React and Tailwind v4 plugins
```

---

## 🗺️ Step-by-Step Development Roadmap

- [x] **Phase 1: Project Foundation** (Configuration, Tailwind v4, Routing, Theme, Base UI Primitives, Shell)
- [ ] **Phase 2: Database Schema & RLS Engineering** (Workspaces, Projects, Tasks, Roles, Permissions)
- [ ] **Phase 3: Authentication & Profiles** (Email/Password Auth, Session Management, Avatar Uploads)
- [ ] **Phase 4: Workspace & Project Management** (Workspace switcher, Project CRUD, Member Invitations)
- [ ] **Phase 5: Kanban Board & Tasks** (Drag-and-Drop, Status Columns, Priority, Due Dates)
- [ ] **Phase 6: Realtime Collaboration & Activity Stream** (Live task movement, Comments, Audit logs)
