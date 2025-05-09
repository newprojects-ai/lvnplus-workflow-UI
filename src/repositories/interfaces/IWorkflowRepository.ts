import { WorkflowDefinition } from '../../types';

export interface IWorkflowRepository {
  getAll(): Promise<WorkflowDefinition[]>;
  getById(id: string): Promise<WorkflowDefinition | null>;
  create(workflow: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowDefinition>;
  update(id: string, workflow: Partial<WorkflowDefinition>): Promise<WorkflowDefinition | null>;
  delete(id: string): Promise<boolean>;
  publish(id: string): Promise<WorkflowDefinition | null>;
  archive(id: string): Promise<WorkflowDefinition | null>;
}