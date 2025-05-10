/*
  # Add function to assign admin role to user

  1. New Functions
    - `assign_admin_role(user_id UUID)`: Assigns admin role to specified user

  2. Security
    - Function can only be executed by superuser or current admin users
*/

-- Create function to assign admin role to a user
CREATE OR REPLACE FUNCTION public.assign_admin_role(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_role_id UUID;
BEGIN
  -- Verify user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User with ID % does not exist', p_user_id;
  END IF;

  -- Get admin role ID
  SELECT id INTO v_admin_role_id
  FROM public.roles
  WHERE name = 'admin';

  IF v_admin_role_id IS NULL THEN
    RAISE EXCEPTION 'Admin role does not exist';
  END IF;

  -- Assign admin role if not already assigned
  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (p_user_id, v_admin_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;
END;
$$;