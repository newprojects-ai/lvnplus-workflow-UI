/*
  # Add roles and permissions

  1. Changes
    - Adds default roles if they don't exist
    - Adds role permissions for each role type
    - Uses safe inserts to avoid duplicates
*/

-- Insert default roles if they don't exist
INSERT INTO public.roles (id, name, description)
SELECT gen_random_uuid(), 'admin', 'Full system access'
WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'admin');

INSERT INTO public.roles (id, name, description)
SELECT gen_random_uuid(), 'manager', 'Workflow management and oversight'
WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'manager');

INSERT INTO public.roles (id, name, description)
SELECT gen_random_uuid(), 'user', 'Basic system access'
WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'user');

-- Insert permissions for admin role if they don't exist
INSERT INTO public.role_permissions (role_id, permission)
SELECT r.id, p.permission
FROM public.roles r
CROSS JOIN (
  VALUES 
    ('workflow:create'),
    ('workflow:read'),
    ('workflow:update'),
    ('workflow:delete'),
    ('workflow:publish'),
    ('workflow:execute'),
    ('user:create'),
    ('user:read'),
    ('user:update'),
    ('user:delete'),
    ('user:manage'),
    ('task:create'),
    ('task:read'),
    ('task:update'),
    ('task:delete'),
    ('task:assign')
) AS p(permission)
WHERE r.name = 'admin'
AND NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp 
  WHERE rp.role_id = r.id AND rp.permission = p.permission
);

-- Insert permissions for manager role if they don't exist
INSERT INTO public.role_permissions (role_id, permission)
SELECT r.id, p.permission
FROM public.roles r
CROSS JOIN (
  VALUES 
    ('workflow:read'),
    ('workflow:update'),
    ('workflow:execute'),
    ('task:read'),
    ('task:update'),
    ('task:assign')
) AS p(permission)
WHERE r.name = 'manager'
AND NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp 
  WHERE rp.role_id = r.id AND rp.permission = p.permission
);

-- Insert permissions for user role if they don't exist
INSERT INTO public.role_permissions (role_id, permission)
SELECT r.id, p.permission
FROM public.roles r
CROSS JOIN (
  VALUES 
    ('workflow:read'),
    ('workflow:execute'),
    ('task:read'),
    ('task:update')
) AS p(permission)
WHERE r.name = 'user'
AND NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp 
  WHERE rp.role_id = r.id AND rp.permission = p.permission
);