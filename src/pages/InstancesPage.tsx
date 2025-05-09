import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import InstanceList from '../components/instances/InstanceList';
import { WorkflowInstance, WorkflowDefinition } from '../types';
import { instanceService, workflowService } from '../services';

const InstancesPage: React.FC = () => {
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [instancesData, workflowsData] = await Promise.all([
          instanceService.getInstances(),
          workflowService.getWorkflows()
        ]);
        
        setInstances(instancesData);
        setWorkflows(workflowsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load instances. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
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
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Workflow Instances</h1>
        <p className="text-gray-600 mt-1">
          Track and manage workflow executions
        </p>
      </div>
      
      <InstanceList instances={instances} workflows={workflows} />
    </Layout>
  );
};

export default InstancesPage;