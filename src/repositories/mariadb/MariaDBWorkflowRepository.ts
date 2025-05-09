import { IWorkflowRepository } from '../interfaces/IWorkflowRepository';
import { WorkflowDefinition } from '../../types';
import { Pool } from 'mariadb';

export class MariaDBWorkflowRepository implements IWorkflowRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async getAll(): Promise<WorkflowDefinition[]> {
    const conn = await this.pool.getConnection();
    try {
      const workflows = await conn.query(`
        SELECT 
          w.*,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', s.id,
              'name', s.name,
              'type', s.type,
              'position', s.position,
              'config', s.config
            )
          ) as steps,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', t.id,
              'from', t.from_step_id,
              'to', t.to_step_id,
              'condition', t.condition
            )
          ) as transitions
        FROM workflows w
        LEFT JOIN workflow_steps s ON w.id = s.workflow_id
        LEFT JOIN workflow_transitions t ON w.id = t.workflow_id
        GROUP BY w.id
        ORDER BY w.created_at DESC
      `);

      return this.mapToWorkflowDefinitions(workflows);
    } finally {
      conn.release();
    }
  }

  // ... implement other methods

  private mapToWorkflowDefinitions(data: any[]): WorkflowDefinition[] {
    return data.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      version: row.version,
      status: row.status,
      steps: JSON.parse(row.steps),
      transitions: JSON.parse(row.transitions),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      createdBy: row.created_by
    }));
  }
}