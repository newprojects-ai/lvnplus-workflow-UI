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
    const instance = this.instances.find(i => i.id === instanceId);
    if (!instance) return null;
    
    const workflow = await workflowService.getWorkflowById(instance.definitionId);
    if (!workflow) return null;
    
    const currentStep = workflow.steps.find(s => s.id === instance.currentStepId);
    if (!currentStep) return null;
    
    // Update history for current step
    const currentHistoryEntry = instance.history.find(h => h.stepId === currentStep.id && !h.exitedAt);
    if (currentHistoryEntry) {
      currentHistoryEntry.exitedAt = new Date();
      currentHistoryEntry.data = data;
      currentHistoryEntry.user = userId;
      currentHistoryEntry.comments = comments;
    }
    
    // Find the next transition
    const transitions = workflow.transitions.filter(t => t.from === currentStep.id);
    
    // If no transitions, this must be an end step
    if (transitions.length === 0) {
      if (currentStep.type === 'end') {
        // Mark instance as completed
        instance.status = 'completed';
        instance.updatedAt = new Date();
        return Promise.resolve(instance);
      }
      return null;
    }
    
    // For decision steps, evaluate the condition (simplified)
    let nextTransition = transitions[0];
    if (currentStep.type === 'decision' && transitions.length > 1) {
      // Find the first transition where the condition is true
      // In real implementation, this would involve a proper condition evaluation engine
      nextTransition = transitions.find(t => {
        if (!t.condition) return false;
        
        try {
          // Very simplified condition evaluation
          // In real implementation, this would be much more robust
          const conditionParts = t.condition.split(' === ');
          const leftSide = conditionParts[0].trim();
          const rightSide = conditionParts[1].trim().replace(/"/g, '').replace(/'/g, '');
          return data[leftSide] === rightSide;
        } catch (e) {
          return false;
        }
      }) || transitions[0];
    }
    
    const nextStep = workflow.steps.find(s => s.id === nextTransition.to);
    if (!nextStep) return null;
    
    // Create history entry for next step
    const nextStepHistoryEntry: HistoryEntry = {
      stepId: nextStep.id,
      stepName: nextStep.name,
      enteredAt: new Date()
    };
    
    instance.history.push(nextStepHistoryEntry);
    instance.currentStepId = nextStep.id;
    instance.data = { ...instance.data, ...data };
    instance.updatedAt = new Date();
    
    // If next step is end, mark instance as completed
    if (nextStep.type === 'end') {
      instance.status = 'completed';
    }
    
    return Promise.resolve(instance);
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