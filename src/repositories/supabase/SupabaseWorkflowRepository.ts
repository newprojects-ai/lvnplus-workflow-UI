import { createClient } from '@supabase/supabase-js';
import { IWorkflowRepository } from '../interfaces/IWorkflowRepository';
import { WorkflowDefinition } from '../../types';

export class SupabaseWorkflowRepository implements IWorkflowRepository {
  private supabase;

  constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  async getAll(): Promise<WorkflowDefinition[]> {
    const { data, error } = await this.supabase
      .from('workflows')
      .select(`
        *,
        steps:workflow_steps(*),
        transitions:workflow_transitions(*)
      `)
      .order('created_at', { ascending: false });

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
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
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