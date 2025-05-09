import React, { useState } from 'react';
import { WorkflowDefinition } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { PlusCircle, Edit2, PlayCircle, Archive, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WorkflowListProps {
  workflows: WorkflowDefinition[];
}

const WorkflowList: React.FC<WorkflowListProps> = ({ workflows }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  const getStatusBadgeVariant = (status: string): "default" | "success" | "warning" | "danger" | "info" | "outline" => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'outline';
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
            placeholder="Search workflows..."
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
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          
          <Link to="/workflows/new">
            <Button size="md">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Workflow
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkflows.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No workflows found matching your criteria</p>
          </div>
        ) : (
          filteredWorkflows.map(workflow => (
            <Card 
              key={workflow.id}
              hoverable
              className="flex flex-col"
              onClick={() => navigate(`/workflows/${workflow.id}`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg text-gray-900">{workflow.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{workflow.description}</p>
                </div>
                <Badge 
                  label={workflow.status} 
                  variant={getStatusBadgeVariant(workflow.status)}
                />
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Version</span>
                  <span className="font-medium">{workflow.version}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Updated</span>
                  <span>{formatDate(workflow.updatedAt)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Steps</span>
                  <span>{workflow.steps.length}</span>
                </div>
              </div>
              
              <div className="flex justify-between mt-auto pt-4 border-t border-gray-100">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/workflows/${workflow.id}/edit`);
                  }}
                >
                  <Edit2 className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                
                {workflow.status === 'published' && (
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/instances/new?workflowId=${workflow.id}`);
                    }}
                  >
                    <PlayCircle className="mr-1 h-3 w-3" />
                    Start
                  </Button>
                )}
                
                {workflow.status === 'draft' && (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Publish
                  </Button>
                )}
                
                {workflow.status === 'published' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Archive className="mr-1 h-3 w-3" />
                    Archive
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkflowList;