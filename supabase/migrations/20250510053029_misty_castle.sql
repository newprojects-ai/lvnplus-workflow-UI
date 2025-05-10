/*
  # Add RBAC functionality

  1. New Tables
    - `roles` - Defines available roles in the system
    - `user_roles` - Maps users to roles
    - `role_permissions` - Defines permissions for each role
    - `resource_permissions` - Maps permissions to specific resources

  2. Changes
    - Update existing RLS policies to use role-based checks
    - Add role-based constraints to workflows table

  3. Security
    - Enable RLS on all new tables
    - Add policies for role management
*/

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Create role_permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(role_id, permission)
);

-- Create resource_permissions table
CREATE TABLE IF NOT EXISTS resource_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(resource_type, resource_id, role_id, permission)
);

-- Enable RLS on new tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_permissions ENABLE ROW LEVEL SECURITY;

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'Full system access'),
  ('manager', 'Workflow management and oversight'),
  ('user', 'Basic workflow operations');

-- Insert default permissions
INSERT INTO role_permissions (role_id, permission) 
SELECT id, permission
FROM roles r
CROSS JOIN (
  VALUES 
    ('workflow:create'),
    ('workflow:read'),
    ('workflow:update'),
    ('workflow:delete'),
    ('workflow:publish'),
    ('workflow:execute'),
    ('task:create'),
    ('task:read'),
    ('task:update'),
    ('task:delete'),
    ('user:create'),
    ('user:read'),
    ('user:update'),
    ('user:delete')
) AS p(permission)
WHERE r.name = 'admin';

INSERT INTO role_permissions (role_id, permission)
SELECT r.id, p.permission
FROM roles r
CROSS JOIN (
  VALUES 
    ('workflow:create'),
    ('workflow:read'),
    ('workflow:update'),
    ('workflow:publish'),
    ('workflow:execute'),
    ('task:create'),
    ('task:read'),
    ('task:update')
) AS p(permission)
WHERE r.name = 'manager';

INSERT INTO role_permissions (role_id, permission)
SELECT r.id, p.permission
FROM roles r
CROSS JOIN (
  VALUES 
    ('workflow:read'),
    ('workflow:execute'),
    ('task:read'),
    ('task:update')
) AS p(permission)
WHERE r.name = 'user';

-- Create helper functions
CREATE OR REPLACE FUNCTION public.get_user_roles(user_id uuid)
RETURNS TABLE (role_name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.name
  FROM roles r
  JOIN user_roles ur ON ur.role_id = r.id
  WHERE ur.user_id = $1;
$$;

CREATE OR REPLACE FUNCTION public.has_permission(user_id uuid, required_permission text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    WHERE ur.user_id = $1
    AND rp.permission = $2
  );
$$;

-- Update workflow policies
DROP POLICY IF EXISTS "Workflows are editable by creators" ON workflows;
DROP POLICY IF EXISTS "Workflows are viewable by all authenticated users" ON workflows;

CREATE POLICY "Workflow read access"
ON workflows
FOR SELECT
TO authenticated
USING (
  has_permission(auth.uid(), 'workflow:read')
);

CREATE POLICY "Workflow create access"
ON workflows
FOR INSERT
TO authenticated
WITH CHECK (
  has_permission(auth.uid(), 'workflow:create')
);

CREATE POLICY "Workflow update access"
ON workflows
FOR UPDATE
TO authenticated
USING (
  has_permission(auth.uid(), 'workflow:update') AND
  (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('admin', 'manager')
  ))
)
WITH CHECK (
  has_permission(auth.uid(), 'workflow:update') AND
  (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('admin', 'manager')
  ))
);

CREATE POLICY "Workflow delete access"
ON workflows
FOR DELETE
TO authenticated
USING (
  has_permission(auth.uid(), 'workflow:delete') AND
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'admin'
  )
);

-- Add policies for role management
CREATE POLICY "Roles are viewable by authenticated users"
ON roles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "User roles are manageable by admins"
ON user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'admin'
  )
);

CREATE POLICY "User roles are viewable by authenticated users"
ON user_roles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Role permissions are viewable by authenticated users"
ON role_permissions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Resource permissions are manageable by admins"
ON resource_permissions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'admin'
  )
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_resource_permissions_resource ON resource_permissions(resource_type, resource_id);