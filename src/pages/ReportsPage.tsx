import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import { BarChart3, Users, Clock, TrendingUp } from 'lucide-react';
import { reportService, workflowService } from '../services';
import { WorkflowDefinition } from '../types';

const ReportsPage: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('week');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const workflowsData = await workflowService.getWorkflows();
        setWorkflows(workflowsData);
      } catch (error) {
        console.error('Error fetching workflows:', error);
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

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">View workflow performance metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="flex items-start p-6">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Total Executions</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">1,234</p>
            <p className="mt-2 text-sm text-green-600">↑ 12% from last month</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
        </Card>

        <Card className="flex items-start p-6">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Active Users</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">56</p>
            <p className="mt-2 text-sm text-green-600">↑ 8% from last month</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <Users className="h-6 w-6 text-green-600" />
          </div>
        </Card>

        <Card className="flex items-start p-6">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Avg. Completion Time</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">2.5h</p>
            <p className="mt-2 text-sm text-red-600">↓ 5% from last month</p>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
        </Card>

        <Card className="flex items-start p-6">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Success Rate</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">94%</p>
            <p className="mt-2 text-sm text-green-600">↑ 3% from last month</p>
          </div>
          <div className="bg-amber-100 p-3 rounded-full">
            <TrendingUp className="h-6 w-6 text-amber-600" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Workflow Performance</h2>
            <select
              value={selectedWorkflow}
              onChange={(e) => setSelectedWorkflow(e.target.value)}
              className="rounded-md border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Workflows</option>
              {workflows.map(workflow => (
                <option key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </option>
              ))}
            </select>
          </div>
          <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart will be implemented here</p>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Execution Trends</h2>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="rounded-md border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last 12 Months</option>
            </select>
          </div>
          <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart will be implemented here</p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ReportsPage