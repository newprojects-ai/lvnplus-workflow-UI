import React, { useState, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { WorkflowDefinition, WorkflowInstance } from '../../types';
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
  const stepRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isCreatingTransition, setIsCreatingTransition] = useState(false);
  const [transitionStart, setTransitionStart] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showConnectorOptions, setShowConnectorOptions] = useState(false);
  const [connectorType, setConnectorType] = useState<'straight' | 'curved' | 'orthogonal'>('curved');

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

  const handleStepDragStart = (stepId: string) => {
    if (!isInteractive) return;
    setTransitionStart(stepId);
    setIsCreatingTransition(true);
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

  return (
    <DndProvider backend={HTML5Backend}>
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
              
              const fromX = fromStep.position.x + 60;
              const fromY = fromStep.position.y + 40;
              const toX = toStep.position.x + 60;
              const toY = toStep.position.y + 40;
              
              // Determine the color based on status
              let color = '#94a3b8';
              if (instance) {
                const fromStatus = getStepStatus(fromStep.id);
                const toStatus = getStepStatus(toStep.id);
                
                if (fromStatus === 'completed' && toStatus === 'completed') {
                  color = '#2ecc71'; // Green for completed
                } else if (fromStatus === 'completed' && toStatus === 'active') {
                  color = '#3498db'; // Blue for active
                }
              }
              
              return (
                <ConnectionLine
                  key={transition.id}
                  fromX={fromX}
                  fromY={fromY}
                  toX={toX}
                  toY={toY}
                  type={connectorType}
                  color={color}
                  dashed={!!transition.condition}
                  condition={transition.condition}
                  onClick={() => onTransitionDelete?.(transition.id)}
                />
              );
            })}
          </svg>
          
          {/* Draw Steps */}
          {workflow.steps.map(step => (
            <WorkflowStep
              key={step.id}
              step={step}
              isInteractive={isInteractive}
              selectedStepId={selectedStepId}
              stepStatus={getStepStatus(step.id)}
              onStepSelect={onStepSelect}
              onStepDelete={onStepDelete}
              onStepMove={onStepMove}
              onStepDragStart={handleStepDragStart}
              onStepDragEnd={handleStepDragEnd}
            />
          ))}
          
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
    </DndProvider>
  );
};

export default WorkflowVisualizer;