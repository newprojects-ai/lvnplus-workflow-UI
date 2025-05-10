/*
  # Add workflow execution function

  1. New Functions
    - `execute_workflow_step`: Handles step execution logic
    - `advance_workflow`: Manages workflow progression
  
  2. Security
    - Functions are SECURITY DEFINER to run with elevated privileges
    - Input validation and error handling included
*/

-- Function to execute a workflow step
CREATE OR REPLACE FUNCTION public.execute_workflow_step(
  instance_id UUID,
  step_id UUID,
  input_data JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_step RECORD;
  v_result JSONB;
  v_error TEXT;
BEGIN
  -- Get step details
  SELECT * INTO v_step
  FROM workflow_steps
  WHERE id = step_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Step not found';
  END IF;

  -- Execute step based on type
  CASE v_step.type
    WHEN 'start' THEN
      v_result = input_data;
    
    WHEN 'task' THEN
      -- Create task record
      INSERT INTO tasks (
        instance_id,
        step_id,
        step_name,
        status,
        priority,
        data
      ) VALUES (
        instance_id,
        step_id,
        v_step.name,
        'pending',
        COALESCE(v_step.config->>'priority', 'normal'),
        input_data
      );
      v_result = input_data;
    
    WHEN 'service' THEN
      -- Service calls are handled by Edge Functions
      v_result = input_data;
    
    WHEN 'script' THEN
      -- Script execution is handled by Edge Functions
      v_result = input_data;
    
    WHEN 'decision' THEN
      v_result = input_data;
    
    WHEN 'end' THEN
      -- Update instance status
      UPDATE workflow_instances
      SET status = 'completed'
      WHERE id = instance_id;
      v_result = input_data;
    
    ELSE
      v_result = input_data;
  END CASE;

  -- Record step execution in history
  INSERT INTO workflow_history (
    instance_id,
    step_id,
    step_name,
    data,
    user_id
  ) VALUES (
    instance_id,
    step_id,
    v_step.name,
    v_result,
    auth.uid()
  );

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
  
  -- Record error in history
  INSERT INTO workflow_history (
    instance_id,
    step_id,
    step_name,
    data,
    user_id,
    error
  ) VALUES (
    instance_id,
    step_id,
    v_step.name,
    input_data,
    auth.uid(),
    v_error
  );
  
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to advance workflow to next step
CREATE OR REPLACE FUNCTION public.advance_workflow(
  instance_id UUID,
  input_data JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_instance RECORD;
  v_workflow RECORD;
  v_current_step RECORD;
  v_next_step_id UUID;
  v_result JSONB;
BEGIN
  -- Get instance details
  SELECT * INTO v_instance
  FROM workflow_instances
  WHERE id = instance_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Instance not found';
  END IF;

  -- Get workflow details
  SELECT * INTO v_workflow
  FROM workflows
  WHERE id = v_instance.workflow_id;

  -- Get current step
  SELECT * INTO v_current_step
  FROM workflow_steps
  WHERE id = v_instance.current_step_id;

  -- Execute current step
  v_result := execute_workflow_step(instance_id, v_current_step.id, input_data);

  -- Find next step
  IF v_current_step.type = 'decision' THEN
    -- For decision steps, evaluate conditions
    SELECT t.to_step_id INTO v_next_step_id
    FROM workflow_transitions t
    WHERE t.workflow_id = v_workflow.id
    AND t.from_step_id = v_current_step.id
    AND (t.condition IS NULL OR 
         public.evaluate_condition(t.condition, v_result));
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'No valid transition found from decision step';
    END IF;
  ELSE
    -- For other steps, take first available transition
    SELECT t.to_step_id INTO v_next_step_id
    FROM workflow_transitions t
    WHERE t.workflow_id = v_workflow.id
    AND t.from_step_id = v_current_step.id
    LIMIT 1;
  END IF;

  -- Update instance with next step
  IF v_next_step_id IS NOT NULL THEN
    UPDATE workflow_instances
    SET current_step_id = v_next_step_id,
        data = data || v_result
    WHERE id = instance_id;
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;