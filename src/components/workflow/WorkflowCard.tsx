import React from 'react';
import { Link } from 'react-router-dom';
import { WorkflowDefinition } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import StatusIndicator from '../ui/StatusIndicator';
import { PlayCircle, Edit2, Copy, MoreVertical, Users, Clock } from 'lucide-react';

interface WorkflowCardProps {
  workflow: WorkflowDefinition;
  instanceCount?: number;
  lastExecuted?: Date;
  onExecute?: (workflowId: string) => void;
  onEdit?: (workflowId: string) => void;
  onClone?: (workflowId: string) => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  instanceCount = 0,
  lastExecuted,
  onExecute,
  onEdit,
  onClone
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'published':
        return { status: 'success' as const, label: 'Published' };
      case 'draft':
        return { status: 'warning' as const, label: 'Draft' };
      case 'archived':
        return { status: 'error' as const, label: 'Archived' };
      default:
        return { status: 'pending' as const, label: status };
    }
  };

  const statusConfig = getStatusConfig(workflow.status);

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link 
            to={`/workflows/${workflow.id}`}
            className="block hover:text-blue-600 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600">
              {workflow.name}
            </h3>
          </Link>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {workflow.description}
          </p>
          <StatusIndicator 
            status={statusConfig.status} 
            label={statusConfig.label}
            size="sm"
          />
        </div>
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-t border-gray-100">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{workflow.steps.length}</div>
          <div className="text-xs text-gray-500">Steps</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{instanceCount}</div>
          <div className="text-xs text-gray-500">Instances</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">v{workflow.version}</div>
          <div className="text-xs text-gray-500">Version</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div className="flex items-center">
          <Users className="h-3 w-3 mr-1" />
          <span>Created {formatDate(workflow.createdAt)}</span>
        </div>
        {lastExecuted && (
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>Last run {formatDate(lastExecuted)}</span>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        {workflow.status === 'published' && (
          <Button 
            variant="primary" 
            size="sm" 
            className="flex-1"
            onClick={() => onExecute?.(workflow.id)}
          >
            <PlayCircle className="h-4 w-4 mr-1" />
            Execute
          </Button>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => onEdit?.(workflow.id)}
        >
          <Edit2 className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onClone?.(workflow.id)}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default WorkflowCard;