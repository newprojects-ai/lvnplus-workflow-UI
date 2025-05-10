import { WorkflowDefinition } from '../types';
import { supabase } from '../repositories/supabase/SupabaseClient';

class WorkflowService {
  async getWorkflows(): Promise<WorkflowDefinition[]> {
    const { data, error } = await supabase
      .from('workflows')
      .select(`
        *,
        steps:workflow_steps(*),
        transitions:workflow_transitions(*),
        variables:workflow_variables(*),
        error_handlers:workflow_error_handlers(*)
      `)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching workflows:', error);
      throw error;
    }

    return data.map(this.mapToWorkflowDefinition);
  }

  async getWorkflowById(id: string): Promise<WorkflowDefinition | null> {
    const { data, error } = await supabase
      .from('workflows')
      .select(`
        *,
        steps:workflow_steps(*),
        transitions:workflow_transitions(*),
        variables:workflow_variables(*),
        error_handlers:workflow_error_handlers(*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching workflow:', error);
      return null;
    }

    return this.mapToWorkflowDefinition(data);
  }

  async createWorkflow(workflow: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowDefinition> {
    // First create the workflow
    const { data: workflowData, error: workflowError } = await supabase
      .from('workflows')
      .insert({
        name: workflow.name,
        description: workflow.description,
        version: workflow.version,
        status: workflow.status,
        created_by: workflow.createdBy
      })
      .select()
      .single();

    if (workflowError || !workflowData) {
      console.error('Error creating workflow:', workflowError);
      throw workflowError;
    }

    // Then create steps
    if (workflow.steps.length > 0) {
      const { error: stepsError } = await supabase
        .from('workflow_steps')
        .insert(
          workflow.steps.map(step => ({
            workflow_id: workflowData.id,
            name: step.name,
            type: step.type,
            position: step.position,
            config: step.config
          }))
        );

      if (stepsError) {
        console.error('Error creating steps:', stepsError);
        throw stepsError;
      }
    }

    // Finally create transitions
    if (workflow.transitions.length > 0) {
      const { error: transitionsError } = await supabase
        .from('workflow_transitions')
        .insert(
          workflow.transitions.map(transition => ({
            workflow_id: workflowData.id,
            from_step_id: transition.from,
            to_step_id: transition.to,
            condition: transition.condition
          }))
        );

      if (transitionsError) {
        console.error('Error creating transitions:', transitionsError);
        throw transitionsError;
      }
    }

    // Return the complete workflow
    return this.getWorkflowById(workflowData.id) as Promise<WorkflowDefinition>;
  }

  private mapToWorkflowDefinition(data: any): WorkflowDefinition {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      version: data.version,
      status: data.status,
      steps: data.steps?.map(this.mapStep) || [],
      transitions: data.transitions?.map(this.mapTransition) || [],
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      createdBy: data.created_by
    };
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

const workflowService = new WorkflowService();
export default workflowService;