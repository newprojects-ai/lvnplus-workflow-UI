import { WorkflowDefinition } from '../types';
import { supabase } from '../repositories/supabase/SupabaseClient';

class WorkflowService {
  async getWorkflows(): Promise<WorkflowDefinition[]> {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select(`
          *,
          steps:workflow_steps(*),
          transitions:workflow_transitions(*),
          variables:workflow_variables(*),
          error_handlers:workflow_error_handlers(*),
          created_by:users(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching workflows:', error);
        throw new Error(`Failed to fetch workflows: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      return data.map(this.mapToWorkflowDefinition);
    } catch (error) {
      console.error('Error in getWorkflows:', error);
      throw new Error('Failed to fetch workflows. Please check your connection and try again.');
    }
  }

  async getWorkflowById(id: string): Promise<WorkflowDefinition | null> {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select(`
          *,
          steps:workflow_steps(*),
          transitions:workflow_transitions(*),
          variables:workflow_variables(*),
          error_handlers:workflow_error_handlers(*),
          created_by:users(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error fetching workflow:', error);
        throw new Error(`Failed to fetch workflow: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      return this.mapToWorkflowDefinition(data);
    } catch (error) {
      console.error('Error in getWorkflowById:', error);
      throw new Error('Failed to fetch workflow. Please check your connection and try again.');
    }
  }

  async createWorkflow(workflow: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowDefinition> {
    try {
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
        throw new Error(`Failed to create workflow: ${workflowError?.message}`);
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
          throw new Error(`Failed to create workflow steps: ${stepsError.message}`);
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
          throw new Error(`Failed to create workflow transitions: ${transitionsError.message}`);
        }
      }

      // Return the complete workflow
      const newWorkflow = await this.getWorkflowById(workflowData.id);
      if (!newWorkflow) {
        throw new Error('Failed to retrieve created workflow');
      }
      return newWorkflow;
    } catch (error) {
      console.error('Error in createWorkflow:', error);
      throw new Error('Failed to create workflow. Please check your connection and try again.');
    }
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
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
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