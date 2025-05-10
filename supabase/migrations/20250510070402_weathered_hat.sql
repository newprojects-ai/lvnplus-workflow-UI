/*
  # Fix recursive user roles policy

  1. Changes
    - Drop existing policy that causes infinite recursion
    - Create new policy that avoids recursion by using a function
    - Add function to check if user is admin

  2. Security
    - Maintains same security rules but implements them in a non-recursive way
    - Only admins can manage user roles
    - All authenticated users can view user roles
*/

-- First create a function to check if a user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM roles r
    JOIN user_roles ur ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid
    AND r.name = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;

-- Create new policy without recursion
CREATE POLICY "Admins can manage user roles"
ON user_roles
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Keep the existing select policy
DROP POLICY IF EXISTS "User roles are viewable by authenticated users" ON user_roles;
CREATE POLICY "User roles are viewable by authenticated users"
ON user_roles
FOR SELECT
TO authenticated
USING (true);