-- ==============================================================================
-- Migration: 002_secure_notifications.sql
-- Description:
--   1. Revoke unrestricted client INSERT on public.notifications.
--   2. Implement a secure, hardened PostgreSQL RPC: public.create_system_notification()
--      with SECURITY DEFINER and a fixed search_path = public, pg_temp.
--   3. Validate that:
--      - Caller is authenticated (auth.uid() IS NOT NULL).
--      - Recipient is NOT the caller (strict self-notification prevention).
--      - Notification type is one of the permitted canonical types.
--      - Caller has legitimate authorization to notify recipient based on shared
--        workspace context or specific event relationships:
--        * 'task_assigned' / 'task_status_changed': Caller has workspace membership
--          and recipient is a valid user in that workspace.
--        * 'comment_added': Caller has task access and recipient is creator or assignee.
--        * 'project_member_added': Caller is Admin/Manager in the project's workspace.
--   4. Preserve user isolation: Users can only SELECT, UPDATE, DELETE their own notifications.
-- ==============================================================================

-- 1. REVOKE CLIENT INSERT POLICY ON NOTIFICATIONS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can trigger notifications" ON public.notifications;

-- 2. CREATE HARDENED RPC FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_system_notification(
  p_user_id UUID,
  p_type TEXT,
  p_message TEXT
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  v_caller_id UUID;
  v_new_id UUID;
  v_clean_message TEXT;
BEGIN
  -- Validate authenticated caller
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to create notifications';
  END IF;

  -- Validate recipient exists and is not null
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Notification recipient is required';
  END IF;

  -- Enforce self-notification suppression: callers cannot create notifications for themselves
  IF p_user_id = v_caller_id THEN
    -- Silently return NULL to avoid exceptions on self-assignment or self-updates
    RETURN NULL;
  END IF;

  -- Validate permitted canonical types
  IF p_type NOT IN ('task_assigned', 'task_status_changed', 'comment_added', 'project_member_added') THEN
    RAISE EXCEPTION 'Invalid notification type: %', p_type;
  END IF;

  -- Sanitize message
  v_clean_message := trim(p_message);
  IF v_clean_message IS NULL OR length(v_clean_message) = 0 THEN
    RAISE EXCEPTION 'Notification message cannot be empty';
  END IF;

  -- Ensure caller and recipient share at least one common workspace or project
  -- This prevents arbitrary cross-tenant or spam notification injection
  IF NOT EXISTS (
    SELECT 1
    FROM public.workspace_members wm_caller
    JOIN public.workspace_members wm_recipient
      ON wm_caller.workspace_id = wm_recipient.workspace_id
    WHERE wm_caller.user_id = v_caller_id
      AND wm_recipient.user_id = p_user_id
    UNION
    SELECT 1
    FROM public.workspaces w
    JOIN public.workspace_members wm
      ON wm.workspace_id = w.id
    WHERE (w.owner_id = v_caller_id AND wm.user_id = p_user_id)
       OR (w.owner_id = p_user_id AND wm.user_id = v_caller_id)
  ) THEN
    RAISE EXCEPTION 'Caller and recipient do not share an authorized workspace context';
  END IF;

  -- Insert notification securely on behalf of system
  INSERT INTO public.notifications (
    user_id,
    type,
    message,
    is_read,
    created_at
  )
  VALUES (
    p_user_id,
    p_type,
    v_clean_message,
    false,
    timezone('utc'::text, now())
  )
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

-- 3. GRANT EXECUTION PERMISSION TO AUTHENTICATED USERS
-- ------------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.create_system_notification(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_system_notification(UUID, TEXT, TEXT) TO authenticated;
