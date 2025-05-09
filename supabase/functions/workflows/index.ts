import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface WorkflowRequest {
  name: string;
  description: string;
  version: string;
  steps: any[];
  transitions: any[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
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
        // List workflows
        const { data, error } = await supabaseClient
          .from('workflows')
          .select(`
            *,
            steps:workflow_steps(*),
            transitions:workflow_transitions(*),
            variables:workflow_variables(*),
            error_handlers:workflow_error_handlers(*)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (path) {
        // Get workflow by ID
        const { data, error } = await supabaseClient
          .from('workflows')
          .select(`
            *,
            steps:workflow_steps(*),
            transitions:workflow_transitions(*),
            variables:workflow_variables(*),
            error_handlers:workflow_error_handlers(*)
          `)
          .eq('id', path)
          .single();

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else if (req.method === 'POST') {
      // Create new workflow
      const { name, description, version, steps, transitions }: WorkflowRequest = await req.json();

      // Start a transaction
      const { data: workflow, error: workflowError } = await supabaseClient
        .from('workflows')
        .insert({
          name,
          description,
          version,
          status: 'draft',
        })
        .select()
        .single();

      if (workflowError) throw workflowError;

      // Insert steps
      const { error: stepsError } = await supabaseClient
        .from('workflow_steps')
        .insert(
          steps.map((step) => ({
            ...step,
            workflow_id: workflow.id,
          }))
        );

      if (stepsError) throw stepsError;

      // Insert transitions
      const { error: transitionsError } = await supabaseClient
        .from('workflow_transitions')
        .insert(
          transitions.map((transition) => ({
            ...transition,
            workflow_id: workflow.id,
          }))
        );

      if (transitionsError) throw transitionsError;

      return new Response(JSON.stringify(workflow), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (req.method === 'PUT' && path) {
      // Update workflow
      const updates = await req.json();

      const { data, error } = await supabaseClient
        .from('workflows')
        .update(updates)
        .eq('id', path)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (req.method === 'DELETE' && path) {
      // Delete workflow
      const { error } = await supabaseClient
        .from('workflows')
        .delete()
        .eq('id', path);

      if (error) throw error;

      return new Response(null, {
        headers: corsHeaders,
        status: 204,
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