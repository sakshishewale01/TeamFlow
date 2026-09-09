-- ==============================================================================
-- Migration: 20260905000002_create_workspaces_and_projects.sql
-- Description: Sets up workspaces, workspace_members, projects, project_members,
--              status enums, anti-recursion helper functions, triggers, and RLS.
-- ==============================================================================

-- 1. Create Project Status Enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
    CREATE TYPE public.project_status AS ENUM ('planning', 'active', 'completed', 'archived');
  END IF;
END $$;

-- 2. Create Workspaces Table
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Foreign key link to public.profiles for PostgREST joins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_workspaces_owner_profile'
  ) THEN
    ALTER TABLE public.workspaces
      ADD CONSTRAINT fk_workspaces_owner_profile
      FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS workspaces_owner_id_idx ON public.workspaces(owner_id);

-- Workspace updated_at trigger
DROP TRIGGER IF EXISTS on_workspace_updated ON public.workspaces;
CREATE TRIGGER on_workspace_updated
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 3. Create Workspace Members Table
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_workspace_user UNIQUE (workspace_id, user_id)
);

-- Foreign key link to public.profiles for PostgREST joins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_workspace_members_profile'
  ) THEN
    ALTER TABLE public.workspace_members
      ADD CONSTRAINT fk_workspace_members_profile
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS workspace_members_ws_idx ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS workspace_members_user_idx ON public.workspace_members(user_id);

-- 4. Auto-assign Workspace Creator as Admin
CREATE OR REPLACE FUNCTION public.handle_new_workspace_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'admin')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_workspace_created ON public.workspaces;
CREATE TRIGGER on_workspace_created
  AFTER INSERT ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_workspace_owner();

-- 5. Helper Functions to Prevent Infinite RLS Recursion
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID, check_uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id AND user_id = check_uid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_workspace_role(ws_id UUID, check_uid UUID DEFAULT auth.uid())
RETURNS public.user_role AS $$
DECLARE
  user_role public.user_role;
BEGIN
  SELECT role INTO user_role FROM public.workspace_members
  WHERE workspace_id = ws_id AND user_id = check_uid;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. RLS for Workspaces Table
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view workspaces they belong to" ON public.workspaces;
CREATE POLICY "Users can view workspaces they belong to"
  ON public.workspaces
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    public.is_workspace_member(id, auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON public.workspaces;
CREATE POLICY "Authenticated users can create workspaces"
  ON public.workspaces
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners and admins can update workspaces" ON public.workspaces;
CREATE POLICY "Owners and admins can update workspaces"
  ON public.workspaces
  FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    public.get_workspace_role(id, auth.uid()) IN ('admin', 'manager')
  )
  WITH CHECK (
    owner_id = auth.uid() OR
    public.get_workspace_role(id, auth.uid()) IN ('admin', 'manager')
  );

DROP POLICY IF EXISTS "Only owners and admins can delete workspaces" ON public.workspaces;
CREATE POLICY "Only owners and admins can delete workspaces"
  ON public.workspaces
  FOR DELETE
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    public.get_workspace_role(id, auth.uid()) = 'admin'
  );

-- 7. RLS for Workspace Members Table
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view members of their workspace" ON public.workspace_members;
CREATE POLICY "Members can view members of their workspace"
  ON public.workspace_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    public.is_workspace_member(workspace_id, auth.uid()) OR
    EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_members.workspace_id AND w.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins and managers can add workspace members" ON public.workspace_members;
CREATE POLICY "Admins and managers can add workspace members"
  ON public.workspace_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_workspace_role(workspace_id, auth.uid()) IN ('admin', 'manager') OR
    EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can update workspace member roles" ON public.workspace_members;
CREATE POLICY "Admins can update workspace member roles"
  ON public.workspace_members
  FOR UPDATE
  TO authenticated
  USING (
    public.get_workspace_role(workspace_id, auth.uid()) = 'admin' OR
    EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_members.workspace_id AND w.owner_id = auth.uid())
  )
  WITH CHECK (
    public.get_workspace_role(workspace_id, auth.uid()) = 'admin' OR
    EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_members.workspace_id AND w.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can remove members or members can leave" ON public.workspace_members;
CREATE POLICY "Admins can remove members or members can leave"
  ON public.workspace_members
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    public.get_workspace_role(workspace_id, auth.uid()) = 'admin' OR
    EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_members.workspace_id AND w.owner_id = auth.uid())
  );

-- 8. Create Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status public.project_status NOT NULL DEFAULT 'planning',
  start_date DATE,
  end_date DATE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Foreign key link to public.profiles for PostgREST joins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_projects_created_by_profile'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT fk_projects_created_by_profile
      FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS projects_workspace_id_idx ON public.projects(workspace_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON public.projects(status);

-- Projects updated_at trigger
DROP TRIGGER IF EXISTS on_project_updated ON public.projects;
CREATE TRIGGER on_project_updated
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 9. Create Project Members Table
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_project_user UNIQUE (project_id, user_id)
);

-- Foreign key link to public.profiles for PostgREST joins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_project_members_profile'
  ) THEN
    ALTER TABLE public.project_members
      ADD CONSTRAINT fk_project_members_profile
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS project_members_proj_idx ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS project_members_user_idx ON public.project_members(user_id);

-- Auto-assign Project Creator as Member/Admin
CREATE OR REPLACE FUNCTION public.handle_new_project_creator()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin')
  ON CONFLICT (project_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_project_created ON public.projects;
CREATE TRIGGER on_project_created
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_project_creator();

-- 10. Project Helper Functions
CREATE OR REPLACE FUNCTION public.is_project_member(p_id UUID, check_uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = p_id AND user_id = check_uid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_project_workspace_id(p_id UUID)
RETURNS UUID AS $$
DECLARE
  ws_id UUID;
BEGIN
  SELECT workspace_id INTO ws_id FROM public.projects WHERE id = p_id;
  RETURN ws_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 11. RLS for Projects Table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can view projects" ON public.projects;
CREATE POLICY "Workspace members can view projects"
  ON public.projects
  FOR SELECT
  TO authenticated
  USING (
    public.is_workspace_member(workspace_id, auth.uid()) OR
    EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = projects.workspace_id AND w.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins and managers can create projects" ON public.projects;
CREATE POLICY "Admins and managers can create projects"
  ON public.projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      public.get_workspace_role(workspace_id, auth.uid()) IN ('admin', 'manager') OR
      EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid())
    ) AND
    auth.uid() = created_by
  );

DROP POLICY IF EXISTS "Admins and managers can edit projects" ON public.projects;
CREATE POLICY "Admins and managers can edit projects"
  ON public.projects
  FOR UPDATE
  TO authenticated
  USING (
    public.get_workspace_role(workspace_id, auth.uid()) IN ('admin', 'manager') OR
    EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = projects.workspace_id AND w.owner_id = auth.uid()) OR
    created_by = auth.uid()
  )
  WITH CHECK (
    public.get_workspace_role(workspace_id, auth.uid()) IN ('admin', 'manager') OR
    EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = projects.workspace_id AND w.owner_id = auth.uid()) OR
    created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Only authorized users can delete projects" ON public.projects;
CREATE POLICY "Only authorized users can delete projects"
  ON public.projects
  FOR DELETE
  TO authenticated
  USING (
    public.get_workspace_role(workspace_id, auth.uid()) = 'admin' OR
    EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = projects.workspace_id AND w.owner_id = auth.uid()) OR
    created_by = auth.uid()
  );

-- 12. RLS for Project Members Table
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can view project members" ON public.project_members;
CREATE POLICY "Workspace members can view project members"
  ON public.project_members
  FOR SELECT
  TO authenticated
  USING (
    public.is_workspace_member(public.get_project_workspace_id(project_id), auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.workspaces w ON w.id = p.workspace_id
      WHERE p.id = project_members.project_id AND w.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins and managers can add project members" ON public.project_members;
CREATE POLICY "Admins and managers can add project members"
  ON public.project_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Caller must be workspace admin/manager or workspace owner
    (
      public.get_workspace_role(public.get_project_workspace_id(project_id), auth.uid()) IN ('admin', 'manager') OR
      EXISTS (
        SELECT 1 FROM public.projects p
        JOIN public.workspaces w ON w.id = p.workspace_id
        WHERE p.id = project_members.project_id AND w.owner_id = auth.uid()
      )
    ) AND
    -- Added user MUST already be a member of the workspace
    public.is_workspace_member(public.get_project_workspace_id(project_id), user_id)
  );

DROP POLICY IF EXISTS "Admins and managers can remove project members or members leave" ON public.project_members;
CREATE POLICY "Admins and managers can remove project members or members leave"
  ON public.project_members
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    public.get_workspace_role(public.get_project_workspace_id(project_id), auth.uid()) IN ('admin', 'manager') OR
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.workspaces w ON w.id = p.workspace_id
      WHERE p.id = project_members.project_id AND w.owner_id = auth.uid()
    )
  );
