import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import StatsCard from '../components/dashboard/StatsCard';
import ActivityList from '../components/dashboard/ActivityList';
import TaskSummary from '../components/dashboard/TaskSummary';
import QuickActions from '../components/dashboard/QuickActions';
import { LayoutDashboard, Workflow, Check, PlayCircle } from 'lucide-react';
import { DashboardStats, Activity, Task, User } from '../types';
import { reportService, taskService, userService } from '../services';
import { useUser } from '../context/UserContext';

const Dashboard: React.FC = () => {
  const { currentUser } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const dashboardStats = await reportService.getDashboardStats();
        const recentActivities = await reportService.getRecentActivities(5);
        const usersList = await userService.getUsers();
        
        setStats(dashboardStats);
        setActivities(recentActivities);
        setUsers(usersList);
        
        if (currentUser) {
          const userTasks = await taskService.getPendingTasksByUserId(currentUser.id);
          setTasks(userTasks);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentUser]);

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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back{currentUser ? `, ${currentUser.name}` : ''}!</p>
      </div>
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Workflows"
            value={stats.totalWorkflows}
            icon={<Workflow className="h-6 w-6" />}
            color="blue"
            permission="workflow:read"
          />
          <StatsCard
            title="Active Instances"
            value={stats.activeInstances}
            icon={<PlayCircle className="h-6 w-6" />}
            color="green"
            change={{ value: 12, type: 'increase' }}
            permission="workflow:execute"
          />
          <StatsCard
            title="Completed Instances"
            value={stats.completedInstances}
            icon={<Check className="h-6 w-6" />}
            color="purple"
            change={{ value: 5, type: 'increase' }}
            permission="workflow:execute"
          />
          <StatsCard
            title="Pending Tasks"
            value={stats.pendingTasks}
            icon={<LayoutDashboard className="h-6 w-6" />}
            color="red"
            change={{ value: 2, type: 'decrease' }}
            permission="task:read"
          />
        </div>
      )}
      
      <QuickActions />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <TaskSummary tasks={tasks} users={users} />
        </div>
        <div>
          <ActivityList activities={activities} users={users} />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;