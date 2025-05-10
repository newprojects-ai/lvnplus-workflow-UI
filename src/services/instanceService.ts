import { supabase } from '../repositories/supabase/SupabaseClient';
import { WorkflowInstance } from '../types';

class InstanceService {
  async getInstances(): Promise<WorkflowInstance[]> {
    const { data, error } = await supabase
      .from('workflow_instances')
      .select(`
        *,
        workflow:workflows(*),
        current_step:workflow_steps(*),
        history:workflow_history(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching instances:', error);
      throw error;
    }

    return data.map(this.mapToInstance);
  }

  async getInstanceById(id: string): Promise<WorkflowInstance | null> {
    const { data, error } = await supabase
      .from('workflow_instances')
      .select(`
        *,
        workflow:workflows(*),
        current_step:workflow_steps(*),
        history:workflow_history(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching instance:', error);
      return null;
    }

    return this.mapToInstance(data);
  }

  async getInstancesByWorkflowId(workflowId: string): Promise<WorkflowInstance[]> {
    const { data, error } = await supabase
      .from('workflow_instances')
      .select(`
        *,
        workflow:workflows(*),
        current_step:workflow_steps(*),
        history:workflow_history(*)
      `)
      .eq('workflow_id', workflowId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching instances:', error);
      throw error;
    }

    return data.map(this.mapToInstance);
  }

  async createInstance(workflowId: string, initialData: Record<string, any> = {}): Promise<WorkflowInstance | null> {
    // Get workflow to find start step
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select(`
        *,
        steps:workflow_steps(*),
        transitions:workflow_transitions(*)
      `)
      .eq('id', workflowId)
      .single();

    if (workflowError || !workflow) {
      console.error('Error fetching workflow:', workflowError);
      return null;
    }

    const startStep = workflow.steps.find(step => step.type === 'start');
    if (!startStep) return null;

    // Find first step after start
    const firstTransition = workflow.transitions.find(t => t.from_step_id === startStep.id);
    if (!firstTransition) return null;

    const firstStep = workflow.steps.find(step => step.id === firstTransition.to_step_id);
    if (!firstStep) return null;

    // Create instance
    const { data: instance, error: instanceError } = await supabase
      .from('workflow_instances')
      .insert({
        workflow_id: workflowId,
        status: 'active',
        current_step_id: firstStep.id,
        data: initialData
      })
      .select()
      .single();

    if (instanceError) {
      console.error('Error creating instance:', instanceError);
      return null;
    }

    // Create history entries
    const { error: historyError } = await supabase
      .from('workflow_history')
      .insert([
        {
          instance_id: instance.id,
          step_id: startStep.id,
          step_name: startStep.name,
          exited_at: new Date()
        },
        {
          instance_id: instance.id,
          step_id: firstStep.id,
          step_name: firstStep.name
        }
      ]);

    if (historyError) {
      console.error('Error creating history:', historyError);
    }

    return this.getInstanceById(instance.id);
  }

  async executeStep(instanceId: string, data: Record<string, any> = {}): Promise<WorkflowInstance | null> {
    const { data: result, error } = await supabase
      .functions.invoke('execute-workflow', {
        body: { instanceId, data }
      });

    if (error) {
      console.error('Error executing workflow step:', error);
      return null;
    }

    return this.mapToInstance(result);
  }

  private mapToInstance(data: any): WorkflowInstance {
    return {
      id: data.id,
      definitionId: data.workflow_id,
      status: data.status,
      currentStepId: data.current_step_id,
      data: data.data || {},
      history: (data.history || []).map((h: any) => ({
        stepId: h.step_id,
        stepName: h.step_name,
        enteredAt: new Date(h.entered_at),
        exitedAt: h.exited_at ? new Date(h.exited_at) : undefined,
        data: h.data,
        user: h.user_id,
        comments: h.comments
      })),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}

const instanceService = new InstanceService();
export default instanceService;