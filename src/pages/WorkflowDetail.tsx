import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import WorkflowVisualizer from '../components/workflow/WorkflowVisualizer';
import { WorkflowDefinition, WorkflowInstance } from '../types';
import { workflowService, instanceService } from '../services';
import { PlayCircle, Edit2, Copy, Archive, BarChart3 } from 'lucide-react';

const WorkflowDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const [workflowData, instancesData] = await Promise.all([
          workflowService.getWorkflowById(id),
          instanceService.getInstancesByWorkflowId(id)
        ]);
        
        if (!workflowData) {
          setError('Workflow not found');
          return;
        }
        
        setWorkflow(workflowData);
        setInstances(instancesData);
      } catch (err) {
        console.error('Error fetching workflow data:', err);
        setError('Failed to load workflow. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !workflow) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md mx-auto">
            <p className="text-red-600">{error || 'Workflow not found'}</p>
            <Link to="/workflows">
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Back to Workflows
              </button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-wrap justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{workflow.name}</h1>
          <div className="flex items-center mt-1">
            <Badge 
              label={workflow.status} 
              variant={getStatusBadgeVariant(workflow.status)}
            />
            <span className="text-gray-600 ml-3">Version {workflow.version}</span>
            <span className="text-gray-600 ml-3">Updated {formatDate(workflow.updatedAt)}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          {workflow.status === 'published' && (
            <Link to={`/instances/new?workflowId=${workflow.id}`}>
              <Button>
                <PlayCircle className="mr-2 h-4 w-4" />
                Start New Instance
              </Button>
            </Link>
          )}
          
          <Link to={`/workflows/${workflow.id}/edit`}>
            <Button variant="outline">
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          
          <Button variant="ghost">
            <Copy className="mr-2 h-4 w-4" />
            Clone
          </Button>
          
          {workflow.status !== 'archived' && (
            <Button variant="ghost">
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Workflow Definition</h2>
            <div className="text-gray-600 mb-6">
              <p>{workflow.description}</p>
            </div>
            
            <h3 className="font-medium text-gray-900 mb-2">Visual Representation</h3>
            <WorkflowVisualizer workflow={workflow} isInteractive />
          </Card>
          
          <Card title="Recent Instances">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Step</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {instances.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500">
                        No instances found for this workflow
                      </td>
                    </tr>
                  ) : (
                    instances.slice(0, 5).map(instance => {
                      const currentStep = workflow.steps.find(s => s.id === instance.currentStepId);
                      
                      return (
                        <tr key={instance.id}>
                          <td className="px-4 py-3 text-sm text-blue-600 hover:underline">
                            <Link to={`/instances/${instance.id}`}>
                              {instance.id}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <Badge 
                              label={instance.status} 
                              variant={instance.status === 'active' ? 'info' : instance.status === 'completed' ? 'success' : 'danger'}
                              size="sm"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {currentStep?.name || 'Unknown'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(instance.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Link to={`/instances/${instance.id}`}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              
              {instances.length > 5 && (
                <div className="flex justify-center mt-4">
                  <Link to={`/instances?workflowId=${workflow.id}`}>
                    <Button variant="ghost" size="sm">
                      View all instances
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Workflow Details</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Steps</h3>
                <p className="mt-1 text-lg font-medium">{workflow.steps.length}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Transitions</h3>
                <p className="mt-1 text-lg font-medium">{workflow.transitions.length}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created By</h3>
                <p className="mt-1 text-lg font-medium">User ID: {workflow.createdBy}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created Date</h3>
                <p className="mt-1">{formatDate(workflow.createdAt)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                <p className="mt-1">{formatDate(workflow.updatedAt)}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Statistics</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Instances</h3>
                <p className="mt-1 text-lg font-medium">{instances.length}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Active Instances</h3>
                <p className="mt-1 text-lg font-medium">
                  {instances.filter(i => i.status === 'active').length}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Completed Instances</h3>
                <p className="mt-1 text-lg font-medium">
                  {instances.filter(i => i.status === 'completed').length}
                </p>
              </div>
              
              <div className="pt-4 text-center">
                <Link to={`/reports/workflow/${workflow.id}`}>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Detailed Analytics
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default WorkflowDetail;