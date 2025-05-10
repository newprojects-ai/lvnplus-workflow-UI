/*
  # Base Schema Setup
  
  1. User Management
    - Creates users view extending auth.users
    - Adds user profiles table with RLS
    - Sets up triggers for new user handling
  
  2. Workflow Updates
    - Updates workflow relationships to use proper UUIDs
    - Adds necessary indexes
  
  3. Audit Logging
    - Adds audit logs table
    - Creates audit logging function and triggers
*/

-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users view that extends auth.users
CREATE OR REPLACE VIEW public.users AS 
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as name,
  raw_user_meta_data->>'avatar_url' as avatar
FROM auth.users;

-- Create user profiles table for additional user data
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user handling
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- First drop existing policies that depend on created_by
DROP POLICY IF EXISTS "Steps are editable by workflow creators" ON workflow_steps;
DROP POLICY IF EXISTS "Workflow create access" ON workflows;
DROP POLICY IF EXISTS "Workflow delete access" ON workflows;
DROP POLICY IF EXISTS "Workflow update access" ON workflows;

-- Now update the column type
ALTER TABLE public.workflows
  ALTER COLUMN created_by TYPE UUID USING created_by::UUID;

-- Recreate the policies with the updated column type
CREATE POLICY "Steps are editable by workflow creators"
  ON workflow_steps
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workflows w
      WHERE w.id = workflow_steps.workflow_id
      AND w.created_by = auth.uid()
    )
  );

CREATE POLICY "Workflow create access"
  ON workflows
  FOR INSERT
  TO authenticated
  WITH CHECK (has_permission(auth.uid(), 'workflow:create'::text));

CREATE POLICY "Workflow delete access"
  ON workflows
  FOR DELETE
  TO authenticated
  USING (
    has_permission(auth.uid(), 'workflow:delete'::text) 
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

CREATE POLICY "Workflow update access"
  ON workflows
  FOR UPDATE
  TO authenticated
  USING (
    has_permission(auth.uid(), 'workflow:update'::text)
    AND (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid()
        AND r.name = ANY (ARRAY['admin', 'manager'])
      )
    )
  )
  WITH CHECK (
    has_permission(auth.uid(), 'workflow:update'::text)
    AND (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid()
        AND r.name = ANY (ARRAY['admin', 'manager'])
      )
    )
  );

-- Add indexes for common queries
CREATE INDEX idx_workflows_created_by ON public.workflows(created_by);
CREATE INDEX idx_workflow_instances_workflow_id ON public.workflow_instances(workflow_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);

-- Add audit logging
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create audit logging function
CREATE OR REPLACE FUNCTION public.audit_log_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  )
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to main tables
CREATE TRIGGER audit_workflows_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.workflows
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();

CREATE TRIGGER audit_workflow_instances_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.workflow_instances
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();

CREATE TRIGGER audit_tasks_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_changes();