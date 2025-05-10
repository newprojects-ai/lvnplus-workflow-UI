import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface ExecuteRequest {
  instanceId: string;
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

    const { instanceId, data }: ExecuteRequest = await req.json();

    // Call the workflow execution function
    const { data: result, error } = await supabaseClient
      .rpc('advance_workflow', {
        instance_id: instanceId,
        input_data: data || {}
      });

    if (error) throw error;

    // Get updated instance details
    const { data: instance, error: instanceError } = await supabaseClient
      .from('workflow_instances')
      .select(`
        *,
        workflow:workflows(*),
        current_step:workflow_steps(*),
        history:workflow_history(*)
      `)
      .eq('id', instanceId)
      .single();

    if (instanceError) throw instanceError;

    return new Response(JSON.stringify(instance), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});