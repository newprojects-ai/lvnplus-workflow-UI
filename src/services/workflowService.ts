import { WorkflowDefinition } from '../types';
import { mockWorkflows, generateId } from '../mockData';

class WorkflowService {
  private workflows: WorkflowDefinition[] = [...mockWorkflows];

  getWorkflows(): Promise<WorkflowDefinition[]> {
    return Promise.resolve([...this.workflows]);
  }

  getWorkflowById(id: string): Promise<WorkflowDefinition | undefined> {
    return Promise.resolve(this.workflows.find(w => w.id === id));
  }

  createWorkflow(workflow: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowDefinition> {
    const newWorkflow = {
      ...workflow,
      id: `workflow-${generateId()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    } as WorkflowDefinition;
    
    this.workflows.push(newWorkflow);
    return Promise.resolve(newWorkflow);
  }

  updateWorkflow(id: string, workflow: Partial<WorkflowDefinition>): Promise<WorkflowDefinition | null> {
    const index = this.workflows.findIndex(w => w.id === id);
    if (index === -1) return Promise.resolve(null);
    
    const updatedWorkflow = {
      ...this.workflows[index],
      ...workflow,
      updatedAt: new Date()
    };
    
    this.workflows[index] = updatedWorkflow;
    return Promise.resolve(updatedWorkflow);
  }

  deleteWorkflow(id: string): Promise<boolean> {
    const initialLength = this.workflows.length;
    this.workflows = this.workflows.filter(w => w.id !== id);
    return Promise.resolve(this.workflows.length < initialLength);
  }

  publishWorkflow(id: string): Promise<WorkflowDefinition | null> {
    return this.updateWorkflow(id, { status: 'published' });
  }

  archiveWorkflow(id: string): Promise<WorkflowDefinition | null> {
    return this.updateWorkflow(id, { status: 'archived' });
  }
}

// Create a singleton instance
const workflowService = new WorkflowService();
export default workflowService;