import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { roleService, Role } from '../services/roleService';

export function useRBAC() {
  const { currentUser } = useUser();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserRoles = async () => {
      // Reset state if no user or invalid user ID
      if (!currentUser?.id || typeof currentUser.id !== 'string') {
        setRoles([]);
        setPermissions(new Set());
        setIsLoading(false);
        return;
      }

      try {
        // Validate UUID format before making the request
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(currentUser.id)) {
          setRoles([]);
          setPermissions(new Set());
          setIsLoading(false);
          return; // Silently return instead of throwing an error
        }

        const userRoles = await roleService.getUserRoles(currentUser.id);
        setRoles(userRoles);

        // Load permissions for all roles
        const allPermissions = new Set<string>();
        await Promise.all(
          userRoles.map(async (role) => {
            const rolePermissions = await roleService.getRolePermissions(role.id);
            rolePermissions.forEach(p => allPermissions.add(p.permission));
          })
        );
        
        setPermissions(allPermissions);
      } catch (error) {
        console.error('Error loading user roles:', error);
        setRoles([]);
        setPermissions(new Set());
      } finally {
        setIsLoading(false);
      }
    };

    loadUserRoles();
  }, [currentUser]);

  const hasRole = (roleName: string): boolean => {
    return roles.some(role => role.name === roleName);
  };

  const hasPermission = (permission: string): boolean => {
    return permissions.has(permission);
  };

  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  return {
    roles,
    permissions,
    hasRole,
    hasPermission,
    isAdmin,
    isLoading
  };
}