-- Add extra fields to projects table
DO $$ BEGIN
  CREATE TYPE public.project_status AS ENUM ('active', 'completed', 'on_hold', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS status public.project_status NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE;
