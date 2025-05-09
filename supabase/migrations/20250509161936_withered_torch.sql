/*
  # Initial schema for workflow management system

  1. New Tables
    - `workflows`
      - Core workflow definitions
      - Stores workflow metadata and configuration
    - `workflow_steps`
      - Individual steps within workflows
      - Contains step configuration and form fields
    - `workflow_transitions`
      - Connections between workflow steps
      - Defines the flow logic
    - `workflow_instances`
      - Running instances of workflows
      - Tracks execution state and data
    - `workflow_history`
      - Step execution history
      - Audit trail of workflow execution
    - `tasks`
      - User tasks generated from workflow steps
      - Manages assignments and completion status

  2. Security
    - Enable RLS on all tables
    - Policies for proper data access control
*/

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  version text NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Workflow steps table
CREATE TABLE IF NOT EXISTS workflow_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('start', 'task', 'decision', 'end')),
  position jsonb NOT NULL DEFAULT '{"x": 0, "y": 0}',
  config jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Workflow transitions table
CREATE TABLE IF NOT EXISTS workflow_transitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  from_step_id uuid NOT NULL REFERENCES workflow_steps(id) ON DELETE CASCADE,
  to_step_id uuid NOT NULL REFERENCES workflow_steps(id) ON DELETE CASCADE,
  condition text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Workflow instances table
CREATE TABLE IF NOT EXISTS workflow_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES workflows(id),
  status text NOT NULL CHECK (status IN ('active', 'completed', 'terminated')),
  current_step_id uuid NOT NULL REFERENCES workflow_steps(id),
  data jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Workflow history table
CREATE TABLE IF NOT EXISTS workflow_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  step_id uuid NOT NULL REFERENCES workflow_steps(id),
  step_name text NOT NULL,
  entered_at timestamptz NOT NULL DEFAULT now(),
  exited_at timestamptz,
  data jsonb,
  user_id uuid REFERENCES auth.users(id),
  comments text
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  step_id uuid NOT NULL REFERENCES workflow_steps(id),
  step_name text NOT NULL,
  assigned_to uuid REFERENCES auth.users(id),
  due_date timestamptz,
  status text NOT NULL CHECK (status IN ('pending', 'completed')),
  priority text NOT NULL CHECK (priority IN ('low', 'normal', 'high')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Workflows are viewable by all authenticated users"
  ON workflows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Workflows are editable by creators"
  ON workflows FOR ALL
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Steps are viewable by all authenticated users"
  ON workflow_steps FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Steps are editable by workflow creators"
  ON workflow_steps FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM workflows w 
    WHERE w.id = workflow_id 
    AND w.created_by = auth.uid()
  ));

CREATE POLICY "Transitions are viewable by all authenticated users"
  ON workflow_transitions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Transitions are editable by workflow creators"
  ON workflow_transitions FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM workflows w 
    WHERE w.id = workflow_id 
    AND w.created_by = auth.uid()
  ));

CREATE POLICY "Instances are viewable by all authenticated users"
  ON workflow_instances FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "History is viewable by all authenticated users"
  ON workflow_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Tasks are viewable by assigned users"
  ON tasks FOR SELECT
  TO authenticated
  USING (assigned_to = auth.uid());

CREATE POLICY "Tasks are editable by assigned users"
  ON tasks FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());