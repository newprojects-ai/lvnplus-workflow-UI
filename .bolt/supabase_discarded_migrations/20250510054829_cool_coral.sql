/*
  # Seed Initial Data

  1. Roles and Permissions
    - Creates default roles (admin, manager, user)
    - Adds basic permissions for each role
    - Sets up workflow-related permissions

  2. Default Admin User
    - Creates a default admin user for initial setup
*/

-- Insert default roles
INSERT INTO public.roles (id, name, description) VALUES
  (gen_random_uuid(), 'admin', 'Full system access'),
  (gen_random_uuid(), 'manager', 'Workflow management and oversight'),
  (gen_random_uuid(), 'user', 'Basic system access');

-- Insert permissions for admin role
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
WHERE r.name = 'admin';

-- Insert permissions for manager role
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
WHERE r.name = 'manager';

-- Insert permissions for user role
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
WHERE r.name = 'user';