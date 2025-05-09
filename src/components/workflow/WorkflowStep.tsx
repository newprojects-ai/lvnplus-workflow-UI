import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { X } from 'lucide-react';
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
    type: 'STEP',
    item: { id: step.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }), [step.id]);

  const [, dropRef] = useDrop(() => ({
    accept: 'STEP',
    drop: (item: { id: string }, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta && onStepMove) {
        onStepMove(item.id, {
          x: step.position.x + delta.x,
          y: step.position.y + delta.y
        });
      }
    }
  }), [step.position, onStepMove]);

  const getStepColorByType = (type: string): string => {
    switch (type) {
      case 'start': return '#2ecc71'; // Green
      case 'end': return '#e74c3c'; // Red
      case 'task': return '#3498db'; // Blue
      case 'decision': return '#f39c12'; // Yellow
      default: return '#95a5a6'; // Gray
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

  const stepColor = getStepColorByType(step.type);

  return (
    <div
      ref={(node) => {
        const dragDropRef = dragRef(dropRef(node));
        return isInteractive ? dragDropRef : node;
      }}
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
        className="w-8 h-8 rounded-full flex items-center justify-center mb-2"
        style={{ backgroundColor: stepColor }}
      >
        {step.type === 'start' && <span className="text-white">S</span>}
        {step.type === 'end' && <span className="text-white">E</span>}
        {step.type === 'task' && <span className="text-white">T</span>}
        {step.type === 'decision' && <span className="text-white">D</span>}
      </div>
      <span className="text-xs font-medium text-gray-900 text-center line-clamp-2">
        {step.name}
      </span>
    </div>
  );
};

export default WorkflowStep;