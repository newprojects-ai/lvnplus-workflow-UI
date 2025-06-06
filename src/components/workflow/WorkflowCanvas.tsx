import React, { useState, useRef, useCallback, useEffect } from 'react';
import { WorkflowDefinition, WorkflowStep, WorkflowTransition } from '../../types';
import CanvasElement from './CanvasElement';
import CanvasConnection from './CanvasConnection';
import CanvasToolbar from './CanvasToolbar';
import CanvasMiniMap from './CanvasMiniMap';
import { useCanvasState } from '../../hooks/useCanvasState';
import { useCanvasInteractions } from '../../hooks/useCanvasInteractions';

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
  
  const {
    scale,
    offset,
    selectedElements,
    connectionMode,
    tempConnection,
    setScale,
    setOffset,
    setSelectedElements,
    setConnectionMode,
    setTempConnection
  } = useCanvasState();

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleKeyDown,
    handleWheel
  } = useCanvasInteractions({
    workflow,
    onWorkflowChange,
    selectedElements,
    setSelectedElements,
    connectionMode,
    setConnectionMode,
    tempConnection,
    setTempConnection,
    scale,
    offset,
    setOffset,
    canvasRef,
    isReadOnly
  });

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

  // Handle element addition
  const handleAddElement = useCallback((type: WorkflowStep['type'], position?: { x: number; y: number }) => {
    if (isReadOnly) return;

    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      name: getDefaultStepName(type),
      type,
      position: position || { x: 100, y: 100 }
    };

    const updatedWorkflow = {
      ...workflow,
      steps: [...workflow.steps, newStep]
    };

    onWorkflowChange(updatedWorkflow);
  }, [workflow, onWorkflowChange, isReadOnly]);

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

      {/* Mini Map */}
      <CanvasMiniMap
        workflow={workflow}
        canvasSize={canvasSize}
        scale={scale}
        offset={offset}
        onOffsetChange={setOffset}
      />

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
          backgroundSize: `${20 * scale}px ${20 * scale}px`,
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
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
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