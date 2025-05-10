import { supabase } from './SupabaseClient';
import { BaseRepository } from '../base/BaseRepository';
import { IWorkflowRepository } from '../interfaces/IWorkflowRepository';
import { WorkflowDefinition } from '../../types';

export class SupabaseWorkflowRepository extends BaseRepository<WorkflowDefinition> implements IWorkflowRepository {
  constructor() {
    super(supabase, 'workflows');
  }

  async getAll(): Promise<WorkflowDefinition[]> {
    const { data, error } = await this.supabase
      .from('workflows')
      .select(`
        *,
        steps:workflow_steps(*),
        transitions:workflow_transitions(*)
      `)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return this.mapToWorkflowDefinitions(data);
  }

  async getById(id: string): Promise<WorkflowDefinition | null> {
    const { data, error } = await this.supabase
      .from('workflows')
      .select(`
        *,
        steps:workflow_steps(*),
        transitions:workflow_transitions(*)
      `)
      .eq('id', id)
      .single();

    if (error) return null;
    return this.mapToWorkflowDefinition(data);
  }

  async publish(id: string): Promise<WorkflowDefinition | null> {
    return this.update(id, { status: 'published' });
  }

  async archive(id: string): Promise<WorkflowDefinition | null> {
    return this.update(id, { status: 'archived' });
  }

  protected mapToModel(data: any): WorkflowDefinition {
    return this.mapToWorkflowDefinition(data);
  }

  protected mapFromModel(model: WorkflowDefinition): any {
    return {
      id: model.id,
      name: model.name,
      description: model.description,
      version: model.version,
      status: model.status,
      created_by: model.createdBy,
      createdAt: model.createdAt.toISOString(),
      updatedAt: model.updatedAt.toISOString()
    };
  }

  // ... implement other methods

  private mapToWorkflowDefinition(data: any): WorkflowDefinition {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      version: data.version,
      status: data.status,
      steps: data.steps.map(this.mapStep),
      transitions: data.transitions.map(this.mapTransition),
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      createdBy: data.created_by
    };
  }

  private mapToWorkflowDefinitions(data: any[]): WorkflowDefinition[] {
    return data.map(this.mapToWorkflowDefinition);
  }

  private mapStep(step: any) {
    return {
      id: step.id,
      name: step.name,
      type: step.type,
      position: step.position,
      config: step.config
    };
  }

  private mapTransition(transition: any) {
    return {
      id: transition.id,
      from: transition.from_step_id,
      to: transition.to_step_id,
      condition: transition.condition
    };
  }
}