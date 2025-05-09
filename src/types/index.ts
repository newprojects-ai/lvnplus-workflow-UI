export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  steps: WorkflowStep[];
  transitions: WorkflowTransition[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'start' | 'task' | 'decision' | 'end';
  position: { x: number; y: number };
  config?: {
    form?: {
      fields: FormField[];
    };
  };
}

export interface WorkflowTransition {
  id: string;
  from: string;
  to: string;
  condition?: string;
}

export interface FormField {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file' | 'date';
  label: string;
  required: boolean;
  options?: { label: string; value: string }[];
}

export interface WorkflowInstance {
  id: string;
  definitionId: string;
  status: 'active' | 'completed' | 'terminated';
  currentStepId: string;
  data: Record<string, any>;
  history: HistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HistoryEntry {
  stepId: string;
  stepName: string;
  enteredAt: Date;
  exitedAt?: Date;
  data?: Record<string, any>;
  user?: string;
  comments?: string;
}

export interface Task {
  id: string;
  instanceId: string;
  stepId: string;
  stepName: string;
  assignedTo: string;
  dueDate?: Date;
  status: 'pending' | 'completed';
  priority: 'low' | 'normal' | 'high';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'manager' | 'user';
}

export interface DashboardStats {
  totalWorkflows: number;
  activeInstances: number;
  completedInstances: number;
  pendingTasks: number;
}

export interface Activity {
  id: string;
  type: 'workflow_created' | 'workflow_updated' | 'instance_started' | 'instance_completed' | 'task_completed';
  user: string;
  timestamp: Date;
  details: {
    entityId: string;
    entityName: string;
    action: string;
  };
}