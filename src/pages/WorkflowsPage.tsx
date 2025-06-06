import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import WorkflowGrid from '../components/workflow/WorkflowGrid';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { WorkflowDefinition } from '../types';
import { workflowService } from '../services';
import { useRBAC } from '../hooks/useRBAC';
import { checkSupabaseConnection } from '../repositories/supabase/SupabaseClient';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';

const WorkflowsPage: React.FC = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { hasPermission } = useRBAC();

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First check if we can connect to Supabase
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          throw new Error('Unable to connect to the database. Please check your connection and try again.');
        }

        const data = await workflowService.getWorkflows();
        setWorkflows(data);
      } catch (err) {
        console.error('Error fetching workflows:', err);
        setError(err instanceof Error ? err.message : 'Failed to load workflows. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleExecute = (workflowId: string) => {
    navigate(`/instances/new?workflowId=${workflowId}`);
  };

  const handleEdit = (workflowId: string) => {
    navigate(`/workflows/${workflowId}/edit`);
  };

  const handleClone = (workflowId: string) => {
    // TODO: Implement workflow cloning
    console.log('Clone workflow:', workflowId);
  };

  const handleCreateNew = () => {
    navigate('/workflows/new');
  };

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner size="lg" className="h-64" />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md mx-auto">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requiredPermissions={['workflow:read']}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
          <p className="text-gray-600 mt-2">
            Design, manage, and execute automated business processes
          </p>
        </div>
        {hasPermission('workflow:create') && (
          <Button onClick={handleCreateNew} className="mt-4 sm:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-gray-400" />
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
          </div>
        </div>
      </div>

      <WorkflowGrid 
        workflows={filteredWorkflows}
        onExecute={handleExecute}
        onEdit={handleEdit}
        onClone={handleClone}
        onCreateNew={handleCreateNew}
      />
    </Layout>
  );
};

export default WorkflowsPage;