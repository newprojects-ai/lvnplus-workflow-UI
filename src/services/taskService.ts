import { Task } from '../types';
import { mockTasks, generateId } from '../mockData';
import instanceService from './instanceService';

class TaskService {
  private tasks: Task[] = [...mockTasks];

  getTasks(): Promise<Task[]> {
    return Promise.resolve([...this.tasks]);
  }

  getTaskById(id: string): Promise<Task | undefined> {
    return Promise.resolve(this.tasks.find(t => t.id === id));
  }

  getTasksByInstanceId(instanceId: string): Promise<Task[]> {
    return Promise.resolve(this.tasks.filter(t => t.instanceId === instanceId));
  }

  getTasksByUserId(userId: string): Promise<Task[]> {
    return Promise.resolve(this.tasks.filter(t => t.assignedTo === userId));
  }

  getPendingTasksByUserId(userId: string): Promise<Task[]> {
    return Promise.resolve(
      this.tasks.filter(t => t.assignedTo === userId && t.status === 'pending')
    );
  }

  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    const newTask = {
      ...task,
      id: `task-${generateId()}`
    };
    
    this.tasks.push(newTask);
    return Promise.resolve(newTask);
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    const updatedTask = {
      ...this.tasks[index],
      ...updates
    };
    
    this.tasks[index] = updatedTask;
    return Promise.resolve(updatedTask);
  }

  async completeTask(id: string, data?: Record<string, any>, userId?: string, comments?: string): Promise<Task | null> {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return null;
    
    // Update the task
    task.status = 'completed';
    
    // If this task is associated with a workflow instance, advance the instance
    if (task.instanceId && data) {
      await instanceService.advanceInstance(task.instanceId, data, userId, comments);
    }
    
    return Promise.resolve(task);
  }

  async reassignTask(id: string, newAssigneeId: string): Promise<Task | null> {
    return this.updateTask(id, { assignedTo: newAssigneeId });
  }

  async updatePriority(id: string, priority: 'low' | 'normal' | 'high'): Promise<Task | null> {
    return this.updateTask(id, { priority });
  }

  async deleteTask(id: string): Promise<boolean> {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(t => t.id !== id);
    return Promise.resolve(this.tasks.length < initialLength);
  }
}

const taskService = new TaskService();
export default taskService;