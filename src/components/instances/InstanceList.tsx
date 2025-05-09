import React, { useState } from 'react';
import { WorkflowInstance, WorkflowDefinition } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Search, PlayCircle, Eye, XCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InstanceListProps {
  instances: WorkflowInstance[];
  workflows: WorkflowDefinition[];
}

const InstanceList: React.FC<InstanceListProps> = ({ instances, workflows }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getWorkflowName = (workflowId: string): string => {
    const workflow = workflows.find(w => w.id === workflowId);
    return workflow ? workflow.name : 'Unknown Workflow';
  };

  const getWorkflowStepName = (workflowId: string, stepId: string): string => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return 'Unknown Step';
    
    const step = workflow.steps.find(s => s.id === stepId);
    return step ? step.name : 'Unknown Step';
  };

  const filteredInstances = instances.filter(instance => {
    const workflowName = getWorkflowName(instance.definitionId).toLowerCase();
    
    const matchesSearch = workflowName.includes(searchTerm.toLowerCase()) || 
                          instance.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || instance.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getStatusBadgeVariant = (status: string): "default" | "success" | "warning" | "danger" | "info" | "outline" => {
    switch (status) {
      case 'active': return 'info';
      case 'completed': return 'success';
      case 'terminated': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center mb-6">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search instances..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="terminated">Terminated</option>
          </select>
          
          <Link to="/instances/new">
            <Button size="md">
              <PlayCircle className="mr-2 h-4 w-4" />
              New Instance
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Instance ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Workflow
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Step
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInstances.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No instances found matching your criteria
                </td>
              </tr>
            ) : (
              filteredInstances.map(instance => (
                <tr key={instance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {instance.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {getWorkflowName(instance.definitionId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {getWorkflowStepName(instance.definitionId, instance.currentStepId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      label={instance.status} 
                      variant={getStatusBadgeVariant(instance.status)}
                      size="sm"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(instance.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(instance.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link to={`/instances/${instance.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </Link>
                      
                      {instance.status === 'active' && (
                        <>
                          <Link to={`/instances/${instance.id}/execute`}>
                            <Button variant="primary" size="sm">
                              <PlayCircle className="h-3 w-3" />
                            </Button>
                          </Link>
                          
                          <Button variant="danger" size="sm">
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstanceList;