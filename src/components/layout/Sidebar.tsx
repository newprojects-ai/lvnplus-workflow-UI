import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRBAC } from '../../hooks/useRBAC';
import { 
  LayoutDashboard, 
  Workflow, 
  PlayCircle, 
  CheckSquare, 
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { hasPermission, isAdmin } = useRBAC();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Base navigation items available to all authenticated users
  const baseNavItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { 
      name: 'Workflows', 
      path: '/workflows', 
      icon: <Workflow size={20} />,
      permission: 'workflow:read'
    },
    { 
      name: 'Tasks', 
      path: '/tasks', 
      icon: <CheckSquare size={20} />,
      permission: 'task:read'
    }
  ];

  // Additional items for managers and admins
  const managerNavItems = [
    { 
      name: 'Instances', 
      path: '/instances', 
      icon: <PlayCircle size={20} />,
      permission: 'workflow:execute'
    },
    { 
      name: 'Reports', 
      path: '/reports', 
      icon: <BarChart3 size={20} />,
      permission: 'workflow:read'
    }
  ];

  // Admin-only items
  const adminNavItems = [
    { 
      name: 'Users', 
      path: '/users', 
      icon: <Users size={20} />,
      permission: 'user:manage'
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: <Settings size={20} />,
      permission: 'user:manage'
    }
  ];

  // Combine navigation items based on permissions
  const navItems = [
    ...baseNavItems,
    ...managerNavItems,
    ...(isAdmin() ? adminNavItems : [])
  ].filter(item => !item.permission || hasPermission(item.permission));

  return (
    <div 
      className={`${collapsed ? 'w-16' : 'w-64'} bg-gradient-to-b from-slate-900 via-blue-900 to-blue-800 text-white flex flex-col transition-all duration-300 ease-in-out z-20 fixed md:relative h-screen shadow-xl`}
    >
      <div className="flex items-center p-4 border-b border-blue-700/50">
        {!collapsed && (
          <div className="flex items-center">
            <div className="bg-blue-500 p-2 rounded-lg mr-3">
              <Workflow className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
              WorkFlow Pro
            </h1>
          </div>
        )}
        {collapsed && (
          <div className="bg-blue-500 p-2 rounded-lg mx-auto">
            <Workflow className="h-6 w-6 text-white" />
          </div>
        )}
        <button 
          className="ml-auto text-blue-200 hover:bg-blue-700/50 p-1 rounded-full transition-colors"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      
      <nav className="flex-1 py-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.path} className="mb-1">
              <Link
                to={item.path}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium
                  transition-colors duration-200
                  rounded-lg mx-2 mb-1
                  ${isActive(item.path) 
                    ? 'bg-blue-600/80 text-white shadow-lg' 
                    : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'}
                `}
              >
                <span className={`${collapsed ? 'mx-auto' : 'mr-3'}`}>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;