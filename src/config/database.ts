import { IWorkflowRepository } from '../repositories/interfaces/IWorkflowRepository';
import { SupabaseWorkflowRepository } from '../repositories/supabase/SupabaseWorkflowRepository';
import { supabase } from '../repositories/supabase/SupabaseClient';

let workflowRepository: IWorkflowRepository;

export const initializeDatabase = async () => {
  // Initialize Supabase connection
  if (!supabase) {
    throw new Error('Failed to initialize Supabase client');
  }

  workflowRepository = new SupabaseWorkflowRepository();
};

export const getWorkflowRepository = (): IWorkflowRepository => {
  if (!workflowRepository) {
    initializeDatabase();
  }
  return workflowRepository;
};