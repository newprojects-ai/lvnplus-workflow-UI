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
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const hasAccess = (
    requiredPermissions.every(permission => hasPermission(permission)) &&
    requiredRoles.every(role => hasRole(role))
  );

  if (!hasAccess) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-800 mb-2">Access Denied</h3>
            <p className="text-sm text-red-600">
              You don't have the required permissions to access this page.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
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