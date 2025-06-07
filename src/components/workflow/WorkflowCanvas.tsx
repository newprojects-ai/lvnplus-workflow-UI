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

interface DragState {
  isDragging: boolean;
  dragType: 'canvas' | 'element' | 'none';
  startPosition: { x: number; y: number };
  elementId?: string;
  initialElementPosition?: { x: number; y: number };
}

interface ConnectionState {
  active: boolean;
  fromStepId: string | null;
  previewLine?: {
    from: { x: number; y: number };
    to: { x: number; y: number };
  };
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
  const [connectionState, setConnectionState] = useState<ConnectionState>({ 
    active: false, 
    fromStepId: null 
  });
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragType: 'none',
    startPosition: { x: 0, y: 0 }
  });
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const gridSize = 20;

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

  // Track mouse position for connection preview
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (connectionState.active && connectionState.fromStepId) {
        const canvasPos = screenToCanvas(e.clientX, e.clientY);
        setMousePosition(canvasPos);
        
        // Update preview line
        const fromStep = workflow.steps.find(s => s.id === connectionState.fromStepId);
        if (fromStep) {
          const fromCenter = {
            x: fromStep.position.x + (fromStep.type === 'decision' ? 32 : 48),
            y: fromStep.position.y + (fromStep.type === 'decision' ? 32 : 32)
          };
          
          setConnectionState(prev => ({
            ...prev,
            previewLine: {
              from: fromCenter,
              to: canvasPos
            }
          }));
        }
      }
    };

    if (connectionState.active) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [connectionState.active, connectionState.fromStepId, workflow.steps]);

  // Snap to grid helper
  const snapPosition = useCallback((position: { x: number; y: number }) => {
    if (!snapToGrid) return position;
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize
    };
  }, [snapToGrid, gridSize]);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (screenX - rect.left - offset.x) / scale,
      y: (screenY - rect.top - offset.y) / scale
    };
  }, [offset, scale]);

  // Handle mouse down events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || isReadOnly) return;
    
    // If in connection mode, cancel it when clicking on empty space
    if (connectionState.active) {
      setConnectionState({ active: false, fromStepId: null });
      return;
    }
    
    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    
    // Check if clicking on an element
    const clickedElement = workflow.steps.find(step => {
      const elementBounds = {
        left: step.position.x,
        top: step.position.y,
        right: step.position.x + (step.type === 'decision' ? 64 : 96),
        bottom: step.position.y + (step.type === 'decision' ? 64 : 64)
      };
      
      return canvasPos.x >= elementBounds.left && 
             canvasPos.x <= elementBounds.right &&
             canvasPos.y >= elementBounds.top && 
             canvasPos.y <= elementBounds.bottom;
    });

    if (clickedElement) {
      // Element drag
      setDragState({
        isDragging: true,
        dragType: 'element',
        startPosition: { x: e.clientX, y: e.clientY },
        elementId: clickedElement.id,
        initialElementPosition: { ...clickedElement.position }
      });
      
      // Select element
      setSelectedElements([clickedElement.id]);
      onStepSelect?.(clickedElement.id);
    } else {
      // Canvas drag
      setDragState({
        isDragging: true,
        dragType: 'canvas',
        startPosition: { x: e.clientX - offset.x, y: e.clientY - offset.y }
      });
      
      // Clear selection
      setSelectedElements([]);
      onStepSelect?.(null);
    }
  }, [workflow.steps, offset, scale, isReadOnly, onStepSelect, screenToCanvas, connectionState.active]);

  // Handle mouse move events
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.isDragging) return;
    
    if (dragState.dragType === 'canvas') {
      // Pan canvas
      setOffset({
        x: e.clientX - dragState.startPosition.x,
        y: e.clientY - dragState.startPosition.y
      });
    } else if (dragState.dragType === 'element' && dragState.elementId && dragState.initialElementPosition) {
      // Move element
      const deltaX = (e.clientX - dragState.startPosition.x) / scale;
      const deltaY = (e.clientY - dragState.startPosition.y) / scale;
      
      const newPosition = snapPosition({
        x: dragState.initialElementPosition.x + deltaX,
        y: dragState.initialElementPosition.y + deltaY
      });
      
      // Constrain to canvas bounds
      const constrainedPosition = {
        x: Math.max(0, Math.min(newPosition.x, 2000)),
        y: Math.max(0, Math.min(newPosition.y, 2000))
      };
      
      const updatedSteps = workflow.steps.map(step =>
        step.id === dragState.elementId 
          ? { ...step, position: constrainedPosition }
          : step
      );
      
      onWorkflowChange({ ...workflow, steps: updatedSteps });
    }
  }, [dragState, workflow, onWorkflowChange, scale, snapPosition]);

  // Handle mouse up events
  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      dragType: 'none',
      startPosition: { x: 0, y: 0 }
    });
  }, []);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isReadOnly) return;

    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        if (selectedElements.length > 0) {
          handleDeleteElements(selectedElements);
        }
        break;
      case 'Escape':
        setSelectedElements([]);
        setConnectionState({ active: false, fromStepId: null });
        onStepSelect?.(null);
        break;
      case 'a':
      case 'A':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setSelectedElements(workflow.steps.map(s => s.id));
        }
        break;
      case 'g':
      case 'G':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setSnapToGrid(!snapToGrid);
        }
        break;
    }
  }, [selectedElements, isReadOnly, workflow.steps, snapToGrid, onStepSelect]);

  // Handle wheel events for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.1, Math.min(3, scale * scaleFactor));
      
      // Zoom towards mouse position
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const scaleChange = newScale / scale;
        setOffset(prev => ({
          x: mouseX - (mouseX - prev.x) * scaleChange,
          y: mouseY - (mouseY - prev.y) * scaleChange
        }));
      }
      
      setScale(newScale);
    }
  }, [scale]);

  // Handle element addition
  const handleAddElement = useCallback((type: WorkflowStep['type'], position?: { x: number; y: number }) => {
    if (isReadOnly) return;

    let elementPosition = position;
    
    if (!elementPosition) {
      // Place at center of visible area
      const centerX = (canvasSize.width / 2 - offset.x) / scale;
      const centerY = (canvasSize.height / 2 - offset.y) / scale;
      elementPosition = snapPosition({ x: centerX, y: centerY });
    }

    const newStep: WorkflowStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: getDefaultStepName(type),
      type,
      position: elementPosition
    };

    const updatedWorkflow = {
      ...workflow,
      steps: [...workflow.steps, newStep]
    };

    onWorkflowChange(updatedWorkflow);
    
    // Auto-select the new element
    setSelectedElements([newStep.id]);
    onStepSelect?.(newStep.id);
  }, [workflow, onWorkflowChange, isReadOnly, canvasSize, offset, scale, snapPosition, onStepSelect]);

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
    onStepSelect?.(null);
  }, [workflow, onWorkflowChange, isReadOnly, onStepSelect]);

  // Handle connection creation
  const handleCreateConnection = useCallback((fromId: string, toId: string) => {
    if (isReadOnly || fromId === toId) return;

    // Check if connection already exists
    const existingConnection = workflow.transitions.find(
      t => t.from === fromId && t.to === toId
    );
    if (existingConnection) {
      console.log('Connection already exists');
      return;
    }

    const newTransition: WorkflowTransition = {
      id: `transition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from: fromId,
      to: toId
    };

    const updatedWorkflow = {
      ...workflow,
      transitions: [...workflow.transitions, newTransition]
    };

    console.log('Creating connection:', newTransition);
    onWorkflowChange(updatedWorkflow);
    setConnectionState({ active: false, fromStepId: null });
  }, [workflow, onWorkflowChange, isReadOnly]);

  // Handle connection mode
  const handleStartConnection = useCallback((stepId: string) => {
    if (isReadOnly) return;
    console.log('Starting connection from:', stepId);
    setConnectionState({ active: true, fromStepId: stepId });
  }, [isReadOnly]);

  const handleEndConnection = useCallback((stepId: string) => {
    if (connectionState.active && connectionState.fromStepId) {
      console.log('Ending connection at:', stepId);
      handleCreateConnection(connectionState.fromStepId, stepId);
    }
  }, [connectionState, handleCreateConnection]);

  return (
    <div className="relative w-full h-full bg-gray-50 overflow-hidden select-none" style={{ minHeight: '500px' }}>
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
          snapToGrid={snapToGrid}
          onToggleSnap={() => setSnapToGrid(!snapToGrid)}
        />
      )}

      {/* Mini Map */}
      {workflow.steps.length > 3 && (
        <CanvasMiniMap
          workflow={workflow}
          canvasSize={canvasSize}
          scale={scale}
          offset={offset}
          onOffsetChange={setOffset}
        />
      )}

      {/* Empty State */}
      {workflow.steps.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400\" fill="none\" stroke="currentColor\" viewBox="0 0 24 24">
                <path strokeLinecap="round\" strokeLinejoin="round\" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Workflow</h3>
            <p className="text-gray-500 mb-4">Use the "Add Element" button in the toolbar to add your first step</p>
            {!isReadOnly && (
              <div className="pointer-events-auto">
                <button
                  onClick={() => handleAddElement('start')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
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
        className={`w-full h-full focus:outline-none ${
          dragState.dragType === 'canvas' ? 'cursor-grabbing' : 
          connectionState.active ? 'cursor-crosshair' : 'cursor-grab'
        }`}
        tabIndex={0}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
        style={{
          backgroundImage: snapToGrid ? `
            radial-gradient(circle, #e5e7eb 1px, transparent 1px)
          ` : 'none',
          backgroundSize: snapToGrid ? `${gridSize * scale}px ${gridSize * scale}px` : 'auto',
          backgroundPosition: snapToGrid ? `${offset.x}px ${offset.y}px` : '0 0'
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
            {/* Existing connections */}
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
            
            {/* Connection preview line */}
            {connectionState.active && connectionState.previewLine && (
              <line
                x1={connectionState.previewLine.from.x}
                y1={connectionState.previewLine.from.y}
                x2={connectionState.previewLine.to.x}
                y2={connectionState.previewLine.to.y}
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="5,5"
                className="pointer-events-none"
              />
            )}
          </svg>

          {/* Render Elements */}
          {workflow.steps.map(step => (
            <CanvasElement
              key={step.id}
              step={step}
              isSelected={selectedElements.includes(step.id) || selectedStepId === step.id}
              isHovered={hoveredElement === step.id}
              onSelect={() => {
                setSelectedElements([step.id]);
                onStepSelect?.(step.id);
              }}
              onHover={(stepId) => setHoveredElement(stepId)}
              onStartConnection={handleStartConnection}
              onEndConnection={handleEndConnection}
              connectionMode={connectionState}
              isReadOnly={isReadOnly}
              isDragging={dragState.isDragging && dragState.elementId === step.id}
            />
          ))}
        </div>
      </div>

      {/* Connection Mode Overlay */}
      {connectionState.active && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          Click on another element to create a connection
          <button
            onClick={() => setConnectionState({ active: false, fromStepId: null })}
            className="ml-2 text-blue-200 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Status Bar */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 flex items-center gap-4">
        <span>{workflow.steps.length} elements</span>
        <span>{workflow.transitions.length} connections</span>
        <span>Zoom: {Math.round(scale * 100)}%</span>
        {snapToGrid && <span className="text-blue-600">Grid: ON</span>}
        {selectedElements.length > 0 && (
          <span className="text-blue-600">{selectedElements.length} selected</span>
        )}
        {connectionState.active && (
          <span className="text-blue-600 animate-pulse">Connection Mode</span>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 text-xs text-gray-600">
        <div className="font-medium mb-2">Shortcuts:</div>
        <div className="space-y-1">
          <div><kbd className="bg-gray-100 px-1 rounded">Del</kbd> Delete selected</div>
          <div><kbd className="bg-gray-100 px-1 rounded">Ctrl+A</kbd> Select all</div>
          <div><kbd className="bg-gray-100 px-1 rounded">Ctrl+G</kbd> Toggle grid</div>
          <div><kbd className="bg-gray-100 px-1 rounded">Ctrl+Wheel</kbd> Zoom</div>
          <div><kbd className="bg-gray-100 px-1 rounded">Esc</kbd> Cancel connection</div>
        </div>
      </div>
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