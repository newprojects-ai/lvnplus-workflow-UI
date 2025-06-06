import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import MetricsCard from '../components/dashboard/MetricsCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ActivityList from '../components/dashboard/ActivityList';
import TaskSummary from '../components/dashboard/TaskSummary';
import QuickActions from '../components/dashboard/QuickActions';
import { LayoutDashboard, Workflow, Check, PlayCircle, TrendingUp } from 'lucide-react';
import { DashboardStats, Activity, Task, User } from '../types';
import { reportService, taskService, userService } from '../services';
import { useUser } from '../context/UserContext';
import { useRBAC } from '../hooks/useRBAC';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import ManagerDashboard from '../components/dashboard/ManagerDashboard';

const Dashboard: React.FC = () => {
  const { currentUser } = useUser();
  const { isAdmin, hasRole } = useRBAC();
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
        <LoadingSpinner size="lg\" className="h-64" />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back{currentUser ? `, ${currentUser.name}` : ''}!
        </h1>
        <p className="text-blue-100">
          Here's what's happening with your workflows today
        </p>
      </div>
      
      {/* Role-specific dashboards */}
      {isAdmin() && <AdminDashboard />}
      {!isAdmin() && hasRole('manager') && (
        <ManagerDashboard
          stats={{
            activeWorkflows: stats?.activeInstances || 0,
            pendingTasks: stats?.pendingTasks || 0,
            activeUsers: users.length,
            overdueTasks: tasks.filter(t => 
              t.status === 'pending' && t.dueDate && new Date(t.dueDate) < new Date()
            ).length
          }}
        />
      )}
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Total Workflows"
            value={stats.totalWorkflows}
            icon={Workflow}
            color="blue"
            trend={{ value: 8, direction: 'up', period: 'vs last month' }}
          />
          <MetricsCard
            title="Active Instances"
            value={stats.activeInstances}
            icon={PlayCircle}
            color="green"
            trend={{ value: 12, direction: 'up', period: 'vs last week' }}
          />
          <MetricsCard
            title="Completed Instances"
            value={stats.completedInstances}
            icon={TrendingUp}
            color="purple"
            trend={{ value: 5, direction: 'up', period: 'vs last week' }}
          />
          <MetricsCard
            title="Pending Tasks"
            value={stats.pendingTasks}
            icon={Check}
            color="red"
            trend={{ value: 2, direction: 'down', period: 'vs yesterday' }}
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