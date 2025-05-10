import React from 'react';
import { Link } from 'react-router-dom';
import { useRBAC } from '../../hooks/useRBAC';
import { Plus, PlayCircle, CheckCircle, FilePlus } from 'lucide-react';

const QuickActions: React.FC = () => {
  const { hasPermission } = useRBAC();

  const actions = [
    {
      title: 'Create Workflow',
      description: 'Design a new workflow process',
      icon: <Plus className="h-6 w-6" />,
      color: 'bg-blue-500',
      link: '/workflows/new',
      permission: 'workflow:create'
    },
    {
      title: 'Start Process',
      description: 'Execute an existing workflow',
      icon: <PlayCircle className="h-6 w-6" />,
      color: 'bg-green-500',
      link: '/instances/new',
      permission: 'workflow:execute'
    },
    {
      title: 'Complete Tasks',
      description: 'View and complete assigned tasks',
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'bg-purple-500',
      link: '/tasks',
      permission: 'task:read'
    },
    {
      title: 'Generate Report',
      description: 'Create custom reports',
      icon: <FilePlus className="h-6 w-6" />,
      color: 'bg-amber-500',
      link: '/reports',
      permission: 'workflow:read'
    }
  ].filter(action => hasPermission(action.permission));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <Link 
          key={index} 
          to={action.link}
          className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col items-center text-center"
        >
          <div className={`${action.color} text-white p-3 rounded-full mb-3`}>
            {action.icon}
          </div>
          <h3 className="font-medium text-gray-900">{action.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{action.description}</p>
        </Link>
      ))}
    </div>
  );
};

export default QuickActions;