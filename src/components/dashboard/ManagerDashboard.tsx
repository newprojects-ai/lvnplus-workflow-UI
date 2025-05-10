import React from 'react';
import { BarChart3, Users, Clock, AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

interface ManagerStats {
  activeWorkflows: number;
  pendingTasks: number;
  activeUsers: number;
  overdueTasks: number;
}

interface ManagerDashboardProps {
  stats: ManagerStats;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Management Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Active Workflows</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {stats.activeWorkflows}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {stats.pendingTasks}
              </p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {stats.activeUsers}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
              <p className="mt-2 text-3xl font-semibold text-red-600">
                {stats.overdueTasks}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">Task Management</h3>
              <p className="mt-1 text-sm text-gray-500">
                Monitor and manage workflow tasks
              </p>
              <div className="mt-4 space-y-2">
                <Link to="/tasks">
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    View All Tasks
                  </Button>
                </Link>
                <Link to="/tasks/overdue">
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    View Overdue Tasks
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">Reports</h3>
              <p className="mt-1 text-sm text-gray-500">
                View workflow and performance reports
              </p>
              <div className="mt-4 space-y-2">
                <Link to="/reports">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Performance Reports
                  </Button>
                </Link>
                <Link to="/reports/users">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    User Activity Reports
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;