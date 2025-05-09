import { WorkflowDefinition } from '../types';
import { getWorkflowRepository } from '../config/database';

class WorkflowService {
  private repository = getWorkflowRepository();

  getWorkflows(): Promise<WorkflowDefinition[]> {
    return this.repository.getAll();
  }

  getWorkflowById(id: string): Promise<WorkflowDefinition | undefined> {
    return this.repository.getById(id);
  }

  createWorkflow(workflow: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowDefinition> {
    return this.repository.create(workflow);
  }

  updateWorkflow(id: string, workflow: Partial<WorkflowDefinition>): Promise<WorkflowDefinition | null> {
    return this.repository.update(id, workflow);
  }

  deleteWorkflow(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }

  publishWorkflow(id: string): Promise<WorkflowDefinition | null> {
    return this.repository.publish(id);
  }

  archiveWorkflow(id: string): Promise<WorkflowDefinition | null> {
    return this.repository.archive(id);
  }
}

// Create a singleton instance
const workflowService = new WorkflowService();