/*
  # Add Advanced Workflow Features

  1. New Tables
    - `workflow_variables`
      - `id` (uuid, primary key)
      - `workflow_id` (uuid, foreign key)
      - `step_id` (uuid, foreign key)
      - `name` (text)
      - `type` (text: input/output)
      - `source` (text)
      - `target` (text)
      - `transform` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `workflow_error_handlers`
      - `id` (uuid, primary key)
      - `workflow_id` (uuid, foreign key)
      - `step_id` (uuid, foreign key)
      - `type` (text: retry/fallback/notification)
      - `config` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes
    - Add `config` column to `workflow_steps` table
    - Update `type` check constraint in `workflow_steps` table

  3. Security
    - Enable RLS on new tables
    - Add policies for workflow creators and authenticated users
*/

-- Add config column to workflow_steps
ALTER TABLE workflow_steps ADD COLUMN IF NOT EXISTS config jsonb DEFAULT '{}'::jsonb;

-- Update workflow_steps type check constraint
ALTER TABLE workflow_steps DROP CONSTRAINT IF EXISTS workflow_steps_type_check;
ALTER TABLE workflow_steps ADD CONSTRAINT workflow_steps_type_check 
  CHECK (type = ANY (ARRAY[
    'start'::text, 
    'task'::text, 
    'service'::text, 
    'script'::text, 
    'decision'::text, 
    'timer'::text, 
    'message'::text, 
    'notification'::text, 
    'error'::text, 
    'end'::text
  ]));

-- Create workflow_variables table
CREATE TABLE IF NOT EXISTS workflow_variables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  step_id uuid NOT NULL REFERENCES workflow_steps(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('input', 'output')),
  source text NOT NULL,
  target text NOT NULL,
  transform text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create workflow_error_handlers table
CREATE TABLE IF NOT EXISTS workflow_error_handlers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  step_id uuid NOT NULL REFERENCES workflow_steps(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('retry', 'fallback', 'notification')),
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE workflow_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_error_handlers ENABLE ROW LEVEL SECURITY;

-- Add policies for workflow_variables
CREATE POLICY "Variables are editable by workflow creators"
  ON workflow_variables
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workflows w 
      WHERE w.id = workflow_variables.workflow_id 
      AND w.created_by = auth.uid()
    )
  );

CREATE POLICY "Variables are viewable by all authenticated users"
  ON workflow_variables
  FOR SELECT
  TO authenticated
  USING (true);

-- Add policies for workflow_error_handlers
CREATE POLICY "Error handlers are editable by workflow creators"
  ON workflow_error_handlers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workflows w 
      WHERE w.id = workflow_error_handlers.workflow_id 
      AND w.created_by = auth.uid()
    )
  );

CREATE POLICY "Error handlers are viewable by all authenticated users"
  ON workflow_error_handlers
  FOR SELECT
  TO authenticated
  USING (true);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workflow_variables_workflow_id ON workflow_variables(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_variables_step_id ON workflow_variables(step_id);
CREATE INDEX IF NOT EXISTS idx_workflow_error_handlers_workflow_id ON workflow_error_handlers(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_error_handlers_step_id ON workflow_error_handlers(step_id);