import React from 'react';
import { WorkflowDefinition } from '../../types';
import WorkflowCard from './WorkflowCard';
import EmptyState from '../ui/EmptyState';
import { Workflow } from 'lucide-react';

interface WorkflowGridProps {
  workflows: WorkflowDefinition[];
  onExecute?: (workflowId: string) => void;
  onEdit?: (workflowId: string) => void;
  onClone?: (workflowId: string) => void;
  onCreateNew?: () => void;
}

const WorkflowGrid: React.FC<WorkflowGridProps> = ({
  workflows,
  onExecute,
  onEdit,
  onClone,
  onCreateNew
}) => {
  if (workflows.length === 0) {
    return (
      <EmptyState
        icon={Workflow}
        title="No workflows found"
        description="Get started by creating your first workflow to automate your business processes."
        action={onCreateNew ? {
          label: "Create Workflow",
          onClick: onCreateNew
        } : undefined}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workflows.map(workflow => (
        <WorkflowCard
          key={workflow.id}
          workflow={workflow}
          onExecute={onExecute}
          onEdit={onEdit}
          onClone={onClone}
        />
      ))}
    </div>
  );
};

export default WorkflowGrid;