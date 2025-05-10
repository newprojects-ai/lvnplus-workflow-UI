import React from 'react';
import { useDrag } from 'react-dnd';
import { 
  X, 
  PlayCircle, 
  Flag, 
  CheckSquare, 
  Code, 
  GitBranch, 
  Timer, 
  MessageSquare, 
  AlertTriangle, 
  Workflow,
  Bell
} from 'lucide-react';
import { WorkflowStep as WorkflowStepType } from '../../types';

interface WorkflowStepProps {
  step: WorkflowStepType;
  isInteractive: boolean;
  selectedStepId?: string | null;
  stepStatus: 'completed' | 'active' | 'pending';
  onStepSelect?: (stepId: string) => void;
  onStepDelete?: (stepId: string) => void;
  onStepMove?: (stepId: string, position: { x: number; y: number }) => void;
  onStepDragStart: (stepId: string) => void;
  onStepDragEnd: (stepId: string) => void;
}

interface DragItem {
  id: string;
  type: string;
  originalPosition: { x: number; y: number };
}

const WorkflowStep: React.FC<WorkflowStepProps> = ({
  step,
  isInteractive,
  selectedStepId,
  stepStatus,
  onStepSelect,
  onStepDelete,
  onStepMove,
  onStepDragStart,
  onStepDragEnd,
}) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'WORKFLOW_STEP',
    item: (): DragItem => ({
      id: step.id,
      type: step.type,
      originalPosition: step.position
    }),
    end: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta && onStepMove) {
        onStepMove(item.id, {
          x: item.originalPosition.x + delta.x,
          y: item.originalPosition.y + delta.y
        });
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }), [step.id, step.position, onStepMove]);

  const getStepColorByType = (type: string): string => {
    switch (type) {
      case 'start': return 'bg-emerald-500';
      case 'end': return 'bg-red-500';
      case 'task': return 'bg-blue-500';
      case 'service': return 'bg-purple-500';
      case 'script': return 'bg-gray-700';
      case 'decision': return 'bg-amber-500';
      case 'timer': return 'bg-cyan-500';
      case 'message': return 'bg-indigo-500';
      case 'notification': return 'bg-pink-500';
      case 'error': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getStepIcon = (type: string): JSX.Element => {
    switch (type) {
      case 'start': return <PlayCircle className="h-5 w-5 text-white" />;
      case 'end': return <Flag className="h-5 w-5 text-white" />;
      case 'task': return <CheckSquare className="h-5 w-5 text-white" />;
      case 'service': return <Workflow className="h-5 w-5 text-white" />;
      case 'script': return <Code className="h-5 w-5 text-white" />;
      case 'decision': return <GitBranch className="h-5 w-5 text-white" />;
      case 'timer': return <Timer className="h-5 w-5 text-white" />;
      case 'message': return <MessageSquare className="h-5 w-5 text-white" />;
      case 'notification': return <Bell className="h-5 w-5 text-white" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-white" />;
      default: return <Workflow className="h-5 w-5 text-white" />;
    }
  };

  let statusClass = '';
  switch(stepStatus) {
    case 'completed':
      statusClass = 'border-green-500 bg-green-50';
      break;
    case 'active':
      statusClass = 'border-blue-500 bg-blue-50 animate-pulse';
      break;
    default:
      statusClass = 'border-gray-300 bg-white';
  }

  return (
    <div
      ref={isInteractive ? dragRef : null}
      className={`absolute rounded-md border-2 shadow-sm ${statusClass} flex flex-col items-center p-3 transition-colors duration-300 ${
        selectedStepId === step.id ? 'ring-2 ring-blue-500' : ''
      } ${onStepSelect ? 'cursor-pointer' : ''}`}
      onClick={() => onStepSelect?.(step.id)}
      onMouseDown={() => onStepDragStart(step.id)}
      onMouseUp={() => onStepDragEnd(step.id)}
      style={{
        left: step.position.x,
        top: step.position.y,
        width: '120px',
        height: '80px',
        zIndex: 1,
        opacity: isDragging ? 0.5 : 1
      }}
    >
      {isInteractive && step.type !== 'start' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStepDelete?.(step.id);
          }}
          className="absolute -top-2 -right-2 p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      <div 
        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${getStepColorByType(step.type)}`}
      >
        {getStepIcon(step.type)}
      </div>
      <span className="text-xs font-medium text-gray-900 text-center line-clamp-2">
        {step.name}
      </span>
    </div>
  );
};

export default WorkflowStep;