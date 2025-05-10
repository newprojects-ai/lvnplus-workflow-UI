/*
  # Set up initial admin user and roles

  1. Creates initial admin user
  2. Assigns admin role to the user
  3. Ensures proper role permissions
*/

-- Create initial admin user if not exists
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
)
SELECT 
  gen_random_uuid(),
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"full_name": "System Admin", "avatar_url": "https://ui-avatars.com/api/?name=System+Admin"}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'admin@example.com'
);

-- Get the admin user ID
DO $$
DECLARE
  v_admin_id UUID;
  v_admin_role_id UUID;
BEGIN
  -- Get admin user ID
  SELECT id INTO v_admin_id
  FROM auth.users
  WHERE email = 'admin@example.com';

  -- Get admin role ID
  SELECT id INTO v_admin_role_id
  FROM public.roles
  WHERE name = 'admin';

  -- Assign admin role if not already assigned
  INSERT INTO public.user_roles (user_id, role_id)
  SELECT v_admin_id, v_admin_role_id
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = v_admin_id AND role_id = v_admin_role_id
  );
END $$;