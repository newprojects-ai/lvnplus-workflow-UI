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
          error_handlers:workflow_error_handlers(*)
        `)
        .order('createdAt', { ascending: false });

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
          error_handlers:workflow_error_handlers(*)
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
      console.log('Creating workflow with data:', workflow);

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

      console.log('Workflow created:', workflowData);

      // Then create steps if any exist
      if (workflow.steps && workflow.steps.length > 0) {
        const stepsToInsert = workflow.steps.map(step => ({
          id: step.id, // Include the step ID from the frontend
          workflow_id: workflowData.id,
          name: step.name,
          type: step.type,
          position: step.position,
          config: step.config || null
        }));

        console.log('Creating steps:', stepsToInsert);

        const { error: stepsError } = await supabase
          .from('workflow_steps')
          .insert(stepsToInsert);

        if (stepsError) {
          console.error('Error creating steps:', stepsError);
          throw new Error(`Failed to create workflow steps: ${stepsError.message}`);
        }
      }

      // Finally create transitions if any exist
      if (workflow.transitions && workflow.transitions.length > 0) {
        const transitionsToInsert = workflow.transitions.map(transition => ({
          id: transition.id, // Include the transition ID from the frontend
          workflow_id: workflowData.id,
          from_step_id: transition.from,
          to_step_id: transition.to,
          condition: transition.condition || null
        }));

        console.log('Creating transitions:', transitionsToInsert);

        const { error: transitionsError } = await supabase
          .from('workflow_transitions')
          .insert(transitionsToInsert);

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
      
      console.log('Workflow creation completed:', newWorkflow);
      return newWorkflow;
    } catch (error) {
      console.error('Error in createWorkflow:', error);
      throw new Error('Failed to create workflow. Please check your connection and try again.');
    }
  }

  async updateWorkflow(id: string, updates: Partial<WorkflowDefinition>): Promise<WorkflowDefinition | null> {
    try {
      // Update the main workflow record
      const { data: workflowData, error: workflowError } = await supabase
        .from('workflows')
        .update({
          name: updates.name,
          description: updates.description,
          version: updates.version,
          status: updates.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (workflowError) {
        console.error('Error updating workflow:', workflowError);
        throw new Error(`Failed to update workflow: ${workflowError.message}`);
      }

      // If steps are being updated, handle them
      if (updates.steps) {
        // Delete existing steps
        await supabase
          .from('workflow_steps')
          .delete()
          .eq('workflow_id', id);

        // Insert new steps
        if (updates.steps.length > 0) {
          const stepsToInsert = updates.steps.map(step => ({
            id: step.id,
            workflow_id: id,
            name: step.name,
            type: step.type,
            position: step.position,
            config: step.config || null
          }));

          const { error: stepsError } = await supabase
            .from('workflow_steps')
            .insert(stepsToInsert);

          if (stepsError) {
            console.error('Error updating steps:', stepsError);
            throw new Error(`Failed to update workflow steps: ${stepsError.message}`);
          }
        }
      }

      // If transitions are being updated, handle them
      if (updates.transitions) {
        // Delete existing transitions
        await supabase
          .from('workflow_transitions')
          .delete()
          .eq('workflow_id', id);

        // Insert new transitions
        if (updates.transitions.length > 0) {
          const transitionsToInsert = updates.transitions.map(transition => ({
            id: transition.id,
            workflow_id: id,
            from_step_id: transition.from,
            to_step_id: transition.to,
            condition: transition.condition || null
          }));

          const { error: transitionsError } = await supabase
            .from('workflow_transitions')
            .insert(transitionsToInsert);

          if (transitionsError) {
            console.error('Error updating transitions:', transitionsError);
            throw new Error(`Failed to update workflow transitions: ${transitionsError.message}`);
          }
        }
      }

      // Return the updated workflow
      return this.getWorkflowById(id);
    } catch (error) {
      console.error('Error in updateWorkflow:', error);
      throw new Error('Failed to update workflow. Please check your connection and try again.');
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