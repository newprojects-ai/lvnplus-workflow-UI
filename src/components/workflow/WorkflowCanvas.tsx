import React, { useState, useRef, useCallback, useEffect } from 'react';
import { WorkflowDefinition, WorkflowStep, WorkflowTransition } from '../../types';
import CanvasElement from './CanvasElement';
import CanvasConnection from './CanvasConnection';
import CanvasToolbar from './CanvasToolbar';
import CanvasMiniMap from './CanvasMiniMap';

interface WorkflowCanvasProps {
  workflow: WorkflowDefinition;
  onWorkflowChange: (workflow: WorkflowDefinition) => void;
  selectedStepId?: string;
  onStepSelect?: (stepId: string | null) => void;
  isReadOnly?: boolean;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  workflow,
  onWorkflowChange,
  selectedStepId,
  onStepSelect,
  isReadOnly = false
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [connectionMode, setConnectionMode] = useState<{ active: boolean; fromStepId: string | null }>({ 
    active: false, 
    fromStepId: null 
  });
  const [tempConnection, setTempConnection] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Update canvas size on mount and resize
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Handle canvas interactions
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || isReadOnly) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    setSelectedElements([]);
  }, [offset, isReadOnly]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isReadOnly) return;

    if (e.key === 'Delete' && selectedElements.length > 0) {
      handleDeleteElements(selectedElements);
    } else if (e.key === 'Escape') {
      setSelectedElements([]);
      setConnectionMode({ active: false, fromStepId: null });
    }
  }, [selectedElements, isReadOnly]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setScale(prev => Math.max(0.1, Math.min(3, prev * scaleFactor)));
    }
  }, []);

  // Handle element addition
  const handleAddElement = useCallback((type: WorkflowStep['type'], position?: { x: number; y: number }) => {
    if (isReadOnly) return;

    // Calculate center position if not provided
    const centerX = canvasSize.width / 2 - offset.x;
    const centerY = canvasSize.height / 2 - offset.y;

    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      name: getDefaultStepName(type),
      type,
      position: position || { x: centerX / scale, y: centerY / scale }
    };

    const updatedWorkflow = {
      ...workflow,
      steps: [...workflow.steps, newStep]
    };

    onWorkflowChange(updatedWorkflow);
  }, [workflow, onWorkflowChange, isReadOnly, canvasSize, offset, scale]);

  // Handle element deletion
  const handleDeleteElements = useCallback((elementIds: string[]) => {
    if (isReadOnly) return;

    const updatedSteps = workflow.steps.filter(step => !elementIds.includes(step.id));
    const updatedTransitions = workflow.transitions.filter(
      transition => !elementIds.includes(transition.from) && !elementIds.includes(transition.to)
    );

    const updatedWorkflow = {
      ...workflow,
      steps: updatedSteps,
      transitions: updatedTransitions
    };

    onWorkflowChange(updatedWorkflow);
    setSelectedElements([]);
  }, [workflow, onWorkflowChange, setSelectedElements, isReadOnly]);

  // Handle connection creation
  const handleCreateConnection = useCallback((fromId: string, toId: string) => {
    if (isReadOnly || fromId === toId) return;

    // Check if connection already exists
    const existingConnection = workflow.transitions.find(
      t => t.from === fromId && t.to === toId
    );
    if (existingConnection) return;

    const newTransition: WorkflowTransition = {
      id: `transition-${Date.now()}`,
      from: fromId,
      to: toId
    };

    const updatedWorkflow = {
      ...workflow,
      transitions: [...workflow.transitions, newTransition]
    };

    onWorkflowChange(updatedWorkflow);
  }, [workflow, onWorkflowChange, isReadOnly]);

  return (
    <div className="relative w-full h-full bg-gray-50 overflow-hidden">
      {/* Canvas Toolbar */}
      {!isReadOnly && (
        <CanvasToolbar
          onAddElement={handleAddElement}
          onZoomIn={() => setScale(Math.min(scale * 1.2, 3))}
          onZoomOut={() => setScale(Math.max(scale * 0.8, 0.1))}
          onResetView={() => {
            setScale(1);
            setOffset({ x: 0, y: 0 });
          }}
          onDeleteSelected={() => handleDeleteElements(selectedElements)}
          hasSelection={selectedElements.length > 0}
          scale={scale}
          isReadOnly={isReadOnly}
        />
      )}

      {/* Mini Map */}
      <CanvasMiniMap
        workflow={workflow}
        canvasSize={canvasSize}
        scale={scale}
        offset={offset}
        onOffsetChange={setOffset}
      />

      {/* Empty State */}
      {workflow.steps.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Workflow</h3>
            <p className="text-gray-500 mb-4">Click "Add Element" to add your first workflow step</p>
            {!isReadOnly && (
              <div className="pointer-events-auto">
                <button
                  onClick={() => handleAddElement('start')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Start Step
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing focus:outline-none"
        tabIndex={0}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
        style={{
          backgroundImage: `
            radial-gradient(circle, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: `${25 * scale}px ${25 * scale}px`,
          backgroundPosition: `${offset.x}px ${offset.y}px`
        }}
      >
        <div
          className="relative"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}
        >
          {/* Render Connections */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            {workflow.transitions.map(transition => (
              <CanvasConnection
                key={transition.id}
                transition={transition}
                fromStep={workflow.steps.find(s => s.id === transition.from)}
                toStep={workflow.steps.find(s => s.id === transition.to)}
                isSelected={selectedElements.includes(transition.id)}
                onSelect={() => setSelectedElements([transition.id])}
              />
            ))}
            
            {/* Temporary connection during creation */}
            {tempConnection && (
              <CanvasConnection
                transition={tempConnection}
                fromStep={workflow.steps.find(s => s.id === tempConnection.from)}
                toStep={tempConnection.to ? workflow.steps.find(s => s.id === tempConnection.to) : undefined}
                isTemporary
              />
            )}
          </svg>

          {/* Render Elements */}
          {workflow.steps.map(step => (
            <CanvasElement
              key={step.id}
              step={step}
              isSelected={selectedElements.includes(step.id) || selectedStepId === step.id}
              onSelect={() => {
                setSelectedElements([step.id]);
                onStepSelect?.(step.id);
              }}
              onMove={(newPosition) => {
                if (isReadOnly) return;
                const updatedSteps = workflow.steps.map(s =>
                  s.id === step.id ? { ...s, position: newPosition } : s
                );
                onWorkflowChange({ ...workflow, steps: updatedSteps });
              }}
              onStartConnection={(stepId) => {
                if (isReadOnly) return;
                setConnectionMode({ active: true, fromStepId: stepId });
              }}
              onEndConnection={(stepId) => {
                if (connectionMode.active && connectionMode.fromStepId) {
                  handleCreateConnection(connectionMode.fromStepId, stepId);
                  setConnectionMode({ active: false, fromStepId: null });
                }
              }}
              connectionMode={connectionMode}
              isReadOnly={isReadOnly}
            />
          ))}
        </div>
      </div>

      {/* Connection Mode Overlay */}
      {connectionMode.active && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Click on another element to create a connection
          <button
            onClick={() => setConnectionMode({ active: false, fromStepId: null })}
            className="ml-2 text-blue-200 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

// Helper function to get default step names
const getDefaultStepName = (type: WorkflowStep['type']): string => {
  const names = {
    start: 'Start',
    end: 'End',
    task: 'Task',
    service: 'Service Call',
    script: 'Script',
    decision: 'Decision',
    timer: 'Timer',
    message: 'Message',
    notification: 'Notification',
    error: 'Error Handler'
  };
  return names[type] || 'Step';
};

export default WorkflowCanvas;