import { IWorkflowRepository } from '../repositories/interfaces/IWorkflowRepository';
import { SupabaseWorkflowRepository } from '../repositories/supabase/SupabaseWorkflowRepository';
import { MariaDBWorkflowRepository } from '../repositories/mariadb/MariaDBWorkflowRepository';
import { createPool } from 'mariadb';

let workflowRepository: IWorkflowRepository;

export const initializeDatabase = async () => {
  const dbType = import.meta.env.VITE_DB_TYPE || 'supabase';

  if (dbType === 'mariadb') {
    const pool = createPool({
      host: import.meta.env.VITE_DB_HOST,
      user: import.meta.env.VITE_DB_USER,
      password: import.meta.env.VITE_DB_PASSWORD,
      database: import.meta.env.VITE_DB_NAME,
      connectionLimit: 5
    });
    workflowRepository = new MariaDBWorkflowRepository(pool);
  } else {
    workflowRepository = new SupabaseWorkflowRepository();
  }
};

export const getWorkflowRepository = (): IWorkflowRepository => {
  if (!workflowRepository) {
    throw new Error('Database not initialized');
  }
  return workflowRepository;
};