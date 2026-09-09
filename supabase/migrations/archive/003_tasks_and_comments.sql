-- ==============================================================================
-- Migration: 003_tasks_and_comments.sql
-- Description: Creates tasks and comments tables with enums, foreign keys,
--              indexes, updated_at triggers, and secure RLS policies.
--              Depends on: workspaces, workspace_members, projects, project_members,
--                          profiles, is_workspace_member(), get_workspace_role()
-- ==============================================================================

-- 1. ENUMS
-- ------------------------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE public.task_status AS ENUM (
      'backlog', 'todo', 'in_progress', 'in_review', 'done'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
    CREATE TYPE public.task_priority AS ENUM (
      'low', 'medium', 'high', 'urgent'
    );
  END IF;
END $$;

-- 2. TASKS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  status       public.task_status   NOT NULL DEFAULT 'todo',
  priority     public.task_priority NOT NULL DEFAULT 'medium',
  position     INTEGER NOT NULL DEFAULT 0,
  due_date     DATE,
  assignee_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS tasks_project_id_idx      ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS tasks_workspace_id_idx    ON public.tasks(workspace_id);
CREATE INDEX IF NOT EXISTS tasks_status_position_idx ON public.tasks(project_id, status, position);
CREATE INDEX IF NOT EXISTS tasks_assignee_id_idx     ON public.tasks(assignee_id);

-- updated_at trigger
DROP TRIGGER IF EXISTS on_task_updated ON public.tasks;
CREATE TRIGGER on_task_updated
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 3. COMMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS comments_task_id_idx ON public.comments(task_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON public.comments(user_id);

-- updated_at trigger
DROP TRIGGER IF EXISTS on_comment_updated ON public.comments;
CREATE TRIGGER on_comment_updated
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. ROW LEVEL SECURITY
-- ------------------------------------------------------------------------------
ALTER TABLE public.tasks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- === TASKS ===

DROP POLICY IF EXISTS "Workspace members can view tasks" ON public.tasks;
CREATE POLICY "Workspace members can view tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (
    public.is_workspace_member(workspace_id, auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = tasks.workspace_id AND w.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins, managers, and members can create tasks" ON public.tasks;
CREATE POLICY "Admins, managers, and members can create tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND
    (
      public.get_workspace_role(workspace_id, auth.uid()) IN ('admin', 'manager', 'member') OR
      EXISTS (
        SELECT 1 FROM public.workspaces w
        WHERE w.id = workspace_id AND w.owner_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Admins, managers, and assigned members can update tasks" ON public.tasks;
CREATE POLICY "Admins, managers, and assigned members can update tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (
    public.get_workspace_role(workspace_id, auth.uid()) IN ('admin', 'manager') OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = tasks.workspace_id AND w.owner_id = auth.uid()
    ) OR
    (
      public.get_workspace_role(workspace_id, auth.uid()) = 'member' AND
      (assignee_id = auth.uid() OR created_by = auth.uid())
    )
  )
  WITH CHECK (
    public.get_workspace_role(workspace_id, auth.uid()) IN ('admin', 'manager') OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = tasks.workspace_id AND w.owner_id = auth.uid()
    ) OR
    (
      public.get_workspace_role(workspace_id, auth.uid()) = 'member' AND
      (assignee_id = auth.uid() OR created_by = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins, managers, and creators can delete tasks" ON public.tasks;
CREATE POLICY "Admins, managers, and creators can delete tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (
    public.get_workspace_role(workspace_id, auth.uid()) IN ('admin', 'manager') OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = tasks.workspace_id AND w.owner_id = auth.uid()
    ) OR
    created_by = auth.uid()
  );

-- === COMMENTS ===

DROP POLICY IF EXISTS "Workspace members can view comments" ON public.comments;
CREATE POLICY "Workspace members can view comments"
  ON public.comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = comments.task_id
      AND (
        public.is_workspace_member(t.workspace_id, auth.uid()) OR
        EXISTS (
          SELECT 1 FROM public.workspaces w
          WHERE w.id = t.workspace_id AND w.owner_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Authenticated workspace members can add comments" ON public.comments;
CREATE POLICY "Authenticated workspace members can add comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_id AND
      (
        public.get_workspace_role(t.workspace_id, auth.uid()) IN ('admin', 'manager', 'member') OR
        EXISTS (
          SELECT 1 FROM public.workspaces w
          WHERE w.id = t.workspace_id AND w.owner_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Authors can update their own comments" ON public.comments;
CREATE POLICY "Authors can update their own comments"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Authors, admins, and managers can delete comments" ON public.comments;
CREATE POLICY "Authors, admins, and managers can delete comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = comments.task_id AND
      (
        public.get_workspace_role(t.workspace_id, auth.uid()) IN ('admin', 'manager') OR
        EXISTS (
          SELECT 1 FROM public.workspaces w
          WHERE w.id = t.workspace_id AND w.owner_id = auth.uid()
        )
      )
    )
  );
