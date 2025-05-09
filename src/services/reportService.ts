import { 
  WorkflowDefinition, 
  WorkflowInstance, 
  Task, 
  DashboardStats, 
  Activity 
} from '../types';
import { mockActivities, mockDashboardStats, getRecentActivities } from '../mockData';
import workflowService from './workflowService';
import instanceService from './instanceService';
import taskService from './taskService';

class ReportService {
  private activities: Activity[] = [...mockActivities];

  async getDashboardStats(): Promise<DashboardStats> {
    // In a real implementation, this would query the actual data
    // For this mock, we'll use the provided stats
    return Promise.resolve({ ...mockDashboardStats });
  }

  async getRecentActivities(limit = 5): Promise<Activity[]> {
    return Promise.resolve(getRecentActivities(limit));
  }

  async getWorkflowStats(workflowId: string): Promise<any> {
    const workflow = await workflowService.getWorkflowById(workflowId);
    if (!workflow) return null;
    
    const instances = await instanceService.getInstancesByWorkflowId(workflowId);
    
    const activeCount = instances.filter(i => i.status === 'active').length;
    const completedCount = instances.filter(i => i.status === 'completed').length;
    const terminatedCount = instances.filter(i => i.status === 'terminated').length;
    
    // Calculate average completion time for completed instances
    let totalCompletionTime = 0;
    let completedInstances = 0;
    
    for (const instance of instances) {
      if (instance.status === 'completed') {
        const startTime = instance.createdAt.getTime();
        const endTime = instance.updatedAt.getTime();
        totalCompletionTime += (endTime - startTime);
        completedInstances++;
      }
    }
    
    const avgCompletionTime = completedInstances > 0 
      ? totalCompletionTime / completedInstances 
      : 0;
    
    // Calculate step statistics
    const stepStats = workflow.steps.map(step => {
      const stepsInHistory = instances.flatMap(i => 
        i.history.filter(h => h.stepId === step.id)
      );
      
      const completedSteps = stepsInHistory.filter(s => s.exitedAt);
      let avgTimeInStep = 0;
      
      if (completedSteps.length > 0) {
        const totalTime = completedSteps.reduce((sum, s) => {
          return sum + (s.exitedAt!.getTime() - s.enteredAt.getTime());
        }, 0);
        avgTimeInStep = totalTime / completedSteps.length;
      }
      
      return {
        stepId: step.id,
        stepName: step.name,
        count: stepsInHistory.length,
        avgTimeInStep: avgTimeInStep // in milliseconds
      };
    });
    
    return {
      workflowId,
      workflowName: workflow.name,
      totalInstances: instances.length,
      activeCount,
      completedCount,
      terminatedCount,
      avgCompletionTime, // in milliseconds
      stepStats
    };
  }

  async getUserPerformanceStats(userId: string): Promise<any> {
    const tasks = await taskService.getTasksByUserId(userId);
    
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    
    // Group by priority
    const tasksByPriority = {
      high: tasks.filter(t => t.priority === 'high').length,
      normal: tasks.filter(t => t.priority === 'normal').length,
      low: tasks.filter(t => t.priority === 'low').length
    };
    
    // Calculate average completion time
    let totalCompletionTime = 0;
    let taskCount = 0;
    
    // Note: In a real implementation, you'd need to have task creation and completion timestamps
    // For this mock, we'll use a random value
    const avgCompletionTime = Math.floor(Math.random() * 86400000); // Random value up to 24 hours
    
    return {
      userId,
      totalTasks: tasks.length,
      completedCount: completedTasks.length,
      pendingCount: pendingTasks.length,
      tasksByPriority,
      avgCompletionTime // in milliseconds
    };
  }

  logActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity> {
    const newActivity = {
      ...activity,
      id: `activity-${Date.now()}`,
      timestamp: new Date()
    };
    
    this.activities.push(newActivity);
    return Promise.resolve(newActivity);
  }
}

const reportService = new ReportService();
export default reportService;