import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface InstanceRequest {
  workflowId: string;
  data?: Record<string, any>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
      }
    );

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    if (req.method === 'GET') {
      if (path === 'list') {
        // List instances
        const { data, error } = await supabaseClient
          .from('workflow_instances')
          .select(`
            *,
            workflow:workflows(*),
            current_step:workflow_steps(*),
            history:workflow_history(*)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (path) {
        // Get instance by ID
        const { data, error } = await supabaseClient
          .from('workflow_instances')
          .select(`
            *,
            workflow:workflows(*),
            current_step:workflow_steps(*),
            history:workflow_history(*)
          `)
          .eq('id', path)
          .single();

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else if (req.method === 'POST') {
      // Start new instance
      const { workflowId, data: initialData }: InstanceRequest = await req.json();

      // Get workflow and start step
      const { data: workflow, error: workflowError } = await supabaseClient
        .from('workflows')
        .select(`
          *,
          steps:workflow_steps(*),
          transitions:workflow_transitions(*)
        `)
        .eq('id', workflowId)
        .single();

      if (workflowError) throw workflowError;

      const startStep = workflow.steps.find((s: any) => s.type === 'start');
      if (!startStep) throw new Error('Workflow must have a start step');

      // Find first step after start
      const firstTransition = workflow.transitions.find((t: any) => t.from_step_id === startStep.id);
      if (!firstTransition) throw new Error('Start step must have an outgoing transition');

      const firstStep = workflow.steps.find((s: any) => s.id === firstTransition.to_step_id);
      if (!firstStep) throw new Error('Invalid workflow configuration');

      // Create instance
      const { data: instance, error: instanceError } = await supabaseClient
        .from('workflow_instances')
        .insert({
          workflow_id: workflowId,
          status: 'active',
          current_step_id: firstStep.id,
          data: initialData || {},
        })
        .select()
        .single();

      if (instanceError) throw instanceError;

      // Create history entries
      const { error: historyError } = await supabaseClient
        .from('workflow_history')
        .insert([
          {
            instance_id: instance.id,
            step_id: startStep.id,
            step_name: startStep.name,
            exited_at: new Date(),
          },
          {
            instance_id: instance.id,
            step_id: firstStep.id,
            step_name: firstStep.name,
          },
        ]);

      if (historyError) throw historyError;

      return new Response(JSON.stringify(instance), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (req.method === 'PUT' && path) {
      const updates = await req.json();

      const { data, error } = await supabaseClient
        .from('workflow_instances')
        .update(updates)
        .eq('id', path)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', {
      headers: corsHeaders,
      status: 404,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});