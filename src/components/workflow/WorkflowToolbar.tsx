import React from 'react';
import { Button } from '../ui/Button';
import { 
  Plus, 
  PlayCircle, 
  GitBranch, 
  Timer, 
  Mail, 
  Code, 
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Workflow
} from 'lucide-react';

interface WorkflowToolbarProps {
  onAddStep: (type: string) => void;
}

const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({ onAddStep }) => {
  const taskTypes = [
    { type: 'start', icon: PlayCircle, label: 'Start', color: 'bg-green-100 text-green-600' },
    { type: 'task', icon: CheckCircle2, label: 'Task', color: 'bg-blue-100 text-blue-600' },
    { type: 'service', icon: Workflow, label: 'Service', color: 'bg-purple-100 text-purple-600' },
    { type: 'script', icon: Code, label: 'Script', color: 'bg-gray-100 text-gray-600' },
    { type: 'decision', icon: GitBranch, label: 'Decision', color: 'bg-amber-100 text-amber-600' },
    { type: 'timer', icon: Timer, label: 'Timer', color: 'bg-cyan-100 text-cyan-600' },
    { type: 'message', icon: Mail, label: 'Message', color: 'bg-indigo-100 text-indigo-600' },
    { type: 'notification', icon: MessageSquare, label: 'Notification', color: 'bg-pink-100 text-pink-600' },
    { type: 'error', icon: AlertTriangle, label: 'Error', color: 'bg-red-100 text-red-600' },
    { type: 'end', icon: CheckCircle2, label: 'End', color: 'bg-green-100 text-green-600' }
  ];

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex flex-wrap gap-2">
        {taskTypes.map(({ type, icon: Icon, label, color }) => (
          <Button
            key={type}
            variant="outline"
            size="sm"
            onClick={() => onAddStep(type)}
            className="flex items-center gap-2"
          >
            <div className={`p-1 rounded-full ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default WorkflowToolbar;