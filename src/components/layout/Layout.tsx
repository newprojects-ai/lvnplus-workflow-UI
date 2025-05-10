import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useRBAC } from '../../hooks/useRBAC';

interface LayoutProps {
  children: ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  requiredPermissions = [],
  requiredRoles = []
}) => {
  const navigate = useNavigate();
  const { hasPermission, hasRole, isLoading } = useRBAC();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasAccess = (
    requiredPermissions.every(permission => hasPermission(permission)) &&
    requiredRoles.every(role => hasRole(role))
  );

  if (!hasAccess) {
    navigate('/');
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;