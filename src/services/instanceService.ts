import { WorkflowInstance, HistoryEntry } from '../types';
import { mockInstances, generateId } from '../mockData';
import workflowService from './workflowService';

class InstanceService {
  private instances: WorkflowInstance[] = [...mockInstances];

  getInstances(): Promise<WorkflowInstance[]> {
    return Promise.resolve([...this.instances]);
  }

  getInstanceById(id: string): Promise<WorkflowInstance | undefined> {
    return Promise.resolve(this.instances.find(i => i.id === id));
  }

  getInstancesByWorkflowId(workflowId: string): Promise<WorkflowInstance[]> {
    return Promise.resolve(this.instances.filter(i => i.definitionId === workflowId));
  }

  async createInstance(workflowId: string, initialData: Record<string, any> = {}): Promise<WorkflowInstance | null> {
    const workflow = await workflowService.getWorkflowById(workflowId);
    if (!workflow) return null;
    
    const startStep = workflow.steps.find(step => step.type === 'start');
    if (!startStep) return null;
    
    const now = new Date();
    const historyEntry: HistoryEntry = {
      stepId: startStep.id,
      stepName: startStep.name,
      enteredAt: now
    };
    
    // Find the first step after start step
    const firstTransition = workflow.transitions.find(t => t.from === startStep.id);
    if (!firstTransition) return null;
    
    const firstStepId = firstTransition.to;
    const firstStep = workflow.steps.find(step => step.id === firstStepId);
    if (!firstStep) return null;
    
    // Create history entry for first step
    const firstStepHistoryEntry: HistoryEntry = {
      stepId: firstStep.id,
      stepName: firstStep.name,
      enteredAt: new Date(now.getTime() + 1000) // 1 second after start
    };
    
    const newInstance: WorkflowInstance = {
      id: `instance-${generateId()}`,
      definitionId: workflowId,
      status: 'active',
      currentStepId: firstStep.id,
      data: initialData,
      history: [
        historyEntry,
        firstStepHistoryEntry
      ],
      createdAt: now,
      updatedAt: now
    };
    
    this.instances.push(newInstance);
    return Promise.resolve(newInstance);
  }

  async advanceInstance(instanceId: string, data: Record<string, any> = {}, userId?: string, comments?: string): Promise<WorkflowInstance | null> {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/execute-workflow`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instanceId,
        data: {
          ...data,
          userId,
          comments
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to execute workflow step');
    }

    return response.json();
  }

  terminateInstance(instanceId: string, reason?: string): Promise<WorkflowInstance | null> {
    const instance = this.instances.find(i => i.id === instanceId);
    if (!instance) return Promise.resolve(null);
    
    instance.status = 'terminated';
    instance.updatedAt = new Date();
    
    // Add a comment to the current step's history
    const currentHistoryEntry = instance.history.find(h => 
      h.stepId === instance.currentStepId && !h.exitedAt
    );
    
    if (currentHistoryEntry) {
      currentHistoryEntry.exitedAt = new Date();
      currentHistoryEntry.comments = reason || 'Instance terminated';
    }
    
    return Promise.resolve(instance);
  }
}

const instanceService = new InstanceService();
export default instanceService;