# Archived Migrations (Legacy)

The migration files in this directory have been superseded by `supabase/migrations/001_initial_schema.sql`.

## Archive Rationale

Before remote deployment to the hosted Supabase database, the schema history was audited and reconciled into one canonical, production-ready schema to resolve several cross-migration contradictions:

1. **`20260905000001_create_profiles_and_roles.sql`**:
   - Defined a redundant global `user_role` on `profiles`, conflicting with TeamFlow's workspace-level role architecture.
   - Replaced by workspace-level `workspace_role` on `workspace_members`.

2. **`20260905000002_create_workspaces_and_projects.sql`**:
   - Defined project-level roles on `project_members`, which contradicted the unified workspace role model.
   - Used inconsistent foreign key definitions between `auth.users` and `profiles`.

3. **`002_project_fields.sql`**:
   - Defined `project_status` with `('active', 'completed', 'on_hold', 'archived')`, conflicting with canonical statuses `('planning', 'active', 'completed', 'archived')`.

4. **`003_tasks_and_comments.sql`**:
   - Defined `task_status` with `('backlog', 'todo', 'in_progress', 'in_review', 'done')`, conflicting with canonical statuses `('todo', 'in_progress', 'review', 'done')`.
   - Introduced denormalized `workspace_id` on tasks that duplicated `project.workspace_id`.

## Canonical Active Migration

The single source of truth for the entire database is:
- **`supabase/migrations/001_initial_schema.sql`**
