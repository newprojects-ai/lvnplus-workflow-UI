import React, { ReactNode } from 'react';
import { useRBAC } from '../../hooks/useRBAC';

interface PermissionGuardProps {
  children: ReactNode;
  permissions: string[];
  fallback?: ReactNode;
  requireAll?: boolean;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permissions,
  fallback = null,
  requireAll = true
}) => {
  const { hasPermission, isLoading } = useRBAC();

  if (isLoading) {
    return null;
  }

  const hasAccess = requireAll
    ? permissions.every(permission => hasPermission(permission))
    : permissions.some(permission => hasPermission(permission));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;