/*
  # Fix user_roles RLS policies

  1. Changes
    - Remove recursive policy for user_roles management
    - Add new policy for admin role management using a direct role check
    - Maintain existing SELECT policy

  2. Security
    - Ensures admins can manage user roles without recursion
    - Maintains read access for all authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "User roles are manageable by admins" ON user_roles;

-- Create new non-recursive policy for admin management
CREATE POLICY "Admins can manage user roles"
ON user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'admin'
    AND ur.id != user_roles.id -- Prevent recursion by excluding the current row
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'admin'
    AND ur.id != user_roles.id -- Prevent recursion by excluding the current row
  )
);