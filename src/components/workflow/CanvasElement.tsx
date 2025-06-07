import React, { useState, useRef, useCallback } from 'react';
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
  Copy,
  Settings,
  Link
} from 'lucide-react';

interface CanvasElementProps {
  step: WorkflowStep;
  isSelected: boolean;
  isHovered?: boolean;
  onSelect: () => void;
  onHover?: (stepId: string | null) => void;
  onStartConnection: (stepId: string) => void;
  onEndConnection: (stepId: string) => void;
  connectionMode: { active: boolean; fromStepId: string | null };
  isReadOnly?: boolean;
  isDragging?: boolean;
}

const CanvasElement: React.FC<CanvasElementProps> = ({
  step,
  isSelected,
  isHovered = false,
  onSelect,
  onHover,
  onStartConnection,
  onEndConnection,
  connectionMode,
  isReadOnly = false,
  isDragging = false
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showConnectionPoints, setShowConnectionPoints] = useState(false);
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

  const handleMouseEnter = useCallback(() => {
    if (!isDragging) {
      setShowConnectionPoints(true);
      onHover?.(step.id);
    }
  }, [isDragging, onHover, step.id]);

  const handleMouseLeave = useCallback(() => {
    setShowConnectionPoints(false);
    onHover?.(null);
  }, [onHover]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  }, [onSelect]);

  const handleConnectionClick = useCallback((e: React.MouseEvent, isOutput: boolean) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Connection click:', { stepId: step.id, isOutput, connectionMode });
    
    if (connectionMode.active) {
      if (connectionMode.fromStepId === step.id) {
        // Cancel connection if clicking on the same element
        console.log('Canceling connection - same element');
        return;
      }
      // Complete the connection
      console.log('Completing connection to:', step.id);
      onEndConnection(step.id);
    } else if (isOutput && step.type !== 'end') {
      // Start a new connection from this element
      console.log('Starting connection from:', step.id);
      onStartConnection(step.id);
    }
  }, [connectionMode, step.id, step.type, onStartConnection, onEndConnection]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isReadOnly) {
      setShowContextMenu(true);
    }
  }, [isReadOnly]);

  // Decision nodes use diamond shape
  const isDecision = step.type === 'decision';
  const elementWidth = isDecision ? 64 : 96;
  const elementHeight = isDecision ? 64 : 64;

  // Calculate connection point positions
  const connectionPoints = {
    input: {
      x: elementWidth / 2,
      y: 0
    },
    output: {
      x: elementWidth / 2,
      y: elementHeight
    },
    left: {
      x: 0,
      y: elementHeight / 2
    },
    right: {
      x: elementWidth,
      y: elementHeight / 2
    }
  };

  // Determine if we should show connection points
  const shouldShowConnectionPoints = (showConnectionPoints || connectionMode.active || isSelected) && !isReadOnly;

  return (
    <>
      <div
        ref={elementRef}
        className={`absolute group transition-all duration-200 ${
          isSelected ? 'z-30' : isHovered ? 'z-20' : 'z-10'
        } ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'}`}
        style={{
          left: step.position.x,
          top: step.position.y,
          width: elementWidth,
          height: elementHeight,
          transform: isDecision ? 'rotate(45deg)' : 'none'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {/* Main Element */}
        <div
          className={`
            relative w-full h-full flex flex-col items-center justify-center
            bg-white border-2 rounded-lg shadow-lg
            ${isSelected ? 'border-blue-500 shadow-blue-200 ring-2 ring-blue-200' : 
              isHovered ? 'border-blue-400 shadow-blue-100' : 'border-gray-300'}
            ${isDragging ? 'scale-105 shadow-xl' : 'hover:shadow-xl'}
            transition-all duration-200
          `}
          style={{
            transform: isDecision ? 'rotate(-45deg)' : 'none'
          }}
        >
          {/* Icon */}
          <div className={`p-2 rounded-full ${getStepColor(step.type)} mb-1 shadow-sm`}>
            {getStepIcon(step.type)}
          </div>
          
          {/* Label */}
          {!isDecision && (
            <span className="text-xs font-medium text-gray-700 text-center px-1 leading-tight max-w-full truncate">
              {step.name}
            </span>
          )}
          
          {/* Selection Indicator */}
          {isSelected && (
            <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none animate-pulse" />
          )}
        </div>
        
        {/* Connection Points */}
        {shouldShowConnectionPoints && (
          <>
            {/* Input connection point */}
            {step.type !== 'start' && (
              <div
                className={`absolute w-4 h-4 rounded-full border-2 border-white transition-all duration-200 cursor-pointer ${
                  connectionMode.active && connectionMode.fromStepId !== step.id
                    ? 'bg-green-500 opacity-100 scale-125 hover:scale-150 shadow-lg'
                    : 'bg-blue-500 opacity-0 group-hover:opacity-100 hover:scale-125'
                }`}
                style={{
                  left: connectionPoints.input.x - 8,
                  top: connectionPoints.input.y - 8,
                  transform: isDecision ? 'rotate(-45deg)' : 'none'
                }}
                onClick={(e) => handleConnectionClick(e, false)}
                title="Input connection"
              />
            )}
            
            {/* Output connection point */}
            {step.type !== 'end' && (
              <div
                className={`absolute w-4 h-4 rounded-full border-2 border-white transition-all duration-200 cursor-pointer ${
                  connectionMode.active && connectionMode.fromStepId === step.id
                    ? 'bg-red-500 opacity-100 scale-125 shadow-lg'
                    : 'bg-green-500 opacity-0 group-hover:opacity-100 hover:scale-125'
                }`}
                style={{
                  left: connectionPoints.output.x - 8,
                  top: connectionPoints.output.y - 8,
                  transform: isDecision ? 'rotate(-45deg)' : 'none'
                }}
                onClick={(e) => handleConnectionClick(e, true)}
                title="Output connection - Click to start connection"
              />
            )}

            {/* Side connection points for decision nodes */}
            {isDecision && (
              <>
                <div
                  className="absolute w-4 h-4 bg-green-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 cursor-pointer hover:scale-125 transition-all duration-200"
                  style={{
                    left: connectionPoints.left.x - 8,
                    top: connectionPoints.left.y - 8,
                    transform: 'rotate(-45deg)'
                  }}
                  onClick={(e) => handleConnectionClick(e, true)}
                  title="Left output"
                />
                <div
                  className="absolute w-4 h-4 bg-green-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 cursor-pointer hover:scale-125 transition-all duration-200"
                  style={{
                    left: connectionPoints.right.x - 8,
                    top: connectionPoints.right.y - 8,
                    transform: 'rotate(-45deg)'
                  }}
                  onClick={(e) => handleConnectionClick(e, true)}
                  title="Right output"
                />
              </>
            )}
          </>
        )}
        
        {/* Context Menu Button */}
        {(isSelected || isHovered) && !isReadOnly && (
          <button
            className="absolute -top-2 -right-2 w-6 h-6 bg-gray-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-700 hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              setShowContextMenu(true);
            }}
            title="More options"
          >
            <MoreVertical className="h-3 w-3 mx-auto" />
          </button>
        )}
      </div>
      
      {/* Decision Label */}
      {isDecision && (
        <div 
          className="absolute whitespace-nowrap pointer-events-none"
          style={{
            left: step.position.x + elementWidth / 2,
            top: step.position.y + elementHeight + 8,
            transform: 'translateX(-50%)'
          }}
        >
          <span className="text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded shadow-sm border">
            {step.name}
          </span>
        </div>
      )}

      {/* Context Menu */}
      {showContextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowContextMenu(false)}
          />
          <div
            className="absolute bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 min-w-[160px]"
            style={{
              left: step.position.x + elementWidth + 8,
              top: step.position.y
            }}
          >
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center transition-colors">
              <Settings className="h-4 w-4 mr-2 text-gray-500" />
              Configure
            </button>
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center transition-colors">
              <Copy className="h-4 w-4 mr-2 text-gray-500" />
              Duplicate
            </button>
            <button 
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowContextMenu(false);
                onStartConnection(step.id);
              }}
            >
              <Link className="h-4 w-4 mr-2 text-gray-500" />
              Add Connection
            </button>
            <hr className="my-1 border-gray-200" />
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center text-red-600 transition-colors">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default CanvasElement;