import { 
  WorkflowDefinition, 
  WorkflowInstance, 
  Task, 
  User, 
  Activity, 
  DashboardStats 
} from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    role: 'admin'
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    role: 'manager'
  },
  {
    id: 'user-3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    role: 'user'
  },
  {
    id: 'user-4',
    name: 'Emily Davis',
    email: 'emily@example.com',
    avatar: 'https://randomuser.me/api/portraits/women/67.jpg',
    role: 'user'
  }
];

export const mockWorkflows: WorkflowDefinition[] = [
  {
    id: 'workflow-1',
    name: 'Employee Onboarding',
    description: 'Process for onboarding new employees',
    version: '1.0',
    status: 'published',
    steps: [
      {
        id: 'step-1',
        name: 'Start',
        type: 'start',
        position: { x: 100, y: 200 }
      },
      {
        id: 'step-2',
        name: 'HR Documentation',
        type: 'task',
        position: { x: 300, y: 200 },
        config: {
          form: {
            fields: [
              {
                name: 'employeeName',
                type: 'text',
                label: 'Employee Name',
                required: true
              },
              {
                name: 'position',
                type: 'text',
                label: 'Position',
                required: true
              },
              {
                name: 'department',
                type: 'select',
                label: 'Department',
                required: true,
                options: [
                  { label: 'Engineering', value: 'engineering' },
                  { label: 'Marketing', value: 'marketing' },
                  { label: 'Sales', value: 'sales' },
                  { label: 'HR', value: 'hr' }
                ]
              }
            ]
          }
        }
      },
      {
        id: 'step-3',
        name: 'Equipment Setup',
        type: 'task',
        position: { x: 500, y: 200 },
        config: {
          form: {
            fields: [
              {
                name: 'laptopModel',
                type: 'select',
                label: 'Laptop Model',
                required: true,
                options: [
                  { label: 'MacBook Pro', value: 'macbook-pro' },
                  { label: 'Dell XPS', value: 'dell-xps' },
                  { label: 'ThinkPad', value: 'thinkpad' }
                ]
              },
              {
                name: 'accessories',
                type: 'checkbox',
                label: 'Accessories',
                required: false,
                options: [
                  { label: 'Mouse', value: 'mouse' },
                  { label: 'Keyboard', value: 'keyboard' },
                  { label: 'Monitor', value: 'monitor' },
                  { label: 'Headset', value: 'headset' }
                ]
              }
            ]
          }
        }
      },
      {
        id: 'step-4',
        name: 'Account Setup',
        type: 'task',
        position: { x: 700, y: 200 },
        config: {
          form: {
            fields: [
              {
                name: 'email',
                type: 'text',
                label: 'Email',
                required: true
              },
              {
                name: 'accessLevel',
                type: 'radio',
                label: 'Access Level',
                required: true,
                options: [
                  { label: 'Basic', value: 'basic' },
                  { label: 'Advanced', value: 'advanced' },
                  { label: 'Admin', value: 'admin' }
                ]
              }
            ]
          }
        }
      },
      {
        id: 'step-5',
        name: 'End',
        type: 'end',
        position: { x: 900, y: 200 }
      }
    ],
    transitions: [
      {
        id: 'transition-1',
        from: 'step-1',
        to: 'step-2'
      },
      {
        id: 'transition-2',
        from: 'step-2',
        to: 'step-3'
      },
      {
        id: 'transition-3',
        from: 'step-3',
        to: 'step-4'
      },
      {
        id: 'transition-4',
        from: 'step-4',
        to: 'step-5'
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'user-1'
  },
  {
    id: 'workflow-2',
    name: 'Expense Approval',
    description: 'Process for approving employee expenses',
    version: '1.2',
    status: 'published',
    steps: [
      {
        id: 'step-1',
        name: 'Start',
        type: 'start',
        position: { x: 100, y: 200 }
      },
      {
        id: 'step-2',
        name: 'Submit Expense',
        type: 'task',
        position: { x: 300, y: 200 },
        config: {
          form: {
            fields: [
              {
                name: 'amount',
                type: 'text',
                label: 'Amount',
                required: true
              },
              {
                name: 'category',
                type: 'select',
                label: 'Category',
                required: true,
                options: [
                  { label: 'Travel', value: 'travel' },
                  { label: 'Office Supplies', value: 'office' },
                  { label: 'Entertainment', value: 'entertainment' },
                  { label: 'Other', value: 'other' }
                ]
              },
              {
                name: 'receipt',
                type: 'file',
                label: 'Receipt',
                required: true
              },
              {
                name: 'notes',
                type: 'textarea',
                label: 'Notes',
                required: false
              }
            ]
          }
        }
      },
      {
        id: 'step-3',
        name: 'Manager Review',
        type: 'task',
        position: { x: 500, y: 200 },
        config: {
          form: {
            fields: [
              {
                name: 'approved',
                type: 'radio',
                label: 'Approval Decision',
                required: true,
                options: [
                  { label: 'Approve', value: 'approve' },
                  { label: 'Reject', value: 'reject' }
                ]
              },
              {
                name: 'comments',
                type: 'textarea',
                label: 'Comments',
                required: false
              }
            ]
          }
        }
      },
      {
        id: 'step-4',
        name: 'Finance Processing',
        type: 'task',
        position: { x: 700, y: 100 },
        config: {
          form: {
            fields: [
              {
                name: 'processedDate',
                type: 'date',
                label: 'Processed Date',
                required: true
              },
              {
                name: 'reimbursementMethod',
                type: 'select',
                label: 'Reimbursement Method',
                required: true,
                options: [
                  { label: 'Direct Deposit', value: 'direct-deposit' },
                  { label: 'Check', value: 'check' }
                ]
              }
            ]
          }
        }
      },
      {
        id: 'step-5',
        name: 'Rejection Notification',
        type: 'task',
        position: { x: 700, y: 300 },
        config: {
          form: {
            fields: [
              {
                name: 'notificationSent',
                type: 'checkbox',
                label: 'Notification Sent',
                required: true,
                options: [
                  { label: 'Yes', value: 'yes' }
                ]
              }
            ]
          }
        }
      },
      {
        id: 'step-6',
        name: 'End',
        type: 'end',
        position: { x: 900, y: 200 }
      }
    ],
    transitions: [
      {
        id: 'transition-1',
        from: 'step-1',
        to: 'step-2'
      },
      {
        id: 'transition-2',
        from: 'step-2',
        to: 'step-3'
      },
      {
        id: 'transition-3',
        from: 'step-3',
        to: 'step-4',
        condition: 'approved === "approve"'
      },
      {
        id: 'transition-4',
        from: 'step-3',
        to: 'step-5',
        condition: 'approved === "reject"'
      },
      {
        id: 'transition-5',
        from: 'step-4',
        to: 'step-6'
      },
      {
        id: 'transition-6',
        from: 'step-5',
        to: 'step-6'
      }
    ],
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-03-05'),
    createdBy: 'user-2'
  },
  {
    id: 'workflow-3',
    name: 'Content Approval',
    description: 'Review and approve content before publishing',
    version: '1.0',
    status: 'draft',
    steps: [
      {
        id: 'step-1',
        name: 'Start',
        type: 'start',
        position: { x: 100, y: 200 }
      },
      {
        id: 'step-2',
        name: 'Create Content',
        type: 'task',
        position: { x: 300, y: 200 }
      },
      {
        id: 'step-3',
        name: 'Review Content',
        type: 'task',
        position: { x: 500, y: 200 }
      },
      {
        id: 'step-4',
        name: 'Publish Decision',
        type: 'decision',
        position: { x: 700, y: 200 }
      },
      {
        id: 'step-5',
        name: 'Revise Content',
        type: 'task',
        position: { x: 500, y: 350 }
      },
      {
        id: 'step-6',
        name: 'Publish Content',
        type: 'task',
        position: { x: 900, y: 200 }
      },
      {
        id: 'step-7',
        name: 'End',
        type: 'end',
        position: { x: 1100, y: 200 }
      }
    ],
    transitions: [
      {
        id: 'transition-1',
        from: 'step-1',
        to: 'step-2'
      },
      {
        id: 'transition-2',
        from: 'step-2',
        to: 'step-3'
      },
      {
        id: 'transition-3',
        from: 'step-3',
        to: 'step-4'
      },
      {
        id: 'transition-4',
        from: 'step-4',
        to: 'step-5',
        condition: 'approved === false'
      },
      {
        id: 'transition-5',
        from: 'step-4',
        to: 'step-6',
        condition: 'approved === true'
      },
      {
        id: 'transition-6',
        from: 'step-5',
        to: 'step-3'
      },
      {
        id: 'transition-7',
        from: 'step-6',
        to: 'step-7'
      }
    ],
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-01'),
    createdBy: 'user-1'
  }
];

export const mockInstances: WorkflowInstance[] = [
  {
    id: 'instance-1',
    definitionId: 'workflow-1',
    status: 'active',
    currentStepId: 'step-3',
    data: {
      employeeName: 'Alex Thompson',
      position: 'Frontend Developer',
      department: 'engineering',
      laptopModel: 'macbook-pro'
    },
    history: [
      {
        stepId: 'step-1',
        stepName: 'Start',
        enteredAt: new Date('2024-05-10T09:00:00'),
        exitedAt: new Date('2024-05-10T09:01:00')
      },
      {
        stepId: 'step-2',
        stepName: 'HR Documentation',
        enteredAt: new Date('2024-05-10T09:01:00'),
        exitedAt: new Date('2024-05-10T10:30:00'),
        data: {
          employeeName: 'Alex Thompson',
          position: 'Frontend Developer',
          department: 'engineering'
        },
        user: 'user-2',
        comments: 'All documentation complete'
      },
      {
        stepId: 'step-3',
        stepName: 'Equipment Setup',
        enteredAt: new Date('2024-05-10T10:30:00'),
        data: {
          laptopModel: 'macbook-pro'
        },
        user: 'user-3'
      }
    ],
    createdAt: new Date('2024-05-10T09:00:00'),
    updatedAt: new Date('2024-05-10T10:30:00')
  },
  {
    id: 'instance-2',
    definitionId: 'workflow-2',
    status: 'completed',
    currentStepId: 'step-6',
    data: {
      amount: '245.50',
      category: 'travel',
      approved: 'approve',
      processedDate: '2024-04-28',
      reimbursementMethod: 'direct-deposit'
    },
    history: [
      {
        stepId: 'step-1',
        stepName: 'Start',
        enteredAt: new Date('2024-04-25T14:20:00'),
        exitedAt: new Date('2024-04-25T14:21:00')
      },
      {
        stepId: 'step-2',
        stepName: 'Submit Expense',
        enteredAt: new Date('2024-04-25T14:21:00'),
        exitedAt: new Date('2024-04-25T14:30:00'),
        data: {
          amount: '245.50',
          category: 'travel',
          notes: 'Client meeting in Boston'
        },
        user: 'user-3'
      },
      {
        stepId: 'step-3',
        stepName: 'Manager Review',
        enteredAt: new Date('2024-04-25T14:30:00'),
        exitedAt: new Date('2024-04-26T09:15:00'),
        data: {
          approved: 'approve',
          comments: 'Approved for client meeting expenses'
        },
        user: 'user-2'
      },
      {
        stepId: 'step-4',
        stepName: 'Finance Processing',
        enteredAt: new Date('2024-04-26T09:15:00'),
        exitedAt: new Date('2024-04-28T11:30:00'),
        data: {
          processedDate: '2024-04-28',
          reimbursementMethod: 'direct-deposit'
        },
        user: 'user-4'
      },
      {
        stepId: 'step-6',
        stepName: 'End',
        enteredAt: new Date('2024-04-28T11:30:00'),
        exitedAt: new Date('2024-04-28T11:31:00')
      }
    ],
    createdAt: new Date('2024-04-25T14:20:00'),
    updatedAt: new Date('2024-04-28T11:31:00')
  },
  {
    id: 'instance-3',
    definitionId: 'workflow-2',
    status: 'active',
    currentStepId: 'step-3',
    data: {
      amount: '75.25',
      category: 'office',
      notes: 'Office supplies for team meeting'
    },
    history: [
      {
        stepId: 'step-1',
        stepName: 'Start',
        enteredAt: new Date('2024-05-12T10:45:00'),
        exitedAt: new Date('2024-05-12T10:46:00')
      },
      {
        stepId: 'step-2',
        stepName: 'Submit Expense',
        enteredAt: new Date('2024-05-12T10:46:00'),
        exitedAt: new Date('2024-05-12T11:00:00'),
        data: {
          amount: '75.25',
          category: 'office',
          notes: 'Office supplies for team meeting'
        },
        user: 'user-4'
      },
      {
        stepId: 'step-3',
        stepName: 'Manager Review',
        enteredAt: new Date('2024-05-12T11:00:00'),
        user: 'user-2'
      }
    ],
    createdAt: new Date('2024-05-12T10:45:00'),
    updatedAt: new Date('2024-05-12T11:00:00')
  }
];

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    instanceId: 'instance-1',
    stepId: 'step-3',
    stepName: 'Equipment Setup',
    assignedTo: 'user-3',
    dueDate: new Date('2024-05-12'),
    status: 'pending',
    priority: 'high'
  },
  {
    id: 'task-2',
    instanceId: 'instance-3',
    stepId: 'step-3',
    stepName: 'Manager Review',
    assignedTo: 'user-2',
    dueDate: new Date('2024-05-14'),
    status: 'pending',
    priority: 'normal'
  },
  {
    id: 'task-3',
    instanceId: 'instance-2',
    stepId: 'step-4',
    stepName: 'Finance Processing',
    assignedTo: 'user-4',
    dueDate: new Date('2024-04-28'),
    status: 'completed',
    priority: 'normal'
  },
  {
    id: 'task-4',
    instanceId: 'instance-1',
    stepId: 'step-2',
    stepName: 'HR Documentation',
    assignedTo: 'user-2',
    dueDate: new Date('2024-05-11'),
    status: 'completed',
    priority: 'high'
  }
];

export const mockActivities: Activity[] = [
  {
    id: 'activity-1',
    type: 'instance_started',
    user: 'user-2',
    timestamp: new Date('2024-05-10T09:00:00'),
    details: {
      entityId: 'instance-1',
      entityName: 'Employee Onboarding - Alex Thompson',
      action: 'started'
    }
  },
  {
    id: 'activity-2',
    type: 'task_completed',
    user: 'user-2',
    timestamp: new Date('2024-05-10T10:30:00'),
    details: {
      entityId: 'task-4',
      entityName: 'HR Documentation - Alex Thompson',
      action: 'completed'
    }
  },
  {
    id: 'activity-3',
    type: 'workflow_created',
    user: 'user-1',
    timestamp: new Date('2024-04-01T15:30:00'),
    details: {
      entityId: 'workflow-3',
      entityName: 'Content Approval',
      action: 'created'
    }
  },
  {
    id: 'activity-4',
    type: 'instance_completed',
    user: 'user-4',
    timestamp: new Date('2024-04-28T11:31:00'),
    details: {
      entityId: 'instance-2',
      entityName: 'Expense Approval - Mike Johnson',
      action: 'completed'
    }
  },
  {
    id: 'activity-5',
    type: 'instance_started',
    user: 'user-4',
    timestamp: new Date('2024-05-12T10:45:00'),
    details: {
      entityId: 'instance-3',
      entityName: 'Expense Approval - Emily Davis',
      action: 'started'
    }
  }
];

export const mockDashboardStats: DashboardStats = {
  totalWorkflows: mockWorkflows.length,
  activeInstances: mockInstances.filter(i => i.status === 'active').length,
  completedInstances: mockInstances.filter(i => i.status === 'completed').length,
  pendingTasks: mockTasks.filter(t => t.status === 'pending').length
};

// Get recent activities, sorted by timestamp
export const getRecentActivities = (limit = 5): Activity[] => {
  return [...mockActivities].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  ).slice(0, limit);
};

// Get pending tasks for a user
export const getPendingTasksForUser = (userId: string): Task[] => {
  return mockTasks.filter(
    task => task.assignedTo === userId && task.status === 'pending'
  );
};