import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface TaskRequest {
  instanceId: string;
  stepId: string;
  stepName: string;
  assignedTo: string;
  dueDate?: string;
  priority: 'low' | 'normal' | 'high';
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
        // List tasks
        const { data, error } = await supabaseClient
          .from('tasks')
          .select(`
            *,
            instance:workflow_instances(*),
            step:workflow_steps(*)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (path) {
        // Get task by ID
        const { data, error } = await supabaseClient
          .from('tasks')
          .select(`
            *,
            instance:workflow_instances(*),
            step:workflow_steps(*)
          `)
          .eq('id', path)
          .single();

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else if (req.method === 'POST') {
      // Create new task
      const taskData: TaskRequest = await req.json();

      const { data, error } = await supabaseClient
        .from('tasks')
        .insert({
          ...taskData,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (req.method === 'PUT' && path) {
      // Update task
      const updates = await req.json();

      const { data, error } = await supabaseClient
        .from('tasks')
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