-- ============================================================================
-- TeamFlow - Phase 2 Initial Database Schema & Row Level Security (RLS)
-- Migration: 001_initial_schema.sql
-- ============================================================================

-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- 2. CUSTOM ENUMS
-- ----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.workspace_role AS ENUM ('Admin', 'Manager', 'Member', 'Viewer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.task_status AS ENUM ('backlog', 'todo', 'in_progress', 'in_review', 'done');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;


-- 3. CORE TABLES
-- ----------------------------------------------------------------------------

-- A. PROFILES (Mirrors Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- B. WORKSPACES
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- C. WORKSPACE_MEMBERS
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.workspace_role NOT NULL DEFAULT 'Member',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT unique_workspace_user UNIQUE (workspace_id, user_id)
);

-- D. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- E. TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status NOT NULL DEFAULT 'todo',
  priority public.task_priority NOT NULL DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  position INTEGER NOT NULL DEFAULT 0,
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- F. COMMENTS
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);


-- 4. PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_projects_workspace ON public.projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_workspace ON public.tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status_pos ON public.tasks(project_id, status, position);
CREATE INDEX IF NOT EXISTS idx_comments_task ON public.comments(task_id);


-- 5. UPDATED_AT TRIGGER FUNCTION & TRIGGERS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_workspaces_updated_at ON public.workspaces;
CREATE TRIGGER set_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_workspace_members_updated_at ON public.workspace_members;
CREATE TRIGGER set_workspace_members_updated_at
  BEFORE UPDATE ON public.workspace_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_comments_updated_at ON public.comments;
CREATE TRIGGER set_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- 6. AUTOMATION TRIGGERS: NEW USER & NEW WORKSPACE
-- ----------------------------------------------------------------------------

-- Trigger 1: Automatically create a profile when a user signs up (safe for null email)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      CASE
        WHEN NEW.email IS NOT NULL AND NEW.email <> '' THEN split_part(NEW.email, '@', 1)
        ELSE 'User'
      END
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger 2: Automatically add workspace creator as 'Admin' in workspace_members
CREATE OR REPLACE FUNCTION public.handle_new_workspace()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.created_by IS NOT NULL THEN
    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'Admin')
    ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = 'Admin';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_workspace_created ON public.workspaces;
CREATE TRIGGER on_workspace_created
  AFTER INSERT ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_workspace();


-- 7. RECURSION-SAFE RLS HELPER FUNCTION
-- ----------------------------------------------------------------------------
-- SECURITY DEFINER executes with the privileges of the postgres role,
-- bypassing RLS checks on workspace_members to prevent infinite recursion.
CREATE OR REPLACE FUNCTION public.get_workspace_role(ws_id UUID)
RETURNS public.workspace_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.workspace_members
  WHERE workspace_id = ws_id AND user_id = auth.uid()
  LIMIT 1;
$$;


-- 8. ENABLE ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;


-- 9. RLS POLICIES (Idempotent: Drop & Recreate)
-- ----------------------------------------------------------------------------

-- === PROFILES ===
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());


-- === WORKSPACES ===
DROP POLICY IF EXISTS "Members can view their workspaces" ON public.workspaces;
CREATE POLICY "Members can view their workspaces"
  ON public.workspaces FOR SELECT
  TO authenticated
  USING (public.get_workspace_role(id) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON public.workspaces;
CREATE POLICY "Authenticated users can create workspaces"
  ON public.workspaces FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Admins can update workspaces" ON public.workspaces;
CREATE POLICY "Admins can update workspaces"
  ON public.workspaces FOR UPDATE
  TO authenticated
  USING (public.get_workspace_role(id) = 'Admin')
  WITH CHECK (public.get_workspace_role(id) = 'Admin');

DROP POLICY IF EXISTS "Admins can delete workspaces" ON public.workspaces;
CREATE POLICY "Admins can delete workspaces"
  ON public.workspaces FOR DELETE
  TO authenticated
  USING (public.get_workspace_role(id) = 'Admin');


-- === WORKSPACE_MEMBERS ===
DROP POLICY IF EXISTS "Members can view workspace member list" ON public.workspace_members;
CREATE POLICY "Members can view workspace member list"
  ON public.workspace_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.get_workspace_role(workspace_id) IS NOT NULL
  );

DROP POLICY IF EXISTS "Admins can add workspace members" ON public.workspace_members;
CREATE POLICY "Admins can add workspace members"
  ON public.workspace_members FOR INSERT
  TO authenticated
  WITH CHECK (public.get_workspace_role(workspace_id) = 'Admin');

DROP POLICY IF EXISTS "Admins can update member roles" ON public.workspace_members;
CREATE POLICY "Admins can update member roles"
  ON public.workspace_members FOR UPDATE
  TO authenticated
  USING (public.get_workspace_role(workspace_id) = 'Admin')
  WITH CHECK (public.get_workspace_role(workspace_id) = 'Admin');

DROP POLICY IF EXISTS "Admins or self can remove member" ON public.workspace_members;
CREATE POLICY "Admins or self can remove member"
  ON public.workspace_members FOR DELETE
  TO authenticated
  USING (
    public.get_workspace_role(workspace_id) = 'Admin'
    OR user_id = auth.uid()
  );


-- === PROJECTS ===
DROP POLICY IF EXISTS "Members can view workspace projects" ON public.projects;
CREATE POLICY "Members can view workspace projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (public.get_workspace_role(workspace_id) IS NOT NULL);

DROP POLICY IF EXISTS "Admins and Managers can create projects" ON public.projects;
CREATE POLICY "Admins and Managers can create projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_workspace_role(workspace_id) IN ('Admin', 'Manager')
  );

DROP POLICY IF EXISTS "Admins and Managers can update projects" ON public.projects;
CREATE POLICY "Admins and Managers can update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (
    public.get_workspace_role(workspace_id) IN ('Admin', 'Manager')
  )
  WITH CHECK (
    public.get_workspace_role(workspace_id) IN ('Admin', 'Manager')
  );

DROP POLICY IF EXISTS "Only Admins can delete projects" ON public.projects;
CREATE POLICY "Only Admins can delete projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (public.get_workspace_role(workspace_id) = 'Admin');


-- === TASKS ===
DROP POLICY IF EXISTS "Members can view tasks" ON public.tasks;
CREATE POLICY "Members can view tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (public.get_workspace_role(workspace_id) IS NOT NULL);

DROP POLICY IF EXISTS "Admins, Managers, and Members can create tasks" ON public.tasks;
CREATE POLICY "Admins, Managers, and Members can create tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_workspace_role(workspace_id) IN ('Admin', 'Manager', 'Member')
  );

DROP POLICY IF EXISTS "Admins, Managers, and assigned Members can update tasks" ON public.tasks;
CREATE POLICY "Admins, Managers, and assigned Members can update tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (
    public.get_workspace_role(workspace_id) IN ('Admin', 'Manager')
    OR (
      public.get_workspace_role(workspace_id) = 'Member'
      AND (assignee_id = auth.uid() OR created_by = auth.uid())
    )
  )
  WITH CHECK (
    public.get_workspace_role(workspace_id) IN ('Admin', 'Manager')
    OR (
      public.get_workspace_role(workspace_id) = 'Member'
      AND (assignee_id = auth.uid() OR created_by = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins and Managers can delete tasks" ON public.tasks;
CREATE POLICY "Admins and Managers can delete tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (
    public.get_workspace_role(workspace_id) IN ('Admin', 'Manager')
  );


-- === COMMENTS ===
DROP POLICY IF EXISTS "Members can view comments" ON public.comments;
CREATE POLICY "Members can view comments"
  ON public.comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = comments.task_id
      AND public.get_workspace_role(t.workspace_id) IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "Members can insert comments" ON public.comments;
CREATE POLICY "Members can insert comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = comments.task_id
      AND public.get_workspace_role(t.workspace_id) IN ('Admin', 'Manager', 'Member')
    )
  );

DROP POLICY IF EXISTS "Authors can update own comments" ON public.comments;
CREATE POLICY "Authors can update own comments"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors, Admins, or Managers can delete comments" ON public.comments;
CREATE POLICY "Authors, Admins, or Managers can delete comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = comments.task_id
      AND public.get_workspace_role(t.workspace_id) IN ('Admin', 'Manager')
    )
  );
