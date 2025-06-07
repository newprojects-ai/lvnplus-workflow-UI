/*
  # Add admin role to user
  
  1. Changes
    - Assigns admin role to specified user
    - Adds all admin permissions
*/

DO $$
DECLARE
  v_user_id UUID := '[USER_ID]'::UUID; -- Replace [USER_ID] with actual user ID
  v_admin_role_id UUID;
BEGIN
  -- Get admin role ID
  SELECT id INTO v_admin_role_id
  FROM public.roles
  WHERE name = 'admin';

  -- Assign admin role if not already assigned
  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (v_user_id, v_admin_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;
END $$;