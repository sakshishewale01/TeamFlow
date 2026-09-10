-- ==============================================================================
-- TeamFlow - Canonical Production Database Schema & Row Level Security (RLS)
-- Migration: 001_initial_schema.sql
-- Description: Complete single-source-of-truth schema definition for TeamFlow.
--              Safe for initial execution on a clean hosted Supabase project.
-- ==============================================================================

-- 1. EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- 2. CANONICAL ENUMS
-- ------------------------------------------------------------------------------

-- Workspace-level role enum (Single role concept for the entire application)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workspace_role') THEN
    CREATE TYPE public.workspace_role AS ENUM ('admin', 'manager', 'member', 'viewer');
  END IF;
END $$;

-- Project lifecycle status enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
    CREATE TYPE public.project_status AS ENUM ('planning', 'active', 'completed', 'archived');
  END IF;
END $$;

-- Task status enum (Kanban board columns)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'review', 'done');
  END IF;
END $$;

-- Task priority enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
    CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
  END IF;
END $$;


-- 3. CORE APPLICATION TABLES
-- ------------------------------------------------------------------------------

-- 3.1 PROFILES (Mirrors Supabase auth.users without conflicting global role)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.2 WORKSPACES
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT fk_workspaces_owner_profile FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 3.3 WORKSPACE_MEMBERS (Workspace-scoped role authorization)
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.workspace_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_workspace_user UNIQUE (workspace_id, user_id),
  CONSTRAINT fk_workspace_members_profile FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 3.4 PROJECTS (Belongs to workspace, single ownership field created_by)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status public.project_status NOT NULL DEFAULT 'planning',
  start_date DATE,
  end_date DATE,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT fk_projects_created_by_profile FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 3.5 PROJECT_MEMBERS (Project assignment, roles are workspace-level)
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_project_user UNIQUE (project_id, user_id),
  CONSTRAINT fk_project_members_profile FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 3.6 TASKS (Belongs to project; workspace safely derived through project)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status NOT NULL DEFAULT 'todo',
  priority public.task_priority NOT NULL DEFAULT 'medium',
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date DATE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.7 COMMENTS (Attached to tasks)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.8 TASK_LABELS (Workspace-scoped tags)
CREATE TABLE IF NOT EXISTS public.task_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_workspace_label UNIQUE (workspace_id, name)
);

-- 3.9 TASK_LABEL_LINKS (Many-to-many junction)
CREATE TABLE IF NOT EXISTS public.task_label_links (
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.task_labels(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, label_id)
);

-- 3.10 NOTIFICATIONS (Strictly user-isolated)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);


-- 4. PERFORMANCE & RELATIONSHIP INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON public.workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_workspace ON public.projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status_position ON public.tasks(project_id, status, position);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_comments_task ON public.comments(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_task_labels_workspace ON public.task_labels(workspace_id);
CREATE INDEX IF NOT EXISTS idx_task_label_links_task ON public.task_label_links(task_id);
CREATE INDEX IF NOT EXISTS idx_task_label_links_label ON public.task_label_links(label_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);


-- 5. UPDATED_AT TRIGGER FUNCTION & TRIGGERS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
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


-- 6. AUTOMATION TRIGGERS
-- ------------------------------------------------------------------------------

-- Trigger 1: Automatically provision profile on auth.users creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      CASE
        WHEN NEW.email IS NOT NULL AND NEW.email <> '' THEN split_part(NEW.email, '@', 1)
        ELSE 'User'
      END
    ),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger 2: Automatically enroll workspace creator as 'admin' in workspace_members
CREATE OR REPLACE FUNCTION public.handle_new_workspace()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.owner_id IS NOT NULL THEN
    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'admin')
    ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = 'admin';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_workspace_created ON public.workspaces;
CREATE TRIGGER on_workspace_created
  AFTER INSERT ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_workspace();

-- Trigger 3: Automatically enroll project creator as member in project_members
CREATE OR REPLACE FUNCTION public.handle_new_project()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.created_by IS NOT NULL THEN
    INSERT INTO public.project_members (project_id, user_id)
    VALUES (NEW.id, NEW.created_by)
    ON CONFLICT (project_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_project_created ON public.projects;
CREATE TRIGGER on_project_created
  AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_project();


-- 7. RECURSION-SAFE SECURITY DEFINER HELPER FUNCTIONS
-- ------------------------------------------------------------------------------

-- Helper A: Check if a user is a member of a given workspace
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID, u_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id AND user_id = u_id
  );
$$;

-- Helper B: Get user's role in a workspace ('admin', 'manager', 'member', 'viewer' or NULL)
CREATE OR REPLACE FUNCTION public.get_workspace_role(ws_id UUID, u_id UUID DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text
  FROM public.workspace_members
  WHERE workspace_id = ws_id AND user_id = u_id
  LIMIT 1;
$$;

-- Helper C: Get workspace_id for a project
CREATE OR REPLACE FUNCTION public.get_project_workspace_id(proj_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT workspace_id FROM public.projects WHERE id = proj_id LIMIT 1;
$$;

-- Helper D: Get workspace_id for a task
CREATE OR REPLACE FUNCTION public.get_task_workspace_id(t_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.workspace_id
  FROM public.tasks t
  JOIN public.projects p ON p.id = t.project_id
  WHERE t.id = t_id
  LIMIT 1;
$$;

-- Helper E: Check if a user is assigned to a project
CREATE OR REPLACE FUNCTION public.is_project_member(p_id UUID, u_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = p_id AND user_id = u_id
  );
$$;


-- 8. STORAGE BUCKET FOR AVATARS
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];


-- 9. ENABLE ROW LEVEL SECURITY
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_label_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;


-- 10. ROW LEVEL SECURITY POLICIES
-- ------------------------------------------------------------------------------

-- ==================== 10.1 PROFILES ====================
-- Authenticated users can view profiles (needed for workspace member lists & collaboration)
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

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());


-- ==================== 10.2 WORKSPACES ====================
DROP POLICY IF EXISTS "Members can view workspaces" ON public.workspaces;
CREATE POLICY "Members can view workspaces"
  ON public.workspaces FOR SELECT
  TO authenticated
  USING (
    public.is_workspace_member(id, auth.uid())
    OR owner_id = auth.uid()
  );

DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON public.workspaces;
CREATE POLICY "Authenticated users can create workspaces"
  ON public.workspaces FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Admins can update workspace" ON public.workspaces;
CREATE POLICY "Admins can update workspace"
  ON public.workspaces FOR UPDATE
  TO authenticated
  USING (
    public.get_workspace_role(id, auth.uid()) = 'admin'
    OR owner_id = auth.uid()
  )
  WITH CHECK (
    public.get_workspace_role(id, auth.uid()) = 'admin'
    OR owner_id = auth.uid()
  );

DROP POLICY IF EXISTS "Admins can delete workspace" ON public.workspaces;
CREATE POLICY "Admins can delete workspace"
  ON public.workspaces FOR DELETE
  TO authenticated
  USING (
    public.get_workspace_role(id, auth.uid()) = 'admin'
    OR owner_id = auth.uid()
  );


-- ==================== 10.3 WORKSPACE_MEMBERS ====================
DROP POLICY IF EXISTS "Members can view workspace membership" ON public.workspace_members;
CREATE POLICY "Members can view workspace membership"
  ON public.workspace_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_workspace_member(workspace_id, auth.uid())
    OR EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_members.workspace_id AND w.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can add workspace members" ON public.workspace_members;
CREATE POLICY "Admins can add workspace members"
  ON public.workspace_members FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_workspace_role(workspace_id, auth.uid()) = 'admin'
    OR user_id = auth.uid() -- Allows initial creator self-enrollment
    OR EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can update member roles" ON public.workspace_members;
CREATE POLICY "Admins can update member roles"
  ON public.workspace_members FOR UPDATE
  TO authenticated
  USING (
    public.get_workspace_role(workspace_id, auth.uid()) = 'admin'
    OR EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_members.workspace_id AND w.owner_id = auth.uid())
  )
  WITH CHECK (
    public.get_workspace_role(workspace_id, auth.uid()) = 'admin'
    OR EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_members.workspace_id AND w.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins or self can remove member" ON public.workspace_members;
CREATE POLICY "Admins or self can remove member"
  ON public.workspace_members FOR DELETE
  TO authenticated
  USING (
    public.get_workspace_role(workspace_id, auth.uid()) = 'admin'
    OR user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_members.workspace_id AND w.owner_id = auth.uid())
  );


-- ==================== 10.4 PROJECTS ====================
DROP POLICY IF EXISTS "Workspace members can view projects" ON public.projects;
CREATE POLICY "Workspace members can view projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (
    public.is_workspace_member(workspace_id, auth.uid())
    OR EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = projects.workspace_id AND w.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins and Managers can create projects" ON public.projects;
CREATE POLICY "Admins and Managers can create projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND (
      public.get_workspace_role(workspace_id, auth.uid()) IN ('admin', 'manager')
      OR EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins and Managers can update projects" ON public.projects;
CREATE POLICY "Admins and Managers can update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (
    public.get_workspace_role(workspace_id, auth.uid()) IN ('admin', 'manager')
    OR created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = projects.workspace_id AND w.owner_id = auth.uid())
  )
  WITH CHECK (
    public.get_workspace_role(workspace_id, auth.uid()) IN ('admin', 'manager')
    OR created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = projects.workspace_id AND w.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Only Admins can delete projects" ON public.projects;
CREATE POLICY "Only Admins can delete projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (
    public.get_workspace_role(workspace_id, auth.uid()) = 'admin'
    OR EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = projects.workspace_id AND w.owner_id = auth.uid())
  );


-- ==================== 10.5 PROJECT_MEMBERS ====================
DROP POLICY IF EXISTS "Workspace members can view project members" ON public.project_members;
CREATE POLICY "Workspace members can view project members"
  ON public.project_members FOR SELECT
  TO authenticated
  USING (
    public.is_workspace_member(public.get_project_workspace_id(project_id), auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.workspaces w ON w.id = p.workspace_id
      WHERE p.id = project_members.project_id AND w.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins and Managers can manage project members" ON public.project_members;
CREATE POLICY "Admins and Managers can manage project members"
  ON public.project_members FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      public.get_workspace_role(public.get_project_workspace_id(project_id), auth.uid()) IN ('admin', 'manager')
      OR EXISTS (
        SELECT 1 FROM public.projects p
        JOIN public.workspaces w ON w.id = p.workspace_id
        WHERE p.id = project_members.project_id AND w.owner_id = auth.uid()
      )
    )
    -- Added user MUST already belong to the workspace
    AND public.is_workspace_member(public.get_project_workspace_id(project_id), user_id)
  );

DROP POLICY IF EXISTS "Admins, Managers or self can remove project members" ON public.project_members;
CREATE POLICY "Admins, Managers or self can remove project members"
  ON public.project_members FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.get_workspace_role(public.get_project_workspace_id(project_id), auth.uid()) IN ('admin', 'manager')
    OR EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.workspaces w ON w.id = p.workspace_id
      WHERE p.id = project_members.project_id AND w.owner_id = auth.uid()
    )
  );


-- ==================== 10.6 TASKS ====================
DROP POLICY IF EXISTS "Workspace members can view tasks" ON public.tasks;
CREATE POLICY "Workspace members can view tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (
    public.is_workspace_member(public.get_project_workspace_id(project_id), auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.workspaces w ON w.id = p.workspace_id
      WHERE p.id = tasks.project_id AND w.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins, Managers, and Members can create tasks" ON public.tasks;
CREATE POLICY "Admins, Managers, and Members can create tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND (
      public.get_workspace_role(public.get_project_workspace_id(project_id), auth.uid()) IN ('admin', 'manager', 'member')
      OR EXISTS (
        SELECT 1 FROM public.projects p
        JOIN public.workspaces w ON w.id = p.workspace_id
        WHERE p.id = project_id AND w.owner_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Admins, Managers, and assigned Members can update tasks" ON public.tasks;
CREATE POLICY "Admins, Managers, and assigned Members can update tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (
    public.get_workspace_role(public.get_project_workspace_id(project_id), auth.uid()) IN ('admin', 'manager')
    OR EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.workspaces w ON w.id = p.workspace_id
      WHERE p.id = tasks.project_id AND w.owner_id = auth.uid()
    )
    OR (
      public.get_workspace_role(public.get_project_workspace_id(project_id), auth.uid()) = 'member'
      AND (assignee_id = auth.uid() OR created_by = auth.uid())
    )
  )
  WITH CHECK (
    public.get_workspace_role(public.get_project_workspace_id(project_id), auth.uid()) IN ('admin', 'manager')
    OR EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.workspaces w ON w.id = p.workspace_id
      WHERE p.id = tasks.project_id AND w.owner_id = auth.uid()
    )
    OR (
      public.get_workspace_role(public.get_project_workspace_id(project_id), auth.uid()) = 'member'
      AND (assignee_id = auth.uid() OR created_by = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins and Managers can delete tasks" ON public.tasks;
CREATE POLICY "Admins and Managers can delete tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (
    public.get_workspace_role(public.get_project_workspace_id(project_id), auth.uid()) IN ('admin', 'manager')
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.workspaces w ON w.id = p.workspace_id
      WHERE p.id = tasks.project_id AND w.owner_id = auth.uid()
    )
  );


-- ==================== 10.7 COMMENTS ====================
DROP POLICY IF EXISTS "Workspace members can view comments" ON public.comments;
CREATE POLICY "Workspace members can view comments"
  ON public.comments FOR SELECT
  TO authenticated
  USING (
    public.is_workspace_member(public.get_task_workspace_id(task_id), auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.projects p ON p.id = t.project_id
      JOIN public.workspaces w ON w.id = p.workspace_id
      WHERE t.id = comments.task_id AND w.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Members can insert comments" ON public.comments;
CREATE POLICY "Members can insert comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      public.get_workspace_role(public.get_task_workspace_id(task_id), auth.uid()) IN ('admin', 'manager', 'member')
      OR EXISTS (
        SELECT 1 FROM public.tasks t
        JOIN public.projects p ON p.id = t.project_id
        JOIN public.workspaces w ON w.id = p.workspace_id
        WHERE t.id = task_id AND w.owner_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Authors can update comments" ON public.comments;
CREATE POLICY "Authors can update comments"
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
    OR public.get_workspace_role(public.get_task_workspace_id(task_id), auth.uid()) IN ('admin', 'manager')
    OR EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.projects p ON p.id = t.project_id
      JOIN public.workspaces w ON w.id = p.workspace_id
      WHERE t.id = comments.task_id AND w.owner_id = auth.uid()
    )
  );


-- ==================== 10.8 TASK_LABELS ====================
DROP POLICY IF EXISTS "Workspace members can view labels" ON public.task_labels;
CREATE POLICY "Workspace members can view labels"
  ON public.task_labels FOR SELECT
  TO authenticated
  USING (
    public.is_workspace_member(workspace_id, auth.uid())
    OR EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = task_labels.workspace_id AND w.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins and Managers can manage labels" ON public.task_labels;
CREATE POLICY "Admins and Managers can manage labels"
  ON public.task_labels FOR ALL
  TO authenticated
  USING (
    public.get_workspace_role(workspace_id, auth.uid()) IN ('admin', 'manager')
    OR EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = task_labels.workspace_id AND w.owner_id = auth.uid())
  )
  WITH CHECK (
    public.get_workspace_role(workspace_id, auth.uid()) IN ('admin', 'manager')
    OR EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = task_labels.workspace_id AND w.owner_id = auth.uid())
  );


-- ==================== 10.9 TASK_LABEL_LINKS ====================
DROP POLICY IF EXISTS "Workspace members can view label links" ON public.task_label_links;
CREATE POLICY "Workspace members can view label links"
  ON public.task_label_links FOR SELECT
  TO authenticated
  USING (
    public.is_workspace_member(public.get_task_workspace_id(task_id), auth.uid())
  );

DROP POLICY IF EXISTS "Admins, Managers, and Members can link labels" ON public.task_label_links;
CREATE POLICY "Admins, Managers, and Members can link labels"
  ON public.task_label_links FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_workspace_role(public.get_task_workspace_id(task_id), auth.uid()) IN ('admin', 'manager', 'member')
  );

DROP POLICY IF EXISTS "Admins, Managers, and Members can unlink labels" ON public.task_label_links;
CREATE POLICY "Admins, Managers, and Members can unlink labels"
  ON public.task_label_links FOR DELETE
  TO authenticated
  USING (
    public.get_workspace_role(public.get_task_workspace_id(task_id), auth.uid()) IN ('admin', 'manager', 'member')
  );


-- ==================== 10.10 NOTIFICATIONS ====================
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can trigger notifications" ON public.notifications;
CREATE POLICY "Authenticated users can trigger notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);


-- ==================== 10.11 STORAGE: AVATARS ====================
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
CREATE POLICY "Public avatar access"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
