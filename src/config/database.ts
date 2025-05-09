import { IWorkflowRepository } from '../repositories/interfaces/IWorkflowRepository';
import { SupabaseWorkflowRepository } from '../repositories/supabase/SupabaseWorkflowRepository';

let workflowRepository: IWorkflowRepository;

export const initializeDatabase = async () => {
  workflowRepository = new SupabaseWorkflowRepository();
};

export const getWorkflowRepository = (): IWorkflowRepository => {
  if (!workflowRepository) {
    workflowRepository = new SupabaseWorkflowRepository();
  }
  return workflowRepository;
};