/*
  # Add permission checking function
  
  1. New Functions
    - `has_permission`: Checks if a user has a specific permission through their roles
*/

CREATE OR REPLACE FUNCTION public.has_permission(user_id UUID, required_permission TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role_id = ur.role_id
    WHERE ur.user_id = user_id
    AND rp.permission = required_permission
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;