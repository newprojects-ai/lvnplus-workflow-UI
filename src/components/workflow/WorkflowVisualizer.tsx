import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { WorkflowDefinition, WorkflowInstance } from '../../types';
import { ArrowRight } from 'lucide-react';
import ConnectionLine from './ConnectionLine';
import WorkflowStep from './WorkflowStep';

interface WorkflowVisualizerProps {
  workflow: WorkflowDefinition;
  instance?: WorkflowInstance;
  selectedStepId?: string | null;
  onStepSelect?: (stepId: string) => void;
  onStepMove?: (stepId: string, position: { x: number; y: number }) => void;
  onStepDelete?: (stepId: string) => void;
  onTransitionCreate?: (fromId: string, toId: string) => void;
  onTransitionDelete?: (transitionId: string) => void;
  onAddStep?: (type: string, position: { x: number; y: number }) => void;
  className?: string;
  isInteractive?: boolean;
}

const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({
  workflow,
  instance,
  selectedStepId,
  onStepSelect,
  onStepMove,
  onStepDelete,
  onTransitionCreate,
  onTransitionDelete,
  onAddStep,
  className = '',
  isInteractive = false
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dropTargetRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isCreatingTransition, setIsCreatingTransition] = useState(false);
  const [transitionStart, setTransitionStart] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [connectorType, setConnectorType] = useState<'straight' | 'curved' | 'orthogonal'>('curved');
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  const handleTransitionCreate = (fromId: string, toId: string) => {
    // Prevent self-transitions
    if (fromId === toId) return;
    
    // Prevent duplicate transitions
    if (workflow.transitions.some(t => t.from === fromId && t.to === toId)) return;
    
    // Get the source step
    const fromStep = workflow.steps.find(s => s.id === fromId);
    
    // For decision steps, prompt for condition
    let condition = undefined;
    if (fromStep?.type === 'decision') {
      condition = prompt('Enter condition for this transition (e.g., status === "approved")');
      if (!condition) return; // Cancel if no condition provided
    }
    
    const newTransition = {
      id: `transition-${Date.now()}`,
      from: fromId,
      to: toId,
      condition
    };

    setWorkflow(prev => ({
      ...prev,
      transitions: [...prev.transitions, newTransition]
    }));
  };

  const getTransitionLabel = (transition: WorkflowTransition) => {
    if (!transition.condition) return '';
    return transition.condition.length > 20 
      ? transition.condition.substring(0, 20) + '...'
      : transition.condition;
  };

  // Calculate canvas size based on steps
  useEffect(() => {
    if (!canvasRef.current || !workflow.steps.length) return;
    
    // Find the dimensions of the workflow
    const minX = Math.min(...workflow.steps.map(step => step.position.x));
    const maxX = Math.max(...workflow.steps.map(step => step.position.x));
    const minY = Math.min(...workflow.steps.map(step => step.position.y));
    const maxY = Math.max(...workflow.steps.map(step => step.position.y));
    
    // Center the workflow in the canvas
    const canvasWidth = canvasRef.current.clientWidth;
    const canvasHeight = canvasRef.current.clientHeight;
    const workflowWidth = maxX - minX + 200; // Add padding
    const workflowHeight = maxY - minY + 200; // Add padding
    
    const initialScale = Math.min(
      canvasWidth / workflowWidth,
      canvasHeight / workflowHeight,
      1 // Don't scale up beyond 100%
    );
    
    setScale(initialScale);
    
    const initialPanX = (canvasWidth - workflowWidth * initialScale) / 2 - minX * initialScale + 50 * initialScale;
    const initialPanY = (canvasHeight - workflowHeight * initialScale) / 2 - minY * initialScale + 50 * initialScale;
    
    setPanOffset({ x: initialPanX, y: initialPanY });
  }, [workflow, canvasRef]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isInteractive) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isInteractive) return;
    
    // Get canvas bounds
    const canvas = canvasRef.current?.getBoundingClientRect();
    if (!canvas) return;
    
    // Calculate mouse position relative to canvas
    const x = (e.clientX - canvas.left) / scale;
    const y = (e.clientY - canvas.top) / scale;
    setMousePos({ x, y });
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPanOffset({
      x: panOffset.x + dx,
      y: panOffset.y + dy
    });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!isInteractive) return;
    
    // Only handle zoom when Ctrl key is pressed
    if (e.ctrlKey) {
      e.preventDefault();
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setScale(Math.max(0.1, Math.min(2, scale * scaleFactor)));
    }
  };

  const getStepStatus = (stepId: string): 'completed' | 'active' | 'pending' => {
    if (!instance) return 'pending';
    
    // Check if this is the current step
    if (instance.currentStepId === stepId) {
      return 'active';
    }
    
    // Check if this step exists in history and has an exit time
    const historyEntry = instance.history.find(h => h.stepId === stepId);
    if (historyEntry && historyEntry.exitedAt) {
      return 'completed';
    }
    
    return 'pending';
  };

  const getStatusClass = (status: 'completed' | 'active' | 'pending'): string => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'active':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const handleStepDragStart = (stepId: string) => {
    if (!isInteractive) return;
    // Don't start transition on drag
  };

  const handleStepDragEnd = (stepId: string) => {
    if (!isInteractive || !transitionStart || transitionStart === stepId) {
      setIsCreatingTransition(false);
      setTransitionStart(null);
      return;
    }

    onTransitionCreate?.(transitionStart, stepId);
    setIsCreatingTransition(false);
    setTransitionStart(null);
  };

  const handleConnectorClick = (stepId: string) => {
    if (isCreatingTransition) {
      if (transitionStart !== stepId) {
        onTransitionCreate?.(transitionStart!, stepId);
      }
      setIsCreatingTransition(false);
      setTransitionStart(null);
    } else {
      setTransitionStart(stepId);
      setIsCreatingTransition(true);
    }
  };

  const [, drop] = useDrop(() => ({
    accept: 'WORKFLOW_STEP',
    hover: (item: any, monitor) => {
      if (!dropTargetRef.current) return;
      
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta && onStepMove) {
        onStepMove(item.id, {
          x: item.originalPosition.x + delta.x / scale,
          y: item.originalPosition.y + delta.y / scale
        });
      }
    }
  }), [scale, onStepMove]);

  return (
    <div
      className={`relative border border-gray-300 bg-white rounded-lg overflow-hidden ${className}`}
      style={{ height: '500px' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      ref={canvasRef}
    >
      {isInteractive && (
        <div className="absolute top-2 right-2 z-10 bg-white rounded-md shadow p-1 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Connector:</span>
            <select
              value={connectorType}
              onChange={(e) => setConnectorType(e.target.value as any)}
              className="text-xs border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="straight">Straight</option>
              <option value="curved">Curved</option>
              <option value="orthogonal">Orthogonal</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setScale(prev => Math.min(2, prev + 0.1))}
              className="text-blue-600 hover:bg-blue-50 p-1 rounded"
            >
              +
            </button>
            <button
              onClick={() => setScale(prev => Math.max(0.1, prev - 0.1))}
              className="text-blue-600 hover:bg-blue-50 p-1 rounded"
            >
              -
            </button>
            <div className="text-xs text-gray-600 px-2 py-1">
              {Math.round(scale * 100)}%
            </div>
            <button
              onClick={() => {
                setScale(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              className="text-blue-600 hover:bg-blue-50 p-1 rounded text-xs"
            >
              Reset
            </button>
          </div>
        </div>
      )}
      
      <div
        className="absolute"
        ref={(node) => {
          dropTargetRef.current = node;
          drop(node);
        }}
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.2s',
          cursor: isInteractive ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
      >
        {/* Draw Transitions/Connections */}
        <svg width="3000" height="3000" className="absolute top-0 left-0 pointer-events-none">
          {workflow.transitions.map(transition => {
            const fromStep = workflow.steps.find(s => s.id === transition.from);
            const toStep = workflow.steps.find(s => s.id === transition.to);
            
            if (!fromStep || !toStep) return null;
            
            const isDecisionTransition = fromStep.type === 'decision';
            
            const fromX = fromStep.position.x + 60;
            const fromY = fromStep.position.y + 40;
            const toX = toStep.position.x + 60;
            const toY = toStep.position.y + 40;
            
            return (
              <ConnectionLine
                key={transition.id}
                fromX={fromX}
                fromY={fromY}
                toX={toX}
                toY={toY}
                type={connectorType}
                color={isDecisionTransition ? '#f59e0b' : '#94a3b8'}
                dashed={isDecisionTransition}
                condition={getTransitionLabel(transition)}
                onClick={() => onTransitionDelete?.(transition.id)}
              />
            );
          })}
        </svg>
        
        {/* Draw Steps */}
        {workflow.steps.map(step => {
          const status = getStepStatus(step.id);
          const statusClass = getStatusClass(status);
          
          return (
            <div
              key={step.id}
              className={`group absolute rounded-md border-2 shadow-sm ${statusClass} flex flex-col items-center p-3 transition-colors duration-300 ${
                selectedStepId === step.id ? 'ring-2 ring-blue-500' : ''
              } ${onStepSelect ? 'cursor-pointer' : ''}`}
              onClick={() => onStepSelect?.(step.id)}
              onMouseEnter={() => setHoveredStep(step.id)}
              onMouseLeave={() => setHoveredStep(null)}
              style={{
                left: step.position.x,
                top: step.position.y,
                width: 120,
                height: 80,
                opacity: isDragging ? 0.5 : 1
              }}
            >
              {isInteractive && (
                <button
                  className={`absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                    isCreatingTransition && transitionStart === step.id ? 'opacity-100 bg-green-500' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConnectorClick(step.id);
                  }}
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
              {hoveredStep === step.id && isCreatingTransition && transitionStart !== step.id && (
                <div className="absolute inset-0 bg-blue-100 bg-opacity-50 rounded-md border-2 border-blue-500 border-dashed">
                  <div className="absolute inset-0 flex items-center justify-center text-blue-500">Connect</div>
                </div>
              )}
              {isInteractive && step.type !== 'start' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStepDelete?.(step.id);
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              )}
              <div className="text-sm font-medium">{step.name}</div>
              <div className="text-xs text-gray-500">{step.type}</div>
            </div>
          );
        })}
        
        {isCreatingTransition && transitionStart && (
          <line
            x1={workflow.steps.find(s => s.id === transitionStart)?.position.x || 0}
            y1={workflow.steps.find(s => s.id === transitionStart)?.position.y || 0}
            x2={mousePos.x}
            y2={mousePos.y}
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="pointer-events-none"
          />
        )}
      </div>
    </div>
  );
};

export default WorkflowVisualizer;