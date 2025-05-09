/*
  # API Layer Tables

  1. New Tables
    - `api_keys` - For managing API access
      - `id` (uuid, primary key)
      - `name` (text)
      - `key` (text, unique)
      - `user_id` (uuid, references auth.users)
      - `scopes` (text[])
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `api_logs` - For tracking API usage
      - `id` (uuid, primary key)
      - `api_key_id` (uuid, references api_keys)
      - `endpoint` (text)
      - `method` (text)
      - `status_code` (integer)
      - `request_body` (jsonb)
      - `response_body` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for secure access
*/

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  key text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  scopes text[] NOT NULL DEFAULT '{}',
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- API Logs table
CREATE TABLE IF NOT EXISTS api_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid REFERENCES api_keys(id),
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code integer NOT NULL,
  request_body jsonb,
  response_body jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_keys
CREATE POLICY "API keys are viewable by their owners"
  ON api_keys FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "API keys are manageable by their owners"
  ON api_keys FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for api_logs
CREATE POLICY "API logs are viewable by API key owners"
  ON api_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM api_keys
      WHERE api_keys.id = api_logs.api_key_id
      AND api_keys.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_logs_api_key_id ON api_logs(api_key_id);
CREATE INDEX idx_api_logs_created_at ON api_logs(created_at);