import React, { useState, useRef } from 'react';
import { WorkflowStep } from '../../types';
import { 
  PlayCircle, 
  Flag, 
  CheckSquare, 
  Code, 
  GitBranch, 
  Timer, 
  MessageSquare, 
  AlertTriangle, 
  Workflow,
  Bell,
  MoreVertical,
  Trash2,
  Copy
} from 'lucide-react';

interface CanvasElementProps {
  step: WorkflowStep;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (position: { x: number; y: number }) => void;
  onStartConnection: (stepId: string) => void;
  onEndConnection: (stepId: string) => void;
  connectionMode: { active: boolean; fromStepId: string | null };
  isReadOnly?: boolean;
}

const CanvasElement: React.FC<CanvasElementProps> = ({
  step,
  isSelected,
  onSelect,
  onMove,
  onStartConnection,
  onEndConnection,
  connectionMode,
  isReadOnly = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const getStepIcon = (type: string): JSX.Element => {
    const iconProps = { className: "h-5 w-5 text-white" };
    
    switch (type) {
      case 'start': return <PlayCircle {...iconProps} />;
      case 'end': return <Flag {...iconProps} />;
      case 'task': return <CheckSquare {...iconProps} />;
      case 'service': return <Workflow {...iconProps} />;
      case 'script': return <Code {...iconProps} />;
      case 'decision': return <GitBranch {...iconProps} />;
      case 'timer': return <Timer {...iconProps} />;
      case 'message': return <MessageSquare {...iconProps} />;
      case 'notification': return <Bell {...iconProps} />;
      case 'error': return <AlertTriangle {...iconProps} />;
      default: return <Workflow {...iconProps} />;
    }
  };

  const getStepColor = (type: string): string => {
    switch (type) {
      case 'start': return 'bg-green-500';
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isReadOnly) return;
    
    e.stopPropagation();
    onSelect();
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - step.position.x,
      y: e.clientY - step.position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isReadOnly) return;
    
    e.preventDefault();
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    
    // Snap to grid
    newPosition.x = Math.round(newPosition.x / 20) * 20;
    newPosition.y = Math.round(newPosition.y / 20) * 20;
    
    onMove(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleConnectionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (connectionMode.active) {
      if (connectionMode.fromStepId === step.id) {
        // Cancel connection
        return;
      }
      onEndConnection(step.id);
    } else {
      onStartConnection(step.id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isReadOnly) {
      setShowContextMenu(true);
    }
  };

  // Decision nodes use diamond shape
  const isDecision = step.type === 'decision';
  
  return (
    <>
      <div
        ref={elementRef}
        className={`absolute group cursor-pointer transition-all duration-200 ${
          isSelected ? 'z-20' : 'z-10'
        }`}
        style={{
          left: step.position.x,
          top: step.position.y,
          transform: isDecision ? 'rotate(45deg)' : 'none'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
      >
        {/* Main Element */}
        <div
          className={`
            relative flex flex-col items-center justify-center
            ${isDecision ? 'w-16 h-16' : 'w-24 h-16'}
            bg-white border-2 rounded-lg shadow-lg
            ${isSelected ? 'border-blue-500 shadow-blue-200' : 'border-gray-300'}
            hover:shadow-xl hover:border-blue-400
            transition-all duration-200
            ${isDragging ? 'scale-105' : ''}
          `}
          style={{
            transform: isDecision ? 'rotate(-45deg)' : 'none'
          }}
        >
          {/* Icon */}
          <div className={`p-2 rounded-full ${getStepColor(step.type)} mb-1`}>
            {getStepIcon(step.type)}
          </div>
          
          {/* Label */}
          {!isDecision && (
            <span className="text-xs font-medium text-gray-700 text-center px-1 leading-tight">
              {step.name}
            </span>
          )}
          
          {/* Connection Points */}
          {!isReadOnly && (
            <>
              {/* Input connection point */}
              {step.type !== 'start' && (
                <div
                  className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-blue-600"
                  onClick={handleConnectionClick}
                />
              )}
              
              {/* Output connection point */}
              {step.type !== 'end' && (
                <div
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-green-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-green-600"
                  onClick={handleConnectionClick}
                />
              )}
            </>
          )}
          
          {/* Context Menu Button */}
          {!isReadOnly && (
            <button
              className="absolute -top-2 -right-2 w-6 h-6 bg-gray-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                setShowContextMenu(true);
              }}
            >
              <MoreVertical className="h-3 w-3 mx-auto" />
            </button>
          )}
        </div>
        
        {/* Decision Label */}
        {isDecision && (
          <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded shadow">
              {step.name}
            </span>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
          style={{
            left: step.position.x + 100,
            top: step.position.y
          }}
          onMouseLeave={() => setShowContextMenu(false)}
        >
          <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center">
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </button>
          <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      )}
    </>
  );
};

export default CanvasElement;