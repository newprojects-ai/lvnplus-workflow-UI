import React, { ReactNode } from 'react';
import { useRBAC } from '../../hooks/useRBAC';

interface RoleGuardProps {
  children: ReactNode;
  roles?: string[];
  permissions?: string[];
  requireAll?: boolean;
}

const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles = [],
  permissions = [],
  requireAll = false
}) => {
  const { hasRole, hasPermission, isLoading } = useRBAC();

  if (isLoading) {
    return null;
  }

  const hasRequiredRoles = requireAll
    ? roles.every(role => hasRole(role))
    : roles.length === 0 || roles.some(role => hasRole(role));

  const hasRequiredPermissions = requireAll
    ? permissions.every(permission => hasPermission(permission))
    : permissions.length === 0 || permissions.some(permission => hasPermission(permission));

  if (!hasRequiredRoles || !hasRequiredPermissions) {
    return null;
  }

  return <>{children}</>;
};

export default RoleGuard;